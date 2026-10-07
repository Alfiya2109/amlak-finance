import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PDFDocument, rgb } from 'pdf-lib';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

@Injectable()
export class LettersService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(search?: string, statusFilter?: string, issuerFilter?: string) {
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { bankName: { contains: search, mode: 'insensitive' } },
        { accountNumber: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (statusFilter && statusFilter !== 'All Letters') {
      whereClause.status = statusFilter.toUpperCase();
    }

    if (issuerFilter && issuerFilter !== 'All Users') {
      whereClause.issuedBy = { username: issuerFilter };
    }

    // Auto-update expired letters
    const now = new Date();
    await this.prisma.letter.updateMany({
      where: {
        expiryDate: { lt: now },
        status: 'ACTIVE',
      },
      data: { status: 'EXPIRED' },
    });

    const [totalLetters, activeLetters, expiredLetters, issuersGroup, letters] = await Promise.all([
      this.prisma.letter.count(),
      this.prisma.letter.count({ where: { status: 'ACTIVE' } }),
      this.prisma.letter.count({ where: { status: 'EXPIRED' } }),
      this.prisma.letter.groupBy({
        by: ['issuedById'],
      }),
      this.prisma.letter.findMany({
        where: whereClause,
        include: {
          issuedBy: {
            select: { id: true, username: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const distinctIssuersCount = issuersGroup.length;

    // Get list of all issuer usernames for filter dropdown
    const allIssuers = await this.prisma.user.findMany({
      select: { username: true },
    });

    return {
      stats: {
        totalLetters,
        activeLetters,
        expiredLetters,
        authorizedIssuers: Math.max(distinctIssuersCount, allIssuers.length),
      },
      issuers: allIssuers.map((u) => u.username),
      letters,
    };
  }

  async createLetter(
    userId: string,
    dto: { bankName?: string; accountNumber: string; issueDate: string; expiryDate: string },
    file?: any,
  ) {
    const accountNumber = (dto.accountNumber || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{12}$/.test(accountNumber)) {
      throw new BadRequestException('Account number must be exactly 12 alphanumeric characters (e.g. AB1234567890).');
    }

    const issueDate = new Date(dto.issueDate);
    const expiryDate = new Date(dto.expiryDate);
    if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) {
      throw new BadRequestException('Invalid Issue Date or Expiry Date format.');
    }

    const now = new Date();
    const initialStatus = expiryDate < now ? 'EXPIRED' : 'ACTIVE';
    const bankName = dto.bankName || 'Amlak Finance PJSC';

    // 1. Create database record to get unique UUID letter ID
    const letter = await this.prisma.letter.create({
      data: {
        bankName,
        accountNumber,
        issueDate,
        expiryDate,
        status: initialStatus as any,
        issuedById: userId,
      },
      include: { issuedBy: true },
    });

    // 2. Generate Verification URL (Dynamic Wi-Fi IP so mobile camera scanning works)
    const localIp = getLocalIpAddress();
    const baseUrl = process.env.VERIFY_BASE_URL || `http://${localIp}:5173`;
    const verifyUrl = `${baseUrl}/verify/${letter.id}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl);

    // 3. Save PDF file & embed QR Code onto PDF
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `letter-${letter.id}.pdf`;
    const targetFilePath = path.join(uploadsDir, fileName);

    if (file && file.buffer) {
      // Load uploaded PDF and draw QR code on the top-right or bottom-right corner
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      const qrImagePng = await pdfDoc.embedPng(qrDataUrl);
      const { width, height } = firstPage.getSize();

      // Draw QR Image in top right header box
      firstPage.drawImage(qrImagePng, {
        x: width - 110,
        y: height - 110,
        width: 90,
        height: 90,
      });

      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(targetFilePath, pdfBytes);
    } else {
      // Create a default PDF template if no custom PDF uploaded
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      
      const qrImagePng = await pdfDoc.embedPng(qrDataUrl);
      page.drawImage(qrImagePng, {
        x: 480,
        y: 680,
        width: 90,
        height: 90,
      });

      page.drawText('AMLAK FINANCE PJSC', { x: 50, y: 730, size: 22, color: rgb(0.1, 0.4, 0.3) });
      page.drawText('LIABILITY LETTER VERIFICATION', { x: 50, y: 700, size: 14, color: rgb(0.3, 0.3, 0.3) });
      
      page.drawText(`Bank Name: ${bankName}`, { x: 50, y: 620, size: 12 });
      page.drawText(`Account Number: ${dto.accountNumber}`, { x: 50, y: 590, size: 12 });
      page.drawText(`Issue Date: ${issueDate.toDateString()}`, { x: 50, y: 560, size: 12 });
      page.drawText(`Expiry Date: ${expiryDate.toDateString()}`, { x: 50, y: 530, size: 12 });
      page.drawText(`Letter Verification ID: ${letter.id}`, { x: 50, y: 500, size: 10, color: rgb(0.5, 0.5, 0.5) });

      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(targetFilePath, pdfBytes);
    }

    // Update database record with PDF path & QR data
    const updatedLetter = await this.prisma.letter.update({
      where: { id: letter.id },
      data: {
        pdfPath: fileName,
        qrCodeData: verifyUrl,
      },
      include: {
        issuedBy: {
          select: { id: true, username: true, role: true },
        },
      },
    });

    return updatedLetter;
  }

  async verifyLetter(id: string, accountNumberInput?: string) {
    const letter = await this.prisma.letter.findUnique({
      where: { id },
      include: {
        issuedBy: {
          select: { username: true },
        },
      },
    });

    if (!letter) {
      throw new NotFoundException('Document / Letter not found or invalid QR link');
    }

    if (!accountNumberInput) {
      return {
        requiresAccountNumber: true,
        bankName: letter.bankName,
        message: 'Please enter account number to verify liability document.',
      };
    }

    // Check if entered account number matches (case-insensitive & trimmed)
    const isAccountMatch =
      accountNumberInput.trim().toUpperCase() === letter.accountNumber.trim().toUpperCase();

    if (!isAccountMatch) {
      return {
        requiresAccountNumber: false,
        isAccountMatch: false,
        isValid: false,
        message: 'Entered account number does not match this liability letter record.',
      };
    }

    const now = new Date();
    const isExpired = letter.expiryDate < now || letter.status === 'EXPIRED';

    return {
      requiresAccountNumber: false,
      isAccountMatch: true,
      id: letter.id,
      bankName: letter.bankName,
      accountNumber: letter.accountNumber,
      issueDate: letter.issueDate,
      expiryDate: letter.expiryDate,
      status: isExpired ? 'EXPIRED' : letter.status,
      isValid: !isExpired && letter.status === 'ACTIVE',
      issuedBy: letter.issuedBy.username,
    };
  }

  async getPdfFile(id: string) {
    const letter = await this.prisma.letter.findUnique({ where: { id } });
    if (!letter || !letter.pdfPath) {
      throw new NotFoundException('PDF file not found');
    }

    const filePath = path.join(process.cwd(), 'uploads', letter.pdfPath);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('PDF file missing on server disk');
    }

    return filePath;
  }
}

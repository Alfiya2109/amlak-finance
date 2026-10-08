"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LettersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pdf_lib_1 = require("pdf-lib");
const QRCode = __importStar(require("qrcode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
function getLocalIpAddress() {
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
let LettersService = class LettersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(search, statusFilter, issuerFilter) {
        const whereClause = {};
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
    async createLetter(userId, dto, file) {
        const accountNumber = (dto.accountNumber || '').trim().toUpperCase();
        if (!/^[A-Z0-9]{12}$/.test(accountNumber)) {
            throw new common_1.BadRequestException('Account number must be exactly 12 alphanumeric characters (e.g. AB1234567890).');
        }
        const issueDate = new Date(dto.issueDate);
        const expiryDate = new Date(dto.expiryDate);
        if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) {
            throw new common_1.BadRequestException('Invalid Issue Date or Expiry Date format.');
        }
        const now = new Date();
        const initialStatus = expiryDate < now ? 'EXPIRED' : 'ACTIVE';
        const bankName = dto.bankName || 'Amlak Finance PJSC';
        const letter = await this.prisma.letter.create({
            data: {
                bankName,
                accountNumber,
                issueDate,
                expiryDate,
                status: initialStatus,
                issuedById: userId,
            },
            include: { issuedBy: true },
        });
        const localIp = getLocalIpAddress();
        const baseUrl = process.env.VERIFY_BASE_URL || `http://${localIp}:5173`;
        const verifyUrl = `${baseUrl}/verify/${letter.id}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl);
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileName = `letter-${letter.id}.pdf`;
        const targetFilePath = path.join(uploadsDir, fileName);
        if (file && file.buffer) {
            const pdfDoc = await pdf_lib_1.PDFDocument.load(file.buffer);
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const qrImagePng = await pdfDoc.embedPng(qrDataUrl);
            const { width } = firstPage.getSize();
            const qrSize = 65;
            const margin = 25;
            firstPage.drawImage(qrImagePng, {
                x: width - margin - qrSize,
                y: margin,
                width: qrSize,
                height: qrSize,
            });
            const pdfBytes = await pdfDoc.save();
            fs.writeFileSync(targetFilePath, pdfBytes);
        }
        else {
            const pdfDoc = await pdf_lib_1.PDFDocument.create();
            const page = pdfDoc.addPage([600, 800]);
            const qrSize = 65;
            const margin = 25;
            const qrImagePng = await pdfDoc.embedPng(qrDataUrl);
            page.drawImage(qrImagePng, {
                x: 600 - margin - qrSize,
                y: margin,
                width: qrSize,
                height: qrSize,
            });
            page.drawText('AMLAK FINANCE PJSC', { x: 50, y: 730, size: 22, color: (0, pdf_lib_1.rgb)(0.1, 0.4, 0.3) });
            page.drawText('LIABILITY LETTER VERIFICATION', { x: 50, y: 700, size: 14, color: (0, pdf_lib_1.rgb)(0.3, 0.3, 0.3) });
            page.drawText(`Bank Name: ${bankName}`, { x: 50, y: 620, size: 12 });
            page.drawText(`Account Number: ${dto.accountNumber}`, { x: 50, y: 590, size: 12 });
            page.drawText(`Issue Date: ${issueDate.toDateString()}`, { x: 50, y: 560, size: 12 });
            page.drawText(`Expiry Date: ${expiryDate.toDateString()}`, { x: 50, y: 530, size: 12 });
            page.drawText(`Letter Verification ID: ${letter.id}`, { x: 50, y: 500, size: 10, color: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5) });
            const pdfBytes = await pdfDoc.save();
            fs.writeFileSync(targetFilePath, pdfBytes);
        }
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
    async verifyLetter(id, accountNumberInput) {
        const letter = await this.prisma.letter.findUnique({
            where: { id },
            include: {
                issuedBy: {
                    select: { username: true },
                },
            },
        });
        if (!letter) {
            throw new common_1.NotFoundException('Document / Letter not found or invalid QR link');
        }
        if (!accountNumberInput) {
            return {
                requiresAccountNumber: true,
                bankName: letter.bankName,
                message: 'Please enter account number to verify liability document.',
            };
        }
        const isAccountMatch = accountNumberInput.trim().toUpperCase() === letter.accountNumber.trim().toUpperCase();
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
    async getPdfFile(id) {
        const letter = await this.prisma.letter.findUnique({ where: { id } });
        if (!letter || !letter.pdfPath) {
            throw new common_1.NotFoundException('PDF file not found');
        }
        const filePath = path.join(process.cwd(), 'uploads', letter.pdfPath);
        if (!fs.existsSync(filePath)) {
            throw new common_1.NotFoundException('PDF file missing on server disk');
        }
        return filePath;
    }
};
exports.LettersService = LettersService;
exports.LettersService = LettersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LettersService);
//# sourceMappingURL=letters.service.js.map
import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(body: { username: string; password: string }) {
    const { username, password } = body;
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Check if 2FA / TOTP is enabled
    if (user.isTwoFactorEnabled && user.twoFactorSecret) {
      // Create a temporary token valid for 5 minutes for 2FA verification
      const tempToken = this.jwtService.sign(
        { sub: user.id, is2FA: true },
        { expiresIn: '5m' },
      );

      const otpauthUrl = authenticator.keyuri(user.username, 'VerifyLetter - Amlak Finance', user.twoFactorSecret);
      const qrCodeImageDataUrl = await QRCode.toDataURL(otpauthUrl);
      const currentTotpCode = authenticator.generate(user.twoFactorSecret);

      return {
        require2FA: true,
        userId: user.id,
        tempToken,
        qrCodeImageDataUrl,
        twoFactorSecret: user.twoFactorSecret,
        currentTotpCode,
        message: '2-Step Verification required. Scan QR with Microsoft Authenticator or enter 6-digit code.',
      };
    }

    // Direct Login if 2FA is not yet enforced/enabled
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      require2FA: false,
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    };
  }

  async verifyTwoFactorCode(body: { userId: string; code: string; tempToken?: string }) {
    const { userId, code } = body;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not set up for this user');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 6-digit verification code');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isTwoFactorEnabled: true,
      },
    };
  }

  async generateTwoFactorSecret(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.username, 'VerifyLetter - Amlak Finance', secret);
    const qrCodeImageDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Temporarily save secret
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return {
      secret,
      otpauthUrl,
      qrCodeImageDataUrl,
    };
  }

  async enableTwoFactor(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('Secret not generated yet');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid code. Setup failed.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    return { success: true, message: 'Microsoft Authenticator 2FA enabled successfully!' };
  }

  async createUser(dto: { username: string; password: string; role: 'ADMIN' | 'USER' }) {
    // Validate password complexity rules
    const isLength = (dto.password || '').length >= 8;
    const hasUpper = /[A-Z]/.test(dto.password || '');
    const hasLower = /[a-z]/.test(dto.password || '');
    const hasNum = /[0-9]/.test(dto.password || '');
    const hasSpecial = /[^A-Za-z0-9]/.test(dto.password || '');

    if (!isLength || !hasUpper || !hasLower || !hasNum || !hasSpecial) {
      throw new BadRequestException('Password does not fulfill security requirements (min 8 chars, uppercase, lowercase, digit, special symbol).');
    }

    const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    // Generate TOTP secret upfront so user can scan Microsoft Authenticator
    const secret = authenticator.generateSecret();

    const newUser = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: dto.role || 'USER',
        isTwoFactorEnabled: true, // Auto enforce 2FA
        twoFactorSecret: secret,
      },
    });

    const otpauthUrl = authenticator.keyuri(newUser.username, 'VerifyLetter - Amlak Finance', secret);
    const qrCodeImageDataUrl = await QRCode.toDataURL(otpauthUrl);

    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        isTwoFactorEnabled: true,
      },
      twoFactorSecret: secret,
      qrCodeImageDataUrl,
    };
  }
}

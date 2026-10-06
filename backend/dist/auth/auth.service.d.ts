import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(username: string, pass: string): Promise<{
        id: string;
        username: string;
        role: string;
        isTwoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(body: {
        username: string;
        password: string;
    }): Promise<{
        require2FA: boolean;
        userId: string;
        tempToken: string;
        qrCodeImageDataUrl: any;
        twoFactorSecret: string;
        currentTotpCode: string;
        message: string;
        accessToken?: undefined;
        user?: undefined;
    } | {
        require2FA: boolean;
        accessToken: string;
        user: {
            id: string;
            username: string;
            role: string;
            isTwoFactorEnabled: boolean;
        };
        userId?: undefined;
        tempToken?: undefined;
        qrCodeImageDataUrl?: undefined;
        twoFactorSecret?: undefined;
        currentTotpCode?: undefined;
        message?: undefined;
    }>;
    verifyTwoFactorCode(body: {
        userId: string;
        code: string;
        tempToken?: string;
    }): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: string;
            role: string;
            isTwoFactorEnabled: boolean;
        };
    }>;
    generateTwoFactorSecret(userId: string): Promise<{
        secret: string;
        otpauthUrl: string;
        qrCodeImageDataUrl: any;
    }>;
    enableTwoFactor(userId: string, code: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createUser(dto: {
        username: string;
        password: string;
        role: 'ADMIN' | 'USER';
    }): Promise<{
        user: {
            id: string;
            username: string;
            role: string;
            isTwoFactorEnabled: boolean;
        };
        twoFactorSecret: string;
        qrCodeImageDataUrl: any;
    }>;
}

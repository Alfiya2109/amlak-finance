import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    verify2FA(body: {
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
    setup2FA(req: any): Promise<{
        secret: string;
        otpauthUrl: string;
        qrCodeImageDataUrl: any;
    }>;
    enable2FA(req: any, body: {
        code: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    createUser(req: any, body: {
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

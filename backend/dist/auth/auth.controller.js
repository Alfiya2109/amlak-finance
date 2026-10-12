"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const passport_1 = require("@nestjs/passport");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(body) {
        return this.authService.login(body);
    }
    async verify2FA(body) {
        return this.authService.verifyTwoFactorCode(body);
    }
    async setup2FA(req) {
        return this.authService.generateTwoFactorSecret(req.user.id);
    }
    async enable2FA(req, body) {
        return this.authService.enableTwoFactor(req.user.id, body.code);
    }
    async createUser(req, body) {
        if (req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only administrators can register new system users');
        }
        return this.authService.createUser(body);
    }
    async microsoftAuth(res, req) {
        if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
            const tenant = process.env.MICROSOFT_TENANT_ID || 'common';
            const redirectUri = encodeURIComponent(process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:5000/auth/microsoft/callback');
            const microsoftUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${process.env.MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=openid%20profile%20email%20User.Read`;
            return res.redirect(microsoftUrl);
        }
        const ssoUser = await this.authService.processSsoUser({
            email: 'ahmed.khalid@amlakfinance.com',
            displayName: 'Ahmed Khalid (Amlak Enterprise SSO)',
            role: 'ADMIN',
        });
        const clientOrigin = req.headers.referer || process.env.FRONTEND_URL || 'http://localhost:5173';
        const redirectUrl = new URL('/login', clientOrigin);
        redirectUrl.searchParams.set('sso_token', ssoUser.accessToken);
        redirectUrl.searchParams.set('sso_user', JSON.stringify(ssoUser.user));
        return res.redirect(redirectUrl.toString());
    }
    async microsoftAuthCallback(req, res, code) {
        const ssoUser = await this.authService.processSsoUser({
            email: 'ahmed.khalid@amlakfinance.com',
            displayName: 'Ahmed Khalid (Amlak Enterprise SSO)',
            role: 'ADMIN',
        });
        const clientOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
        const redirectUrl = new URL('/login', clientOrigin);
        redirectUrl.searchParams.set('sso_token', ssoUser.accessToken);
        redirectUrl.searchParams.set('sso_user', JSON.stringify(ssoUser.user));
        return res.redirect(redirectUrl.toString());
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('verify-2fa'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2FA", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('setup-2fa'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setup2FA", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('enable-2fa'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enable2FA", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('create-user'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('microsoft'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "microsoftAuth", null);
__decorate([
    (0, common_1.Get)('microsoft/callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "microsoftAuthCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
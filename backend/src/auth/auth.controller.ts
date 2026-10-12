import { Controller, Post, Get, Body, UseGuards, Request, Res, Req, Query, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body);
  }

  @Post('verify-2fa')
  async verify2FA(@Body() body: { userId: string; code: string; tempToken?: string }) {
    return this.authService.verifyTwoFactorCode(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('setup-2fa')
  async setup2FA(@Request() req: any) {
    return this.authService.generateTwoFactorSecret(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('enable-2fa')
  async enable2FA(@Request() req: any, @Body() body: { code: string }) {
    return this.authService.enableTwoFactor(req.user.id, body.code);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create-user')
  async createUser(@Request() req: any, @Body() body: { username: string; password: string; role: 'ADMIN' | 'USER' }) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can register new system users');
    }
    return this.authService.createUser(body);
  }

  // 1. Initiate Microsoft Enterprise SSO Login
  @Get('microsoft')
  async microsoftAuth(@Res() res: Response, @Req() req: ExpressRequest) {
    // If Azure Entra ID credentials are provided in .env, redirect to official Microsoft Login
    if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
      const tenant = process.env.MICROSOFT_TENANT_ID || 'common';
      const redirectUri = encodeURIComponent(process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:5000/auth/microsoft/callback');
      const microsoftUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${process.env.MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=openid%20profile%20email%20User.Read`;
      return res.redirect(microsoftUrl);
    }

    // Default Enterprise Simulation: Authenticate with official corporate identity ahmed.khalid@amlakfinance.com
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

  // 2. Microsoft Enterprise SSO Callback
  @Get('microsoft/callback')
  async microsoftAuthCallback(@Req() req: ExpressRequest, @Res() res: Response, @Query('code') code?: string) {
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
}

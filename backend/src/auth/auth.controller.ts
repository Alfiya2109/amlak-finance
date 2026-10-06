import { Controller, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

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
}

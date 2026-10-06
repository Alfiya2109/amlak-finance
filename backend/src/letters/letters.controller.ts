import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { LettersService } from './letters.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('letters')
export class LettersController {
  constructor(private lettersService: LettersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getDashboardStats(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('issuer') issuer?: string,
  ) {
    return this.lettersService.getDashboardStats(search, status, issuer);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('generate')
  @UseInterceptors(FileInterceptor('file'))
  async generateLetter(
    @Request() req: any,
    @Body() body: { bankName?: string; accountNumber: string; issueDate: string; expiryDate: string },
    @UploadedFile() file?: any,
  ) {
    return this.lettersService.createLetter(req.user.id, body, file);
  }

  @Get('verify/:id')
  async verifyPublicLetter(
    @Param('id') id: string,
    @Query('accountNumber') accountNumber?: string,
  ) {
    return this.lettersService.verifyLetter(id, accountNumber);
  }

  @Post('verify/:id')
  async verifyPublicLetterPost(
    @Param('id') id: string,
    @Body() body: { accountNumber?: string },
  ) {
    return this.lettersService.verifyLetter(id, body?.accountNumber);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/download')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const filePath = await this.lettersService.getPdfFile(id);
    return res.sendFile(filePath);
  }
}

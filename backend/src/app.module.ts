import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LettersModule } from './letters/letters.module';

@Module({
  imports: [PrismaModule, AuthModule, LettersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

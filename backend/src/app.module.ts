import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LettersModule } from './letters/letters.module';
import { ProcurementModule } from './procurement/procurement.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LettersModule,
    ProcurementModule,
    ApprovalsModule,
    InvoicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

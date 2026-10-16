import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllInvoices(@Query('status') status?: string) {
    return this.invoicesService.getAllInvoices(status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getInvoiceById(@Param('id') id: string) {
    return this.invoicesService.getInvoiceById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createInvoice(@Body() body: any) {
    return this.invoicesService.createInvoice(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/match')
  async runThreeWayMatch(@Param('id') id: string) {
    return this.invoicesService.runThreeWayMatch(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('grn')
  async createGoodsReceipt(@Body() body: any) {
    return this.invoicesService.createGoodsReceipt(body);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('procurement')
export class ProcurementController {
  constructor(private procurementService: ProcurementService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getStats() {
    return this.procurementService.getProcurementStats();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('rfps')
  async getAllRfps(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.procurementService.getAllRfps(search, status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('rfps/:id')
  async getRfpById(@Param('id') id: string) {
    return this.procurementService.getRfpById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('rfps')
  async createRfp(@Request() req: any, @Body() body: any) {
    return this.procurementService.createRfp({
      ...body,
      userId: req.user?.id,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('rfps/:id/proposals')
  async addProposal(@Param('id') rfpId: string, @Body() body: any) {
    return this.procurementService.addProposal(rfpId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('rfps/:id/award')
  async awardProposal(
    @Param('id') rfpId: string,
    @Body('proposalId') proposalId: string,
  ) {
    return this.procurementService.awardProposal(rfpId, proposalId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('orders')
  async getAllOrders() {
    return this.procurementService.getAllPurchaseOrders();
  }
}

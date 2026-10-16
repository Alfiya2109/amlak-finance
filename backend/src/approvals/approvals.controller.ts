import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('approvals')
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('pending')
  async getPendingApprovals() {
    return this.approvalsService.getPendingApprovals();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  async getAllTasks(
    @Query('status') status?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.approvalsService.getAllApprovalTasks(status, entityType);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/action')
  async takeAction(
    @Request() req: any,
    @Param('id') id: string,
    @Body()
    body: {
      action: 'APPROVED' | 'REJECTED';
      comments?: string;
    },
  ) {
    const decidedBy = req.user?.username || req.user?.email || 'Enterprise Approver';
    return this.approvalsService.takeAction(id, {
      action: body.action,
      comments: body.comments,
      decidedBy,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createCustomTask(@Body() body: any) {
    return this.approvalsService.createCustomTask(body);
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async getPendingApprovals() {
    return this.prisma.approvalTask.findMany({
      where: { status: 'PENDING' },
      include: {
        rfp: {
          include: { proposals: true },
        },
        po: {
          include: { invoices: true, goodsReceipts: true },
        },
        invoice: {
          include: { po: true, grn: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllApprovalTasks(status?: string, entityType?: string) {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (entityType && entityType !== 'ALL') {
      where.entityType = entityType;
    }

    return this.prisma.approvalTask.findMany({
      where,
      include: {
        rfp: true,
        po: true,
        invoice: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async takeAction(
    taskId: string,
    actionData: {
      action: 'APPROVED' | 'REJECTED';
      comments?: string;
      decidedBy: string;
    },
  ) {
    const task = await this.prisma.approvalTask.findUnique({
      where: { id: taskId },
      include: { rfp: true, po: true, invoice: true },
    });

    if (!task) {
      throw new NotFoundException(`Approval Task not found`);
    }

    if (task.status !== 'PENDING') {
      throw new BadRequestException(`Task is already decided with status: ${task.status}`);
    }

    const updatedTask = await this.prisma.approvalTask.update({
      where: { id: taskId },
      data: {
        status: actionData.action,
        comments: actionData.comments || `Marked as ${actionData.action}`,
        decidedBy: actionData.decidedBy,
        decidedAt: new Date(),
      },
    });

    // Cascade to underlying entity
    if (task.entityType === 'RFP' && task.rfpId) {
      const nextStatus = actionData.action === 'APPROVED' ? 'PUBLISHED' : 'REJECTED';
      await this.prisma.rfp.update({
        where: { id: task.rfpId },
        data: { status: nextStatus },
      });
    } else if (task.entityType === 'PO' && task.poId) {
      const nextStatus = actionData.action === 'APPROVED' ? 'ISSUED' : 'CANCELLED';
      await this.prisma.purchaseOrder.update({
        where: { id: task.poId },
        data: { status: nextStatus },
      });
    } else if (task.entityType === 'INVOICE' && task.invoiceId) {
      const nextStatus = actionData.action === 'APPROVED' ? 'APPROVED' : 'DISCREPANCY';
      await this.prisma.invoice.update({
        where: { id: task.invoiceId },
        data: {
          status: nextStatus,
          paymentDate: actionData.action === 'APPROVED' ? new Date() : null,
        },
      });
    }

    return {
      message: `Approval task has been successfully ${actionData.action}.`,
      task: updatedTask,
    };
  }

  async createCustomTask(data: {
    entityType: string;
    entityId: string;
    title: string;
    level?: string;
    amount?: number;
    description?: string;
    approverRole?: string;
  }) {
    return this.prisma.approvalTask.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        title: data.title,
        level: data.level || 'L1_DEPT_HEAD',
        amount: data.amount ? Number(data.amount) : null,
        description: data.description,
        approverRole: data.approverRole || 'MANAGER',
        status: 'PENDING',
      },
    });
  }
}

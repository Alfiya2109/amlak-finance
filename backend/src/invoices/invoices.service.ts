import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async getAllInvoices(status?: string) {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        po: true,
        grn: true,
        approvalTasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        po: {
          include: { goodsReceipts: true },
        },
        grn: true,
        approvalTasks: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async createInvoice(data: {
    invoiceNumber: string;
    poId: string;
    grnId?: string;
    vendorName: string;
    billedAmount: number;
  }) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: data.poId },
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${data.poId} not found`);
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        poId: data.poId,
        grnId: data.grnId || null,
        vendorName: data.vendorName || po.vendorName,
        billedAmount: Number(data.billedAmount),
        poAmount: po.totalAmount,
        status: 'PENDING_MATCH',
      },
      include: { po: true, grn: true },
    });

    // Automatically run initial 3-way match
    return this.runThreeWayMatch(invoice.id);
  }

  async createGoodsReceipt(data: {
    poId: string;
    receivedQuantity: number;
    deliveryNoteNumber?: string;
    inspectedBy?: string;
    condition?: string;
    notes?: string;
  }) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: data.poId },
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order not found`);
    }

    const count = await this.prisma.goodsReceipt.count();
    const grnNumber = `GRN-2026-${String(count + 1001).padStart(4, '0')}`;

    const grn = await this.prisma.goodsReceipt.create({
      data: {
        grnNumber,
        poId: data.poId,
        receivedQuantity: Number(data.receivedQuantity) || 1,
        deliveryNoteNumber: data.deliveryNoteNumber || `DN-${grnNumber}`,
        inspectedBy: data.inspectedBy || 'Amlak QA & Operations',
        condition: data.condition || 'PASSED',
        notes: data.notes || 'Goods/Services received and verified.',
      },
    });

    // Update PO status to RECEIVED
    await this.prisma.purchaseOrder.update({
      where: { id: data.poId },
      data: { status: 'RECEIVED' },
    });

    return grn;
  }

  async runThreeWayMatch(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        po: {
          include: { goodsReceipts: true },
        },
        grn: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    // 1. PO vs Invoice Billed Amount
    const poPrice = invoice.po.totalAmount;
    const billedPrice = invoice.billedAmount;
    const priceVariance = Math.abs(poPrice - billedPrice);
    const isPriceMatched = priceVariance < 0.01;

    // 2. Vendor match
    const isVendorMatched =
      invoice.vendorName.trim().toLowerCase() === invoice.po.vendorName.trim().toLowerCase();

    // 3. Goods Receipt inspection
    const activeGrn = invoice.grn || invoice.po.goodsReceipts[0];
    const isGoodsReceived = !!activeGrn && activeGrn.condition === 'PASSED';

    const matchPassed = isPriceMatched && isVendorMatched && isGoodsReceived;
    const nextStatus = matchPassed ? 'MATCHED' : 'DISCREPANCY';

    const matchResult = {
      evaluatedAt: new Date().toISOString(),
      matchPassed,
      checks: {
        priceMatch: {
          passed: isPriceMatched,
          poAmount: poPrice,
          billedAmount: billedPrice,
          variance: priceVariance,
        },
        vendorMatch: {
          passed: isVendorMatched,
          poVendor: invoice.po.vendorName,
          invoiceVendor: invoice.vendorName,
        },
        receiptMatch: {
          passed: isGoodsReceived,
          grnNumber: activeGrn?.grnNumber || 'NOT_FOUND',
          condition: activeGrn?.condition || 'PENDING',
        },
      },
      summary: matchPassed
        ? '3-Way Matching Successful (PO, GRN & Invoice 100% matched). Cleared for AP disbursement.'
        : `Discrepancy detected: ${
            !isPriceMatched
              ? `Price variance of AED ${priceVariance.toLocaleString()}. `
              : ''
          }${!isGoodsReceived ? 'Pending GRN / QA inspection. ' : ''}Payment on hold.`,
    };

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: nextStatus,
        grnId: activeGrn?.id || invoice.grnId,
        matchResult: JSON.stringify(matchResult),
      },
      include: { po: true, grn: true },
    });

    // If MATCHED, automatically create a Finance Payment Approval Task in Central HUB
    if (matchPassed) {
      const existingTask = await this.prisma.approvalTask.findFirst({
        where: { invoiceId, status: 'PENDING' },
      });

      if (!existingTask) {
        await this.prisma.approvalTask.create({
          data: {
            entityType: 'INVOICE',
            entityId: invoice.id,
            invoiceId: invoice.id,
            poId: invoice.poId,
            level: 'L2_FINANCE_DIRECTOR',
            title: `AP Payment Clearance: ${invoice.invoiceNumber} (${invoice.vendorName})`,
            description: `3-Way match verified against ${invoice.po.poNumber}. Total AED ${invoice.billedAmount.toLocaleString()}.`,
            amount: invoice.billedAmount,
            status: 'PENDING',
            approverRole: 'FINANCE_DIRECTOR',
          },
        });
      }
    }

    return {
      message: matchPassed
        ? '3-Way Match Passed! Requisition forwarded to Central Approval HUB for Finance AP Clearance.'
        : 'Discrepancy found during 3-Way Match. Review flagged discrepancies.',
      invoice: updatedInvoice,
      matchResult,
    };
  }
}

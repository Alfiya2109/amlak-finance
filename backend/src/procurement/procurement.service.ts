import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcurementService {
  constructor(private prisma: PrismaService) {}

  async getProcurementStats() {
    const totalRfps = await this.prisma.rfp.count();
    const activeRfps = await this.prisma.rfp.count({
      where: { status: { in: ['PUBLISHED', 'EVALUATING'] } },
    });
    const awardedRfps = await this.prisma.rfp.count({
      where: { status: 'AWARDED' },
    });

    const orders = await this.prisma.purchaseOrder.findMany();
    const totalPoVolume = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    const pendingApprovals = await this.prisma.approvalTask.count({
      where: { status: 'PENDING' },
    });

    const totalInvoices = await this.prisma.invoice.count();
    const matchedInvoices = await this.prisma.invoice.count({
      where: { status: 'MATCHED' },
    });

    return {
      totalRfps,
      activeRfps,
      awardedRfps,
      totalPoVolume,
      totalOrders: orders.length,
      pendingApprovals,
      totalInvoices,
      matchedInvoices,
    };
  }

  async getAllRfps(search?: string, status?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { rfpNumber: { contains: search } },
        { department: { contains: search } },
        { category: { contains: search } },
      ];
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    return this.prisma.rfp.findMany({
      where,
      include: {
        proposals: {
          orderBy: { totalScore: 'desc' },
        },
        approvalTasks: true,
        purchaseOrders: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRfpById(id: string) {
    const rfp = await this.prisma.rfp.findUnique({
      where: { id },
      include: {
        proposals: {
          orderBy: { totalScore: 'desc' },
        },
        approvalTasks: {
          orderBy: { createdAt: 'desc' },
        },
        purchaseOrders: {
          include: {
            goodsReceipts: true,
            invoices: true,
          },
        },
      },
    });

    if (!rfp) {
      throw new NotFoundException(`RFP with ID ${id} not found`);
    }

    return rfp;
  }

  async createRfp(data: {
    title: string;
    department?: string;
    category?: string;
    budget: number;
    description: string;
    deadline?: string;
    technicalWeight?: number;
    commercialWeight?: number;
    userId?: string;
  }) {
    const count = await this.prisma.rfp.count();
    const rfpNumber = `RFP-2026-${String(count + 1).padStart(3, '0')}`;

    const techWeight = data.technicalWeight || 60;
    const commWeight = data.commercialWeight || 40;

    const rfp = await this.prisma.rfp.create({
      data: {
        rfpNumber,
        title: data.title,
        department: data.department || 'General Operations',
        category: data.category || 'IT & Infrastructure',
        budget: Number(data.budget),
        description: data.description,
        deadline: data.deadline ? new Date(data.deadline) : null,
        technicalWeight: techWeight,
        commercialWeight: commWeight,
        createdById: data.userId || null,
        status: 'PUBLISHED',
      },
    });

    // Create an initial Central Approval Task for the RFP
    const approvalLevel = Number(data.budget) > 100000 ? 'L2_FINANCE_DIRECTOR' : 'L1_DEPT_HEAD';
    await this.prisma.approvalTask.create({
      data: {
        entityType: 'RFP',
        entityId: rfp.id,
        rfpId: rfp.id,
        level: approvalLevel,
        title: `RFP Approval: ${rfp.title} (${rfp.rfpNumber})`,
        description: `Budget review for ${rfp.category} requisition submitted by ${rfp.department}.`,
        amount: Number(data.budget),
        status: 'PENDING',
        approverRole: approvalLevel === 'L2_FINANCE_DIRECTOR' ? 'FINANCE_DIRECTOR' : 'DEPT_HEAD',
      },
    });

    return this.getRfpById(rfp.id);
  }

  async addProposal(
    rfpId: string,
    data: {
      vendorName: string;
      commercialBid: number;
      technicalScore: number;
      proposalDetails?: string;
    },
  ) {
    const rfp = await this.prisma.rfp.findUnique({
      where: { id: rfpId },
      include: { proposals: true },
    });

    if (!rfp) {
      throw new NotFoundException(`RFP not found`);
    }

    const techScore = Math.min(100, Math.max(0, Number(data.technicalScore)));
    const bidAmount = Number(data.commercialBid);

    // Calculate commercial score based on existing proposals and this proposal
    const allBids = [...rfp.proposals.map((p) => p.commercialBid), bidAmount];
    const lowestBid = Math.min(...allBids);

    // Initial score for this proposal
    const commercialScore = (lowestBid / bidAmount) * 100;
    const totalScore =
      (techScore * (rfp.technicalWeight / 100)) +
      (commercialScore * (rfp.commercialWeight / 100));

    const newProposal = await this.prisma.vendorProposal.create({
      data: {
        rfpId,
        vendorName: data.vendorName,
        commercialBid: bidAmount,
        technicalScore: Number(techScore.toFixed(2)),
        commercialScore: Number(commercialScore.toFixed(2)),
        totalScore: Number(totalScore.toFixed(2)),
        proposalDetails: data.proposalDetails || '',
      },
    });

    // Recalculate other proposals' commercial score if lowest bid changed
    const currentProposals = await this.prisma.vendorProposal.findMany({
      where: { rfpId },
    });

    const newLowest = Math.min(...currentProposals.map((p) => p.commercialBid));

    for (const prop of currentProposals) {
      const updatedCommScore = Number(((newLowest / prop.commercialBid) * 100).toFixed(2));
      const updatedTotal = Number(
        (
          (prop.technicalScore * (rfp.technicalWeight / 100)) +
          (updatedCommScore * (rfp.commercialWeight / 100))
        ).toFixed(2),
      );

      await this.prisma.vendorProposal.update({
        where: { id: prop.id },
        data: {
          commercialScore: updatedCommScore,
          totalScore: updatedTotal,
        },
      });
    }

    // Set RFP status to EVALUATING if it was PUBLISHED
    if (rfp.status === 'PUBLISHED') {
      await this.prisma.rfp.update({
        where: { id: rfpId },
        data: { status: 'EVALUATING' },
      });
    }

    return this.getRfpById(rfpId);
  }

  async awardProposal(rfpId: string, proposalId: string) {
    const rfp = await this.prisma.rfp.findUnique({
      where: { id: rfpId },
      include: { proposals: true },
    });

    if (!rfp) {
      throw new NotFoundException(`RFP not found`);
    }

    const proposal = rfp.proposals.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new NotFoundException(`Proposal not found for this RFP`);
    }

    // Mark winner
    await this.prisma.vendorProposal.updateMany({
      where: { rfpId },
      data: { isAwarded: false },
    });

    await this.prisma.vendorProposal.update({
      where: { id: proposalId },
      data: { isAwarded: true },
    });

    await this.prisma.rfp.update({
      where: { id: rfpId },
      data: { status: 'AWARDED' },
    });

    // Oracle EBS Purchase Order Simulation: Generate PO
    const randomPoSeq = Math.floor(1000 + Math.random() * 9000);
    const poNumber = `AMLAK-PO-2026-${randomPoSeq}`;

    const po = await this.prisma.purchaseOrder.create({
      data: {
        poNumber,
        rfpId: rfp.id,
        vendorName: proposal.vendorName,
        description: `Contract award for ${rfp.title} (${rfp.rfpNumber})`,
        totalAmount: proposal.commercialBid,
        currency: rfp.currency,
        status: 'ISSUED',
        ebsSyncStatus: 'SYNCED',
        lineItemsJson: JSON.stringify([
          {
            itemDescription: rfp.title,
            category: rfp.category,
            quantity: 1,
            unitPrice: proposal.commercialBid,
            totalPrice: proposal.commercialBid,
          },
        ]),
      },
    });

    // Auto-create Goods Receipt (GRN) simulation
    const grnNumber = `GRN-2026-${randomPoSeq}`;
    const grn = await this.prisma.goodsReceipt.create({
      data: {
        grnNumber,
        poId: po.id,
        receivedQuantity: 1,
        deliveryNoteNumber: `DN-${randomPoSeq}`,
        inspectedBy: 'Amlak QA & Asset Control',
        condition: 'PASSED',
        notes: `Delivery verified according to RFP specifications for ${proposal.vendorName}.`,
      },
    });

    // Auto-create Initial Vendor Invoice ready for 3-Way Matching simulation
    const invoiceNumber = `INV-AML-${randomPoSeq}`;
    await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        poId: po.id,
        grnId: grn.id,
        vendorName: proposal.vendorName,
        billedAmount: proposal.commercialBid,
        poAmount: proposal.commercialBid,
        status: 'PENDING_MATCH',
        matchResult: JSON.stringify({
          poNumber: po.poNumber,
          grnNumber: grn.grnNumber,
          poAmount: po.totalAmount,
          billedAmount: proposal.commercialBid,
          lineItemMatch: true,
          toleranceVariance: 0,
        }),
      },
    });

    return {
      message: `Proposal successfully awarded to ${proposal.vendorName}. Oracle EBS PO generated: ${po.poNumber}.`,
      po,
      grn,
      rfp: await this.getRfpById(rfpId),
    };
  }

  async getAllPurchaseOrders() {
    return this.prisma.purchaseOrder.findMany({
      include: {
        rfp: true,
        goodsReceipts: true,
        invoices: true,
        approvalTasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

import axios from 'axios';

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${hostname}:5000`,
});

// Interceptor to add JWT Authorization token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const defaultLettersStore = [
  {
    id: 'dc14a8cf-c4a1-432b-9e12-88a91b2c3d4e',
    letterNumber: 'AMLAK-2026-08912',
    customerName: 'Alfiya Khan',
    bankName: 'Amlak Finance PJSC',
    accountNumber: 'ABCDEFGH123',
    liabilityAmount: 150000.00,
    issueDate: '2026-10-22',
    expiryDate: '2026-10-23',
    status: 'ACTIVE',
    issuedBy: { id: '1', username: 'admin2', role: 'ADMIN' },
    qrCode: 'http://192.168.0.113:5173/verify/dc14a8cf-c4a1-432b-9e12-88a91b2c3d4e'
  },
  {
    id: '7a0133c3-a8a6-4835-8f66-fa5421d971ae',
    letterNumber: 'AMLAK-2026-04198',
    customerName: 'Emirates Trade Corp',
    bankName: 'Amlak Finance PJSC',
    accountNumber: 'asdf123456789',
    liabilityAmount: 420000.00,
    issueDate: '2026-10-08',
    expiryDate: '2026-10-10',
    status: 'ACTIVE',
    issuedBy: { id: '2', username: 'staff1', role: 'USER' },
    qrCode: 'http://192.168.0.113:5173/verify/7a0133c3-a8a6-4835-8f66-fa5421d971ae'
  },
  {
    id: '8083b206-df90-41bf-ac54-ee6fb1049b8a',
    letterNumber: 'AMLAK-2026-05510',
    customerName: 'Dubai Horizon Ltd',
    bankName: 'Emirates NBD',
    accountNumber: 'ENBD99881122',
    liabilityAmount: 275000.00,
    issueDate: '2026-09-15',
    expiryDate: '2026-09-29',
    status: 'EXPIRED',
    issuedBy: { id: '2', username: 'staff1', role: 'USER' },
    qrCode: 'http://192.168.0.113:5173/verify/8083b206-df90-41bf-ac54-ee6fb1049b8a'
  },
  {
    id: '9123c456-bf78-4901-a123-bcdef456789a',
    letterNumber: 'AMLAK-2026-07734',
    customerName: 'Sharjah Real Estate',
    bankName: 'Dubai Islamic Bank',
    accountNumber: 'DIB44556677',
    liabilityAmount: 890000.00,
    issueDate: '2026-10-01',
    expiryDate: '2026-11-01',
    status: 'ACTIVE',
    issuedBy: { id: '1', username: 'admin2', role: 'ADMIN' },
    qrCode: 'http://192.168.0.113:5173/verify/9123c456-bf78-4901-a123-bcdef456789a'
  },
  {
    id: 'b234d567-ca89-4012-b234-cdef567890ab',
    letterNumber: 'AMLAK-2026-09912',
    customerName: 'Abu Dhabi Investments',
    bankName: 'First Abu Dhabi Bank',
    accountNumber: 'FAB11223344',
    liabilityAmount: 620000.00,
    issueDate: '2026-10-03',
    expiryDate: '2026-11-03',
    status: 'ACTIVE',
    issuedBy: { id: '1', username: 'admin2', role: 'ADMIN' },
    qrCode: 'http://192.168.0.113:5173/verify/b234d567-ca89-4012-b234-cdef567890ab'
  }
];

// Helper functions for persistent localStorage letters store
const getStoredLetters = () => {
  try {
    const saved = localStorage.getItem('amlak_demo_letters_store');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [...defaultLettersStore];
};

const saveStoredLetters = (letters) => {
  try {
    localStorage.setItem('amlak_demo_letters_store', JSON.stringify(letters));
  } catch (e) {}
};

let mockLettersStore = getStoredLetters();

let mockRfpStore = [
  {
    id: 'rfp-demo-1',
    rfpNumber: 'RFP-2026-001',
    title: 'Core Banking Cloud Migration & Cybersecurity Audit',
    department: 'IT & Infrastructure',
    category: 'IT & Infrastructure',
    budget: 350000,
    currency: 'AED',
    description: 'Procurement of enterprise cloud compliance, threat modeling, and zero-trust infrastructure audit for Amlak Finance.',
    status: 'EVALUATING',
    technicalWeight: 60,
    commercialWeight: 40,
    deadline: '2026-11-15',
    createdAt: '2026-10-10T10:00:00.000Z',
    proposals: [
      {
        id: 'prop-1',
        rfpId: 'rfp-demo-1',
        vendorName: 'Alpha Cloud Solutions Dubai',
        commercialBid: 310000,
        technicalScore: 92,
        commercialScore: 96.77,
        totalScore: 93.91,
        proposalDetails: 'Tier-4 UAE local hosting, ISO 27001 certified, 24/7 SOC integration.',
        isAwarded: false,
      },
      {
        id: 'prop-2',
        rfpId: 'rfp-demo-1',
        vendorName: 'Gulf CyberSec FZ-LLC',
        commercialBid: 300000,
        technicalScore: 84,
        commercialScore: 100,
        totalScore: 90.40,
        proposalDetails: 'Comprehensive penetration testing & data classification framework.',
        isAwarded: false,
      },
      {
        id: 'prop-3',
        rfpId: 'rfp-demo-1',
        vendorName: 'Emirates Enterprise Technologies',
        commercialBid: 340000,
        technicalScore: 89,
        commercialScore: 88.24,
        totalScore: 88.70,
        proposalDetails: 'Hybrid multi-cloud backup and automated DR disaster recovery.',
        isAwarded: false,
      }
    ],
    approvalTasks: [],
    purchaseOrders: []
  },
  {
    id: 'rfp-demo-2',
    rfpNumber: 'RFP-2026-002',
    title: 'Corporate Headquarters Smart Facilities Automation',
    department: 'Facility Management',
    category: 'Facility Management',
    budget: 180000,
    currency: 'AED',
    description: 'IoT sensor deployment, energy management automation, and smart access badge readers.',
    status: 'AWARDED',
    technicalWeight: 60,
    commercialWeight: 40,
    deadline: '2026-10-25',
    createdAt: '2026-10-05T09:30:00.000Z',
    proposals: [
      {
        id: 'prop-4',
        rfpId: 'rfp-demo-2',
        vendorName: 'SmartEco Building Systems',
        commercialBid: 165000,
        technicalScore: 95,
        commercialScore: 100,
        totalScore: 97.00,
        proposalDetails: 'LEED-certified energy monitoring with real-time BMS API integration.',
        isAwarded: true,
      }
    ],
    approvalTasks: [],
    purchaseOrders: []
  }
];

let mockPoStore = [
  {
    id: 'po-demo-1',
    poNumber: 'AMLAK-PO-2026-8941',
    rfpId: 'rfp-demo-2',
    vendorName: 'SmartEco Building Systems',
    description: 'Contract award for Corporate Headquarters Smart Facilities Automation',
    totalAmount: 165000,
    currency: 'AED',
    status: 'ISSUED',
    ebsSyncStatus: 'SYNCED',
    createdAt: '2026-10-12T11:00:00.000Z',
  },
  {
    id: 'po-demo-2',
    poNumber: 'AMLAK-PO-2026-7420',
    vendorName: 'Emirates Telecom (e&)',
    description: 'Enterprise SD-WAN and Dedicated Fiber Line Renewal',
    totalAmount: 85000,
    currency: 'AED',
    status: 'RECEIVED',
    ebsSyncStatus: 'SYNCED',
    createdAt: '2026-10-08T08:15:00.000Z',
  }
];

let mockApprovalStore = [
  {
    id: 'app-task-1',
    entityType: 'RFP',
    entityId: 'rfp-demo-1',
    rfpId: 'rfp-demo-1',
    level: 'L2_FINANCE_DIRECTOR',
    title: 'RFP Approval: Core Banking Cloud Migration (RFP-2026-001)',
    description: 'Budget requisition AED 350,000 for critical IT compliance and cloud upgrade.',
    amount: 350000,
    status: 'PENDING',
    approverRole: 'FINANCE_DIRECTOR',
    createdAt: '2026-10-14T10:15:00.000Z',
  },
  {
    id: 'app-task-2',
    entityType: 'INVOICE',
    entityId: 'inv-demo-1',
    invoiceId: 'inv-demo-1',
    poId: 'po-demo-1',
    level: 'L2_FINANCE_DIRECTOR',
    title: 'AP Payment Clearance: INV-AML-8941 (SmartEco Building Systems)',
    description: '3-Way Match Verified (PO 8941 & GRN 1042). Total AED 165,000.',
    amount: 165000,
    status: 'PENDING',
    approverRole: 'FINANCE_DIRECTOR',
    createdAt: '2026-10-15T14:30:00.000Z',
  },
  {
    id: 'app-task-3',
    entityType: 'PO',
    entityId: 'po-demo-2',
    poId: 'po-demo-2',
    level: 'L1_DEPT_HEAD',
    title: 'PO Clearance: Emirates Telecom Dedicated Fiber (AMLAK-PO-2026-7420)',
    description: 'Telecom operational expense allocation for Q4 2026.',
    amount: 85000,
    status: 'APPROVED',
    approverRole: 'DEPT_HEAD',
    decidedBy: 'admin2',
    comments: 'Approved as per annual telecommunications SLA agreement.',
    decidedAt: '2026-10-09T10:00:00.000Z',
    createdAt: '2026-10-08T09:00:00.000Z',
  }
];

let mockInvoiceStore = [
  {
    id: 'inv-demo-1',
    invoiceNumber: 'INV-AML-8941',
    poId: 'po-demo-1',
    vendorName: 'SmartEco Building Systems',
    billedAmount: 165000,
    poAmount: 165000,
    status: 'MATCHED',
    po: {
      poNumber: 'AMLAK-PO-2026-8941',
      vendorName: 'SmartEco Building Systems',
      totalAmount: 165000,
    },
    grn: {
      grnNumber: 'GRN-2026-1042',
      condition: 'PASSED',
      receivedQuantity: 1,
      inspectedBy: 'Amlak QA & Asset Control',
    },
    matchResult: JSON.stringify({
      evaluatedAt: '2026-10-15T14:30:00.000Z',
      matchPassed: true,
      checks: {
        priceMatch: { passed: true, poAmount: 165000, billedAmount: 165000, variance: 0 },
        vendorMatch: { passed: true, vendor: 'SmartEco Building Systems' },
        receiptMatch: { passed: true, status: 'PASSED', grnNumber: 'GRN-2026-1042' },
      },
      summary: '3-Way Matching Successful (PO, GRN & Invoice 100% matched). Cleared for AP disbursement.',
    }),
    createdAt: '2026-10-15T14:00:00.000Z',
  },
  {
    id: 'inv-demo-2',
    invoiceNumber: 'INV-AML-7420',
    poId: 'po-demo-2',
    vendorName: 'Emirates Telecom (e&)',
    billedAmount: 85000,
    poAmount: 85000,
    status: 'MATCHED',
    po: {
      poNumber: 'AMLAK-PO-2026-7420',
      vendorName: 'Emirates Telecom (e&)',
      totalAmount: 85000,
    },
    grn: {
      grnNumber: 'GRN-2026-0985',
      condition: 'PASSED',
      receivedQuantity: 1,
      inspectedBy: 'Amlak Network Admin',
    },
    matchResult: JSON.stringify({
      evaluatedAt: '2026-10-10T11:00:00.000Z',
      matchPassed: true,
      checks: {
        priceMatch: { passed: true, poAmount: 85000, billedAmount: 85000, variance: 0 },
        vendorMatch: { passed: true, vendor: 'Emirates Telecom (e&)' },
        receiptMatch: { passed: true, status: 'PASSED', grnNumber: 'GRN-2026-0985' },
      },
      summary: '3-Way Matching Successful (PO, GRN & Invoice 100% matched). Cleared for AP disbursement.',
    }),
    createdAt: '2026-10-10T10:30:00.000Z',
  }
];

// Response Interceptor: Seamless fallback for cloud static deployment (Vercel)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isVercelHost = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
    const url = error.config?.url || '';
    const method = (error.config?.method || 'get').toLowerCase();

    // If on Vercel or network unreachable, serve intelligent live demo data
    if (isVercelHost || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
      console.warn(`[Amlak Live Cloud Mode] Handling ${method.toUpperCase()} ${url}`);

      // 1. Auth Login
      if (url.includes('/auth/login')) {
        let body = {};
        try {
          body = typeof error.config?.data === 'string' ? JSON.parse(error.config.data) : (error.config?.data || {});
        } catch (e) {}

        const uname = body.username || 'admin2';
        const pass = body.password || 'Admin@123';

        if ((uname === 'admin2' && pass === 'Admin@123') || (uname === 'staff1' && pass === 'User@123')) {
          return Promise.resolve({
            data: {
              require2FA: true,
              userId: uname === 'admin2' ? '1' : '2',
              tempToken: 'amlak_vercel_temp_token',
              currentTotpCode: '406017',
              twoFactorSecret: uname === 'admin2' ? 'JBSWY3DPEHPK3PXP' : 'JBSWY3DPEHPK3PXQ',
              qrCodeImageDataUrl: 'data:image/png;base64,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',
              message: '2-Step Verification required.'
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config
          });
        }

        return Promise.reject({
          response: {
            status: 401,
            data: { message: 'Invalid credentials. Please try again (Use admin2 / Admin@123).' }
          }
        });
      }

      // 2. Auth Verify 2FA
      if (url.includes('/auth/verify-2fa')) {
        return Promise.resolve({
          data: {
            accessToken: 'amlak_jwt_token_vercel',
            user: {
              id: '1',
              username: 'admin2',
              role: 'ADMIN',
              isTwoFactorEnabled: true
            }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }

      // 2.1 Microsoft SSO Callback
      if (url.includes('/auth/sso-callback')) {
        let body = {};
        try {
          body = typeof error.config?.data === 'string' ? JSON.parse(error.config.data) : (error.config?.data || {});
        } catch (e) {}

        const ssoEmail = body.email || 'alfiya@iqratechnology.com';
        const ssoName = body.name || 'Alfiya Khan (Microsoft SSO)';

        return Promise.resolve({
          data: {
            accessToken: 'amlak_msal_sso_verified_jwt',
            user: {
              id: 'ms-sso-user',
              username: ssoEmail,
              role: 'ADMIN',
              displayName: ssoName,
            }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }

      // 3. Letters Stats & Dashboard Data
      if (url.includes('/letters/stats') || (url.includes('/letters') && method === 'get')) {
        const activeCount = mockLettersStore.filter((l) => l.status === 'ACTIVE').length;
        const expiredCount = mockLettersStore.filter((l) => l.status === 'EXPIRED').length;

        return Promise.resolve({
          data: {
            stats: {
              totalLetters: mockLettersStore.length,
              activeLetters: activeCount,
              expiredLetters: expiredCount,
              authorizedIssuers: 3,
            },
            letters: mockLettersStore,
            issuers: ['admin2', 'staff1'],
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }

      // 3.1 Procurement Stats & RFPs Endpoint
      if (url.includes('/procurement/stats')) {
        return Promise.resolve({
          data: {
            totalRfps: mockRfpStore.length,
            activeRfps: mockRfpStore.filter(r => ['PUBLISHED', 'EVALUATING'].includes(r.status)).length,
            awardedRfps: mockRfpStore.filter(r => r.status === 'AWARDED').length,
            totalPoVolume: mockPoStore.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
            totalOrders: mockPoStore.length,
            pendingApprovals: mockApprovalStore.filter(a => a.status === 'PENDING').length,
            totalInvoices: mockInvoiceStore.length,
            matchedInvoices: mockInvoiceStore.filter(i => i.status === 'MATCHED').length,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }

      if (url.includes('/procurement/rfps') && method === 'get') {
        const id = url.split('/procurement/rfps/')[1]?.split('?')[0];
        if (id) {
          const rfp = mockRfpStore.find(r => r.id === id) || mockRfpStore[0];
          return Promise.resolve({ data: rfp, status: 200, statusText: 'OK', headers: {}, config: error.config });
        }
        return Promise.resolve({ data: mockRfpStore, status: 200, statusText: 'OK', headers: {}, config: error.config });
      }

      if (url.includes('/procurement/rfps') && method === 'post' && !url.includes('/proposals') && !url.includes('/award')) {
        let body = {};
        try {
          body = typeof error.config?.data === 'string' ? JSON.parse(error.config.data) : (error.config?.data || {});
        } catch (e) {}

        const newRfp = {
          id: 'rfp-' + Date.now().toString(36),
          rfpNumber: `RFP-2026-${String(mockRfpStore.length + 1).padStart(3, '0')}`,
          title: body.title || 'Enterprise IT Infrastructure Upgrade',
          department: body.department || 'IT Operations',
          category: body.category || 'IT & Infrastructure',
          budget: Number(body.budget) || 250000,
          currency: 'AED',
          description: body.description || 'Enterprise tender requisition.',
          status: 'PUBLISHED',
          technicalWeight: Number(body.technicalWeight) || 60,
          commercialWeight: Number(body.commercialWeight) || 40,
          deadline: body.deadline || new Date(Date.now() + 14 * 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          proposals: [],
          approvalTasks: [],
          purchaseOrders: [],
        };
        mockRfpStore.unshift(newRfp);
        mockApprovalStore.unshift({
          id: 'app-' + Date.now().toString(36),
          entityType: 'RFP',
          entityId: newRfp.id,
          rfpId: newRfp.id,
          level: newRfp.budget > 100000 ? 'L2_FINANCE_DIRECTOR' : 'L1_DEPT_HEAD',
          title: `RFP Approval: ${newRfp.title} (${newRfp.rfpNumber})`,
          description: `Budget review for ${newRfp.category} requisition.`,
          amount: newRfp.budget,
          status: 'PENDING',
          approverRole: 'FINANCE_DIRECTOR',
          createdAt: new Date().toISOString(),
        });

        return Promise.resolve({ data: newRfp, status: 200, statusText: 'OK', headers: {}, config: error.config });
      }

      if (url.includes('/proposals') && method === 'post') {
        const rfpId = url.split('/procurement/rfps/')[1]?.split('/proposals')[0];
        let body = {};
        try {
          body = typeof error.config?.data === 'string' ? JSON.parse(error.config.data) : (error.config?.data || {});
        } catch (e) {}

        const rfp = mockRfpStore.find(r => r.id === rfpId) || mockRfpStore[0];
        const bidAmount = Number(body.commercialBid) || 120000;
        const techScore = Number(body.technicalScore) || 85;

        const allBids = [...rfp.proposals.map(p => p.commercialBid), bidAmount];
        const lowestBid = Math.min(...allBids);

        const newProposal = {
          id: 'prop-' + Date.now().toString(36),
          rfpId: rfp.id,
          vendorName: body.vendorName || 'Global Systems FZ-LLC',
          commercialBid: bidAmount,
          technicalScore: techScore,
          commercialScore: Number(((lowestBid / bidAmount) * 100).toFixed(2)),
          totalScore: Number(((techScore * 0.6) + (((lowestBid / bidAmount) * 100) * 0.4)).toFixed(2)),
          proposalDetails: body.proposalDetails || 'Standard vendor SLA proposal.',
          isAwarded: false,
          createdAt: new Date().toISOString(),
        };

        rfp.proposals.push(newProposal);
        rfp.status = 'EVALUATING';
        return Promise.resolve({ data: rfp, status: 200, statusText: 'OK', headers: {}, config: error.config });
      }

      if (url.includes('/award') && method === 'post') {
        const rfpId = url.split('/procurement/rfps/')[1]?.split('/award')[0];
        let body = {};
        try {
          body = typeof error.config?.data === 'string' ? JSON.parse(error.config.data) : (error.config?.data || {});
        } catch (e) {}

        const rfp = mockRfpStore.find(r => r.id === rfpId) || mockRfpStore[0];
        const proposal = rfp.proposals.find(p => p.id === body.proposalId) || rfp.proposals[0];
        proposal.isAwarded = true;
        rfp.status = 'AWARDED';

        const poSeq = Math.floor(1000 + Math.random() * 9000);
        const po = {
          id: 'po-' + Date.now().toString(36),
          poNumber: `AMLAK-PO-2026-${poSeq}`,
          rfpId: rfp.id,
          vendorName: proposal.vendorName,
          description: `Contract award for ${rfp.title} (${rfp.rfpNumber})`,
          totalAmount: proposal.commercialBid,
          currency: 'AED',
          status: 'ISSUED',
          ebsSyncStatus: 'SYNCED',
          createdAt: new Date().toISOString(),
        };
        mockPoStore.unshift(po);

        const invoice = {
          id: 'inv-' + Date.now().toString(36),
          invoiceNumber: `INV-AML-${poSeq}`,
          poId: po.id,
          vendorName: proposal.vendorName,
          billedAmount: proposal.commercialBid,
          poAmount: proposal.commercialBid,
          status: 'PENDING_MATCH',
          po,
          grn: {
            grnNumber: `GRN-2026-${poSeq}`,
            condition: 'PASSED',
            receivedQuantity: 1,
            inspectedBy: 'Amlak QA & Asset Control',
          },
          createdAt: new Date().toISOString(),
        };
        mockInvoiceStore.unshift(invoice);

        return Promise.resolve({
          data: { message: `Contract awarded to ${proposal.vendorName}`, po, rfp },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }

      // 3.2 Orders Endpoint
      if (url.includes('/procurement/orders')) {
        return Promise.resolve({ data: mockPoStore, status: 200, statusText: 'OK', headers: {}, config: error.config });
      }

      // 3.3 Approvals Hub Endpoint
      if (url.includes('/approvals/pending')) {
        return Promise.resolve({
          data: mockApprovalStore.filter(a => a.status === 'PENDING'),
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }

      if (url.includes('/approvals/history')) {
        return Promise.resolve({ data: mockApprovalStore, status: 200, statusText: 'OK', headers: {}, config: error.config });
      }

      if (url.includes('/approvals/') && url.includes('/action')) {
        const id = url.split('/approvals/')[1]?.split('/action')[0];
        let body = {};
        try {
          body = typeof error.config?.data === 'string' ? JSON.parse(error.config.data) : (error.config?.data || {});
        } catch (e) {}

        const task = mockApprovalStore.find(a => a.id === id);
        if (task) {
          task.status = body.action || 'APPROVED';
          task.comments = body.comments || `Approved via Central Approval HUB`;
          task.decidedBy = 'Enterprise Approver';
          task.decidedAt = new Date().toISOString();
        }

        return Promise.resolve({
          data: { message: `Task ${body.action || 'APPROVED'} successfully`, task },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }

      // 3.4 Invoices & 3-Way Match Endpoint
      if (url.includes('/invoices') && method === 'get') {
        return Promise.resolve({ data: mockInvoiceStore, status: 200, statusText: 'OK', headers: {}, config: error.config });
      }

      if (url.includes('/invoices/') && url.includes('/match')) {
        const id = url.split('/invoices/')[1]?.split('/match')[0];
        const invoice = mockInvoiceStore.find(i => i.id === id) || mockInvoiceStore[0];
        invoice.status = 'MATCHED';
        invoice.matchResult = JSON.stringify({
          evaluatedAt: new Date().toISOString(),
          matchPassed: true,
          checks: {
            priceMatch: { passed: true, poAmount: invoice.poAmount, billedAmount: invoice.billedAmount, variance: 0 },
            vendorMatch: { passed: true, vendor: invoice.vendorName },
            receiptMatch: { passed: true, status: 'PASSED' },
          },
          summary: '3-Way Matching Successful (PO, GRN & Invoice 100% matched). Cleared for AP disbursement.',
        });

        return Promise.resolve({
          data: { message: '3-Way Match Passed!', invoice },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }

      // 4. Letter Upload / Generate Endpoint
      if (url.includes('/letters/generate') || url.includes('/letters/upload')) {
        const form = error.config?.data;
        let accountNumber = 'AB1234567890';
        let bankName = 'Amlak Finance PJSC';
        let issueDate = new Date().toISOString().split('T')[0];
        let expiryDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

        if (form && typeof form.get === 'function') {
          accountNumber = form.get('accountNumber') || accountNumber;
          bankName = form.get('bankName') || bankName;
          issueDate = form.get('issueDate') || issueDate;
          expiryDate = form.get('expiryDate') || expiryDate;
        }

        const newId = 'letter-' + Date.now().toString(36);
        const newLetter = {
          id: newId,
          bankName,
          accountNumber,
          issueDate,
          expiryDate,
          status: 'ACTIVE',
          issuedBy: { id: '1', username: 'admin2', role: 'ADMIN' },
          qrCodeData: `${window.location.origin}/verify/${newId}`
        };

        mockLettersStore.unshift(newLetter);
        saveStoredLetters(mockLettersStore);

        return Promise.resolve({
          data: newLetter,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }

      // 5. Public Verification Endpoint (/verify/:id)
      if (url.includes('/verify/')) {
        const id = url.split('/verify/')[1]?.split('?')[0];
        let reqAccount = '';

        try {
          const postData = typeof error.config?.data === 'string' ? JSON.parse(error.config.data) : (error.config?.data || {});
          reqAccount = postData.accountNumber || '';
        } catch (e) {}

        const letter = mockLettersStore.find((l) => l.id === id) || mockLettersStore[0];

        if (!reqAccount) {
          return Promise.resolve({
            data: {
              requiresAccountNumber: true,
              bankName: letter.bankName,
              message: 'Please enter account number to verify liability document.',
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config,
          });
        }

        const isMatch = reqAccount.trim().toUpperCase() === letter.accountNumber.trim().toUpperCase();

        return Promise.resolve({
          data: {
            requiresAccountNumber: false,
            isAccountMatch: isMatch,
            isValid: isMatch && letter.status === 'ACTIVE',
            id: letter.id,
            bankName: letter.bankName,
            accountNumber: letter.accountNumber,
            issueDate: letter.issueDate,
            expiryDate: letter.expiryDate,
            status: letter.status,
            message: isMatch ? 'Document verified successfully.' : 'Entered account number does not match this liability letter record.'
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }

      // 6. Download PDF Endpoint
      if (url.includes('/download')) {
        const validPdfBinaryStr = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj
4 0 obj <</Length 280>> stream
BT
/F1 16 Tf
50 720 Td
(AMLAK FINANCE PJSC - OFFICIAL LIABILITY VERIFICATION LETTER) Tj
/F1 11 Tf
0 -40 Td
(Bank Name: Amlak Finance PJSC) Tj
0 -20 Td
(Account Number: AB1234567890) Tj
0 -20 Td
(Issuer: admin2 - Authorized Officer) Tj
0 -20 Td
(Verification Status: VERIFIED ACTIVE) Tj
ET
endstream endobj
5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000246 00000 n 
0000000578 00000 n 
trailer <</Size 6 /Root 1 0 R>>
startxref
647
%%EOF`;

        const pdfArrayBuffer = new TextEncoder().encode(validPdfBinaryStr).buffer;
        return Promise.resolve({
          data: pdfArrayBuffer,
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/pdf' },
          config: error.config,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default API;

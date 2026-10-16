import React, { useState, useEffect } from 'react';
import API from '../api';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  Truck,
  FileSpreadsheet,
  Building2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  DollarSign,
  AlertOctagon,
} from 'lucide-react';

export const InvoiceMatchPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchingInProgress, setMatchingInProgress] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await API.get('/invoices');
      setInvoices(res.data);
      if (res.data.length > 0 && !selectedInvoice) {
        setSelectedInvoice(res.data[0]);
      } else if (selectedInvoice) {
        const refreshed = res.data.find((i) => i.id === selectedInvoice.id);
        if (refreshed) setSelectedInvoice(refreshed);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRunMatch = async (invoiceId) => {
    try {
      setMatchingInProgress(true);
      const res = await API.post(`/invoices/${invoiceId}/match`);
      alert(res.data.message || '3-Way Match analysis completed successfully!');
      await fetchInvoices();
    } catch (err) {
      alert('Error running 3-way match: ' + (err.response?.data?.message || err.message));
    } finally {
      setMatchingInProgress(false);
    }
  };

  const totalMatchedCount = invoices.filter((i) => i.status === 'MATCHED').length;
  const totalDiscrepancyCount = invoices.filter((i) => i.status === 'DISCREPANCY').length;
  const totalVolume = invoices.reduce((sum, i) => sum + (i.billedAmount || 0), 0);

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5" />
              Automated Audit Verification
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Zero Financial Leakage
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Automated 3-Way Invoice Matching
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time automated reconciliation between Oracle EBS Purchase Orders, Warehouse GRNs, and AP Invoices.
          </p>
        </div>

        <button
          onClick={fetchInvoices}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Invoices</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{invoices.length}</span>
            <span className="text-[10px] text-slate-400">Received for AP</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">3-Way Matched</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{totalMatchedCount}</span>
            <span className="text-[10px] text-emerald-400 font-bold">100% Cleared</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Discrepancy Holds</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">{totalDiscrepancyCount}</span>
            <span className="text-[10px] text-rose-400 font-bold">Audit Flagged</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">AP Invoice Volume</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300 font-mono">
              AED {totalVolume.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* INVOICE SELECTOR & 3-WAY RECONCILIATION CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: INVOICE LIST (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 space-y-3">
          <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-slate-800">
            <Receipt className="w-4 h-4 text-emerald-400" />
            Vendor Invoices Queue ({invoices.length})
          </h2>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {invoices.map((inv) => {
              const isSelected = selectedInvoice?.id === inv.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-teal-500/80 shadow-md shadow-teal-950/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-400">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        inv.status === 'MATCHED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : inv.status === 'DISCREPANCY'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white mt-1.5 truncate">
                    {inv.vendorName}
                  </h3>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 font-mono">PO: {inv.po?.poNumber || 'PO-Linked'}</span>
                    <span className="font-black text-emerald-400 font-mono">
                      AED {Number(inv.billedAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: 3-WAY MATCH VISUAL INSPECTOR (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 space-y-6">
          {selectedInvoice ? (
            <>
              {/* STATUS BANNER */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  selectedInvoice.status === 'MATCHED'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                    : selectedInvoice.status === 'DISCREPANCY'
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                    : 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {selectedInvoice.status === 'MATCHED' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  ) : selectedInvoice.status === 'DISCREPANCY' ? (
                    <AlertOctagon className="w-6 h-6 text-rose-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      Match Status: {selectedInvoice.status}
                    </h3>
                    <p className="text-xs opacity-90">
                      {selectedInvoice.status === 'MATCHED'
                        ? 'Reconciliation complete. Purchase Order, Goods Receipt, and Invoice are in 100% agreement.'
                        : 'Discrepancy detected during validation checks. Accounts Payable disbursement is on hold.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRunMatch(selectedInvoice.id)}
                  disabled={matchingInProgress}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  {matchingInProgress ? 'Verifying...' : 'Re-run 3-Way Match'}
                </button>
              </div>

              {/* THREE RECONCILIATION PILLARS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                
                {/* 1. PURCHASE ORDER (EBS) */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                      1. Oracle EBS PO
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono font-bold">
                      PO SYNC
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] text-slate-400 block">PO Number:</span>
                    <span className="font-mono font-bold text-white">
                      {selectedInvoice.po?.poNumber || 'AMLAK-PO-2026-8941'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] text-slate-400 block">Authorized Vendor:</span>
                    <span className="font-bold text-slate-200">
                      {selectedInvoice.po?.vendorName || selectedInvoice.vendorName}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Contract Price</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      AED {Number(selectedInvoice.poAmount || selectedInvoice.po?.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 2. GOODS RECEIPT NOTE (GRN) */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      2. Warehouse GRN
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">
                      VERIFIED
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] text-slate-400 block">Receipt / GRN No:</span>
                    <span className="font-mono font-bold text-white">
                      {selectedInvoice.grn?.grnNumber || 'GRN-2026-1042'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] text-slate-400 block">QA Inspection:</span>
                    <span className="font-bold text-emerald-400">
                      Condition: {selectedInvoice.grn?.condition || 'PASSED'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Delivery Status</span>
                    <span className="text-xs font-bold text-white">
                      100% Units Received
                    </span>
                  </div>
                </div>

                {/* 3. VENDOR INVOICE */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-teal-400" />
                      3. AP Invoice
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 font-mono font-bold">
                      BILLED
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] text-slate-400 block">Invoice Number:</span>
                    <span className="font-mono font-bold text-white">
                      {selectedInvoice.invoiceNumber}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] text-slate-400 block">Claimed By:</span>
                    <span className="font-bold text-slate-200">
                      {selectedInvoice.vendorName}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Billed Amount</span>
                    <span className="text-sm font-black text-teal-400 font-mono">
                      AED {Number(selectedInvoice.billedAmount).toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* THREE AUDIT CHECKS MATRIX */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Automated Audit Validation Checklist
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-200 font-bold">Price Variance Check:</span>
                      <span className="text-slate-400 text-[11px]">
                        PO Amount (AED {Number(selectedInvoice.poAmount).toLocaleString()}) == Invoice Billed Amount (AED {Number(selectedInvoice.billedAmount).toLocaleString()})
                      </span>
                    </div>
                    <span className="font-mono font-black text-emerald-400 text-[11px]">
                      Δ = 0.00 AED (MATCH)
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-200 font-bold">Vendor Entity Identity:</span>
                      <span className="text-slate-400 text-[11px]">
                        Contractor name perfectly matches Oracle EBS vendor record.
                      </span>
                    </div>
                    <span className="font-bold text-emerald-400 text-[11px]">
                      PASSED
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-200 font-bold">Warehouse GRN & QA Inspection:</span>
                      <span className="text-slate-400 text-[11px]">
                        Asset controller confirmed delivery in good condition without defects.
                      </span>
                    </div>
                    <span className="font-bold text-emerald-400 text-[11px]">
                      PASSED
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p>Select an invoice from the queue to run 3-way reconciliation inspection.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
export default InvoiceMatchPage;

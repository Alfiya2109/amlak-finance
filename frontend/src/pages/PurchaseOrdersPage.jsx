import React, { useState, useEffect } from 'react';
import API from '../api';
import {
  FileSpreadsheet,
  Search,
  RefreshCw,
  Building2,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const PurchaseOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPo, setSelectedPo] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/procurement/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((po) => {
    return (
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      po.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalVolume = orders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Oracle EBS Integration
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Contract Fulfillment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Purchase Orders (Oracle EBS PO Simulation)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time synchronization of legally binding purchase orders, vendor agreements, and payment release schedules.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync EBS Records</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total POs Issued</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{orders.length}</span>
            <span className="text-[10px] text-emerald-400 font-bold">100% Synced</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total PO Volume</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-300 font-mono">
              AED {totalVolume.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">EBS Gateway</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-sm font-black text-emerald-400">Oracle EBS Active</span>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Search by PO Number, vendor, or scope description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* PURCHASE ORDERS TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            EBS Purchase Orders Registry ({filteredOrders.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 text-[10px]">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Vendor Name</th>
                <th className="py-3 px-4">Contract Scope</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">EBS Status</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">
                    {po.poNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {po.vendorName}
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                    {po.description}
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-emerald-400">
                    AED {Number(po.totalAmount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3 text-teal-400" />
                      {po.ebsSyncStatus || 'SYNCED'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        po.status === 'RECEIVED' || po.status === 'BILLED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : 'Recent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default PurchaseOrdersPage;

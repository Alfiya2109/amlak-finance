import React, { useState, useEffect } from 'react';
import API from '../api';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  FileText,
  DollarSign,
  AlertTriangle,
  History,
  Send,
  MessageSquare,
  Sparkles,
  Layers,
  Filter,
} from 'lucide-react';

export const ApprovalHubPage = () => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [historyTasks, setHistoryTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING or HISTORY
  const [entityFilter, setEntityFilter] = useState('ALL'); // ALL, RFP, PO, INVOICE
  const [loading, setLoading] = useState(true);
  const [actionComments, setActionComments] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const [pendingRes, historyRes] = await Promise.all([
        API.get('/approvals/pending'),
        API.get('/approvals/history'),
      ]);
      setPendingTasks(pendingRes.data);
      setHistoryTasks(historyRes.data);
    } catch (err) {
      console.error('Error fetching approval tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (taskId, action) => {
    const comments = actionComments[taskId] || `Authorized via Central Approval HUB (${action})`;
    try {
      setProcessingId(taskId);
      const res = await API.post(`/approvals/${taskId}/action`, {
        action,
        comments,
      });
      alert(res.data.message || `Task successfully ${action}`);
      setActionComments((prev) => ({ ...prev, [taskId]: '' }));
      await fetchApprovals();
    } catch (err) {
      alert('Error recording decision: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPending = pendingTasks.filter((t) => {
    if (entityFilter === 'ALL') return true;
    return t.entityType === entityFilter;
  });

  const filteredHistory = historyTasks.filter((t) => {
    if (entityFilter === 'ALL') return true;
    return t.entityType === entityFilter;
  });

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Executive Governance
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ORBIT Workflow Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Central Approval HUB
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Unified executive inbox for Sourcing Tenders, Oracle EBS Purchase Orders, and AP Invoice clearance.
          </p>
        </div>

        {/* Live Pending Counter Badge */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-sm self-start md:self-auto">
          <div className="relative">
            <Layers className="w-5 h-5 text-amber-400" />
            {pendingTasks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
              Pending Decisions
            </span>
            <span className="text-lg font-black text-white">
              {pendingTasks.length} Requisitions
            </span>
          </div>
        </div>
      </div>

      {/* TABS & FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/80">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'PENDING'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Inbox ({pendingTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'HISTORY'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Decision Audit Trail</span>
          </button>
        </div>

        {/* Entity Type Filter */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] font-bold text-slate-400 mr-1">Filter:</span>
          {['ALL', 'RFP', 'PO', 'INVOICE'].map((type) => (
            <button
              key={type}
              onClick={() => setEntityFilter(type)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                entityFilter === type
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/40'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* PENDING APPROVALS LIST */}
      {activeTab === 'PENDING' ? (
        <div className="space-y-4">
          {filteredPending.length > 0 ? (
            filteredPending.map((task) => (
              <div
                key={task.id}
                className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        task.entityType === 'RFP'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : task.entityType === 'PO'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      }`}
                    >
                      {task.entityType} Requisition
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Level: {task.level}
                    </span>

                    <span className="text-xs text-slate-400">
                      Target Role: <strong className="text-white">{task.approverRole}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-base font-black text-emerald-400">
                      AED {Number(task.amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {task.description || 'Enterprise workflow clearance required prior to procurement disbursement.'}
                  </p>
                </div>

                {/* Submitter & Justification comment input */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Add compliance notes or audit comments (optional)..."
                      value={actionComments[task.id] || ''}
                      onChange={(e) =>
                        setActionComments({ ...actionComments, [task.id]: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleAction(task.id, 'REJECTED')}
                      disabled={processingId === task.id}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleAction(task.id, 'APPROVED')}
                      disabled={processingId === task.id}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-black shadow-lg shadow-emerald-950/60 border border-emerald-400/30 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{processingId === task.id ? 'Processing...' : 'Approve Requisition'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-400/60 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">Central Inbox All Cleared!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No requisitions are currently awaiting executive approval. You're completely up to date.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* DECISION AUDIT TRAIL TABLE */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Governance Audit Trail ({filteredHistory.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Requisition Title</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Decided By</th>
                  <th className="py-3 px-4">Audit Comments</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-amber-400 text-[11px]">
                        {h.entityType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                      {h.title}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          h.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : h.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{h.decidedBy || 'System Workflow'}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {h.comments || 'Direct approval granted.'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {h.decidedAt ? new Date(h.decidedAt).toLocaleString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
export default ApprovalHubPage;

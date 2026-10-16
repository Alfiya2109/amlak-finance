import React, { useState, useEffect } from 'react';
import API from '../api';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  Building2,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Sparkles,
  Calculator,
  FileCheck,
} from 'lucide-react';

export const ProcurementPage = () => {
  const [rfps, setRfps] = useState([]);
  const [stats, setStats] = useState({
    totalRfps: 0,
    activeRfps: 0,
    awardedRfps: 0,
    totalPoVolume: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRfp, setSelectedRfp] = useState(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New RFP Form State
  const [newRfp, setNewRfp] = useState({
    title: '',
    department: 'IT & Infrastructure',
    category: 'IT & Infrastructure',
    budget: '',
    description: '',
    deadline: '',
    technicalWeight: 60,
    commercialWeight: 40,
  });

  // New Proposal Form State
  const [newProposal, setNewProposal] = useState({
    vendorName: '',
    commercialBid: '',
    technicalScore: 85,
    proposalDetails: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, rfpsRes] = await Promise.all([
        API.get('/procurement/stats'),
        API.get('/procurement/rfps'),
      ]);
      setStats(statsRes.data);
      setRfps(rfpsRes.data);
      if (rfpsRes.data.length > 0 && !selectedRfp) {
        setSelectedRfp(rfpsRes.data[0]);
      } else if (selectedRfp) {
        const refreshed = rfpsRes.data.find((r) => r.id === selectedRfp.id);
        if (refreshed) setSelectedRfp(refreshed);
      }
    } catch (err) {
      console.error('Error fetching procurement data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRfp = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await API.post('/procurement/rfps', newRfp);
      setShowCreateModal(false);
      setNewRfp({
        title: '',
        department: 'IT & Infrastructure',
        category: 'IT & Infrastructure',
        budget: '',
        description: '',
        deadline: '',
        technicalWeight: 60,
        commercialWeight: 40,
      });
      await fetchData();
      setSelectedRfp(res.data);
    } catch (err) {
      alert('Failed to publish RFP tender: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProposal = async (e) => {
    e.preventDefault();
    if (!selectedRfp) return;
    try {
      setSubmitting(true);
      await API.post(`/procurement/rfps/${selectedRfp.id}/proposals`, newProposal);
      setShowBidModal(false);
      setNewProposal({
        vendorName: '',
        commercialBid: '',
        technicalScore: 85,
        proposalDetails: '',
      });
      await fetchData();
    } catch (err) {
      alert('Failed to register vendor proposal: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAwardWinner = async (proposalId) => {
    if (!window.confirm('Confirm contract award and generate Oracle EBS Purchase Order?')) return;
    try {
      setSubmitting(true);
      const res = await API.post(`/procurement/rfps/${selectedRfp.id}/award`, {
        proposalId,
      });
      alert(res.data.message || 'Contract awarded and EBS PO generated successfully!');
      await fetchData();
    } catch (err) {
      alert('Error awarding contract: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRfps = rfps.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.rfpNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Procure-to-Pay (P2P) Lifecycle
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              ORBIT Sourcing
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Enterprise Sourcing & RFP Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Multi-criteria weighted evaluation (60% Technical, 40% Commercial) & automated Oracle EBS PO generation.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/60 transition-all border border-emerald-400/30 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Tender / RFP</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Tenders</span>
            <div className="p-2 rounded-xl bg-slate-800/80 text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{stats.totalRfps}</span>
            <span className="text-[10px] text-emerald-400 font-bold">Active Sourcing</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Under Evaluation</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">{stats.activeRfps}</span>
            <span className="text-[10px] text-amber-400 font-bold">Bidding Open</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">EBS PO Volume</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-300">
              AED {(stats.totalPoVolume || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Awarded Contracts</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{stats.awardedRfps}</span>
            <span className="text-[10px] text-slate-400 font-bold">POs Dispatched</span>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKFLOW PANE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: RFP LIST (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Sourcing Tenders ({filteredRfps.length})
            </h2>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search by tender, category, or number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
              {['ALL', 'IT & Infrastructure', 'Facility Management', 'Corporate Legal'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* RFP List Items */}
          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredRfps.map((rfp) => {
              const isSelected = selectedRfp?.id === rfp.id;
              return (
                <div
                  key={rfp.id}
                  onClick={() => setSelectedRfp(rfp)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/70 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-amber-400">
                      {rfp.rfpNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        rfp.status === 'AWARDED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : rfp.status === 'EVALUATING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {rfp.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white mt-1.5 line-clamp-1">
                    {rfp.title}
                  </h3>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span className="truncate max-w-[150px]">{rfp.department}</span>
                    <span className="font-black text-emerald-400 font-mono">
                      AED {Number(rfp.budget).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: EVALUATION & VENDOR MATRIX (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 space-y-5">
          {selectedRfp ? (
            <>
              {/* Selected RFP Details Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {selectedRfp.rfpNumber}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{selectedRfp.category}</span>
                  </div>
                  <h2 className="text-base font-extrabold text-white">
                    {selectedRfp.title}
                  </h2>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {selectedRfp.description}
                  </p>
                </div>

                <div className="text-left sm:text-right flex-shrink-0 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Requisition Budget</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    AED {Number(selectedRfp.budget).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Scoring Formula Indicator */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-300">Amlak Weighted Evaluation Formula:</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    Technical: {selectedRfp.technicalWeight || 60}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Commercial: {selectedRfp.commercialWeight || 40}%
                  </span>
                </div>
              </div>

              {/* Proposal Header & Add Button */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    Vendor Bids & Scoring Matrix ({selectedRfp.proposals?.length || 0})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Commercial score is automatically calculated against the lowest compliant bid.
                  </p>
                </div>

                {selectedRfp.status !== 'AWARDED' && (
                  <button
                    onClick={() => setShowBidModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bid</span>
                  </button>
                )}
              </div>

              {/* Proposals Table */}
              <div className="space-y-3">
                {selectedRfp.proposals && selectedRfp.proposals.length > 0 ? (
                  selectedRfp.proposals.map((prop, idx) => (
                    <div
                      key={prop.id}
                      className={`p-4 rounded-xl border transition-all ${
                        prop.isAwarded
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                          : idx === 0
                          ? 'bg-slate-900/90 border-amber-500/50'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">
                              {prop.vendorName}
                            </span>
                            {prop.isAwarded ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-slate-950 flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Contract Awarded
                              </span>
                            ) : idx === 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Rank #1 (Highest Score)
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {prop.proposalDetails || 'Standard vendor technical bid.'}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Commercial Bid</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            AED {Number(prop.commercialBid).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Scores Progress Bars */}
                      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
                        <div>
                          <div className="flex justify-between text-slate-400 mb-1">
                            <span>Tech Score:</span>
                            <span className="font-bold text-blue-400">{prop.technicalScore}/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${prop.technicalScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-400 mb-1">
                            <span>Comm Score:</span>
                            <span className="font-bold text-teal-400">{prop.commercialScore}/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${prop.commercialScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-400 mb-1">
                            <span>Total Score:</span>
                            <span className="font-black text-amber-300">{prop.totalScore}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                              style={{ width: `${prop.totalScore}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action to Award */}
                      {selectedRfp.status !== 'AWARDED' && (
                        <div className="mt-3 pt-2 flex justify-end">
                          <button
                            onClick={() => handleAwardWinner(prop.id)}
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Award & Issue EBS PO</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                    <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold">No vendor proposals submitted yet.</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Click "+ Add Bid" above to record vendor quotations and run automated scoring.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p>Select a tender from the left to view details and vendor proposals.</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: CREATE RFP */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                Publish New RFP Tender
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRfp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tender Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Banking Cloud Migration & Cybersecurity Audit"
                  value={newRfp.title}
                  onChange={(e) => setNewRfp({ ...newRfp, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={newRfp.department}
                    onChange={(e) => setNewRfp({ ...newRfp, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="IT & Infrastructure">IT & Infrastructure</option>
                    <option value="Facility Management">Facility Management</option>
                    <option value="Corporate Legal">Corporate Legal</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newRfp.category}
                    onChange={(e) => setNewRfp({ ...newRfp, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="IT & Infrastructure">IT & Infrastructure</option>
                    <option value="Facility Management">Facility Management</option>
                    <option value="Corporate Legal">Corporate Legal</option>
                    <option value="Consulting Services">Consulting Services</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Budget (AED) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 250000"
                    value={newRfp.budget}
                    onChange={(e) => setNewRfp({ ...newRfp, budget: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Submission Deadline
                  </label>
                  <input
                    type="date"
                    value={newRfp.deadline}
                    onChange={(e) => setNewRfp({ ...newRfp, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Scope & Requisition Description *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detail the technical specifications, delivery milestones, and vendor qualifications..."
                  value={newRfp.description}
                  onChange={(e) => setNewRfp({ ...newRfp, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60"
                >
                  {submitting ? 'Publishing...' : 'Publish Tender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BID */}
      {showBidModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Submit Vendor Proposal
              </h3>
              <button
                onClick={() => setShowBidModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProposal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gulf CyberSec FZ-LLC"
                  value={newProposal.vendorName}
                  onChange={(e) => setNewProposal({ ...newProposal, vendorName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Commercial Bid (AED) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 180000"
                    value={newProposal.commercialBid}
                    onChange={(e) => setNewProposal({ ...newProposal, commercialBid: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Technical Score (0–100) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={newProposal.technicalScore}
                    onChange={(e) => setNewProposal({ ...newProposal, technicalScore: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Proposal Scope & SLA Summary
                </label>
                <textarea
                  rows="3"
                  placeholder="Compliance highlights, certification credentials, delivery timeline..."
                  value={newProposal.proposalDetails}
                  onChange={(e) => setNewProposal({ ...newProposal, proposalDetails: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60"
                >
                  {submitting ? 'Calculating...' : 'Save & Calculate Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default ProcurementPage;

import React, { useState, useEffect, useMemo } from 'react';
import API from '../api';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  RefreshCw,
  Copy,
  Download,
  ExternalLink,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalLetters: 112,
    activeLetters: 5,
    expiredLetters: 107,
    authorizedIssuers: 10,
  });
  const [rawLetters, setRawLetters] = useState([]);
  const [issuers, setIssuers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Global Search
  const [searchQuery, setSearchQuery] = useState('');

  // Status Filter Pill Tab ('ALL' | 'ACTIVE' | 'EXPIRED')
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');

  // Issuer Dropdown Filter
  const [selectedIssuer, setSelectedIssuer] = useState('ALL');

  // Column Sort State { key: 'issueDate'|'id'|'bankName'|'accountNumber'|'issuedBy'|'status', direction: 'asc'|'desc' }
  const [sortConfig, setSortConfig] = useState({ key: 'issueDate', direction: 'desc' });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await API.get('/letters/stats');
      setStats(res.data.stats);
      setRawLetters(res.data.letters);
      setIssuers(res.data.issuers || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Handle Header Column Sort Click
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Filter & Sort Pipeline
  const filteredAndSortedLetters = useMemo(() => {
    let result = [...rawLetters];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.bankName?.toLowerCase().includes(query) ||
          item.accountNumber?.toLowerCase().includes(query) ||
          item.id?.toLowerCase().includes(query) ||
          item.issuedBy?.username?.toLowerCase().includes(query)
      );
    }

    // 2. Status Tab Filter
    if (selectedStatusTab !== 'ALL') {
      result = result.filter((item) => item.status === selectedStatusTab);
    }

    // 3. Issuer Filter
    if (selectedIssuer !== 'ALL') {
      result = result.filter((item) => item.issuedBy?.username === selectedIssuer);
    }

    // 4. Column Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'issuedBy') {
          valA = a.issuedBy?.username || '';
          valB = b.issuedBy?.username || '';
        } else if (sortConfig.key === 'issueDate' || sortConfig.key === 'expiryDate') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (typeof valA === 'string') {
          return sortConfig.direction === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rawLetters, searchQuery, selectedStatusTab, selectedIssuer, sortConfig]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedStatusTab('ALL');
    setSelectedIssuer('ALL');
    setSortConfig({ key: 'issueDate', direction: 'desc' });
  };

  const handleCopyLink = (letterId) => {
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const url = `http://${hostname}${port}/verify/${letterId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(letterId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadPdf = async (letterId) => {
    try {
      const response = await API.get(`/letters/${letterId}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Verification-Letter-${letterId.substring(0, 8)}.pdf`;
      link.click();
    } catch (err) {
      alert('Could not download PDF file.');
    }
  };

  // Status Tab Counts
  const counts = useMemo(() => {
    const active = rawLetters.filter((l) => l.status === 'ACTIVE').length;
    const expired = rawLetters.filter((l) => l.status === 'EXPIRED').length;
    return { all: rawLetters.length, active, expired };
  }, [rawLetters]);

  return (
    <div className="h-screen overflow-y-auto bg-slate-100/70 p-4 sm:p-5 space-y-4 animate-fade-in-up">
      
      {/* Toast Floating Notification for Copy Link */}
      {copiedId && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-bounce text-xs font-bold">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            ✓
          </div>
          <span>Public Verification Link copied to clipboard!</span>
        </div>
      )}

      <div className="w-full space-y-5">
        
        {/* Page Hero Banner */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 p-5 sm:p-6 rounded-3xl border border-emerald-800/40 shadow-xl text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-emerald-800/60 border border-emerald-500/40 rounded-full text-[10px] font-extrabold text-amber-300 tracking-wider uppercase backdrop-blur-md shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Verification Analytics
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              System Dashboard
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-xs text-emerald-100/80 max-w-xl font-medium leading-relaxed">
              Monitor issued liability letters, real-time verification statuses, and system activity.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="relative z-10 self-start md:self-auto flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-2xl border border-white/20 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95 group"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Analytics Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* TOTAL LETTERS */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">TOTAL LETTERS</span>
                <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{stats.totalLetters}</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 text-emerald-700 flex items-center justify-center border border-emerald-200/60 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
              Total uploaded liability letters
            </p>
          </div>

          {/* ACTIVE LETTERS */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">ACTIVE LETTERS</span>
                <div className="text-2xl font-black text-emerald-600 mt-1 tracking-tight flex items-baseline gap-2">
                  {stats.activeLetters}
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/80 shadow-2xs">
                    {stats.totalLetters ? Math.round((stats.activeLetters / stats.totalLetters) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 text-emerald-600 flex items-center justify-center border border-emerald-200/60 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 shadow-2xs"
                  style={{
                    width: `${stats.totalLetters ? Math.round((stats.activeLetters / stats.totalLetters) * 100) : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* EXPIRED LETTERS */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">EXPIRED LETTERS</span>
                <div className="text-2xl font-black text-rose-600 mt-1 tracking-tight">{stats.expiredLetters}</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-500/20 text-rose-600 flex items-center justify-center border border-rose-200/60 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-extrabold text-rose-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              {stats.expiredLetters} letters past expiry date
            </p>
          </div>

          {/* AUTHORIZED ISSUERS */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">AUTHORIZED ISSUERS</span>
                <div className="text-2xl font-black text-amber-500 mt-1 tracking-tight">{stats.authorizedIssuers}</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/20 text-amber-600 flex items-center justify-center border border-amber-200/60 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
              Distinct staff members
            </p>
          </div>

        </div>

        {/* Issued Letters Registry Table Card — FULL WIDTH FIT (NO HORIZONTAL SCROLL) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
          
          {/* TOP TOOLBAR HEADER: CLEAN 2-ROW COMPACT LAYOUT */}
          <div className="p-4 sm:p-5 border-b border-slate-200/80 space-y-3 bg-white">
            
            {/* ROW 1: TITLE & SEARCH CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              {/* Title & Count Badge */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                <h2 className="text-base font-black text-slate-900 tracking-tight whitespace-nowrap">
                  Issued Letters Registry
                </h2>
                <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-black border border-emerald-300/80 shadow-2xs whitespace-nowrap">
                  {filteredAndSortedLetters.length} records
                </span>
              </div>

              {/* Controls: Search Bar + Issuer Select */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Bank / Acc No..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none transition-all shadow-2xs"
                  />
                </div>

                <select
                  value={selectedIssuer}
                  onChange={(e) => setSelectedIssuer(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-700 focus:outline-none cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  <option value="ALL">Issuer: All</option>
                  {issuers.map((iss) => (
                    <option key={iss} value={iss}>
                      {iss}
                    </option>
                  ))}
                </select>

                {(searchQuery || selectedStatusTab !== 'ALL' || selectedIssuer !== 'ALL') && (
                  <button
                    onClick={resetAllFilters}
                    title="Reset All Filters"
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-all cursor-pointer shadow-2xs shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>

            {/* ROW 2: STATUS FILTER TABS */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">Status:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setSelectedStatusTab('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                    selectedStatusTab === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>All</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-slate-200/80 text-[10px] text-slate-700 font-bold">
                    {counts.all}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedStatusTab('ACTIVE')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                    selectedStatusTab === 'ACTIVE'
                      ? 'bg-emerald-600 text-white shadow-xs border border-emerald-500'
                      : 'text-emerald-800 hover:bg-emerald-100/60'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Active</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-800/20 text-[10px] text-emerald-950 font-extrabold">
                    {counts.active}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedStatusTab('EXPIRED')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                    selectedStatusTab === 'EXPIRED'
                      ? 'bg-rose-600 text-white shadow-xs border border-rose-500'
                      : 'text-rose-800 hover:bg-rose-100/60'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>Expired</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-rose-800/20 text-[10px] text-rose-950 font-extrabold">
                    {counts.expired}
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* TABLE CONTAINER — COMPACT SLIM PADDING FOR ZERO HORIZONTAL SCROLL */}
          <div className="w-full">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black text-slate-500 uppercase tracking-wider select-none">
                  
                  {/* 1. LETTER ID */}
                  <th className="py-3 px-3">
                    <button
                      onClick={() => handleSort('id')}
                      className="flex items-center gap-1 hover:text-emerald-800 transition-colors cursor-pointer group font-black"
                    >
                      <span>LETTER ID</span>
                      <SortIndicator columnKey="id" sortConfig={sortConfig} />
                    </button>
                  </th>

                  {/* 2. BANK NAME */}
                  <th className="py-3 px-3">
                    <button
                      onClick={() => handleSort('bankName')}
                      className="flex items-center gap-1 hover:text-emerald-800 transition-colors cursor-pointer group font-black"
                    >
                      <span>BANK</span>
                      <SortIndicator columnKey="bankName" sortConfig={sortConfig} />
                    </button>
                  </th>

                  {/* 3. ACCOUNT NUMBER */}
                  <th className="py-3 px-3">
                    <button
                      onClick={() => handleSort('accountNumber')}
                      className="flex items-center gap-1 hover:text-emerald-800 transition-colors cursor-pointer group font-black"
                    >
                      <span>ACCOUNT NO</span>
                      <SortIndicator columnKey="accountNumber" sortConfig={sortConfig} />
                    </button>
                  </th>

                  {/* 4. ISSUE DATE */}
                  <th className="py-3 px-3">
                    <button
                      onClick={() => handleSort('issueDate')}
                      className="flex items-center gap-1 hover:text-emerald-800 transition-colors cursor-pointer group font-black"
                    >
                      <span>ISSUE DATE</span>
                      <SortIndicator columnKey="issueDate" sortConfig={sortConfig} />
                    </button>
                  </th>

                  {/* 5. EXPIRY DATE */}
                  <th className="py-3 px-3">
                    <button
                      onClick={() => handleSort('expiryDate')}
                      className="flex items-center gap-1 hover:text-emerald-800 transition-colors cursor-pointer group font-black"
                    >
                      <span>EXPIRY DATE</span>
                      <SortIndicator columnKey="expiryDate" sortConfig={sortConfig} />
                    </button>
                  </th>

                  {/* 6. ISSUED BY */}
                  <th className="py-3 px-3">
                    <button
                      onClick={() => handleSort('issuedBy')}
                      className="flex items-center gap-1 hover:text-emerald-800 transition-colors cursor-pointer group font-black"
                    >
                      <span>ISSUED BY</span>
                      <SortIndicator columnKey="issuedBy" sortConfig={sortConfig} />
                    </button>
                  </th>

                  {/* 7. STATUS */}
                  <th className="py-3 px-3">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-emerald-800 transition-colors cursor-pointer group font-black"
                    >
                      <span>STATUS</span>
                      <SortIndicator columnKey="status" sortConfig={sortConfig} />
                    </button>
                  </th>

                  <th className="py-3 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredAndSortedLetters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                      No matching liability letters found.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedLetters.map((row) => (
                    <tr key={row.id} className="table-row-hover">
                      {/* ID / Copy Link */}
                      <td className="py-3 px-3 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[95px] text-emerald-900 font-black bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/80 text-[11px]">
                            {row.id}
                          </span>
                          <button
                            onClick={() => handleCopyLink(row.id)}
                            title="Copy Link"
                            className="p-1 hover:bg-emerald-100 rounded-lg text-slate-400 hover:text-emerald-800 transition-all cursor-pointer"
                          >
                            {copiedId === row.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Bank Name */}
                      <td className="py-3 px-3 font-black text-slate-900 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center text-[9px] font-extrabold border border-emerald-200 shrink-0">
                            ▲
                          </div>
                          <span className="truncate max-w-[130px]">{row.bankName}</span>
                        </div>
                      </td>

                      {/* Account Number */}
                      <td className="py-3 px-3 font-mono">
                        <span className="bg-slate-100 text-slate-800 font-black px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                          {row.accountNumber}
                        </span>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3 px-3 font-bold text-slate-600 text-xs">
                        {new Date(row.issueDate).toLocaleDateString('en-US', {
                          month: 'numeric',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3 font-bold text-slate-600 text-xs">
                        {new Date(row.expiryDate).toLocaleDateString('en-US', {
                          month: 'numeric',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Issued By */}
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 rounded-lg font-black text-[10px] border border-amber-200">
                          <div className="w-3.5 h-3.5 rounded-full bg-amber-200 text-amber-900 text-[8px] font-black flex items-center justify-center uppercase">
                            {row.issuedBy?.username?.charAt(0)}
                          </div>
                          <span>{row.issuedBy?.username}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        {row.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100/90 text-emerald-800 border border-emerald-300/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-glow"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100/90 text-rose-800 border border-rose-300/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Expired
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDownloadPdf(row.id)}
                            title="Download PDF"
                            className="p-1.5 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 rounded-lg border border-slate-200 transition-all cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`/verify/${row.id}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Open Link"
                            className="p-1.5 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-all cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

// Column Sort Arrow Helper Component
const SortIndicator = ({ columnKey, sortConfig }) => {
  if (sortConfig.key !== columnKey) {
    return <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />;
  }
  return sortConfig.direction === 'asc' ? (
    <ArrowUp className="w-3 h-3 text-emerald-600 font-bold animate-bounce shrink-0" />
  ) : (
    <ArrowDown className="w-3 h-3 text-emerald-600 font-bold animate-bounce shrink-0" />
  );
};

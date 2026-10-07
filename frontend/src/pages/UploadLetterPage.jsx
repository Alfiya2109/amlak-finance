import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { UploadCloud, CheckCircle, FileText, AlertCircle, Building2, Calendar, Hash, Sparkles } from 'lucide-react';

export const UploadLetterPage = () => {
  const navigate = useNavigate();

  const [bankName, setBankName] = useState('Amlak Finance PJSC');
  const [accountNumber, setAccountNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError('');
    } else {
      setError('Please select a valid PDF document.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (accountNumber.length !== 12) {
      setError('Account Number must be exactly 12 alphanumeric characters (e.g. AF9876543210).');
      return;
    }
    if (!issueDate || !expiryDate) {
      setError('Please fill in all required letter details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('bankName', bankName);
      formData.append('accountNumber', accountNumber);
      formData.append('issueDate', issueDate);
      formData.append('expiryDate', expiryDate);
      if (file) {
        formData.append('file', file);
      }

      const res = await API.post('/letters/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess({
        message: 'Verifiable Liability Letter generated with QR Code successfully!',
        letterId: res.data.id,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2200);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired or unauthorized. Redirecting to Login page...');
        setTimeout(() => navigate('/login'), 1800);
      } else {
        setError(err.response?.data?.message || 'Failed to generate verifiable letter.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-100/70 p-3 sm:p-4 flex items-center justify-center overflow-hidden animate-fade-in-up">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-6 space-y-3.5 my-auto">
        
        {/* Compact Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-950 text-amber-300 flex items-center justify-center shrink-0 shadow-md">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              Generate Verifiable Letter
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </h1>
            <p className="text-[11px] text-slate-500 font-semibold">
              Upload a liability letter to embed a secure verification QR code.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 shadow-2xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold">{success.message}</p>
              <p className="text-[10px] text-emerald-600 font-bold">Redirecting to Dashboard...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Grid Row 1: Bank Name + Account Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" /> Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-emerald-700" /> Account Number
                </label>
                <span className={`text-[10px] font-bold font-mono ${accountNumber.length === 12 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {accountNumber.length}/12 Chars
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={12}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12))}
                placeholder="e.g. AF9876543210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none tracking-wider"
              />
            </div>
          </div>

          {/* Grid Row 2: Issue & Expiry Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Issue Date
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Expiry Date
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Compact PDF Dropzone */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">PDF Document</label>
            <div className="border-2 border-dashed border-emerald-200/80 bg-emerald-50/20 hover:bg-emerald-50/50 rounded-2xl py-4 px-5 text-center transition-all relative cursor-pointer group">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center gap-3">
                <UploadCloud className="w-7 h-7 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                {file ? (
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-900 bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{file.name}</span>
                    <span className="text-slate-400 font-medium">({file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`})</span>
                  </div>
                ) : (
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-700">
                      <span className="text-emerald-700 font-black">Upload a PDF file</span> or drag and drop
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400">PDF file up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 disabled:opacity-50 text-white font-black py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              {loading ? 'Generating PDF & Embedding QR Code...' : 'Generate & Embed QR'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

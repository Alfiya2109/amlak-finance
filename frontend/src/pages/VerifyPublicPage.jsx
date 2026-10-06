import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import { ShieldCheck, ShieldAlert, Building2, Calendar, Hash, Lock, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export const VerifyPublicPage = () => {
  const { id } = useParams();

  const [accountNumber, setAccountNumber] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (accountNumber.trim().length !== 12) {
      setError('Please enter a valid 12-character Account Number (e.g. AF9876543210).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await API.post(`/letters/verify/${id}`, {
        accountNumber: accountNumber.trim(),
      });

      if (!res.data.isAccountMatch) {
        setError(res.data.message || 'Entered account number does not match this liability letter record.');
        setData(null);
      } else {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Document verification failed or invalid QR code link.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden">
      
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-4 group">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-950 flex items-center justify-center font-bold text-amber-400 text-lg shadow-md border border-emerald-700/40">
          ▲
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none flex items-center gap-1">
            Verify<span className="text-emerald-600">Letter</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 opacity-80" />
          </span>
          <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
            Amlak Finance PJSC
          </span>
        </div>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-5 sm:p-6 space-y-4 relative overflow-hidden animate-in fade-in duration-300">
        
        {!data ? (
          /* STEP 1: ACCOUNT NUMBER PROMPT FORM */
          <div className="space-y-4">
            <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200/70 p-4 rounded-2xl space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-950 text-amber-400 flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Security Verification Required</h2>
              <p className="text-xs text-slate-600 font-medium leading-normal">
                Please enter the <strong>Account Number</strong> associated with this liability letter to reveal authenticity.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-extrabold text-slate-700">
                    Account Number
                  </label>
                  <span className={`text-[10px] font-bold font-mono ${accountNumber.length === 12 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {accountNumber.length}/12 Chars
                  </span>
                </div>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12))}
                    placeholder="e.g. AF9876543210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none tracking-wider transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !accountNumber.trim()}
                className="w-full bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {loading ? 'Verifying Account Number...' : 'Verify Document'}
              </button>
            </form>

            <div className="text-center text-[10px] font-semibold text-slate-400 pt-1">
              Official verification portal of Amlak Finance PJSC.
            </div>
          </div>
        ) : (
          /* STEP 2: VERIFICATION RESULT CARD */
          <div className="space-y-4">
            {/* Top Shield Status Banner */}
            <div className="text-center bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl space-y-2">
              <div
                className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border shadow-xs ${
                  data.isValid
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-600'
                    : 'bg-rose-100 border-rose-300 text-rose-600'
                }`}
              >
                {data.isValid ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
              </div>

              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {data.isValid ? 'Document Verified' : 'Document Expired / Invalid'}
                </h2>
                <p className="text-[10px] font-bold text-emerald-700 mt-0.5">Authentic Liability Letter Record</p>
              </div>

              <div className="inline-block">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide ${
                    data.isValid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  Status: {data.status}
                </span>
              </div>
            </div>

            {/* Letter Details */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Letter Details</h3>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
                {/* Bank Name */}
                <div className="col-span-2 flex items-center gap-2.5 border-b border-slate-200/60 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Bank Name</span>
                    <span className="text-xs font-black text-slate-900">{data.bankName}</span>
                  </div>
                </div>

                {/* Account Number */}
                <div className="col-span-2 flex items-center gap-2.5 border-b border-slate-200/60 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60">
                    <Hash className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Account Number</span>
                    <span className="text-xs font-mono font-black text-slate-900">{data.accountNumber}</span>
                  </div>
                </div>

                {/* Issue Date */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Issue Date</span>
                    <span className="text-[11px] font-bold text-slate-800">
                      {new Date(data.issueDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Expiry Date</span>
                    <span className="text-[11px] font-bold text-slate-800">
                      {new Date(data.expiryDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setData(null);
                setAccountNumber('');
                setError(null);
              }}
              className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 py-1 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Verify Another Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

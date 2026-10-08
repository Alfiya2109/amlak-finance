import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import { ShieldCheck, Lock, User, KeyRound, Smartphone, ArrowLeft, QrCode, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  const [step, setStep] = useState(1); // 1: Username/Password, 2: 2FA TOTP Code
  const [username, setUsername] = useState('admin2');
  const [password, setPassword] = useState('Admin@123');
  const [totpCode, setTotpCode] = useState('');
  const [showQr, setShowQr] = useState(false);

  const [tempData, setTempData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Initial Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { username, password });
      
      if (res.data.require2FA) {
        setTempData(res.data);
        setShowQr(false); // Ensure QR Scanner is hidden by default during login
        setStep(2); // Move to 2FA verification step
      } else {
        loginSuccess(res.data.accessToken, res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: 2FA TOTP Verification Submit
  const handleVerify2FA = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/verify-2fa', {
        userId: tempData.userId,
        code: totpCode,
        tempToken: tempData.tempToken,
      });

      loginSuccess(res.data.accessToken, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid 6-digit code. Please check Microsoft Authenticator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-100/90 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden animate-in fade-in duration-300">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 px-5 py-5 text-center text-white relative">
          <div className="w-12 h-12 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center mx-auto mb-2 backdrop-blur-md shadow-inner">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight">Amlak Finance PJSC</h1>
          <p className="text-emerald-200/80 text-[10px] font-medium mt-0.5">VerifyLetter — Secure Liability Verification Portal</p>
        </div>

        <div className="p-4 sm:p-5 space-y-3.5">

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username (e.g. admin2)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {loading ? 'Authenticating...' : 'Sign In to VerifyLetter'}
                </button>
              </div>

              {/* Quick Credentials Card */}
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 space-y-1">
                <p className="font-extrabold text-slate-800 text-[11px]">Quick Test Credentials:</p>
                <div className="flex justify-between items-center text-[11px] font-medium">
                  <span>Admin: <strong className="text-emerald-800 font-bold">admin2</strong> / Admin@123</span>
                  <span>User: <strong className="text-emerald-800 font-bold">staff1</strong> / User@123</span>
                </div>
              </div>
            </form>
          ) : (
            /* STEP 2: MICROSOFT AUTHENTICATOR 2FA CODE SCREEN (CLEAN, NO DEFAULT SCANNER) */
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="text-center bg-emerald-50/70 border border-emerald-200/70 p-3.5 rounded-2xl space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-950 font-extrabold text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  2-Step Verification
                </div>
                <p className="text-[11px] text-emerald-800 font-medium">
                  Enter 6-digit code from Microsoft Authenticator for <strong className="font-extrabold">{username}</strong>
                </p>
              </div>

              {/* 6-Digit Code Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 text-center">
                  Enter 6-Digit Code
                </label>
                <div className="relative max-w-[200px] mx-auto">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-center tracking-widest font-mono text-base font-extrabold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              {/* Verify Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="w-full bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Verifying Code...' : 'Verify Code & Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Username & Password
                </button>
              </div>

              {/* Optional QR Code Toggle Link (Hidden by default) */}
              {tempData?.qrCodeImageDataUrl && (
                <div className="text-center pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {showQr ? 'Hide Setup QR Code' : 'First-time phone setup? Show QR Code'}
                  </button>

                  {showQr && (
                    <div className="mt-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2 max-w-[240px] mx-auto animate-in fade-in duration-200">
                      <p className="text-[10px] text-slate-600 font-semibold">
                        Scan QR in <strong>Microsoft Authenticator</strong> app:
                      </p>
                      {tempData.twoFactorSecret ? (
                        <div className="flex justify-center p-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs w-fit mx-auto">
                          <QRCodeSVG 
                            value={`otpauth://totp/AmlakFinance:${username}?secret=${tempData.twoFactorSecret}&issuer=AmlakFinance`} 
                            size={100}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                      ) : (
                        <img
                          src={tempData.qrCodeImageDataUrl}
                          alt="Microsoft Authenticator QR"
                          className="w-24 h-24 mx-auto border border-slate-200 rounded-xl shadow-2xs"
                        />
                      )}
                      {tempData.twoFactorSecret && (
                        <p className="text-[9px] font-mono text-slate-600 bg-white p-1 rounded border border-slate-200 truncate">
                          Key: {tempData.twoFactorSecret}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

            </form>
          )}

        </div>
      </div>
    </div>
  );
};

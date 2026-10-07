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

  const handleFillLiveCode = () => {
    if (tempData?.currentTotpCode) {
      setTotpCode(tempData.currentTotpCode);
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
            /* STEP 2: MICROSOFT AUTHENTICATOR 2FA SCREEN */
            <form onSubmit={handleVerify2FA} className="space-y-3.5">
              <div className="text-center bg-blue-50/70 border border-blue-200/70 p-3 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-center gap-1.5 text-blue-900 font-extrabold text-xs">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  Microsoft Authenticator 2FA
                </div>
                <p className="text-[11px] text-blue-800 font-medium">
                  Enter 6-digit code for <strong className="font-extrabold">{username}</strong>
                </p>

                {/* QR Code Setup Toggle */}
                {tempData?.qrCodeImageDataUrl && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowQr(!showQr)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      {showQr ? 'Hide Microsoft QR Code' : 'Scan Phone QR Code'}
                    </button>

                    {showQr && (
                      <div className="mt-2 bg-white p-2 rounded-xl border border-blue-200 shadow-2xs space-y-1.5">
                        <p className="text-[10px] text-slate-600 font-medium">
                          Scan QR in <strong>Microsoft Authenticator</strong> app:
                        </p>
                        {tempData.twoFactorSecret ? (
                          <div className="flex justify-center p-1 bg-white border border-slate-200 rounded-lg shadow-2xs w-fit mx-auto">
                            <QRCodeSVG 
                              value={`otpauth://totp/AmlakFinance:${username}?secret=${tempData.twoFactorSecret}&issuer=AmlakFinance`} 
                              size={96}
                              level="M"
                              includeMargin={false}
                            />
                          </div>
                        ) : (
                          <img
                            src={tempData.qrCodeImageDataUrl}
                            alt="Microsoft Authenticator QR"
                            className="w-24 h-24 mx-auto border border-slate-200 rounded-lg shadow-2xs"
                          />
                        )}
                        {tempData.twoFactorSecret && (
                          <p className="text-[10px] font-mono text-slate-600 bg-slate-50 p-1 rounded border border-slate-200 truncate">
                            Key: {tempData.twoFactorSecret}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 6-Digit Code Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                  6-Digit Security Code
                </label>
                <div className="relative max-w-[180px] mx-auto">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="406017"
                    className="w-full pl-9 pr-3 py-2 text-center tracking-widest font-mono text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="w-full bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Verifying Code...' : 'Verify & Continue'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};

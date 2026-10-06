import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { UserPlus, Check, X, Shield, ArrowLeft, Smartphone, KeyRound, Lock, User } from 'lucide-react';

export const CreateUserPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');

  const [createdUserData, setCreatedUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Live password validation checks
  const passReqs = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passReqs).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a valid username.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password Security Check Failed! Please fulfill all 5 security requirements highlighted below before creating account.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/create-user', {
        username,
        password,
        role,
      });

      setCreatedUserData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen bg-slate-100/70 p-3 sm:p-4 md:p-6 flex items-center justify-center overflow-hidden">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
        
        {/* Header Icon */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Create System User</h1>
            <p className="text-xs text-slate-500 font-medium">Register a new verified operator or administrator.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <X className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {createdUserData ? (
          /* SUCCESS & MICROSOFT AUTHENTICATOR SETUP CARD */
          <div className="space-y-4 text-center">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 shadow-2xs">
              <p className="font-black text-sm text-emerald-950 mb-0.5">User Account Created! 🎉</p>
              <p className="font-semibold text-xs">
                Username: <strong className="text-emerald-800">{createdUserData.user.username}</strong> ({createdUserData.user.role})
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                <Smartphone className="w-4 h-4 text-blue-600" />
                Microsoft Authenticator 2FA Setup
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Scan QR code with Microsoft Authenticator app on your phone:
              </p>
              
              {createdUserData.qrCodeImageDataUrl && (
                <img
                  src={createdUserData.qrCodeImageDataUrl}
                  alt="Microsoft Authenticator QR Code"
                  className="w-32 h-32 mx-auto border-4 border-white shadow-xs rounded-xl"
                />
              )}

              <p className="text-[10px] font-mono text-slate-500 bg-white p-1.5 rounded-lg border border-slate-200 break-all font-semibold max-w-sm mx-auto">
                Secret: {createdUserData.twoFactorSecret}
              </p>
            </div>

            <button
              onClick={() => {
                setCreatedUserData(null);
                setUsername('');
                setPassword('');
              }}
              className="w-full bg-gradient-to-r from-emerald-800 to-teal-900 text-white text-xs font-extrabold py-2.5 rounded-xl shadow-sm hover:from-emerald-900 hover:to-teal-950 transition-all cursor-pointer"
            >
              Create Another User Account
            </button>
          </div>
        ) : (
          /* FORM - 2 COLUMN COMPACT GRID */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Username */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin2"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Role Type */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Role Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:outline-none cursor-pointer"
                >
                  <option value="USER">User (Upload & Dashboard)</option>
                  <option value="ADMIN">Admin (Full System Access)</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Password Requirements Grid */}
            <div className="bg-slate-50/90 border border-slate-200/80 p-3 rounded-2xl text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-slate-800 text-[11px]">Live Security Verification:</p>
                <span className={`text-[10px] font-bold ${isPasswordValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {Object.values(passReqs).filter(Boolean).length}/5 Met
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <ReqItem met={passReqs.length} text="8+ characters" hasStarted={password.length > 0} />
                <ReqItem met={passReqs.uppercase} text="Uppercase letter" hasStarted={password.length > 0} />
                <ReqItem met={passReqs.lowercase} text="Lowercase letter" hasStarted={password.length > 0} />
                <ReqItem met={passReqs.number} text="Numeric digit" hasStarted={password.length > 0} />
                <ReqItem met={passReqs.special} text="Special character" hasStarted={password.length > 0} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 disabled:opacity-50 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 bg-white hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs border border-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

const ReqItem = ({ met, text, hasStarted }) => {
  let colorClass = 'text-slate-400';
  if (met) {
    colorClass = 'text-emerald-700 font-extrabold';
  } else if (hasStarted) {
    colorClass = 'text-rose-600 font-bold';
  }

  return (
    <div className={`flex items-center gap-1.5 transition-colors ${colorClass}`}>
      {met ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
      ) : (
        <X className={`w-3.5 h-3.5 shrink-0 ${hasStarted ? 'text-rose-600 stroke-[2.5]' : 'text-slate-400'}`} />
      )}
      <span>{text}</span>
    </div>
  );
};

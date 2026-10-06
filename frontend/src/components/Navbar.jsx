import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, LayoutDashboard, UserPlus, LogOut, ShieldCheck, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-950 flex items-center justify-center font-bold text-amber-400 text-lg shadow-sm border border-emerald-700/40 group-hover:scale-105 transition-transform">
            ▲
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none flex items-center gap-1">
              Verify<span className="text-emerald-600">Letter</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 opacity-80" />
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mt-0.5">
              Amlak Finance PJSC
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <Link
            to="/upload"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isActive('/upload')
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <UploadCloud className={`w-4 h-4 ${isActive('/upload') ? 'text-emerald-600' : 'text-slate-400'}`} />
            Upload Letter
          </Link>

          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isActive('/dashboard')
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${isActive('/dashboard') ? 'text-emerald-600' : 'text-slate-400'}`} />
            Dashboard
          </Link>

          {isAdmin && (
            <Link
              to="/create-user"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive('/create-user')
                  ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserPlus className={`w-4 h-4 ${isActive('/create-user') ? 'text-emerald-600' : 'text-slate-400'}`} />
              Create User
            </Link>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50/80 border border-emerald-200/60 rounded-full text-xs font-semibold text-emerald-950">
            <div className="w-6 h-6 rounded-full bg-emerald-800 text-amber-300 font-bold text-[11px] flex items-center justify-center uppercase shadow-2xs">
              {user.username.charAt(0)}
            </div>
            <span>{user.username}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/60 text-emerald-800 px-1.5 py-0.5 rounded-md">
              {user.role}
            </span>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
};

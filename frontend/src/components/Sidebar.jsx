import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UploadCloud,
  LayoutDashboard,
  UserPlus,
  LogOut,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const Sidebar = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return children;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen overflow-hidden bg-slate-100/90 flex flex-col md:flex-row">
      
      {/* LEFT SIDEBAR NAVBAR - Compact Width (w-56) */}
      <aside className="w-full md:w-56 bg-slate-900 text-white flex-shrink-0 flex flex-col justify-between border-r border-slate-800 shadow-xl z-40 sticky top-0 md:h-screen">
        
        {/* TOP BRAND SECTION */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 space-y-3">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-bold text-amber-300 text-lg shadow-lg border border-emerald-500/40 group-hover:scale-105 transition-transform">
              ▲
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white tracking-tight leading-none flex items-center gap-1">
                Verify<span className="text-emerald-400">Letter</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              </span>
              <span className="text-[9px] font-bold text-emerald-300/80 tracking-widest uppercase mt-0.5">
                Amlak Finance PJSC
              </span>
            </div>
          </Link>

          {/* System Badge */}
          <div className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-xl flex items-center justify-between text-[10px] font-semibold text-emerald-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              System Live
            </span>
            <span className="text-[9px] bg-emerald-900/80 px-1.5 py-0.5 rounded font-mono font-bold text-amber-300">
              v2.4
            </span>
          </div>
        </div>

        {/* MIDDLE NAVIGATION MENU */}
        <div className="p-3 flex-1 space-y-5 overflow-y-auto">
          
          <div>
            <p className="px-2 text-[9px] font-black text-slate-500 tracking-widest uppercase mb-1.5">
              Main Menu
            </p>
            <nav className="space-y-1">
              {/* Dashboard */}
              <Link
                to="/dashboard"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all group ${
                  isActive('/dashboard')
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-500/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className={`w-4 h-4 ${isActive('/dashboard') ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                  <span>Dashboard</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive('/dashboard') ? 'opacity-100 translate-x-0.5' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </Link>

              {/* Upload Letter */}
              <Link
                to="/upload"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all group ${
                  isActive('/upload')
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-500/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UploadCloud className={`w-4 h-4 ${isActive('/upload') ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                  <span>Upload Letter</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive('/upload') ? 'opacity-100 translate-x-0.5' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </Link>

              {/* Create User (Admin Only) */}
              {isAdmin && (
                <Link
                  to="/create-user"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all group ${
                    isActive('/create-user')
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-500/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserPlus className={`w-4 h-4 ${isActive('/create-user') ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                    <span>Create User</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive('/create-user') ? 'opacity-100 translate-x-0.5' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </Link>
              )}
            </nav>
          </div>

          <div>
            <p className="px-2 text-[9px] font-black text-slate-500 tracking-widest uppercase mb-1.5">
              Public Portal
            </p>
            <a
              href="/verify/sample"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all group"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Verify Portal</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
            </a>
          </div>

        </div>

        {/* BOTTOM USER PROFILE CARD */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs flex items-center justify-center shadow-md uppercase border border-emerald-400/40">
                {user.username.charAt(0)}
              </div>
              <div>
                <span className="block text-xs font-extrabold text-white truncate max-w-[85px]">
                  {user.username}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-900/80 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-700/60">
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Logout System"
              className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-500/40"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-x-hidden min-w-0">
        {children}
      </main>

    </div>
  );
};

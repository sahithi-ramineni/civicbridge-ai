import React from 'react';
import {
  ShieldAlert,
  Sparkles,
  Users,
  Building2,
  GraduationCap,
  Landmark,
  Bell,
  LogOut,
  LogIn,
  PlusCircle,
  PlayCircle
} from 'lucide-react';
import { User, UserRole } from '../types';

interface NavbarProps {
  currentUser: User | null;
  currentRole: UserRole | 'guest';
  onSelectRole: (role: UserRole) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenReport: () => void;
  onOpenNotifications: () => void;
  onOpenDemoScenarios: () => void;
  unreadNotificationsCount: number;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRole,
  onSelectRole,
  onOpenAuth,
  onLogout,
  onOpenReport,
  onOpenNotifications,
  onOpenDemoScenarios,
  unreadNotificationsCount,
  currentView,
  onNavigate
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top SIH Judge Demo Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/30 tracking-wide uppercase text-[10px]">
            SIH 2026 • SIH26043
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            Smart India Hackathon Prototype: Crowdsourcing & Collaborative Problem Solving
          </span>
        </div>

        {/* 1-Click Judge Role Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] font-medium mr-1 hidden md:inline">Judge Demo Switcher:</span>
          
          <button
            id="demo-btn-citizen"
            onClick={() => onSelectRole('citizen')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
              currentRole === 'citizen'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Users className="w-3 h-3 text-blue-400" />
            <span>Citizen</span>
          </button>

          <button
            id="demo-btn-university"
            onClick={() => onSelectRole('university')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
              currentRole === 'university'
                ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <GraduationCap className="w-3 h-3 text-purple-400" />
            <span>University</span>
          </button>

          <button
            id="demo-btn-industry"
            onClick={() => onSelectRole('industry')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
              currentRole === 'industry'
                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Building2 className="w-3 h-3 text-amber-400" />
            <span>Industry</span>
          </button>

          <button
            id="demo-btn-government"
            onClick={() => onSelectRole('government')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
              currentRole === 'government'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Landmark className="w-3 h-3 text-emerald-400" />
            <span>Government</span>
          </button>

          <button
            id="demo-btn-scenarios"
            onClick={onOpenDemoScenarios}
            className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-semibold px-2.5 py-1 rounded flex items-center gap-1 text-xs shadow"
          >
            <PlayCircle className="w-3 h-3" />
            <span>Guided Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-blue-400/30">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">Civic<span className="text-blue-400">Solve</span></span>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-blue-500/30 uppercase">
                AI Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-normal hidden sm:block">
              Jharkhand Civic Crowdsourcing & Innovation Grid
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            id="nav-link-home"
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentView === 'landing' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Home
          </button>

          {currentUser && (
            <button
              id="nav-link-dashboard"
              onClick={() => onNavigate(currentUser.role)}
              className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
                currentView === currentUser.role ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {currentUser.role} Portal
            </button>
          )}

          <button
            id="nav-link-explore"
            onClick={() => onNavigate('explore')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentView === 'explore' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            All Challenges
          </button>

          <button
            id="nav-link-analytics"
            onClick={() => onNavigate('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentView === 'analytics' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            State Analytics
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* AI Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-full text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-[11px]">Gemini 3.8 Flash Live</span>
          </div>

          {/* Report Problem Quick CTA */}
          <button
            id="nav-btn-report-problem"
            onClick={onOpenReport}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-3.5 py-2 rounded-lg text-xs md:text-sm flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report a Problem</span>
          </button>

          {/* Notifications */}
          <button
            id="nav-btn-notifications"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="View Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-blue-400 capitalize font-medium">{currentUser.role}</div>
              </div>
              <button
                id="nav-btn-logout"
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="nav-btn-login"
              onClick={onOpenAuth}
              className="border border-slate-700 hover:bg-slate-800 text-slate-200 font-medium px-3 py-1.5 rounded-lg text-xs md:text-sm flex items-center gap-1.5 transition-colors"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

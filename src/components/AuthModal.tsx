import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Building2,
  Landmark,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { User, UserRole } from '../types';
import { loginUser, registerUser } from '../utils/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('citizen');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [district, setDistrict] = useState<string>('Ranchi');
  const [mandal, setMandal] = useState<string>('Ormanjhi');
  const [village, setVillage] = useState<string>('Ormanjhi');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // 1-Click Demo Login
  const handleDemoLogin = async (selectedRole: UserRole) => {
    setLoading(true);
    try {
      const res = await loginUser({ role: selectedRole, isDemo: true });
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      console.error('Demo login error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await loginUser({ email, password, role });
        onLoginSuccess(res.user);
      } else {
        const res = await registerUser({
          name,
          email,
          mobile,
          role,
          district,
          mandal,
          village
        });
        onLoginSuccess(res.user);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'login' ? 'Sign In to CivicSolve' : 'Citizen Registration'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Access role-based portals or use instant judge demo accounts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 font-semibold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-300">
          {/* Quick Demo Logins Bar */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant SIH Judge Demo Accounts (1-Click)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('citizen')}
                className="p-2.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-left transition-colors"
              >
                <div className="font-bold text-blue-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Citizen
                </div>
                <div className="text-[10px] text-slate-400">Sunita Devi (Ormanjhi)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('university')}
                className="p-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-left transition-colors"
              >
                <div className="font-bold text-purple-300 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" /> University
                </div>
                <div className="text-[10px] text-slate-400">Prof. A.K. Sharma (BIT)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('industry')}
                className="p-2.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 text-left transition-colors"
              >
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Industry
                </div>
                <div className="text-[10px] text-slate-400">Er. V. Sengupta (TSRDS)</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('government')}
                className="p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-left transition-colors"
              >
                <div className="font-bold text-emerald-300 flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5" /> Government
                </div>
                <div className="text-[10px] text-slate-400">R.K. Choudhary, IAS</div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-widest absolute">
              Or Custom Sign In
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleManualAuth} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@jharkhand.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mandal / Block</label>
                  <input
                    type="text"
                    value={mandal}
                    onChange={(e) => setMandal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow mt-2"
            >
              {mode === 'login' ? 'Sign In' : 'Create Citizen Account'}
            </button>
          </form>

          <div className="text-center pt-2">
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-blue-400 hover:underline"
              >
                New citizen? Register here
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-400 hover:underline"
              >
                Already have an account? Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, Activity, Server, Radio } from 'lucide-react';
import { AuthUser } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Silakan masukkan alamat email pengguna.');
      return;
    }

    if (!password) {
      setError('Silakan masukkan kata sandi keamanan Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Allow authentication for jws_adminproject_123 or any entered password credentials
      if (password === 'jws_adminproject_123' || password.length > 0) {
        const username = email.split('@')[0] || 'Administrator';
        const formattedName = username
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        const loggedUser: AuthUser = {
          email: email.trim().toLowerCase(),
          name: formattedName,
          role: 'Gov Project Controller & Supervisor',
          department: 'Divisi Pengawasan Infrastruktur SJUT & Utilitas JWS',
          lastLogin: new Date().toISOString()
        };

        setIsLoading(false);
        onLoginSuccess(loggedUser);
      } else {
        setIsLoading(false);
        setError('Otentikasi gagal: Silakan masukkan kata sandi Anda.');
      }
    }, 450);
  };

  return (
    <div className="min-h-screen w-full bg-[#050811] cyber-grid flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Futuristic Ambient Neon Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 neon-border-cyan finger-click">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Jendela <span className="text-cyan-400 font-extrabold tracking-wider">Wahana</span> Solusi
            </h1>
            <p className="text-xs text-slate-400 font-mono">Monitoring & Controlling Center</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            NODE REALTIME READY
          </span>
          <span className="text-slate-600">|</span>
          <span>SECURE PROTOCOL v2.6</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-6">
        <div className="relative rounded-2xl bg-[#0b1122]/90 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-cyan-950/40 p-6 sm:p-8 overflow-hidden group">
          {/* Neon accent top line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-400 via-purple-500 to-cyan-400" />
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />

          {/* Heading */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              SISTEM OTENTIKASI RESMI
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Portal Akses Proyek JWS
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              © copyright PAUL
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-start gap-2.5 neon-glow-red">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                Alamat Email Pengguna
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e162d] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                Kata Sandi Keamanan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="w-full pl-10 pr-11 py-2.5 bg-[#0e162d] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-400 transition-colors finger-click"
                  title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 px-4 rounded-xl font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 finger-click cursor-pointer border border-cyan-400/30"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengautentikasi...</span>
                </div>
              ) : (
                <>
                  <span>Masuk ke Dashboard Sistem</span>
                  <ArrowRight className="w-4 h-4 text-cyan-200" />
                </>
              )}
            </button>
          </form>

          {/* Footer badge */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Sistem Aktif & Terlindungi
            </span>
            <span className="font-mono text-slate-400">JWS Gov Platform</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar Info */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center text-center text-xs text-slate-400 font-mono gap-2 z-10 py-2 border-t border-slate-900/60">
        <div>
          © 2026 JWS Monitoring & Controlling Infrastructure System
        </div>
      </div>
    </div>
  );
};

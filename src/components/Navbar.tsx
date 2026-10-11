import React from 'react';
import { Radio, RefreshCw, LogOut, Clock, Download } from 'lucide-react';
import { AuthUser } from '../types';

interface NavbarProps {
  user: AuthUser;
  onLogout: () => void;
  onRefreshData: () => void;
  onExportData: () => void;
  lastSyncTime: string;
  isRealtimeActive: boolean;
  onToggleRealtime: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onRefreshData,
  onExportData,
  lastSyncTime,
  isRealtimeActive,
  onToggleRealtime
}) => {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '10:00:00';
    }
  };

  return (
    <header className="h-16 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-purple-600 to-red-500 flex items-center justify-center shadow-md shadow-cyan-500/20 neon-border-cyan finger-click">
          <Radio className="w-4 h-4 text-white animate-pulse" />
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          JWS <span className="text-cyan-400">Gov</span> Monitoring
        </span>
      </div>

      {/* Zone 2: Realtime telemetry & sync status controls */}
      <div className="hidden md:flex items-center gap-3 text-xs font-mono">
        <button
          onClick={onToggleRealtime}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all finger-click ${
            isRealtimeActive
              ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-300 neon-glow-cyan'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Klik untuk toggle sinkronisasi data real-time"
        >
          <span className={`w-2 h-2 rounded-full ${isRealtimeActive ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
          <span className="font-semibold whitespace-nowrap">
            {isRealtimeActive ? 'REALTIME LIVE' : 'REALTIME PAUSED'}
          </span>
        </button>

        <div className="flex items-center gap-2 text-slate-400 px-2 py-1 rounded bg-slate-900/60 border border-slate-800/60">
          <Clock className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-[11px] whitespace-nowrap">Sync: {formatTime(lastSyncTime)} WIB</span>
        </div>

        <button
          onClick={onRefreshData}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-700/60 transition-colors finger-click"
          title="Perbarui data segera"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span className="whitespace-nowrap">Segarkan</span>
        </button>

        <button
          onClick={onExportData}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-300 hover:border-purple-700/60 transition-colors finger-click"
          title="Ekspor database cadangan JSON"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span className="whitespace-nowrap">Backup Data</span>
        </button>
      </div>

      {/* Zone 3: 1 primary action / User profile & logout */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-white truncate max-w-[150px]">
            {user.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
            {user.email}
          </span>
        </div>

        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 border border-cyan-400/50 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-purple-500/30">
          {user.name.charAt(0)}
        </div>

        <button
          onClick={onLogout}
          className="p-2 rounded-lg bg-red-950/40 border border-red-800/50 text-red-400 hover:bg-red-900/60 hover:text-red-200 transition-colors finger-click"
          title="Keluar dari sistem"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

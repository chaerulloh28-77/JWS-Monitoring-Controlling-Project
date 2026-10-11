import React, { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  HardHat,
  MapPin,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Rows3,
  ListPlus,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Shield,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab, group?: 'GOV' | 'INTERNAL' | 'ALL') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  projectCount: number;
  constructionCount: number;
  onOpenNewProject?: () => void;
  onOpenNewConstruction?: () => void;
  projectGroupFilter?: 'GOV' | 'INTERNAL' | 'ALL';
  constructionGroupFilter?: 'GOV' | 'INTERNAL' | 'ALL';
  gisGroupFilter?: 'GOV' | 'INTERNAL' | 'ALL';
  analyticsGroupFilter?: 'GOV' | 'INTERNAL' | 'ALL';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  projectCount,
  constructionCount,
  onOpenNewProject,
  onOpenNewConstruction,
  projectGroupFilter = 'GOV',
  constructionGroupFilter = 'GOV',
  gisGroupFilter = 'GOV',
  analyticsGroupFilter = 'GOV'
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    projects: true,
    construction: true,
    gis_map: true,
    analytics: true
  });

  const toggleSection = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className={`bg-[#05040d]/90 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between transition-all duration-200 z-20 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      <div>
        {/* Top Branding */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="neon-icon size-8" style={{ '--glow': '#00e5ff' } as React.CSSProperties}>
                <Cpu className="size-4 text-[#00e5ff] animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                  JWS Command Center
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Monitoring & Controlling</div>
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className={`icon-btn ${isCollapsed ? 'mx-auto' : ''}`}
            title={isCollapsed ? 'Perlebar Sidebar' : 'Kecilkan Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {/* 1. Dashboard Overview */}
          <button
            onClick={() => onTabChange('overview')}
            className={`w-full text-left flex items-center rounded-xl p-2.5 transition-all finger-click relative ${
              activeTab === 'overview'
                ? 'bg-white/[0.06] border border-[#00e5ff]/50 text-white shadow-lg shadow-[#00e5ff]/15'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
            }`}
            title="Dashboard Overview"
          >
            <div
              className="neon-icon size-9 shrink-0"
              style={{ '--glow': '#00e5ff' } as React.CSSProperties}
            >
              <LayoutDashboard className="size-4 text-[#00e5ff]" />
            </div>
            {!isCollapsed && (
              <div className="ml-3 flex-1 overflow-hidden">
                <span className="text-xs font-bold tracking-wide text-white block">
                  Dashboard
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Monitoring Realtime
                </span>
              </div>
            )}
          </button>

          {/* 2. Project List with Submenus */}
          <div className="space-y-1">
            <div
              className={`w-full flex items-center justify-between rounded-xl p-2.5 transition-all relative ${
                activeTab === 'projects'
                  ? 'bg-white/[0.06] border border-[#ff2bd6]/50 text-white shadow-lg shadow-[#ff2bd6]/15'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <button
                type="button"
                onClick={() => onTabChange('projects')}
                className="flex items-center flex-1 text-left min-w-0 finger-click"
                title="Buka Project List"
              >
                <div
                  className="neon-icon size-9 shrink-0"
                  style={{ '--glow': '#ff2bd6' } as React.CSSProperties}
                >
                  <ClipboardList className="size-4 text-[#ff2bd6]" />
                </div>
                {!isCollapsed && (
                  <div className="ml-3 flex-1 overflow-hidden">
                    <span className="text-xs font-bold tracking-wide text-white block">
                      Project List
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {projectCount} Paket Trase
                    </span>
                  </div>
                )}
              </button>
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={(e) => toggleSection('projects', e)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  title={openSections.projects ? 'Tutup Submenu' : 'Buka Submenu'}
                >
                  {openSections.projects ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
              )}
            </div>

            {/* Submenu Project List */}
            {!isCollapsed && openSections.projects && (
              <div className="pl-6 pr-2 space-y-1">
                <button
                  type="button"
                  onClick={() => onTabChange('projects', 'GOV')}
                  className={`w-full text-left flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors finger-click ${
                    activeTab === 'projects' && projectGroupFilter === 'GOV'
                      ? 'bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <Building2 className="size-3.5 text-cyan-400" />
                  <span>1. Project GOV</span>
                </button>
                <button
                  type="button"
                  onClick={() => onTabChange('projects', 'INTERNAL')}
                  className={`w-full text-left flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors finger-click ${
                    activeTab === 'projects' && projectGroupFilter === 'INTERNAL'
                      ? 'bg-indigo-950/80 border border-indigo-500/60 text-indigo-300 font-bold'
                      : 'text-slate-400 hover:text-indigo-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <ShieldCheck className="size-3.5 text-indigo-400" />
                  <span>2. Project Internal</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Construction & Plan with Submenus */}
          <div className="space-y-1">
            <div
              className={`w-full flex items-center justify-between rounded-xl p-2.5 transition-all relative ${
                activeTab === 'construction'
                  ? 'bg-white/[0.06] border border-[#ff9f1c]/50 text-white shadow-lg shadow-[#ff9f1c]/15'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <button
                type="button"
                onClick={() => onTabChange('construction')}
                className="flex items-center flex-1 text-left min-w-0 finger-click"
                title="Buka Construction"
              >
                <div
                  className="neon-icon size-9 shrink-0"
                  style={{ '--glow': '#ff9f1c' } as React.CSSProperties}
                >
                  <HardHat className="size-4 text-[#ff9f1c]" />
                </div>
                {!isCollapsed && (
                  <div className="ml-3 flex-1 overflow-hidden">
                    <span className="text-xs font-bold tracking-wide text-white block">
                      Construction
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {constructionCount} Rencana & Lapangan
                    </span>
                  </div>
                )}
              </button>
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={(e) => toggleSection('construction', e)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  title={openSections.construction ? 'Tutup Submenu' : 'Buka Submenu'}
                >
                  {openSections.construction ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
              )}
            </div>

            {/* Submenu Construction */}
            {!isCollapsed && openSections.construction && (
              <div className="pl-6 pr-2 space-y-1">
                <button
                  type="button"
                  onClick={() => onTabChange('construction', 'GOV')}
                  className={`w-full text-left flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors finger-click ${
                    activeTab === 'construction' && constructionGroupFilter === 'GOV'
                      ? 'bg-orange-950/80 border border-orange-500/60 text-orange-300 font-bold'
                      : 'text-slate-400 hover:text-orange-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <Building2 className="size-3.5 text-orange-400" />
                  <span>1. Construction GOV</span>
                </button>
                <button
                  type="button"
                  onClick={() => onTabChange('construction', 'INTERNAL')}
                  className={`w-full text-left flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors finger-click ${
                    activeTab === 'construction' && constructionGroupFilter === 'INTERNAL'
                      ? 'bg-indigo-950/80 border border-indigo-500/60 text-indigo-300 font-bold'
                      : 'text-slate-400 hover:text-indigo-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <ShieldCheck className="size-3.5 text-indigo-400" />
                  <span>2. Construction Internal</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. GIS & Peta Trase */}
          <div className="space-y-1">
            <div
              className={`w-full flex items-center justify-between rounded-xl p-2.5 transition-all relative ${
                activeTab === 'gis_map'
                  ? 'bg-white/[0.06] border border-[#ffe14d]/50 text-white shadow-lg shadow-[#ffe14d]/15'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <button
                type="button"
                onClick={() => onTabChange('gis_map')}
                className="flex items-center flex-1 text-left min-w-0 finger-click"
                title="Buka GIS & Peta Trase"
              >
                <div
                  className="neon-icon size-9 shrink-0"
                  style={{ '--glow': '#ffe14d' } as React.CSSProperties}
                >
                  <MapPin className="size-4 text-[#ffe14d]" />
                </div>
                {!isCollapsed && (
                  <div className="ml-3 flex-1 overflow-hidden">
                    <span className="text-xs font-bold tracking-wide text-white block">
                      GIS & Peta Trase
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Visualisasi Jalur Relokasi
                    </span>
                  </div>
                )}
              </button>
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={(e) => toggleSection('gis_map', e)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  title={openSections.gis_map ? 'Tutup Submenu' : 'Buka Submenu'}
                >
                  {openSections.gis_map ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
              )}
            </div>

            {/* Submenu GIS & Peta */}
            {!isCollapsed && openSections.gis_map && (
              <div className="pl-6 pr-2 space-y-1">
                <button
                  type="button"
                  onClick={() => onTabChange('gis_map', 'GOV')}
                  className={`w-full text-left flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors finger-click ${
                    activeTab === 'gis_map' && gisGroupFilter === 'GOV'
                      ? 'bg-yellow-950/80 border border-yellow-500/60 text-yellow-300 font-bold'
                      : 'text-slate-400 hover:text-yellow-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <Building2 className="size-3.5 text-yellow-400" />
                  <span>1. GIS & Peta GOV</span>
                </button>
                <button
                  type="button"
                  onClick={() => onTabChange('gis_map', 'INTERNAL')}
                  className={`w-full text-left flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors finger-click ${
                    activeTab === 'gis_map' && gisGroupFilter === 'INTERNAL'
                      ? 'bg-indigo-950/80 border border-indigo-500/60 text-indigo-300 font-bold'
                      : 'text-slate-400 hover:text-indigo-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <ShieldCheck className="size-3.5 text-indigo-400" />
                  <span>2. GIS & Peta Internal</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. Analisis & Control */}
          <div className="space-y-1">
            <div
              className={`w-full flex items-center justify-between rounded-xl p-2.5 transition-all relative ${
                activeTab === 'analytics'
                  ? 'bg-white/[0.06] border border-[#ff3b5c]/50 text-white shadow-lg shadow-[#ff3b5c]/15'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <button
                type="button"
                onClick={() => onTabChange('analytics')}
                className="flex items-center flex-1 text-left min-w-0 finger-click"
                title="Buka Analisis & Control"
              >
                <div
                  className="neon-icon size-9 shrink-0"
                  style={{ '--glow': '#ff3b5c' } as React.CSSProperties}
                >
                  <TrendingUp className="size-4 text-[#ff3b5c]" />
                </div>
                {!isCollapsed && (
                  <div className="ml-3 flex-1 overflow-hidden">
                    <span className="text-xs font-bold tracking-wide text-white block">
                      Analisis & Control
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Target Quarters & Audit
                    </span>
                  </div>
                )}
              </button>
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={(e) => toggleSection('analytics', e)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  title={openSections.analytics ? 'Tutup Submenu' : 'Buka Submenu'}
                >
                  {openSections.analytics ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
              )}
            </div>

            {/* Submenu Analisis & Control */}
            {!isCollapsed && openSections.analytics && (
              <div className="pl-6 pr-2 space-y-1">
                <button
                  type="button"
                  onClick={() => onTabChange('analytics', 'GOV')}
                  className={`w-full text-left flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors finger-click ${
                    activeTab === 'analytics' && analyticsGroupFilter === 'GOV'
                      ? 'bg-red-950/80 border border-red-500/60 text-red-300 font-bold'
                      : 'text-slate-400 hover:text-red-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <Building2 className="size-3.5 text-red-400" />
                  <span>1. Analisis & Control GOV</span>
                </button>
                <button
                  type="button"
                  onClick={() => onTabChange('analytics', 'INTERNAL')}
                  className={`w-full text-left flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors finger-click ${
                    activeTab === 'analytics' && analyticsGroupFilter === 'INTERNAL'
                      ? 'bg-indigo-950/80 border border-indigo-500/60 text-indigo-300 font-bold'
                      : 'text-slate-400 hover:text-indigo-300 hover:bg-white/[0.02]'
                  }`}
                >
                  <ShieldCheck className="size-3.5 text-indigo-400" />
                  <span>2. Analisis & Control Internal</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Category Status Badges */}
      {!isCollapsed && (
        <div className="p-4 m-3 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 mb-2">
            <Layers className="size-3.5 text-[#00e5ff]" />
            <span>Kategori Regulasi Terdaftar:</span>
          </div>
          <div className="space-y-1.5 text-[10px] font-mono">
            <div className="flex items-center justify-between text-purple-300 bg-purple-950/40 px-2 py-1 rounded border border-purple-800/40">
              <span>GOV SJUT</span>
              <span className="text-purple-400 font-bold">Ducting Tanah</span>
            </div>
            <div className="flex items-center justify-between text-yellow-300 bg-yellow-950/40 px-2 py-1 rounded border border-yellow-800/40">
              <span>GOV APJATEL</span>
              <span className="text-yellow-400 font-bold">Asosiasi ISP</span>
            </div>
            <div className="flex items-center justify-between text-red-300 bg-red-950/40 px-2 py-1 rounded border border-red-800/40">
              <span>GOV IPPJU</span>
              <span className="text-red-400 font-bold">Penerangan Smart</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-[#22ff9a]">
              <Shield className="size-3 text-[#22ff9a]" />
              Sertifikasi JWS Dinas DKI
            </span>
            <span>2026</span>
          </div>
        </div>
      )}
    </aside>
  );
};

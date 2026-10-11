import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Cable,
  Box,
  Layers,
  Database,
  RefreshCw,
  Download,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  Plus,
  Edit2,
  Trash2,
  Building2,
  FolderGit2,
  Search,
  Filter,
  X
} from 'lucide-react';
import { ProjectItem, ConstructionPlanItem } from '../types';
import { resetToInitialData, exportDataAsJson } from '../services/storage';
import { InteractiveCharts } from './InteractiveCharts';

interface AnalyticsViewProps {
  projects: ProjectItem[];
  plans: ConstructionPlanItem[];
  onDataReset: () => void;
  isRealtime: boolean;
  onToggleRealtime: () => void;
  onOpenNewProject?: () => void;
  onOpenNewPlan?: () => void;
  onEditProject?: (project: ProjectItem) => void;
  onDeleteProject?: (id: string) => void;
  mainGroupFilter?: 'GOV' | 'INTERNAL' | 'ALL';
  onMainGroupFilterChange?: (group: 'GOV' | 'INTERNAL' | 'ALL') => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  projects,
  plans,
  onDataReset,
  isRealtime,
  onToggleRealtime,
  onOpenNewProject,
  onOpenNewPlan,
  onEditProject,
  onDeleteProject,
  mainGroupFilter: externalGroupFilter,
  onMainGroupFilterChange
}) => {
  const [mainGroupFilter, setMainGroupFilter] = useState<'GOV' | 'INTERNAL' | 'ALL'>(externalGroupFilter || 'GOV');

  React.useEffect(() => {
    if (externalGroupFilter) {
      setMainGroupFilter(externalGroupFilter);
    }
  }, [externalGroupFilter]);

  const handleGroupChange = (group: 'GOV' | 'INTERNAL' | 'ALL') => {
    setMainGroupFilter(group);
    if (onMainGroupFilterChange) {
      onMainGroupFilterChange(group);
    }
  };

  const isProjectInternal = (p: ProjectItem) => {
    return p.projectCategory === 'Project Internal' || p.projectCategory === 'INTERNAL';
  };

  const isPlanInternal = (pl: ConstructionPlanItem) => {
    const prj = projects.find((p) => p.projectId === pl.projectId);
    if (prj) return isProjectInternal(prj);
    return pl.projectId?.startsWith('PRJ-INT') || false;
  };

  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState('');
  const [analyticsCategoryFilter, setAnalyticsCategoryFilter] = useState('ALL');
  const [analyticsStatusFilter, setAnalyticsStatusFilter] = useState('ALL');

  const govAnalyticsCount = useMemo(() => {
    return projects.filter((p) => !isProjectInternal(p)).length;
  }, [projects]);

  const internalAnalyticsCount = useMemo(() => {
    return projects.filter((p) => isProjectInternal(p)).length;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const internal = isProjectInternal(p);
      if (mainGroupFilter === 'GOV' && internal) return false;
      if (mainGroupFilter === 'INTERNAL' && !internal) return false;

      if (analyticsCategoryFilter !== 'ALL' && p.projectCategory !== analyticsCategoryFilter) return false;
      if (analyticsStatusFilter !== 'ALL' && p.projectStatus !== analyticsStatusFilter) return false;

      if (analyticsSearchQuery.trim()) {
        const q = analyticsSearchQuery.toLowerCase().trim();
        const matchId = p.projectId.toLowerCase().includes(q);
        const matchDesc = p.projectDescription.toLowerCase().includes(q);
        const matchArea = p.areaLocation.toLowerCase().includes(q);
        const matchPic = (p.picIsp || '').toLowerCase().includes(q);
        if (!matchId && !matchDesc && !matchArea && !matchPic) return false;
      }

      return true;
    });
  }, [projects, mainGroupFilter, analyticsCategoryFilter, analyticsStatusFilter, analyticsSearchQuery]);

  const filteredPlans = useMemo(() => {
    const validProjectIds = new Set(filteredProjects.map((p) => p.projectId));
    return plans.filter((pl) => {
      const internal = isPlanInternal(pl);
      if (mainGroupFilter === 'GOV' && internal) return false;
      if (mainGroupFilter === 'INTERNAL' && !internal) return false;

      if (validProjectIds.size > 0 && !validProjectIds.has(pl.projectId)) return false;

      if (analyticsSearchQuery.trim()) {
        const q = analyticsSearchQuery.toLowerCase().trim();
        const matchIsp = pl.namaIsp.toLowerCase().includes(q);
        const matchProj = pl.projectId.toLowerCase().includes(q);
        if (!matchIsp && !matchProj) return false;
      }

      return true;
    });
  }, [plans, projects, filteredProjects, mainGroupFilter, analyticsSearchQuery]);

  // Calculate Cable Types Distribution
  const cableCoreCounts: Record<string, number> = {};
  filteredPlans.forEach(plan => {
    plan.foCables?.forEach(c => {
      cableCoreCounts[c.tipe] = (cableCoreCounts[c.tipe] || 0) + (c.panjang || 0);
    });
  });

  // Calculate Manholes Size Distribution
  const manholeCounts: Record<string, number> = {};
  filteredPlans.forEach(plan => {
    plan.manholes?.forEach(m => {
      manholeCounts[m.tipe] = (manholeCounts[m.tipe] || 0) + (m.unit || 0);
    });
  });

  // Calculate ISP Participation
  const ispMetrics: Record<string, { count: number; totalGalian: number; totalFo: number }> = {};
  filteredPlans.forEach(plan => {
    if (!ispMetrics[plan.namaIsp]) {
      ispMetrics[plan.namaIsp] = { count: 0, totalGalian: 0, totalFo: 0 };
    }
    ispMetrics[plan.namaIsp].count += 1;
    ispMetrics[plan.namaIsp].totalGalian += plan.panjangRelokasiGalian || 0;
    const foSum = plan.foCables?.reduce((acc, c) => acc + (c.panjang || 0), 0) || 0;
    ispMetrics[plan.namaIsp].totalFo += foSum;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#091022] border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-400" />
              Pusat Analisis & Control Proyek JWS
            </h2>
            <span className="px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 text-xs font-mono">
              Statistik Infrastruktur
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenNewProject && onOpenNewProject()}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all finger-click flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek Baru</span>
          </button>

          <button
            onClick={() => onOpenNewPlan && onOpenNewPlan()}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all finger-click flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rencana ISP</span>
          </button>

          <button
            onClick={onToggleRealtime}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition-all finger-click border flex items-center gap-2 ${
              isRealtime
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300 neon-glow-cyan'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isRealtime ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
            <span>{isRealtime ? 'STREAMING AKTIF' : 'STREAMING NONAKTIF'}</span>
          </button>

          <button
            onClick={exportDataAsJson}
            className="px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-300 text-xs font-semibold hover:bg-purple-900/60 finger-click flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor JSON</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset semua data kembali ke default awal proyek JWS 2026?')) {
                resetToInitialData();
                onDataReset();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold hover:bg-slate-800 finger-click flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Group Separation Tab Switcher for Analisis & Control */}
      <div className="p-2 rounded-2xl bg-[#091022] border border-slate-800 shadow-lg flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleGroupChange('GOV')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all finger-click border shrink-0 ${
            mainGroupFilter === 'GOV'
              ? 'bg-gradient-to-r from-red-950 to-pink-950 border-red-500 text-red-200 shadow-lg shadow-red-500/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4 text-red-400" />
          <span>1. Analisis & Control GOV</span>
          <span className="px-2 py-0.5 rounded-full bg-red-900/80 border border-red-600/80 text-[10px] font-mono text-red-200 font-extrabold">
            {govAnalyticsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleGroupChange('INTERNAL')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all finger-click border shrink-0 ${
            mainGroupFilter === 'INTERNAL'
              ? 'bg-gradient-to-r from-purple-950 to-indigo-950 border-indigo-400 text-indigo-200 shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>2. Analisis & Control Internal</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-900/80 border border-indigo-600/80 text-[10px] font-mono text-indigo-200 font-extrabold">
            {internalAnalyticsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleGroupChange('ALL')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all finger-click border shrink-0 ${
            mainGroupFilter === 'ALL'
              ? 'bg-slate-800 border-slate-500 text-white shadow-md'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <FolderGit2 className="w-4 h-4 text-slate-300" />
          <span>Semua Analisis & Control</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 font-bold">
            {projects.length}
          </span>
        </button>
      </div>

      {/* Interactive Filter Toolbar for Analytics & Control */}
      <div className="p-3 rounded-2xl bg-[#091022] border border-slate-800 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={analyticsSearchQuery}
            onChange={(e) => setAnalyticsSearchQuery(e.target.value)}
            placeholder="Filter data analisis (ID Proyek, Deskripsi, Lokasi, ISP...)"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-red-500"
          />
          {analyticsSearchQuery && (
            <button
              onClick={() => setAnalyticsSearchQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={analyticsCategoryFilter}
              onChange={(e) => setAnalyticsCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-red-300 focus:outline-none focus:border-red-500"
            >
              <option value="ALL">Semua Kategori Proyek</option>
              <option value="GOV APJATEL">GOV APJATEL</option>
              <option value="GOV IPPJU">GOV IPPJU</option>
              <option value="GOV SJUT">GOV SJUT</option>
              <option value="Project Internal">Project Internal</option>
            </select>
          </div>

          <select
            value={analyticsStatusFilter}
            onChange={(e) => setAnalyticsStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Status Proyek</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="review dinas">Review Dinas</option>
            <option value="not started">Not Started</option>
            <option value="cancel">Cancel</option>
          </select>
        </div>
      </div>

      {/* Interactive Bar Chart & Pie Chart Section */}
      <InteractiveCharts projects={filteredProjects} plans={filteredPlans} />

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: FO Cable Core Breakdown */}
        <div className="rounded-2xl bg-[#091022] border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cable className="w-4 h-4 text-purple-400" />
              Distribusi Spesifikasi Core Kabel FO (Meter)
            </h3>
            <span className="text-xs font-mono text-purple-400">6 Varian Core</span>
          </div>

          <div className="space-y-3">
            {Object.entries(cableCoreCounts).length === 0 ? (
              <p className="text-xs text-slate-500 italic">Belum ada data kabel FO terinput.</p>
            ) : (
              Object.entries(cableCoreCounts).map(([type, meters]) => {
                const totalAll = Object.values(cableCoreCounts).reduce((a, b) => a + b, 0);
                const pct = totalAll > 0 ? Math.round((meters / totalAll) * 100) : 0;

                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-semibold">{type}</span>
                      <span className="text-purple-300 tabular-nums">
                        {meters.toLocaleString('id-ID')} m ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Box 2: Manhole Size Breakdown */}
        <div className="rounded-2xl bg-[#091022] border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Box className="w-4 h-4 text-yellow-400" />
              Populasi Handhole & Manhole (Unit)
            </h3>
            <span className="text-xs font-mono text-yellow-400">Dimensi 60x60 - 120x120</span>
          </div>

          <div className="space-y-3">
            {Object.entries(manholeCounts).length === 0 ? (
              <p className="text-xs text-slate-500 italic">Belum ada data manhole terinput.</p>
            ) : (
              Object.entries(manholeCounts).map(([size, units]) => {
                const totalUnits = Object.values(manholeCounts).reduce((a, b) => a + b, 0);
                const pct = totalUnits > 0 ? Math.round((units / totalUnits) * 100) : 0;

                return (
                  <div key={size} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-semibold">Tipe {size}</span>
                      <span className="text-yellow-300 tabular-nums">
                        {units} unit ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ISP Activity Ledger Table */}
      <div className="rounded-2xl bg-[#091022] border border-slate-800 shadow-xl overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HardHat className="w-4 h-4 text-orange-400" />
            Rekapitulasi Keterlibatan Operator ISP APJATEL
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {Object.keys(ispMetrics).length} Operator Terdata
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0c1429] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">Nama ISP</th>
                <th className="py-2.5 px-3 text-center">Jumlah Rencana</th>
                <th className="py-2.5 px-3 text-right">Total Galian (m)</th>
                <th className="py-2.5 px-3 text-right">Total Kabel FO (m)</th>
                <th className="py-2.5 px-3 text-center">Status Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {Object.entries(ispMetrics).map(([ispName, m]) => (
                <tr key={ispName} className="hover:bg-[#0c152c] transition-colors">
                  <td className="py-3 px-3 font-bold text-white font-sans">{ispName}</td>
                  <td className="py-3 px-3 text-center text-cyan-300">{m.count} Trase</td>
                  <td className="py-3 px-3 text-right text-orange-400 font-bold">
                    {m.totalGalian.toLocaleString('id-ID')} m
                  </td>
                  <td className="py-3 px-3 text-right text-purple-400 font-bold">
                    {m.totalFo.toLocaleString('id-ID')} m
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      APD Sah
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

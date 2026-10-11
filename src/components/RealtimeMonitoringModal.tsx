import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Zap,
  Cable,
  Box,
  FileCheck,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Layers,
  MapPin,
  Calendar,
  Lightbulb
} from 'lucide-react';
import { ProjectItem, ConstructionPlanItem } from '../types';

export type MonitoringCategory = 'galian' | 'fo' | 'infrastruktur' | 'po';

interface RealtimeMonitoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: MonitoringCategory;
  onSelectCategory: (cat: MonitoringCategory) => void;
  projects: ProjectItem[];
  plans: ConstructionPlanItem[];
}

export const RealtimeMonitoringModal: React.FC<RealtimeMonitoringModalProps> = ({
  isOpen,
  onClose,
  activeCategory,
  onSelectCategory,
  projects,
  plans
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter projects by search term
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchTerm.toLowerCase();
      return (
        p.projectId.toLowerCase().includes(q) ||
        p.projectDescription.toLowerCase().includes(q) ||
        p.areaLocation.toLowerCase().includes(q) ||
        (p.picIsp && p.picIsp.toLowerCase().includes(q))
      );
    });
  }, [projects, searchTerm]);

  if (!isOpen) return null;

  const categoryConfigs = {
    galian: {
      title: 'Total Galian / Relokasi & Crossing',
      badge: 'Galian & Trase',
      color: '#ff9f1c',
      icon: Zap,
      description: 'Card grid per nama project: volume galian, crossing jalan, jembatan, kali/sungai, tol, dan boring akses.'
    },
    fo: {
      title: 'Kabel Fiber Optik (6 Tipe Core 12 s/d 288)',
      badge: 'Fiber Optic',
      color: '#a855f7',
      icon: Cable,
      description: 'Card grid per nama project: panjang kabel FO lengkap terdiri dari 6 tipe core (12, 24, 48, 96, 144, 288) dan total.'
    },
    infrastruktur: {
      title: 'HH, HB, MH, Tiang Bersama & Galvanis',
      badge: 'Infrastruktur',
      color: '#ffe14d',
      icon: Box,
      description: 'Card grid per nama project: total Handhole (HH), Handbox (HB), Manhole (MH), Tiang bersama, dan Pipa Galvanis.'
    },
    po: {
      title: 'PO Release Realtime (Purchase Order & SPK)',
      badge: 'Purchase Order & SPK',
      color: '#22ff9a',
      icon: FileCheck,
      description: 'Card grid per nama project: informasi nama ISP yang sudah mengeluarkan PO, status rilis, tanggal buat project, dan nomor kontrak.'
    }
  };

  const currentConfig = categoryConfigs[activeCategory];

  // Helper: compute metrics for a single project
  const getProjectMetrics = (p: ProjectItem) => {
    const pPlans = plans.filter((pl) => pl.projectId === p.projectId);

    // Galian & Crossings
    const galian = pPlans.length > 0
      ? pPlans.reduce((s, pl) => s + (pl.panjangRelokasiGalian || 0), 0)
      : (p.panjangRelokasiGalian || 0);

    const crossingJalan = pPlans.reduce((s, pl) => s + (pl.crossingJalan || 0), 0);
    const crossingJembatan = pPlans.reduce((s, pl) => s + (pl.crossingJembatan || 0), 0);
    const crossingKali = pPlans.reduce((s, pl) => s + (pl.crossingKaliSungai || 0), 0);
    const crossingTol = pPlans.reduce((s, pl) => s + (pl.crossingTol || 0), 0);
    const boringAkses = pPlans.reduce((s, pl) => s + (pl.borringAkses || 0), 0);

    // 6 Tipe Core FO
    const fo12 = pPlans.reduce((s, pl) => {
      const matched = pl.foCables?.filter((c) => c.tipe === 'kabel FO 12') || [];
      return s + matched.reduce((acc, c) => acc + (c.panjang || 0), 0);
    }, 0);

    const fo24 = pPlans.reduce((s, pl) => {
      const matched = pl.foCables?.filter((c) => c.tipe === 'kabel FO 24') || [];
      return s + matched.reduce((acc, c) => acc + (c.panjang || 0), 0);
    }, 0);

    const fo48 = pPlans.reduce((s, pl) => {
      const matched = pl.foCables?.filter((c) => c.tipe === 'kabel FO 48') || [];
      return s + matched.reduce((acc, c) => acc + (c.panjang || 0), 0);
    }, 0);

    const fo96 = pPlans.reduce((s, pl) => {
      const matched = pl.foCables?.filter((c) => c.tipe === 'kabel FO 96') || [];
      return s + matched.reduce((acc, c) => acc + (c.panjang || 0), 0);
    }, 0);

    const fo144 = pPlans.reduce((s, pl) => {
      const matched = pl.foCables?.filter((c) => c.tipe === 'kabel FO 144') || [];
      return s + matched.reduce((acc, c) => acc + (c.panjang || 0), 0);
    }, 0);

    const fo288 = pPlans.reduce((s, pl) => {
      const matched = pl.foCables?.filter((c) => c.tipe === 'kabel FO 288') || [];
      return s + matched.reduce((acc, c) => acc + (c.panjang || 0), 0);
    }, 0);

    const totalFo = fo12 + fo24 + fo48 + fo96 + fo144 + fo288;

    // HH, HB, MH, Tiang, Galvanis
    const totalHH = pPlans.reduce((s, pl) => {
      const items = pl.manholes?.filter((m) =>
        m.tipe.startsWith('HH') || m.tipe === '60x60' || m.tipe === '70x70' || m.tipe === '80x80'
      ) || [];
      return s + items.reduce((acc, m) => acc + (m.unit || 0), 0);
    }, 0);

    const totalHB = pPlans.reduce((s, pl) => {
      const items = pl.manholes?.filter((m) =>
        m.tipe.startsWith('HB') || m.tipe.toLowerCase().includes('handbox')
      ) || [];
      return s + items.reduce((acc, m) => acc + (m.unit || 0), 0);
    }, 0);

    const totalMH = pPlans.reduce((s, pl) => {
      const items = pl.manholes?.filter((m) =>
        m.tipe.startsWith('MH') || m.tipe === '90x90' || m.tipe === '100x100' || m.tipe === '110x110' || m.tipe === '120x120'
      ) || [];
      return s + items.reduce((acc, m) => acc + (m.unit || 0), 0);
    }, 0);

    const totalTiang = pPlans.reduce((s, pl) => {
      return s + (pl.poles?.reduce((acc, pol) => acc + (pol.unit || 0), 0) || 0);
    }, 0);

    const totalGalvanis = pPlans.reduce((s, pl) => {
      return s + (pl.galvanis?.reduce((acc, g) => acc + (g.meter || 0), 0) || 0);
    }, 0);

    // List of ISPs associated with this project
    const distinctIsps = Array.from(new Set([
      ...pPlans.map((pl) => pl.namaIsp).filter(Boolean),
      ...(p.picIsp ? [p.picIsp] : [])
    ]));

    return {
      galian,
      crossingJalan,
      crossingJembatan,
      crossingKali,
      crossingTol,
      boringAkses,
      fo12,
      fo24,
      fo48,
      fo96,
      fo144,
      fo288,
      totalFo,
      totalHH,
      totalHB,
      totalMH,
      totalTiang,
      totalGalvanis,
      distinctIsps
    };
  };

  const formatRupiah = (val?: number) => {
    if (!val) return 'Rp 0';
    if (val >= 1000000000) {
      return `Rp ${(val / 1000000000).toFixed(2)} Miliar`;
    }
    if (val >= 1000000) {
      return `Rp ${(val / 1000000).toFixed(0)} Juta`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const formatProjectCreateDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-[#070d1d] border border-cyan-500/30 shadow-2xl overflow-hidden neon-glow-cyan text-slate-200">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-[#0c142b] via-[#091022] to-[#120f26] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono mb-1.5" style={{ color: currentConfig.color }}>
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: currentConfig.color }} />
                <span>MONITORING REALTIME · INFORMASI CARD GRID PER PROJECT</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <currentConfig.icon className="w-6 h-6" style={{ color: currentConfig.color }} />
                <span>{currentConfig.title}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                {currentConfig.description}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors finger-click shrink-0"
              title="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TAB CATEGORY SELECTOR */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectCategory('galian')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all finger-click ${
                  activeCategory === 'galian'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 text-orange-400" />
                <span>Total Galian / Relokasi</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectCategory('fo')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all finger-click ${
                  activeCategory === 'fo'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Cable className="w-4 h-4 text-purple-400" />
                <span>Kabel Fiber Optik</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectCategory('infrastruktur')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all finger-click ${
                  activeCategory === 'infrastruktur'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Box className="w-4 h-4 text-yellow-400" />
                <span>HH, HB, MH, Tiang & Galvanis</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectCategory('po')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all finger-click ${
                  activeCategory === 'po'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>PO Release Realtime</span>
              </button>
            </div>

            {/* SEARCH BAR */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama project..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 font-mono"
              />
            </div>
          </div>
        </div>

        {/* MODAL BODY: CARD GRID PER PROJECT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">Tidak ada proyek yang cocok dengan pencarian.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((p) => {
                const m = getProjectMetrics(p);

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-[#091022] border border-slate-800/90 hover:border-slate-700 p-4 shadow-xl flex flex-col justify-between transition-all hover:bg-[#0c152d]"
                  >
                    {/* Top Project Header */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-0.5 rounded-md">
                          {p.projectId}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {p.projectCategory}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug line-clamp-2" title={p.projectDescription}>
                        {p.projectDescription}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 mb-3 line-clamp-1">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{p.areaLocation}</span>
                      </p>
                    </div>

                    {/* CARD CONTENT PER CATEGORY */}
                    <div className="pt-3 border-t border-slate-800/80">
                      
                      {/* ======================================================== */}
                      {/* 1. TOTAL GALIAN / RELOKASI & CROSSING (Card Grid)       */}
                      {/* - nama project per nama project                          */}
                      {/* - galian                                                 */}
                      {/* - crossing jalan                                         */}
                      {/* - crossing jembatan                                      */}
                      {/* - crossing kali / sungai                                 */}
                      {/* - crossing tol                                           */}
                      {/* - broring akses                                          */}
                      {/* ======================================================== */}
                      {activeCategory === 'galian' && (
                        <div className="space-y-2 font-mono text-xs">
                          {/* Galian Utama */}
                          <div className="p-2.5 rounded-xl bg-orange-950/20 border border-orange-500/30 flex items-center justify-between">
                            <span className="text-slate-300 font-semibold font-sans">Galian</span>
                            <span className="font-bold text-orange-400 text-sm tabular-nums">
                              {m.galian.toLocaleString('id-ID')} m
                            </span>
                          </div>

                          {/* 5 Crossings Grid */}
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 rounded-lg bg-[#0c1429] border border-slate-800/80">
                              <span className="text-slate-400 block font-sans">Crossing Jalan</span>
                              <span className="font-bold text-cyan-300 text-xs tabular-nums">
                                {m.crossingJalan.toLocaleString('id-ID')} m
                              </span>
                            </div>

                            <div className="p-2 rounded-lg bg-[#0c1429] border border-slate-800/80">
                              <span className="text-slate-400 block font-sans">Crossing Jembatan</span>
                              <span className="font-bold text-purple-300 text-xs tabular-nums">
                                {m.crossingJembatan.toLocaleString('id-ID')} m
                              </span>
                            </div>

                            <div className="p-2 rounded-lg bg-[#0c1429] border border-slate-800/80">
                              <span className="text-slate-400 block font-sans">Crossing Kali / Sungai</span>
                              <span className="font-bold text-blue-300 text-xs tabular-nums">
                                {m.crossingKali.toLocaleString('id-ID')} m
                              </span>
                            </div>

                            <div className="p-2 rounded-lg bg-[#0c1429] border border-slate-800/80">
                              <span className="text-slate-400 block font-sans">Crossing Tol</span>
                              <span className="font-bold text-rose-300 text-xs tabular-nums">
                                {m.crossingTol.toLocaleString('id-ID')} m
                              </span>
                            </div>

                            <div className="col-span-2 p-2 rounded-lg bg-[#0c1429] border border-yellow-500/20 flex items-center justify-between">
                              <span className="text-slate-400 font-sans">Boring Akses</span>
                              <span className="font-bold text-yellow-300 text-xs tabular-nums">
                                {m.boringAkses.toLocaleString('id-ID')} m
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ======================================================== */}
                      {/* 2. KABEL FIBER OPTIK (Card Grid)                        */}
                      {/* - nama project per nama project                          */}
                      {/* - panjang semua kabel fo terdiri dari 6 tipe core (12-288)*/}
                      {/* ======================================================== */}
                      {activeCategory === 'fo' && (
                        <div className="space-y-2 font-mono text-xs">
                          <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
                            <span className="text-slate-300 font-semibold font-sans">Total Kabel FO</span>
                            <span className="font-bold text-purple-400 text-sm tabular-nums">
                              {m.totalFo.toLocaleString('id-ID')} m
                            </span>
                          </div>

                          {/* 6 Tipe Core Breakdown */}
                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            <div className="p-1.5 rounded-lg bg-[#0c1429] border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-400">FO 12 Core:</span>
                              <span className="font-bold text-white tabular-nums">{m.fo12.toLocaleString('id-ID')} m</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-[#0c1429] border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-400">FO 24 Core:</span>
                              <span className="font-bold text-white tabular-nums">{m.fo24.toLocaleString('id-ID')} m</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-[#0c1429] border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-400">FO 48 Core:</span>
                              <span className="font-bold text-white tabular-nums">{m.fo48.toLocaleString('id-ID')} m</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-[#0c1429] border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-400">FO 96 Core:</span>
                              <span className="font-bold text-purple-300 tabular-nums">{m.fo96.toLocaleString('id-ID')} m</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-[#0c1429] border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-400">FO 144 Core:</span>
                              <span className="font-bold text-purple-300 tabular-nums">{m.fo144.toLocaleString('id-ID')} m</span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-[#0c1429] border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-400">FO 288 Core:</span>
                              <span className="font-bold text-pink-300 tabular-nums">{m.fo288.toLocaleString('id-ID')} m</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ======================================================== */}
                      {/* 3. HH, HB, MH, TIANG BERSAMA & GALVANIS (Card Grid)     */}
                      {/* - nama project per nama project                          */}
                      {/* - total HH                                               */}
                      {/* - total HB                                               */}
                      {/* - total MH                                               */}
                      {/* - total tiang / pole                                     */}
                      {/* - total galvanis                                         */}
                      {/* ======================================================== */}
                      {activeCategory === 'infrastruktur' && (
                        <div className="space-y-2 font-mono text-xs">
                          {/* 3 Manhole variants */}
                          <div className="grid grid-cols-3 gap-2 text-[11px]">
                            <div className="p-2 rounded-lg bg-yellow-950/20 border border-yellow-500/30 text-center">
                              <span className="text-slate-400 block font-sans text-[10px]">Total HH</span>
                              <span className="font-bold text-yellow-300 text-sm tabular-nums">
                                {m.totalHH} <span className="text-[9px] font-normal">unit</span>
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/30 text-center">
                              <span className="text-slate-400 block font-sans text-[10px]">Total HB</span>
                              <span className="font-bold text-amber-300 text-sm tabular-nums">
                                {m.totalHB} <span className="text-[9px] font-normal">unit</span>
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-yellow-950/20 border border-yellow-500/30 text-center">
                              <span className="text-slate-400 block font-sans text-[10px]">Total MH</span>
                              <span className="font-bold text-yellow-400 text-sm tabular-nums">
                                {m.totalMH} <span className="text-[9px] font-normal">unit</span>
                              </span>
                            </div>
                          </div>

                          {/* Tiang & Galvanis */}
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/30">
                              <span className="text-slate-400 block font-sans">Total Tiang / Pole</span>
                              <span className="font-bold text-cyan-300 text-xs tabular-nums">
                                {m.totalTiang} batang
                              </span>
                            </div>

                            <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/30">
                              <span className="text-slate-400 block font-sans">Total Galvanis</span>
                              <span className="font-bold text-rose-300 text-xs tabular-nums">
                                {m.totalGalvanis.toLocaleString('id-ID')} m
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ======================================================== */}
                      {/* 4. PO RELEASE REALTIME (Card Grid)                      */}
                      {/* - nama project per nama project                          */}
                      {/* - nama ISP yang sudah mengeluarkan PO                    */}
                      {/* ======================================================== */}
                      {activeCategory === 'po' && (
                        <div className="space-y-2.5 text-xs">
                          {/* Status Badge & No PO */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-slate-400">
                              No. PO: <strong className="text-cyan-300">{p.noPoRelease || '-'}</strong>
                            </span>
                            {p.statusPoRelease === 'Released' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-[10px] font-bold flex items-center gap-1 font-mono">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                RELEASED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500 text-amber-300 text-[10px] font-bold flex items-center gap-1.5 font-mono shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                                <Lightbulb className="w-3 h-3 text-amber-300 animate-pulse shrink-0" />
                                PO NOT RELEASE ({p.statusPoRelease || 'Pending'})
                              </span>
                            )}
                          </div>

                          {/* Project Create Date */}
                          <div className="flex items-center justify-between text-[11px] font-mono px-2.5 py-1.5 rounded-lg bg-[#0c1429] border border-slate-800">
                            <span className="text-slate-400 flex items-center gap-1.5 font-sans">
                              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              Project Create Date:
                            </span>
                            <span className="font-bold text-cyan-300">
                              {formatProjectCreateDate(p.createdAt)}
                            </span>
                          </div>

                          {/* ISP yang sudah mengeluarkan PO */}
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 block">
                              Nama ISP yang Mengeluarkan PO:
                            </span>
                            {m.distinctIsps.length > 0 ? (
                              <div className="space-y-1">
                                {m.distinctIsps.map((ispName, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-white font-semibold text-xs">
                                    <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span className="truncate">{ispName}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-slate-400 text-xs italic">
                                Belum ada ISP terdaftar
                              </div>
                            )}
                          </div>

                          {/* Nilai PO & Tanggal Rilis */}
                          <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400">
                            <span>Tgl: {p.tanggalPoRelease || '-'}</span>
                            <span className="font-bold text-orange-400">{formatRupiah(p.nilaiPo)}</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-[#070b16] flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <div>
            Total <strong className="text-cyan-400">{filteredProjects.length}</strong> Proyek GOV JWS
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-sans font-semibold transition-colors finger-click"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

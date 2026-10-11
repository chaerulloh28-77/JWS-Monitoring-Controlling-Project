import React, { useState, useMemo } from 'react';
import {
  FolderGit2,
  HardHat,
  Cable,
  Box,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  ArrowUpRight,
  ArrowLeft,
  TrendingUp,
  Cpu,
  Zap,
  Globe2,
  FileCheck,
  Banknote,
  Building2,
  LayoutGrid,
  Calendar,
  Lightbulb,
  X,
  Info,
  Search,
  Table as TableIcon,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { ProjectItem, ConstructionPlanItem, ActiveTab } from '../types';
import { RealtimeMonitoringModal, MonitoringCategory } from './RealtimeMonitoringModal';

interface DashboardOverviewProps {
  projects: ProjectItem[];
  plans: ConstructionPlanItem[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenNewProject: () => void;
  onOpenNewPlan: () => void;
  onEditProject?: (project: ProjectItem) => void;
  onDeleteProject?: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  projects,
  plans,
  onNavigateTab,
  onOpenNewProject,
  onOpenNewPlan,
  onEditProject,
  onDeleteProject
}) => {
  // Modal state for Realtime Card Grid Drill-downs
  const [isMonitoringModalOpen, setIsMonitoringModalOpen] = useState(false);
  const [monitoringCategory, setMonitoringCategory] = useState<MonitoringCategory>('galian');
  const [poViewMode, setPoViewMode] = useState<'card_grid' | 'table'>('card_grid');

  // Dedicated PO NOT RELEASE & Keterangan ISP Modal State
  const [isPoNotReleaseModalOpen, setIsPoNotReleaseModalOpen] = useState(false);
  const [selectedPoNotReleaseProject, setSelectedPoNotReleaseProject] = useState<any | null>(null);

  // Dedicated PO Realtime Status & SPK Modal State
  const [isPoRealtimeModalOpen, setIsPoRealtimeModalOpen] = useState(false);
  const [poStatusFilter, setPoStatusFilter] = useState<'all' | 'released' | 'not_released'>('all');

  // Dedicated Status Detail Modal State (Review Dinas, In Progress, Completed, Not Started, Cancel)
  const [selectedStatusModal, setSelectedStatusModal] = useState<'review dinas' | 'in progress' | 'completed' | 'not started' | 'cancel' | null>(null);
  const [statusModalSearch, setStatusModalSearch] = useState('');

  // Dedicated Category Modal State (GOV APJATEL, GOV IPPJU, GOV SJUT, Project Internal)
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<'GOV APJATEL' | 'GOV IPPJU' | 'GOV SJUT' | 'Project Internal' | 'INTERNAL' | null>(null);
  const [categoryModalSearch, setCategoryModalSearch] = useState('');

  // Dedicated Quarter Modal State (Q1 - 26, Q2 - 26, Q3 - 26, Q4 - 26)
  const [selectedQuarterModal, setSelectedQuarterModal] = useState<'Q1 - 26' | 'Q2 - 26' | 'Q3 - 26' | 'Q4 - 26' | null>(null);
  const [quarterModalSearch, setQuarterModalSearch] = useState('');

  // Category Metadata Definitions
  const CATEGORY_CONFIGS: Record<
    'GOV APJATEL' | 'GOV IPPJU' | 'GOV SJUT' | 'Project Internal' | 'INTERNAL',
    {
      title: string;
      label: string;
      badgeBg: string;
      badgeBorder: string;
      textColor: string;
      accentBorder: string;
      gradientFrom: string;
      description: string;
      icon: React.ReactNode;
    }
  > = {
    'GOV APJATEL': {
      title: 'Kategori GOV APJATEL (Asosiasi Penyelenggara Jaringan Telekomunikasi)',
      label: 'GOV APJATEL',
      badgeBg: 'bg-yellow-950/80',
      badgeBorder: 'border-yellow-600',
      textColor: 'text-yellow-400',
      accentBorder: 'border-yellow-500/60',
      gradientFrom: 'from-yellow-950/90',
      description: 'Proyek relokasi dan penataan jaringan kabel udara serat optik milik anggota Asosiasi Penyelenggara Jaringan Telekomunikasi (APJATEL) ke jalur subduct/ducting bawah tanah.',
      icon: <Cable className="w-5 h-5 text-yellow-400" />
    },
    'GOV IPPJU': {
      title: 'Kategori GOV IPPJU (Infrastruktur Penerangan Jalan Umum)',
      label: 'GOV IPPJU',
      badgeBg: 'bg-red-950/80',
      badgeBorder: 'border-red-600',
      textColor: 'text-red-400',
      accentBorder: 'border-red-500/60',
      gradientFrom: 'from-red-950/90',
      description: 'Proyek revitalisasi dan perapihan infrastruktur penerangan jalan umum cerdas, penggantian tiang PJU, serta integrasi tiang pintar Smart City.',
      icon: <Zap className="w-5 h-5 text-red-400" />
    },
    'GOV SJUT': {
      title: 'Kategori GOV SJUT (Sarana Jaringan Utilitas Terpadu)',
      label: 'GOV SJUT',
      badgeBg: 'bg-purple-950/80',
      badgeBorder: 'border-purple-600',
      textColor: 'text-purple-400',
      accentBorder: 'border-purple-500/60',
      gradientFrom: 'from-purple-950/90',
      description: 'Proyek pengerjaan jaringan ducting dan manhole terpadu Sarana Jaringan Utilitas Terpadu (SJUT) bawah tanah untuk penataan estetika kota.',
      icon: <Layers className="w-5 h-5 text-purple-400" />
    },
    'Project Internal': {
      title: 'Kategori Project Internal',
      label: 'Project Internal',
      badgeBg: 'bg-emerald-950/80',
      badgeBorder: 'border-emerald-600',
      textColor: 'text-emerald-400',
      accentBorder: 'border-emerald-500/60',
      gradientFrom: 'from-emerald-950/90',
      description: 'Proyek penataan dan pembangunan infrastruktur jaringan internal perusahaan (Non-GOV).',
      icon: <Building2 className="w-5 h-5 text-emerald-400" />
    },
    'INTERNAL': {
      title: 'Kategori Project Internal',
      label: 'Project Internal',
      badgeBg: 'bg-emerald-950/80',
      badgeBorder: 'border-emerald-600',
      textColor: 'text-emerald-400',
      accentBorder: 'border-emerald-500/60',
      gradientFrom: 'from-emerald-950/90',
      description: 'Proyek penataan dan pembangunan infrastruktur jaringan internal perusahaan (Non-GOV).',
      icon: <Building2 className="w-5 h-5 text-emerald-400" />
    }
  };

  // Quarter Metadata Definitions
  const QUARTER_CONFIGS: Record<
    'Q1 - 26' | 'Q2 - 26' | 'Q3 - 26' | 'Q4 - 26',
    {
      title: string;
      label: string;
      badgeBg: string;
      badgeBorder: string;
      textColor: string;
      accentBorder: string;
      gradientFrom: string;
      description: string;
      icon: React.ReactNode;
    }
  > = {
    'Q1 - 26': {
      title: 'Target Pelaksanaan Quarter 1 (Q1 - 26)',
      label: 'Quarter 1 (Jan - Mar 2026)',
      badgeBg: 'bg-cyan-950/80',
      badgeBorder: 'border-cyan-600',
      textColor: 'text-cyan-400',
      accentBorder: 'border-cyan-500/60',
      gradientFrom: 'from-cyan-950/90',
      description: 'Tahapan awal pelaksanaan relokasi quarter pertama meliputi survey trase, penyusunan DED, permohonan rekomendasi teknis dinas, dan persiapan galian awal.',
      icon: <Calendar className="w-5 h-5 text-cyan-400" />
    },
    'Q2 - 26': {
      title: 'Target Pelaksanaan Quarter 2 (Q2 - 26)',
      label: 'Quarter 2 (Apr - Jun 2026)',
      badgeBg: 'bg-emerald-950/80',
      badgeBorder: 'border-emerald-600',
      textColor: 'text-emerald-400',
      accentBorder: 'border-emerald-500/60',
      gradientFrom: 'from-emerald-950/90',
      description: 'Tahapan puncak konstruksi galian subduct, pemasangan manhole/handbox, penarikan kabel FO utama, dan penyelesaian surat SPK trase.',
      icon: <Calendar className="w-5 h-5 text-emerald-400" />
    },
    'Q3 - 26': {
      title: 'Target Pelaksanaan Quarter 3 (Q3 - 26)',
      label: 'Quarter 3 (Jul - Sep 2026)',
      badgeBg: 'bg-orange-950/80',
      badgeBorder: 'border-orange-600',
      textColor: 'text-orange-400',
      accentBorder: 'border-orange-500/60',
      gradientFrom: 'from-orange-950/90',
      description: 'Tahapan migrasi kabel udara ke jaringan bawah tanah, pengujian OTDR serat optik, serta proses pemotongan kabel gantung lama (cut-over).',
      icon: <Calendar className="w-5 h-5 text-orange-400" />
    },
    'Q4 - 26': {
      title: 'Target Pelaksanaan Quarter 4 (Q4 - 26)',
      label: 'Quarter 4 (Okt - Des 2026)',
      badgeBg: 'bg-purple-950/80',
      badgeBorder: 'border-purple-600',
      textColor: 'text-purple-400',
      accentBorder: 'border-purple-500/60',
      gradientFrom: 'from-purple-950/90',
      description: 'Tahapan finalisasi pemulihan trotoar/jalan (reinstatement), penerbitan Berita Acara PHO/FHO, dan penyelesaian administrasi penutupan proyek.',
      icon: <Calendar className="w-5 h-5 text-purple-400" />
    }
  };

  // Status Metadata Definitions & Filtering
  const STATUS_CONFIGS: Record<
    'review dinas' | 'in progress' | 'completed' | 'not started' | 'cancel',
    {
      title: string;
      label: string;
      badgeBg: string;
      badgeBorder: string;
      textColor: string;
      description: string;
      icon: React.ReactNode;
      accentBorder: string;
      gradientFrom: string;
    }
  > = {
    'review dinas': {
      title: 'Review Dinas & Perizinan Trase',
      label: 'Review Dinas',
      badgeBg: 'bg-yellow-950/80',
      badgeBorder: 'border-yellow-500',
      textColor: 'text-yellow-400',
      accentBorder: 'border-yellow-500/60',
      gradientFrom: 'from-yellow-950/80',
      description:
        'Proyek sedang dalam tahap verifikasi dokumen administrasi dinas, perizinan trase jalan, survey kelayakan teknis bersama Dishub/PUPR/Pemda, dan penandatanganan Rekomendasi Teknis (Rekomtek).',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />
    },
    'in progress': {
      title: 'In Progress / Eksekusi Lapangan',
      label: 'In Progress',
      badgeBg: 'bg-orange-950/80',
      badgeBorder: 'border-orange-500',
      textColor: 'text-orange-400',
      accentBorder: 'border-orange-500/60',
      gradientFrom: 'from-orange-950/80',
      description:
        'Pekerjaan fisik relokasi jaringan utilitas bawah tanah sedang berlangsung aktif di lapangan (galian subduct, penggelaran kabel FO, pembuatan Manhole/HH, & penurunan kabel udara).',
      icon: <Clock className="w-5 h-5 text-orange-400" />
    },
    'completed': {
      title: 'Completed / Selesai Sempurna',
      label: 'Completed',
      badgeBg: 'bg-emerald-950/80',
      badgeBorder: 'border-emerald-500',
      textColor: 'text-emerald-400',
      accentBorder: 'border-emerald-500/60',
      gradientFrom: 'from-emerald-950/80',
      description:
        'Pekerjaan relokasi dan cut-over fusi jaringan kabel FO telah 100% selesai dikerjakan, lulus uji OTDR, serta diterbitkan Berita Acara Serah Terima (BAST / PHO).',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
    },
    'not started': {
      title: 'Not Started / Perencanaan SPK',
      label: 'Not Started',
      badgeBg: 'bg-cyan-950/80',
      badgeBorder: 'border-cyan-500',
      textColor: 'text-cyan-400',
      accentBorder: 'border-cyan-500/60',
      gradientFrom: 'from-cyan-950/80',
      description:
        'Proyek telah disetujui dalam perencanaan dan penerbitan Surat Perintah Kerja (SPK), namun pengerjaan galian/konstruksi fisik di lapangan belum dimulai (menunggu jadwal penggelaran).',
      icon: <TrendingUp className="w-5 h-5 text-cyan-400" />
    },
    'cancel': {
      title: 'Cancel / Dibatalkan Dinas',
      label: 'Cancel',
      badgeBg: 'bg-red-950/80',
      badgeBorder: 'border-red-500',
      textColor: 'text-red-400',
      accentBorder: 'border-red-500/60',
      gradientFrom: 'from-red-950/80',
      description:
        'Proyek dibatalkan atau ditunda penanganannya berdasarkan rekomendasi tata ruang dinas, kendala izin pemanfaatan jalan, atau pengalihan program relokasi utama.',
      icon: <Ban className="w-5 h-5 text-red-400" />
    }
  };

  const statusProjectsList = useMemo(() => {
    if (!selectedStatusModal) return [];
    let list = projects.filter(
      (p) => p.projectStatus?.toLowerCase() === selectedStatusModal.toLowerCase()
    );
    if (statusModalSearch.trim()) {
      const q = statusModalSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.projectId.toLowerCase().includes(q) ||
          p.projectDescription.toLowerCase().includes(q) ||
          p.areaLocation.toLowerCase().includes(q) ||
          (p.picIsp && p.picIsp.toLowerCase().includes(q)) ||
          p.projectCategory.toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, selectedStatusModal, statusModalSearch]);

  const categoryProjectsList = useMemo(() => {
    if (!selectedCategoryModal) return [];
    let list = projects.filter((p) => {
      if (selectedCategoryModal === 'Project Internal' || selectedCategoryModal === 'INTERNAL') {
        return p.projectCategory === 'Project Internal' || p.projectCategory === 'INTERNAL';
      }
      return p.projectCategory === selectedCategoryModal;
    });
    if (categoryModalSearch.trim()) {
      const q = categoryModalSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.projectId.toLowerCase().includes(q) ||
          p.projectDescription.toLowerCase().includes(q) ||
          p.areaLocation.toLowerCase().includes(q) ||
          (p.picIsp && p.picIsp.toLowerCase().includes(q))
      );
    }
    return list;
  }, [projects, selectedCategoryModal, categoryModalSearch]);

  const quarterProjectsList = useMemo(() => {
    if (!selectedQuarterModal) return [];
    let list = projects.filter(
      (p) => p.quarter === selectedQuarterModal
    );
    if (quarterModalSearch.trim()) {
      const q = quarterModalSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.projectId.toLowerCase().includes(q) ||
          p.projectDescription.toLowerCase().includes(q) ||
          p.areaLocation.toLowerCase().includes(q) ||
          (p.picIsp && p.picIsp.toLowerCase().includes(q))
      );
    }
    return list;
  }, [projects, selectedQuarterModal, quarterModalSearch]);

  const handleOpenMonitoringModal = (cat: MonitoringCategory) => {
    setMonitoringCategory(cat);
    setIsMonitoringModalOpen(true);
  };

  // Aggregate KPIs
  const totalProjects = projects.length;
  const totalGalianMeters = projects.reduce((acc, p) => acc + (p.panjangRelokasiGalian || 0), 0);
  
  const totalFoMeters = plans.reduce((acc, pl) => {
    const sumCables = pl.foCables?.reduce((s, c) => s + (c.panjang || 0), 0) || 0;
    return acc + sumCables;
  }, 0);

  const totalCrossingMeters = plans.reduce((acc, pl) => {
    return acc + (pl.borringAkses || 0) + (pl.crossingJalan || 0) + (pl.crossingJembatan || 0) + (pl.crossingTol || 0) + (pl.crossingKaliSungai || 0);
  }, 0);

  const totalManholes = plans.reduce((acc, pl) => {
    return acc + (pl.manholes?.reduce((s, m) => s + (m.unit || 0), 0) || 0);
  }, 0);

  const totalHhCount = plans.reduce((acc, pl) => {
    const items = pl.manholes?.filter((m) =>
      m.tipe.startsWith('HH') || m.tipe === '60x60' || m.tipe === '70x70' || m.tipe === '80x80'
    ) || [];
    return acc + items.reduce((s, m) => s + (m.unit || 0), 0);
  }, 0);

  const totalHbCount = plans.reduce((acc, pl) => {
    const items = pl.manholes?.filter((m) =>
      m.tipe.startsWith('HB') || m.tipe.toLowerCase().includes('handbox')
    ) || [];
    return acc + items.reduce((s, m) => s + (m.unit || 0), 0);
  }, 0);

  const totalMhCount = plans.reduce((acc, pl) => {
    const items = pl.manholes?.filter((m) =>
      m.tipe.startsWith('MH') || m.tipe === '90x90' || m.tipe === '100x100' || m.tipe === '110x110' || m.tipe === '120x120'
    ) || [];
    return acc + items.reduce((s, m) => s + (m.unit || 0), 0);
  }, 0);

  const totalGalvanisMeters = plans.reduce((acc, pl) => {
    return acc + (pl.galvanis?.reduce((s, g) => s + (g.meter || 0), 0) || 0);
  }, 0);

  const totalPoles = plans.reduce((acc, pl) => {
    return acc + (pl.poles?.reduce((s, p) => s + (p.unit || 0), 0) || 0);
  }, 0);

  // PO Release Metrics
  const totalPoReleased = projects.filter(p => p.statusPoRelease === 'Released').length;
  const totalPoInProcess = projects.filter(p => p.statusPoRelease === 'In Process').length;
  const totalPoPending = projects.filter(p => p.statusPoRelease === 'Pending' || !p.statusPoRelease).length;
  const totalPoReleasedValue = projects
    .filter(p => p.statusPoRelease === 'Released')
    .reduce((acc, p) => acc + (p.nilaiPo || 0), 0);
  const totalPoAllValue = projects.reduce((acc, p) => acc + (p.nilaiPo || 0), 0);
  const poReleaseRate = totalProjects > 0 ? Math.round((totalPoReleased / totalProjects) * 100) : 0;

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

  // Status Counts
  const statusCounts = {
    'completed': projects.filter(p => p.projectStatus === 'completed').length,
    'in progress': projects.filter(p => p.projectStatus === 'in progress').length,
    'review dinas': projects.filter(p => p.projectStatus === 'review dinas').length,
    'not started': projects.filter(p => p.projectStatus === 'not started').length,
    'cancel': projects.filter(p => p.projectStatus === 'cancel').length,
  };

  // Category Counts
  const categoryCounts = {
    'GOV SJUT': projects.filter(p => p.projectCategory === 'GOV SJUT').length,
    'GOV APJATEL': projects.filter(p => p.projectCategory === 'GOV APJATEL').length,
    'GOV IPPJU': projects.filter(p => p.projectCategory === 'GOV IPPJU').length,
    'Project Internal': projects.filter(p => p.projectCategory === 'Project Internal' || p.projectCategory === 'INTERNAL').length,
  };

  // Projects with PO NOT RELEASE
  const unreleasedPoProjects = useMemo(() => {
    return projects
      .filter((p) => p.statusPoRelease !== 'Released')
      .map((p) => {
        const pPlans = plans.filter((pl) => pl.projectId === p.projectId);
        const ispList = Array.from(
          new Set([
            ...(p.picIsp ? [p.picIsp] : []),
            ...pPlans.map((pl) => pl.namaIsp).filter(Boolean)
          ])
        );
        return {
          ...p,
          ispNames: ispList.length > 0 ? ispList : ['Belum Ada Data ISP']
        };
      });
  }, [projects, plans]);

  // Quarters Breakdown
  const quarters = ['Q1 - 26', 'Q2 - 26', 'Q3 - 26', 'Q4 - 26'] as const;

  return (
    <div className="space-y-6">
      {/* Top Banner with Neon Header & PO NOT RELEASE Telemetry */}
      {/* TOP HEADER & SYMMETRICAL DATA PO RELEASE SUMMARY PANEL */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0d162d] via-[#101426] to-[#150e26] border border-cyan-500/30 p-5 sm:p-6 shadow-xl overflow-hidden neon-glow-cyan space-y-5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-1 border-b border-slate-800/80">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-cyan-400" />
              Pusat Monitoring & Controling
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Data PO Release (Purchase Order & SPK Trase), Status Akselerasi ISP, dan Telemetri Lapangan Real-Time
            </p>
          </div>
          <div className="flex items-center gap-2 self-start lg:self-center">
            <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/80 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              SYSTEM ACTIVE 2026
            </span>
          </div>
        </div>

        {/* SYMMETRICAL 3-COLUMN DATA PO RELEASE SUMMARY GRID */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: PO NOT RELEASE (Perlu Akselerasi) */}
          <div
            onClick={() => {
              setSelectedPoNotReleaseProject(null);
              setIsPoNotReleaseModalOpen(true);
            }}
            className="rounded-xl bg-gradient-to-br from-[#120d20] via-[#16122c] to-[#0c1429] border border-amber-500/60 p-4 shadow-xl backdrop-blur-md cursor-pointer hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all group finger-click flex flex-col justify-between"
            title="Klik untuk melihat rincian proyek PO NOT RELEASE & SPK"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                {/* Icon Lampu Berkedip (Blinking Light Beacon) */}
                <div className="relative flex items-center justify-center shrink-0">
                  <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-8 w-8 bg-amber-950 border border-amber-400 items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]">
                    <Lightbulb className="w-4 h-4 text-amber-300 animate-pulse" />
                  </span>
                </div>
                <div>
                  <span className="text-xs font-mono font-extrabold text-amber-400 uppercase tracking-wider block">
                    PO NOT RELEASE
                  </span>
                  <span className="text-[10px] text-amber-300/80 font-sans font-medium">Perlu Akselerasi Legal & ISP</span>
                </div>
              </div>

              <div className="px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-500/70 text-amber-300 font-mono font-black text-xl tabular-nums shadow-sm">
                {unreleasedPoProjects.length} <span className="text-[10px] font-sans font-semibold text-amber-400">Proyek</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-amber-500/30 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-300 flex items-center gap-1 font-sans">
                Status Telemetri Live
              </span>
              <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Detail <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 2: PO RELEASED (Purchase Order & SPK Terbit) */}
          <div
            onClick={() => {
              setSelectedPoNotReleaseProject(null);
              setIsPoNotReleaseModalOpen(true);
            }}
            className="rounded-xl bg-gradient-to-br from-[#0a1b24] via-[#0d222e] to-[#0c1429] border border-emerald-500/60 p-4 shadow-xl backdrop-blur-md cursor-pointer hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all group finger-click flex flex-col justify-between"
            title="Klik untuk melihat rincian PO RELEASED"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-mono font-extrabold text-emerald-400 uppercase tracking-wider block">
                    PO RELEASED
                  </span>
                  <span className="text-[10px] text-emerald-300/80 font-sans font-medium">Purchase Order & SPK Terbit</span>
                </div>
              </div>

              <div className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/70 text-emerald-300 font-mono font-black text-xl tabular-nums shadow-sm">
                {totalPoReleased} <span className="text-[10px] font-sans font-semibold text-emerald-400">Proyek</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-emerald-500/30 flex items-center justify-between text-[11px] font-mono">
              <span className="text-emerald-300 font-bold">
                Nilai: {formatRupiah(totalPoReleasedValue)}
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Detail <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 3: TOTAL KOMITMEN & RASIO PO */}
          <div
            onClick={() => {
              setSelectedPoNotReleaseProject(null);
              setIsPoNotReleaseModalOpen(true);
            }}
            className="rounded-xl bg-gradient-to-br from-[#0e172e] via-[#101d3b] to-[#0c1429] border border-cyan-500/60 p-4 shadow-xl backdrop-blur-md cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all group finger-click flex flex-col justify-between"
            title="Klik untuk melihat seluruh status komitmen PO & SPK"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                  <Banknote className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <span className="text-xs font-mono font-extrabold text-cyan-400 uppercase tracking-wider block">
                    TOTAL KOMITMEN PO
                  </span>
                  <span className="text-[10px] text-cyan-300/80 font-sans font-medium">Rasio Release: {poReleaseRate}%</span>
                </div>
              </div>

              <div className="px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/70 text-cyan-300 font-mono font-black text-sm tabular-nums shadow-sm">
                {formatRupiah(totalPoAllValue)}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-cyan-500/30 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-300 font-sans">
                {totalPoReleased} dari {totalProjects} Paket Ter-Release
              </span>
              <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Kelola <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Grid with Multi-Color Neon Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Proyek (Cyan) */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="rounded-2xl bg-[#091022] border border-cyan-500/40 p-5 shadow-lg relative overflow-hidden finger-click group hover:bg-[#0c1630] transition-all"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-300">Total Proyek JWS</span>
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 group-hover:scale-110 transition-transform">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {totalProjects} <span className="text-sm font-sans font-normal text-slate-400">Paket</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {statusCounts['completed']} Telah Selesai
            </span>
            <span className="text-cyan-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Buka CRUD <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Panjang Galian & Relokasi (Orange) */}
        <div
          onClick={() => handleOpenMonitoringModal('galian')}
          className="rounded-2xl bg-[#091022] border border-orange-500/40 p-5 shadow-lg relative overflow-hidden finger-click group hover:bg-[#0c1630] transition-all"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-orange-300">Total Galian / Relokasi</span>
            <div className="p-2 rounded-lg bg-orange-950 border border-orange-800 text-orange-400 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {totalGalianMeters.toLocaleString('id-ID')} <span className="text-sm font-sans font-normal text-slate-400">Meter</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-orange-400">
              {(totalGalianMeters / 1000).toFixed(2)} Km trase jalur
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleOpenMonitoringModal('galian');
              }}
              className="text-orange-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
            >
              Detail <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Total Kabel FO Ditarik (Purple) */}
        <div
          onClick={() => handleOpenMonitoringModal('fo')}
          className="rounded-2xl bg-[#091022] border border-purple-500/40 p-5 shadow-lg relative overflow-hidden finger-click group hover:bg-[#0c1630] transition-all"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-300">Kabel Fiber Optik</span>
            <div className="p-2 rounded-lg bg-purple-950 border border-purple-800 text-purple-400 group-hover:scale-110 transition-transform">
              <Cable className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {totalFoMeters.toLocaleString('id-ID')} <span className="text-sm font-sans font-normal text-slate-400">Meter</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-purple-300 font-mono">
              6 Tipe Core (12s/d288)
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleOpenMonitoringModal('fo');
              }}
              className="text-purple-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
            >
              Konstruksi <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 4: HH, HB, MH, Tiang Bersama & Galvanis (Yellow) */}
        <div
          onClick={() => handleOpenMonitoringModal('infrastruktur')}
          className="rounded-2xl bg-[#091022] border border-yellow-500/40 p-5 shadow-lg relative overflow-hidden finger-click group hover:bg-[#0c1630] transition-all"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-yellow-300">HH, HB, MH, Tiang Bersama & Galvanis</span>
            <div className="p-2 rounded-lg bg-yellow-950 border border-yellow-800 text-yellow-400 group-hover:scale-110 transition-transform">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {totalHhCount + totalHbCount + totalMhCount} <span className="text-sm font-sans font-normal text-slate-400">Unit · {totalPoles} Tiang</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-yellow-400 font-mono">
              {totalHhCount} HH · {totalHbCount} HB · {totalMhCount} MH · {totalGalvanisMeters.toLocaleString('id-ID')}m Galvanis
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleOpenMonitoringModal('infrastruktur');
              }}
              className="text-yellow-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
            >
              Lihat <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 5: PO Release Realtime (Emerald Green) */}
        <div
          onClick={() => {
            setIsPoNotReleaseModalOpen(true);
          }}
          className="rounded-2xl bg-[#091022] border border-emerald-500/40 p-5 shadow-lg relative overflow-hidden finger-click group hover:bg-[#0c1630] hover:border-emerald-400 transition-all cursor-pointer"
          title="Klik untuk membuka Detail Status PO & Keterangan ISP"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-300">PO Release Realtime</span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 group-hover:scale-110 transition-transform">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {totalPoReleased} <span className="text-sm font-sans font-normal text-slate-400">Rilis ({poReleaseRate}%)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400 font-mono">
              {formatRupiah(totalPoReleasedValue)}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsPoNotReleaseModalOpen(true);
              }}
              className="text-emerald-300 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
            >
              Detail PO & ISP <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Project Status Dashboard & Quarters Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Status Proyek & Kategori Utilitas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Breakdown Box */}
          <div className="rounded-2xl bg-[#091022] border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Distribusi Status Pekerjaan Proyek
                </h3>
                <p className="text-xs text-slate-400">Monitoring tahapan izin, pelaksanaan galian, dan penyelesaian</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-lg">
                5 Klasifikasi Resmi
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Review Dinas (Yellow) */}
              <div
                onClick={() => {
                  setSelectedStatusModal('review dinas');
                  setStatusModalSearch('');
                }}
                className="p-3.5 rounded-xl bg-yellow-950/20 border border-yellow-600/40 hover:border-yellow-400 hover:bg-yellow-950/40 text-center finger-click transition-all cursor-pointer group shadow-md"
                title="Klik untuk melihat informasi akurat seluruh proyek dengan status Review Dinas"
              >
                <div className="flex items-center justify-center text-yellow-400 mb-1.5 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold font-mono text-yellow-400 tabular-nums">
                  {statusCounts['review dinas']}
                </div>
                <div className="text-[11px] font-semibold text-slate-300 mt-1 uppercase font-mono flex items-center justify-center gap-1">
                  <span>Review Dinas</span>
                  <ArrowUpRight className="w-3 h-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[9px] font-sans text-yellow-400/80 mt-1 font-medium">
                  Klik untuk detail
                </div>
              </div>

              {/* In Progress (Orange) */}
              <div
                onClick={() => {
                  setSelectedStatusModal('in progress');
                  setStatusModalSearch('');
                }}
                className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-600/40 hover:border-orange-400 hover:bg-orange-950/40 text-center finger-click transition-all cursor-pointer group shadow-md"
                title="Klik untuk melihat informasi akurat seluruh proyek dengan status In Progress"
              >
                <div className="flex items-center justify-center text-orange-400 mb-1.5 group-hover:scale-110 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold font-mono text-orange-400 tabular-nums">
                  {statusCounts['in progress']}
                </div>
                <div className="text-[11px] font-semibold text-slate-300 mt-1 uppercase font-mono flex items-center justify-center gap-1">
                  <span>In Progress</span>
                  <ArrowUpRight className="w-3 h-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[9px] font-sans text-orange-400/80 mt-1 font-medium">
                  Klik untuk detail
                </div>
              </div>

              {/* Completed (Emerald) */}
              <div
                onClick={() => {
                  setSelectedStatusModal('completed');
                  setStatusModalSearch('');
                }}
                className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-600/40 hover:border-emerald-400 hover:bg-emerald-950/40 text-center finger-click transition-all cursor-pointer group shadow-md"
                title="Klik untuk melihat informasi akurat seluruh proyek dengan status Completed"
              >
                <div className="flex items-center justify-center text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  {statusCounts['completed']}
                </div>
                <div className="text-[11px] font-semibold text-slate-300 mt-1 uppercase font-mono flex items-center justify-center gap-1">
                  <span>Completed</span>
                  <ArrowUpRight className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[9px] font-sans text-emerald-400/80 mt-1 font-medium">
                  Klik untuk detail
                </div>
              </div>

              {/* Not Started (Cyan) */}
              <div
                onClick={() => {
                  setSelectedStatusModal('not started');
                  setStatusModalSearch('');
                }}
                className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-600/40 hover:border-cyan-400 hover:bg-cyan-950/40 text-center finger-click transition-all cursor-pointer group shadow-md"
                title="Klik untuk melihat informasi akurat seluruh proyek dengan status Not Started"
              >
                <div className="flex items-center justify-center text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                  {statusCounts['not started']}
                </div>
                <div className="text-[11px] font-semibold text-slate-300 mt-1 uppercase font-mono flex items-center justify-center gap-1">
                  <span>Not Started</span>
                  <ArrowUpRight className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[9px] font-sans text-cyan-400/80 mt-1 font-medium">
                  Klik untuk detail
                </div>
              </div>

              {/* Cancel (Red) */}
              <div
                onClick={() => {
                  setSelectedStatusModal('cancel');
                  setStatusModalSearch('');
                }}
                className="p-3.5 rounded-xl bg-red-950/20 border border-red-600/40 hover:border-red-400 hover:bg-red-950/40 text-center col-span-2 sm:col-span-1 finger-click transition-all cursor-pointer group shadow-md"
                title="Klik untuk melihat informasi akurat seluruh proyek dengan status Cancel"
              >
                <div className="flex items-center justify-center text-red-400 mb-1.5 group-hover:scale-110 transition-transform">
                  <Ban className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold font-mono text-red-400 tabular-nums">
                  {statusCounts['cancel']}
                </div>
                <div className="text-[11px] font-semibold text-slate-300 mt-1 uppercase font-mono flex items-center justify-center gap-1">
                  <span>Cancel</span>
                  <ArrowUpRight className="w-3 h-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[9px] font-sans text-red-400/80 mt-1 font-medium">
                  Klik untuk detail
                </div>
              </div>
            </div>

            {/* Status Visual Multi-Segment Bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Rasio Progres Lapangan Real-Time</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {totalProjects ? Math.round((statusCounts['completed'] / totalProjects) * 100) : 0}% Target Selesai
                </span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
                {statusCounts['completed'] > 0 && (
                  <div
                    style={{ width: `${(statusCounts['completed'] / totalProjects) * 100}%` }}
                    className="h-full bg-emerald-500 rounded-sm"
                    title={`Completed: ${statusCounts['completed']}`}
                  />
                )}
                {statusCounts['in progress'] > 0 && (
                  <div
                    style={{ width: `${(statusCounts['in progress'] / totalProjects) * 100}%` }}
                    className="h-full bg-orange-500 rounded-sm ml-0.5"
                    title={`In Progress: ${statusCounts['in progress']}`}
                  />
                )}
                {statusCounts['review dinas'] > 0 && (
                  <div
                    style={{ width: `${(statusCounts['review dinas'] / totalProjects) * 100}%` }}
                    className="h-full bg-yellow-400 rounded-sm ml-0.5"
                    title={`Review Dinas: ${statusCounts['review dinas']}`}
                  />
                )}
                {statusCounts['not started'] > 0 && (
                  <div
                    style={{ width: `${(statusCounts['not started'] / totalProjects) * 100}%` }}
                    className="h-full bg-cyan-400 rounded-sm ml-0.5"
                    title={`Not Started: ${statusCounts['not started']}`}
                  />
                )}
                {statusCounts['cancel'] > 0 && (
                  <div
                    style={{ width: `${(statusCounts['cancel'] / totalProjects) * 100}%` }}
                    className="h-full bg-red-500 rounded-sm ml-0.5"
                    title={`Cancel: ${statusCounts['cancel']}`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="rounded-2xl bg-[#091022] border border-slate-800 p-5 shadow-lg">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-purple-400" />
              Kategori Proyek Regulasi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* GOV APJATEL */}
              <div
                onClick={() => {
                  setSelectedCategoryModal('GOV APJATEL');
                  setCategoryModalSearch('');
                }}
                className="p-4 rounded-xl bg-[#0c1429] border border-yellow-500/40 hover:border-yellow-400 hover:bg-[#111c38] transition-all finger-click cursor-pointer flex flex-col justify-between group shadow-md"
                title="Klik untuk melihat informasi akurat seluruh proyek GOV APJATEL"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
                      GOV APJATEL
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-yellow-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
                    {categoryCounts['GOV APJATEL']} <span className="text-xs font-sans text-slate-400">Proyek</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Penataan dan relokasi kabel udara asosiasi ISP penyelenggara telekomunikasi.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-yellow-400 font-semibold flex items-center justify-between">
                  <span>Klik untuk detail</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-yellow-400" />
                </div>
              </div>

              {/* GOV IPPJU */}
              <div
                onClick={() => {
                  setSelectedCategoryModal('GOV IPPJU');
                  setCategoryModalSearch('');
                }}
                className="p-4 rounded-xl bg-[#0c1429] border border-red-500/40 hover:border-red-400 hover:bg-[#111c38] transition-all finger-click cursor-pointer flex flex-col justify-between group shadow-md"
                title="Klik untuk melihat informasi akurat seluruh proyek GOV IPPJU"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                      GOV IPPJU
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-red-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
                    {categoryCounts['GOV IPPJU']} <span className="text-xs font-sans text-slate-400">Proyek</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Infrastruktur penerangan jalan umum cerdas & tiang sensor smart city.
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-red-400 font-semibold flex items-center justify-between">
                  <span>Klik untuk detail</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                </div>
              </div>

              {/* GOV SJUT */}
              <div
                onClick={() => {
                  setSelectedCategoryModal('GOV SJUT');
                  setCategoryModalSearch('');
                }}
                className="p-4 rounded-xl bg-[#0c1429] border border-purple-500/40 hover:border-purple-400 hover:bg-[#111c38] transition-all finger-click cursor-pointer flex flex-col justify-between group shadow-md"
                title="Klik untuk melihat informasi akurat seluruh proyek GOV SJUT"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      GOV SJUT
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-purple-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
                    {categoryCounts['GOV SJUT']} <span className="text-xs font-sans text-slate-400">Proyek</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Sarana Jaringan Utilitas Terpadu (box ducting bawah tanah koridor utama).
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-purple-400 font-semibold flex items-center justify-between">
                  <span>Klik untuk detail</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
                </div>
              </div>

              {/* PROJECT INTERNAL */}
              <div
                onClick={() => {
                  setSelectedCategoryModal('Project Internal');
                  setCategoryModalSearch('');
                }}
                className="p-4 rounded-xl bg-[#0c1429] border border-emerald-500/40 hover:border-emerald-400 hover:bg-[#111c38] transition-all finger-click cursor-pointer flex flex-col justify-between group shadow-md"
                title="Klik untuk melihat informasi akurat seluruh proyek Project Internal"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      PROJECT INTERNAL
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
                    {categoryCounts['Project Internal']} <span className="text-xs font-sans text-slate-400">Proyek</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Pembangunan dan penataan infrastruktur jaringan internal perusahaan (Non-GOV).
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400 font-semibold flex items-center justify-between">
                  <span>Klik untuk detail</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quarters Tracking (Q1-26 to Q4-26) & Live Feeds */}
        <div className="space-y-6">
          {/* Quarter Timeline */}
          <div className="rounded-2xl bg-[#091022] border border-slate-800 p-5 shadow-lg">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-1">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              Target Pelaksanaan Quarter (2026)
            </h3>
            <p className="text-xs text-slate-400 mb-4">Distribusi tahapan surat dinas & eksekusi fisik</p>

            <div className="space-y-3">
              {quarters.map((q) => {
                const count = projects.filter(p => p.quarter === q).length;
                const meters = projects.filter(p => p.quarter === q).reduce((acc, p) => acc + (p.panjangRelokasiGalian || 0), 0);

                return (
                  <div
                    key={q}
                    onClick={() => {
                      setSelectedQuarterModal(q);
                      setQuarterModalSearch('');
                    }}
                    className="p-3.5 rounded-xl bg-[#0d162d] border border-slate-800 hover:border-cyan-500/60 hover:bg-[#111c38] transition-all cursor-pointer finger-click group flex items-center justify-between shadow-md"
                    title={`Klik untuk melihat informasi akurat seluruh proyek target ${q}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8.5 h-8.5 rounded-lg bg-slate-900 border border-cyan-500/40 group-hover:border-cyan-400 flex items-center justify-center font-mono text-xs font-bold text-cyan-300 shadow-sm">
                        {q.replace(' - 26', '')}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                          <span>{q}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <div className="text-[10px] text-slate-400">{meters.toLocaleString('id-ID')} Meter Galian</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-cyan-400 font-mono tabular-nums">{count} Proyek</div>
                      <div className="text-[10px] text-cyan-300 font-semibold font-mono flex items-center justify-end gap-0.5">
                        <span>Detail</span>
                        <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Realtime Notification / Log Card */}
          <div className="rounded-2xl bg-gradient-to-b from-[#091022] to-[#0d152c] border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                TELEMETRI JWS AKTIF
              </span>
              <span className="text-[10px] text-slate-500 font-mono">STATUS NORMAL</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#070b14] border border-slate-800/80">
                <div className="text-slate-300 font-semibold">Koridor Sudirman - Thamrin Tahap 3</div>
                <div className="text-[10px] text-slate-400 mt-0.5">8 ISP terkoordinasi · 4.850 m galian subduct terpasang</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#070b14] border border-slate-800/80">
                <div className="text-slate-300 font-semibold">Integrasi PJU & Smart Pole Gatot Subroto</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Berita Acara Survey Lengkap · PHO Terverifikasi</div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('gis_map')}
              className="w-full mt-4 py-2 px-3 rounded-xl bg-cyan-950/60 border border-cyan-800/80 hover:bg-cyan-900/60 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors finger-click"
            >
              <span>Buka Visual Peta Trase & GIS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* REALTIME MONITORING CARD GRID MODAL */}
      <RealtimeMonitoringModal
        isOpen={isMonitoringModalOpen}
        onClose={() => setIsMonitoringModalOpen(false)}
        activeCategory={monitoringCategory}
        onSelectCategory={setMonitoringCategory}
        projects={projects}
        plans={plans}
      />

      {/* DEDICATED DATA PO RELEASE & KETERANGAN NAMA ISP POPUP MODAL */}
      {isPoNotReleaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#091022] border-2 border-amber-500/60 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col overflow-hidden text-white font-sans">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/90 via-[#0c1428] to-[#121c36] border-b border-amber-500/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {/* Icon Lampu Berkedip (Blinking Light Beacon) */}
                <div className="relative flex items-center justify-center shrink-0">
                  <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-10 w-10 bg-amber-950 border-2 border-amber-400 items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,1)]">
                    <Lightbulb className="w-6 h-6 text-amber-300 animate-pulse" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-extrabold tracking-wider text-amber-400 font-mono uppercase">
                      DATA PO RELEASE & SPK TRASE (PURCHASE ORDER & ISP)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 text-[11px] font-bold font-mono animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                      {unreleasedPoProjects.length} PO NOT RELEASE · {totalPoReleased} RELEASED
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Pusat Controling Relokasi GOV - Detail Keterangan Nama ISP Terkait, Status Purchase Order & Dokumen SPK
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPoNotReleaseModalOpen(false);
                    onOpenNewProject();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all finger-click flex items-center gap-1.5 font-bold text-xs shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Proyek Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPoNotReleaseModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all finger-click flex items-center gap-1.5 border border-slate-700 font-semibold text-xs shrink-0"
                  title="Kembali / Tutup Modal"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-400" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPoNotReleaseModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors finger-click shrink-0"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Subheader Metric Ribbon */}
            <div className="p-4 bg-[#070d1d] border-b border-slate-800 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#0b1328] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Total Paket</span>
                    <span className="text-base font-extrabold text-cyan-300 tabular-nums">{totalProjects} Proyek</span>
                  </div>
                  <FolderGit2 className="w-5 h-5 text-cyan-400 shrink-0" />
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-300/80 block uppercase">PO RELEASED</span>
                    <span className="text-base font-extrabold text-emerald-300 tabular-nums">{totalPoReleased} Paket</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-300/80 block uppercase">PO NOT RELEASE</span>
                    <span className="text-base font-extrabold text-amber-300 tabular-nums">{unreleasedPoProjects.length} Paket</span>
                  </div>
                  <Lightbulb className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
                </div>
                <div className="p-3 rounded-xl bg-[#0b1328] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Nilai Komitmen</span>
                    <span className="text-sm font-extrabold text-orange-400 tabular-nums">{formatRupiah(totalPoAllValue)}</span>
                  </div>
                  <Banknote className="w-5 h-5 text-orange-400 shrink-0" />
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Project Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedPoNotReleaseProject(null)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border finger-click ${
                    selectedPoNotReleaseProject === null
                      ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 animate-pulse" />
                  Semua PO NOT RELEASE ({unreleasedPoProjects.length})
                </button>
                {unreleasedPoProjects.map((proj) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => setSelectedPoNotReleaseProject(proj)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border finger-click ${
                      selectedPoNotReleaseProject?.id === proj.id
                        ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-amber-500/50'
                    }`}
                  >
                    <span>{proj.projectId}</span>
                  </button>
                ))}
              </div>

              {/* Detailed View for Single Selected Project or Grid for All */}
              {selectedPoNotReleaseProject ? (
                <div className="space-y-5">
                  {/* Project Header Banner */}
                  <div className="p-4.5 rounded-xl bg-[#0d162d] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {selectedPoNotReleaseProject.projectId}
                        </span>
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          {selectedPoNotReleaseProject.projectCategory}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {selectedPoNotReleaseProject.quarter}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{selectedPoNotReleaseProject.projectDescription}</h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        {selectedPoNotReleaseProject.areaLocation}
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-start sm:items-end">
                      <span className="text-[10px] uppercase font-mono text-slate-400 mb-0.5">Status PO Release</span>
                      <span className="px-3.5 py-1.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 text-xs font-extrabold font-mono flex items-center gap-2 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        </span>
                        <Lightbulb className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        PO NOT RELEASE ({selectedPoNotReleaseProject.statusPoRelease || 'Pending'})
                      </span>
                    </div>
                  </div>

                  {/* KETERANGAN NAMA ISP SECTION */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#080e1c] border border-amber-500/40 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                      <h4 className="text-xs sm:text-sm font-extrabold text-amber-400 font-mono uppercase flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-400" />
                        Keterangan Nama ISP Pengeluar / Terkait Proyek
                      </h4>
                      <span className="text-xs font-mono text-slate-400">
                        Total {selectedPoNotReleaseProject.ispNames.length} ISP Terdaftar
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedPoNotReleaseProject.ispNames.map((ispName: string, idx: number) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-600/50 flex items-start gap-3 shadow-sm"
                        >
                          <div className="p-2 rounded-lg bg-amber-900/60 border border-amber-500 text-amber-300 shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white">{ispName}</h5>
                            <p className="text-xs text-amber-300/80 mt-0.5 font-mono">
                              PIC: {selectedPoNotReleaseProject.picIsp || 'Tim Operasional ISP'}
                            </p>
                            <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                              Status PO: Belum Dirilis / Proses Verifikasi Internal ISP
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PO & SPK Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#0c1429] border border-slate-800 shadow-sm">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Nomor PO Release</span>
                      <span className="text-sm font-bold font-mono text-cyan-300">
                        {selectedPoNotReleaseProject.noPoRelease || 'Belum Diterbitkan'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0c1429] border border-slate-800 shadow-sm">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Nomor SPK / Kontrak</span>
                      <span className="text-sm font-bold font-mono text-purple-300">
                        {selectedPoNotReleaseProject.noKontrakSpk || 'KTR-JWS-GOV-2026-001'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0c1429] border border-slate-800 shadow-sm">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Estimasi Nilai PO</span>
                      <span className="text-sm font-bold font-mono text-orange-400">
                        {formatRupiah(selectedPoNotReleaseProject.nilaiPo)}
                      </span>
                    </div>
                  </div>

                  {/* Project Creation & Target Date */}
                  <div className="p-4 rounded-xl bg-[#0c1429] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono shadow-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-slate-400">Project Create Date:</span>
                      <strong className="text-cyan-300">
                        {formatProjectCreateDate(selectedPoNotReleaseProject.createdAt)}
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-slate-400">Target Release PO:</span>
                      <strong className="text-amber-300">Q1-2026 / Prioritas Relokasi Dinas</strong>
                    </div>
                  </div>

                  {/* Actionable Notes & Acceleration Plan */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 to-[#0c1429] border border-amber-500/30 space-y-2 shadow-sm">
                    <h5 className="text-xs font-extrabold text-amber-400 font-mono uppercase flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-300 animate-pulse" />
                      Rekomendasi & Langkah Akselerasi Release PO ISP:
                    </h5>
                    <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                      <li>Follow-up Berita Acara Survey lokasi relokasi GOV ke Manajemen ISP terkait.</li>
                      <li>Koordinasi penerbitan Surat Perintah Kerja (SPK) & penandatanganan dokumen PO legal.</li>
                      <li>Kirim Notifikasi Pengingat Jadwal Relokasi Infrastruktur Bawah Tanah JWS.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Symmetrical Grid View for All Unreleased PO Projects */
                <div className="space-y-4">
                  <div className="text-xs text-slate-300 font-mono flex items-center justify-between">
                    <span>
                      Menampilkan <strong className="text-amber-400">{unreleasedPoProjects.length}</strong> proyek dengan status PO NOT RELEASE:
                    </span>
                    <span className="text-slate-400">
                      Klik kartu untuk melihat rincian SPK & Keterangan ISP
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unreleasedPoProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPoNotReleaseProject(p)}
                        className="p-4 rounded-xl bg-[#0c1429] border border-amber-500/40 hover:border-amber-400 transition-all finger-click hover:bg-[#111c38] flex flex-col justify-between space-y-3 relative overflow-hidden group shadow-lg"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                              {p.projectId}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 animate-pulse">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                              </span>
                              <Lightbulb className="w-3 h-3 text-amber-300 animate-pulse shrink-0" />
                              PO NOT RELEASE
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                            {p.projectDescription}
                          </h5>
                          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            {p.areaLocation}
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                              Keterangan Nama ISP:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {p.ispNames.map((isp: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-semibold text-amber-300 bg-amber-950/90 border border-amber-700 px-2.5 py-0.5 rounded flex items-center gap-1"
                                >
                                  <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                                  {isp}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80 gap-2">
                            <span>Create: {formatProjectCreateDate(p.createdAt)}</span>
                            <div className="flex items-center gap-1.5 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsPoNotReleaseModalOpen(false);
                                  if (onEditProject) onEditProject(p);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-600 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold font-sans flex items-center gap-1 transition-colors finger-click shadow-sm"
                                title="Edit data proyek ini"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Yakin ingin menghapus proyek ${p.projectId} (${p.areaLocation})?`)) {
                                    if (onDeleteProject) onDeleteProject(p.id);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-700 text-red-300 hover:bg-red-900/80 text-xs font-semibold font-sans flex items-center gap-1 transition-colors finger-click shadow-sm"
                                title="Hapus proyek ini"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#070b16] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
              <div>
                Pusat Controling Relokasi GOV · Status Purchase Order & SPK Trase
              </div>
              <button
                type="button"
                onClick={() => setIsPoNotReleaseModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-sans font-semibold transition-colors finger-click flex items-center gap-1.5 border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>Kembali / Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ACCURATE STATUS DETAIL MODAL FOR REVIEW DINAS, IN PROGRESS, COMPLETED, NOT STARTED, CANCEL */}
      {selectedStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`relative w-full max-w-5xl max-h-[90vh] bg-[#091022] border-2 ${STATUS_CONFIGS[selectedStatusModal].accentBorder} rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white font-sans`}>
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 bg-gradient-to-r ${STATUS_CONFIGS[selectedStatusModal].gradientFrom} via-[#0c1428] to-[#121c36] border-b border-slate-800 flex items-center justify-between shrink-0`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${STATUS_CONFIGS[selectedStatusModal].badgeBg} border ${STATUS_CONFIGS[selectedStatusModal].badgeBorder}`}>
                  {STATUS_CONFIGS[selectedStatusModal].icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-base sm:text-lg font-extrabold tracking-wider ${STATUS_CONFIGS[selectedStatusModal].textColor} font-mono uppercase`}>
                      {STATUS_CONFIGS[selectedStatusModal].title}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full ${STATUS_CONFIGS[selectedStatusModal].badgeBg} border ${STATUS_CONFIGS[selectedStatusModal].badgeBorder} ${STATUS_CONFIGS[selectedStatusModal].textColor} text-[11px] font-bold font-mono`}>
                      {projects.filter(p => p.projectStatus?.toLowerCase() === selectedStatusModal.toLowerCase()).length} Paket Proyek
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    {STATUS_CONFIGS[selectedStatusModal].description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatusModal(null);
                    onOpenNewProject();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all finger-click flex items-center gap-1.5 font-bold text-xs shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Proyek Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatusModal(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all finger-click flex items-center gap-1.5 border border-slate-700 font-semibold text-xs shrink-0"
                  title="Kembali / Tutup Modal"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatusModal(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors finger-click shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Search & Navigation Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#0c1429] border border-slate-800">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={statusModalSearch}
                    onChange={(e) => setStatusModalSearch(e.target.value)}
                    placeholder="Cari ID Proyek, lokasi, deskripsi, atau ISP..."
                    className="w-full bg-[#070b16] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  {statusModalSearch && (
                    <button
                      onClick={() => setStatusModalSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 w-full sm:w-auto justify-between sm:justify-end">
                  <span>
                    Menampilkan <strong className={STATUS_CONFIGS[selectedStatusModal].textColor}>{statusProjectsList.length}</strong> paket
                  </span>
                  <button
                    onClick={() => {
                      setSelectedStatusModal(null);
                      onNavigateTab('projects');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 transition-colors flex items-center gap-1.5 font-sans font-semibold finger-click"
                  >
                    <span>Buka Tabel Relokasi CRUD</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Project Cards List */}
              {statusProjectsList.length === 0 ? (
                <div className="p-8 text-center bg-[#0c1429] border border-slate-800 rounded-xl space-y-2">
                  <Info className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">
                    {statusModalSearch
                      ? 'Tidak ditemukan proyek yang cocok dengan kata kunci pencarian.'
                      : `Belum ada proyek dengan status "${STATUS_CONFIGS[selectedStatusModal].label}".`}
                  </p>
                  <p className="text-xs text-slate-500">
                    Anda dapat mengubah status proyek atau menambah data baru melalui modul Relokasi.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {statusProjectsList.map((p) => {
                    const pPlans = plans.filter((pl) => pl.projectId === p.projectId);
                    const isps = Array.from(
                      new Set([
                        ...(p.picIsp ? [p.picIsp] : []),
                        ...pPlans.map((pl) => pl.namaIsp).filter(Boolean)
                      ])
                    );

                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-[#0c1429] border border-slate-800 hover:border-slate-700 transition-all space-y-3 relative overflow-hidden shadow-lg flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Top Row */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                              {p.projectId}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                              {p.projectCategory}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white leading-snug">
                            {p.projectDescription}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            {p.areaLocation}
                          </p>

                          {/* Progress bar */}
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-slate-400">Progres Fisik Lapangan:</span>
                              <strong className={STATUS_CONFIGS[selectedStatusModal].textColor}>
                                {p.projectStatus === 'completed' ? 100 : p.projectStatus === 'in progress' ? 60 : p.projectStatus === 'review dinas' ? 25 : 0}%
                              </strong>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                              <div
                                style={{
                                  width: `${
                                    p.projectStatus === 'completed'
                                      ? 100
                                      : p.projectStatus === 'in progress'
                                      ? 60
                                      : p.projectStatus === 'review dinas'
                                      ? 25
                                      : 0
                                  }%`
                                }}
                                className={`h-full ${
                                  selectedStatusModal === 'completed'
                                    ? 'bg-emerald-500'
                                    : selectedStatusModal === 'in progress'
                                    ? 'bg-orange-500'
                                    : selectedStatusModal === 'review dinas'
                                    ? 'bg-yellow-400'
                                    : selectedStatusModal === 'not started'
                                    ? 'bg-cyan-400'
                                    : 'bg-red-500'
                                } rounded-sm transition-all duration-500`}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                          {/* Metadata Grid */}
                          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                            <div className="p-2 rounded bg-[#070b16] border border-slate-800">
                              <span className="text-slate-500 block text-[9px] uppercase">Galian Relokasi</span>
                              <span className="font-bold text-orange-400">
                                {(p.panjangRelokasiGalian || 0).toLocaleString('id-ID')} m
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#070b16] border border-slate-800">
                              <span className="text-slate-500 block text-[9px] uppercase">Target Quarter</span>
                              <span className="font-bold text-cyan-300">{p.quarter}</span>
                            </div>
                            <div className="p-2 rounded bg-[#070b16] border border-slate-800">
                              <span className="text-slate-500 block text-[9px] uppercase">Status PO</span>
                              <span className={`font-bold ${p.statusPoRelease === 'Released' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {p.statusPoRelease || 'Pending'}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#070b16] border border-slate-800">
                              <span className="text-slate-500 block text-[9px] uppercase">Nilai PO / Kontrak</span>
                              <span className="font-bold text-emerald-300">{formatRupiah(p.nilaiPo)}</span>
                            </div>
                          </div>

                          {/* ISP Names */}
                          <div className="p-2 rounded bg-[#070b16] border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 font-mono uppercase block">
                              ISP Terkait:
                            </span>
                            {isps.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {isps.map((isp, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-semibold"
                                  >
                                    {isp}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Belum ada data ISP</span>
                            )}
                          </div>

                          {/* Bottom Row with CRUD actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 gap-2">
                            <span>Tgl Buat: {formatProjectCreateDate(p.createdAt)}</span>
                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStatusModal(null);
                                  if (onEditProject) onEditProject(p);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-600 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold font-sans flex items-center gap-1 transition-colors finger-click shadow-sm"
                                title="Edit data proyek ini"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Yakin ingin menghapus proyek ${p.projectId} (${p.areaLocation})?`)) {
                                    if (onDeleteProject) onDeleteProject(p.id);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-700 text-red-300 hover:bg-red-900/80 text-xs font-semibold font-sans flex items-center gap-1 transition-colors finger-click shadow-sm"
                                title="Hapus proyek ini"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#070b16] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
              <div>
                Pusat Monitoring Relokasi GOV · Detail Status {STATUS_CONFIGS[selectedStatusModal].label}
              </div>
              <button
                type="button"
                onClick={() => setSelectedStatusModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-sans font-semibold transition-colors finger-click flex items-center gap-2 border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span>Kembali / Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCURATE CATEGORY DETAIL MODAL (GOV APJATEL, GOV IPPJU, GOV SJUT) */}
      {selectedCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`relative w-full max-w-5xl max-h-[90vh] bg-[#091022] border-2 ${CATEGORY_CONFIGS[selectedCategoryModal].accentBorder} rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white font-sans`}>
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 bg-gradient-to-r ${CATEGORY_CONFIGS[selectedCategoryModal].gradientFrom} via-[#0c1428] to-[#121c36] border-b border-slate-800 flex items-center justify-between shrink-0`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${CATEGORY_CONFIGS[selectedCategoryModal].badgeBg} border ${CATEGORY_CONFIGS[selectedCategoryModal].badgeBorder}`}>
                  {CATEGORY_CONFIGS[selectedCategoryModal].icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-base sm:text-lg font-extrabold tracking-wider ${CATEGORY_CONFIGS[selectedCategoryModal].textColor} font-mono uppercase`}>
                      {CATEGORY_CONFIGS[selectedCategoryModal].title}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full ${CATEGORY_CONFIGS[selectedCategoryModal].badgeBg} border ${CATEGORY_CONFIGS[selectedCategoryModal].badgeBorder} ${CATEGORY_CONFIGS[selectedCategoryModal].textColor} text-[11px] font-bold font-mono`}>
                      {categoryProjectsList.length} Paket Proyek
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    {CATEGORY_CONFIGS[selectedCategoryModal].description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryModal(null);
                    onOpenNewProject();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all finger-click flex items-center gap-1.5 font-bold text-xs shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Proyek Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryModal(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all finger-click flex items-center gap-1.5 border border-slate-700 font-semibold text-xs shrink-0"
                  title="Kembali / Tutup Modal"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryModal(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors finger-click shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Search & Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#0c1429] border border-slate-800">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={categoryModalSearch}
                    onChange={(e) => setCategoryModalSearch(e.target.value)}
                    placeholder="Cari ID Proyek, lokasi, deskripsi, atau ISP..."
                    className="w-full bg-[#070b16] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  {categoryModalSearch && (
                    <button
                      onClick={() => setCategoryModalSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 w-full sm:w-auto justify-between sm:justify-end">
                  <span>
                    Menampilkan <strong className={CATEGORY_CONFIGS[selectedCategoryModal].textColor}>{categoryProjectsList.length}</strong> paket
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategoryModal(null);
                      onNavigateTab('projects');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 transition-colors flex items-center gap-1.5 font-sans font-semibold finger-click"
                  >
                    <span>Buka Tabel Relokasi CRUD</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Project Cards List */}
              {categoryProjectsList.length === 0 ? (
                <div className="p-8 text-center bg-[#0c1429] border border-slate-800 rounded-xl space-y-2">
                  <Info className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">
                    {categoryModalSearch
                      ? 'Tidak ditemukan proyek yang cocok dengan kata kunci pencarian.'
                      : `Belum ada data proyek terdaftar untuk kategori "${selectedCategoryModal}".`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryProjectsList.map((p) => {
                    const pPlans = plans.filter((pl) => pl.projectId === p.projectId);
                    const isps = Array.from(
                      new Set([
                        ...(p.picIsp ? [p.picIsp] : []),
                        ...pPlans.map((pl) => pl.namaIsp).filter(Boolean)
                      ])
                    );

                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-[#0c1429] border border-slate-800 hover:border-slate-700 transition-all space-y-3 relative overflow-hidden shadow-lg flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                              {p.projectId}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              p.projectStatus === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              p.projectStatus === 'in progress' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                              p.projectStatus === 'review dinas' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                              'bg-slate-900 text-slate-300 border border-slate-800'
                            }`}>
                              {p.projectStatus || 'Not Started'}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white leading-snug">
                            {p.projectDescription}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            {p.areaLocation}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                            <div className="p-2 rounded bg-[#070b16] border border-slate-800">
                              <span className="text-slate-500 block text-[9px] uppercase">Galian Relokasi</span>
                              <span className="font-bold text-orange-400">
                                {(p.panjangRelokasiGalian || 0).toLocaleString('id-ID')} m
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#070b16] border border-slate-800">
                              <span className="text-slate-500 block text-[9px] uppercase">Target Quarter</span>
                              <span className="font-bold text-cyan-300">{p.quarter}</span>
                            </div>
                            <div className="p-2 rounded bg-[#070b16] border border-slate-800">
                              <span className="text-slate-500 block text-[9px] uppercase">Status PO</span>
                              <span className={`font-bold ${p.statusPoRelease === 'Released' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {p.statusPoRelease || 'Pending'}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#070b16] border border-slate-800">
                              <span className="text-slate-500 block text-[9px] uppercase">Nilai PO / Kontrak</span>
                              <span className="font-bold text-emerald-300">{formatRupiah(p.nilaiPo)}</span>
                            </div>
                          </div>

                          <div className="p-2 rounded bg-[#070b16] border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 font-mono uppercase block">
                              ISP Terkait:
                            </span>
                            {isps.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {isps.map((isp, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-semibold"
                                  >
                                    {isp}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Belum ada data ISP</span>
                            )}
                          </div>

                          {/* Bottom Row with CRUD actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 gap-2">
                            <span>Tgl Buat: {formatProjectCreateDate(p.createdAt)}</span>
                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategoryModal(null);
                                  if (onEditProject) onEditProject(p);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-600 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold font-sans flex items-center gap-1 transition-colors finger-click shadow-sm"
                                title="Edit data proyek ini"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Yakin ingin menghapus proyek ${p.projectId} (${p.areaLocation})?`)) {
                                    if (onDeleteProject) onDeleteProject(p.id);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-700 text-red-300 hover:bg-red-900/80 text-xs font-semibold font-sans flex items-center gap-1 transition-colors finger-click shadow-sm"
                                title="Hapus proyek ini"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#070b16] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
              <div>
                Pusat Monitoring Relokasi GOV · Detail Kategori {CATEGORY_CONFIGS[selectedCategoryModal].label}
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategoryModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-sans font-semibold transition-colors finger-click flex items-center gap-2 border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span>Kembali / Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCURATE QUARTER DETAIL MODAL (Q1 - 26, Q2 - 26, Q3 - 26, Q4 - 26) */}
      {selectedQuarterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`relative w-full max-w-5xl max-h-[90vh] bg-[#091022] border-2 ${QUARTER_CONFIGS[selectedQuarterModal].accentBorder} rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white font-sans`}>
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 bg-gradient-to-r ${QUARTER_CONFIGS[selectedQuarterModal].gradientFrom} via-[#0c1428] to-[#121c36] border-b border-slate-800 flex items-center justify-between shrink-0`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${QUARTER_CONFIGS[selectedQuarterModal].badgeBg} border ${QUARTER_CONFIGS[selectedQuarterModal].badgeBorder}`}>
                  {QUARTER_CONFIGS[selectedQuarterModal].icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-base sm:text-lg font-extrabold tracking-wider ${QUARTER_CONFIGS[selectedQuarterModal].textColor} font-mono uppercase`}>
                      {QUARTER_CONFIGS[selectedQuarterModal].title}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full ${QUARTER_CONFIGS[selectedQuarterModal].badgeBg} border ${QUARTER_CONFIGS[selectedQuarterModal].badgeBorder} ${QUARTER_CONFIGS[selectedQuarterModal].textColor} text-[11px] font-bold font-mono`}>
                      {quarterProjectsList.length} Paket Proyek Target
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    {QUARTER_CONFIGS[selectedQuarterModal].description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuarterModal(null);
                    onOpenNewProject();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all finger-click flex items-center gap-1.5 font-bold text-xs shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Proyek Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQuarterModal(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all finger-click flex items-center gap-1.5 border border-slate-700 font-semibold text-xs shrink-0"
                  title="Kembali / Tutup Modal"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQuarterModal(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors finger-click shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Search & Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#0c1429] border border-slate-800">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={quarterModalSearch}
                    onChange={(e) => setQuarterModalSearch(e.target.value)}
                    placeholder="Cari ID Proyek, lokasi, deskripsi, atau ISP..."
                    className="w-full bg-[#070b16] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  {quarterModalSearch && (
                    <button
                      onClick={() => setQuarterModalSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 w-full sm:w-auto justify-between sm:justify-end">
                  <span>
                    Menampilkan <strong className={QUARTER_CONFIGS[selectedQuarterModal].textColor}>{quarterProjectsList.length}</strong> paket
                  </span>
                  <button
                    onClick={() => {
                      setSelectedQuarterModal(null);
                      onNavigateTab('projects');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 transition-colors flex items-center gap-1.5 font-sans font-semibold finger-click"
                  >
                    <span>Buka Tabel Relokasi CRUD</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Project Cards List */}
              {quarterProjectsList.length === 0 ? (
                <div className="p-8 text-center bg-[#0c1429] border border-slate-800 rounded-xl space-y-2">
                  <Info className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">
                    {quarterModalSearch
                      ? 'Tidak ditemukan proyek yang cocok dengan kata kunci pencarian.'
                      : `Belum ada proyek dengan target pelaksanaan "${selectedQuarterModal}".`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quarterProjectsList.map((p) => {
                    const pPlans = plans.filter((pl) => pl.projectId === p.projectId);
                    const isps = Array.from(
                      new Set([
                        ...(p.picIsp ? [p.picIsp] : []),
                        ...pPlans.map((pl) => pl.namaIsp).filter(Boolean)
                      ])
                    );

                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-[#0c1429] border border-slate-800 hover:border-slate-700 transition-all space-y-3 relative overflow-hidden shadow-lg flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                              {p.projectId}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                              {p.projectCategory}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white leading-snug">
                            {p.projectDescription}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            {p.areaLocation}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                            <div className="p-2 rounded bg-[#070b16] border border-slate-800">
                              <span className="text-slate-500 block text-[9px] uppercase">Galian Relokasi</span>
                              <span className="font-bold text-orange-400">
                                {(p.panjangRelokasiGalian || 0).toLocaleString('id-ID')} m
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#070b16] border border-slate-800">
                              <span className="text-slate-500 block text-[9px] uppercase">Status Proyek</span>
                              <span className="font-bold text-cyan-300 capitalize">{p.projectStatus || 'Not Started'}</span>
                            </div>
                            <div className="p-2 rounded bg-[#070b16] border border-slate-800">
                              <span className="text-slate-500 block text-[9px] uppercase">Status PO</span>
                              <span className={`font-bold ${p.statusPoRelease === 'Released' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {p.statusPoRelease || 'Pending'}
                              </span>
                            </div>
                            <div className="p-2 rounded bg-[#070b16] border border-slate-800">
                              <span className="text-slate-500 block text-[9px] uppercase">Nilai PO / Kontrak</span>
                              <span className="font-bold text-emerald-300">{formatRupiah(p.nilaiPo)}</span>
                            </div>
                          </div>

                          <div className="p-2 rounded bg-[#070b16] border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 font-mono uppercase block">
                              ISP Terkait:
                            </span>
                            {isps.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {isps.map((isp, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-semibold"
                                  >
                                    {isp}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Belum ada data ISP</span>
                            )}
                          </div>

                          {/* Bottom Row with CRUD actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 gap-2">
                            <span>Tgl Buat: {formatProjectCreateDate(p.createdAt)}</span>
                            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedQuarterModal(null);
                                  if (onEditProject) onEditProject(p);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-600 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold font-sans flex items-center gap-1 transition-colors finger-click shadow-sm"
                                title="Edit data proyek ini"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Yakin ingin menghapus proyek ${p.projectId} (${p.areaLocation})?`)) {
                                    if (onDeleteProject) onDeleteProject(p.id);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-700 text-red-300 hover:bg-red-900/80 text-xs font-semibold font-sans flex items-center gap-1 transition-colors finger-click shadow-sm"
                                title="Hapus proyek ini"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#070b16] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
              <div>
                Pusat Monitoring Relokasi GOV · Target {QUARTER_CONFIGS[selectedQuarterModal].label}
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuarterModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-sans font-semibold transition-colors finger-click flex items-center gap-2 border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span>Kembali / Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Search,
  X,
  ExternalLink,
  Layers,
  HardHat,
  Cable,
  Box,
  Banknote,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderGit2,
  TrendingUp,
  Info,
  Filter,
  ArrowRight
} from 'lucide-react';
import {
  ProjectItem,
  ConstructionPlanItem,
  ProjectCategory,
  ProjectStatus,
  QuarterOption,
  PoReleaseStatus
} from '../types';

export interface ChartDataItem {
  id: string;
  label: string;
  value: number;
  secondaryValue?: number;
  formattedValue: string;
  percentage: number;
  color: string;
  glowColor: string;
  category?: string;
  rawProjects?: ProjectItem[];
  rawPlans?: ConstructionPlanItem[];
}

interface InteractiveChartsProps {
  projects: ProjectItem[];
  plans: ConstructionPlanItem[];
  onNavigateTab?: (tab: any) => void;
}

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({
  projects,
  plans,
  onNavigateTab
}) => {
  // Chart Selection States
  const [pieDataset, setPieDataset] = useState<'status' | 'category' | 'fo_cores' | 'manholes' | 'po_status'>('status');
  const [barDataset, setBarDataset] = useState<'isp_galian' | 'category_po' | 'quarter_projects' | 'cable_meters'>('isp_galian');

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<{
    title: string;
    datasetType: string;
    item: ChartDataItem;
  } | null>(null);

  const [modalSearch, setModalSearch] = useState('');

  // COLOR PALETTES
  const PALETTE = [
    { color: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)' }, // Neon Cyan
    { color: '#e056fd', glow: 'rgba(224, 86, 253, 0.4)' }, // Neon Magenta
    { color: '#f1c40f', glow: 'rgba(241, 196, 15, 0.4)' }, // Neon Gold
    { color: '#2ecc71', glow: 'rgba(46, 204, 113, 0.4)' }, // Neon Emerald
    { color: '#ff7675', glow: 'rgba(255, 118, 117, 0.4)' }, // Neon Coral
    { color: '#0984e3', glow: 'rgba(9, 132, 227, 0.4)' },  // Electric Blue
    { color: '#fd79a8', glow: 'rgba(253, 121, 168, 0.4)' }, // Pink
    { color: '#e67e22', glow: 'rgba(230, 126, 34, 0.4)' },  // Amber
  ];

  // Helper formatting
  const formatRupiah = (val: number) => {
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(2)} Miliar`;
    if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(0)} Juta`;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  // -------------------------------------------------------------
  // DATA PREPARATION FOR PIE CHART
  // -------------------------------------------------------------
  const pieData: ChartDataItem[] = useMemo(() => {
    if (pieDataset === 'status') {
      const statusMap: Record<ProjectStatus, ProjectItem[]> = {
        'completed': [],
        'in progress': [],
        'review dinas': [],
        'not started': [],
        'cancel': []
      };
      projects.forEach((p) => {
        if (statusMap[p.projectStatus]) statusMap[p.projectStatus].push(p);
      });

      const total = projects.length || 1;
      const statusLabels: Record<ProjectStatus, string> = {
        'completed': 'Selesai (Completed)',
        'in progress': 'Dalam Proses (In Progress)',
        'review dinas': 'Review Dinas',
        'not started': 'Belum Mulai (Not Started)',
        'cancel': 'Batal (Cancel)'
      };

      const statusColors: Record<ProjectStatus, { color: string; glow: string }> = {
        'completed': { color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
        'in progress': { color: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)' },
        'review dinas': { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
        'not started': { color: '#64748b', glow: 'rgba(100, 116, 139, 0.4)' },
        'cancel': { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' }
      };

      return (Object.keys(statusMap) as ProjectStatus[])
        .map((statusKey, idx) => {
          const projs = statusMap[statusKey];
          const count = projs.length;
          const pct = Math.round((count / total) * 100);
          return {
            id: `pie-status-${statusKey}`,
            label: statusLabels[statusKey],
            value: count,
            formattedValue: `${count} Paket Proyek`,
            percentage: pct,
            color: statusColors[statusKey].color,
            glowColor: statusColors[statusKey].glow,
            category: 'Status Proyek',
            rawProjects: projs
          };
        })
        .filter((d) => d.value > 0);
    }

    if (pieDataset === 'category') {
      const catMap: Record<ProjectCategory, ProjectItem[]> = {
        'GOV SJUT': [],
        'GOV APJATEL': [],
        'GOV IPPJU': [],
        'Project Internal': [],
        'INTERNAL': []
      };
      projects.forEach((p) => {
        if (catMap[p.projectCategory]) catMap[p.projectCategory].push(p);
      });

      const total = projects.length || 1;
      const catColors: Record<ProjectCategory, { color: string; glow: string }> = {
        'GOV SJUT': { color: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)' },
        'GOV APJATEL': { color: '#e056fd', glow: 'rgba(224, 86, 253, 0.4)' },
        'GOV IPPJU': { color: '#f1c40f', glow: 'rgba(241, 196, 15, 0.4)' },
        'Project Internal': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)' },
        'INTERNAL': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)' }
      };

      return (Object.keys(catMap) as ProjectCategory[]).map((catKey) => {
        const projs = catMap[catKey];
        const count = projs.length;
        const pct = Math.round((count / total) * 100);
        return {
          id: `pie-cat-${catKey}`,
          label: catKey,
          value: count,
          formattedValue: `${count} Paket Proyek`,
          percentage: pct,
          color: catColors[catKey].color,
          glowColor: catColors[catKey].glow,
          category: 'Kategori Proyek',
          rawProjects: projs
        };
      });
    }

    if (pieDataset === 'fo_cores') {
      const coreMap: Record<string, { meters: number; plansList: ConstructionPlanItem[] }> = {};
      plans.forEach((pl) => {
        pl.foCables?.forEach((c) => {
          if (!coreMap[c.tipe]) {
            coreMap[c.tipe] = { meters: 0, plansList: [] };
          }
          coreMap[c.tipe].meters += c.panjang || 0;
          if (!coreMap[c.tipe].plansList.some((p) => p.id === pl.id)) {
            coreMap[c.tipe].plansList.push(pl);
          }
        });
      });

      const totalMeters = Object.values(coreMap).reduce((acc, curr) => acc + curr.meters, 0) || 1;

      return Object.entries(coreMap).map(([type, data], idx) => {
        const pct = Math.round((data.meters / totalMeters) * 100);
        const palette = PALETTE[idx % PALETTE.length];
        return {
          id: `pie-core-${type}`,
          label: type,
          value: data.meters,
          formattedValue: `${data.meters.toLocaleString('id-ID')} Meter`,
          percentage: pct,
          color: palette.color,
          glowColor: palette.glow,
          category: 'Spesifikasi Core FO',
          rawPlans: data.plansList
        };
      });
    }

    if (pieDataset === 'manholes') {
      const mhMap: Record<string, { units: number; plansList: ConstructionPlanItem[] }> = {};
      plans.forEach((pl) => {
        pl.manholes?.forEach((m) => {
          if (!mhMap[m.tipe]) {
            mhMap[m.tipe] = { units: 0, plansList: [] };
          }
          mhMap[m.tipe].units += m.unit || 0;
          if (!mhMap[m.tipe].plansList.some((p) => p.id === pl.id)) {
            mhMap[m.tipe].plansList.push(pl);
          }
        });
      });

      const totalUnits = Object.values(mhMap).reduce((acc, curr) => acc + curr.units, 0) || 1;

      return Object.entries(mhMap).map(([type, data], idx) => {
        const pct = Math.round((data.units / totalUnits) * 100);
        const palette = PALETTE[idx % PALETTE.length];
        return {
          id: `pie-mh-${type}`,
          label: `Tipe ${type}`,
          value: data.units,
          formattedValue: `${data.units} Unit`,
          percentage: pct,
          color: palette.color,
          glowColor: palette.glow,
          category: 'Dimensi Manhole / Handhole',
          rawPlans: data.plansList
        };
      });
    }

    if (pieDataset === 'po_status') {
      const poMap: Record<PoReleaseStatus, ProjectItem[]> = {
        'Released': [],
        'In Process': [],
        'Pending': []
      };

      projects.forEach((p) => {
        const status = p.statusPoRelease || 'Pending';
        if (poMap[status]) poMap[status].push(p);
      });

      const total = projects.length || 1;
      const poColors: Record<PoReleaseStatus, { color: string; glow: string }> = {
        'Released': { color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
        'In Process': { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
        'Pending': { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' }
      };

      return (['Released', 'In Process', 'Pending'] as PoReleaseStatus[]).map((st) => {
        const projs = poMap[st];
        const count = projs.length;
        const pct = Math.round((count / total) * 100);
        return {
          id: `pie-po-${st}`,
          label: `Status PO: ${st}`,
          value: count,
          formattedValue: `${count} Paket Proyek`,
          percentage: pct,
          color: poColors[st].color,
          glowColor: poColors[st].glow,
          category: 'Status Release PO',
          rawProjects: projs
        };
      });
    }

    return [];
  }, [pieDataset, projects, plans]);

  // -------------------------------------------------------------
  // DATA PREPARATION FOR BAR CHART
  // -------------------------------------------------------------
  const barData: ChartDataItem[] = useMemo(() => {
    if (barDataset === 'isp_galian') {
      const ispMap: Record<string, { galianMeters: number; plansList: ConstructionPlanItem[]; projsList: ProjectItem[] }> = {};

      plans.forEach((pl) => {
        if (!ispMap[pl.namaIsp]) {
          ispMap[pl.namaIsp] = { galianMeters: 0, plansList: [], projsList: [] };
        }
        ispMap[pl.namaIsp].galianMeters += pl.panjangRelokasiGalian || 0;
        ispMap[pl.namaIsp].plansList.push(pl);
      });

      // Match with projects
      projects.forEach((p) => {
        if (ispMap[p.picIsp]) {
          if (!ispMap[p.picIsp].projsList.some((pj) => pj.id === p.id)) {
            ispMap[p.picIsp].projsList.push(p);
          }
        }
      });

      const totalGalian = Object.values(ispMap).reduce((acc, curr) => acc + curr.galianMeters, 0) || 1;

      return Object.entries(ispMap)
        .map(([isp, data], idx) => {
          const pct = Math.round((data.galianMeters / totalGalian) * 100);
          const palette = PALETTE[idx % PALETTE.length];
          return {
            id: `bar-isp-${isp}`,
            label: isp,
            value: data.galianMeters,
            formattedValue: `${data.galianMeters.toLocaleString('id-ID')} m`,
            percentage: pct,
            color: palette.color,
            glowColor: palette.glow,
            category: 'Volume Galian per Operator ISP',
            rawPlans: data.plansList,
            rawProjects: data.projsList
          };
        })
        .sort((a, b) => b.value - a.value);
    }

    if (barDataset === 'category_po') {
      const catPoMap: Record<ProjectCategory, { totalValue: number; projs: ProjectItem[] }> = {
        'GOV SJUT': { totalValue: 0, projs: [] },
        'GOV APJATEL': { totalValue: 0, projs: [] },
        'GOV IPPJU': { totalValue: 0, projs: [] },
        'Project Internal': { totalValue: 0, projs: [] },
        'INTERNAL': { totalValue: 0, projs: [] }
      };

      projects.forEach((p) => {
        if (catPoMap[p.projectCategory]) {
          catPoMap[p.projectCategory].totalValue += p.nilaiPo || 0;
          catPoMap[p.projectCategory].projs.push(p);
        }
      });

      const totalPoAll = Object.values(catPoMap).reduce((acc, curr) => acc + curr.totalValue, 0) || 1;

      const catColors: Record<ProjectCategory, { color: string; glow: string }> = {
        'GOV SJUT': { color: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)' },
        'GOV APJATEL': { color: '#e056fd', glow: 'rgba(224, 86, 253, 0.4)' },
        'GOV IPPJU': { color: '#f1c40f', glow: 'rgba(241, 196, 15, 0.4)' },
        'Project Internal': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)' },
        'INTERNAL': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)' }
      };

      return (Object.keys(catPoMap) as ProjectCategory[]).map((cat) => {
        const data = catPoMap[cat];
        const pct = Math.round((data.totalValue / totalPoAll) * 100);
        return {
          id: `bar-po-${cat}`,
          label: cat,
          value: data.totalValue,
          formattedValue: formatRupiah(data.totalValue),
          percentage: pct,
          color: catColors[cat].color,
          glowColor: catColors[cat].glow,
          category: 'Nilai Total PO Release',
          rawProjects: data.projs
        };
      });
    }

    if (barDataset === 'quarter_projects') {
      const qMap: Record<QuarterOption, ProjectItem[]> = {
        'Q1 - 26': [],
        'Q2 - 26': [],
        'Q3 - 26': [],
        'Q4 - 26': []
      };

      projects.forEach((p) => {
        if (qMap[p.quarter]) qMap[p.quarter].push(p);
      });

      const total = projects.length || 1;

      return (['Q1 - 26', 'Q2 - 26', 'Q3 - 26', 'Q4 - 26'] as QuarterOption[]).map((q, idx) => {
        const projs = qMap[q];
        const count = projs.length;
        const pct = Math.round((count / total) * 100);
        const palette = PALETTE[idx % PALETTE.length];
        return {
          id: `bar-q-${q}`,
          label: q,
          value: count,
          formattedValue: `${count} Paket`,
          percentage: pct,
          color: palette.color,
          glowColor: palette.glow,
          category: 'Rencana Pelaksanaan per Triwulan',
          rawProjects: projs
        };
      });
    }

    if (barDataset === 'cable_meters') {
      const cableMap: Record<string, { meters: number; plansList: ConstructionPlanItem[] }> = {};

      plans.forEach((pl) => {
        pl.foCables?.forEach((c) => {
          if (!cableMap[c.tipe]) {
            cableMap[c.tipe] = { meters: 0, plansList: [] };
          }
          cableMap[c.tipe].meters += c.panjang || 0;
          if (!cableMap[c.tipe].plansList.some((p) => p.id === pl.id)) {
            cableMap[c.tipe].plansList.push(pl);
          }
        });
      });

      const totalMeters = Object.values(cableMap).reduce((acc, curr) => acc + curr.meters, 0) || 1;

      return Object.entries(cableMap)
        .map(([type, data], idx) => {
          const pct = Math.round((data.meters / totalMeters) * 100);
          const palette = PALETTE[idx % PALETTE.length];
          return {
            id: `bar-cable-${type}`,
            label: type,
            value: data.meters,
            formattedValue: `${data.meters.toLocaleString('id-ID')} m`,
            percentage: pct,
            color: palette.color,
            glowColor: palette.glow,
            category: 'Volume Kabel Fiber Optik (Meter)',
            rawPlans: data.plansList
          };
        })
        .sort((a, b) => b.value - a.value);
    }

    return [];
  }, [barDataset, projects, plans]);

  // Max value for Bar Scaling
  const maxBarValue = useMemo(() => {
    if (barData.length === 0) return 1;
    return Math.max(...barData.map((d) => d.value)) || 1;
  }, [barData]);

  // -------------------------------------------------------------
  // SVG PIE PATH GENERATOR (DONUT SLICES)
  // -------------------------------------------------------------
  const [activePieHover, setActivePieHover] = useState<ChartDataItem | null>(null);

  const renderPieSlices = () => {
    const totalVal = pieData.reduce((acc, d) => acc + d.value, 0);
    if (totalVal === 0) {
      return (
        <text x="100" y="105" textAnchor="middle" fill="#94a3b8" fontSize="12">
          Data Kosong
        </text>
      );
    }

    let startAngle = 0;
    const cx = 110;
    const cy = 110;
    const outerRadius = 85;
    const innerRadius = 50;

    return pieData.map((item, index) => {
      const sliceAngle = (item.value / totalVal) * 360;
      const endAngle = startAngle + sliceAngle;

      const isHovered = activePieHover?.id === item.id;
      const currentOuterRadius = isHovered ? outerRadius + 6 : outerRadius;

      // Angles in radians
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      // Coordinates
      const x1 = cx + currentOuterRadius * Math.cos(startRad);
      const y1 = cy + currentOuterRadius * Math.sin(startRad);
      const x2 = cx + currentOuterRadius * Math.cos(endRad);
      const y2 = cy + currentOuterRadius * Math.sin(endRad);

      const ix1 = cx + innerRadius * Math.cos(endRad);
      const iy1 = cy + innerRadius * Math.sin(endRad);
      const ix2 = cx + innerRadius * Math.cos(startRad);
      const iy2 = cy + innerRadius * Math.sin(startRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      // Handle 360 degree full slice edge case
      let pathData = '';
      if (sliceAngle >= 359.9) {
        pathData = `
          M ${cx} ${cy - currentOuterRadius}
          A ${currentOuterRadius} ${currentOuterRadius} 0 1 1 ${cx - 0.01} ${cy - currentOuterRadius}
          L ${cx - 0.01} ${cy - innerRadius}
          A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius}
          Z
        `;
      } else {
        pathData = `
          M ${x1} ${y1}
          A ${currentOuterRadius} ${currentOuterRadius} 0 ${largeArc} 1 ${x2} ${y2}
          L ${ix1} ${iy1}
          A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}
          Z
        `;
      }

      const currentStartAngle = startAngle;
      startAngle = endAngle;

      return (
        <g key={item.id} className="cursor-pointer transition-all duration-200">
          <path
            d={pathData}
            fill={item.color}
            opacity={isHovered ? 1 : 0.85}
            stroke="#091022"
            strokeWidth="2.5"
            className="transition-all duration-200 hover:opacity-100"
            style={{
              filter: isHovered ? `drop-shadow(0 0 12px ${item.glowColor})` : 'none'
            }}
            onMouseEnter={() => setActivePieHover(item)}
            onMouseLeave={() => setActivePieHover(null)}
            onClick={() => {
              setSelectedItem({
                title: item.label,
                datasetType: item.category || 'Kategori',
                item
              });
              setModalSearch('');
            }}
          >
            <title>{`${item.label}: ${item.formattedValue} (${item.percentage}%) - Klik untuk detail`}</title>
          </path>
        </g>
      );
    });
  };

  // -------------------------------------------------------------
  // DETAIL MODAL RENDERER
  // -------------------------------------------------------------
  const filteredModalProjects = useMemo(() => {
    if (!selectedItem?.item.rawProjects) return [];
    if (!modalSearch.trim()) return selectedItem.item.rawProjects;

    const term = modalSearch.toLowerCase();
    return selectedItem.item.rawProjects.filter(
      (p) =>
        p.projectId.toLowerCase().includes(term) ||
        p.areaLocation.toLowerCase().includes(term) ||
        p.picIsp.toLowerCase().includes(term) ||
        p.projectCategory.toLowerCase().includes(term) ||
        p.projectStatus.toLowerCase().includes(term)
    );
  }, [selectedItem, modalSearch]);

  const filteredModalPlans = useMemo(() => {
    if (!selectedItem?.item.rawPlans) return [];
    if (!modalSearch.trim()) return selectedItem.item.rawPlans;

    const term = modalSearch.toLowerCase();
    return selectedItem.item.rawPlans.filter(
      (pl) =>
        pl.namaIsp.toLowerCase().includes(term) ||
        pl.projectId.toLowerCase().includes(term) ||
        pl.foCables?.some((c) => c.tipe.toLowerCase().includes(term))
    );
  }, [selectedItem, modalSearch]);

  return (
    <div className="space-y-6">
      {/* Component Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091022] border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Grafik Analitik Interaktif Proyek JWS
            </h2>
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
              Chart & Drill-Down
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#0d162d] px-3.5 py-2 rounded-xl border border-slate-800">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Setiap elemen grafik dapat diklik untuk audit data</span>
        </div>
      </div>

      {/* CHARTS GRID (2 COLUMNS: PIE CHART + BAR CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ======================================================== */}
        {/* LEFT CARD: INTERACTIVE PIE / DONUT CHART */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 rounded-2xl bg-[#091022] border border-slate-800 p-5 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-magenta-400" style={{ color: '#e056fd' }} />
                Diagram Lingkaran (Pie Chart)
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {pieData.length} Kategori Data
              </span>
            </div>

            {/* Pie View Selectors */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <button
                onClick={() => setPieDataset('status')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono whitespace-nowrap transition-all finger-click ${
                  pieDataset === 'status'
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Status Proyek
              </button>

              <button
                onClick={() => setPieDataset('category')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono whitespace-nowrap transition-all finger-click ${
                  pieDataset === 'category'
                    ? 'bg-purple-950 border border-purple-500 text-purple-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Kategori
              </button>

              <button
                onClick={() => setPieDataset('fo_cores')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono whitespace-nowrap transition-all finger-click ${
                  pieDataset === 'fo_cores'
                    ? 'bg-amber-950 border border-amber-500 text-amber-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Kabel FO
              </button>

              <button
                onClick={() => setPieDataset('manholes')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono whitespace-nowrap transition-all finger-click ${
                  pieDataset === 'manholes'
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Manhole
              </button>

              <button
                onClick={() => setPieDataset('po_status')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono whitespace-nowrap transition-all finger-click ${
                  pieDataset === 'po_status'
                    ? 'bg-blue-950 border border-blue-500 text-blue-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Release PO
              </button>
            </div>
          </div>

          {/* Pie Chart SVG Viewport */}
          <div className="relative flex items-center justify-center py-2">
            <svg width="220" height="220" viewBox="0 0 220 220" className="overflow-visible">
              {renderPieSlices()}

              {/* Center Donut Hole Content */}
              <circle cx="110" cy="110" r="48" fill="#091022" stroke="#1e293b" strokeWidth="1.5" />
              <g className="pointer-events-none text-center">
                <text x="110" y="102" textAnchor="middle" fill="#94a3b8" fontSize="10" className="font-mono uppercase">
                  {activePieHover ? activePieHover.label.substring(0, 14) : 'TOTAL ITEM'}
                </text>
                <text x="110" y="122" textAnchor="middle" fill="#ffffff" fontSize="16" className="font-bold font-mono">
                  {activePieHover
                    ? `${activePieHover.percentage}%`
                    : pieData.reduce((a, b) => a + b.value, 0).toLocaleString('id-ID')}
                </text>
              </g>
            </svg>
          </div>

          {/* Interactive Legend List */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Legenda & Proporsi (%)</span>
              <span className="text-cyan-400">Klik untuk Rincian</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {pieData.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem({
                      title: item.label,
                      datasetType: item.category || 'Kategori',
                      item
                    });
                    setModalSearch('');
                  }}
                  onMouseEnter={() => setActivePieHover(item)}
                  onMouseLeave={() => setActivePieHover(null)}
                  className={`p-2 rounded-xl text-left border transition-all flex items-center justify-between gap-2 finger-click group ${
                    activePieHover?.id === item.id
                      ? 'bg-slate-800/80 border-slate-600 ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-md shrink-0 transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: item.color,
                        boxShadow: `0 0 8px ${item.glowColor}`
                      }}
                    />
                    <span className="text-xs text-slate-200 font-medium truncate group-hover:text-cyan-300">
                      {item.label}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-mono text-white block">
                      {item.percentage}%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {item.value}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT CARD: INTERACTIVE BAR CHART */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 rounded-2xl bg-[#091022] border border-slate-800 p-5 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Grafik Batang (Bar Chart)
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">
                Unit Pengukuran Scaled
              </span>
            </div>

            {/* Bar View Selectors */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <button
                onClick={() => setBarDataset('isp_galian')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono whitespace-nowrap transition-all finger-click ${
                  barDataset === 'isp_galian'
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Galian per ISP (m)
              </button>

              <button
                onClick={() => setBarDataset('category_po')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono whitespace-nowrap transition-all finger-click ${
                  barDataset === 'category_po'
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Nilai PO (Rupiah)
              </button>

              <button
                onClick={() => setBarDataset('quarter_projects')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono whitespace-nowrap transition-all finger-click ${
                  barDataset === 'quarter_projects'
                    ? 'bg-amber-950 border border-amber-500 text-amber-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Proyek per Quarter
              </button>

              <button
                onClick={() => setBarDataset('cable_meters')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono whitespace-nowrap transition-all finger-click ${
                  barDataset === 'cable_meters'
                    ? 'bg-purple-950 border border-purple-500 text-purple-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Kabel FO per Tipe
              </button>
            </div>
          </div>

          {/* Bar Chart Bars Container */}
          <div className="space-y-3.5 my-2">
            {barData.length === 0 ? (
              <div className="py-12 text-center text-slate-500 italic text-xs">
                Tidak ada data untuk grafik batang ini.
              </div>
            ) : (
              barData.map((item) => {
                const widthPct = Math.max(5, Math.min(100, (item.value / maxBarValue) * 100));

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItem({
                        title: item.label,
                        datasetType: item.category || 'Kategori',
                        item
                      });
                      setModalSearch('');
                    }}
                    className="group space-y-1.5 cursor-pointer p-2 rounded-xl transition-all hover:bg-slate-800/40 border border-transparent hover:border-slate-800"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{
                            backgroundColor: item.color,
                            boxShadow: `0 0 6px ${item.glowColor}`
                          }}
                        />
                        <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">
                          ({item.percentage}%)
                        </span>
                        <span className="font-bold text-white tabular-nums">
                          {item.formattedValue}
                        </span>
                      </div>
                    </div>

                    {/* Bar Progress Track */}
                    <div className="w-full h-3.5 bg-slate-900 rounded-lg p-0.5 overflow-hidden border border-slate-800/80 flex items-center">
                      <div
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: item.color,
                          boxShadow: `0 0 10px ${item.glowColor}`
                        }}
                        className="h-full rounded-md transition-all duration-500 relative group-hover:brightness-125"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Panduan: Klik bar mana saja untuk inspect list paket</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <span>Rincian Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* ITEM DRILL-DOWN DETAIL MODAL POPUP */}
      {/* ======================================================== */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#091022] border border-cyan-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col neon-glow-cyan">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0d162d]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] font-mono">
                    {selectedItem.datasetType}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Info className="w-5 h-5 text-cyan-400" />
                    Detail Analisis: {selectedItem.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Ringkasan statistik dan rekapitulasi data lapangan untuk item ini.
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors finger-click"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0c1429] border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 block">Nilai / Output</span>
                  <div className="text-base font-bold text-cyan-300 font-mono">
                    {selectedItem.item.formattedValue}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0c1429] border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 block">Kontribusi Total</span>
                  <div className="text-base font-bold text-purple-400 font-mono">
                    {selectedItem.item.percentage}% Share
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0c1429] border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 block">Total Paket Proyek</span>
                  <div className="text-base font-bold text-amber-300 font-mono">
                    {selectedItem.item.rawProjects?.length || filteredModalPlans.length} Total
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0c1429] border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 block">Status Audit</span>
                  <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>

              {/* Filter Search Input */}
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Daftar Data Terkait ({selectedItem.item.rawProjects ? filteredModalProjects.length : filteredModalPlans.length} Record)
                </h4>

                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Cari ID, Area, atau ISP..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* TABLE LISTING FOR PROJECTS */}
              {selectedItem.item.rawProjects && selectedItem.item.rawProjects.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070c1a]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-[#0e172e] border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="py-2.5 px-3">Project ID</th>
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3">Lokasi / Area</th>
                        <th className="py-2.5 px-3">ISP Partner</th>
                        <th className="py-2.5 px-3 text-right">Galian (m)</th>
                        <th className="py-2.5 px-3 text-right">Nilai PO</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredModalProjects.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 font-bold text-cyan-300">{p.projectId}</td>
                          <td className="py-3 px-3 text-slate-300">{p.projectCategory}</td>
                          <td className="py-3 px-3 text-slate-300 truncate max-w-[150px]">{p.areaLocation}</td>
                          <td className="py-3 px-3 text-slate-200">{p.picIsp}</td>
                          <td className="py-3 px-3 text-right text-orange-400 font-bold">
                            {p.panjangRelokasiGalian?.toLocaleString('id-ID')} m
                          </td>
                          <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                            {formatRupiah(p.nilaiPo || 0)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-200 uppercase">
                              {p.projectStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TABLE LISTING FOR PLANS */}
              {selectedItem.item.rawPlans && selectedItem.item.rawPlans.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070c1a]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-[#0e172e] border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="py-2.5 px-3">Operator ISP</th>
                        <th className="py-2.5 px-3">Project ID</th>
                        <th className="py-2.5 px-3 text-right">Relokasi Galian (m)</th>
                        <th className="py-2.5 px-3">Spesifikasi FO</th>
                        <th className="py-2.5 px-3 text-center">Manhole Units</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredModalPlans.map((pl) => {
                        const totalMh = pl.manholes?.reduce((acc, m) => acc + (m.unit || 0), 0) || 0;
                        const cableDesc = pl.foCables?.map((c) => `${c.tipe} (${c.panjang}m)`).join(', ') || '-';

                        return (
                          <tr key={pl.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3 font-bold text-white">{pl.namaIsp}</td>
                            <td className="py-3 px-3 text-cyan-300 font-mono">{pl.projectId}</td>
                            <td className="py-3 px-3 text-right text-orange-400 font-bold">
                              {pl.panjangRelokasiGalian?.toLocaleString('id-ID')} m
                            </td>
                            <td className="py-3 px-3 text-purple-300 truncate max-w-[200px]">
                              {cableDesc}
                            </td>
                            <td className="py-3 px-3 text-center text-yellow-300 font-bold">
                              {totalMh} Unit
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#0d162d] flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Sistem Informasi Terintegrasi JWS Command Center
              </span>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold font-mono transition-colors finger-click"
              >
                Tutup Rincian
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

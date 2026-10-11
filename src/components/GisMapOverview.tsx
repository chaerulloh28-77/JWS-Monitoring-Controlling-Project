import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Layers, ShieldCheck, Zap, Info, Radio, Plus, Edit2, Trash2, Building2, FolderGit2 } from 'lucide-react';
import { ProjectItem, ConstructionPlanItem } from '../types';

interface GisMapOverviewProps {
  projects: ProjectItem[];
  plans: ConstructionPlanItem[];
  onSelectProject: (project: ProjectItem) => void;
  onDeleteProject?: (id: string) => void;
  onOpenNewProject?: () => void;
  onOpenNewPlan?: () => void;
  mainGroupFilter?: 'GOV' | 'INTERNAL' | 'ALL';
  onMainGroupFilterChange?: (group: 'GOV' | 'INTERNAL' | 'ALL') => void;
}

export const GisMapOverview: React.FC<GisMapOverviewProps> = ({
  projects,
  plans,
  onSelectProject,
  onDeleteProject,
  onOpenNewProject,
  onOpenNewPlan,
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
  const [selectedPinId, setSelectedPinId] = useState<string>(projects[0]?.id || '');
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'SJUT' | 'APJATEL' | 'IPPJU'>('ALL');

  const govMapCount = useMemo(() => {
    return projects.filter((p) => p.projectCategory !== 'Project Internal' && p.projectCategory !== 'INTERNAL').length;
  }, [projects]);

  const internalMapCount = useMemo(() => {
    return projects.filter((p) => p.projectCategory === 'Project Internal' || p.projectCategory === 'INTERNAL').length;
  }, [projects]);

  const displayProjects = useMemo(() => {
    return projects.filter((p) => {
      const isInternal = p.projectCategory === 'Project Internal' || p.projectCategory === 'INTERNAL';
      if (mainGroupFilter === 'GOV' && isInternal) return false;
      if (mainGroupFilter === 'INTERNAL' && !isInternal) return false;
      return true;
    });
  }, [projects, mainGroupFilter]);

  const selectedProject = displayProjects.find(p => p.id === selectedPinId) || displayProjects[0] || projects[0];
  const relatedPlans = plans.filter(pl => pl.projectId === selectedProject?.projectId);

  // Jakarta mock coordinates & sectors for visual rendering
  const mapNodes = [
    {
      id: 'prj-001',
      name: 'Sudirman - Bundaran HI',
      category: 'GOV SJUT',
      x: 48,
      y: 42,
      status: 'in progress',
      color: '#a855f7'
    },
    {
      id: 'prj-002',
      name: 'Rasuna Said - Kuningan',
      category: 'GOV APJATEL',
      x: 58,
      y: 52,
      status: 'review dinas',
      color: '#eab308'
    },
    {
      id: 'prj-003',
      name: 'Gatot Subroto Smart Pole',
      category: 'GOV IPPJU',
      x: 52,
      y: 62,
      status: 'completed',
      color: '#ef4444'
    },
    {
      id: 'prj-004',
      name: 'TOD Dukuh Atas - Kendal',
      category: 'GOV SJUT',
      x: 46,
      y: 38,
      status: 'in progress',
      color: '#a855f7'
    },
    {
      id: 'prj-005',
      name: 'Tomang Raya - Roxy',
      category: 'GOV APJATEL',
      x: 36,
      y: 32,
      status: 'not started',
      color: '#06b6d4'
    },
    {
      id: 'prj-006',
      name: 'D.I. Panjaitan Bypass',
      category: 'GOV IPPJU',
      x: 72,
      y: 58,
      status: 'review dinas',
      color: '#ef4444'
    },
    {
      id: 'prj-007',
      name: 'TB Simatupang - Fatmawati',
      category: 'GOV SJUT',
      x: 42,
      y: 78,
      status: 'in progress',
      color: '#a855f7'
    }
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#091022] border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-yellow-400" />
              GIS & Peta Trase Relokasi Utilitas JWS
            </h2>
            <span className="px-2 py-0.5 rounded bg-yellow-950 border border-yellow-800 text-yellow-300 text-xs font-mono">
              Koridor DKI Jakarta
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualisasi geospasial titik trase relokasi SJUT bawah tanah, tiang bersama APJATEL, dan smart pole IPPJU
          </p>
        </div>

        {/* Layer Selector & CRUD Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenNewProject && onOpenNewProject()}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all finger-click flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek Baru</span>
          </button>
          <button
            onClick={() => onOpenNewPlan && onOpenNewPlan()}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all finger-click flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rencana ISP</span>
          </button>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0c1429] border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveLayer('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors finger-click ${
                activeLayer === 'ALL' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Trase
            </button>
            <button
              onClick={() => setActiveLayer('SJUT')}
              className={`px-3 py-1.5 rounded-lg transition-colors finger-click ${
                activeLayer === 'SJUT' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              SJUT Ducting
            </button>
            <button
              onClick={() => setActiveLayer('APJATEL')}
              className={`px-3 py-1.5 rounded-lg transition-colors finger-click ${
                activeLayer === 'APJATEL' ? 'bg-yellow-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              APJATEL
            </button>
            <button
              onClick={() => setActiveLayer('IPPJU')}
              className={`px-3 py-1.5 rounded-lg transition-colors finger-click ${
                activeLayer === 'IPPJU' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              IPPJU
            </button>
          </div>
        </div>
      </div>

      {/* Group Separation Tab Switcher for GIS & Peta */}
      <div className="p-2 rounded-2xl bg-[#091022] border border-slate-800 shadow-lg flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleGroupChange('GOV')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all finger-click border shrink-0 ${
            mainGroupFilter === 'GOV'
              ? 'bg-gradient-to-r from-amber-950 to-yellow-950 border-yellow-400 text-yellow-200 shadow-lg shadow-yellow-500/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4 text-yellow-400" />
          <span>1. GIS & Peta GOV</span>
          <span className="px-2 py-0.5 rounded-full bg-yellow-900/80 border border-yellow-600/80 text-[10px] font-mono text-yellow-200 font-extrabold">
            {govMapCount}
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
          <span>2. GIS & Peta Internal</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-900/80 border border-indigo-600/80 text-[10px] font-mono text-indigo-200 font-extrabold">
            {internalMapCount}
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
          <span>Semua GIS & Peta</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 font-bold">
            {projects.length}
          </span>
        </button>
      </div>

      {/* Main Interactive Map & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Visualizer */}
        <div className="lg:col-span-2 rounded-2xl bg-[#070b16] border border-cyan-500/30 p-4 relative overflow-hidden shadow-2xl neon-glow-cyan min-h-[500px] flex flex-col justify-between">
          {/* Cyber grid and radar overlay */}
          <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
          
          {/* Neon Grid Lines simulating Jakarta arterial road networks */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-800" strokeWidth="1.5" strokeDasharray="4 4">
            {/* North-South corridor */}
            <path d="M 120 50 L 350 200 L 400 480" fill="none" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="3" strokeDasharray="none" />
            {/* East-West corridor */}
            <path d="M 60 220 L 350 200 L 700 240" fill="none" stroke="rgba(168, 85, 247, 0.25)" strokeWidth="3" strokeDasharray="none" />
            {/* Ring corridor */}
            <path d="M 280 120 L 520 160 L 580 380 L 260 420 Z" fill="none" stroke="rgba(234, 179, 8, 0.2)" strokeWidth="2" />
          </svg>

          {/* Map Top Indicators */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <Navigation className="w-3.5 h-3.5 animate-spin" />
              SISTEM RADAR KOORDINAT JWS AKTIF
            </span>
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
              Klik node untuk memuat rincian paket
            </span>
          </div>

          {/* Nodes placed on Map */}
          <div className="relative z-10 my-auto w-full h-[400px]">
            {mapNodes.map((node) => {
              const isMatch = activeLayer === 'ALL' || node.category.includes(activeLayer);
              if (!isMatch) return null;

              const isSelected = selectedPinId === node.id;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedPinId(node.id)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group finger-click transition-transform ${
                    isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                  }`}
                >
                  {/* Glowing ring animation */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center relative transition-all"
                    style={{
                      backgroundColor: `${node.color}25`,
                      border: `2px solid ${node.color}`
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full animate-ping absolute"
                      style={{ backgroundColor: node.color }}
                    />
                    <div
                      className="w-3 h-3 rounded-full relative z-10"
                      style={{ backgroundColor: node.color }}
                    />
                  </div>

                  {/* Tooltip label */}
                  <div className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0b1226] border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-slate-200 shadow-xl pointer-events-none">
                    {node.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Map Legend */}
          <div className="relative z-10 flex flex-wrap items-center gap-4 text-[11px] font-mono bg-[#091124]/90 backdrop-blur-sm p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">Legenda Trase:</span>
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> GOV SJUT Ducting
            </span>
            <span className="flex items-center gap-1.5 text-yellow-300">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> GOV APJATEL Bersama
            </span>
            <span className="flex items-center gap-1.5 text-red-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> GOV IPPJU Smart Pole
            </span>
          </div>
        </div>

        {/* Selected Project Detail Card */}
        <div className="rounded-2xl bg-[#091022] border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 block">
                {selectedProject.projectId}
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {selectedProject.areaLocation}
              </h3>
            </div>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
              {selectedProject.quarter}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedProject.projectDescription}
          </p>

          <div className="grid grid-cols-2 gap-3 font-mono bg-[#0c1429] p-3 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">PANJANG RELOKASI</span>
              <span className="text-base font-bold text-orange-400">
                {selectedProject.panjangRelokasiGalian.toLocaleString('id-ID')} m
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">STATUS</span>
              <span className="text-xs font-bold text-emerald-400 uppercase">
                {selectedProject.projectStatus}
              </span>
            </div>
          </div>

          {/* Related ISP Plans for this sector */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400 font-semibold block">
              Operator ISP di Trase Ini ({relatedPlans.length}):
            </span>
            {relatedPlans.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-2 bg-slate-900 rounded">
                Belum ada rincian rencana konstruksi ISP untuk paket ini.
              </div>
            ) : (
              relatedPlans.map((pl) => (
                <div key={pl.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>{pl.namaIsp}</span>
                    <span className="text-orange-400 font-mono">{pl.panjangRelokasiGalian}m</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Borring: {pl.borringAkses}m · Crossing: {pl.crossingJalan + pl.crossingJembatan}m
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 space-y-2 border-t border-slate-800">
            <button
              onClick={() => onSelectProject(selectedProject)}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors finger-click shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Data Proyek Ini</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Yakin ingin menghapus proyek ${selectedProject.projectId} (${selectedProject.areaLocation}) dari GIS?`)) {
                  if (onDeleteProject) onDeleteProject(selectedProject.id);
                }
              }}
              className="w-full py-2 px-4 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold transition-colors finger-click flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Hapus Proyek Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

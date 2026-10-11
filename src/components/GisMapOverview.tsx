import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Layers,
  ShieldCheck,
  Zap,
  Info,
  Radio,
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
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Pre-defined coordinates for initial Jakarta corridors
const DEFAULT_PROJECT_COORDS: Record<string, [number, number]> = {
  'prj-001': [-6.202, 106.822], // Sudirman - Bundaran HI
  'prj-002': [-6.224, 106.831], // Rasuna Said
  'prj-003': [-6.230, 106.820], // Gatot Subroto
  'prj-004': [-6.200, 106.820], // Dukuh Atas
  'prj-005': [-6.175, 106.795], // Tomang
  'prj-006': [-6.240, 106.870], // Panjaitan Bypass
  'prj-007': [-6.290, 106.798], // TB Simatupang
  'prj-008': [-6.180, 106.830], // Internal HO
  'prj-009': [-6.160, 106.750]  // Internal West
};

const getHashCoords = (id: string): [number, number] => {
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < id.length; i++) {
    hash1 = (hash1 << 5) - hash1 + id.charCodeAt(i);
    hash2 = (hash2 << 3) + hash2 + id.charCodeAt(i);
  }
  const offsetLat = ((Math.abs(hash1) % 100) - 50) * 0.0012;
  const offsetLng = ((Math.abs(hash2) % 100) - 50) * 0.0015;
  return [-6.2088 + offsetLat, 106.8456 + offsetLng];
};

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

  useEffect(() => {
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

  // Search & Status filters for GIS Map
  const [gisSearchQuery, setGisSearchQuery] = useState('');
  const [gisStatusFilter, setGisStatusFilter] = useState<string>('ALL');

  // Leaflet map container & instance refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

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

      if (gisStatusFilter !== 'ALL' && p.projectStatus !== gisStatusFilter) return false;

      if (gisSearchQuery.trim()) {
        const q = gisSearchQuery.toLowerCase().trim();
        const matchId = p.projectId.toLowerCase().includes(q);
        const matchDesc = p.projectDescription.toLowerCase().includes(q);
        const matchArea = p.areaLocation.toLowerCase().includes(q);
        const matchPic = (p.picIsp || '').toLowerCase().includes(q);
        if (!matchId && !matchDesc && !matchArea && !matchPic) return false;
      }

      return true;
    });
  }, [projects, mainGroupFilter, gisStatusFilter, gisSearchQuery]);

  const selectedProject = useMemo(() => {
    return displayProjects.find((p) => p.id === selectedPinId) || displayProjects[0] || projects[0] || null;
  }, [displayProjects, selectedPinId, projects]);

  const relatedPlans = useMemo(() => {
    if (!selectedProject) return [];
    return plans.filter((pl) => pl.projectId === selectedProject.projectId);
  }, [plans, selectedProject]);

  // Map initialization with Leaflet and CartoDB Dark Basemap
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on DKI Jakarta: [-6.2088, 106.8456], zoom: 12
    const map = L.map(mapContainerRef.current, {
      center: [-6.2088, 106.8456],
      zoom: 12,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // CartoDB Dark Matter tile layer for dark theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Invalidate size with 150ms delay to prevent blank/black rendering
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // Update Leaflet markers & trase polylines dynamically
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    if (displayProjects.length === 0) {
      mapInstanceRef.current.setView([-6.2088, 106.8456], 12);
      return;
    }

    const bounds = L.latLngBounds([]);

    displayProjects.forEach((proj) => {
      const isInternal = proj.projectCategory === 'Project Internal' || proj.projectCategory === 'INTERNAL';
      const category = proj.projectCategory || 'GOV APJATEL';

      if (activeLayer !== 'ALL' && !category.includes(activeLayer)) {
        return;
      }

      const coords = DEFAULT_PROJECT_COORDS[proj.id] || getHashCoords(proj.id);
      bounds.extend(coords);

      const isSelected = selectedProject?.id === proj.id;
      const color = isInternal
        ? '#6366f1'
        : category.includes('SJUT')
        ? '#a855f7'
        : category.includes('IPPJU')
        ? '#ef4444'
        : '#f59e0b';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px; transform: translate(-50%, -50%); cursor: pointer;">
            <div style="position: absolute; inset: 0; border-radius: 50%; background-color: ${color}35; border: 2px solid ${color}; ${
          isSelected ? `box-shadow: 0 0 16px ${color}; transform: scale(1.25);` : ''
        }"></div>
            <div style="position: absolute; top: 50%; left: 50%; width: 10px; height: 10px; margin-top: -5px; margin-left: -5px; border-radius: 50%; background-color: ${color};"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(markersGroup);
      marker.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px;"><b>${proj.projectId}</b><br/>${proj.areaLocation}</div>`,
        { direction: 'top', opacity: 0.95 }
      );

      marker.on('click', () => {
        setSelectedPinId(proj.id);
      });
    });

    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [displayProjects, selectedProject, activeLayer]);

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

      {/* Interactive Filter Toolbar for GIS & Peta */}
      <div className="p-3 rounded-2xl bg-[#091022] border border-slate-800 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={gisSearchQuery}
            onChange={(e) => setGisSearchQuery(e.target.value)}
            placeholder="Filter data peta trase (ID Proyek, Lokasi, PIC ISP...)"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
          {gisSearchQuery && (
            <button
              onClick={() => setGisSearchQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={gisStatusFilter}
            onChange={(e) => setGisStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Status Proyek</option>
            <option value="in progress">In Progress (Aktif)</option>
            <option value="completed">Completed (Selesai)</option>
            <option value="review dinas">Review Dinas</option>
            <option value="not started">Not Started</option>
            <option value="cancel">Cancel</option>
          </select>
        </div>
      </div>

      {/* Main Interactive Map & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Visualizer Container with Leaflet */}
        <div className="lg:col-span-2 rounded-2xl bg-[#070b16] border border-cyan-500/30 p-4 relative overflow-hidden shadow-2xl min-h-[550px] h-[550px] w-full flex flex-col justify-between">
          
          {/* Overlay Notification when Project Data is Empty */}
          {displayProjects.length === 0 && (
            <div className="absolute top-4 left-4 z-[1000] p-3 rounded-xl bg-slate-900/95 border border-yellow-500/50 text-xs font-mono text-yellow-300 shadow-2xl flex items-center gap-2.5 max-w-md backdrop-blur-md animate-fade-in">
              <Info className="size-4 shrink-0 text-yellow-400 animate-pulse" />
              <span>Belum ada trase proyek yang terdaftar. Menampilkan peta wilayah kerja Jakarta.</span>
            </div>
          )}

          {/* Map Top Indicators */}
          <div className="relative z-[1000] flex items-center justify-between text-xs font-mono text-slate-400 mb-2 pointer-events-none">
            <span className="flex items-center gap-1.5 text-cyan-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 pointer-events-auto">
              <Navigation className="w-3.5 h-3.5 animate-spin" />
              SISTEM RADAR KOORDINAT JWS AKTIF
            </span>
            <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] pointer-events-auto">
              Klik marker untuk memuat rincian paket
            </span>
          </div>

          {/* Leaflet Map Target DOM Node */}
          <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden z-10 border border-slate-800" />

          {/* Map Legend */}
          <div className="relative z-[1000] flex flex-wrap items-center gap-4 text-[11px] font-mono bg-[#091124]/90 backdrop-blur-sm p-2.5 rounded-xl border border-slate-800 mt-2">
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
            <span className="flex items-center gap-1.5 text-indigo-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Project Internal
            </span>
          </div>
        </div>

        {/* Selected Project Detail Card or Empty State Card */}
        {selectedProject ? (
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
                  {(selectedProject.panjangRelokasiGalian || 0).toLocaleString('id-ID')} m
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
                  if (
                    window.confirm(
                      `Yakin ingin menghapus proyek ${selectedProject.projectId} (${selectedProject.areaLocation}) dari GIS?`
                    )
                  ) {
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
        ) : (
          /* Empty State Card when no projects are available */
          <div className="rounded-2xl bg-[#091022] border border-slate-800 p-6 text-center space-y-4 flex flex-col justify-center items-center my-auto min-h-[300px]">
            <div className="p-4 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <MapPin className="size-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Belum Ada Trase Proyek</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Silakan tambahkan data proyek baru untuk melihat visualisasi trase geospasial pada peta GIS Jakarta.
              </p>
            </div>
            {onOpenNewProject && (
              <button
                onClick={onOpenNewProject}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
              >
                <Plus className="size-4" />
                <span>+ Tambah Proyek Baru</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

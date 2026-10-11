import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  FileSpreadsheet,
  X,
  Check,
  ChevronDown,
  Info,
  Building2,
  ShieldCheck,
  FolderGit2
} from 'lucide-react';
import { ProjectItem, ProjectCategory, ProjectStatus, QuarterOption } from '../types';
import { exportProjectsCsv } from '../services/storage';

interface ProjectListProps {
  projects: ProjectItem[];
  onSaveProject: (project: ProjectItem) => void;
  onDeleteProject: (id: string) => void;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
  externalEditingProject?: ProjectItem | null;
  setExternalEditingProject?: (p: ProjectItem | null) => void;
  mainGroupFilter?: 'GOV' | 'INTERNAL' | 'ALL';
  onMainGroupFilterChange?: (group: 'GOV' | 'INTERNAL' | 'ALL') => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSaveProject,
  onDeleteProject,
  isAddModalOpen: externalModalOpen,
  setIsAddModalOpen: externalSetModalOpen,
  externalEditingProject,
  setExternalEditingProject,
  mainGroupFilter: externalGroupFilter,
  onMainGroupFilterChange
}) => {
  // State for search & filters
  const [mainGroupFilter, setMainGroupFilter] = useState<'GOV' | 'INTERNAL' | 'ALL'>(externalGroupFilter || 'GOV');

  React.useEffect(() => {
    if (externalGroupFilter) {
      setMainGroupFilter(externalGroupFilter);
    }
  }, [externalGroupFilter]);

  const handleGroupChange = (group: 'GOV' | 'INTERNAL' | 'ALL') => {
    setMainGroupFilter(group);
    setSelectedCategory('ALL');
    if (onMainGroupFilterChange) {
      onMainGroupFilterChange(group);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [viewingDetailProject, setViewingDetailProject] = useState<ProjectItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialFormState: Omit<ProjectItem, 'id' | 'updatedAt'> = {
    projectId: '',
    projectCategory: 'GOV APJATEL', // Alphabetical default
    projectDescription: '',
    areaLocation: '',
    panjangRelokasiGalian: 0,
    picIsp: '',
    picJws: '',
    projectStatus: 'cancel', // Alphabetical default
    quarter: 'Q1 - 26',
    tanggalSuratDinas: new Date().toISOString().slice(0, 10),
    tanggalBaSurveyDinasAllIsp: new Date().toISOString().slice(0, 10),
    noPoRelease: '',
    statusPoRelease: 'Released',
    tanggalPoRelease: '',
    nilaiPo: 0,
    remarks: '',
    createdAt: new Date().toISOString().slice(0, 10)
  };

  const [formData, setFormData] = useState<Omit<ProjectItem, 'id' | 'updatedAt'>>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);

  // Category options list
  const ALL_CATEGORY_OPTIONS: ProjectCategory[] = ['GOV APJATEL', 'GOV IPPJU', 'GOV SJUT', 'Project Internal'];
  const GOV_CATEGORY_OPTIONS: ProjectCategory[] = ['GOV APJATEL', 'GOV IPPJU', 'GOV SJUT'];
  const INTERNAL_CATEGORY_OPTIONS: ProjectCategory[] = ['Project Internal'];

  // Status options sorted strictly alphabetically
  const STATUS_OPTIONS: ProjectStatus[] = ['cancel', 'completed', 'in progress', 'not started', 'review dinas'];

  // Quarter options: Q1 - 26, Q2 - 26, Q3 - 26, Q4 - 26
  const QUARTER_OPTIONS: QuarterOption[] = ['Q1 - 26', 'Q2 - 26', 'Q3 - 26', 'Q4 - 26'];

  // Group counts
  const govProjectsCount = useMemo(() => {
    return projects.filter(
      (p) => p.projectCategory !== 'Project Internal' && p.projectCategory !== 'INTERNAL'
    ).length;
  }, [projects]);

  const internalProjectsCount = useMemo(() => {
    return projects.filter(
      (p) => p.projectCategory === 'Project Internal' || p.projectCategory === 'INTERNAL'
    ).length;
  }, [projects]);

  // Sync external add modal trigger or external edit project if passed
  React.useEffect(() => {
    if (externalModalOpen) {
      handleOpenCreate();
      if (externalSetModalOpen) externalSetModalOpen(false);
    }
  }, [externalModalOpen]);

  React.useEffect(() => {
    if (externalEditingProject) {
      handleOpenEdit(externalEditingProject);
      if (setExternalEditingProject) setExternalEditingProject(null);
    }
  }, [externalEditingProject]);

  // Handle open create modal
  const handleOpenCreate = () => {
    // Generate next project ID
    const nextNum = projects.length + 1;
    const padded = String(nextNum).padStart(3, '0');
    const autoId = `PRJ-JWS-2026-${padded}`;

    setEditingProject(null);
    setFormData({
      ...initialFormState,
      projectId: autoId,
      noPoRelease: `PO-JWS/2026/0${nextNum}-${Math.floor(100 + Math.random() * 900)}`,
      statusPoRelease: 'Released',
      tanggalPoRelease: new Date().toISOString().slice(0, 10),
      nilaiPo: 2500000000,
      createdAt: new Date().toISOString().slice(0, 10)
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (project: ProjectItem) => {
    setEditingProject(project);
    setFormData({
      projectId: project.projectId,
      projectCategory: project.projectCategory,
      projectDescription: project.projectDescription,
      areaLocation: project.areaLocation,
      panjangRelokasiGalian: project.panjangRelokasiGalian,
      picIsp: project.picIsp,
      picJws: project.picJws,
      projectStatus: project.projectStatus,
      quarter: project.quarter,
      tanggalSuratDinas: project.tanggalSuratDinas,
      tanggalBaSurveyDinasAllIsp: project.tanggalBaSurveyDinasAllIsp,
      noPoRelease: project.noPoRelease || '',
      statusPoRelease: project.statusPoRelease || 'Released',
      tanggalPoRelease: project.tanggalPoRelease || '',
      nilaiPo: project.nilaiPo || 0,
      remarks: project.remarks || '',
      createdAt: project.createdAt ? project.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle form submission (Simpan)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.projectId.trim()) {
      setFormError('Project ID wajib diisi.');
      return;
    }
    if (!formData.projectDescription.trim()) {
      setFormError('Project description wajib diisi.');
      return;
    }
    if (!formData.areaLocation.trim()) {
      setFormError('Area location wajib diisi.');
      return;
    }
    if (formData.panjangRelokasiGalian < 0) {
      setFormError('Panjang relokasi / galian tidak boleh negatif.');
      return;
    }

    const now = new Date().toISOString();
    const finalCreatedAt = formData.createdAt
      ? (formData.createdAt.includes('T') ? formData.createdAt : `${formData.createdAt}T08:00:00.000Z`)
      : (editingProject ? editingProject.createdAt : now);

    const savedItem: ProjectItem = {
      id: editingProject ? editingProject.id : `prj-${Date.now()}`,
      projectId: formData.projectId.trim(),
      projectCategory: formData.projectCategory,
      projectDescription: formData.projectDescription.trim(),
      areaLocation: formData.areaLocation.trim(),
      panjangRelokasiGalian: Number(formData.panjangRelokasiGalian) || 0,
      picIsp: formData.picIsp.trim(),
      picJws: formData.picJws.trim(),
      projectStatus: formData.projectStatus,
      quarter: formData.quarter,
      tanggalSuratDinas: formData.tanggalSuratDinas,
      tanggalBaSurveyDinasAllIsp: formData.tanggalBaSurveyDinasAllIsp,
      noPoRelease: formData.noPoRelease?.trim() || '',
      statusPoRelease: formData.statusPoRelease || 'Pending',
      tanggalPoRelease: formData.tanggalPoRelease || '',
      nilaiPo: Number(formData.nilaiPo) || 0,
      remarks: formData.remarks.trim(),
      createdAt: finalCreatedAt,
      updatedAt: now
    };

    onSaveProject(savedItem);
    setIsModalOpen(false);
  };

  // Filtered & Searched Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const isInternal = p.projectCategory === 'Project Internal' || p.projectCategory === 'INTERNAL';

      // Primary group separation filter (GOV vs INTERNAL vs ALL)
      if (mainGroupFilter === 'GOV' && isInternal) return false;
      if (mainGroupFilter === 'INTERNAL' && !isInternal) return false;

      const matchSearch =
        p.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.areaLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.picIsp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.picJws.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.remarks && p.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = selectedCategory === 'ALL' || p.projectCategory === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || p.projectStatus === selectedStatus;
      const matchQuarter = selectedQuarter === 'ALL' || p.quarter === selectedQuarter;

      return matchSearch && matchCategory && matchStatus && matchQuarter;
    });
  }, [projects, mainGroupFilter, searchTerm, selectedCategory, selectedStatus, selectedQuarter]);

  // Helper for Status Badge Styling
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-600/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            completed
          </span>
        );
      case 'in progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-orange-950/60 text-orange-300 border border-orange-600/50">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            in progress
          </span>
        );
      case 'review dinas':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-yellow-950/60 text-yellow-300 border border-yellow-600/50">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            review dinas
          </span>
        );
      case 'not started':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-600/50">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            not started
          </span>
        );
      case 'cancel':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-red-950/60 text-red-300 border border-red-600/50">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            cancel
          </span>
        );
      default:
        return <span className="text-xs font-mono">{status}</span>;
    }
  };

  const getCategoryBadge = (category: ProjectCategory) => {
    switch (category) {
      case 'GOV SJUT':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
            GOV SJUT
          </span>
        );
      case 'GOV APJATEL':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-yellow-950 text-yellow-300 border border-yellow-800">
            GOV APJATEL
          </span>
        );
      case 'GOV IPPJU':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-950 text-red-300 border border-red-800">
            GOV IPPJU
          </span>
        );
      case 'Project Internal':
      case 'INTERNAL':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
            Project Internal
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
            {category}
          </span>
        );
    }
  };

  // Active Category Options based on Group
  const activeCategoryOptions = useMemo(() => {
    if (mainGroupFilter === 'GOV') return GOV_CATEGORY_OPTIONS;
    if (mainGroupFilter === 'INTERNAL') return INTERNAL_CATEGORY_OPTIONS;
    return ALL_CATEGORY_OPTIONS;
  }, [mainGroupFilter]);

  return (
    <div className="space-y-5">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#091022] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Manajemen Daftar Proyek (Project List)
            </h2>
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
              {filteredProjects.length} data terfilter
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Terbagi menjadi 2 kategori utama: <b>1. Project GOV</b> (GOV APJATEL, GOV IPPJU, GOV SJUT) dan <b>2. Project Internal</b>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => exportProjectsCsv(projects)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors finger-click"
            title="Ekspor format CSV/Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all finger-click shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Proyek Baru</span>
          </button>
        </div>
      </div>

      {/* Group Separation Tab Switcher (1. Project GOV vs 2. Project Internal) */}
      <div className="p-2 rounded-2xl bg-[#091022] border border-slate-800 shadow-lg flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleGroupChange('GOV')}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all finger-click border shrink-0 ${
            mainGroupFilter === 'GOV'
              ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span>1. Project GOV</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-900/80 border border-cyan-600/80 text-[10px] font-mono text-cyan-200 font-extrabold">
            {govProjectsCount}
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
          <span>2. Project Internal</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-900/80 border border-indigo-600/80 text-[10px] font-mono text-indigo-200 font-extrabold">
            {internalProjectsCount}
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
          <span>Semua Project</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 font-bold">
            {projects.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="p-4 rounded-2xl bg-[#091022] border border-slate-800/80 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Project ID, Uraian, Lokasi Trase, PIC ISP atau JWS..."
              className="w-full pl-10 pr-4 py-2 bg-[#0c1429] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-[#0c1429] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-400 transition-colors font-mono cursor-pointer"
              >
                <option value="ALL">
                  {mainGroupFilter === 'GOV'
                    ? 'Sub-Kategori GOV: Semua'
                    : mainGroupFilter === 'INTERNAL'
                    ? 'Kategori: Project Internal'
                    : 'Kategori: Semua'}
                </option>
                {activeCategoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-[#0c1429] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-orange-400 transition-colors font-mono cursor-pointer"
              >
                <option value="ALL">Status: Semua</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Quarter Filter */}
            <div className="relative">
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-[#0c1429] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors font-mono cursor-pointer"
              >
                <option value="ALL">Quarter: Semua</option>
                {QUARTER_OPTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filter Chips / Reset */}
        {(selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedQuarter !== 'ALL' || searchTerm) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
            <Filter className="w-3 h-3 text-cyan-400" />
            <span>Filter Aktif:</span>
            {selectedCategory !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300">
                Kategori: {selectedCategory}
              </span>
            )}
            {selectedStatus !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-orange-950/60 border border-orange-800 text-orange-300">
                Status: {selectedStatus}
              </span>
            )}
            {selectedQuarter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300">
                Quarter: {selectedQuarter}
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
                setSelectedQuarter('ALL');
                setSearchTerm('');
              }}
              className="text-xs text-cyan-400 hover:underline ml-auto finger-click"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Projects Data Table */}
      <div className="rounded-2xl bg-[#091022] border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0c1429] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-4">Uraian Proyek & Lokasi</th>
                <th className="py-3 px-3 text-right">Galian (m)</th>
                <th className="py-3 px-3">PIC ISP / JWS</th>
                <th className="py-3 px-3">Quarter</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Tgl Dinas & BA</th>
                <th className="py-3 px-3">PO Release & Nilai</th>
                <th className="py-3 px-4 text-center">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 text-slate-600" />
                      <p className="font-semibold text-slate-300">Tidak ada proyek yang sesuai dengan kriteria filter.</p>
                      <button
                        onClick={handleOpenCreate}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs finger-click"
                      >
                        + Tambah Proyek Baru
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#0c152c] transition-colors group cursor-pointer"
                    onClick={() => setViewingDetailProject(p)}
                  >
                    {/* Project ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                      {p.projectId}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getCategoryBadge(p.projectCategory)}
                    </td>

                    {/* Description & Location */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-white truncate group-hover:text-cyan-200 transition-colors" title={p.projectDescription}>
                        {p.projectDescription}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1" title={p.areaLocation}>
                        <span className="text-slate-500">📍</span> {p.areaLocation}
                      </div>
                    </td>

                    {/* Panjang Galian */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-orange-400 tabular-nums whitespace-nowrap">
                      {p.panjangRelokasiGalian.toLocaleString('id-ID')} m
                    </td>

                    {/* PIC ISP & JWS */}
                    <td className="py-3.5 px-3 text-[11px]">
                      <div className="text-slate-300 truncate max-w-[140px]" title={p.picIsp}>
                        <span className="text-slate-500">ISP:</span> {p.picIsp || '-'}
                      </div>
                      <div className="text-cyan-400 truncate max-w-[140px] mt-0.5" title={p.picJws}>
                        <span className="text-slate-500">JWS:</span> {p.picJws || '-'}
                      </div>
                    </td>

                    {/* Quarter */}
                    <td className="py-3.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                        {p.quarter}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getStatusBadge(p.projectStatus)}
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      <div title="Tanggal Surat Dinas">SD: {p.tanggalSuratDinas}</div>
                      <div className="text-slate-500 mt-0.5" title="Tanggal BA Survey">BA: {p.tanggalBaSurveyDinasAllIsp}</div>
                    </td>

                    {/* PO Release */}
                    <td className="py-3.5 px-3 font-mono text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-cyan-300">{p.noPoRelease || '-'}</span>
                        {p.statusPoRelease === 'Released' ? (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 text-[9px] font-bold">
                            REL
                          </span>
                        ) : p.statusPoRelease === 'In Process' ? (
                          <span className="px-1.5 py-0.2 rounded bg-orange-950 border border-orange-600 text-orange-300 text-[9px] font-bold">
                            PRC
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-yellow-950 border border-yellow-600 text-yellow-300 text-[9px] font-bold">
                            PND
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>Create: {p.createdAt ? new Date(p.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                      </div>
                      <div className="text-orange-400 font-bold mt-0.5">
                        {p.nilaiPo ? `Rp ${(p.nilaiPo / 1000000000).toFixed(2)} M` : '-'}
                      </div>
                    </td>

                    {/* CRUD Actions */}
                    <td
                      className="py-3.5 px-4 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()} // Prevent row click
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingDetailProject(p)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 transition-colors finger-click"
                          title="Lihat Detail Proyek"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-purple-100 border border-purple-800/50 transition-colors finger-click"
                          title="Edit Proyek"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-800/50 transition-colors finger-click"
                          title="Hapus Proyek"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: INPUT / EDIT PROYEK (Lengkapi dengan Simpan, Kembali, dsb) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#090f20] border border-cyan-500/40 rounded-2xl shadow-2xl neon-glow-cyan overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-[#0d152a] border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  {editingProject ? 'Edit Data Proyek JWS' : 'Input Proyek JWS Baru'}
                </h3>
                <p className="text-xs text-slate-400">
                  Formulir terstandarisasi untuk monitoring dan pengendalian relokasi utilitas
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors finger-click"
                title="Kembali"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-200 flex items-center gap-2">
                  <span>⚠️</span> {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project ID */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 font-mono">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    placeholder="Contoh: PRJ-JWS-2026-008"
                    className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                {/* Project Category */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 font-mono">
                    Project Category
                  </label>
                  <select
                    value={formData.projectCategory}
                    onChange={(e) => setFormData({ ...formData, projectCategory: e.target.value as ProjectCategory })}
                    className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    {ALL_CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 font-mono">
                  Project Description
                </label>
                <input
                  type="text"
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  placeholder="Contoh: Relokasi Saluran Udara Kabel Fiber Optik ke Ducting Bawah Tanah..."
                  className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Area Location */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 font-mono">
                  Area Location
                </label>
                <input
                  type="text"
                  value={formData.areaLocation}
                  onChange={(e) => setFormData({ ...formData, areaLocation: e.target.value })}
                  placeholder="Contoh: Jl. Sudirman - Bundaran HI (Sisi Barat & Timur)"
                  className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Panjang Relokasi / Galian (meter) */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 font-mono">
                    Panjang Relokasi / Galian (meter)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.panjangRelokasiGalian}
                    onChange={(e) => setFormData({ ...formData, panjangRelokasiGalian: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-orange-400"
                    required
                  />
                </div>

                {/* PIC ISP */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 font-mono">
                    PIC ISP
                  </label>
                  <input
                    type="text"
                    value={formData.picIsp}
                    onChange={(e) => setFormData({ ...formData, picIsp: e.target.value })}
                    placeholder="Nama & Instansi ISP"
                    className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* PIC JWS */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 font-mono">
                    PIC JWS
                  </label>
                  <input
                    type="text"
                    value={formData.picJws}
                    onChange={(e) => setFormData({ ...formData, picJws: e.target.value })}
                    placeholder="Nama Pengawas JWS"
                    className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project Status */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 font-mono">
                    Project Status
                  </label>
                  <select
                    value={formData.projectStatus}
                    onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value as ProjectStatus })}
                    className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-orange-400 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quater dengan option Q1 - 26, Q2 - 26, Q3 - 26, Q4 - 26 */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 font-mono">
                    Quarter
                  </label>
                  <select
                    value={formData.quarter}
                    onChange={(e) => setFormData({ ...formData, quarter: e.target.value as QuarterOption })}
                    className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {QUARTER_OPTIONS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tanggal Surat Dinas (kalender) */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 font-mono">
                    Tanggal Surat Dinas (Kalender)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.tanggalSuratDinas}
                      onChange={(e) => setFormData({ ...formData, tanggalSuratDinas: e.target.value })}
                      className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Tanggal BA survey Dinas & All ISP (kalender) */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 font-mono">
                    Tanggal BA Survey Dinas & All ISP (Kalender)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.tanggalBaSurveyDinasAllIsp}
                      onChange={(e) => setFormData({ ...formData, tanggalBaSurveyDinasAllIsp: e.target.value })}
                      className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Section: PO Release & Nilai Kontrak */}
              <div className="bg-[#0a1226] p-4 rounded-xl border border-emerald-500/30 space-y-3">
                <div className="font-semibold text-emerald-300 font-mono flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Data PO Release (Purchase Order & SPK)
                  </div>
                  {formData.createdAt && (
                    <span className="text-[11px] text-cyan-400 font-normal flex items-center gap-1.5 bg-[#070b16] border border-cyan-900/60 px-2.5 py-1 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Project Create Date: <strong>{new Date(formData.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 font-mono text-xs">
                      No. PO Release
                    </label>
                    <input
                      type="text"
                      value={formData.noPoRelease}
                      onChange={(e) => setFormData({ ...formData, noPoRelease: e.target.value })}
                      placeholder="PO-JWS/2026/01-089"
                      className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-400 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 font-mono text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      <span>Project Create Date</span>
                    </label>
                    <input
                      type="date"
                      value={formData.createdAt ? formData.createdAt.slice(0, 10) : ''}
                      onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                      className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-400 cursor-pointer text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 font-mono text-xs">
                      Status PO Release
                    </label>
                    <select
                      value={formData.statusPoRelease}
                      onChange={(e) => setFormData({ ...formData, statusPoRelease: e.target.value as any })}
                      className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-400 cursor-pointer text-xs"
                    >
                      <option value="Released">Released</option>
                      <option value="In Process">In Process</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 font-mono text-xs">
                      Tanggal PO Release
                    </label>
                    <input
                      type="date"
                      value={formData.tanggalPoRelease}
                      onChange={(e) => setFormData({ ...formData, tanggalPoRelease: e.target.value })}
                      className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-400 cursor-pointer text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 font-mono text-xs">
                      Nilai Kontrak PO (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000000"
                      value={formData.nilaiPo}
                      onChange={(e) => setFormData({ ...formData, nilaiPo: parseFloat(e.target.value) || 0 })}
                      placeholder="Contoh: 2500000000"
                      className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-400 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks (teks area) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 font-mono">
                  Remarks (Catatan Lapangan & Khusus)
                </label>
                <textarea
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Keterangan tambahan, catatan perizinan, hambatan utilitas PLN/PAM, dll..."
                  className="w-full p-2.5 bg-[#0c1429] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Action Buttons: Simpan & Kembali */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold finger-click transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold tracking-wide shadow-lg shadow-cyan-500/25 neon-border-cyan finger-click flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Data Proyek</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / MODAL */}
      {viewingDetailProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#090f20] border border-slate-700 rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {viewingDetailProject.projectId}
                </span>
                {getCategoryBadge(viewingDetailProject.projectCategory)}
                {getStatusBadge(viewingDetailProject.projectStatus)}
              </div>
              <button
                onClick={() => setViewingDetailProject(null)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-base font-bold text-white">
                {viewingDetailProject.projectDescription}
              </h4>
              <p className="text-slate-400 mt-1">📍 {viewingDetailProject.areaLocation}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0c1429] p-3.5 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">PANJANG GALIAN</span>
                <span className="text-sm font-bold text-orange-400">
                  {viewingDetailProject.panjangRelokasiGalian.toLocaleString('id-ID')} m
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">QUARTER</span>
                <span className="text-sm font-bold text-white">{viewingDetailProject.quarter}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">TGL SURAT DINAS</span>
                <span className="text-xs text-slate-300">{viewingDetailProject.tanggalSuratDinas}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">TGL BA SURVEY</span>
                <span className="text-xs text-slate-300">{viewingDetailProject.tanggalBaSurveyDinasAllIsp}</span>
              </div>
            </div>

            {/* PO Release Details in Detail View */}
            <div className="bg-[#0c162d] p-4 rounded-xl border border-emerald-500/30 space-y-3 font-mono">
              <div className="font-semibold text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Data PO Release (Purchase Order & SPK)</span>
                </div>
                <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-normal bg-[#070b16] px-2.5 py-0.5 rounded border border-cyan-900/60">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  <span>Created: {viewingDetailProject.createdAt ? new Date(viewingDetailProject.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 block">NO. PO RELEASE</span>
                  <span className="text-sm font-bold text-cyan-300">
                    {viewingDetailProject.noPoRelease || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">PROJECT CREATE DATE</span>
                  <span className="text-xs text-cyan-300 font-bold flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    {viewingDetailProject.createdAt ? new Date(viewingDetailProject.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">STATUS PO</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block mt-0.5 ${
                    viewingDetailProject.statusPoRelease === 'Released'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      : viewingDetailProject.statusPoRelease === 'In Process'
                      ? 'bg-orange-950 text-orange-300 border border-orange-600'
                      : 'bg-yellow-950 text-yellow-300 border border-yellow-600'
                  }`}>
                    {viewingDetailProject.statusPoRelease || 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">TANGGAL RILIS PO</span>
                  <span className="text-xs text-slate-300 mt-1 block">
                    {viewingDetailProject.tanggalPoRelease || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">NILAI KONTRAK PO</span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                    {viewingDetailProject.nilaiPo ? `Rp ${viewingDetailProject.nilaiPo.toLocaleString('id-ID')}` : '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] font-mono block">PIC ISP</span>
                <span className="font-semibold text-white">{viewingDetailProject.picIsp || '-'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] font-mono block">PIC JWS</span>
                <span className="font-semibold text-cyan-300">{viewingDetailProject.picJws || '-'}</span>
              </div>
            </div>

            {viewingDetailProject.remarks && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-300">
                <span className="text-slate-500 text-[10px] block mb-1">REMARKS / CATATAN</span>
                <p className="leading-relaxed">{viewingDetailProject.remarks}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                Terakhir Diperbarui: {new Date(viewingDetailProject.updatedAt).toLocaleString('id-ID')}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setViewingDetailProject(null);
                    handleOpenEdit(viewingDetailProject);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 font-semibold finger-click"
                >
                  Edit Proyek
                </button>
                <button
                  onClick={() => setViewingDetailProject(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 finger-click"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#090f20] border border-red-500/50 rounded-2xl shadow-2xl p-5 text-center neon-glow-red">
            <div className="w-12 h-12 rounded-full bg-red-950 border border-red-800 flex items-center justify-center text-red-400 mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Konfirmasi Hapus Proyek</h4>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Apakah Anda yakin ingin menghapus data proyek ini dari database? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold finger-click"
              >
                Kembali
              </button>
              <button
                onClick={() => {
                  onDeleteProject(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold finger-click shadow-lg shadow-red-600/30"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

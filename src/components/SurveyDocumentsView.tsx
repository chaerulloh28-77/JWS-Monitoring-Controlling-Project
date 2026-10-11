import React, { useState, useRef } from 'react';
import {
  FileText,
  Search,
  Download,
  Eye,
  FileUp,
  Trash2,
  CheckCircle2,
  Clock,
  Building2,
  ShieldCheck,
  Filter,
  Plus,
  Save,
  MessageSquare,
  Sparkles,
  Calendar,
  MapPin,
  Tag,
  AlertCircle,
  Mail
} from 'lucide-react';
import {
  ProjectItem,
  ConstructionPlanItem,
  AttachedDocument,
  DocumentCategory,
  ProjectCategory
} from '../types';
import { ShareEmailModal } from './ShareEmailModal';

interface SurveyDocumentsViewProps {
  projects: ProjectItem[];
  plans: ConstructionPlanItem[];
  groupFilter: 'GOV' | 'INTERNAL' | 'ALL';
  onSavePlan: (plan: ConstructionPlanItem) => void;
  onViewPdf: (doc: AttachedDocument) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  onGroupFilterChange?: (group: 'GOV' | 'INTERNAL' | 'ALL') => void;
}

export const SurveyDocumentsView: React.FC<SurveyDocumentsViewProps> = ({
  projects,
  plans,
  groupFilter,
  onSavePlan,
  onViewPdf,
  showToast,
  onGroupFilterChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingNotesPlanId, setEditingNotesPlanId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalGroup, setShareModalGroup] = useState<'GOV' | 'INTERNAL' | 'ALL'>('GOV');

  // Refs for hidden file inputs indexed by planId and docKey
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Map project category lookup
  const projectMap = React.useMemo(() => {
    const map = new Map<string, ProjectItem>();
    projects.forEach((p) => map.set(p.projectId, p));
    return map;
  }, [projects]);

  // Filter plans based on groupFilter (GOV / INTERNAL / ALL) and selected category and search term
  const filteredPlans = React.useMemo(() => {
    return plans.filter((plan) => {
      const parentProject = projectMap.get(plan.projectId);
      const cat = parentProject?.projectCategory || 'GOV APJATEL';
      const isInternal = cat === 'Project Internal' || cat === 'INTERNAL';

      // 1. Group Filter
      if (groupFilter === 'GOV' && isInternal) return false;
      if (groupFilter === 'INTERNAL' && !isInternal) return false;

      // 2. Category Sub-filter
      if (selectedCategory !== 'ALL' && cat !== selectedCategory) return false;

      // 3. Search Term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchId = plan.projectId.toLowerCase().includes(query);
        const matchIsp = plan.namaIsp.toLowerCase().includes(query);
        const matchArea = (parentProject?.areaLocation || '').toLowerCase().includes(query);
        const matchRemarks = (plan.remarks || '').toLowerCase().includes(query);
        if (!matchId && !matchIsp && !matchArea && !matchRemarks) return false;
      }

      return true;
    });
  }, [plans, projectMap, groupFilter, selectedCategory, searchTerm]);

  // Calculate Overview Statistics
  const stats = React.useMemo(() => {
    let totalUploadedDocs = 0;
    let totalBaSurveyDone = 0;
    let totalNotesCount = 0;

    plans.forEach((plan) => {
      const docsList = [
        plan.docKmz,
        plan.docApdRelokasi || plan.apdIsp,
        plan.docTimeline,
        plan.docSuratPerintahRelokasi,
        plan.docBaSurveyBersama || plan.baSurvey,
        plan.docSuratPenunjukanVendor,
        plan.docSuratRekomtek
      ];

      docsList.forEach((d) => {
        if (d) totalUploadedDocs += 1;
      });

      if (plan.docBaSurveyBersama || plan.baSurvey || (plan.tanggalBaSurvey && plan.tanggalBaSurvey.length > 0)) {
        totalBaSurveyDone += 1;
      }

      if (plan.remarks && plan.remarks.trim().length > 0) {
        totalNotesCount += 1;
      }
    });

    const totalPossibleDocs = plans.length * 7;
    const completenessPercent =
      totalPossibleDocs > 0 ? Math.round((totalUploadedDocs / totalPossibleDocs) * 100) : 0;

    return {
      totalUploadedDocs,
      totalBaSurveyDone,
      totalNotesCount,
      completenessPercent,
      totalPlansCount: plans.length
    };
  }, [plans]);

  // File Upload Handler
  const handleFileUpload = (
    plan: ConstructionPlanItem,
    docKey: string,
    category: DocumentCategory,
    file: File
  ) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultDataUrl = reader.result as string;

      const newDoc: AttachedDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadedAt: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        fileDataUrl: resultDataUrl,
        documentType: category,
        signer: 'Tim Field Survey JWS',
        status: 'Verified',
        notes: `Tersimpan via Menu Survey, Dokumen & Catatan`
      };

      const updatedPlan: ConstructionPlanItem = { ...plan };

      switch (docKey) {
        case 'docKmz':
          updatedPlan.docKmz = newDoc;
          break;
        case 'docApdRelokasi':
          updatedPlan.docApdRelokasi = newDoc;
          updatedPlan.apdIsp = newDoc;
          break;
        case 'docTimeline':
          updatedPlan.docTimeline = newDoc;
          break;
        case 'docSuratPerintahRelokasi':
          updatedPlan.docSuratPerintahRelokasi = newDoc;
          break;
        case 'docBaSurveyBersama':
          updatedPlan.docBaSurveyBersama = newDoc;
          updatedPlan.baSurvey = newDoc;
          break;
        case 'docSuratPenunjukanVendor':
          updatedPlan.docSuratPenunjukanVendor = newDoc;
          break;
        case 'docSuratRekomtek':
          updatedPlan.docSuratRekomtek = newDoc;
          break;
        default:
          break;
      }

      updatedPlan.updatedAt = new Date().toISOString();
      onSavePlan(updatedPlan);
      showToast('success', 'Dokumen Berhasil Diunggah', `${file.name} tersimpan untuk ISP ${plan.namaIsp}`);
    };

    reader.readAsDataURL(file);
  };

  // Document Clear Handler
  const handleClearDoc = (plan: ConstructionPlanItem, docKey: string, title: string) => {
    const updatedPlan: ConstructionPlanItem = { ...plan };

    switch (docKey) {
      case 'docKmz':
        updatedPlan.docKmz = null;
        break;
      case 'docApdRelokasi':
        updatedPlan.docApdRelokasi = null;
        updatedPlan.apdIsp = null;
        break;
      case 'docTimeline':
        updatedPlan.docTimeline = null;
        break;
      case 'docSuratPerintahRelokasi':
        updatedPlan.docSuratPerintahRelokasi = null;
        break;
      case 'docBaSurveyBersama':
        updatedPlan.docBaSurveyBersama = null;
        updatedPlan.baSurvey = null;
        break;
      case 'docSuratPenunjukanVendor':
        updatedPlan.docSuratPenunjukanVendor = null;
        break;
      case 'docSuratRekomtek':
        updatedPlan.docSuratRekomtek = null;
        break;
      default:
        break;
    }

    updatedPlan.updatedAt = new Date().toISOString();
    onSavePlan(updatedPlan);
    showToast('warning', 'Dokumen Dihapus', `Berkas ${title} dihapus dari ${plan.namaIsp}`);
  };

  // Download File Helper
  const triggerDownloadDocument = (doc: AttachedDocument) => {
    if (!doc.fileDataUrl) {
      showToast('error', 'Gagal Mengunduh', 'Isi data berkas tidak ditemukan atau ukuran terlalu besar.');
      return;
    }
    const link = document.createElement('a');
    link.href = doc.fileDataUrl;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('info', 'Mengunduh Dokumen', `Mengunduh berkas ${doc.fileName}`);
  };

  // Save Notes Handler
  const handleSaveNotes = (plan: ConstructionPlanItem) => {
    const updatedPlan: ConstructionPlanItem = {
      ...plan,
      remarks: tempNotes,
      updatedAt: new Date().toISOString()
    };
    onSavePlan(updatedPlan);
    setEditingNotesPlanId(null);
    showToast('success', 'Catatan Diperbarui', `Catatan proyek ${plan.projectId} - ${plan.namaIsp} berhasil disimpan.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-2xl p-6 bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-cyan-950/80 border border-emerald-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                <FileText className="size-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold">
                  Portal Arsip Legal & Field Notes
                </span>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Survey, Dokumen & Catatan
                </h1>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl font-mono leading-relaxed">
              Pusat pengelolaan 7 jenis berkas survey resmi (KMZ, APD Relokasi, Timeline, Surat Perintah, BA Survey Bersama, Vendor & Rekomtek) serta catatan lapangan seluruh proyek ISP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setShareModalGroup(groupFilter);
                setIsShareModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
              title="Kirim Berkas Dokumen & Catatan Survey via Email"
            >
              <Mail className="size-4 animate-bounce" />
              <span>Kirim via Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Berkas Ter-upload</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{stats.totalUploadedDocs}</span>
            <span className="text-[10px] text-slate-400 font-mono">/ {stats.totalPlansCount * 7} target berkas</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.completenessPercent}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">BA Survey Bersama</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{stats.totalBaSurveyDone}</span>
            <span className="text-[10px] text-cyan-300 font-mono">Telah Dilakukan</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 font-mono">
            {Math.round((stats.totalBaSurveyDone / Math.max(stats.totalPlansCount, 1)) * 100)}% dari total {stats.totalPlansCount} ISP
          </p>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-purple-500/30 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Kelengkapan Dokumen</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-300 font-mono">{stats.completenessPercent}%</span>
            <span className="text-[10px] text-slate-400 font-mono">Skor Kelengkapan</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 font-mono">
            Rata-rata ketersediaan dokumen legal
          </p>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-amber-500/30 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Catatan / Remarks</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <MessageSquare className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-300 font-mono">{stats.totalNotesCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">Catatan Proyek</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 font-mono">
            Log observasi & catatan khusus lapangan
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Main Group Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-black/50 rounded-xl border border-white/10 self-start">
            <button
              onClick={() => onGroupFilterChange?.('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                groupFilter === 'ALL'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Semua Proyek
            </button>
            <button
              onClick={() => onGroupFilterChange?.('GOV')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                groupFilter === 'GOV'
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="size-3.5" />
              <span>1. Dokumen GOV</span>
            </button>
            <button
              onClick={() => onGroupFilterChange?.('INTERNAL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                groupFilter === 'INTERNAL'
                  ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="size-3.5" />
              <span>2. Dokumen Internal</span>
            </button>
          </div>

          {/* Sub-filters & Search Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="size-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Semua Kategori Regulasi</option>
                <option value="GOV APJATEL">GOV APJATEL</option>
                <option value="GOV IPPJU">GOV IPPJU</option>
                <option value="GOV SJUT">GOV SJUT</option>
                <option value="Project Internal">Project Internal</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari Project ID, ISP, atau catatan..."
                className="w-full bg-black/60 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main List of ISP Documents Cards */}
      {filteredPlans.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/10 space-y-3">
          <AlertCircle className="size-10 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-white font-mono">Data Dokumen Tidak Ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto font-mono">
            Tidak ada proyek yang sesuai dengan kriteria pencarian atau filter ({groupFilter}). Silakan atur ulang kata kunci pencarian.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPlans.map((plan) => {
            const parentProject = projectMap.get(plan.projectId);
            const category = parentProject?.projectCategory || 'GOV APJATEL';
            const isInternal = category === 'Project Internal' || category === 'INTERNAL';

            // 7 Document configs array
            const docsList = [
              {
                key: 'docKmz',
                title: '1. KMZ Trase Relokasi',
                desc: 'File Google Earth jalur (.kmz / .kml)',
                doc: plan.docKmz,
                category: 'KMZ' as DocumentCategory
              },
              {
                key: 'docApdRelokasi',
                title: '2. APD Relokasi',
                desc: 'As-Planned Drawing utilitas (.pdf, .dwg, dll)',
                doc: plan.docApdRelokasi || plan.apdIsp,
                category: 'APD Relokasi' as DocumentCategory
              },
              {
                key: 'docTimeline',
                title: '3. Timeline Pelaksana',
                desc: 'Kurva S & jadwal kontraktor (.xlsx, .pdf, dll)',
                doc: plan.docTimeline,
                category: 'Timeline Pelaksana' as DocumentCategory
              },
              {
                key: 'docSuratPerintahRelokasi',
                title: '4. Surat Perintah Dinas',
                desc: 'Instruksi resmi Dinas Bina Marga (.pdf, .doc)',
                doc: plan.docSuratPerintahRelokasi,
                category: 'Surat Perintah Relokasi (Dinas)' as DocumentCategory
              },
              {
                key: 'docBaSurveyBersama',
                title: '5. BA Survey Bersama',
                desc: 'BA kesepakatan Dinas & All ISP (.pdf)',
                doc: plan.docBaSurveyBersama || plan.baSurvey,
                category: 'BA Survey Bersama' as DocumentCategory
              },
              {
                key: 'docSuratPenunjukanVendor',
                title: '6. Surat Penunjukan Vendor',
                desc: 'SPK / penetapan vendor (.pdf)',
                doc: plan.docSuratPenunjukanVendor,
                category: 'Surat Penunjukan Vendor' as DocumentCategory
              },
              {
                key: 'docSuratRekomtek',
                title: '7. Surat Rekomtek',
                desc: 'Rekomendasi teknis Dinas (.pdf, .doc)',
                doc: plan.docSuratRekomtek,
                category: 'Surat Rekomtek' as DocumentCategory
              }
            ];

            const uploadedCount = docsList.filter((item) => !!item.doc).length;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isInternal
                    ? 'bg-slate-900/60 border-indigo-500/30 hover:border-indigo-500/50'
                    : 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/50'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 ${
                        isInternal
                          ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                          : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      {isInternal ? <ShieldCheck className="size-5" /> : <Building2 className="size-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-white font-mono">
                          {plan.namaIsp}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            isInternal
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {category}
                        </span>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                          {plan.projectId}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-4 text-xs text-slate-400 font-mono flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-slate-500" />
                          <span>{parentProject?.areaLocation || 'DKI Jakarta'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-slate-500" />
                          <span>BA Survey: {plan.tanggalBaSurvey || 'Belum Dijadwalkan'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Header Badges */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-mono">Kelengkapan Dokumen</div>
                      <div className="text-xs font-bold font-mono text-emerald-400 flex items-center justify-end gap-1">
                        <CheckCircle2 className="size-3.5" />
                        <span>{uploadedCount} / 7 Berkas</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7 Documents Grid */}
                <div className="p-4 sm:p-5">
                  <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Tag className="size-3.5 text-cyan-400" />
                    <span>Daftar 7 Dokumen Survey & Legalitas</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {docsList.map((item) => {
                      const inputRefKey = `${plan.id}-${item.key}`;

                      return (
                        <div
                          key={item.key}
                          className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                            item.doc
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : 'bg-black/30 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold font-mono text-white truncate" title={item.title}>
                                {item.title}
                              </span>
                              {item.doc ? (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                                  Terupload
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 shrink-0">
                                  Belum
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-slate-400 font-mono mb-2 line-clamp-1" title={item.desc}>
                              {item.desc}
                            </p>

                            {item.doc ? (
                              <div className="p-2 rounded-lg bg-black/60 border border-white/10 space-y-1 mb-2">
                                <div className="text-xs font-semibold text-emerald-200 truncate" title={item.doc.fileName}>
                                  {item.doc.fileName}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between">
                                  <span>{item.doc.fileSize}</span>
                                  <span>{item.doc.uploadedAt}</span>
                                </div>
                              </div>
                            ) : null}
                          </div>

                          {/* Hidden input */}
                          <input
                            ref={(el) => {
                              fileInputRefs.current[inputRefKey] = el;
                            }}
                            type="file"
                            accept="*/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(plan, item.key, item.category, e.target.files[0]);
                              }
                            }}
                          />

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 pt-1">
                            {item.doc ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => triggerDownloadDocument(item.doc!)}
                                  className="flex-1 py-1 px-2 rounded-lg text-[10px] font-mono text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 transition-colors flex items-center justify-center gap-1 font-semibold"
                                  title={`Unduh ${item.doc.fileName}`}
                                >
                                  <Download className="size-3" />
                                  <span>Unduh</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onViewPdf(item.doc!)}
                                  className="p-1 text-slate-300 hover:text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                                  title="Pratinjau Dokumen"
                                >
                                  <Eye className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => fileInputRefs.current[inputRefKey]?.click()}
                                  className="p-1 text-slate-300 hover:text-amber-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                                  title="Ganti Berkas"
                                >
                                  <FileUp className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleClearDoc(plan, item.key, item.title)}
                                  className="p-1 text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                                  title="Hapus Berkas"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[inputRefKey]?.click()}
                                className="w-full py-1.5 px-2 rounded-lg text-[10px] font-mono text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 transition-colors flex items-center justify-center gap-1.5 font-semibold"
                              >
                                <FileUp className="size-3" />
                                <span>Unggah Berkas</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Section Catatan / Remarks */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="size-4 text-amber-400" />
                        <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                          Catatan & Remarks Proyek Lapangan
                        </span>
                      </div>

                      {editingNotesPlanId !== plan.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNotesPlanId(plan.id);
                            setTempNotes(plan.remarks || '');
                          }}
                          className="text-[11px] font-mono text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40 transition-colors flex items-center gap-1"
                        >
                          <Plus className="size-3" />
                          <span>Edit Catatan</span>
                        </button>
                      )}
                    </div>

                    {editingNotesPlanId === plan.id ? (
                      <div className="p-3 rounded-xl bg-black/60 border border-amber-500/40 space-y-2">
                        <textarea
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="Ketikkan catatan khusus survey, rekomendasi, kendala lapangan..."
                          rows={3}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingNotesPlanId(null)}
                            className="px-3 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-white/5 hover:bg-white/10"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(plan)}
                            className="px-3 py-1 rounded-lg text-xs font-mono font-bold text-black bg-amber-400 hover:bg-amber-300 flex items-center gap-1 shadow-md shadow-amber-400/20"
                          >
                            <Save className="size-3.5" />
                            <span>Simpan Catatan</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                        {plan.remarks && plan.remarks.trim().length > 0 ? (
                          <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                            {plan.remarks}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 italic font-mono">
                            Belum ada catatan khusus untuk proyek {plan.namaIsp}. Klik "Edit Catatan" untuk menambahkan.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Email Modal */}
      <ShareEmailModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        projects={projects}
        plans={plans}
        defaultGroupFilter={shareModalGroup}
        showToast={showToast}
      />
    </div>
  );
};

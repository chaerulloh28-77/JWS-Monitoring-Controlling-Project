import React, { useState, useRef } from 'react';
import {
  FileText,
  Search,
  Download,
  Eye,
  FileUp,
  Trash2,
  CheckCircle2,
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
  Mail,
  X,
  UserCheck,
  Edit3,
  UploadCloud,
  Check,
  Clock,
  FileCheck,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  ProjectItem,
  ConstructionPlanItem,
  AttachedDocument,
  DocumentCategory,
  ProjectCategory
} from '../types';
import { ShareEmailModal } from './ShareEmailModal';
import { saveDocumentToIDB, deleteDocumentFromIDB } from '../utils/indexedDB';

interface SurveyDocumentsViewProps {
  projects: ProjectItem[];
  plans: ConstructionPlanItem[];
  groupFilter: 'GOV' | 'INTERNAL' | 'ALL';
  onSavePlan: (plan: ConstructionPlanItem) => void;
  onSaveProject?: (project: ProjectItem) => void;
  onViewPdf: (doc: AttachedDocument) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  onGroupFilterChange?: (group: 'GOV' | 'INTERNAL' | 'ALL') => void;
  onDeletePlan?: (planId: string) => void;
}

export const SurveyDocumentsView: React.FC<SurveyDocumentsViewProps> = ({
  projects,
  plans,
  groupFilter,
  onSavePlan,
  onSaveProject,
  onViewPdf,
  showToast,
  onGroupFilterChange,
  onDeletePlan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingNotesPlanId, setEditingNotesPlanId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  // Share Email Modal States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalGroup, setShareModalGroup] = useState<'GOV' | 'INTERNAL' | 'ALL'>('GOV');
  const [selectedIspForEmail, setSelectedIspForEmail] = useState<string>('ALL');

  // Interactive KPI Modals State
  const [activeKpiModal, setActiveKpiModal] = useState<
    'UPLOADED_FILES' | 'BA_SURVEY' | 'COMPLETENESS' | 'REMARKS' | null
  >(null);

  // Quick Upload Form state inside Modal 1 (Uploaded Files Modal)
  const [quickUploadPlanId, setQuickUploadPlanId] = useState<string>('');
  const [quickUploadProjectId, setQuickUploadProjectId] = useState<string>('PRJ-JWS-2026-001');
  const [quickUploadCategory, setQuickUploadCategory] = useState<ProjectCategory>('GOV APJATEL');
  const [quickUploadDescription, setQuickUploadDescription] = useState<string>('');
  const [quickUploadAreaLocation, setQuickUploadAreaLocation] = useState<string>('');
  const [quickUploadDocKey, setQuickUploadDocKey] = useState<string>('docKmz');
  const [customNewIspName, setCustomNewIspName] = useState<string>('');

  // ==================== BA SURVEY INTERNAL CRUD STATES (MODAL 2) ====================
  const [baSearchQuery, setBaSearchQuery] = useState('');
  const [baStatusFilter, setBaStatusFilter] = useState<'ALL' | 'DONE' | 'PENDING'>('ALL');
  const [isAddingNewBa, setIsAddingNewBa] = useState(false);
  
  // New BA Form state
  const [newBaIspName, setNewBaIspName] = useState('Indosat Ooredoo');
  const [newBaCustomIsp, setNewBaCustomIsp] = useState('');
  const [newBaProjectId, setNewBaProjectId] = useState('');
  const [newBaDateInput, setNewBaDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [newBaSigner, setNewBaSigner] = useState('Tim Field Survey JWS & ISP');
  const [newBaStatus, setNewBaStatus] = useState<'Verified' | 'Pending Review' | 'Uploaded'>('Verified');
  const [newBaNotes, setNewBaNotes] = useState('');
  const [newBaFile, setNewBaFile] = useState<File | null>(null);

  // Edit BA state per plan
  const [editingBaId, setEditingBaId] = useState<string | null>(null);
  const [editBaDate, setEditBaDate] = useState('');
  const [editBaSigner, setEditBaSigner] = useState('');
  const [editBaStatus, setEditBaStatus] = useState<'Verified' | 'Pending Review' | 'Uploaded'>('Verified');
  const [editBaNotes, setEditBaNotes] = useState('');


  // Refs for hidden file inputs
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Map project category lookup
  const projectMap = React.useMemo(() => {
    const map = new Map<string, ProjectItem>();
    projects.forEach((p) => map.set(p.projectId, p));
    return map;
  }, [projects]);

  // Sync quick upload form when selecting ISP in Modal 1
  const handleQuickUploadPlanSelect = (planId: string) => {
    setQuickUploadPlanId(planId);
    if (planId === 'NEW_ISP') {
      const nextNum = String(projects.length + 1).padStart(3, '0');
      setQuickUploadProjectId(`PRJ-JWS-2026-${nextNum}`);
      setQuickUploadCategory('GOV APJATEL');
      setQuickUploadDescription('');
      setQuickUploadAreaLocation('');
    } else {
      const selectedPlan = plans.find((p) => p.id === planId);
      if (selectedPlan) {
        const parentProject = projects.find((p) => p.projectId === selectedPlan.projectId);
        setQuickUploadProjectId(selectedPlan.projectId || '');
        setQuickUploadCategory(parentProject?.projectCategory || 'GOV APJATEL');
        setQuickUploadDescription(parentProject?.projectDescription || selectedPlan.projectName || '');
        setQuickUploadAreaLocation(parentProject?.areaLocation || '');
      }
    }
  };

  React.useEffect(() => {
    if (activeKpiModal === 'UPLOADED_FILES') {
      if (plans.length > 0 && !quickUploadPlanId) {
        handleQuickUploadPlanSelect(plans[0].id);
      } else if (plans.length === 0) {
        handleQuickUploadPlanSelect('NEW_ISP');
      }
    }
  }, [activeKpiModal]);

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
        plan.docApdRelokasi,
        plan.docApdIsp || plan.apdIsp,
        plan.docTimeline,
        plan.docSuratPerintahRelokasi,
        plan.docBaSurveyInternal,
        plan.docBaSurveyBersama || plan.baSurvey,
        plan.docSuratPenunjukanVendor,
        plan.docSuratRekomtek
      ];

      docsList.forEach((d) => {
        if (d) totalUploadedDocs += 1;
      });

      if (plan.docBaSurveyBersama || plan.baSurvey || plan.docBaSurveyInternal || (plan.tanggalBaSurvey && plan.tanggalBaSurvey.length > 0)) {
        totalBaSurveyDone += 1;
      }

      if (plan.remarks && plan.remarks.trim().length > 0) {
        totalNotesCount += 1;
      }
    });

    const totalPossibleDocs = plans.length * 9;
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

  // Open Share Email for specific ISP
  const handleOpenEmailForIsp = (ispName: string) => {
    setSelectedIspForEmail(ispName);
    setShareModalGroup(groupFilter);
    setIsShareModalOpen(true);
  };

  // Open Share Email globally
  const handleOpenEmailGlobal = () => {
    setSelectedIspForEmail('ALL');
    setShareModalGroup(groupFilter);
    setIsShareModalOpen(true);
  };

  // File Upload Handler (Maksimal 4 MB)
  const handleFileUpload = (
    plan: ConstructionPlanItem,
    docKey: string,
    category: DocumentCategory,
    file: File,
    customSigner?: string,
    customStatus?: 'Verified' | 'Pending Review' | 'Uploaded',
    customNotes?: string
  ) => {
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB Limit
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      showToast(
        'error',
        'Ukuran Dokumen Terlalu Besar',
        `Ukuran berkas "${file.name}" (${sizeMB} MB) melebihi batas maksimum 4 MB. Silakan pilih berkas yang lebih kecil.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultDataUrl = reader.result as string;
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      // Save binary data to IndexedDB
      saveDocumentToIDB(docId, resultDataUrl);

      const newDoc: AttachedDocument = {
        id: docId,
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadedAt: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        fileDataUrl: resultDataUrl,
        documentType: category,
        signer: customSigner || 'Tim Field Survey JWS',
        status: customStatus || 'Verified',
        notes: customNotes || `Tersimpan via Menu Survey, Dokumen & Catatan`
      };

      const updatedPlan: ConstructionPlanItem = { ...plan };

      switch (docKey) {
        case 'docKmz':
          updatedPlan.docKmz = newDoc;
          break;
        case 'docApdRelokasi':
          updatedPlan.docApdRelokasi = newDoc;
          break;
        case 'docApdIsp':
          updatedPlan.docApdIsp = newDoc;
          updatedPlan.apdIsp = newDoc;
          break;
        case 'docTimeline':
          updatedPlan.docTimeline = newDoc;
          break;
        case 'docSuratPerintahRelokasi':
          updatedPlan.docSuratPerintahRelokasi = newDoc;
          break;
        case 'docBaSurveyInternal':
          updatedPlan.docBaSurveyInternal = newDoc;
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

  // Document Clear Handler (Delete - No window.confirm to avoid sandbox iframe blocking)
  const handleClearDoc = (plan: ConstructionPlanItem, docKey: string, title: string) => {
    const updatedPlan: ConstructionPlanItem = { ...plan };

    switch (docKey) {
      case 'docKmz':
        updatedPlan.docKmz = null;
        break;
      case 'docApdRelokasi':
        updatedPlan.docApdRelokasi = null;
        break;
      case 'docApdIsp':
        updatedPlan.docApdIsp = null;
        updatedPlan.apdIsp = null;
        break;
      case 'docTimeline':
        updatedPlan.docTimeline = null;
        break;
      case 'docSuratPerintahRelokasi':
        updatedPlan.docSuratPerintahRelokasi = null;
        break;
      case 'docBaSurveyInternal':
        updatedPlan.docBaSurveyInternal = null;
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
    showToast('warning', 'Dokumen Dihapus', `Berkas ${title} berhasil dihapus dari ${plan.namaIsp}`);
  };

  // Delete Entire ISP Entry (Direct Execution & Robust Fallback - No window.confirm)
  const handleDeleteIspEntry = (plan: ConstructionPlanItem) => {
    try {
      if (!plan) {
        showToast('error', 'Gagal Hapus', 'Data ISP tidak valid.');
        return;
      }

      const targetId = plan.id || plan.projectId || plan.namaIsp;
      const targetName = plan.namaIsp || plan.projectId || 'Proyek';

      if (onDeletePlan) {
        onDeletePlan(targetId);
      } else {
        const isMatch = (item: any) =>
          Boolean(
            (targetId && item.id === targetId) ||
            (item.projectId && item.projectId === targetId) ||
            (item.namaIsp && item.namaIsp.toLowerCase() === targetId.toLowerCase()) ||
            (item.isp && item.isp.toLowerCase() === targetId.toLowerCase())
          );

        // Delete documents from IndexedDB
        const docs = [
          plan.apdIsp,
          plan.baSurvey,
          plan.docKmz,
          plan.docApdRelokasi,
          plan.docApdIsp,
          plan.docTimeline,
          plan.docSuratPerintahRelokasi,
          plan.docBaSurveyInternal,
          plan.docBaSurveyBersama,
          plan.docSuratPenunjukanVendor,
          plan.docSuratRekomtek
        ].filter(Boolean);

        docs.forEach((d) => d?.id && deleteDocumentFromIDB(d.id));

        showToast('error', 'Proyek Dihapus', `Proyek ${targetName} berhasil dihapus dari sistem.`);
      }
    } catch (err) {
      console.error('Error in handleDeleteIspEntry:', err);
      showToast('error', 'Gagal Hapus', 'Terjadi kesalahan saat menghapus data ISP.');
    }
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

  // ==================== BA SURVEY INTERNAL CRUD SPECIFIC HANDLERS ====================
  // Handle Create New BA Survey Record directly inside Modal 2
  const handleCreateNewBaSurveyRecord = () => {
    const finalIsp = newBaIspName === 'Lainnya' ? newBaCustomIsp.trim() : newBaIspName;
    if (!finalIsp) {
      showToast('error', 'Gagal Menambah BA', 'Nama ISP wajib diisi.');
      return;
    }

    const projectIdToUse = newBaProjectId.trim() || `PRJ-JWS-2026-${Math.floor(100 + Math.random() * 900)}`;

    // Check if plan already exists for this ISP
    let existingPlan = plans.find((p) => p.namaIsp.toLowerCase() === finalIsp.toLowerCase() || p.projectId === projectIdToUse);

    const processSave = (fileDataUrl?: string, fileName?: string, fileSize?: string) => {
      let docObj: AttachedDocument | null = null;
      if (fileDataUrl && fileName) {
        const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        saveDocumentToIDB(docId, fileDataUrl);
        docObj = {
          id: docId,
          fileName: fileName,
          fileSize: fileSize || '1.20 MB',
          uploadedAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          fileDataUrl: fileDataUrl,
          documentType: 'BA Survey Internal ( ISP )',
          signer: newBaSigner || 'Tim Field Survey JWS & ISP',
          status: newBaStatus,
          notes: newBaNotes || 'Diinput via Form BA Survey Internal ( ISP )'
        };
      }

      if (existingPlan) {
        const updated: ConstructionPlanItem = {
          ...existingPlan,
          tanggalBaSurvey: newBaDateInput,
          docBaSurveyBersama: docObj || existingPlan.docBaSurveyBersama || undefined,
          baSurvey: docObj || existingPlan.baSurvey || undefined,
          updatedAt: new Date().toISOString()
        };
        onSavePlan(updated);
        showToast('success', 'BA Survey Diperbarui', `Data BA Survey Internal untuk ${finalIsp} berhasil diperbarui.`);
      } else {
        const newPlanItem: ConstructionPlanItem = {
          id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          projectId: projectIdToUse,
          projectName: `Proyek Survey Internal Utilities ${finalIsp}`,
          namaIsp: finalIsp,
          panjangRelokasiGalian: 300,
          borringAkses: 50,
          crossingJalan: 30,
          crossingJembatan: 0,
          crossingTol: 0,
          crossingKaliSungai: 0,
          foCables: [{ id: 'fo-1', tipe: 'kabel FO 24', panjang: 300 }],
          panjangKabelCoax: 0,
          manholes: [{ id: 'mh-1', tipe: 'HH 80x80', unit: 2 }],
          poles: [{ id: 'p-1', tipe: 'pole 9', meter: 9, unit: 2 }],
          galvanis: [],
          labour: 'not yet',
          contraction: 'not started',
          pengambilanMaterial: 'not yet',
          locationMaterial: 'warehouse ISP',
          material: 'not yet',
          tanggalBaSurvey: newBaDateInput,
          docBaSurveyBersama: docObj || undefined,
          baSurvey: docObj || undefined,
          remarks: newBaNotes ? `[BA Survey Internal] ${newBaNotes}` : `Record BA Survey Internal ${finalIsp}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        onSavePlan(newPlanItem);
        showToast('success', 'BA Survey ISP Baru Ditambahkan', `Berhasil membuat record BA Survey Internal untuk ${finalIsp}.`);
      }

      // Reset Form
      setIsAddingNewBa(false);
      setNewBaCustomIsp('');
      setNewBaProjectId('');
      setNewBaNotes('');
      setNewBaFile(null);
    };

    if (newBaFile) {
      if (newBaFile.size > 4 * 1024 * 1024) {
        showToast('error', 'Ukuran Berkas Terlalu Besar', 'Maksimal ukuran berkas BA adalah 4 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        processSave(
          reader.result as string,
          newBaFile.name,
          (newBaFile.size / (1024 * 1024)).toFixed(2) + ' MB'
        );
      };
      reader.readAsDataURL(newBaFile);
    } else {
      processSave();
    }
  };

  // Start Editing BA Survey Detail
  const startEditingBa = (plan: ConstructionPlanItem) => {
    setEditingBaId(plan.id);
    setEditBaDate(plan.tanggalBaSurvey || new Date().toISOString().split('T')[0]);
    const doc = plan.docBaSurveyBersama || plan.baSurvey;
    setEditBaSigner(doc?.signer || 'Tim Field Survey JWS & ISP');
    setEditBaStatus(doc?.status || 'Verified');
    setEditBaNotes(doc?.notes || '');
  };

  // Save Edit BA Survey Detail
  const handleSaveEditBa = (plan: ConstructionPlanItem) => {
    const existingDoc = plan.docBaSurveyBersama || plan.baSurvey;

    let updatedDoc: AttachedDocument | undefined = existingDoc || undefined;
    if (existingDoc) {
      updatedDoc = {
        ...existingDoc,
        signer: editBaSigner,
        status: editBaStatus,
        notes: editBaNotes
      };
    } else {
      updatedDoc = {
        id: `doc-${Date.now()}`,
        fileName: `BA_Survey_Internal_${plan.namaIsp.replace(/\s+/g, '_')}.pdf`,
        fileSize: '1.00 MB',
        uploadedAt: new Date().toLocaleDateString('id-ID'),
        documentType: 'BA Survey Internal ( ISP )',
        signer: editBaSigner,
        status: editBaStatus,
        notes: editBaNotes
      };
    }

    const updatedPlan: ConstructionPlanItem = {
      ...plan,
      tanggalBaSurvey: editBaDate,
      docBaSurveyBersama: updatedDoc,
      baSurvey: updatedDoc,
      updatedAt: new Date().toISOString()
    };

    onSavePlan(updatedPlan);
    setEditingBaId(null);
    showToast('success', 'Data BA Survey Disimpan', `Perubahan BA Survey Internal untuk ${plan.namaIsp} berhasil disimpan.`);
  };

  // Filtered Plans inside BA Survey Modal
  const modalBaPlans = React.useMemo(() => {
    return plans.filter((plan) => {
      const hasBa = !!(plan.docBaSurveyBersama || plan.baSurvey || plan.tanggalBaSurvey);
      if (baStatusFilter === 'DONE' && !hasBa) return false;
      if (baStatusFilter === 'PENDING' && hasBa) return false;

      if (baSearchQuery.trim()) {
        const q = baSearchQuery.toLowerCase();
        return (
          plan.namaIsp.toLowerCase().includes(q) ||
          plan.projectId.toLowerCase().includes(q) ||
          (plan.tanggalBaSurvey || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [plans, baStatusFilter, baSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-2xl p-6 bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-cyan-950/80 border border-emerald-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                <FileText className="size-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Survey, Dokumen & Catatan
                </h1>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenEmailGlobal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
              title="Kirim Berkas Dokumen & Catatan Survey via Email"
            >
              <Mail className="size-4 animate-bounce" />
              <span>Kirim via Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards - Clickable for Interactive Accurate Details & Full CRUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Berkas Ter-upload */}
        <div
          onClick={() => setActiveKpiModal('UPLOADED_FILES')}
          className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 hover:border-emerald-400 backdrop-blur-md relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] group shadow-lg"
          title="Klik untuk melihat & mengelola detail berkas ter-upload"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-mono font-semibold group-hover:text-emerald-300">
              Berkas Ter-upload
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/20">
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
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <span>Kelola & Unduh Berkas →</span>
            <Eye className="size-3" />
          </div>
        </div>

        {/* Stat 2: BA Survey Internal ( ISP ) - CRUD INTERACTIVE */}
        <div
          onClick={() => setActiveKpiModal('BA_SURVEY')}
          className="p-4 rounded-xl bg-black/40 border border-cyan-500/30 hover:border-cyan-400 backdrop-blur-md relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] group shadow-lg"
          title="Klik untuk fitur lengkap CRUD edit, input, hapus, simpan BA Survey Internal ISP"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-mono font-semibold group-hover:text-cyan-300">
              BA Survey Internal ( ISP )
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-500/20">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{stats.totalBaSurveyDone}</span>
            <span className="text-[10px] text-cyan-300 font-mono">Telah Dilaksanakan</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 font-mono">
            {Math.round((stats.totalBaSurveyDone / Math.max(stats.totalPlansCount, 1)) * 100)}% dari total {stats.totalPlansCount} ISP (Kelola CRUD)
          </p>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-cyan-400">
            <span>CRUD Edit, Input, Hapus BA →</span>
            <Eye className="size-3" />
          </div>
        </div>

        {/* Stat 3: Kelengkapan Dokumen */}
        <div
          onClick={() => setActiveKpiModal('COMPLETENESS')}
          className="p-4 rounded-xl bg-black/40 border border-purple-500/30 hover:border-purple-400 backdrop-blur-md relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] group shadow-lg"
          title="Klik untuk melihat matriks & mengunggah dokumen yang belum ada"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-mono font-semibold group-hover:text-purple-300">
              Kelengkapan Dokumen
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 group-hover:bg-purple-500/20">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-300 font-mono">{stats.completenessPercent}%</span>
            <span className="text-[10px] text-slate-400 font-mono">Skor Kelengkapan</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 font-mono">
            Rata-rata ketersediaan 7 dokumen legal
          </p>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-purple-400">
            <span>Matriks & Quick Upload →</span>
            <Eye className="size-3" />
          </div>
        </div>

        {/* Stat 4: Catatan / Remarks */}
        <div
          onClick={() => setActiveKpiModal('REMARKS')}
          className="p-4 rounded-xl bg-black/40 border border-amber-500/30 hover:border-amber-400 backdrop-blur-md relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] group shadow-lg"
          title="Klik untuk melihat & mengedit log catatan & remarks proyek"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-mono font-semibold group-hover:text-amber-300">
              Catatan / Remarks
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500/20">
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
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-amber-400">
            <span>Edit Log Catatan →</span>
            <Eye className="size-3" />
          </div>
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

            // 9 Document configs array
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
                doc: plan.docApdRelokasi,
                category: 'APD Relokasi' as DocumentCategory
              },
              {
                key: 'docApdIsp',
                title: '3. APD ISP',
                desc: 'Gambar kerja & perencanaan teknis operator ISP (.pdf, .dwg)',
                doc: plan.docApdIsp || plan.apdIsp,
                category: 'APD ISP' as DocumentCategory
              },
              {
                key: 'docTimeline',
                title: '4. Timeline Pelaksana',
                desc: 'Kurva S & jadwal kontraktor (.xlsx, .pdf, dll)',
                doc: plan.docTimeline,
                category: 'Timeline Pelaksana' as DocumentCategory
              },
              {
                key: 'docSuratPerintahRelokasi',
                title: '5. Surat Perintah Relokasi',
                desc: 'Instruksi resmi Dinas Bina Marga (.pdf, .doc)',
                doc: plan.docSuratPerintahRelokasi,
                category: 'Surat Perintah Relokasi (Dinas)' as DocumentCategory
              },
              {
                key: 'docBaSurveyInternal',
                title: '6. BA Survey Internal ( ISP )',
                desc: 'BA survey internal tim ISP & JWS (.pdf)',
                doc: plan.docBaSurveyInternal,
                category: 'BA Survey Internal ( ISP )' as DocumentCategory
              },
              {
                key: 'docBaSurveyBersama',
                title: '7. BA Survey Bersama',
                desc: 'BA survey lapangan bersama gabungan seluruh operator (.pdf)',
                doc: plan.docBaSurveyBersama || plan.baSurvey,
                category: 'BA Survey Bersama' as DocumentCategory
              },
              {
                key: 'docSuratPenunjukanVendor',
                title: '8. Surat Penunjukan Vendor',
                desc: 'SPK / penetapan vendor (.pdf)',
                doc: plan.docSuratPenunjukanVendor,
                category: 'Surat Penunjukan Vendor' as DocumentCategory
              },
              {
                key: 'docSuratRekomtek',
                title: '9. Surat Rekomtek',
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
                          <Calendar className="size-3 text-cyan-400" />
                          <span>BA Survey Internal: {plan.tanggalBaSurvey || 'Belum Dijadwalkan'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Header Actions & Badges */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenEmailForIsp(plan.namaIsp)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/10"
                      title={`Kirim dokumen & catatan khusus untuk ISP ${plan.namaIsp} via Email`}
                    >
                      <Mail className="size-3.5 text-cyan-400" />
                      <span>Kirim Email ISP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteIspEntry(plan)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 rounded-xl transition-colors"
                      title={`Hapus Entry Data Survey ISP ${plan.namaIsp}`}
                    >
                      <Trash2 className="size-4" />
                    </button>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-mono">Kelengkapan Dokumen</div>
                      <div className="text-xs font-bold font-mono text-emerald-400 flex items-center justify-end gap-1">
                        <CheckCircle2 className="size-3.5" />
                        <span>{uploadedCount} / 9 Berkas</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 9 Documents Grid */}
                <div className="p-4 sm:p-5">
                  <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Tag className="size-3.5 text-cyan-400" />
                    <span>Daftar 9 Dokumen Survey & Legalitas</span>
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
                      <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-start justify-between gap-2">
                        {plan.remarks && plan.remarks.trim().length > 0 ? (
                          <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed flex-1">
                            {plan.remarks}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 italic font-mono flex-1">
                            Belum ada catatan khusus untuk proyek {plan.namaIsp}. Klik "Edit Catatan" untuk menambahkan.
                          </p>
                        )}
                        {plan.remarks && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...plan, remarks: '' };
                              onSavePlan(updated);
                              showToast('info', 'Catatan Dihapus', `Catatan untuk ${plan.namaIsp} telah dihapus.`);
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Hapus Catatan Ini"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
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

      {/* MODAL 1: Detail Berkas Ter-upload & Full CRUD Manager */}
      {activeKpiModal === 'UPLOADED_FILES' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border-b border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="size-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">
                    Detail & Kelola Berkas Ter-upload ({stats.totalUploadedDocs} / {stats.totalPlansCount * 9} Berkas)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Manajemen CRUD lengkap berkas terunggah (Input, Edit, Hapus, Direct Download & Pratinjau)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveKpiModal(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Quick Upload Form Inside Modal */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-mono font-bold text-xs">
                    <UploadCloud className="size-4" />
                    <span>Unggah Berkas Baru Langsung ke Proyek ISP</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Batas Maksimal 4 MB</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* 1. Nama ISP Target */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-300 mb-1">Pilih / Ketik Nama ISP Target:</label>
                    <select
                      value={quickUploadPlanId || (plans.length > 0 ? plans[0].id : 'NEW_ISP')}
                      onChange={(e) => handleQuickUploadPlanSelect(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.namaIsp} ({p.projectId})
                        </option>
                      ))}
                      <option value="NEW_ISP">+ Ketik Nama ISP Baru...</option>
                    </select>

                    {(plans.length === 0 || quickUploadPlanId === 'NEW_ISP') && (
                      <input
                        type="text"
                        value={customNewIspName}
                        onChange={(e) => setCustomNewIspName(e.target.value)}
                        placeholder="Ketik Nama ISP Baru..."
                        className="w-full bg-black/80 border border-cyan-500/50 rounded-lg p-2 mt-2 text-xs text-cyan-200 font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    )}
                  </div>

                  {/* 2. Project ID */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-300 mb-1">Project ID:</label>
                    <input
                      type="text"
                      value={quickUploadProjectId}
                      onChange={(e) => setQuickUploadProjectId(e.target.value)}
                      placeholder="Contoh: PRJ-JWS-2026-001"
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* 3. Project Category */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-300 mb-1">Kategori Proyek:</label>
                    <select
                      value={quickUploadCategory}
                      onChange={(e) => setQuickUploadCategory(e.target.value as ProjectCategory)}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    >
                      <option value="GOV APJATEL">GOV APJATEL</option>
                      <option value="GOV IPPJU">GOV IPPJU</option>
                      <option value="GOV SJUT">GOV SJUT</option>
                      <option value="Project Internal">Project Internal</option>
                    </select>
                  </div>

                  {/* 4. Project Description */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-300 mb-1">Uraian Proyek:</label>
                    <input
                      type="text"
                      value={quickUploadDescription}
                      onChange={(e) => setQuickUploadDescription(e.target.value)}
                      placeholder="Contoh: Relokasi Kabel FO Bawah Tanah..."
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* 5. Area Location */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-300 mb-1">Area Lokasi Trase:</label>
                    <input
                      type="text"
                      value={quickUploadAreaLocation}
                      onChange={(e) => setQuickUploadAreaLocation(e.target.value)}
                      placeholder="Contoh: Jl. Sudirman - Bundaran HI..."
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* 6. Jenis Dokumen (1-9) */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-300 mb-1">Jenis Dokumen (1-9):</label>
                    <select
                      value={quickUploadDocKey}
                      onChange={(e) => setQuickUploadDocKey(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                    >
                      <option value="docKmz">1. KMZ Trase Relokasi</option>
                      <option value="docApdRelokasi">2. APD Relokasi</option>
                      <option value="docApdIsp">3. APD ISP</option>
                      <option value="docTimeline">4. Timeline Pelaksana</option>
                      <option value="docSuratPerintahRelokasi">5. Surat Perintah Relokasi</option>
                      <option value="docBaSurveyInternal">6. BA Survey Internal ( ISP )</option>
                      <option value="docBaSurveyBersama">7. BA Survey Bersama</option>
                      <option value="docSuratPenunjukanVendor">8. Surat Penunjukan Vendor</option>
                      <option value="docSuratRekomtek">9. Surat Rekomtek</option>
                    </select>
                  </div>
                </div>

                {/* File Upload Button Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-emerald-500/30">
                  {(() => {
                    const isNewMode = plans.length === 0 || quickUploadPlanId === 'NEW_ISP';
                    const targetIspName = isNewMode ? customNewIspName.trim() : (plans.find(p => p.id === quickUploadPlanId)?.namaIsp || customNewIspName.trim());
                    const isIspValid = targetIspName.length > 0 && quickUploadProjectId.trim().length > 0;

                    return (
                      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-[11px] font-mono text-slate-300">
                          {!isIspValid ? (
                            <span className="text-amber-400">
                              * Pilih atau masukkan nama ISP & Project ID terlebih dahulu sebelum memilih berkas.
                            </span>
                          ) : (
                            <span className="text-emerald-300">
                              Data proyek {quickUploadProjectId} ({targetIspName}) siap diunggah.
                            </span>
                          )}
                        </div>

                        <label
                          className={`py-2 px-5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md transition-all shrink-0 ${
                            isIspValid
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-emerald-500/20'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <FileUp className="size-4" />
                          <span>Pilih File (Maks 4MB)</span>
                          <input
                            type="file"
                            disabled={!isIspValid}
                            className="hidden"
                            onChange={(e) => {
                              try {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                if (!targetIspName) {
                                  showToast('error', 'Gagal Unggah', 'Masukkan nama ISP terlebih dahulu.');
                                  return;
                                }

                                const targetProjId = quickUploadProjectId.trim() || `PRJ-JWS-2026-${String(plans.length + 1).padStart(3, '0')}`;
                                const targetCategory = quickUploadCategory || 'GOV APJATEL';
                                const targetDesc = quickUploadDescription.trim() || `Proyek Relokasi Utilitas ${targetIspName}`;
                                const targetArea = quickUploadAreaLocation.trim() || 'DKI Jakarta';

                                // 1. Save / Update Project
                                const existingProject = projects.find((p) => p.projectId === targetProjId || p.id === targetProjId);
                                if (existingProject) {
                                  const updatedProject: ProjectItem = {
                                    ...existingProject,
                                    projectCategory: targetCategory,
                                    projectDescription: targetDesc,
                                    areaLocation: targetArea,
                                    picIsp: targetIspName,
                                    updatedAt: new Date().toISOString()
                                  };
                                  if (onSaveProject) onSaveProject(updatedProject);
                                } else {
                                  const newProject: ProjectItem = {
                                    id: `prj-${Date.now()}`,
                                    projectId: targetProjId,
                                    projectCategory: targetCategory,
                                    projectDescription: targetDesc,
                                    areaLocation: targetArea,
                                    panjangRelokasiGalian: 0,
                                    picIsp: targetIspName,
                                    picJws: 'JWS Gov Control',
                                    projectStatus: 'in progress',
                                    quarter: 'Q1 - 26',
                                    tanggalSuratDinas: new Date().toISOString().slice(0, 10),
                                    tanggalBaSurveyDinasAllIsp: new Date().toISOString().slice(0, 10),
                                    noPoRelease: '',
                                    statusPoRelease: 'Released',
                                    tanggalPoRelease: '',
                                    nilaiPo: 0,
                                    remarks: 'Dibuat otomatis via Menu Survey, Dokumen & Catatan',
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString()
                                  };
                                  if (onSaveProject) onSaveProject(newProject);
                                }

                                // 2. Save / Update Construction Plan
                                let targetPlan = plans.find((p) => p.id === quickUploadPlanId || p.projectId === targetProjId);
                                if (targetPlan) {
                                  targetPlan = {
                                    ...targetPlan,
                                    projectId: targetProjId,
                                    projectName: targetDesc,
                                    namaIsp: targetIspName,
                                    updatedAt: new Date().toISOString()
                                  };
                                } else {
                                  targetPlan = {
                                    id: `plan-${Date.now()}`,
                                    projectId: targetProjId,
                                    projectName: targetDesc,
                                    namaIsp: targetIspName,
                                    panjangRelokasiGalian: 0,
                                    borringAkses: 0,
                                    crossingJalan: 0,
                                    crossingJembatan: 0,
                                    crossingTol: 0,
                                    crossingKaliSungai: 0,
                                    panjangKabelCoax: 0,
                                    foCables: [],
                                    manholes: [],
                                    poles: [],
                                    galvanis: [],
                                    clousesingSap: 'not yet',
                                    labour: 'not yet',
                                    contraction: 'not started',
                                    pengambilanMaterial: 'not yet',
                                    locationMaterial: 'warehouse ISP',
                                    material: 'not yet',
                                    statusPullingFo: 'not yet',
                                    statusPullingCoax: 'not yet',
                                    statusInstalMh: 'not yet',
                                    statusPoleBersama: 'not yet',
                                    statusGalvanis: 'not yet',
                                    tanggalBaSurvey: new Date().toISOString().slice(0, 10),
                                    remarks: '',
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString()
                                  };
                                  setCustomNewIspName('');
                                  setQuickUploadPlanId(targetPlan.id);
                                }

                                const categoryMap: { [key: string]: DocumentCategory } = {
                                  docKmz: 'KMZ',
                                  docApdRelokasi: 'APD Relokasi',
                                  docApdIsp: 'APD ISP',
                                  docTimeline: 'Timeline Pelaksana',
                                  docSuratPerintahRelokasi: 'Surat Perintah Relokasi (Dinas)',
                                  docBaSurveyInternal: 'BA Survey Internal ( ISP )',
                                  docBaSurveyBersama: 'BA Survey Bersama',
                                  docSuratPenunjukanVendor: 'Surat Penunjukan Vendor',
                                  docSuratRekomtek: 'Surat Rekomtek'
                                };

                                handleFileUpload(
                                  targetPlan,
                                  quickUploadDocKey,
                                  categoryMap[quickUploadDocKey] || 'KMZ',
                                  file
                                );
                              } catch (err) {
                                console.error('Error during file upload in modal:', err);
                                showToast('error', 'Gagal Unggah Berkas', 'Terjadi kesalahan sistem saat memproses berkas ke IndexedDB.');
                              }
                            }}
                          />
                        </label>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Uploaded Files List */}
              <div className="space-y-3">
                {stats.totalUploadedDocs === 0 ? (
                  <div className="p-8 rounded-xl bg-black/40 border border-slate-800 text-center space-y-3">
                    <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                      <FileText className="size-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white font-mono">Belum ada berkas terunggah (0 Berkas)</h4>
                    <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
                      Belum ada berkas terunggah (0 Berkas). Pilih ISP dan jenis dokumen di atas untuk mulai mengunggah berkas.
                    </p>
                  </div>
                ) : (
                  plans.map((plan) => {
                    const docs = [
                      { key: 'docKmz', name: '1. KMZ Trase Relokasi', doc: plan.docKmz, cat: 'KMZ' },
                      { key: 'docApdRelokasi', name: '2. APD Relokasi', doc: plan.docApdRelokasi, cat: 'APD Relokasi' },
                      { key: 'docApdIsp', name: '3. APD ISP', doc: plan.docApdIsp || plan.apdIsp, cat: 'APD ISP' },
                      { key: 'docTimeline', name: '4. Timeline Pelaksana', doc: plan.docTimeline, cat: 'Timeline Pelaksana' },
                      { key: 'docSuratPerintahRelokasi', name: '5. Surat Perintah Relokasi', doc: plan.docSuratPerintahRelokasi, cat: 'Surat Perintah Relokasi (Dinas)' },
                      { key: 'docBaSurveyInternal', name: '6. BA Survey Internal ( ISP )', doc: plan.docBaSurveyInternal, cat: 'BA Survey Internal ( ISP )' },
                      { key: 'docBaSurveyBersama', name: '7. BA Survey Bersama', doc: plan.docBaSurveyBersama || plan.baSurvey, cat: 'BA Survey Bersama' },
                      { key: 'docSuratPenunjukanVendor', name: '8. Surat Penunjukan Vendor', doc: plan.docSuratPenunjukanVendor, cat: 'Surat Penunjukan Vendor' },
                      { key: 'docSuratRekomtek', name: '9. Surat Rekomtek', doc: plan.docSuratRekomtek, cat: 'Surat Rekomtek' }
                    ].filter((item) => item.doc);

                    if (docs.length === 0) return null;

                    const parentProject = projectMap.get(plan.projectId);
                    const category = parentProject?.projectCategory || 'GOV APJATEL';
                    const description = parentProject?.projectDescription || plan.projectName || 'Belum ada uraian proyek';
                    const location = parentProject?.areaLocation || 'DKI Jakarta';

                    return (
                      <div key={plan.id} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-2 gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white font-mono">{plan.namaIsp}</span>
                              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                                {plan.projectId}
                              </span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-purple-500/20 text-purple-300 border-purple-500/40">
                                {category}
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] font-mono text-slate-300 flex items-center gap-3 flex-wrap">
                              <span className="flex items-center gap-1 text-slate-400">
                                <MapPin className="size-3 text-slate-500 shrink-0" />
                                <span>{location}</span>
                              </span>
                              <span className="text-slate-400 truncate max-w-md" title={description}>
                                • {description}
                              </span>
                            </div>
                          </div>

                          <span className="text-xs font-mono text-emerald-400 font-bold shrink-0">
                            {docs.length} / 9 Dokumen Terupload
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {docs.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-slate-800/80 border border-emerald-500/30 flex items-center justify-between gap-2"
                            >
                              <div className="truncate">
                                <span className="text-[10px] font-mono font-bold text-emerald-400 block">
                                  {item.name}
                                </span>
                                <span className="text-xs text-white font-semibold block truncate">
                                  {item.doc?.fileName}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {item.doc?.fileSize} • {item.doc?.uploadedAt}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => onViewPdf(item.doc!)}
                                  className="p-1.5 text-cyan-300 hover:bg-cyan-500/20 rounded-lg transition-colors"
                                  title="Pratinjau Berkas"
                                >
                                  <Eye className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => triggerDownloadDocument(item.doc!)}
                                  className="p-1.5 text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                  title="Unduh Berkas Direct"
                                >
                                  <Download className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => handleClearDoc(plan, item.key, item.name)}
                                  className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                                  title="Hapus Berkas Ini"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Detail BA Survey Internal ( ISP ) & COMPLETE CRUD MANAGER */}
      {activeKpiModal === 'BA_SURVEY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-b border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <Building2 className="size-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">
                    Kelola BA Survey Internal ( ISP ) — Fitur CRUD Lengkap
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Input BA Baru • Edit Tanggal & Status • Unggah File Maks 4MB • Simpan • Hapus Data
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveKpiModal(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Top Toolbar inside Modal 2 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-black/50 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="size-4 text-slate-400" />
                  <input
                    type="text"
                    value={baSearchQuery}
                    onChange={(e) => setBaSearchQuery(e.target.value)}
                    placeholder="Cari ISP, Project ID, atau Tanggal BA..."
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10">
                    <button
                      onClick={() => setBaStatusFilter('ALL')}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded ${
                        baStatusFilter === 'ALL' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Semua ({plans.length})
                    </button>
                    <button
                      onClick={() => setBaStatusFilter('DONE')}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded ${
                        baStatusFilter === 'DONE' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Selesai ({stats.totalBaSurveyDone})
                    </button>
                    <button
                      onClick={() => setBaStatusFilter('PENDING')}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded ${
                        baStatusFilter === 'PENDING' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Belum ({plans.length - stats.totalBaSurveyDone})
                    </button>
                  </div>

                  <button
                    onClick={() => setIsAddingNewBa(!isAddingNewBa)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                  >
                    <Plus className="size-4" />
                    <span>{isAddingNewBa ? 'Tutup Form Input' : 'Input BA Baru'}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Form: INPUT / TAMBAH BA SURVEY INTERNAL BARU */}
              {isAddingNewBa && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/50 space-y-4 animate-fade-in shadow-xl">
                  <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                    <div className="flex items-center gap-2">
                      <FileUp className="size-4 text-cyan-400 animate-bounce" />
                      <span className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider">
                        Form Input Data BA Survey Internal ( ISP ) Baru
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Batas Berkas Maksimal 4 MB</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">Nama ISP / Operator:</label>
                      <select
                        value={newBaIspName}
                        onChange={(e) => setNewBaIspName(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono focus:border-cyan-500"
                      >
                        {plans.map((p) => (
                          <option key={p.id} value={p.namaIsp}>
                            {p.namaIsp} ({p.projectId})
                          </option>
                        ))}
                        <option value="Biznet Networks">Biznet Networks</option>
                        <option value="Indosat Ooredoo">Indosat Ooredoo</option>
                        <option value="Telkom Indonesia">Telkom Indonesia</option>
                        <option value="XL Axiata">XL Axiata</option>
                        <option value="First Media">First Media</option>
                        <option value="MyRepublic">MyRepublic</option>
                        <option value="Lainnya">Lainnya (ISP Baru)</option>
                      </select>
                    </div>

                    {newBaIspName === 'Lainnya' && (
                      <div>
                        <label className="block text-[10px] font-mono text-slate-300 mb-1">Nama ISP Khusus:</label>
                        <input
                          type="text"
                          value={newBaCustomIsp}
                          onChange={(e) => setNewBaCustomIsp(e.target.value)}
                          placeholder="Masukkan nama ISP..."
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">Project ID / No Ref:</label>
                      <input
                        type="text"
                        value={newBaProjectId}
                        onChange={(e) => setNewBaProjectId(e.target.value)}
                        placeholder="PRJ-JWS-2026-..."
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">Tanggal BA Survey Internal:</label>
                      <input
                        type="date"
                        value={newBaDateInput}
                        onChange={(e) => setNewBaDateInput(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">Tim Penandatangan / Signer:</label>
                      <input
                        type="text"
                        value={newBaSigner}
                        onChange={(e) => setNewBaSigner(e.target.value)}
                        placeholder="Tim Field Survey JWS & ISP"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">Status Verifikasi BA:</label>
                      <select
                        value={newBaStatus}
                        onChange={(e) => setNewBaStatus(e.target.value as any)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                      >
                        <option value="Verified">Verified (Selesai & Sah)</option>
                        <option value="Pending Review">Pending Review (Menunggu TTD)</option>
                        <option value="Uploaded">Uploaded (Perlu Cek)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-300 mb-1">Unggah File BA (Maks 4 MB):</label>
                      <input
                        type="file"
                        onChange={(e) => setNewBaFile(e.target.files?.[0] || null)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-1 text-xs text-slate-300 font-mono file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-cyan-500 file:text-black file:font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-300 mb-1">Catatan Khusus BA Survey Internal:</label>
                    <textarea
                      rows={2}
                      value={newBaNotes}
                      onChange={(e) => setNewBaNotes(e.target.value)}
                      placeholder="Catatan hasil survey internal, trase yang disepakati, koordinat..."
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white font-mono focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewBa(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:bg-white/5"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewBaSurveyRecord}
                      className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 flex items-center gap-1.5 shadow-md shadow-cyan-400/20"
                    >
                      <Save className="size-3.5" />
                      <span>Simpan BA Survey Baru</span>
                    </button>
                  </div>
                </div>
              )}

              {/* LIST & EDIT/DELETE CARDS PER ISP IN MODAL 2 */}
              <div className="space-y-3">
                {modalBaPlans.length === 0 ? (
                  <div className="p-8 text-center bg-black/30 rounded-xl border border-white/10">
                    <AlertCircle className="size-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs font-mono text-slate-400">Tidak ada data BA Survey Internal yang cocok dengan kata kunci/filter.</p>
                  </div>
                ) : (
                  modalBaPlans.map((plan) => {
                    const baDoc = plan.docBaSurveyBersama || plan.baSurvey;
                    const isEditingThis = editingBaId === plan.id;

                    return (
                      <div
                        key={plan.id}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          baDoc
                            ? 'bg-cyan-950/20 border-cyan-500/40'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Header card info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white font-mono">{plan.namaIsp}</span>
                            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                              {plan.projectId}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {baDoc ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <Check className="size-3" />
                                <span>{baDoc.status || 'Verified'}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Clock className="size-3" />
                                <span>Belum Ada Berkas</span>
                              </span>
                            )}

                            {!isEditingThis ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditingBa(plan)}
                                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold flex items-center gap-1"
                                  title="Edit Detail BA Survey Internal"
                                >
                                  <Edit3 className="size-3" />
                                  <span>Edit Detail</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteIspEntry(plan)}
                                  className="p-1.5 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg transition-colors"
                                  title={`Hapus Data Survey ISP ${plan.namaIsp}`}
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingBaId(null)}
                                className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 text-[11px] font-mono"
                              >
                                Batal
                              </button>
                            )}
                          </div>
                        </div>

                        {/* EDIT FORM MODE */}
                        {isEditingThis ? (
                          <div className="p-3 bg-black/60 rounded-xl border border-cyan-500/40 space-y-3 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-mono text-slate-400 mb-1">Tanggal BA Survey:</label>
                                <input
                                  type="date"
                                  value={editBaDate}
                                  onChange={(e) => setEditBaDate(e.target.value)}
                                  className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-xs text-white font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono text-slate-400 mb-1">Tim Signer / TTD:</label>
                                <input
                                  type="text"
                                  value={editBaSigner}
                                  onChange={(e) => setEditBaSigner(e.target.value)}
                                  placeholder="Tim Field Survey JWS & ISP"
                                  className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-xs text-white font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono text-slate-400 mb-1">Status Verifikasi:</label>
                                <select
                                  value={editBaStatus}
                                  onChange={(e) => setEditBaStatus(e.target.value as any)}
                                  className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-xs text-white font-mono"
                                >
                                  <option value="Verified">Verified</option>
                                  <option value="Pending Review">Pending Review</option>
                                  <option value="Uploaded">Uploaded</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono text-slate-400 mb-1">Catatan / Keterangan BA:</label>
                              <textarea
                                rows={2}
                                value={editBaNotes}
                                onChange={(e) => setEditBaNotes(e.target.value)}
                                placeholder="Ketikkan catatan khusus..."
                                className="w-full bg-slate-900 border border-white/10 rounded p-1.5 text-xs text-white font-mono resize-none"
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveEditBa(plan)}
                                className="px-3 py-1.5 rounded bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-mono font-bold flex items-center gap-1 shadow-md shadow-cyan-400/20"
                              >
                                <Save className="size-3.5" />
                                <span>Simpan Perubahan</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* DISPLAY MODE */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-300">
                                <Calendar className="size-3.5 text-cyan-400" />
                                <span className="text-slate-400">Pelaksanaan:</span>
                                <span className="text-white font-bold">{plan.tanggalBaSurvey || 'Belum Ditentukan'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-300">
                                <UserCheck className="size-3.5 text-emerald-400" />
                                <span className="text-slate-400">Tim PIC / Signer:</span>
                                <span className="text-white">{baDoc?.signer || 'Tim Field Survey JWS'}</span>
                              </div>
                              {baDoc?.notes && (
                                <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-2">
                                  "{baDoc.notes}"
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col justify-between space-y-2">
                              {baDoc ? (
                                <div className="p-2.5 rounded-lg bg-black/60 border border-cyan-500/30 flex items-center justify-between gap-2">
                                  <div className="truncate">
                                    <span className="text-xs font-semibold text-cyan-200 block truncate">
                                      {baDoc.fileName}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      {baDoc.fileSize} • Upload: {baDoc.uploadedAt}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => onViewPdf(baDoc)}
                                      className="p-1.5 text-cyan-300 hover:bg-cyan-500/20 rounded-lg"
                                      title="Pratinjau BA"
                                    >
                                      <Eye className="size-3.5" />
                                    </button>
                                    <button
                                      onClick={() => triggerDownloadDocument(baDoc)}
                                      className="p-1.5 text-emerald-300 hover:bg-emerald-500/20 rounded-lg"
                                      title="Unduh BA Direct"
                                    >
                                      <Download className="size-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleClearDoc(plan, 'docBaSurveyBersama', 'BA Survey Internal ( ISP )')}
                                      className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg"
                                      title="Hapus Berkas BA"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center justify-between">
                                  <span>Berkas BA Belum Ter-upload</span>
                                  <label className="cursor-pointer px-2.5 py-1 rounded bg-cyan-500 text-black text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-cyan-400">
                                    <FileUp className="size-3" />
                                    <span>Unggah (Maks 4MB)</span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                          handleFileUpload(plan, 'docBaSurveyBersama', 'BA Survey Internal ( ISP )', e.target.files[0]);
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Detail Analisis Kelengkapan Dokumen & Interactive Matrix CRUD */}
      {activeKpiModal === 'COMPLETENESS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <Sparkles className="size-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">
                    Matriks Analisis Kelengkapan 7 Dokumen Legal ({stats.completenessPercent}%)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Klik ikon (✕) untuk mengunggah dokumen yang belum ada, atau (✓) untuk lihat/unduh berkas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveKpiModal(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/60 text-slate-300">
                      <th className="p-3">Nama ISP & ID</th>
                      <th className="p-3 text-center">1. KMZ</th>
                      <th className="p-3 text-center">2. APD</th>
                      <th className="p-3 text-center">3. Timeline</th>
                      <th className="p-3 text-center">4. Surat Perintah</th>
                      <th className="p-3 text-center">5. BA Internal (ISP)</th>
                      <th className="p-3 text-center">6. Vendor</th>
                      <th className="p-3 text-center">7. Rekomtek</th>
                      <th className="p-3 text-right">Skor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {plans.map((plan) => {
                      const docsConfig = [
                        { key: 'docKmz', doc: plan.docKmz, label: 'KMZ' },
                        { key: 'docApdRelokasi', doc: plan.docApdRelokasi || plan.apdIsp, label: 'APD Relokasi' },
                        { key: 'docTimeline', doc: plan.docTimeline, label: 'Timeline Pelaksana' },
                        { key: 'docSuratPerintahRelokasi', doc: plan.docSuratPerintahRelokasi, label: 'Surat Perintah Relokasi (Dinas)' },
                        { key: 'docBaSurveyBersama', doc: plan.docBaSurveyBersama || plan.baSurvey, label: 'BA Survey Internal ( ISP )' },
                        { key: 'docSuratPenunjukanVendor', doc: plan.docSuratPenunjukanVendor, label: 'Surat Penunjukan Vendor' },
                        { key: 'docSuratRekomtek', doc: plan.docSuratRekomtek, label: 'Surat Rekomtek' }
                      ];
                      const count = docsConfig.filter((d) => !!d.doc).length;
                      const percent = Math.round((count / 7) * 100);

                      return (
                        <tr key={plan.id} className="hover:bg-white/5">
                          <td className="p-3">
                            <span className="font-bold text-white block">{plan.namaIsp}</span>
                            <span className="text-[10px] text-cyan-400">{plan.projectId}</span>
                          </td>

                          {docsConfig.map((item, i) => (
                            <td key={i} className="p-3 text-center">
                              {item.doc ? (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => onViewPdf(item.doc!)}
                                    className="inline-flex items-center justify-center size-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/40"
                                    title={`Lihat ${item.doc.fileName}`}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => triggerDownloadDocument(item.doc!)}
                                    className="p-1 text-emerald-300 hover:text-white"
                                    title="Unduh Berkas Direct"
                                  >
                                    <Download className="size-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleClearDoc(plan, item.key, item.label)}
                                    className="p-1 text-rose-400 hover:text-rose-200"
                                    title={`Hapus Berkas ${item.label}`}
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                </div>
                              ) : (
                                <label className="inline-flex items-center justify-center size-6 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 cursor-pointer" title={`Unggah ${item.label}`}>
                                  ✕
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        handleFileUpload(plan, item.key, item.label as DocumentCategory, e.target.files[0]);
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </td>
                          ))}

                          <td className="p-3 text-right">
                            <span className={`font-bold ${percent === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {count}/7 ({percent}%)
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Detail Log Catatan & Remarks CRUD */}
      {activeKpiModal === 'REMARKS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <MessageSquare className="size-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">
                    Detail & Kelola Log Catatan / Remarks ({stats.totalNotesCount} Proyek)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Tambah, ubah, atau hapus catatan hasil survey proyek lapangan per ISP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveKpiModal(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div key={plan.id} className="p-4 rounded-xl bg-black/40 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">{plan.namaIsp}</span>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                          {plan.projectId}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Diperbarui: {new Date(plan.updatedAt || Date.now()).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-2">
                      <textarea
                        defaultValue={plan.remarks || ''}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val !== plan.remarks) {
                            const updated = { ...plan, remarks: val, updatedAt: new Date().toISOString() };
                            onSavePlan(updated);
                            showToast('success', 'Catatan Disimpan', `Catatan untuk ISP ${plan.namaIsp} telah diperbarui.`);
                          }
                        }}
                        placeholder="Ketikkan catatan hasil survey untuk ISP ini..."
                        rows={2}
                        className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500 resize-none"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono italic">
                          Otomatis tersimpan saat klik luar kotak input
                        </span>
                        {plan.remarks && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...plan, remarks: '' };
                              onSavePlan(updated);
                              showToast('warning', 'Catatan Dihapus', `Catatan untuk ${plan.namaIsp} dihapus.`);
                            }}
                            className="text-xs text-rose-400 hover:underline font-mono flex items-center gap-1"
                          >
                            <Trash2 className="size-3" />
                            <span>Hapus Catatan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Share Email Modal */}
      <ShareEmailModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        projects={projects}
        plans={plans}
        defaultGroupFilter={shareModalGroup}
        initialIsp={selectedIspForEmail}
        showToast={showToast}
      />
    </div>
  );
};

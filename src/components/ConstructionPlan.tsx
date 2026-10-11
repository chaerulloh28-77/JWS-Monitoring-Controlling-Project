import React, { useState, useMemo, useRef } from 'react';
import {
  HardHat,
  Building2,
  Construction,
  Cable,
  Box,
  FileCheck,
  Plus,
  Trash2,
  FileUp,
  Eye,
  X,
  Search,
  Filter,
  ArrowLeft,
  Check,
  AlertTriangle,
  Info,
  Clock,
  Layers,
  Sparkles,
  Rows3,
  ListPlus,
  Activity,
  Gauge,
  Percent,
  CheckCircle2,
  Edit,
  FolderGit2,
  Download,
  Send,
  Globe2,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { ShareEmailModal } from './ShareEmailModal';
import { ConstructionPlanItem,
  ProjectItem,
  FoCableType,
  ManholeType,
  PoleType,
  GalvanisType,
  AttachedDocument,
  DocumentCategory,
  ClousesingSapStatus,
  LabourStatus,
  ContractionStatus,
  PengambilanMaterialStatus,
  LocationMaterialStatus,
  MaterialStatus,
  PullingFoWorkflowStatus,
  PullingCoaxWorkflowStatus,
  InstalHandholeStatus,
  PoleBersamaStatus,
  GalvanisStatus
} from '../types';
import { ISP_LIST_OPTIONS } from '../data/initialData';
import { exportConstructionPlansCsv } from '../services/storage';
import {
  triggerDownloadDocument,
  getDocumentIcon
} from '../utils/documentUtils';

interface ConstructionPlanProps {
  plans: ConstructionPlanItem[];
  projects: ProjectItem[];
  onSavePlan: (plan: ConstructionPlanItem) => void;
  onDeletePlan: (id: string) => void;
  onViewPdf: (doc: AttachedDocument) => void;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
  onShowToast?: (type: 'success' | 'warning' | 'info' | 'error', title: string, message: string) => void;
  mainGroupFilter?: 'GOV' | 'INTERNAL' | 'ALL';
  onMainGroupFilterChange?: (group: 'GOV' | 'INTERNAL' | 'ALL') => void;
}

interface IspInputItem {
  id: string;
  name: string;
}

export const ConstructionPlan: React.FC<ConstructionPlanProps> = ({
  plans,
  projects,
  onSavePlan,
  onDeletePlan,
  onViewPdf,
  isAddModalOpen: externalAddTrigger,
  setIsAddModalOpen: externalSetAddTrigger,
  onShowToast,
  mainGroupFilter: externalGroupFilter,
  onMainGroupFilterChange
}) => {
  // Mode: 'list' (Daftar Construction dengan filter CRUD) atau 'form' (Form Input / Edit Construction)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');

  // Search & Filter state for list view
  const [mainGroupFilter, setMainGroupFilter] = useState<'GOV' | 'INTERNAL' | 'ALL'>(externalGroupFilter || 'GOV');

  React.useEffect(() => {
    if (externalGroupFilter) {
      setMainGroupFilter(externalGroupFilter);
    }
  }, [externalGroupFilter]);

  const handleGroupChange = (group: 'GOV' | 'INTERNAL' | 'ALL') => {
    setMainGroupFilter(group);
    setSelectedIsp('ALL');
    setSelectedProjectId('ALL');
    if (onMainGroupFilterChange) {
      onMainGroupFilterChange(group);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedIsp, setSelectedIsp] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedSapFilter, setSelectedSapFilter] = useState<string>('ALL');
  const [selectedProgressFilter, setSelectedProgressFilter] = useState<string>('ALL');

  // Modal / Confirm Delete / Detail
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewingDetailPlan, setViewingDetailPlan] = useState<ConstructionPlanItem | null>(null);

  // Form State
  const [projectCode, setProjectCode] = useState<string>(projects[0]?.projectId || '');

  // Dynamic ISP items state: mendukung "tambah beberapa item" dengan kelas .field, h-[42px] min-h-[42px] rounded-xl
  const [ispListItems, setIspListItems] = useState<IspInputItem[]>([
    { id: '1', name: 'PT Telkom Indonesia (Persero) Tbk' }
  ]);

  // Volume Pekerjaan fields (meter)
  const [relocationLength, setRelocationLength] = useState<string>('4850');
  const [boringAccess, setBoringAccess] = useState<string>('820');
  const [roadCrossing, setRoadCrossing] = useState<string>('340');
  const [bridgeCrossing, setBridgeCrossing] = useState<string>('120');
  const [tollCrossing, setTollCrossing] = useState<string>('0');
  const [riverCrossing, setRiverCrossing] = useState<string>('95');

  // Material Kabel & Infrastruktur
  const [coaxLength, setCoaxLength] = useState<string>('450');

  // Multi-item dynamic tables
  const [fiberCables, setFiberCables] = useState<Array<{ id: string; type: FoCableType; qty: string }>>([
    { id: '1', type: 'kabel FO 96', qty: '3200' },
    { id: '2', type: 'kabel FO 144', qty: '1800' }
  ]);

  // Dedicated HH, HB, MH items (Sesuai Dashboard & Realtime Monitoring)
  const [hhItems, setHhItems] = useState<Array<{ id: string; dimension: string; qty: string }>>([
    { id: 'hh-1', dimension: '80x80', qty: '18' }
  ]);
  const [hbItems, setHbItems] = useState<Array<{ id: string; dimension: string; qty: string }>>([
    { id: 'hb-1', dimension: '80x80', qty: '6' }
  ]);
  const [mhItems, setMhItems] = useState<Array<{ id: string; dimension: string; qty: string }>>([
    { id: 'mh-1', dimension: '100x100', qty: '12' }
  ]);

  const [poles, setPoles] = useState<Array<{ id: string; type: PoleType; qty: string }>>([
    { id: '1', type: 'pole 9', qty: '12' }
  ]);

  const [galvanis, setGalvanis] = useState<Array<{ id: string; type: GalvanisType; qty: string }>>([
    { id: '1', type: '4"', qty: '450' }
  ]);

  // Status Baru di dalam Project ID
  const [clousesingSap, setClousesingSap] = useState<ClousesingSapStatus>('not yet');

  // Status Baru di dalam Volume Pekerjaan
  const [labour, setLabour] = useState<LabourStatus>('not yet');
  const [contraction, setContraction] = useState<ContractionStatus>('not started');

  // Status Baru di dalam Material Kabel & Infrastruktur
  const [pengambilanMaterial, setPengambilanMaterial] = useState<PengambilanMaterialStatus>('not yet');
  const [locationMaterial, setLocationMaterial] = useState<LocationMaterialStatus>('warehouse ISP');
  const [material, setMaterial] = useState<MaterialStatus>('not yet');
  const [statusPullingFo, setStatusPullingFo] = useState<PullingFoWorkflowStatus>('not yet');
  const [statusPullingCoax, setStatusPullingCoax] = useState<PullingCoaxWorkflowStatus>('not yet');
  const [statusInstalMh, setStatusInstalMh] = useState<InstalHandholeStatus>('not yet');
  const [statusPoleBersama, setStatusPoleBersama] = useState<PoleBersamaStatus>('not yet');
  const [statusGalvanis, setStatusGalvanis] = useState<GalvanisStatus>('not yet');

  // Progress Otomatis States (Galian Sipil, Pulling Cable FO, Pulling Cable COAX)
  const [galianSelesaiMeter, setGalianSelesaiMeter] = useState<string>('3800');
  const [galianTahapanStatus, setGalianTahapanStatus] = useState<string>('Dalam Proses Pekerjaan Galian');

  const [pullingFoMeterSelesai, setPullingFoMeterSelesai] = useState<string>('3500');
  const [pullingFoStatus, setPullingFoStatus] = useState<string>('Penarikan Sebagian');

  const [pullingCoaxMeterSelesai, setPullingCoaxMeterSelesai] = useState<string>('300');
  const [pullingCoaxStatus, setPullingCoaxStatus] = useState<string>('Penarikan Sebagian');

  // Survey & Dokumen
  const [surveyDate, setSurveyDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [apdFile, setApdFile] = useState<AttachedDocument | null>(null);
  const [baSurveyFile, setBaSurveyFile] = useState<AttachedDocument | null>(null);

  // 7 Berkas Survey, Dokumen & Catatan (Semua Jenis File)
  const [docKmz, setDocKmz] = useState<AttachedDocument | null>(null);
  const [docApdRelokasi, setDocApdRelokasi] = useState<AttachedDocument | null>(null);
  const [docTimeline, setDocTimeline] = useState<AttachedDocument | null>(null);
  const [docSuratPerintahRelokasi, setDocSuratPerintahRelokasi] = useState<AttachedDocument | null>(null);
  const [docBaSurveyBersama, setDocBaSurveyBersama] = useState<AttachedDocument | null>(null);
  const [docSuratPenunjukanVendor, setDocSuratPenunjukanVendor] = useState<AttachedDocument | null>(null);
  const [docSuratRekomtek, setDocSuratRekomtek] = useState<AttachedDocument | null>(null);



  const [remarks, setRemarks] = useState<string>('');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // File input refs for all 7 documents
  const apdInputRef = useRef<HTMLInputElement>(null);
  const baInputRef = useRef<HTMLInputElement>(null);
  const kmzInputRef = useRef<HTMLInputElement>(null);
  const apdRelokasiInputRef = useRef<HTMLInputElement>(null);
  const timelineInputRef = useRef<HTMLInputElement>(null);
  const suratPerintahInputRef = useRef<HTMLInputElement>(null);
  const baSurveyBersamaInputRef = useRef<HTMLInputElement>(null);
  const suratPenunjukanInputRef = useRef<HTMLInputElement>(null);
  const suratRekomtekInputRef = useRef<HTMLInputElement>(null);

  // Available options
  const FO_OPTIONS: FoCableType[] = [
    'kabel FO 12',
    'kabel FO 24',
    'kabel FO 48',
    'kabel FO 96',
    'kabel FO 144',
    'kabel FO 288'
  ];

  const MANHOLE_OPTIONS: ManholeType[] = [
    '60x60',
    '70x70',
    '80x80',
    '90x90',
    '100x100',
    '110x110',
    '120x120'
  ];

  const POLE_OPTIONS: PoleType[] = ['pole 7', 'pole 8', 'pole 9'];
  const GALVANIS_OPTIONS: GalvanisType[] = ['2"', '4"', '6"'];

  const CLOUSESING_SAP_OPTIONS: ClousesingSapStatus[] = [
    'not yet',
    'completed waspang mobilty',
    'submit document SAP',
    'approval completed SAP',
    'approval BALAP',
    'approval BAST',
    'Teco done'
  ];

  const LABOUR_OPTIONS: LabourStatus[] = ['not yet', 'release', 'cancel'];

  const CONTRACTION_OPTIONS: ContractionStatus[] = ['not started', 'in progress boring', 'done'];

  const PENGAMBILAN_MATERIAL_OPTIONS: PengambilanMaterialStatus[] = [
    'not yet',
    'warehouse ISP'
  ];

  const LOCATION_MATERIAL_OPTIONS: LocationMaterialStatus[] = [
    'warehouse ISP',
    'warehouse vendor'
  ];

  const MATERIAL_STATUS_OPTIONS: MaterialStatus[] = ['not yet', 'release', 'cancel'];

  const PULLING_FO_WORKFLOW_OPTIONS: PullingFoWorkflowStatus[] = [
    'not yet',
    'in progress pulling',
    'done'
  ];

  const PULLING_COAX_WORKFLOW_OPTIONS: PullingCoaxWorkflowStatus[] = [
    'not yet',
    'no coax',
    'in progress pulling',
    'done'
  ];

  const INSTAL_MH_OPTIONS: InstalHandholeStatus[] = ['not yet', 'In progress instal', 'done'];

  const POLE_BERSAMA_OPTIONS: PoleBersamaStatus[] = ['not yet', 'In progress instal', 'done'];

  const GALVANIS_STATUS_OPTIONS: GalvanisStatus[] = ['not yet', 'In progress instal', 'done'];

  // Handle external add trigger
  React.useEffect(() => {
    if (externalAddTrigger) {
      handleOpenNewForm();
      if (externalSetAddTrigger) externalSetAddTrigger(false);
    }
  }, [externalAddTrigger]);

  // Live Totals for Form
  const totalRelokasiTarget = useMemo(() => {
    return (
      (parseFloat(relocationLength) || 0) +
      (parseFloat(boringAccess) || 0) +
      (parseFloat(roadCrossing) || 0) +
      (parseFloat(bridgeCrossing) || 0) +
      (parseFloat(tollCrossing) || 0) +
      (parseFloat(riverCrossing) || 0)
    );
  }, [relocationLength, boringAccess, roadCrossing, bridgeCrossing, tollCrossing, riverCrossing]);

  const totalFoMeters = useMemo(() => {
    return fiberCables.reduce((acc, c) => acc + (parseFloat(c.qty) || 0), 0);
  }, [fiberCables]);

  const targetCoaxMeters = useMemo(() => {
    return parseFloat(coaxLength) || 0;
  }, [coaxLength]);

  const totalHhUnits = useMemo(() => {
    return hhItems.reduce((acc, h) => acc + (parseInt(h.qty) || 0), 0);
  }, [hhItems]);

  const totalHbUnits = useMemo(() => {
    return hbItems.reduce((acc, h) => acc + (parseInt(h.qty) || 0), 0);
  }, [hbItems]);

  const totalMhUnits = useMemo(() => {
    return mhItems.reduce((acc, h) => acc + (parseInt(h.qty) || 0), 0);
  }, [mhItems]);

  const totalAllManholeUnits = totalHhUnits + totalHbUnits + totalMhUnits;

  const totalPoleUnits = useMemo(() => {
    return poles.reduce((acc, p) => acc + (parseInt(p.qty) || 0), 0);
  }, [poles]);

  const totalGalvanisMeters = useMemo(() => {
    return galvanis.reduce((acc, g) => acc + (parseFloat(g.qty) || 0), 0);
  }, [galvanis]);

  // HH Categories & Dimensions sesuai dashboard
  const HH_CATEGORIES = ['HH', 'HB', 'MH'] as const;
  const HH_DIMENSIONS = ['60x60', '70x70', '80x80', '90x90', '100x100', '110x110', '120x120'] as const;

  const parseHhItem = (rawType?: string) => {
    let cat: 'HH' | 'HB' | 'MH' = 'HH';
    let dim = '80x80';
    if (!rawType) return { cat, dim };
    if (rawType.startsWith('HH')) {
      cat = 'HH';
      dim = rawType.replace('HH', '').trim() || '80x80';
    } else if (rawType.startsWith('HB')) {
      cat = 'HB';
      dim = rawType.replace('HB', '').replace('(Handbox)', '').trim() || '80x80';
    } else if (rawType.startsWith('MH')) {
      cat = 'MH';
      dim = rawType.replace('MH', '').trim() || '100x100';
    } else if (rawType.includes('x')) {
      const dimStr = rawType.trim();
      const num = parseInt(dimStr) || 80;
      cat = num >= 90 ? 'MH' : 'HH';
      dim = dimStr;
    }
    return { cat, dim };
  };

  // Label Ringkasan Install HH, HB, MH (Otomatis)
  const summaryHhText = useMemo(() => {
    const parts: string[] = [];
    const validHh = hhItems.filter(h => (parseInt(h.qty) || 0) > 0);
    const validHb = hbItems.filter(h => (parseInt(h.qty) || 0) > 0);
    const validMh = mhItems.filter(h => (parseInt(h.qty) || 0) > 0);

    if (validHh.length > 0) {
      parts.push(`HH: ${validHh.map(h => `${h.dimension} (${h.qty}U)`).join(', ')}`);
    }
    if (validHb.length > 0) {
      parts.push(`HB: ${validHb.map(h => `${h.dimension} (${h.qty}U)`).join(', ')}`);
    }
    if (validMh.length > 0) {
      parts.push(`MH: ${validMh.map(h => `${h.dimension} (${h.qty}U)`).join(', ')}`);
    }
    return parts.join(' | ');
  }, [hhItems, hbItems, mhItems]);

  // Label Ringkasan Install Pole & Galvanis (Otomatis)
  const summaryPoleGalvText = useMemo(() => {
    const validPoles = poles.filter(p => (parseInt(p.qty) || 0) > 0);
    const validGalv = galvanis.filter(g => (parseFloat(g.qty) || 0) > 0);
    const poleParts = validPoles.map(p => `${p.type.replace('pole ', 'Tiang ')} (${p.qty} Ea)`);
    const galvParts = validGalv.map(g => `Galv ${g.type} (${g.qty}m)`);
    if (poleParts.length === 0 && galvParts.length === 0) return '';
    if (poleParts.length > 0 && galvParts.length > 0) {
      return `${poleParts.join(', ')} | ${galvParts.join(', ')}`;
    }
    return poleParts.join(', ') || galvParts.join(', ');
  }, [poles, galvanis]);

  const isConfiguredHhPoleGalv = useMemo(() => {
    return Boolean(summaryHhText || summaryPoleGalvText);
  }, [summaryHhText, summaryPoleGalvText]);

  // Otomatis Calculations
  const calculatedGalianPercent = useMemo(() => {
    const selesai = parseFloat(galianSelesaiMeter) || 0;
    if (totalRelokasiTarget <= 0) return 0;
    const pct = (selesai / totalRelokasiTarget) * 100;
    return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
  }, [galianSelesaiMeter, totalRelokasiTarget]);

  const calculatedFoPercent = useMemo(() => {
    const selesai = parseFloat(pullingFoMeterSelesai) || 0;
    if (totalFoMeters <= 0) return 0;
    const pct = (selesai / totalFoMeters) * 100;
    return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
  }, [pullingFoMeterSelesai, totalFoMeters]);

  const calculatedCoaxPercent = useMemo(() => {
    const selesai = parseFloat(pullingCoaxMeterSelesai) || 0;
    if (targetCoaxMeters <= 0) return 0;
    const pct = (selesai / targetCoaxMeters) * 100;
    return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
  }, [pullingCoaxMeterSelesai, targetCoaxMeters]);

  // Handle Form Openings
  const handleOpenNewForm = () => {
    setEditingPlanId(null);
    setProjectCode(projects[0]?.projectId || '');
    setIspListItems([{ id: '1', name: '' }]);
    setRelocationLength('');
    setBoringAccess('');
    setRoadCrossing('');
    setBridgeCrossing('');
    setTollCrossing('');
    setRiverCrossing('');
    setCoaxLength('');
    setFiberCables([{ id: '1', type: 'kabel FO 96', qty: '' }]);
    setHhItems([{ id: 'hh-1', dimension: '80x80', qty: '' }]);
    setHbItems([{ id: 'hb-1', dimension: '80x80', qty: '' }]);
    setMhItems([{ id: 'mh-1', dimension: '100x100', qty: '' }]);
    setPoles([{ id: '1', type: 'pole 9', qty: '' }]);
    setGalvanis([{ id: '1', type: '4"', qty: '' }]);

    setGalianSelesaiMeter('0');
    setGalianTahapanStatus('Belum Dimulai');
    setPullingFoMeterSelesai('0');
    setPullingFoStatus('Belum Mulai');
    setPullingCoaxMeterSelesai('0');
    setPullingCoaxStatus('Belum Mulai');

    // Reset workflow status baru
    setClousesingSap('not yet');
    setLabour('not yet');
    setContraction('not started');
    setPengambilanMaterial('not yet');
    setLocationMaterial('warehouse ISP');
    setMaterial('not yet');
    setStatusPullingFo('not yet');
    setStatusPullingCoax('not yet');
    setStatusInstalMh('not yet');
    setStatusPoleBersama('not yet');
    setStatusGalvanis('not yet');

    setSurveyDate(new Date().toISOString().slice(0, 10));
    setApdFile(null);
    setBaSurveyFile(null);
    setDocKmz(null);
    setDocApdRelokasi(null);
    setDocTimeline(null);
    setDocSuratPerintahRelokasi(null);
    setDocBaSurveyBersama(null);
    setDocSuratPenunjukanVendor(null);
    setDocSuratRekomtek(null);
    setRemarks('');
    setFormError(null);
    setViewMode('form');
  };

  const handleOpenEditForm = (plan: ConstructionPlanItem) => {
    setEditingPlanId(plan.id);
    setProjectCode(plan.projectId);

    // Setup ISP list items
    if (plan.ispList && plan.ispList.length > 0) {
      setIspListItems(plan.ispList.map((name, idx) => ({ id: String(idx + 1), name })));
    } else if (plan.namaIsp) {
      // split if comma separated or single
      const splits = plan.namaIsp.split(',').map(s => s.trim()).filter(Boolean);
      setIspListItems(
        splits.length > 0
          ? splits.map((name, idx) => ({ id: String(idx + 1), name }))
          : [{ id: '1', name: plan.namaIsp }]
      );
    } else {
      setIspListItems([{ id: '1', name: '' }]);
    }

    setRelocationLength(String(plan.panjangRelokasiGalian || ''));
    setBoringAccess(String(plan.borringAkses || ''));
    setRoadCrossing(String(plan.crossingJalan || ''));
    setBridgeCrossing(String(plan.crossingJembatan || ''));
    setTollCrossing(String(plan.crossingTol || ''));
    setRiverCrossing(String(plan.crossingKaliSungai || ''));
    setCoaxLength(String(plan.panjangKabelCoax || ''));

    setFiberCables(
      plan.foCables && plan.foCables.length > 0
        ? plan.foCables.map((c, idx) => ({ id: String(idx + 1), type: c.tipe, qty: String(c.panjang) }))
        : [{ id: '1', type: 'kabel FO 96', qty: '' }]
    );

    const parsedHh: Array<{ id: string; dimension: string; qty: string }> = [];
    const parsedHb: Array<{ id: string; dimension: string; qty: string }> = [];
    const parsedMh: Array<{ id: string; dimension: string; qty: string }> = [];

    (plan.manholes || []).forEach((m, idx) => {
      const { cat, dim } = parseHhItem(m.tipe);
      const row = { id: m.id || String(idx + 1), dimension: dim, qty: String(m.unit) };
      if (cat === 'HH') parsedHh.push(row);
      else if (cat === 'HB') parsedHb.push(row);
      else parsedMh.push(row);
    });

    setHhItems(parsedHh.length > 0 ? parsedHh : [{ id: 'hh-1', dimension: '80x80', qty: '' }]);
    setHbItems(parsedHb.length > 0 ? parsedHb : [{ id: 'hb-1', dimension: '80x80', qty: '' }]);
    setMhItems(parsedMh.length > 0 ? parsedMh : [{ id: 'mh-1', dimension: '100x100', qty: '' }]);

    setPoles(
      plan.poles && plan.poles.length > 0
        ? plan.poles.map((p, idx) => ({ id: String(idx + 1), type: p.tipe, qty: String(p.unit) }))
        : [{ id: '1', type: 'pole 9', qty: '' }]
    );

    setGalvanis(
      plan.galvanis && plan.galvanis.length > 0
        ? plan.galvanis.map((g, idx) => ({ id: String(idx + 1), type: g.tipe, qty: String(g.meter) }))
        : [{ id: '1', type: '4"', qty: '' }]
    );

    // Otomatis states
    const targetGalian = (plan.panjangRelokasiGalian || 0) + (plan.borringAkses || 0) + (plan.crossingJalan || 0) + (plan.crossingJembatan || 0) + (plan.crossingTol || 0) + (plan.crossingKaliSungai || 0);
    const defGalianSelesai = plan.galianSelesaiMeter !== undefined ? plan.galianSelesaiMeter : Math.round(targetGalian * 0.75);
    setGalianSelesaiMeter(String(defGalianSelesai));
    setGalianTahapanStatus(plan.galianTahapanStatus || 'Dalam Proses Pekerjaan Galian');

    const totalFo = plan.foCables?.reduce((acc, c) => acc + (c.panjang || 0), 0) || 0;
    const defFoPull = plan.pullingFoMeterSelesai !== undefined ? plan.pullingFoMeterSelesai : Math.round(totalFo * 0.65);
    setPullingFoMeterSelesai(String(defFoPull));
    setPullingFoStatus(plan.pullingFoStatus || 'Penarikan Sebagian');

    const defCoaxPull = plan.pullingCoaxMeterSelesai !== undefined ? plan.pullingCoaxMeterSelesai : Math.round((plan.panjangKabelCoax || 0) * 0.6);
    setPullingCoaxMeterSelesai(String(defCoaxPull));
    setPullingCoaxStatus(plan.pullingCoaxStatus || 'Penarikan Sebagian');

    // Populate workflow status baru
    setClousesingSap(plan.clousesingSap || 'not yet');
    setLabour(plan.labour || 'not yet');
    setContraction(plan.contraction || 'not started');
    setPengambilanMaterial(plan.pengambilanMaterial || 'not yet');
    setLocationMaterial(plan.locationMaterial || 'warehouse ISP');
    setMaterial(plan.material || 'not yet');
    setStatusPullingFo(plan.statusPullingFo || 'not yet');
    setStatusPullingCoax(plan.statusPullingCoax || 'not yet');
    setStatusInstalMh(plan.statusInstalMh || 'not yet');
    setStatusPoleBersama(plan.statusPoleBersama || 'not yet');
    setStatusGalvanis(plan.statusGalvanis || 'not yet');

    setSurveyDate(plan.tanggalBaSurvey || new Date().toISOString().slice(0, 10));
    setApdFile(plan.docApdRelokasi || plan.apdIsp || null);
    setBaSurveyFile(plan.docBaSurveyBersama || plan.baSurvey || null);
    setDocKmz(plan.docKmz || null);
    setDocApdRelokasi(plan.docApdRelokasi || plan.apdIsp || null);
    setDocTimeline(plan.docTimeline || null);
    setDocSuratPerintahRelokasi(plan.docSuratPerintahRelokasi || null);
    setDocBaSurveyBersama(plan.docBaSurveyBersama || plan.baSurvey || null);
    setDocSuratPenunjukanVendor(plan.docSuratPenunjukanVendor || null);
    setDocSuratRekomtek(plan.docSuratRekomtek || null);

    setRemarks(plan.remarks || '');
    setFormError(null);
    setViewMode('form');
  };

  // Universal file upload handler for all 7 document types (Semua Jenis File)
  const handleUniversalFileUpload = (file: File, docType: DocumentCategory) => {
    if (!file) return;

    let formattedSize = '';
    if (file.size < 1024 * 1024) {
      formattedSize = `${Math.round(file.size / 1024)} KB`;
    } else {
      formattedSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newDoc: AttachedDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fileName: file.name,
        fileSize: formattedSize,
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        fileDataUrl: dataUrl,
        documentType: docType,
        signer: 'Verifikator Dinas & Operator ISP',
        status: 'Verified'
      };

      if (docType === 'KMZ') {
        setDocKmz(newDoc);
      } else if (docType === 'APD Relokasi') {
        setDocApdRelokasi(newDoc);
        setApdFile(newDoc);
      } else if (docType === 'Timeline Pelaksana') {
        setDocTimeline(newDoc);
      } else if (docType === 'Surat Perintah Relokasi (Dinas)') {
        setDocSuratPerintahRelokasi(newDoc);
      } else if (docType === 'BA Survey Bersama') {
        setDocBaSurveyBersama(newDoc);
        setBaSurveyFile(newDoc);
      } else if (docType === 'Surat Penunjukan Vendor') {
        setDocSuratPenunjukanVendor(newDoc);
      } else if (docType === 'Surat Rekomtek') {
        setDocSuratRekomtek(newDoc);
      }
    };
    reader.readAsDataURL(file);
    setFormError(null);
  };

  // Legacy PDF upload handler for compatibility
  const handleFileUpload = (file: File, type: 'APD ISP' | 'BA Survey') => {
    if (!file) return;
    handleUniversalFileUpload(file, type === 'APD ISP' ? 'APD Relokasi' : 'BA Survey Bersama');
  };

  // Total count of uploaded survey documents
  const totalUploadedDocsCount = useMemo(() => {
    let count = 0;
    if (docKmz) count++;
    if (docApdRelokasi || apdFile) count++;
    if (docTimeline) count++;
    if (docSuratPerintahRelokasi) count++;
    if (docBaSurveyBersama || baSurveyFile) count++;
    if (docSuratPenunjukanVendor) count++;
    if (docSuratRekomtek) count++;
    return count;
  }, [
    docKmz,
    docApdRelokasi,
    apdFile,
    docTimeline,
    docSuratPerintahRelokasi,
    docBaSurveyBersama,
    baSurveyFile,
    docSuratPenunjukanVendor,
    docSuratRekomtek
  ]);



  // ISP Item handlers
  const handleAddIspItem = () => {
    setIspListItems(prev => [...prev, { id: String(Date.now()), name: '' }]);
  };

  const handleUpdateIspItem = (id: string, name: string) => {
    setIspListItems(prev => prev.map(item => item.id === id ? { ...item, name } : item));
  };

  const handleRemoveIspItem = (id: string) => {
    if (ispListItems.length > 1) {
      setIspListItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Handle Save
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validIsps = ispListItems.map(i => i.name.trim()).filter(Boolean);
    if (validIsps.length === 0) {
      setFormError('Nama ISP wajib diisi setidaknya 1 operator');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const now = new Date().toISOString();
      const matchedProject = projects.find(p => p.projectId === projectCode);

      const savedPlan: ConstructionPlanItem = {
        id: editingPlanId || `cp-${Date.now()}`,
        projectId: projectCode || (projects[0]?.projectId ?? 'PRJ-JWS-2026-001'),
        projectName: matchedProject?.projectDescription || 'Paket Proyek Relokasi Terpadu JWS',
        namaIsp: validIsps.join(', '),
        ispList: validIsps,
        panjangRelokasiGalian: parseFloat(relocationLength) || 0,
        borringAkses: parseFloat(boringAccess) || 0,
        crossingJalan: parseFloat(roadCrossing) || 0,
        crossingJembatan: parseFloat(bridgeCrossing) || 0,
        crossingTol: parseFloat(tollCrossing) || 0,
        crossingKaliSungai: parseFloat(riverCrossing) || 0,
        panjangKabelCoax: parseFloat(coaxLength) || 0,
        foCables: fiberCables
          .filter(c => parseFloat(c.qty) > 0)
          .map(c => ({ id: c.id, tipe: c.type, panjang: parseFloat(c.qty) || 0 })),
        manholes: [
          ...hhItems
            .filter(h => parseInt(h.qty) > 0)
            .map(h => ({ id: h.id, tipe: `HH ${h.dimension}` as ManholeType, unit: parseInt(h.qty) || 0 })),
          ...hbItems
            .filter(h => parseInt(h.qty) > 0)
            .map(h => ({ id: h.id, tipe: `HB ${h.dimension}` as ManholeType, unit: parseInt(h.qty) || 0 })),
          ...mhItems
            .filter(h => parseInt(h.qty) > 0)
            .map(h => ({ id: h.id, tipe: `MH ${h.dimension}` as ManholeType, unit: parseInt(h.qty) || 0 }))
        ],
        poles: poles
          .filter(p => parseInt(p.qty) > 0)
          .map(p => ({
            id: p.id,
            tipe: p.type,
            meter: parseInt(p.type.replace('pole ', '')) || 9,
            unit: parseInt(p.qty) || 0
          })),
        galvanis: galvanis
          .filter(g => parseFloat(g.qty) > 0)
          .map(g => ({ id: g.id, tipe: g.type, meter: parseFloat(g.qty) || 0 })),

        // Project ID & SAP
        clousesingSap,

        // Volume Pekerjaan Status
        labour,
        contraction,

        // Material Kabel & Infrastruktur Status
        pengambilanMaterial,
        locationMaterial,
        material,
        statusPullingFo,
        statusPullingCoax,
        statusInstalMh,
        statusPoleBersama,
        statusGalvanis,

        // Otomatis Data
        galianSelesaiMeter: parseFloat(galianSelesaiMeter) || 0,
        galianProgressPercent: calculatedGalianPercent,
        galianTahapanStatus: galianTahapanStatus,

        pullingFoMeterSelesai: parseFloat(pullingFoMeterSelesai) || 0,
        pullingFoProgressPercent: calculatedFoPercent,
        pullingFoStatus: pullingFoStatus,

        pullingCoaxMeterSelesai: parseFloat(pullingCoaxMeterSelesai) || 0,
        pullingCoaxProgressPercent: calculatedCoaxPercent,
        pullingCoaxStatus: pullingCoaxStatus,

        tanggalBaSurvey: surveyDate,
        docKmz,
        docApdRelokasi: docApdRelokasi || apdFile,
        docTimeline,
        docSuratPerintahRelokasi,
        docBaSurveyBersama: docBaSurveyBersama || baSurveyFile,
        docSuratPenunjukanVendor,
        docSuratRekomtek,
        apdIsp: docApdRelokasi || apdFile,
        baSurvey: docBaSurveyBersama || baSurveyFile,
        remarks: remarks.trim(),
        emailDispatchLogs: editingPlanId
          ? plans.find(p => p.id === editingPlanId)?.emailDispatchLogs || []
          : [],
        createdAt: editingPlanId ? (plans.find(p => p.id === editingPlanId)?.createdAt || now) : now,
        updatedAt: now
      };

      onSavePlan(savedPlan);
      setIsSaving(false);
      setViewMode('list');
    }, 200);
  };

  // Helper to check if plan is internal
  const isPlanInternal = (plan: ConstructionPlanItem) => {
    const prj = projects.find((p) => p.projectId === plan.projectId);
    if (prj) {
      return prj.projectCategory === 'Project Internal' || prj.projectCategory === 'INTERNAL';
    }
    return plan.projectId?.startsWith('PRJ-INT') || false;
  };

  const govPlansCount = useMemo(() => {
    return plans.filter((p) => !isPlanInternal(p)).length;
  }, [plans, projects]);

  const internalPlansCount = useMemo(() => {
    return plans.filter((p) => isPlanInternal(p)).length;
  }, [plans, projects]);

  // Filtered plans for list view (Filter CRUD)
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const internal = isPlanInternal(p);
      if (mainGroupFilter === 'GOV' && internal) return false;
      if (mainGroupFilter === 'INTERNAL' && !internal) return false;

      const matchSearch =
        p.namaIsp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.projectName && p.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.remarks && p.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchIsp = selectedIsp === 'ALL' || p.namaIsp.includes(selectedIsp);
      const matchProject = selectedProjectId === 'ALL' || p.projectId === selectedProjectId;
      const matchSap = selectedSapFilter === 'ALL' || p.clousesingSap === selectedSapFilter;

      // Filter Progress
      let matchProgress = true;
      const galianPct = p.galianProgressPercent ?? (p.panjangRelokasiGalian > 0 ? 75 : 0);
      if (selectedProgressFilter === 'DONE') {
        matchProgress = galianPct >= 100;
      } else if (selectedProgressFilter === 'IN_PROGRESS') {
        matchProgress = galianPct > 0 && galianPct < 100;
      } else if (selectedProgressFilter === 'NOT_STARTED') {
        matchProgress = galianPct === 0;
      }

      return matchSearch && matchIsp && matchProject && matchSap && matchProgress;
    });
  }, [plans, projects, mainGroupFilter, searchTerm, selectedIsp, selectedProjectId, selectedSapFilter, selectedProgressFilter]);

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* TOP HEADER & VIEW CONTROLS (Daftar CRUD vs Input Form)   */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="neon-icon size-10 rounded-xl" style={{ '--glow': '#ff9f1c' } as React.CSSProperties}>
            <HardHat className="size-5 text-[#ff9f1c]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">
                {viewMode === 'form' ? (editingPlanId ? 'Edit Data Construction' : 'Input Data Construction') : 'Construction'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-300">
                CRUD & Realtime Kalkulasi
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {viewMode === 'form'
                ? 'Input dan edit volume galian sipil, material kabel FO & COAX, infrastruktur pelengkap, dan progres otomatis'
                : 'Pusat manajemen data konstruksi, terbagi menjadi 1. Construction GOV dan 2. Construction Internal'}
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2">
          {viewMode === 'form' ? (
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all finger-click"
            >
              <ArrowLeft className="size-4 text-cyan-400" />
              <span>Kembali ke Daftar</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all finger-click ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Rows3 className="size-4" />
                <span>Daftar Construction ({filteredPlans.length})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Group Separation Tab Switcher for Construction & CSV Export */}
      {viewMode === 'list' && (
        <div className="p-2.5 rounded-2xl bg-[#091022] border border-slate-800 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleGroupChange('GOV')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all finger-click border shrink-0 ${
                mainGroupFilter === 'GOV'
                  ? 'bg-gradient-to-r from-orange-950 to-amber-950 border-orange-400 text-orange-200 shadow-lg shadow-orange-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4 text-orange-400" />
              <span>1. Construction GOV</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-900/80 border border-orange-600/80 text-[10px] font-mono text-orange-200 font-extrabold">
                {govPlansCount}
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
              <span>2. Construction Internal</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-900/80 border border-indigo-600/80 text-[10px] font-mono text-indigo-200 font-extrabold">
                {internalPlansCount}
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
              <span>Semua Construction</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 font-bold">
                {plans.length}
              </span>
            </button>
          </div>

          {/* Export CSV & Email Sharing Buttons */}
          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-emerald-500/20 transition-all finger-click"
              title="Kirim Berkas Dokumen & Catatan via Email"
            >
              <Mail className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Kirim via Email</span>
            </button>

            <button
              type="button"
              onClick={() => exportConstructionPlansCsv(plans, projects, 'GOV')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-950/70 hover:bg-orange-900/90 border border-orange-500/60 text-orange-200 text-xs font-semibold transition-all finger-click shadow-md hover:shadow-orange-500/20"
              title="Unduh Berkas CSV Construction GOV"
            >
              <FileSpreadsheet className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Export CSV GOV</span>
            </button>

            <button
              type="button"
              onClick={() => exportConstructionPlansCsv(plans, projects, 'INTERNAL')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/90 border border-indigo-500/60 text-indigo-200 text-xs font-semibold transition-all finger-click shadow-md hover:shadow-indigo-500/20"
              title="Unduh Berkas CSV Construction Internal"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Export CSV Internal</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW MODE 1: FORM INPUT / EDIT CONSTRUCTION              */}
      {/* ======================================================== */}
      {viewMode === 'form' && (
        <form onSubmit={handleSubmitForm} className="space-y-6">
          {formError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* TOP ACTION BAR (Kembali, Simpan, Hapus) */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="btn-ghost text-xs"
            >
              <ArrowLeft className="size-4" />
              <span>Kembali</span>
            </button>

            <div className="flex items-center gap-2.5">
              {editingPlanId && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(editingPlanId)}
                  className="btn-ghost text-rose-400 hover:text-rose-300 hover:border-rose-500/50 text-xs"
                >
                  <Trash2 className="size-4" />
                  <span>Hapus</span>
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary text-xs"
              >
                {isSaving ? (
                  <span>Menyimpan data…</span>
                ) : (
                  <>
                    <Check className="size-4" />
                    <span>{editingPlanId ? 'Simpan Perubahan' : 'Simpan Data Construction'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PANEL 1: NAMA ISP */}
          <div className="panel" style={{ '--glow': '#ff2bd6' } as React.CSSProperties}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="neon-icon size-8" style={{ '--glow': '#ff2bd6' } as React.CSSProperties}>
                  <Building2 className="size-4 text-[#ff2bd6]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide uppercase font-mono text-white">
                    Nama ISP
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Wajib diisi — nama ISP / operator pelaksana
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddIspItem}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#ff2bd6]/40 bg-[#ff2bd6]/10 px-3 py-1.5 text-xs font-semibold text-[#ff2bd6] hover:bg-[#ff2bd6]/20 transition-colors finger-click"
              >
                <Plus className="size-3.5" />
                <span>Tambah beberapa item</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-2.5">
                {ispListItems.map((ispItem, idx) => (
                  <div key={ispItem.id} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        className="field min-h-[42px] h-[42px] rounded-xl font-mono text-white resize-y leading-normal py-2 text-xs"
                        placeholder="Masukkan nama ISP…"
                        value={ispItem.name}
                        onChange={(e) => handleUpdateIspItem(ispItem.id, e.target.value)}
                        rows={1}
                        required={idx === 0}
                      />
                    </div>

                    {/* Quick preset selector helper */}
                    <select
                      className="field !w-auto text-xs font-mono py-2 text-slate-300 hidden sm:block"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleUpdateIspItem(ispItem.id, e.target.value);
                        }
                      }}
                    >
                      <option value="">Pilih Preset Operator…</option>
                      {ISP_LIST_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {ispListItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIspItem(ispItem.id)}
                        className="icon-btn shrink-0"
                        style={{ '--glow': '#ff3b5c' } as React.CSSProperties}
                        title="Hapus baris ISP"
                      >
                        <Trash2 className="size-4 text-rose-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PANEL 2: TERKAIT PROJECT ID */}
          <div className="panel" style={{ '--glow': '#00f0ff' } as React.CSSProperties}>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-white/10">
              <div className="neon-icon size-8" style={{ '--glow': '#00f0ff' } as React.CSSProperties}>
                <HardHat className="size-4 text-[#00f0ff]" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide uppercase font-mono text-white">
                  Terkait Project ID
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Hubungkan dengan referensi Project List & status clousesing SAP
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Pilih Project ID</label>
                <select
                  className="field font-mono"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                >
                  <option value="">— Tidak dihubungkan —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.projectId}>
                      {p.projectId} · {p.areaLocation || p.projectCategory}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label !mb-0">Clousesing SAP</label>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    Milestone SAP
                  </span>
                </div>
                <select
                  className="field font-mono text-cyan-300 font-semibold"
                  value={clousesingSap}
                  onChange={(e) => setClousesingSap(e.target.value as ClousesingSapStatus)}
                >
                  {CLOUSESING_SAP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-slate-500 font-mono">
                  Opsi: not yet, completed waspang mobilty, submit document SAP, approval completed SAP, approval BALAP, approval BAST, Teco done
                </p>
              </div>
            </div>
          </div>

          {/* PANEL 3: VOLUME PEKERJAAN (METER) */}
          <div className="panel" style={{ '--glow': '#ff9f1c' } as React.CSSProperties}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="neon-icon size-8" style={{ '--glow': '#ff9f1c' } as React.CSSProperties}>
                  <Construction className="size-4 text-[#ff9f1c]" />
                </div>
                <h3 className="text-sm font-bold tracking-wide uppercase font-mono text-white">
                  Volume Pekerjaan (meter)
                </h3>
              </div>
              <span className="text-xs font-bold font-mono text-[#ff9f1c]">
                Total Target: {totalRelokasiTarget.toLocaleString('id-ID')} m
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* 1. Panjang Relokasi / Galian */}
              <div>
                <label className="label">Panjang Relokasi / Galian</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="field pr-10 font-mono"
                    value={relocationLength}
                    onChange={(e) => setRelocationLength(e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                    m
                  </span>
                </div>
              </div>

              {/* 2. Boring Akses */}
              <div>
                <label className="label">Boring Akses</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="field pr-10 font-mono"
                    value={boringAccess}
                    onChange={(e) => setBoringAccess(e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                    m
                  </span>
                </div>
              </div>

              {/* 3. Crossing Jalan */}
              <div>
                <label className="label">Crossing Jalan</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="field pr-10 font-mono"
                    value={roadCrossing}
                    onChange={(e) => setRoadCrossing(e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                    m
                  </span>
                </div>
              </div>

              {/* 4. Crossing Jembatan */}
              <div>
                <label className="label">Crossing Jembatan</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="field pr-10 font-mono"
                    value={bridgeCrossing}
                    onChange={(e) => setBridgeCrossing(e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                    m
                  </span>
                </div>
              </div>

              {/* 5. Crossing Tol */}
              <div>
                <label className="label">Crossing Tol</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="field pr-10 font-mono"
                    value={tollCrossing}
                    onChange={(e) => setTollCrossing(e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                    m
                  </span>
                </div>
              </div>

              {/* 6. Crossing Kali / Sungai */}
              <div>
                <label className="label">Crossing Kali / Sungai</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="field pr-10 font-mono"
                    value={riverCrossing}
                    onChange={(e) => setRiverCrossing(e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                    m
                  </span>
                </div>
              </div>
            </div>

            {/* Status Tahapan Labour & Contraction */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold font-mono uppercase text-white tracking-wider flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#ff9f1c]" />
                  Status Labour & Contraction
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Volume Pekerjaan Kontraksi
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Labour</label>
                  <select
                    className="field font-mono text-[#ff9f1c] font-semibold"
                    value={labour}
                    onChange={(e) => setLabour(e.target.value as LabourStatus)}
                  >
                    {LABOUR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-slate-500 font-mono">
                    Opsi: not yet, release, cancel
                  </p>
                </div>

                <div>
                  <label className="label">Contraction</label>
                  <select
                    className="field font-mono text-emerald-400 font-semibold"
                    value={contraction}
                    onChange={(e) => setContraction(e.target.value as ContractionStatus)}
                  >
                    {CONTRACTION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-slate-500 font-mono">
                    Opsi: not started, in progress boring, done
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 4: MATERIAL KABEL & INFRASTRUKTUR */}
          <div className="panel" style={{ '--glow': '#a855f7' } as React.CSSProperties}>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-white/10">
              <div className="neon-icon size-8" style={{ '--glow': '#a855f7' } as React.CSSProperties}>
                <Cable className="size-4 text-[#a855f7]" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide uppercase font-mono text-white">
                  Material Kabel & Infrastruktur
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Logistik pengambilan, status material, penarikan kabel & instalasi fisik
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* SUBSECTION: STATUS LOGISTIK & WORKFLOW MATERIAL */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#a855f7] animate-pulse" />
                    <span className="text-xs font-bold font-mono uppercase text-white tracking-wider">
                      Status Logistik Material & Workflow Lapangan
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                    8 Opsi Kontrol
                  </span>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* 1. Pengambilan Material */}
                  <div>
                    <label className="label !mb-1 text-[11px]">Pengambilan Material</label>
                    <select
                      className="field text-xs font-mono text-purple-200"
                      value={pengambilanMaterial}
                      onChange={(e) => setPengambilanMaterial(e.target.value as PengambilanMaterialStatus)}
                    >
                      {PENGAMBILAN_MATERIAL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                      not yet · warehouse ISP
                    </span>
                  </div>

                  {/* 2. Location Material */}
                  <div>
                    <label className="label !mb-1 text-[11px]">Location Material</label>
                    <select
                      className="field text-xs font-mono text-purple-200"
                      value={locationMaterial}
                      onChange={(e) => setLocationMaterial(e.target.value as LocationMaterialStatus)}
                    >
                      {LOCATION_MATERIAL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                      warehouse ISP · warehouse vendor
                    </span>
                  </div>

                  {/* 3. Material */}
                  <div>
                    <label className="label !mb-1 text-[11px]">Material</label>
                    <select
                      className="field text-xs font-mono text-purple-200"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value as MaterialStatus)}
                    >
                      {MATERIAL_STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                      not yet · release · cancel
                    </span>
                  </div>

                  {/* 4. Pulling FO */}
                  <div>
                    <label className="label !mb-1 text-[11px]">Pulling FO</label>
                    <select
                      className="field text-xs font-mono text-purple-200"
                      value={statusPullingFo}
                      onChange={(e) => setStatusPullingFo(e.target.value as PullingFoWorkflowStatus)}
                    >
                      {PULLING_FO_WORKFLOW_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                      not yet · in progress pulling · done
                    </span>
                  </div>

                  {/* 5. Pulling COAX */}
                  <div>
                    <label className="label !mb-1 text-[11px]">Pulling COAX</label>
                    <select
                      className="field text-xs font-mono text-purple-200"
                      value={statusPullingCoax}
                      onChange={(e) => setStatusPullingCoax(e.target.value as PullingCoaxWorkflowStatus)}
                    >
                      {PULLING_COAX_WORKFLOW_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                      not yet · no coax · in progress pulling · done
                    </span>
                  </div>

                  {/* 6. Instal HH, HB, MH */}
                  <div>
                    <label className="label !mb-1 text-[11px]">Instal HH, HB, MH</label>
                    <select
                      className="field text-xs font-mono text-purple-200"
                      value={statusInstalMh}
                      onChange={(e) => setStatusInstalMh(e.target.value as InstalHandholeStatus)}
                    >
                      {INSTAL_MH_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                      not yet · In progress instal · done
                    </span>
                  </div>

                  {/* 7. Pole Bersama */}
                  <div>
                    <label className="label !mb-1 text-[11px]">Pole Bersama</label>
                    <select
                      className="field text-xs font-mono text-purple-200"
                      value={statusPoleBersama}
                      onChange={(e) => setStatusPoleBersama(e.target.value as PoleBersamaStatus)}
                    >
                      {POLE_BERSAMA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                      not yet · In progress instal · done
                    </span>
                  </div>

                  {/* 8. Galvanis */}
                  <div>
                    <label className="label !mb-1 text-[11px]">Galvanis</label>
                    <select
                      className="field text-xs font-mono text-purple-200"
                      value={statusGalvanis}
                      onChange={(e) => setStatusGalvanis(e.target.value as GalvanisStatus)}
                    >
                      {GALVANIS_STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                      not yet · In progress instal · done
                    </span>
                  </div>
                </div>
              </div>
              {/* 1. Dynamic Table: Panjang Kabel FO */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="label !mb-0">Panjang Kabel FO</span>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Pilihan kabel FO 12, kabel FO 24, kabel FO 48, kabel FO 96, kabel FO 144, kabel FO 288
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono text-[#a855f7] tabular-nums">
                    Total {totalFoMeters.toLocaleString('id-ID')} m
                  </span>
                </div>
                <div className="space-y-2">
                  {fiberCables.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-[1fr_130px_auto] items-center gap-2">
                      <select
                        className="field"
                        value={item.type}
                        onChange={(e) => {
                          const val = e.target.value as FoCableType;
                          setFiberCables(fiberCables.map((row, i) => i === idx ? { ...row, type: val } : row));
                        }}
                      >
                        {FO_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          className="field pr-10 font-mono"
                          value={item.qty}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFiberCables(fiberCables.map((row, i) => i === idx ? { ...row, qty: val } : row));
                          }}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 font-mono">
                          m
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (fiberCables.length > 1) {
                            setFiberCables(fiberCables.filter((_, i) => i !== idx));
                          }
                        }}
                        className="icon-btn"
                        style={{ '--glow': '#ff3b5c' } as React.CSSProperties}
                        title="Hapus item"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextId = String(Date.now());
                    const remainingOpt = FO_OPTIONS.find(o => !fiberCables.some(c => c.type === o)) || FO_OPTIONS[0];
                    setFiberCables([...fiberCables, { id: nextId, type: remainingOpt, qty: '' }]);
                  }}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#a855f7]/40 bg-[#a855f7]/10 px-3 py-1.5 text-xs font-semibold text-[#a855f7] hover:bg-[#a855f7]/20 transition-colors finger-click"
                >
                  <Plus className="size-3.5" />
                  <span>Tambahkan beberapa item</span>
                </button>
              </div>

              {/* 2. Panjang Kabel COAX */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <label className="label !mb-0 text-white font-semibold">Panjang Kabel COAX</label>
                    <p className="text-[10px] text-slate-400 font-mono">Kabel koaksial tembaga / feeder distribusi</p>
                  </div>
                  <span className="text-xs font-bold font-mono text-[#ff9f1c] tabular-nums">
                    {(parseFloat(coaxLength) || 0).toLocaleString('id-ID')} m
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="field pr-10 font-mono"
                    value={coaxLength}
                    onChange={(e) => setCoaxLength(e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                    m
                  </span>
                </div>
              </div>

              {/* SPESIFIKASI INSTALL HH, HB, MH, POLE & GALVANIS (SESUAI GAMBAR DASHBOARD) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-yellow-500/30 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="neon-icon size-7 rounded-lg" style={{ '--glow': '#ffd166' } as React.CSSProperties}>
                      <Box className="size-4 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold font-mono text-white tracking-wide">
                        Spesifikasi Install HH, HB, MH, Pole & Galvanis
                      </h4>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Format Telemetri Terintegrasi Sesuai Dashboard Realtime
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-mono px-3 py-1 rounded-lg border ${
                      isConfiguredHhPoleGalv
                        ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    }`}
                  >
                    {isConfiguredHhPoleGalv ? 'Terkonfigurasi' : 'Belum dikonfigurasi'}
                  </span>
                </div>

                {/* HERO CARD: LIVE TELEMETRI DASHBOARD WIDGET */}
                <div className="rounded-2xl bg-[#091022] border border-yellow-500/40 p-4 sm:p-5 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500" />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-yellow-950/80 border border-yellow-700/80 text-yellow-400 group-hover:scale-105 transition-transform">
                        <Box className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono uppercase tracking-wider text-yellow-300 font-bold">
                            HH, HB, MH, Tiang Bersama & Galvanis
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono bg-yellow-500/15 border border-yellow-500/40 text-yellow-300">
                            Live Dashboard Preview
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          Sinkronisasi otomatis ke widget & monitoring modal
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                        {totalAllManholeUnits} <span className="text-xs sm:text-sm font-sans font-normal text-slate-400">Unit · {totalPoleUnits} Tiang</span>
                      </div>
                      <div className="text-[11px] text-yellow-400/90 font-mono mt-0.5">
                        {totalGalvanisMeters.toLocaleString('id-ID')} m Pipa Galvanis
                      </div>
                    </div>
                  </div>

                  {/* 5-Card Dashboard Metrics Grid (Sesuai Realtime Monitoring Modal) */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-slate-800/80 font-mono">
                    {/* Card 1: Total HH */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-yellow-950/30 border border-yellow-500/40 text-center relative overflow-hidden">
                      <span className="text-slate-400 block font-sans text-[10px] mb-1">Total HH (Handhole)</span>
                      <span className="font-extrabold text-yellow-300 text-base sm:text-lg tabular-nums">
                        {totalHhUnits} <span className="text-[10px] font-normal text-yellow-400/80">unit</span>
                      </span>
                      <div className="text-[9px] text-yellow-500/70 mt-1 truncate">
                        {hhItems.filter(h => parseInt(h.qty) > 0).map(h => `${h.dimension}(${h.qty})`).join(', ') || 'Belum diisi'}
                      </div>
                    </div>

                    {/* Card 2: Total HB */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-center relative overflow-hidden">
                      <span className="text-slate-400 block font-sans text-[10px] mb-1">Total HB (Handbox)</span>
                      <span className="font-extrabold text-amber-300 text-base sm:text-lg tabular-nums">
                        {totalHbUnits} <span className="text-[10px] font-normal text-amber-400/80">unit</span>
                      </span>
                      <div className="text-[9px] text-amber-500/70 mt-1 truncate">
                        {hbItems.filter(h => parseInt(h.qty) > 0).map(h => `${h.dimension}(${h.qty})`).join(', ') || 'Belum diisi'}
                      </div>
                    </div>

                    {/* Card 3: Total MH */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-yellow-950/30 border border-yellow-400/40 text-center relative overflow-hidden">
                      <span className="text-slate-400 block font-sans text-[10px] mb-1">Total MH (Manhole)</span>
                      <span className="font-extrabold text-yellow-400 text-base sm:text-lg tabular-nums">
                        {totalMhUnits} <span className="text-[10px] font-normal text-yellow-300/80">unit</span>
                      </span>
                      <div className="text-[9px] text-yellow-500/70 mt-1 truncate">
                        {mhItems.filter(h => parseInt(h.qty) > 0).map(h => `${h.dimension}(${h.qty})`).join(', ') || 'Belum diisi'}
                      </div>
                    </div>

                    {/* Card 4: Total Tiang */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-center relative overflow-hidden">
                      <span className="text-slate-400 block font-sans text-[10px] mb-1">Total Tiang / Pole</span>
                      <span className="font-extrabold text-cyan-300 text-base sm:text-lg tabular-nums">
                        {totalPoleUnits} <span className="text-[10px] font-normal text-cyan-400/80">batang</span>
                      </span>
                      <div className="text-[9px] text-cyan-500/70 mt-1 truncate">
                        {poles.filter(p => parseInt(p.qty) > 0).map(p => `${p.type.replace('pole ', 'P')}(${p.qty})`).join(', ') || 'Belum diisi'}
                      </div>
                    </div>

                    {/* Card 5: Total Galvanis */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-center relative overflow-hidden col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block font-sans text-[10px] mb-1">Total Galvanis</span>
                      <span className="font-extrabold text-rose-300 text-base sm:text-lg tabular-nums">
                        {totalGalvanisMeters.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-rose-400/80">m</span>
                      </span>
                      <div className="text-[9px] text-rose-500/70 mt-1 truncate">
                        {galvanis.filter(g => parseFloat(g.qty) > 0).map(g => `${g.type}(${g.qty}m)`).join(', ') || 'Belum diisi'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 Dedicated Columns for HH, HB, and MH (Row 1) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* BOX 1: 1. Handhole (HH) */}
                  <div className="p-3.5 rounded-xl bg-[#070c18] border border-yellow-500/30 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-yellow-500/20">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-yellow-400" />
                          <span className="text-xs font-bold font-mono text-yellow-300">
                            1. Handhole (HH)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
                            {totalHhUnits} Unit
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextId = `hh-${Date.now()}`;
                              setHhItems(prev => [...prev, { id: nextId, dimension: '80x80', qty: '' }]);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-2 py-0.5 rounded-md transition-colors finger-click"
                          >
                            <Plus className="size-3" />
                            <span>Tambah HH</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {hhItems.map((item, idx) => (
                          <div key={item.id} className="p-2.5 rounded-lg bg-yellow-950/10 border border-yellow-500/20 space-y-2 relative">
                            {/* Row 1: Dropdown Dimension */}
                            <div>
                              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                                Ukuran / Dimensi HH:
                              </label>
                              <select
                                className="field text-xs font-mono py-1.5 text-yellow-200"
                                value={item.dimension}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHhItems(hhItems.map((row, i) => i === idx ? { ...row, dimension: val } : row));
                                }}
                              >
                                {HH_DIMENSIONS.map((d) => (
                                  <option key={d} value={d} className="bg-slate-900 text-white">
                                    HH {d}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Row 2: Jumlah Unit input + delete */}
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  placeholder="Jumlah unit"
                                  className="field pr-12 font-mono text-xs py-1.5"
                                  value={item.qty}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setHhItems(hhItems.map((row, i) => i === idx ? { ...row, qty: val } : row));
                                  }}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 font-mono">
                                  Unit
                                </span>
                              </div>

                              {hhItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setHhItems(hhItems.filter((_, i) => i !== idx))}
                                  className="icon-btn shrink-0"
                                  style={{ '--glow': '#ff3b5c' } as React.CSSProperties}
                                  title="Hapus baris HH"
                                >
                                  <Trash2 className="size-3.5 text-rose-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BOX 2: 2. Handbox (HB) */}
                  <div className="p-3.5 rounded-xl bg-[#070c18] border border-amber-500/30 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-amber-400" />
                          <span className="text-xs font-bold font-mono text-amber-300">
                            2. Handbox (HB)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {totalHbUnits} Unit
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextId = `hb-${Date.now()}`;
                              setHbItems(prev => [...prev, { id: nextId, dimension: '80x80', qty: '' }]);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md transition-colors finger-click"
                          >
                            <Plus className="size-3" />
                            <span>Tambah HB</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {hbItems.map((item, idx) => (
                          <div key={item.id} className="p-2.5 rounded-lg bg-amber-950/10 border border-amber-500/20 space-y-2 relative">
                            {/* Row 1: Dropdown Dimension */}
                            <div>
                              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                                Ukuran / Dimensi HB:
                              </label>
                              <select
                                className="field text-xs font-mono py-1.5 text-amber-200"
                                value={item.dimension}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHbItems(hbItems.map((row, i) => i === idx ? { ...row, dimension: val } : row));
                                }}
                              >
                                {HH_DIMENSIONS.map((d) => (
                                  <option key={d} value={d} className="bg-slate-900 text-white">
                                    HB {d}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Row 2: Jumlah Unit input + delete */}
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  placeholder="Jumlah unit"
                                  className="field pr-12 font-mono text-xs py-1.5"
                                  value={item.qty}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setHbItems(hbItems.map((row, i) => i === idx ? { ...row, qty: val } : row));
                                  }}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 font-mono">
                                  Unit
                                </span>
                              </div>

                              {hbItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setHbItems(hbItems.filter((_, i) => i !== idx))}
                                  className="icon-btn shrink-0"
                                  style={{ '--glow': '#ff3b5c' } as React.CSSProperties}
                                  title="Hapus baris HB"
                                >
                                  <Trash2 className="size-3.5 text-rose-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BOX 3: 3. Manhole (MH) */}
                  <div className="p-3.5 rounded-xl bg-[#070c18] border border-yellow-400/30 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-yellow-400/20">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-yellow-500" />
                          <span className="text-xs font-bold font-mono text-yellow-400">
                            3. Manhole (MH)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                            {totalMhUnits} Unit
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextId = `mh-${Date.now()}`;
                              setMhItems(prev => [...prev, { id: nextId, dimension: '100x100', qty: '' }]);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-2 py-0.5 rounded-md transition-colors finger-click"
                          >
                            <Plus className="size-3" />
                            <span>Tambah MH</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {mhItems.map((item, idx) => (
                          <div key={item.id} className="p-2.5 rounded-lg bg-yellow-950/10 border border-yellow-500/20 space-y-2 relative">
                            {/* Row 1: Dropdown Dimension */}
                            <div>
                              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                                Ukuran / Dimensi MH:
                              </label>
                              <select
                                className="field text-xs font-mono py-1.5 text-yellow-300"
                                value={item.dimension}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMhItems(mhItems.map((row, i) => i === idx ? { ...row, dimension: val } : row));
                                }}
                              >
                                {HH_DIMENSIONS.map((d) => (
                                  <option key={d} value={d} className="bg-slate-900 text-white">
                                    MH {d}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Row 2: Jumlah Unit input + delete */}
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  placeholder="Jumlah unit"
                                  className="field pr-12 font-mono text-xs py-1.5"
                                  value={item.qty}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setMhItems(mhItems.map((row, i) => i === idx ? { ...row, qty: val } : row));
                                  }}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 font-mono">
                                  Unit
                                </span>
                              </div>

                              {mhItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setMhItems(mhItems.filter((_, i) => i !== idx))}
                                  className="icon-btn shrink-0"
                                  style={{ '--glow': '#ff3b5c' } as React.CSSProperties}
                                  title="Hapus baris MH"
                                >
                                  <Trash2 className="size-3.5 text-rose-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2 Dedicated Columns for Pole / Tiang Bersama & Galvanis (Row 2) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BOX 4: 4. Pole / Tiang Bersama (Ea) */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-cyan-500/20 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-cyan-400" />
                          <span className="text-xs font-bold font-mono text-cyan-300">
                            4. Pole / Tiang Bersama (Ea)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            {totalPoleUnits} Batang
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextId = String(Date.now());
                              const remainingOpt = POLE_OPTIONS.find(o => !poles.some(p => p.type === o)) || POLE_OPTIONS[0];
                              setPoles(prev => [...prev, { id: nextId, type: remainingOpt, qty: '' }]);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded-md transition-colors finger-click"
                          >
                            <Plus className="size-3" />
                            <span>Tambah Tiang</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {poles.map((item, idx) => (
                          <div key={item.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-2 relative">
                            {/* Row 1: Dropdown Tiang */}
                            <select
                              className="field text-xs font-mono py-1.5 text-cyan-200"
                              value={item.type}
                              onChange={(e) => {
                                const val = e.target.value as PoleType;
                                setPoles(poles.map((row, i) => i === idx ? { ...row, type: val } : row));
                              }}
                            >
                              {POLE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} className="bg-slate-900 text-white">
                                  {opt.replace('pole ', 'Tiang ')} (Meter)
                                </option>
                              ))}
                            </select>

                            {/* Row 2: Jumlah Tiang input + delete */}
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  placeholder="Jumlah tiang"
                                  className="field pr-12 font-mono text-xs py-1.5"
                                  value={item.qty}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setPoles(poles.map((row, i) => i === idx ? { ...row, qty: val } : row));
                                  }}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 font-mono">
                                  Ea
                                </span>
                              </div>

                              {poles.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setPoles(poles.filter((_, i) => i !== idx))}
                                  className="icon-btn shrink-0"
                                  style={{ '--glow': '#ff3b5c' } as React.CSSProperties}
                                  title="Hapus baris"
                                >
                                  <Trash2 className="size-3.5 text-rose-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BOX 5: 5. Pipa Galvanis (meter) */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-rose-500/20 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-rose-400" />
                          <span className="text-xs font-bold font-mono text-rose-300">
                            5. Pipa Galvanis (meter)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                            {totalGalvanisMeters} m
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextId = String(Date.now());
                              const remainingOpt = GALVANIS_OPTIONS.find(o => !galvanis.some(g => g.type === o)) || GALVANIS_OPTIONS[0];
                              setGalvanis(prev => [...prev, { id: nextId, type: remainingOpt, qty: '' }]);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-md transition-colors finger-click"
                          >
                            <Plus className="size-3" />
                            <span>Tambah Galvanis</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {galvanis.map((item, idx) => (
                          <div key={item.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-2 relative">
                            {/* Row 1: Dropdown Galvanis */}
                            <select
                              className="field text-xs font-mono py-1.5 text-rose-200"
                              value={item.type}
                              onChange={(e) => {
                                const val = e.target.value as GalvanisType;
                                setGalvanis(galvanis.map((row, i) => i === idx ? { ...row, type: val } : row));
                              }}
                            >
                              {GALVANIS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} className="bg-slate-900 text-white">
                                  Galvanis {opt}
                                </option>
                              ))}
                            </select>

                            {/* Row 2: Panjang meter input + delete */}
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Panjang meter"
                                  className="field pr-14 font-mono text-xs py-1.5"
                                  value={item.qty}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setGalvanis(galvanis.map((row, i) => i === idx ? { ...row, qty: val } : row));
                                  }}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 font-mono">
                                  Meter
                                </span>
                              </div>

                              {galvanis.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setGalvanis(galvanis.filter((_, i) => i !== idx))}
                                  className="icon-btn shrink-0"
                                  style={{ '--glow': '#ff3b5c' } as React.CSSProperties}
                                  title="Hapus baris"
                                >
                                  <Trash2 className="size-3.5 text-rose-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ringkasan Otomatis Bawah (2 Kolom) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/10">
                  <div>
                    <label className="label text-[11px] text-slate-300">
                      Label Ringkasan Install HH, HB, MH (Otomatis)
                    </label>
                    <input
                      type="text"
                      readOnly
                      className="field font-mono text-xs bg-black/40 text-yellow-300 cursor-default"
                      placeholder="e.g. HH: 80x80 (18U) | HB: 80x80 (6U) | MH: 100x100 (12U)"
                      value={summaryHhText}
                    />
                  </div>

                  <div>
                    <label className="label text-[11px] text-slate-300">
                      Label Ringkasan Install Pole & Galvanis (Otomatis)
                    </label>
                    <input
                      type="text"
                      readOnly
                      className="field font-mono text-xs bg-black/40 text-cyan-300 cursor-default"
                      placeholder="e.g. Tiang 7 (5 Ea), Tiang 8 (10 Ea) | Galv 4 (450m)"
                      value={summaryPoleGalvText}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 4: MONITORING PROGRES OTOMATIS */}
          <div className="panel" style={{ '--glow': '#00e5ff' } as React.CSSProperties}>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-white/10">
              <div className="neon-icon size-8" style={{ '--glow': '#00e5ff' } as React.CSSProperties}>
                <Gauge className="size-4 text-[#00e5ff]" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide uppercase font-mono text-white">
                  Kalkulasi Progres Otomatis
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Dihitung otomatis dari perbandingan meter selesai terhadap target meter / status tahapan (dalam persentase)
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* 1. Galian Sipil (Otomatis) */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-orange-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-400 font-mono">
                    Galian Sipil (Otomatis)
                  </span>
                  <span className="text-sm font-extrabold font-mono text-orange-300">
                    {calculatedGalianPercent}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculatedGalianPercent}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 font-mono">
                  Otomatis dari perbandingan meter / status tahapan konstruksi (Target: {totalRelokasiTarget.toLocaleString('id-ID')} m)
                </p>

                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="text-[11px]">
                    <label className="text-slate-300 text-[10px] font-mono block mb-1">
                      Meter Selesai Galian:
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="field font-mono text-xs py-1.5"
                      value={galianSelesaiMeter}
                      onChange={(e) => setGalianSelesaiMeter(e.target.value)}
                    />
                  </div>

                  <div className="text-[11px]">
                    <label className="text-slate-300 text-[10px] font-mono block mb-1">
                      Status Tahapan Konstruksi:
                    </label>
                    <select
                      className="field text-xs font-mono py-1.5"
                      value={galianTahapanStatus}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGalianTahapanStatus(val);
                        if (val === 'Selesai 100%') {
                          setGalianSelesaiMeter(String(totalRelokasiTarget));
                        } else if (val === 'Belum Dimulai') {
                          setGalianSelesaiMeter('0');
                        }
                      }}
                    >
                      <option value="Belum Dimulai">Belum Dimulai (0%)</option>
                      <option value="Dalam Proses Pekerjaan Galian">Dalam Proses Pekerjaan Galian</option>
                      <option value="Crossing & Boring Selesai">Crossing & Boring Selesai</option>
                      <option value="Selesai 100%">Selesai 100%</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Pulling Cable FO (Otomatis) */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 font-mono">
                    Pulling Cable FO (Otomatis)
                  </span>
                  <span className="text-sm font-extrabold font-mono text-purple-300">
                    {calculatedFoPercent}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculatedFoPercent}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 font-mono">
                  Otomatis dari perbandingan meter selesai / target meter FO (Target: {totalFoMeters.toLocaleString('id-ID')} m)
                </p>

                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="text-[11px]">
                    <label className="text-slate-300 text-[10px] font-mono block mb-1">
                      Meter Selesai Pulling FO:
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="field font-mono text-xs py-1.5"
                      value={pullingFoMeterSelesai}
                      onChange={(e) => setPullingFoMeterSelesai(e.target.value)}
                    />
                  </div>

                  <div className="text-[11px]">
                    <label className="text-slate-300 text-[10px] font-mono block mb-1">
                      Status Pulling FO:
                    </label>
                    <select
                      className="field text-xs font-mono py-1.5"
                      value={pullingFoStatus}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPullingFoStatus(val);
                        if (val === 'Selesai 100%') {
                          setPullingFoMeterSelesai(String(totalFoMeters));
                        } else if (val === 'Belum Mulai') {
                          setPullingFoMeterSelesai('0');
                        }
                      }}
                    >
                      <option value="Belum Mulai">Belum Mulai (0%)</option>
                      <option value="Penarikan Sebagian">Penarikan Sebagian</option>
                      <option value="Splicing & Terminasi">Splicing & Terminasi</option>
                      <option value="Selesai 100%">Selesai 100%</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Pulling Cable COAX (Otomatis) */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    Pulling Cable COAX (Otomatis)
                  </span>
                  <span className="text-sm font-extrabold font-mono text-cyan-300">
                    {calculatedCoaxPercent}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculatedCoaxPercent}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 font-mono">
                  Otomatis dari perbandingan meter selesai / target meter COAX (Target: {targetCoaxMeters.toLocaleString('id-ID')} m)
                </p>

                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="text-[11px]">
                    <label className="text-slate-300 text-[10px] font-mono block mb-1">
                      Meter Selesai Pulling COAX:
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="field font-mono text-xs py-1.5"
                      value={pullingCoaxMeterSelesai}
                      onChange={(e) => setPullingCoaxMeterSelesai(e.target.value)}
                    />
                  </div>

                  <div className="text-[11px]">
                    <label className="text-slate-300 text-[10px] font-mono block mb-1">
                      Status Pulling COAX:
                    </label>
                    <select
                      className="field text-xs font-mono py-1.5"
                      value={pullingCoaxStatus}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPullingCoaxStatus(val);
                        if (val === 'Selesai 100%') {
                          setPullingCoaxMeterSelesai(String(targetCoaxMeters));
                        } else if (val === 'Belum Mulai') {
                          setPullingCoaxMeterSelesai('0');
                        }
                      }}
                    >
                      <option value="Belum Mulai">Belum Mulai (0%)</option>
                      <option value="Penarikan Sebagian">Penarikan Sebagian</option>
                      <option value="Selesai 100%">Selesai 100%</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 5: REMARKS & CATATAN CONSTRUCTION */}
          <div className="panel" style={{ '--glow': '#22ff9a' } as React.CSSProperties}>
            <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-white/10">
              <div className="neon-icon size-8" style={{ '--glow': '#22ff9a' } as React.CSSProperties}>
                <FileCheck className="size-4 text-[#22ff9a]" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide uppercase font-mono text-white">
                  Remarks & Catatan Construction
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Catatan instruksi, perizinan & status pekerjaan lapangan
                </p>
              </div>
            </div>

            <div>
              <label className="label">Remarks & Catatan Lapangan</label>
              <textarea
                className="field min-h-[100px] rounded-xl font-mono text-xs"
                placeholder="Catatan tambahan teknis, perizinan, atau instruksi lapangan…"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          {/* BOTTOM STICKY ACTION BAR */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between p-4 rounded-2xl bg-[#05040d]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="btn-ghost text-xs"
            >
              <ArrowLeft className="size-4" />
              <span>Kembali</span>
            </button>

            <div className="flex items-center gap-3">
              {editingPlanId && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(editingPlanId)}
                  className="btn-ghost text-rose-400 hover:text-rose-300 hover:border-rose-500/50 text-xs"
                >
                  <Trash2 className="size-4" />
                  <span>Hapus</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary text-xs"
              >
                {isSaving ? (
                  <span>Menyimpan data…</span>
                ) : (
                  <>
                    <Check className="size-4" />
                    <span>{editingPlanId ? 'Simpan Perubahan' : 'Simpan Data Construction'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* VIEW MODE 2: DAFTAR CONSTRUCTION (LIST & FILTER CRUD)    */}
      {/* ======================================================== */}
      {viewMode === 'list' && (
        <div className="space-y-5">
          {/* Top KPI Cards for Quick Insight */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Total Data Rencana</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-white">{plans.length}</span>
                <span className="text-xs text-orange-400">ISP Terdaftar</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-orange-500/20 font-mono">
              <span className="text-[10px] text-orange-400 block uppercase">Total Volume Galian</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-orange-300">
                  {plans.reduce((acc, p) => acc + (p.panjangRelokasiGalian || 0), 0).toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-400">meter</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-purple-500/20 font-mono">
              <span className="text-[10px] text-purple-400 block uppercase">Total Kabel FO</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-purple-300">
                  {plans.reduce((acc, p) => acc + (p.foCables?.reduce((s, c) => s + (c.panjang || 0), 0) || 0), 0).toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-400">meter</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-cyan-500/20 font-mono">
              <span className="text-[10px] text-cyan-400 block uppercase">Total Kabel COAX</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-cyan-300">
                  {plans.reduce((acc, p) => acc + (p.panjangKabelCoax || 0), 0).toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-400">meter</span>
              </div>
            </div>
          </div>

          {/* Filter CRUD Bar */}
          <div className="panel !p-4 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari Operator ISP, Project ID, atau catatan konstruksi..."
                  className="field pl-10 pr-4 font-mono text-xs"
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

              {/* Filter Project ID */}
              <div className="relative">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="field text-xs font-mono"
                >
                  <option value="ALL">Semua Proyek Referensi</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.projectId}>
                      {p.projectId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Operator ISP */}
              <div className="relative">
                <select
                  value={selectedIsp}
                  onChange={(e) => setSelectedIsp(e.target.value)}
                  className="field text-xs font-mono"
                >
                  <option value="ALL">Semua Operator ISP</option>
                  {ISP_LIST_OPTIONS.map((isp) => (
                    <option key={isp} value={isp}>
                      {isp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Clousesing SAP */}
              <div className="relative">
                <select
                  value={selectedSapFilter}
                  onChange={(e) => setSelectedSapFilter(e.target.value)}
                  className="field text-xs font-mono"
                >
                  <option value="ALL">Semua Clousesing SAP</option>
                  {CLOUSESING_SAP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Progres Otomatis */}
              <div className="relative">
                <select
                  value={selectedProgressFilter}
                  onChange={(e) => setSelectedProgressFilter(e.target.value)}
                  className="field text-xs font-mono"
                >
                  <option value="ALL">Semua Status Progres</option>
                  <option value="DONE">Selesai 100%</option>
                  <option value="IN_PROGRESS">Dalam Proses</option>
                  <option value="NOT_STARTED">Belum Dimulai</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table of Construction Items */}
          <div className="panel !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Nama ISP</th>
                    <th className="py-3 px-3">Project Ref</th>
                    <th className="py-3 px-3 text-right">Galian Sipil</th>
                    <th className="py-3 px-3">Crossing & Jembatan</th>
                    <th className="py-3 px-3">Material Kabel</th>
                    <th className="py-3 px-3">HH / HB / MH & Infra</th>
                    <th className="py-3 px-3 text-center">Progres Otomatis (%)</th>
                    <th className="py-3 px-3 text-center">Dokumen PDF</th>
                    <th className="py-3 px-4 text-center">Aksi CRUD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <HardHat className="size-8 text-slate-600" />
                          <p className="font-semibold text-slate-300">Tidak ada rencana konstruksi yang cocok dengan filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan) => {
                      const totalFo = plan.foCables?.reduce((acc, c) => acc + (c.panjang || 0), 0) || 0;
                      const planHh = plan.manholes?.reduce((acc, m) => {
                        const { cat } = parseHhItem(m.tipe);
                        return cat === 'HH' ? acc + (m.unit || 0) : acc;
                      }, 0) || 0;
                      const planHb = plan.manholes?.reduce((acc, m) => {
                        const { cat } = parseHhItem(m.tipe);
                        return cat === 'HB' ? acc + (m.unit || 0) : acc;
                      }, 0) || 0;
                      const planMh = plan.manholes?.reduce((acc, m) => {
                        const { cat } = parseHhItem(m.tipe);
                        return cat === 'MH' ? acc + (m.unit || 0) : acc;
                      }, 0) || 0;
                      const totalPoles = plan.poles?.reduce((acc, p) => acc + (p.unit || 0), 0) || 0;
                      const totalGalvanis = plan.galvanis?.reduce((acc, g) => acc + (g.meter || 0), 0) || 0;

                      // Automated progress calculation fallbacks
                      const totalTargetGalian = (plan.panjangRelokasiGalian || 0) + (plan.borringAkses || 0) + (plan.crossingJalan || 0) + (plan.crossingJembatan || 0) + (plan.crossingTol || 0) + (plan.crossingKaliSungai || 0);
                      const galianPct = plan.galianProgressPercent !== undefined
                        ? plan.galianProgressPercent
                        : (totalTargetGalian > 0 ? 75 : 0);

                      const foPct = plan.pullingFoProgressPercent !== undefined
                        ? plan.pullingFoProgressPercent
                        : (totalFo > 0 ? 65 : 0);

                      const coaxPct = plan.pullingCoaxProgressPercent !== undefined
                        ? plan.pullingCoaxProgressPercent
                        : (plan.panjangKabelCoax > 0 ? 60 : 0);

                      return (
                        <tr
                          key={plan.id}
                          className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                          onClick={() => setViewingDetailPlan(plan)}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white group-hover:text-[#ff9f1c] transition-colors">
                              {plan.namaIsp}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Tgl BA: {plan.tanggalBaSurvey}
                            </div>
                            {plan.ispList && plan.ispList.length > 1 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {plan.ispList.map((item, idx) => (
                                  <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/10 text-pink-300 border border-pink-500/30 font-mono">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-3 font-mono">
                            <span className="text-cyan-400 font-semibold">{plan.projectId}</span>
                            {plan.clousesingSap && (
                              <div className="mt-1">
                                <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">
                                  SAP: {plan.clousesingSap}
                                </span>
                              </div>
                            )}
                            <div className="mt-0.5 flex flex-wrap gap-1">
                              {plan.labour && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-orange-950/40 border border-orange-500/30 text-orange-300">
                                  Lab: {plan.labour}
                                </span>
                              )}
                              {plan.contraction && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                                  {plan.contraction}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                            <div className="font-bold text-[#ff9f1c] tabular-nums">
                              {plan.panjangRelokasiGalian.toLocaleString('id-ID')} m
                            </div>
                            <div className="text-[10px] text-yellow-300">
                              Boring: {plan.borringAkses} m
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-[11px] font-mono whitespace-nowrap">
                            <div className="text-slate-300">
                              Jalan: <span className="text-cyan-300">{plan.crossingJalan}m</span> · Jembatan: <span className="text-cyan-300">{plan.crossingJembatan}m</span>
                            </div>
                            <div className="text-slate-400 mt-0.5">
                              Tol: <span className="text-red-300">{plan.crossingTol}m</span> · Kali: <span className="text-blue-300">{plan.crossingKaliSungai}m</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-[11px] font-mono whitespace-nowrap">
                            <div className="text-[#a855f7] font-semibold">
                              FO: {totalFo.toLocaleString('id-ID')} m
                            </div>
                            <div className="text-slate-400 mt-0.5">
                              COAX: {plan.panjangKabelCoax} m
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-[11px] font-mono whitespace-nowrap">
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="text-yellow-300 font-semibold">{planHh} HH</span>
                              <span className="text-slate-600">·</span>
                              <span className="text-amber-300 font-semibold">{planHb} HB</span>
                              <span className="text-slate-600">·</span>
                              <span className="text-yellow-400 font-semibold">{planMh} MH</span>
                            </div>
                            <div className="text-slate-400 mt-0.5 text-[10px]">
                              Tiang: <span className="text-cyan-300">{totalPoles} ea</span> · Galv: <span className="text-rose-300">{totalGalvanis}m</span>
                            </div>
                          </td>

                          {/* Progres Otomatis (%) Column */}
                          <td className="py-3.5 px-3 font-mono text-[11px] whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-orange-400">Galian:</span>
                                <span className="font-bold text-orange-300">{galianPct}%</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-purple-400">Pull FO:</span>
                                <span className="font-bold text-purple-300">{foPct}%</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-cyan-400">Pull COAX:</span>
                                <span className="font-bold text-cyan-300">{coaxPct}%</span>
                              </div>
                            </div>
                          </td>

                          {/* Dokumen 7 Berkas & Download */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {(() => {
                              const planDocs = [
                                plan.docKmz,
                                plan.docApdRelokasi || plan.apdIsp,
                                plan.docTimeline,
                                plan.docSuratPerintahRelokasi,
                                plan.docBaSurveyBersama || plan.baSurvey,
                                plan.docSuratPenunjukanVendor,
                                plan.docSuratRekomtek
                              ].filter(Boolean) as AttachedDocument[];

                              return (
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  {planDocs.length > 0 ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => onViewPdf(planDocs[0])}
                                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 transition-colors finger-click font-semibold flex items-center gap-1"
                                        title={`${planDocs.length} Berkas terupload: ${planDocs.map(d => d.fileName).join(', ')}`}
                                      >
                                        <FileCheck className="size-3 text-emerald-400" />
                                        <span>{planDocs.length}/7 Berkas</span>
                                      </button>
                                      {planDocs[0] && (
                                        <button
                                          type="button"
                                          onClick={() => triggerDownloadDocument(planDocs[0])}
                                          className="p-1 rounded text-emerald-400 hover:text-white bg-white/[0.04] hover:bg-emerald-500/20 border border-white/10 transition-colors finger-click"
                                          title={`Unduh ${planDocs[0].fileName}`}
                                        >
                                          <Download className="size-3" />
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 font-mono">0 Berkas</span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>

                          {/* Aksi CRUD */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditForm(plan)}
                                className="icon-btn"
                                style={{ '--glow': '#ff9f1c' } as React.CSSProperties}
                                title="Edit Data Construction"
                              >
                                <Edit className="size-3.5 text-[#ff9f1c]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(plan.id)}
                                className="icon-btn"
                                style={{ '--glow': '#ff3b5c' } as React.CSSProperties}
                                title="Hapus Data Construction"
                              >
                                <Trash2 className="size-3.5 text-rose-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DETAIL MODAL CARD GRID VIEW                              */}
      {/* ======================================================== */}
      {viewingDetailPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl panel !bg-[#05040d] border-white/20 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="neon-icon size-8" style={{ '--glow': '#ff9f1c' } as React.CSSProperties}>
                  <HardHat className="size-4 text-[#ff9f1c]" />
                </div>
                <div>
                  <span className="font-mono text-xs text-cyan-400">{viewingDetailPlan.projectId}</span>
                  <h4 className="text-base font-bold text-white">{viewingDetailPlan.namaIsp}</h4>
                </div>
              </div>
              <button
                onClick={() => setViewingDetailPlan(null)}
                className="icon-btn"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/10 text-slate-300">
              <strong className="text-white">Paket Proyek:</strong> {viewingDetailPlan.projectName}
            </div>

            {/* Status Project ID, SAP, Labour & Contraction */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
              <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                <span className="text-[10px] text-cyan-400 block font-semibold">CLOUSESING SAP (PROJECT ID)</span>
                <span className="text-xs font-bold text-cyan-200 mt-0.5 inline-block px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                  {viewingDetailPlan.clousesingSap || 'not yet'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-950/20 border border-orange-500/30">
                <span className="text-[10px] text-orange-400 block font-semibold">LABOUR (VOLUME PEKERJAAN)</span>
                <span className="text-xs font-bold text-orange-200 mt-0.5 inline-block px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/30">
                  {viewingDetailPlan.labour || 'not yet'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 block font-semibold">CONTRACTION (PEKERJAAN)</span>
                <span className="text-xs font-bold text-emerald-200 mt-0.5 inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                  {viewingDetailPlan.contraction || 'not started'}
                </span>
              </div>
            </div>

            {/* Status Logistik Material & Workflow Lapangan (8 Item) */}
            <div className="p-3 bg-purple-950/20 rounded-xl border border-purple-500/30 font-mono space-y-2">
              <span className="text-xs font-bold text-purple-300 block flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#a855f7]" />
                Status Material Kabel & Infrastruktur (8 Kontrol):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[9px] text-slate-400 block">PENGAMBILAN MATERIAL</span>
                  <span className="font-semibold text-purple-200">{viewingDetailPlan.pengambilanMaterial || 'not yet'}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[9px] text-slate-400 block">LOCATION MATERIAL</span>
                  <span className="font-semibold text-purple-200">{viewingDetailPlan.locationMaterial || 'warehouse ISP'}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[9px] text-slate-400 block">STATUS MATERIAL</span>
                  <span className="font-semibold text-purple-200">{viewingDetailPlan.material || 'not yet'}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[9px] text-slate-400 block">PULLING FO</span>
                  <span className="font-semibold text-purple-200">{viewingDetailPlan.statusPullingFo || 'not yet'}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[9px] text-slate-400 block">PULLING COAX</span>
                  <span className="font-semibold text-purple-200">{viewingDetailPlan.statusPullingCoax || 'not yet'}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[9px] text-slate-400 block">INSTAL HH, HB, MH</span>
                  <span className="font-semibold text-purple-200">{viewingDetailPlan.statusInstalMh || 'not yet'}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[9px] text-slate-400 block">POLE BERSAMA</span>
                  <span className="font-semibold text-purple-200">{viewingDetailPlan.statusPoleBersama || 'not yet'}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-[9px] text-slate-400 block">GALVANIS</span>
                  <span className="font-semibold text-purple-200">{viewingDetailPlan.statusGalvanis || 'not yet'}</span>
                </div>
              </div>
            </div>

            {/* Volume Galian Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono bg-white/[0.02] p-3 rounded-xl border border-white/10">
              <div>
                <span className="text-[10px] text-slate-500 block">GALIAN RELOKASI</span>
                <span className="text-sm font-bold text-orange-400">{viewingDetailPlan.panjangRelokasiGalian} m</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">BORING AKSES</span>
                <span className="text-sm font-bold text-yellow-400">{viewingDetailPlan.borringAkses} m</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">CROSSING JALAN</span>
                <span className="text-sm font-bold text-cyan-300">{viewingDetailPlan.crossingJalan} m</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">CROSSING JEMBATAN</span>
                <span className="text-sm font-bold text-purple-300">{viewingDetailPlan.crossingJembatan} m</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">CROSSING TOL</span>
                <span className="text-sm font-bold text-red-300">{viewingDetailPlan.crossingTol} m</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">CROSSING SUNGAI</span>
                <span className="text-sm font-bold text-blue-300">{viewingDetailPlan.crossingKaliSungai} m</span>
              </div>
            </div>

            {/* Material Kabel FO & COAX */}
            <div className="p-3 bg-white/[0.02] rounded-xl border border-purple-500/20 font-mono space-y-2">
              <span className="text-xs font-bold text-purple-300 block">Rincian Material Kabel FO & COAX:</span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {viewingDetailPlan.foCables?.map((c, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-purple-950/40 border border-purple-500/30 text-purple-200">
                    {c.tipe}: <strong>{c.panjang}m</strong>
                  </span>
                ))}
                <span className="px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-200">
                  Kabel COAX: <strong>{viewingDetailPlan.panjangKabelCoax}m</strong>
                </span>
              </div>
            </div>

            {/* Spesifikasi HH, HB, MH, Tiang Bersama & Galvanis (Dashboard Style) */}
            <div className="p-3.5 bg-[#091022] rounded-xl border border-yellow-500/40 font-mono space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-yellow-400" />
              <div className="flex items-center justify-between pb-2 border-b border-yellow-500/20">
                <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-yellow-400" />
                  Instalasi HH, HB, MH, Tiang Bersama & Galvanis (Sesuai Dashboard):
                </span>
                <span className="text-[10px] text-yellow-400/80">
                  {(viewingDetailPlan.manholes?.reduce((s, m) => s + (m.unit || 0), 0) || 0)} Unit Total
                </span>
              </div>

              {/* 3 Metric Cards like Dashboard */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-[11px]">
                {(() => {
                  const mHh = viewingDetailPlan.manholes?.reduce((s, m) => {
                    const { cat } = parseHhItem(m.tipe);
                    return cat === 'HH' ? s + (m.unit || 0) : s;
                  }, 0) || 0;
                  const mHb = viewingDetailPlan.manholes?.reduce((s, m) => {
                    const { cat } = parseHhItem(m.tipe);
                    return cat === 'HB' ? s + (m.unit || 0) : s;
                  }, 0) || 0;
                  const mMh = viewingDetailPlan.manholes?.reduce((s, m) => {
                    const { cat } = parseHhItem(m.tipe);
                    return cat === 'MH' ? s + (m.unit || 0) : s;
                  }, 0) || 0;
                  const mPoles = viewingDetailPlan.poles?.reduce((s, p) => s + (p.unit || 0), 0) || 0;
                  const mGalv = viewingDetailPlan.galvanis?.reduce((s, g) => s + (g.meter || 0), 0) || 0;

                  return (
                    <>
                      <div className="p-2 rounded bg-yellow-950/30 border border-yellow-500/30 text-center">
                        <span className="text-[10px] text-slate-400 block font-sans">Total HH</span>
                        <span className="font-bold text-yellow-300 text-sm tabular-nums">
                          {mHh} <span className="text-[9px] font-normal">unit</span>
                        </span>
                      </div>
                      <div className="p-2 rounded bg-amber-950/30 border border-amber-500/30 text-center">
                        <span className="text-[10px] text-slate-400 block font-sans">Total HB</span>
                        <span className="font-bold text-amber-300 text-sm tabular-nums">
                          {mHb} <span className="text-[9px] font-normal">unit</span>
                        </span>
                      </div>
                      <div className="p-2 rounded bg-yellow-950/30 border border-yellow-400/30 text-center">
                        <span className="text-[10px] text-slate-400 block font-sans">Total MH</span>
                        <span className="font-bold text-yellow-400 text-sm tabular-nums">
                          {mMh} <span className="text-[9px] font-normal">unit</span>
                        </span>
                      </div>
                      <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/30 text-center">
                        <span className="text-[10px] text-slate-400 block font-sans">Tiang / Pole</span>
                        <span className="font-bold text-cyan-300 text-sm tabular-nums">
                          {mPoles} <span className="text-[9px] font-normal">ea</span>
                        </span>
                      </div>
                      <div className="p-2 rounded bg-rose-950/30 border border-rose-500/30 text-center col-span-3 sm:col-span-1">
                        <span className="text-[10px] text-slate-400 block font-sans">Galvanis</span>
                        <span className="font-bold text-rose-300 text-sm tabular-nums">
                          {mGalv} <span className="text-[9px] font-normal">m</span>
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Badges of Individual Items */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-400">Rincian Manhole:</span>
                  {viewingDetailPlan.manholes && viewingDetailPlan.manholes.length > 0 ? (
                    viewingDetailPlan.manholes.map((m, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-yellow-950/40 border border-yellow-500/30 text-yellow-200">
                        {m.tipe}: <strong>{m.unit} unit</strong>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-[10px]">Tidak ada</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-400">Rincian Tiang & Galv:</span>
                  {viewingDetailPlan.poles?.map((p, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-200">
                      {p.tipe.replace('pole ', 'Tiang ')}: <strong>{p.unit} ea</strong>
                    </span>
                  ))}
                  {viewingDetailPlan.galvanis?.map((g, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-200">
                      Galvanis {g.tipe}: <strong>{g.meter}m</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Progres Otomatis Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-2.5 rounded-xl bg-orange-950/20 border border-orange-500/30">
                <span className="text-[10px] text-orange-400 block">GALIAN SIPIL (OTOMATIS)</span>
                <span className="text-base font-bold text-orange-300">
                  {viewingDetailPlan.galianProgressPercent ?? 75}%
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  {viewingDetailPlan.galianTahapanStatus || 'Dalam Proses'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30">
                <span className="text-[10px] text-purple-400 block">PULLING CABLE FO (OTOMATIS)</span>
                <span className="text-base font-bold text-purple-300">
                  {viewingDetailPlan.pullingFoProgressPercent ?? 65}%
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  {viewingDetailPlan.pullingFoStatus || 'Sebagian'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                <span className="text-[10px] text-cyan-400 block">PULLING COAX (OTOMATIS)</span>
                <span className="text-base font-bold text-cyan-300">
                  {viewingDetailPlan.pullingCoaxProgressPercent ?? 60}%
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  {viewingDetailPlan.pullingCoaxStatus || 'Sebagian'}
                </span>
              </div>
            </div>

            {/* 7 BERKAS RESMI SURVEY & DOKUMEN (DOWNLOAD PER DOKUMEN & KIRIM EMAIL) */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-cyan-500/30 space-y-3 font-mono">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <FileCheck className="size-4 text-emerald-400" />
                    <span>7 Berkas Survey, Dokumen & Catatan Proyek</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Dapat diunduh per berkas dokumen secara individual oleh penerima
                  </p>
                </div>


              </div>

              {/* Grid 7 Documents */}
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                  { title: '1. File KMZ Trase', doc: viewingDetailPlan.docKmz, type: 'KMZ' },
                  { title: '2. APD Relokasi', doc: viewingDetailPlan.docApdRelokasi || viewingDetailPlan.apdIsp, type: 'APD Relokasi' },
                  { title: '3. Timeline Pelaksana', doc: viewingDetailPlan.docTimeline, type: 'Timeline Pelaksana' },
                  { title: '4. Surat Perintah Relokasi', doc: viewingDetailPlan.docSuratPerintahRelokasi, type: 'Surat Perintah Relokasi (Dinas)' },
                  { title: '5. BA Survey Bersama', doc: viewingDetailPlan.docBaSurveyBersama || viewingDetailPlan.baSurvey, type: 'BA Survey Bersama' },
                  { title: '6. Surat Penunjukan Vendor', doc: viewingDetailPlan.docSuratPenunjukanVendor, type: 'Surat Penunjukan Vendor' },
                  { title: '7. Surat Rekomtek', doc: viewingDetailPlan.docSuratRekomtek, type: 'Surat Rekomtek' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                      item.doc
                        ? 'bg-black/40 border-emerald-500/30'
                        : 'bg-black/20 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <div className="p-1.5 rounded bg-black/60 border border-white/10 shrink-0">
                        {getDocumentIcon(item.type, item.doc?.fileName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-white truncate" title={item.title}>
                          {item.title}
                        </div>
                        {item.doc ? (
                          <div className="text-[10px] text-slate-400 truncate" title={item.doc.fileName}>
                            {item.doc.fileName} ({item.doc.fileSize})
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-500">Belum diunggah</div>
                        )}
                      </div>
                    </div>

                    {item.doc && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onViewPdf(item.doc!)}
                          className="p-1 rounded text-cyan-300 hover:text-white bg-cyan-950/40 border border-cyan-500/30 transition-colors finger-click"
                          title="Lihat Pratinjau Dokumen"
                        >
                          <Eye className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerDownloadDocument(item.doc!)}
                          className="px-2 py-1 rounded text-[10px] font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 transition-colors flex items-center gap-1 finger-click"
                          title={`Unduh ${item.doc.fileName}`}
                        >
                          <Download className="size-3" />
                          <span>Unduh</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks */}
            {viewingDetailPlan.remarks && (
              <div className="p-3 bg-white/[0.02] rounded-xl border border-white/10 font-mono text-slate-300 text-xs">
                <strong className="text-white block mb-1">Remarks:</strong>
                {viewingDetailPlan.remarks}
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingDetailPlan;
                    setViewingDetailPlan(null);
                    handleOpenEditForm(target);
                  }}
                  className="btn-primary text-xs"
                >
                  <Edit className="size-3.5" />
                  <span>Edit Rencana</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDetailPlan(null)}
                  className="btn-ghost text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRM DELETE MODAL                                     */}
      {/* ======================================================== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm panel !bg-[#05040d] border-rose-500/40 text-center">
            <div className="neon-icon size-12 mx-auto mb-3" style={{ '--glow': '#ff3b5c' } as React.CSSProperties}>
              <Trash2 className="size-6 text-[#ff3b5c]" />
            </div>
            <h4 className="text-base font-bold text-white">Hapus Data Construction?</h4>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Data construction ini akan dihapus permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="btn-ghost text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeletePlan(deleteConfirmId);
                  setDeleteConfirmId(null);
                  if (viewMode === 'form' && editingPlanId === deleteConfirmId) {
                    handleOpenNewForm();
                  }
                }}
                className="btn-primary !bg-gradient-to-r !from-rose-600 !to-orange-500 text-xs"
              >
                Ya, Hapus Sekarang
              </button>
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
        defaultGroupFilter={mainGroupFilter}
        showToast={onShowToast || (() => {})}
      />
    </div>
  );
};

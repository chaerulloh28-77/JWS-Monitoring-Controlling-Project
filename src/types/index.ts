export type ProjectCategory = 'GOV APJATEL' | 'GOV IPPJU' | 'GOV SJUT' | 'Project Internal' | 'INTERNAL';

export type ProjectStatus = 'cancel' | 'completed' | 'in progress' | 'not started' | 'review dinas';

export type QuarterOption = 'Q1 - 26' | 'Q2 - 26' | 'Q3 - 26' | 'Q4 - 26';

export type PoReleaseStatus = 'Released' | 'In Process' | 'Pending';

export type FoCableType = 
  | 'kabel FO 12'
  | 'kabel FO 24'
  | 'kabel FO 48'
  | 'kabel FO 96'
  | 'kabel FO 144'
  | 'kabel FO 288';

export type ManholeType = 
  | 'HH 60x60'
  | 'HH 70x70'
  | 'HH 80x80'
  | 'HH 90x90'
  | 'HH 100x100'
  | 'HH 110x110'
  | 'HH 120x120'
  | 'HB 60x60'
  | 'HB 70x70'
  | 'HB 80x80'
  | 'HB 90x90'
  | 'HB 100x100'
  | 'HB 110x110'
  | 'HB 120x120'
  | 'HB (Handbox)'
  | 'MH 60x60'
  | 'MH 70x70'
  | 'MH 80x80'
  | 'MH 90x90'
  | 'MH 100x100'
  | 'MH 110x110'
  | 'MH 120x120'
  | '60x60'
  | '70x70'
  | '80x80'
  | '90x90'
  | '100x100'
  | '110x110'
  | '120x120'
  | (string & {});

export type PoleType = 'pole 7' | 'pole 8' | 'pole 9';

export type GalvanisType = '2"' | '4"' | '6"';

export type ClousesingSapStatus =
  | 'not yet'
  | 'completed waspang mobilty'
  | 'submit document SAP'
  | 'approval completed SAP'
  | 'approval BALAP'
  | 'approval BAST'
  | 'Teco done';

export type LabourStatus = 'not yet' | 'release' | 'cancel';

export type ContractionStatus = 'not started' | 'in progress boring' | 'done';

export type PengambilanMaterialStatus = 'not yet' | 'warehouse ISP';

export type LocationMaterialStatus = 'warehouse ISP' | 'warehouse vendor';

export type MaterialStatus = 'not yet' | 'release' | 'cancel';

export type PullingFoWorkflowStatus = 'not yet' | 'in progress pulling' | 'done';

export type PullingCoaxWorkflowStatus = 'not yet' | 'no coax' | 'in progress pulling' | 'done';

export type InstalHandholeStatus = 'not yet' | 'In progress instal' | 'done';

export type PoleBersamaStatus = 'not yet' | 'In progress instal' | 'done';

export type GalvanisStatus = 'not yet' | 'In progress instal' | 'done';

export interface ProjectItem {
  id: string;
  projectId: string; // e.g., "PRJ-JWS-2026-001"
  projectCategory: ProjectCategory;
  projectDescription: string;
  areaLocation: string;
  panjangRelokasiGalian: number; // meter
  picIsp: string;
  picJws: string;
  projectStatus: ProjectStatus;
  quarter: QuarterOption;
  tanggalSuratDinas: string; // YYYY-MM-DD
  tanggalBaSurveyDinasAllIsp: string; // YYYY-MM-DD
  noPoRelease?: string;
  statusPoRelease?: PoReleaseStatus;
  tanggalPoRelease?: string;
  nilaiPo?: number;
  clousesingSap?: ClousesingSapStatus;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface CableFoSegment {
  id: string;
  tipe: FoCableType;
  panjang: number; // meter
}

export interface ManholeItem {
  id: string;
  tipe: ManholeType;
  unit: number; // unit count
}

export interface PoleItem {
  id: string;
  tipe: PoleType;
  meter: number; // meter
  unit: number; // unit count
}

export interface GalvanisItem {
  id: string;
  tipe: GalvanisType;
  meter: number; // meter
}

export type DocumentCategory =
  | 'KMZ'
  | 'APD Relokasi'
  | 'Timeline Pelaksana'
  | 'Surat Perintah Relokasi (Dinas)'
  | 'BA Survey Bersama'
  | 'Surat Penunjukan Vendor'
  | 'Surat Rekomtek'
  | 'APD ISP'
  | 'BA Survey';

export interface AttachedDocument {
  id?: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  fileDataUrl?: string; // base64 or DataURL content for download and preview
  documentType: DocumentCategory | string;
  signer?: string;
  status: 'Verified' | 'Pending Review' | 'Uploaded';
  notes?: string;
}

export interface EmailDispatchLog {
  id: string;
  ticketNo: string;
  recipientEmail: string;
  recipientName: string;
  ccEmail?: string;
  subject: string;
  messageBody?: string;
  dispatchedAt: string;
  status: 'Terkirim' | 'Terkonfirmasi' | 'Diproses';
  attachedDocuments: string[]; // list of file names
  requestSummary?: {
    labourStatus?: string;
    materialStatus?: string;
    pengambilanMaterial?: string;
    foMeters?: number;
    coaxMeters?: number;
    totalManholes?: number;
    totalPoles?: number;
    totalGalvanis?: number;
  };
}

export interface ConstructionPlanItem {
  id: string;
  projectId: string; // references ProjectItem.projectId
  projectName?: string;
  namaIsp: string; // e.g., "Telkom Indonesia", "Indosat Ooredoo", "XL Axiata", etc.
  ispList?: string[]; // multiple ISP items if added via "Tambah beberapa item"
  panjangRelokasiGalian: number; // meter
  borringAkses: number; // meter
  crossingJalan: number; // meter
  crossingJembatan: number; // meter
  crossingTol: number; // meter
  crossingKaliSungai: number; // meter
  
  // Cables
  foCables: CableFoSegment[];
  panjangKabelCoax: number; // meter
  
  // Infrastruktur Tambahan
  manholes: ManholeItem[];
  poles: PoleItem[];
  galvanis: GalvanisItem[];

  // Project ID Details
  clousesingSap?: ClousesingSapStatus;

  // Volume Pekerjaan Status
  labour?: LabourStatus;
  contraction?: ContractionStatus;

  // Material Kabel & Infrastruktur Status
  pengambilanMaterial?: PengambilanMaterialStatus;
  locationMaterial?: LocationMaterialStatus;
  material?: MaterialStatus;
  statusPullingFo?: PullingFoWorkflowStatus;
  statusPullingCoax?: PullingCoaxWorkflowStatus;
  statusInstalMh?: InstalHandholeStatus;
  statusPoleBersama?: PoleBersamaStatus;
  statusGalvanis?: GalvanisStatus;

  // Progress Otomatis (Galian Sipil, Pulling Cable FO, Pulling Cable COAX)
  galianSelesaiMeter?: number; // meter galian selesai
  galianProgressPercent?: number; // % perbandingan galian selesai / target
  galianTahapanStatus?: string; // e.g., 'Belum Dimulai', 'Dalam Proses', 'Selesai 100%'

  pullingFoMeterSelesai?: number; // meter penarikan FO selesai
  pullingFoProgressPercent?: number; // % otomatis meter selesai / target meter FO
  pullingFoStatus?: string; // e.g., 'Belum Mulai', 'Penarikan Sebagian', 'Selesai 100%'

  pullingCoaxMeterSelesai?: number; // meter penarikan COAX selesai
  pullingCoaxProgressPercent?: number; // % otomatis meter selesai / target meter COAX
  pullingCoaxStatus?: string; // e.g., 'Belum Mulai', 'Penarikan Sebagian', 'Selesai 100%'
  
  tanggalBaSurvey: string; // YYYY-MM-DD
  apdIsp?: AttachedDocument | null;
  baSurvey?: AttachedDocument | null;

  // 7 Berkas Survey, Dokumen & Catatan (Semua Jenis File)
  docKmz?: AttachedDocument | null;
  docApdRelokasi?: AttachedDocument | null;
  docTimeline?: AttachedDocument | null;
  docSuratPerintahRelokasi?: AttachedDocument | null;
  docBaSurveyBersama?: AttachedDocument | null;
  docSuratPenunjukanVendor?: AttachedDocument | null;
  docSuratRekomtek?: AttachedDocument | null;

  // Log Pengiriman Email Pengajuan Material & Labour
  emailDispatchLogs?: EmailDispatchLog[];

  remarks: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  email: string;
  name: string;
  role: string;
  department: string;
  avatarUrl?: string;
  lastLogin: string;
}

export type ActiveTab = 'overview' | 'projects' | 'construction' | 'survey_docs' | 'gis_map' | 'analytics';

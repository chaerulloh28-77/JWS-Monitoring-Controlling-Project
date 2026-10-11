import { ProjectItem, ConstructionPlanItem, AuthUser, AttachedDocument } from '../types';
import { INITIAL_PROJECTS, INITIAL_CONSTRUCTION_PLANS } from '../data/initialData';

const STORAGE_KEYS = {
  PROJECTS: 'jws_gov_projects_v1',
  CONSTRUCTION: 'jws_gov_construction_v1',
  AUTH: 'jws_gov_auth_session_v1',
  LAST_SYNC: 'jws_gov_last_sync_v1'
};

export const getStoredProjects = (): ProjectItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse projects from storage', err);
  }
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
  } catch (e) {
    console.warn('Could not store initial projects', e);
  }
  return INITIAL_PROJECTS;
};

export const saveProjects = (projects: ProjectItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (err) {
    console.warn('Failed to save projects to localStorage:', err);
  }
};

const sanitizeAttachedDoc = (doc?: AttachedDocument | null): AttachedDocument | null | undefined => {
  if (!doc) return doc;
  if (doc.fileDataUrl && doc.fileDataUrl.length > 50000) {
    return {
      ...doc,
      fileDataUrl: doc.fileDataUrl.slice(0, 100) + '...[file data truncated for storage]'
    };
  }
  return doc;
};

const sanitizePlansForStorage = (plans: ConstructionPlanItem[]): ConstructionPlanItem[] => {
  return plans.map(plan => ({
    ...plan,
    apdIsp: sanitizeAttachedDoc(plan.apdIsp),
    baSurvey: sanitizeAttachedDoc(plan.baSurvey),
    docKmz: sanitizeAttachedDoc(plan.docKmz),
    docApdRelokasi: sanitizeAttachedDoc(plan.docApdRelokasi),
    docTimeline: sanitizeAttachedDoc(plan.docTimeline),
    docSuratPerintahRelokasi: sanitizeAttachedDoc(plan.docSuratPerintahRelokasi),
    docBaSurveyBersama: sanitizeAttachedDoc(plan.docBaSurveyBersama),
    docSuratPenunjukanVendor: sanitizeAttachedDoc(plan.docSuratPenunjukanVendor),
    docSuratRekomtek: sanitizeAttachedDoc(plan.docSuratRekomtek)
  }));
};

export const getStoredConstructionPlans = (): ConstructionPlanItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONSTRUCTION);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse construction plans from storage', err);
  }
  try {
    localStorage.setItem(STORAGE_KEYS.CONSTRUCTION, JSON.stringify(INITIAL_CONSTRUCTION_PLANS));
  } catch (e) {
    console.warn('Could not store initial construction plans', e);
  }
  return INITIAL_CONSTRUCTION_PLANS;
};

export const saveConstructionPlans = (plans: ConstructionPlanItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONSTRUCTION, JSON.stringify(plans));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (err) {
    console.warn('Quota exceeded when saving construction plans. Sanitizing large file payloads...', err);
    try {
      const sanitized = sanitizePlansForStorage(plans);
      localStorage.setItem(STORAGE_KEYS.CONSTRUCTION, JSON.stringify(sanitized));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (retryErr) {
      console.warn('Failed to save construction plans even after sanitization:', retryErr);
    }
  }
};

export const getStoredAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse user auth', err);
  }
  return null;
};

export const setStoredAuthUser = (user: AuthUser | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
};

export const getLastSyncTime = (): string => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || new Date().toISOString();
};

export const resetToInitialData = (): { projects: ProjectItem[]; plans: ConstructionPlanItem[] } => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
  localStorage.setItem(STORAGE_KEYS.CONSTRUCTION, JSON.stringify(INITIAL_CONSTRUCTION_PLANS));
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  return {
    projects: INITIAL_PROJECTS,
    plans: INITIAL_CONSTRUCTION_PLANS
  };
};

export const exportDataAsJson = (): void => {
  const data = {
    appName: 'JWS Gov Monitoring & Controlling Project',
    exportDate: new Date().toISOString(),
    projects: getStoredProjects(),
    constructionPlans: getStoredConstructionPlans()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `JWS_Gov_Project_Export_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportProjectsCsv = (projects: ProjectItem[]): void => {
  const headers = [
    'Project ID',
    'Category',
    'Description',
    'Area Location',
    'Panjang Relokasi Galian (m)',
    'PIC ISP',
    'PIC JWS',
    'Status',
    'Quarter',
    'Tgl Surat Dinas',
    'Tgl BA Survey',
    'No PO Release',
    'Status PO Release',
    'Tgl PO Release',
    'Nilai PO (Rp)',
    'Remarks'
  ];

  const rows = projects.map(p => [
    `"${p.projectId}"`,
    `"${p.projectCategory}"`,
    `"${p.projectDescription.replace(/"/g, '""')}"`,
    `"${p.areaLocation.replace(/"/g, '""')}"`,
    p.panjangRelokasiGalian,
    `"${p.picIsp.replace(/"/g, '""')}"`,
    `"${p.picJws.replace(/"/g, '""')}"`,
    `"${p.projectStatus}"`,
    `"${p.quarter}"`,
    `"${p.tanggalSuratDinas}"`,
    `"${p.tanggalBaSurveyDinasAllIsp}"`,
    `"${p.noPoRelease || '-'}"`,
    `"${p.statusPoRelease || '-'}"`,
    `"${p.tanggalPoRelease || '-'}"`,
    p.nilaiPo || 0,
    `"${(p.remarks || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `JWS_Project_List_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportConstructionPlansCsv = (
  plans: ConstructionPlanItem[],
  projects: ProjectItem[],
  groupLabel?: 'GOV' | 'INTERNAL' | 'ALL'
): void => {
  const isPlanInternal = (plan: ConstructionPlanItem) => {
    const prj = projects.find((p) => p.projectId === plan.projectId);
    if (prj) {
      return prj.projectCategory === 'Project Internal' || prj.projectCategory === 'INTERNAL';
    }
    return plan.projectId?.startsWith('PRJ-INT') || false;
  };

  const filtered = plans.filter((p) => {
    if (groupLabel === 'GOV') return !isPlanInternal(p);
    if (groupLabel === 'INTERNAL') return isPlanInternal(p);
    return true;
  });

  const headers = [
    'ID Rencana',
    'Project ID',
    'Nama Proyek',
    'Kategori Group',
    'Operator ISP',
    'Panjang Relokasi Galian (m)',
    'Boring Akses (m)',
    'Crossing Jalan (m)',
    'Crossing Jembatan (m)',
    'Crossing Tol (m)',
    'Crossing Kali/Sungai (m)',
    'Panjang Kabel COAX (m)',
    'Detail FO Cables',
    'Detail HH/HB/MH',
    'Detail Pole/Tiang',
    'Detail Galvanis',
    'Status Clousesing SAP',
    'Status Labour',
    'Status Contraction',
    'Status Pengambilan Material',
    'Location Material',
    'Status Material',
    'Status Pulling FO',
    'Status Pulling COAX',
    'Status Instal MH/HH',
    'Status Pole Bersama',
    'Status Galvanis',
    'Galian Progress (%)',
    'Pulling FO Progress (%)',
    'Pulling COAX Progress (%)',
    'Tanggal BA Survey',
    'Remarks'
  ];

  const rows = filtered.map((p) => {
    const internal = isPlanInternal(p);
    const categoryGroup = internal ? 'Construction Internal' : 'Construction GOV';
    const matchedPrj = projects.find((prj) => prj.projectId === p.projectId);
    const prjName = p.projectName || matchedPrj?.projectDescription || '-';

    const foStr = p.foCables?.map((c) => `${c.tipe}: ${c.panjang}m`).join(' | ') || '-';
    const mhStr = p.manholes?.map((m) => `${m.tipe}: ${m.unit}U`).join(' | ') || '-';
    const poleStr = p.poles?.map((pl) => `${pl.tipe}: ${pl.unit}U`).join(' | ') || '-';
    const galvStr = p.galvanis?.map((g) => `Galv ${g.tipe}: ${g.meter}m`).join(' | ') || '-';

    return [
      `"${p.id}"`,
      `"${p.projectId}"`,
      `"${prjName.replace(/"/g, '""')}"`,
      `"${categoryGroup}"`,
      `"${p.namaIsp.replace(/"/g, '""')}"`,
      p.panjangRelokasiGalian || 0,
      p.borringAkses || 0,
      p.crossingJalan || 0,
      p.crossingJembatan || 0,
      p.crossingTol || 0,
      p.crossingKaliSungai || 0,
      p.panjangKabelCoax || 0,
      `"${foStr.replace(/"/g, '""')}"`,
      `"${mhStr.replace(/"/g, '""')}"`,
      `"${poleStr.replace(/"/g, '""')}"`,
      `"${galvStr.replace(/"/g, '""')}"`,
      `"${p.clousesingSap || '-'}"`,
      `"${p.labour || '-'}"`,
      `"${p.contraction || '-'}"`,
      `"${p.pengambilanMaterial || '-'}"`,
      `"${p.locationMaterial || '-'}"`,
      `"${p.material || '-'}"`,
      `"${p.statusPullingFo || '-'}"`,
      `"${p.statusPullingCoax || '-'}"`,
      `"${p.statusInstalMh || '-'}"`,
      `"${p.statusPoleBersama || '-'}"`,
      `"${p.statusGalvanis || '-'}"`,
      p.galianProgressPercent ?? 0,
      p.pullingFoProgressPercent ?? 0,
      p.pullingCoaxProgressPercent ?? 0,
      `"${p.tanggalBaSurvey || '-'}"`,
      `"${(p.remarks || '').replace(/"/g, '""')}"`
    ];
  });

  const titleSuffix = groupLabel === 'GOV' ? 'GOV' : groupLabel === 'INTERNAL' ? 'Internal' : 'Semua';
  const fileName = `JWS_Construction_${titleSuffix}_Export_${new Date().toISOString().slice(0, 10)}.csv`;

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

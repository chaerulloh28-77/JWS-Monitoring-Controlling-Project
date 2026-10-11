import { ProjectItem, ConstructionPlanItem } from '../types';

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'prj-001',
    projectId: 'PRJ-JWS-2026-001',
    projectCategory: 'GOV SJUT',
    projectDescription: 'Relokasi Saluran Udara Kabel Fiber Optik ke Sarana Jaringan Utilitas Terpadu Bawah Tanah Koridor Sudirman - Thamrin Tahap 3',
    areaLocation: 'Jl. Jenderal Sudirman - Bundaran HI (Sisi Barat & Timur)',
    panjangRelokasiGalian: 4850,
    picIsp: 'Bambang S. (Telkom Group)',
    picJws: 'Ir. Hendra Wijaya (Div. Proyek JWS)',
    projectStatus: 'in progress',
    quarter: 'Q1 - 26',
    tanggalSuratDinas: '2026-01-12',
    tanggalBaSurveyDinasAllIsp: '2026-01-20',
    noPoRelease: 'PO-JWS/2026/01-089',
    statusPoRelease: 'Released',
    tanggalPoRelease: '2026-01-25',
    nilaiPo: 4850000000,
    remarks: 'Pekerjaan galian malam hari pukul 22:00 - 05:00 WIB sesuai dispensasi Dishub. Koordinasi ducting bersama 8 operator APJATEL selesai.',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-02-15T10:30:00Z'
  },
  {
    id: 'prj-002',
    projectId: 'PRJ-JWS-2026-002',
    projectCategory: 'GOV APJATEL',
    projectDescription: 'Penyusunan Trase Jalur Kabel Bawah Tanah & Penertiban Tiang Tumpu Bersama Koridor Rasuna Said',
    areaLocation: 'Kawasan HR Rasuna Said - Kuningan Barat',
    panjangRelokasiGalian: 3200,
    picIsp: 'Dedi Kurniawan (Indosat Ooredoo)',
    picJws: 'Siti Rahmawati, S.T. (JWS Gov Control)',
    projectStatus: 'review dinas',
    quarter: 'Q2 - 26',
    tanggalSuratDinas: '2026-02-05',
    tanggalBaSurveyDinasAllIsp: '2026-02-18',
    noPoRelease: 'PO-JWS/2026/02-142',
    statusPoRelease: 'In Process',
    tanggalPoRelease: '2026-02-28',
    nilaiPo: 3120000000,
    remarks: 'Menunggu review izin pemanfaatan ruang milik jalan dari Dinas Bina Marga & Dinas Perhubungan.',
    createdAt: '2026-02-01T09:15:00Z',
    updatedAt: '2026-02-18T14:20:00Z'
  },
  {
    id: 'prj-003',
    projectId: 'PRJ-JWS-2026-003',
    projectCategory: 'GOV IPPJU',
    projectDescription: 'Integrasi Penerangan Jalan Umum Pintar & Smart Pole JWS Fiber Optic Backbone Tol Dalam Kota',
    areaLocation: 'Jl. Gatot Subroto Kav. 38 s/d Simpang Kuningan',
    panjangRelokasiGalian: 5120,
    picIsp: 'Andri Pradana (XL Axiata)',
    picJws: 'Rian Hidayat, M.T. (PM JWS Smart City)',
    projectStatus: 'completed',
    quarter: 'Q1 - 26',
    tanggalSuratDinas: '2026-01-08',
    tanggalBaSurveyDinasAllIsp: '2026-01-15',
    noPoRelease: 'PO-JWS/2026/01-034',
    statusPoRelease: 'Released',
    tanggalPoRelease: '2026-01-18',
    nilaiPo: 5200000000,
    remarks: 'Pekerjaan crossing jalan dan instalasi smart pole 9 meter selesai 100%. Telah serah terima pertama (PHO).',
    createdAt: '2026-01-05T07:30:00Z',
    updatedAt: '2026-03-01T16:45:00Z'
  },
  {
    id: 'prj-004',
    projectId: 'PRJ-JWS-2026-004',
    projectCategory: 'GOV SJUT',
    projectDescription: 'Ducting Bersama Microtrenching & Relokasi Kabel Udara Kawasan Transit Oriented Development (TOD) Dukuh Atas',
    areaLocation: 'Kawasan Stasiun BNI City - Dukuh Atas - Kendal',
    panjangRelokasiGalian: 2150,
    picIsp: 'Eko Prasetyo (Moratelindo)',
    picJws: 'Agus Santoso (Supervisi Lapangan JWS)',
    projectStatus: 'in progress',
    quarter: 'Q2 - 26',
    tanggalSuratDinas: '2026-02-10',
    tanggalBaSurveyDinasAllIsp: '2026-02-24',
    noPoRelease: 'PO-JWS/2026/02-198',
    statusPoRelease: 'Released',
    tanggalPoRelease: '2026-03-01',
    nilaiPo: 2450000000,
    remarks: 'Penggalian borring akses bawah rel kereta dan crossing jembatan Ciliwung sedang berlangsung.',
    createdAt: '2026-02-08T11:00:00Z',
    updatedAt: '2026-03-05T09:10:00Z'
  },
  {
    id: 'prj-005',
    projectId: 'PRJ-JWS-2026-005',
    projectCategory: 'GOV APJATEL',
    projectDescription: 'Peremajaan Tiang Fiber Optic & Penataan Kabel Gantung Segmen Tomang Raya',
    areaLocation: 'Jl. Tomang Raya s/d Roxy Mas',
    panjangRelokasiGalian: 1850,
    picIsp: 'Farhan Maulana (Biznet Networks)',
    picJws: 'Ir. Hendra Wijaya (Div. Proyek JWS)',
    projectStatus: 'not started',
    quarter: 'Q3 - 26',
    tanggalSuratDinas: '2026-03-02',
    tanggalBaSurveyDinasAllIsp: '2026-03-12',
    noPoRelease: 'PO-JWS/2026/03-210',
    statusPoRelease: 'Pending',
    tanggalPoRelease: '',
    nilaiPo: 1950000000,
    remarks: 'Jadwal kick-off meeting koordinasi teknis bersama seluruh anggota APJATEL direncanakan akhir bulan.',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-12T11:00:00Z'
  },
  {
    id: 'prj-006',
    projectId: 'PRJ-JWS-2026-006',
    projectCategory: 'GOV IPPJU',
    projectDescription: 'Revitalisasi Utilitas Lampu Penerangan & Sensor Lingkungan Koridor D.I. Panjaitan Bypass',
    areaLocation: 'Jl. D.I. Panjaitan - Cawang Interchange',
    panjangRelokasiGalian: 3750,
    picIsp: 'Lukman Hakim (LinkNet / First Media)',
    picJws: 'Siti Rahmawati, S.T. (JWS Gov Control)',
    projectStatus: 'review dinas',
    quarter: 'Q3 - 26',
    tanggalSuratDinas: '2026-03-04',
    tanggalBaSurveyDinasAllIsp: '2026-03-15',
    noPoRelease: 'PO-JWS/2026/03-245',
    statusPoRelease: 'In Process',
    tanggalPoRelease: '2026-03-20',
    nilaiPo: 3800000000,
    remarks: 'Revisi gambar kerja teknis utilitas crossing jalan layang non-tol.',
    createdAt: '2026-03-03T13:40:00Z',
    updatedAt: '2026-03-15T15:00:00Z'
  },
  {
    id: 'prj-007',
    projectId: 'PRJ-JWS-2026-007',
    projectCategory: 'GOV SJUT',
    projectDescription: 'Penataan Sarana Utilitas Terpadu Koridor TB Simatupang Sektor Cilandak - Fatmawati',
    areaLocation: 'Jl. TB Simatupang - MRT Fatmawati',
    panjangRelokasiGalian: 6200,
    picIsp: 'Rangga Daniswara (MyRepublic)',
    picJws: 'Rian Hidayat, M.T. (PM JWS Smart City)',
    projectStatus: 'in progress',
    quarter: 'Q4 - 26',
    tanggalSuratDinas: '2026-03-10',
    tanggalBaSurveyDinasAllIsp: '2026-03-22',
    noPoRelease: 'PO-JWS/2026/04-301',
    statusPoRelease: 'Released',
    tanggalPoRelease: '2026-03-25',
    nilaiPo: 6150000000,
    remarks: 'Pemasangan Manhole 100x100 dan borring subduct 6 way di bawah pedestrian.',
    createdAt: '2026-03-08T08:20:00Z',
    updatedAt: '2026-03-22T17:30:00Z'
  },
  {
    id: 'prj-008',
    projectId: 'PRJ-INT-2026-001',
    projectCategory: 'Project Internal',
    projectDescription: 'Pembangunan Core Network Fiber Optic & Data Center Interconnect Internal JWS',
    areaLocation: 'Head Office JWS Jakarta - Substation Central',
    panjangRelokasiGalian: 1500,
    picIsp: 'NOC JWS Internal',
    picJws: 'Agus Santoso (Network Infra JWS)',
    projectStatus: 'in progress',
    quarter: 'Q1 - 26',
    tanggalSuratDinas: '2026-01-15',
    tanggalBaSurveyDinasAllIsp: '2026-01-22',
    noPoRelease: 'PO-INT/2026/01-005',
    statusPoRelease: 'Released',
    tanggalPoRelease: '2026-01-28',
    nilaiPo: 1800000000,
    remarks: 'Pekerjaan internal peningkatan kapasitas backbone jaringan internal perusahaan.',
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z'
  },
  {
    id: 'prj-009',
    projectId: 'PRJ-INT-2026-002',
    projectCategory: 'Project Internal',
    projectDescription: 'Upgrade Infrastruktur Server & Redundansi FO Internal Wilayah Operasional Barat',
    areaLocation: 'Depot & Hub Operasional JWS Jakarta Barat',
    panjangRelokasiGalian: 950,
    picIsp: 'Divisi IT JWS',
    picJws: 'Siti Rahmawati, S.T. (JWS Control)',
    projectStatus: 'completed',
    quarter: 'Q2 - 26',
    tanggalSuratDinas: '2026-02-01',
    tanggalBaSurveyDinasAllIsp: '2026-02-10',
    noPoRelease: 'PO-INT/2026/02-012',
    statusPoRelease: 'Released',
    tanggalPoRelease: '2026-02-15',
    nilaiPo: 1250000000,
    remarks: 'Selesai 100% untuk sistem redundansi konektivitas internal JWS.',
    createdAt: '2026-01-25T09:00:00Z',
    updatedAt: '2026-02-20T14:00:00Z'
  }
];

export const INITIAL_CONSTRUCTION_PLANS: ConstructionPlanItem[] = [
  {
    id: 'cp-001',
    projectId: 'PRJ-JWS-2026-001',
    projectName: 'Relokasi Saluran Udara Kabel Fiber Optik ke SJUT Sudirman - Thamrin',
    namaIsp: 'PT Telkom Indonesia (Persero) Tbk',
    panjangRelokasiGalian: 4850,
    borringAkses: 820,
    crossingJalan: 340,
    crossingJembatan: 120,
    crossingTol: 0,
    crossingKaliSungai: 95,
    foCables: [
      { id: 'fo-1', tipe: 'kabel FO 96', panjang: 3200 },
      { id: 'fo-2', tipe: 'kabel FO 144', panjang: 1800 },
      { id: 'fo-3', tipe: 'kabel FO 288', panjang: 2400 }
    ],
    panjangKabelCoax: 450,
    manholes: [
      { id: 'mh-1', tipe: 'MH 100x100', unit: 24 },
      { id: 'mh-2', tipe: 'HH 80x80', unit: 18 },
      { id: 'hb-1', tipe: 'HB (Handbox)', unit: 12 },
      { id: 'mh-3', tipe: 'MH 120x120', unit: 6 }
    ],
    poles: [
      { id: 'pl-1', tipe: 'pole 9', meter: 9, unit: 12 },
      { id: 'pl-2', tipe: 'pole 8', meter: 8, unit: 8 }
    ],
    galvanis: [
      { id: 'gv-1', tipe: '4"', meter: 450 },
      { id: 'gv-2', tipe: '6"', meter: 220 }
    ],
    clousesingSap: 'approval completed SAP',
    labour: 'release',
    contraction: 'in progress boring',
    pengambilanMaterial: 'warehouse ISP',
    locationMaterial: 'warehouse ISP',
    material: 'release',
    statusPullingFo: 'in progress pulling',
    statusPullingCoax: 'in progress pulling',
    statusInstalMh: 'In progress instal',
    statusPoleBersama: 'In progress instal',
    statusGalvanis: 'In progress instal',
    tanggalBaSurvey: '2026-01-20',
    apdIsp: {
      fileName: 'APD_ISP_TELKOM_SUDIRMAN_REV3.pdf',
      fileSize: '4.8 MB',
      uploadedAt: '2026-01-22 14:15',
      documentType: 'APD ISP',
      signer: 'VP Network Infrastructure PT Telkom',
      status: 'Verified'
    },
    baSurvey: {
      fileName: 'BA_SURVEY_LAPANGAN_DINAS_JWS_ALL_ISP.pdf',
      fileSize: '6.2 MB',
      uploadedAt: '2026-01-21 16:30',
      documentType: 'BA Survey Bersama',
      signer: 'Kepala Dinas Bina Marga DKI & Ketua APJATEL',
      status: 'Verified'
    },
    docKmz: {
      fileName: 'TRASE_GEOSPASIAL_SUDIRMAN_REV4.kmz',
      fileSize: '1.4 MB',
      uploadedAt: '2026-01-22 11:20',
      documentType: 'KMZ',
      signer: 'GIS Specialist PT Telkom',
      status: 'Verified'
    },
    docApdRelokasi: {
      fileName: 'APD_RELOKASI_UTILITAS_SUDIRMAN_2026.pdf',
      fileSize: '5.2 MB',
      uploadedAt: '2026-01-22 14:15',
      documentType: 'APD Relokasi',
      signer: 'VP Network Infrastructure PT Telkom',
      status: 'Verified'
    },
    docTimeline: {
      fileName: 'TIMELINE_KURVAS_PELAKSANA_SUDIRMAN.xlsx',
      fileSize: '820 KB',
      uploadedAt: '2026-01-23 09:30',
      documentType: 'Timeline Pelaksana',
      signer: 'Project Manager Pelaksana JWS',
      status: 'Verified'
    },
    docSuratPerintahRelokasi: {
      fileName: 'SURAT_PERINTAH_RELOKASI_DINAS_BM_NO142.pdf',
      fileSize: '2.1 MB',
      uploadedAt: '2026-01-18 10:00',
      documentType: 'Surat Perintah Relokasi (Dinas)',
      signer: 'Kepala Dinas Bina Marga DKI Jakarta',
      status: 'Verified'
    },
    docBaSurveyBersama: {
      fileName: 'BA_SURVEY_BERSAMA_DINAS_ALL_ISP.pdf',
      fileSize: '6.2 MB',
      uploadedAt: '2026-01-21 16:30',
      documentType: 'BA Survey Bersama',
      signer: 'Tim Gabungan Dinas & Seluruh Operator',
      status: 'Verified'
    },
    docSuratPenunjukanVendor: {
      fileName: 'SPK_PENUNJUKAN_VENDOR_KONTRAKTOR_CKT.pdf',
      fileSize: '3.4 MB',
      uploadedAt: '2026-01-23 15:45',
      documentType: 'Surat Penunjukan Vendor',
      signer: 'Direktur Operasional PT CKT',
      status: 'Verified'
    },
    docSuratRekomtek: {
      fileName: 'REKOMTEK_DINAS_BINA_MARGA_DKI_NO88.pdf',
      fileSize: '1.9 MB',
      uploadedAt: '2026-01-19 13:10',
      documentType: 'Surat Rekomtek',
      signer: 'Bidang Utilitas Dinas Bina Marga DKI',
      status: 'Verified'
    },
    emailDispatchLogs: [
      {
        id: 'disp-001',
        ticketNo: 'REQ-ML-2026-0042',
        recipientEmail: 'warehouse.isp@jws-dki.id',
        recipientName: 'Gudang ISP & Tim Pengadaan Labour',
        ccEmail: 'supervisor@telkom.co.id',
        subject: '[PENGAJUAN MATERIAL & LABOUR] - PRJ-JWS-2026-001 - PT Telkom Indonesia',
        dispatchedAt: '2026-01-24 10:15',
        status: 'Terkirim',
        attachedDocuments: [
          'TRASE_GEOSPASIAL_SUDIRMAN_REV4.kmz',
          'APD_RELOKASI_UTILITAS_SUDIRMAN_2026.pdf',
          'TIMELINE_KURVAS_PELAKSANA_SUDIRMAN.xlsx',
          'SURAT_PERINTAH_RELOKASI_DINAS_BM_NO142.pdf',
          'BA_SURVEY_BERSAMA_DINAS_ALL_ISP.pdf',
          'SPK_PENUNJUKAN_VENDOR_KONTRAKTOR_CKT.pdf',
          'REKOMTEK_DINAS_BINA_MARGA_DKI_NO88.pdf'
        ],
        requestSummary: {
          labourStatus: 'release',
          materialStatus: 'release',
          pengambilanMaterial: 'warehouse ISP',
          foMeters: 5000,
          coaxMeters: 650,
          totalManholes: 48,
          totalPoles: 12,
          totalGalvanis: 670
        }
      }
    ],
    remarks: 'Progress galian microtrenching 78%. Sisa pekerjaan penyambungan (splicing) pada Manhole MH-14.',
    createdAt: '2026-01-22T08:00:00Z',
    updatedAt: '2026-02-18T10:00:00Z'
  },
  {
    id: 'cp-002',
    projectId: 'PRJ-JWS-2026-001',
    projectName: 'Relokasi Saluran Udara Kabel Fiber Optik ke SJUT Sudirman - Thamrin',
    namaIsp: 'PT Indosat Ooredoo Hutchison Tbk',
    panjangRelokasiGalian: 3100,
    borringAkses: 450,
    crossingJalan: 180,
    crossingJembatan: 60,
    crossingTol: 0,
    crossingKaliSungai: 40,
    foCables: [
      { id: 'fo-4', tipe: 'kabel FO 48', panjang: 2100 },
      { id: 'fo-5', tipe: 'kabel FO 96', panjang: 1500 }
    ],
    panjangKabelCoax: 200,
    manholes: [
      { id: 'mh-4', tipe: 'HH 80x80', unit: 16 },
      { id: 'hb-2', tipe: 'HB (Handbox)', unit: 8 },
      { id: 'mh-5', tipe: 'MH 90x90', unit: 8 }
    ],
    poles: [
      { id: 'pl-3', tipe: 'pole 8', meter: 8, unit: 10 }
    ],
    galvanis: [
      { id: 'gv-3', tipe: '4"', meter: 310 }
    ],
    clousesingSap: 'submit document SAP',
    labour: 'release',
    contraction: 'in progress boring',
    pengambilanMaterial: 'warehouse ISP',
    locationMaterial: 'warehouse ISP',
    material: 'release',
    statusPullingFo: 'in progress pulling',
    statusPullingCoax: 'in progress pulling',
    statusInstalMh: 'In progress instal',
    statusPoleBersama: 'In progress instal',
    statusGalvanis: 'In progress instal',
    tanggalBaSurvey: '2026-01-20',
    apdIsp: {
      fileName: 'APD_INDOSAT_SUDIRMAN_FINAL.pdf',
      fileSize: '3.9 MB',
      uploadedAt: '2026-01-23 10:20',
      documentType: 'APD ISP',
      signer: 'Head of Rollout West Java & DKI Indosat',
      status: 'Verified'
    },
    baSurvey: {
      fileName: 'BA_SURVEY_INDOSAT_DINAS_2026.pdf',
      fileSize: '5.1 MB',
      uploadedAt: '2026-01-21 16:30',
      documentType: 'BA Survey',
      signer: 'Tim Pokja SJUT JWS',
      status: 'Verified'
    },
    remarks: 'Menunggu slot penarikan kabel di subduct 3 warna oranye.',
    createdAt: '2026-01-23T09:30:00Z',
    updatedAt: '2026-02-12T11:20:00Z'
  },
  {
    id: 'cp-003',
    projectId: 'PRJ-JWS-2026-003',
    projectName: 'Integrasi Penerangan Jalan Umum Pintar & Smart Pole JWS FO Tol Dalam Kota',
    namaIsp: 'PT XL Axiata Tbk',
    panjangRelokasiGalian: 5120,
    borringAkses: 1100,
    crossingJalan: 480,
    crossingJembatan: 220,
    crossingTol: 380,
    crossingKaliSungai: 150,
    foCables: [
      { id: 'fo-6', tipe: 'kabel FO 96', panjang: 4200 },
      { id: 'fo-7', tipe: 'kabel FO 144', panjang: 2800 },
      { id: 'fo-8', tipe: 'kabel FO 288', panjang: 3500 }
    ],
    panjangKabelCoax: 680,
    manholes: [
      { id: 'mh-6', tipe: '100x100', unit: 32 },
      { id: 'mh-7', tipe: '110x110', unit: 12 },
      { id: 'mh-8', tipe: '120x120', unit: 8 }
    ],
    poles: [
      { id: 'pl-4', tipe: 'pole 9', meter: 9, unit: 28 },
      { id: 'pl-5', tipe: 'pole 7', meter: 7, unit: 14 }
    ],
    galvanis: [
      { id: 'gv-4', tipe: '4"', meter: 620 },
      { id: 'gv-5', tipe: '6"', meter: 410 },
      { id: 'gv-6', tipe: '2"', meter: 300 }
    ],
    clousesingSap: 'approval BALAP',
    labour: 'release',
    contraction: 'done',
    pengambilanMaterial: 'warehouse ISP',
    locationMaterial: 'warehouse ISP',
    material: 'release',
    statusPullingFo: 'done',
    statusPullingCoax: 'done',
    statusInstalMh: 'done',
    statusPoleBersama: 'done',
    statusGalvanis: 'done',
    tanggalBaSurvey: '2026-01-15',
    apdIsp: {
      fileName: 'APD_XL_AXIATA_GATSU_OFFICIAL.pdf',
      fileSize: '7.4 MB',
      uploadedAt: '2026-01-18 11:15',
      documentType: 'APD ISP',
      signer: 'Chief Technology Officer PT XL Axiata Tbk',
      status: 'Verified'
    },
    baSurvey: {
      fileName: 'BA_SURVEY_GATSU_JWS_DISNAKER_DISHUB.pdf',
      fileSize: '8.1 MB',
      uploadedAt: '2026-01-16 14:00',
      documentType: 'BA Survey',
      signer: 'Dinas Bina Marga & Jasa Marga Tol',
      status: 'Verified'
    },
    remarks: 'Semua kabel udara telah dipotong dan dialihkan ke ducting pipa HDPE bawah tanah.',
    createdAt: '2026-01-17T09:00:00Z',
    updatedAt: '2026-03-01T16:00:00Z'
  },
  {
    id: 'cp-004',
    projectId: 'PRJ-JWS-2026-004',
    projectName: 'Ducting Bersama Microtrenching & Relokasi Kabel Udara TOD Dukuh Atas',
    namaIsp: 'PT Mora Telematika Indonesia (Moratelindo)',
    panjangRelokasiGalian: 2150,
    borringAkses: 680,
    crossingJalan: 190,
    crossingJembatan: 140,
    crossingTol: 0,
    crossingKaliSungai: 110,
    foCables: [
      { id: 'fo-9', tipe: 'kabel FO 48', panjang: 1800 },
      { id: 'fo-10', tipe: 'kabel FO 96', panjang: 1200 }
    ],
    panjangKabelCoax: 150,
    manholes: [
      { id: 'mh-9', tipe: '70x70', unit: 14 },
      { id: 'mh-10', tipe: '80x80', unit: 10 }
    ],
    poles: [
      { id: 'pl-6', tipe: 'pole 8', meter: 8, unit: 6 }
    ],
    galvanis: [
      { id: 'gv-7', tipe: '4"', meter: 280 }
    ],
    clousesingSap: 'completed waspang mobilty',
    labour: 'release',
    contraction: 'in progress boring',
    pengambilanMaterial: 'warehouse ISP',
    locationMaterial: 'warehouse vendor',
    material: 'release',
    statusPullingFo: 'in progress pulling',
    statusPullingCoax: 'in progress pulling',
    statusInstalMh: 'In progress instal',
    statusPoleBersama: 'In progress instal',
    statusGalvanis: 'In progress instal',
    tanggalBaSurvey: '2026-02-24',
    apdIsp: {
      fileName: 'APD_MORATEL_DUKUHATAS_APJATEL.pdf',
      fileSize: '3.6 MB',
      uploadedAt: '2026-02-26 13:40',
      documentType: 'APD ISP',
      signer: 'Project Director PT Moratelindo',
      status: 'Verified'
    },
    baSurvey: {
      fileName: 'BA_SURVEY_TOD_DUKUH_ATAS_2026.pdf',
      fileSize: '4.7 MB',
      uploadedAt: '2026-02-25 15:10',
      documentType: 'BA Survey',
      signer: 'PT MRT Jakarta & JWS Pengawas',
      status: 'Verified'
    },
    remarks: 'Pekerjaan crossing Ciliwung pipa galvanis 4 inch terpasang rapi di samping jembatan.',
    createdAt: '2026-02-25T10:00:00Z',
    updatedAt: '2026-03-05T14:30:00Z'
  },
  {
    id: 'cp-005',
    projectId: 'PRJ-JWS-2026-002',
    projectName: 'Penyusunan Trase Jalur Kabel Bawah Tanah Koridor Rasuna Said',
    namaIsp: 'PT Biznet Gio Nusantara',
    panjangRelokasiGalian: 2800,
    borringAkses: 520,
    crossingJalan: 210,
    crossingJembatan: 45,
    crossingTol: 0,
    crossingKaliSungai: 60,
    foCables: [
      { id: 'fo-11', tipe: 'kabel FO 24', panjang: 950 },
      { id: 'fo-12', tipe: 'kabel FO 48', panjang: 1600 }
    ],
    panjangKabelCoax: 90,
    manholes: [
      { id: 'mh-11', tipe: 'HH 60x60', unit: 12 },
      { id: 'hb-5', tipe: 'HB (Handbox)', unit: 6 },
      { id: 'mh-12', tipe: 'HH 70x70', unit: 8 },
      { id: 'mh-13', tipe: 'MH 100x100', unit: 6 }
    ],
    poles: [
      { id: 'pl-7', tipe: 'pole 7', meter: 7, unit: 8 }
    ],
    galvanis: [
      { id: 'gv-8', tipe: '2"', meter: 180 }
    ],
    clousesingSap: 'not yet',
    labour: 'not yet',
    contraction: 'not started',
    pengambilanMaterial: 'warehouse ISP',
    locationMaterial: 'warehouse ISP',
    material: 'not yet',
    statusPullingFo: 'not yet',
    statusPullingCoax: 'not yet',
    statusInstalMh: 'not yet',
    statusPoleBersama: 'not yet',
    statusGalvanis: 'not yet',
    tanggalBaSurvey: '2026-02-18',
    apdIsp: {
      fileName: 'APD_BIZNET_RASUNA_SAID_2026.pdf',
      fileSize: '2.9 MB',
      uploadedAt: '2026-02-20 09:15',
      documentType: 'APD ISP',
      signer: 'Project Manager Biznet Networks',
      status: 'Verified'
    },
    baSurvey: {
      fileName: 'BA_SURVEY_RASUNA_SAID_APJATEL.pdf',
      fileSize: '5.4 MB',
      uploadedAt: '2026-02-19 11:00',
      documentType: 'BA Survey',
      signer: 'Ketua Tim Pengawas APJATEL',
      status: 'Verified'
    },
    remarks: 'Kesiapan material pipa subduct dan kabel FO 48 core telah diverifikasi di gudang.',
    createdAt: '2026-02-20T08:30:00Z',
    updatedAt: '2026-02-28T16:00:00Z'
  },
  {
    id: 'cp-006',
    projectId: 'PRJ-JWS-2026-005',
    projectName: 'Peremajaan Tiang Fiber Optic & Penataan Kabel Gantung Segmen Tomang Raya',
    namaIsp: 'PT Biznet Gio Nusantara',
    panjangRelokasiGalian: 1850,
    borringAkses: 380,
    crossingJalan: 140,
    crossingJembatan: 80,
    crossingTol: 0,
    crossingKaliSungai: 45,
    foCables: [
      { id: 'fo-13', tipe: 'kabel FO 12', panjang: 420 },
      { id: 'fo-14', tipe: 'kabel FO 24', panjang: 650 },
      { id: 'fo-15', tipe: 'kabel FO 48', panjang: 780 }
    ],
    panjangKabelCoax: 80,
    manholes: [
      { id: 'mh-14', tipe: 'HH 60x60', unit: 8 },
      { id: 'hb-6', tipe: 'HB (Handbox)', unit: 4 },
      { id: 'mh-15', tipe: 'MH 90x90', unit: 6 }
    ],
    poles: [
      { id: 'pl-8', tipe: 'pole 8', meter: 8, unit: 16 }
    ],
    galvanis: [
      { id: 'gv-9', tipe: '2"', meter: 140 }
    ],
    clousesingSap: 'submit document SAP',
    labour: 'release',
    contraction: 'in progress boring',
    pengambilanMaterial: 'warehouse ISP',
    locationMaterial: 'warehouse vendor',
    material: 'release',
    statusPullingFo: 'in progress pulling',
    statusPullingCoax: 'in progress pulling',
    statusInstalMh: 'In progress instal',
    statusPoleBersama: 'In progress instal',
    statusGalvanis: 'In progress instal',
    tanggalBaSurvey: '2026-03-12',
    apdIsp: null,
    baSurvey: null,
    remarks: 'Penyesuaian tiang tumpu bersama segmen simpang flyover Tomang.',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-12T11:00:00Z'
  },
  {
    id: 'cp-007',
    projectId: 'PRJ-JWS-2026-006',
    projectName: 'Revitalisasi Utilitas Lampu Penerangan & Sensor Lingkungan Koridor D.I. Panjaitan Bypass',
    namaIsp: 'PT Link Net Tbk (First Media)',
    panjangRelokasiGalian: 3750,
    borringAkses: 750,
    crossingJalan: 280,
    crossingJembatan: 110,
    crossingTol: 190,
    crossingKaliSungai: 70,
    foCables: [
      { id: 'fo-16', tipe: 'kabel FO 48', panjang: 1500 },
      { id: 'fo-17', tipe: 'kabel FO 96', panjang: 2250 }
    ],
    panjangKabelCoax: 240,
    manholes: [
      { id: 'mh-16', tipe: 'HH 80x80', unit: 18 },
      { id: 'hb-7', tipe: 'HB (Handbox)', unit: 9 },
      { id: 'mh-17', tipe: 'MH 100x100', unit: 12 }
    ],
    poles: [
      { id: 'pl-9', tipe: 'pole 9', meter: 9, unit: 22 }
    ],
    galvanis: [
      { id: 'gv-10', tipe: '4"', meter: 360 }
    ],
    clousesingSap: 'approval BAST',
    labour: 'release',
    contraction: 'done',
    pengambilanMaterial: 'warehouse ISP',
    locationMaterial: 'warehouse ISP',
    material: 'release',
    statusPullingFo: 'done',
    statusPullingCoax: 'done',
    statusInstalMh: 'done',
    statusPoleBersama: 'done',
    statusGalvanis: 'done',
    tanggalBaSurvey: '2026-03-15',
    apdIsp: null,
    baSurvey: null,
    remarks: 'Trase bawah pedestrian terpadu dan crossing jalan bypass.',
    createdAt: '2026-03-03T13:40:00Z',
    updatedAt: '2026-03-15T15:00:00Z'
  },
  {
    id: 'cp-008',
    projectId: 'PRJ-JWS-2026-007',
    projectName: 'Penataan Sarana Utilitas Terpadu Koridor TB Simatupang Sektor Cilandak - Fatmawati',
    namaIsp: 'PT Remala Abadi Tbk',
    panjangRelokasiGalian: 6200,
    borringAkses: 1450,
    crossingJalan: 520,
    crossingJembatan: 180,
    crossingTol: 320,
    crossingKaliSungai: 130,
    foCables: [
      { id: 'fo-18', tipe: 'kabel FO 24', panjang: 800 },
      { id: 'fo-19', tipe: 'kabel FO 48', panjang: 2100 },
      { id: 'fo-20', tipe: 'kabel FO 96', panjang: 3300 }
    ],
    panjangKabelCoax: 310,
    manholes: [
      { id: 'mh-18', tipe: 'HH 80x80', unit: 26 },
      { id: 'hb-8', tipe: 'HB (Handbox)', unit: 14 },
      { id: 'mh-19', tipe: 'MH 110x110', unit: 20 },
      { id: 'mh-20', tipe: 'MH 120x120', unit: 8 }
    ],
    poles: [
      { id: 'pl-10', tipe: 'pole 9', meter: 9, unit: 34 }
    ],
    galvanis: [
      { id: 'gv-11', tipe: '6"', meter: 520 }
    ],
    clousesingSap: 'Teco done',
    labour: 'release',
    contraction: 'done',
    pengambilanMaterial: 'warehouse ISP',
    locationMaterial: 'warehouse ISP',
    material: 'release',
    statusPullingFo: 'done',
    statusPullingCoax: 'done',
    statusInstalMh: 'done',
    statusPoleBersama: 'done',
    statusGalvanis: 'done',
    tanggalBaSurvey: '2026-03-22',
    apdIsp: null,
    baSurvey: null,
    remarks: 'Ducting bersama koridor MRT Fatmawati - TB Simatupang.',
    createdAt: '2026-03-08T08:20:00Z',
    updatedAt: '2026-03-22T17:30:00Z'
  }
];

export const ISP_LIST_OPTIONS = [
  'PT Telkom Indonesia (Persero) Tbk',
  'PT Indosat Ooredoo Hutchison Tbk',
  'PT XL Axiata Tbk',
  'PT Smartfren Telecom Tbk',
  'PT Biznet Gio Nusantara',
  'PT Mora Telematika Indonesia (Moratelindo)',
  'PT Link Net Tbk (First Media)',
  'PT MNC Kabel Mediacom (MNC Play)',
  'PT Mega Akses Persada (FiberStar)',
  'PT Iforte Solusi Infotek',
  'PT Trans Hybrid Communication',
  'PT Remala Abadi Tbk'
];

import React from 'react';
import { Globe2, FileSpreadsheet, Archive, Layers, FileText } from 'lucide-react';
import { AttachedDocument } from '../types';

export const triggerDownloadDocument = (doc: AttachedDocument) => {
  const link = window.document.createElement('a');
  if (doc.fileDataUrl) {
    link.href = doc.fileDataUrl;
  } else {
    // Generate valid downloadable blob content
    const sampleContent =
      `=================================================================\n` +
      `DOKUMEN RESMI JWS COMMAND CENTER & DINAS BINA MARGA PROVINSI DKI\n` +
      `SISTEM KOORDINASI & PENGAJUAN LOGISTIK MATERIAL & LABOUR 2026\n` +
      `=================================================================\n\n` +
      `Jenis Dokumen   : ${doc.documentType}\n` +
      `Nama Berkas     : ${doc.fileName}\n` +
      `Ukuran Berkas   : ${doc.fileSize}\n` +
      `Tanggal Unggah  : ${doc.uploadedAt}\n` +
      `Status Validasi : ${doc.status}\n` +
      `Penandatangan   : ${doc.signer || 'Tim Gabungan Dinas & Operator ISP'}\n\n` +
      `Keterangan:\n` +
      `Dokumen ini diterbitkan dan diarsipkan secara digital melalui JWS Command Center\n` +
      `sebagai syarat resmi permohonan release material kabel/infrastruktur dan izin kerja labour.\n` +
      `-----------------------------------------------------------------\n` +
      `Pusat Data Relokasi Utilitas Terpadu (SJUT/APJATEL/IPPJU DKI Jakarta)\n`;
    const blob = new Blob([sampleContent], { type: 'application/octet-stream' });
    link.href = URL.createObjectURL(blob);
  }
  link.download = doc.fileName;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
};

export const getDocumentIcon = (docType: string, fileName?: string) => {
  const ext = (fileName || '').split('.').pop()?.toLowerCase();
  if (docType === 'KMZ' || ext === 'kmz' || ext === 'kml') {
    return <Globe2 className="size-4 text-emerald-400" />;
  }
  if (docType === 'Timeline Pelaksana' || ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
    return <FileSpreadsheet className="size-4 text-green-400" />;
  }
  if (ext === 'zip' || ext === 'rar') {
    return <Archive className="size-4 text-amber-400" />;
  }
  if (ext === 'dwg' || ext === 'dxf') {
    return <Layers className="size-4 text-cyan-400" />;
  }
  return <FileText className="size-4 text-purple-400" />;
};

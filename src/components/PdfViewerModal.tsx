import React, { useState } from 'react';
import { X, FileText, Download, CheckCircle2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { AttachedDocument } from '../types';
import { triggerDownloadDocument } from '../utils/documentUtils';

interface PdfViewerModalProps {
  document: AttachedDocument | null;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ document: docItem, onClose }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!docItem) return null;

  const handleDownload = () => {
    triggerDownloadDocument(docItem);
  };

  const isImage =
    docItem.fileDataUrl?.startsWith('data:image/') ||
    /\.(png|jpe?g|gif|svg|webp)$/i.test(docItem.fileName);

  const isPdf =
    docItem.fileDataUrl?.startsWith('data:application/pdf') ||
    /\.pdf$/i.test(docItem.fileName);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#090e1c] border border-cyan-500/40 rounded-2xl shadow-2xl neon-glow-cyan overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header bar */}
        <div className="p-4 bg-[#0d1426] border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {docItem.fileName}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  {docItem.documentType}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Ukuran: {docItem.fileSize} · Diunggah: {docItem.uploadedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 15, 160))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors finger-click"
              title="Perbesar Tampilan"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 15, 70))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors finger-click"
              title="Perkecil Tampilan"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-yellow-400 transition-colors finger-click"
              title="Putar Dokumen"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold finger-click transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors finger-click ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer / Canvas */}
        <div className="flex-1 overflow-auto p-6 bg-[#04060c] flex items-center justify-center">
          {isImage && docItem.fileDataUrl ? (
            <div
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease'
              }}
              className="max-w-full flex justify-center"
            >
              <img
                src={docItem.fileDataUrl}
                alt={docItem.fileName}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-slate-700"
              />
            </div>
          ) : isPdf && docItem.fileDataUrl ? (
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease'
              }}
              className="w-full h-[70vh] rounded-xl overflow-hidden border border-slate-700 bg-white"
            >
              <iframe
                src={docItem.fileDataUrl}
                title={docItem.fileName}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease'
              }}
              className="w-[620px] min-h-[720px] bg-slate-50 text-slate-900 p-8 rounded-lg shadow-2xl border border-slate-300 flex flex-col justify-between select-none"
            >
              {/* Kop Surat Pemerintah */}
              <div>
                <div className="text-center pb-4 border-b-2 border-slate-900">
                  <div className="text-xs font-bold tracking-widest uppercase text-slate-800">
                    PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA
                  </div>
                  <div className="text-sm font-extrabold tracking-wider uppercase text-slate-950 mt-0.5">
                    DINAS BINA MARGA & TIM KOORDINASI UTILITAS TERPADU (JWS)
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1">
                    Gedung Dinas Bina Marga Lt. 4, Jl. Taman Jatibaru No. 1, Jakarta Pusat
                  </div>
                </div>

                {/* Document Title */}
                <div className="mt-6 text-center">
                  <h4 className="text-base font-bold underline tracking-wide uppercase text-slate-900">
                    {docItem.documentType || 'DOKUMEN RESMI SURVEY & LEGALITAS'}
                  </h4>
                  <p className="text-xs font-mono text-slate-700 mt-1">
                    Nomor Arsip Digital: JWS/REV-REG/2026/{Math.floor(1000 + Math.random() * 9000)}
                  </p>
                </div>

                {/* Content body */}
                <div className="mt-6 space-y-3 text-xs text-slate-800 leading-relaxed">
                  <p>
                    Berikut informasi dokumen resmi yang diunggah dan terverifikasi secara digital dalam portal JWS Command Center:
                  </p>

                  <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 font-mono text-[11px] space-y-2">
                    <div><strong>Nama Berkas:</strong> {docItem.fileName}</div>
                    <div><strong>Kategori Dokumen:</strong> {docItem.documentType}</div>
                    <div><strong>Kapasitas Berkas:</strong> {docItem.fileSize} (Batas Max 4 MB)</div>
                    <div><strong>Status Verifikasi:</strong> Terverifikasi Tim Supervisi</div>
                    <div><strong>Penandatangan:</strong> {docItem.signer || 'Kepala Satuan Pelaksana & ISP Terkait'}</div>
                    <div><strong>Tanggal Terbit:</strong> {docItem.uploadedAt}</div>
                  </div>

                  <div className="pt-3 text-center">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold shadow-lg inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Berkas Ini Langsung</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Official Stamps and Signatures */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p className="text-slate-600">Perwakilan Tim JWS Dinas</p>
                  <div className="h-14 flex items-center justify-center">
                    <div className="border-2 border-dashed border-cyan-800 text-cyan-900 text-[10px] font-bold px-3 py-1 rounded rotate-[-6deg] bg-cyan-100/50 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-800" />
                      TERVERIFIKASI DIGITAL
                    </div>
                  </div>
                  <p className="font-bold underline text-slate-900">Ir. Hendra Wijaya</p>
                  <p className="text-[10px] text-slate-500">NIP. 19780512 200212 1 003</p>
                </div>

                <div>
                  <p className="text-slate-600">Penanggung Jawab ISP</p>
                  <div className="h-14 flex items-center justify-center">
                    <div className="border-2 border-emerald-800 text-emerald-900 text-[10px] font-bold px-3 py-1 rounded rotate-[4deg] bg-emerald-100/50">
                      APPROVED & SEALED
                    </div>
                  </div>
                  <p className="font-bold underline text-slate-900">{docItem.signer || 'Pimpinan Divisi Rollout'}</p>
                  <p className="text-[10px] text-slate-500">APJATEL Jakarta Region</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#0d1426] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Skala Tampilan: {zoom}%</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Integritas Berkas Digital Terverifikasi
          </span>
        </div>
      </div>
    </div>
  );
};

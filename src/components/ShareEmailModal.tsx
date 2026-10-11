import React, { useState, useMemo } from 'react';
import {
  X,
  Mail,
  Send,
  FileSpreadsheet,
  FileText,
  Check,
  CheckSquare,
  Square,
  Download,
  ExternalLink,
  Sparkles,
  Building2,
  ShieldCheck,
  Paperclip,
  Loader2,
  Copy
} from 'lucide-react';
import { ConstructionPlanItem, ProjectItem, AttachedDocument } from '../types';
import { generateSurveyDocsCsvData } from '../services/storage';

interface ShareEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectItem[];
  plans: ConstructionPlanItem[];
  defaultGroupFilter?: 'GOV' | 'INTERNAL' | 'ALL';
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

interface SelectedDocumentItem {
  id: string;
  planId: string;
  ispName: string;
  category: string;
  fileName: string;
  fileSize: string;
  fileDataUrl?: string;
  downloadUrl: string;
  selected: boolean;
}

export const ShareEmailModal: React.FC<ShareEmailModalProps> = ({
  isOpen,
  onClose,
  projects,
  plans,
  defaultGroupFilter = 'GOV',
  showToast
}) => {
  const [groupFilter, setGroupFilter] = useState<'GOV' | 'INTERNAL' | 'ALL'>(defaultGroupFilter);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [includeCsv, setIncludeCsv] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Sync group filter when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setGroupFilter(defaultGroupFilter);
      const titleLabel =
        defaultGroupFilter === 'GOV'
          ? 'GOV'
          : defaultGroupFilter === 'INTERNAL'
          ? 'Internal'
          : 'Semua (GOV & Internal)';
      setSubject(`Dokumen & Catatan Survey ${titleLabel} - JWS Project`);
      setCustomMessage(
        `Yth. Tim / Mitra,\n\nBerikut terlampir dokumen & catatan survey lapangan untuk kategori ${titleLabel}.\nAnda dapat mengunduh file CSV rekapitulasi serta dokumen berkas langsung melalui link yang terlampir.`
      );
    }
  }, [isOpen, defaultGroupFilter]);

  // Project Category Lookup Helper
  const isPlanInternal = (plan: ConstructionPlanItem) => {
    const prj = projects.find((p) => p.projectId === plan.projectId);
    if (prj) {
      return prj.projectCategory === 'Project Internal' || prj.projectCategory === 'INTERNAL';
    }
    return plan.projectId?.startsWith('PRJ-INT') || false;
  };

  // Filter plans based on active groupFilter
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const internal = isPlanInternal(plan);
      if (groupFilter === 'GOV') return !internal;
      if (groupFilter === 'INTERNAL') return internal;
      return true;
    });
  }, [plans, projects, groupFilter]);

  // Collect all available attached documents for filtered plans
  const availableDocs = useMemo(() => {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://jws-monitoring-project.vercel.app';

    const docs: SelectedDocumentItem[] = [];

    filteredPlans.forEach((plan) => {
      const docList: { key: string; label: string; doc?: AttachedDocument | null }[] = [
        { key: 'KMZ', label: '1. KMZ Trase Relokasi', doc: plan.docKmz },
        { key: 'APD', label: '2. APD Relokasi', doc: plan.docApdRelokasi || plan.apdIsp },
        { key: 'TIMELINE', label: '3. Timeline Pelaksanaan', doc: plan.docTimeline },
        { key: 'SURAT_PERINTAH', label: '4. Surat Perintah Relokasi', doc: plan.docSuratPerintahRelokasi },
        { key: 'BA_SURVEY', label: '5. BA Survey Bersama', doc: plan.docBaSurveyBersama || plan.baSurvey },
        { key: 'VENDOR', label: '6. Surat Penunjukan Vendor', doc: plan.docSuratPenunjukanVendor },
        { key: 'REKOMTEK', label: '7. Surat Rekomtek', doc: plan.docSuratRekomtek }
      ];

      docList.forEach((item) => {
        if (item.doc) {
          const fileName = item.doc.fileName || `${item.key}_${plan.namaIsp}.pdf`;
          const isWebUrl = item.doc.fileDataUrl?.startsWith('http://') || item.doc.fileDataUrl?.startsWith('https://');
          const downloadUrl = isWebUrl
            ? item.doc.fileDataUrl!
            : `${origin}/?doc=${encodeURIComponent(fileName)}`;

          docs.push({
            id: `${plan.id}-${item.key}`,
            planId: plan.id,
            ispName: plan.namaIsp,
            category: item.key,
            fileName: fileName,
            fileSize: item.doc.fileSize || 'Dokumen PDF',
            fileDataUrl: item.doc.fileDataUrl,
            downloadUrl,
            selected: true
          });
        }
      });
    });

    return docs;
  }, [filteredPlans]);

  // Selected document IDs state
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

  // Update selected doc IDs whenever availableDocs changes
  React.useEffect(() => {
    setSelectedDocIds(new Set(availableDocs.map((d) => d.id)));
  }, [availableDocs]);

  const toggleDocSelection = (id: string) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDocIds.size === availableDocs.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(availableDocs.map((d) => d.id)));
    }
  };

  // Generate CSV content
  const csvData = useMemo(() => {
    return generateSurveyDocsCsvData(plans, projects, groupFilter);
  }, [plans, projects, groupFilter]);

  if (!isOpen) return null;

  const handleSendEmail = async () => {
    if (!recipientEmail.trim()) {
      showToast('error', 'Email Tujuan Kosong', 'Harap masukkan setidaknya satu alamat email penerima.');
      return;
    }

    setIsSending(true);

    const selectedDocsList = availableDocs.filter((d) => selectedDocIds.has(d.id));

    // Prepare document links array for email rendering
    const documentLinks = selectedDocsList.map((doc) => ({
      title: `${doc.category} - ${doc.ispName}`,
      fileName: doc.fileName,
      category: doc.category,
      ispName: doc.ispName,
      fileSize: doc.fileSize,
      url: doc.downloadUrl
    }));

    // Prepare base64 attachments if available
    const attachments = selectedDocsList
      .filter((d) => d.fileDataUrl && d.fileDataUrl.includes('base64,'))
      .map((d) => ({
        fileName: d.fileName,
        fileDataUrl: d.fileDataUrl
      }));

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: subject || `Dokumen & Catatan Survey (${groupFilter})`,
          message: customMessage,
          groupFilter: groupFilter === 'GOV' ? 'GOV' : groupFilter === 'INTERNAL' ? 'INTERNAL' : 'Semua',
          csvFilename: includeCsv ? csvData.fileName : null,
          csvContent: includeCsv ? csvData.csvContent : null,
          attachments,
          documentLinks
        })
      });

      const responseText = await response.text();
      let result: any;
      try {
        result = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('Non-JSON response from /api/send-email:', responseText);
        throw new Error(
          `Server Vercel/Backend mengembalikan respon non-JSON (${response.status}). Pastikan Vercel Serverless Function /api/send-email.ts aktif.`
        );
      }

      if (response.ok && result.success) {
        if (result.isMockMode) {
          showToast(
            'warning',
            'Simulasi Pengiriman Email',
            'Pesan & lampiran disiapkan. Untuk pengiriman nyata, atur variabel SMTP_HOST, SMTP_USER, & SMTP_PASS di Environment Variables.'
          );
        } else {
          showToast(
            'success',
            'Email Berhasil Dikirim',
            `Dokumen & file CSV telah dikirim ke ${recipientEmail}. Penerima dapat langsung mengunduh berkas!`
          );
        }
        onClose();
      } else {
        const errorDetails = result.details?.hint ? ` (${result.details.hint})` : '';
        const errorMessage = (result.error || 'Gagal mengirim email via Nodemailer.') + errorDetails;
        showToast('error', 'Gagal Mengirim Email', errorMessage);
      }
    } catch (err: any) {
      console.error('Email sending endpoint error:', err);
      showToast(
        'error',
        'Gagal Mengirim Email',
        err.message || 'Gagal terhubung ke server backend /api/send-email.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyDirectLinks = () => {
    const selectedDocsList = availableDocs.filter((d) => selectedDocIds.has(d.id));
    const lines = [
      `Daftar Link Unduhan Langsung Dokumen Survey (${groupFilter}):`,
      `CSV Rekapitulasi: ${csvData.fileName}`,
      '---'
    ];
    selectedDocsList.forEach((d) => {
      lines.push(`${d.category} (${d.ispName}): ${d.downloadUrl}`);
    });

    navigator.clipboard.writeText(lines.join('\n'));
    showToast('info', 'Link Disalin', 'Semua link unduhan langsung telah disalin ke clipboard.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Mail className="size-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
                  Fitur Email Sharing & Direct Download
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Kirim Dokumen & Catatan Survey via Email
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Group Category Selector */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">
              1. Pilih Kategori Data yang Ingin Bagikan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setGroupFilter('GOV')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  groupFilter === 'GOV'
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <Building2 className={`size-5 ${groupFilter === 'GOV' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold font-mono">Dokumen GOV</div>
                  <div className="text-[10px] text-slate-400">Target GOV APJATEL</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGroupFilter('INTERNAL')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  groupFilter === 'INTERNAL'
                    ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <ShieldCheck className={`size-5 ${groupFilter === 'INTERNAL' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold font-mono">Dokumen Internal</div>
                  <div className="text-[10px] text-slate-400">Target Project Internal</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGroupFilter('ALL')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  groupFilter === 'ALL'
                    ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <Sparkles className={`size-5 ${groupFilter === 'ALL' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold font-mono">Semua Dokumen</div>
                  <div className="text-[10px] text-slate-400">Gabungan GOV & Internal</div>
                </div>
              </button>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Alamat Email Penerima <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="contoh: penerima@instansi.com, tim@jws.co.id"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Subjek Email</label>
                <input
                  type="text"
                  placeholder="Judul email..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Pesan / Catatan Tambahan</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan catatan khusus untuk penerima email..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Attachments & Preview Options */}
            <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <Paperclip className="size-4" />
                  <span>Lampiran & Direct Link ({availableDocs.length} Berkas)</span>
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {selectedDocIds.size === availableDocs.length ? 'Pilih Semua' : 'Centang Semua'}
                </button>
              </div>

              {/* CSV Attachment Checkbox */}
              <label className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 cursor-pointer hover:bg-emerald-950/50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeCsv}
                  onChange={(e) => setIncludeCsv(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <FileSpreadsheet className="size-4 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-white block">File CSV Rekapitulasi</span>
                  <span className="text-[10px] text-slate-400">{csvData.fileName}</span>
                </div>
              </label>

              {/* Document List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {availableDocs.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 font-mono">
                    Belum ada berkas dokumen terunggah pada kategori ini.
                  </div>
                ) : (
                  availableDocs.map((doc) => {
                    const isChecked = selectedDocIds.has(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => toggleDocSelection(doc.id)}
                        className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-slate-800/80 border-cyan-500/40 text-slate-200'
                            : 'bg-black/20 border-white/5 text-slate-500 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {isChecked ? (
                            <CheckSquare className="size-4 text-cyan-400 shrink-0" />
                          ) : (
                            <Square className="size-4 text-slate-600 shrink-0" />
                          )}
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300">
                                {doc.category}
                              </span>
                              <span className="text-xs font-semibold text-white truncate">{doc.ispName}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate">{doc.fileName}</span>
                          </div>
                        </div>

                        <a
                          href={doc.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/20 rounded-lg transition-colors shrink-0"
                          title="Pratinjau / Unduh Berkas"
                        >
                          <Download className="size-3.5" />
                        </a>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Email Preview Card mimicking Gmail attachments */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="size-3.5 text-amber-400" />
                <span>Pratinjau Tampilan Email yang Diterima:</span>
              </span>
              <button
                type="button"
                onClick={handleCopyDirectLinks}
                className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Copy className="size-3" />
                <span>Salin Semua Link Unduhan</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3 font-sans text-xs text-slate-300">
              <div className="border-b border-white/10 pb-2 flex justify-between text-slate-400 font-mono text-[11px]">
                <span>Kepada: {recipientEmail || 'penerima@example.com'}</span>
                <span>Subjek: {subject}</span>
              </div>
              <p className="whitespace-pre-line text-slate-200">{customMessage}</p>

              {/* Sample Download Cards */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 font-mono">
                  TERLAMPIR ({selectedDocIds.size + (includeCsv ? 1 : 0)} FILE - BISA DIUNDUH LANGSUNG):
                </div>

                {includeCsv && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="size-4 text-emerald-400" />
                      <div>
                        <div className="font-bold text-white text-xs">{csvData.fileName}</div>
                        <div className="text-[10px] text-slate-400">Data Rekapitulasi CSV</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                      Terlampir CSV
                    </span>
                  </div>
                )}

                {availableDocs
                  .filter((d) => selectedDocIds.has(d.id))
                  .slice(0, 3)
                  .map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-white/10"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="size-4 text-cyan-400 shrink-0" />
                        <div className="truncate">
                          <div className="font-bold text-white text-xs truncate">
                            {d.category} - {d.ispName}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{d.fileName}</div>
                        </div>
                      </div>
                      <a
                        href={d.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-[10px] font-mono font-bold transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Download className="size-3" />
                        <span>Unduh Langsung</span>
                      </a>
                    </div>
                  ))}

                {availableDocs.filter((d) => selectedDocIds.has(d.id)).length > 3 && (
                  <div className="text-center text-[10px] text-slate-500 font-mono italic">
                    + {availableDocs.filter((d) => selectedDocIds.has(d.id)).length - 3} berkas terlampir lainnya
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Penerima dapat langsung mengeklik link di email untuk mengunduh dokumen.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-mono hover:bg-white/5 transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={isSending}
              onClick={handleSendEmail}
              className="btn-cyan flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Mengirim Email...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Kirim Email Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

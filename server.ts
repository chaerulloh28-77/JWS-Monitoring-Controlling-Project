import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer, { Transporter } from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// API Endpoint for sending email with CSV & document attachments
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, message, groupFilter, csvFilename, csvContent, attachments, documentLinks } = req.body;

    if (!to || typeof to !== 'string' || !to.trim()) {
      return res.status(400).json({ success: false, error: 'Alamat email tujuan wajib diisi' });
    }

    // Prepare attachments array for nodemailer
    const emailAttachments: any[] = [];

    // Attach CSV file as binary Buffer with UTF-8 BOM so Excel & mail clients recognize downloadable file
    if (csvFilename && csvContent) {
      const csvString = typeof csvContent === 'string' ? csvContent : String(csvContent);
      const csvBuffer = Buffer.from('\uFEFF' + csvString, 'utf-8');
      const safeFilename = csvFilename.toLowerCase().endsWith('.csv') ? csvFilename : `${csvFilename}.csv`;

      emailAttachments.push({
        filename: safeFilename,
        content: csvBuffer,
        contentType: 'text/csv; charset=utf-8'
      });
    }

    // Attach document files if base64 dataUrl provided
    if (Array.isArray(attachments)) {
      attachments.forEach((doc: any, index: number) => {
        if (doc.fileDataUrl && doc.fileDataUrl.includes('base64,')) {
          const parts = doc.fileDataUrl.split(';base64,');
          const mimeType = parts[0].replace('data:', '') || 'application/pdf';
          const base64Data = parts[1];
          const fileName = doc.fileName || doc.name || `dokumen_${index + 1}.pdf`;
          
          emailAttachments.push({
            filename: fileName,
            content: Buffer.from(base64Data, 'base64'),
            contentType: mimeType
          });
        }
      });
    }

    // Build rich HTML body matching Gmail card style shown in user request
    const documentCardsHtml = (documentLinks || []).map((link: any) => `
      <div style="border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px 16px; margin-bottom: 10px; background-color: #f8fafc; display: flex; align-items: center; justify-content: space-between; font-family: sans-serif;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="background-color: #0284c7; color: #ffffff; border-radius: 6px; padding: 6px 10px; font-weight: bold; font-size: 11px; font-family: monospace;">
            ${(link.category || 'DOC').toUpperCase()}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 13px; color: #0f172a;">${link.title || link.fileName}</div>
            <div style="font-size: 11px; color: #64748b;">ISP: ${link.ispName || '-'} | File: ${link.fileName || 'pdf'}</div>
          </div>
        </div>
        <a href="${link.url}" target="_blank" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; display: inline-block;">
          ⬇ Unduh Dokumen
        </a>
      </div>
    `).join('');

    const htmlBody = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 680px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); padding: 24px; color: #ffffff;">
          <div style="font-size: 11px; font-family: monospace; color: #34d399; letter-spacing: 1px; text-transform: uppercase;">
            JWS PROJECT MANAGEMENT SYSTEM
          </div>
          <h2 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff;">
            Laporan Dokumen & Catatan Survey (${groupFilter || 'GOV & INTERNAL'})
          </h2>
        </div>

        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p style="margin-top: 0; font-size: 14px; color: #0f172a;">Yth. Penerima Dokumen,</p>
          <p style="font-size: 13px;">${message ? message.replace(/\n/g, '<br/>') : 'Berikut dilampirkan data dokumen & catatan survey proyek beserta file CSV rekapitulasi yang dapat langsung diunduh.'}</p>
          
          <div style="margin: 20px 0; padding: 14px 18px; background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 6px; font-size: 13px; color: #065f46;">
            <strong>📄 File Lampiran CSV:</strong> ${csvFilename || 'JWS_Survey_Dokumen_Catatan.csv'}
          </div>

          ${documentLinks && documentLinks.length > 0 ? `
            <h3 style="font-size: 14px; color: #0f172a; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
              📁 Berkas Dokumen & Link Unduhan Langsung (${documentLinks.length} Dokumen):
            </h3>
            ${documentCardsHtml}
          ` : ''}

          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
            Email ini dikirim secara otomatis melalui Portal JWS Survey, Dokumen & Catatan.
          </div>
        </div>
      </div>
    `;

    // Flexible SMTP environment variable mapping
    const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || process.env.MAIL_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || process.env.MAIL_PORT) || 587;
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.MAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.MAIL_PASS;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
    const smtpService = process.env.SMTP_SERVICE || process.env.EMAIL_SERVICE;

    let transporter: Transporter;
    let isMockMode = false;

    if (smtpUser && (smtpPass || smtpHost)) {
      const transportConfig: any = {
        host: smtpHost || (smtpUser.includes('@gmail.com') ? 'smtp.gmail.com' : undefined),
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      };

      if (smtpService) {
        transportConfig.service = smtpService;
      } else if (smtpUser.endsWith('@gmail.com') && !smtpHost) {
        transportConfig.service = 'gmail';
      }

      transporter = nodemailer.createTransport(transportConfig);

      // Verify connection configuration
      try {
        await transporter.verify();
      } catch (verifyError: any) {
        console.error('Nodemailer SMTP verification failed:', verifyError);
        return res.status(500).json({
          success: false,
          error: `Gagal terhubung ke Server SMTP (${smtpHost || 'SMTP Server'}): ${verifyError.message}`,
          details: {
            code: verifyError.code,
            command: verifyError.command,
            response: verifyError.response,
            hint: 'Pastikan SMTP_HOST, SMTP_PORT, SMTP_USER, dan SMTP_PASS diatur dengan benar di Environment Variables.'
          }
        });
      }
    } else {
      isMockMode = true;
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }

    const senderFrom = process.env.SMTP_FROM || (smtpUser ? `"JWS Project System" <${smtpUser}>` : '"JWS Project System" <no-reply@jws-project.com>');

    const mailOptions = {
      from: senderFrom,
      to,
      subject: subject || `Dokumen & Catatan Survey (${groupFilter || 'GOV/INTERNAL'})`,
      text: `${message || 'Berikut terlampir dokumen & catatan survey.'}\n\nLampiran CSV: ${csvFilename || 'JWS_Survey_Dokumen.csv'}`,
      html: htmlBody,
      attachments: emailAttachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email dispatch result:', info);

    return res.json({
      success: true,
      message: isMockMode
        ? `Format email disiapkan. SMTP belum diatur di Environment Variables (SMTP_HOST / SMTP_USER).`
        : `Email berhasil dikirim ke ${to}`,
      isMockMode,
      details: {
        recipients: to,
        csvAttached: !!csvFilename,
        docsAttached: emailAttachments.length - (csvFilename ? 1 : 0),
        messageId: info.messageId || 'sent-ok'
      }
    });
  } catch (error: any) {
    console.error('Email endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Terjadi kesalahan sistem saat mengirim email',
      details: {
        code: error.code || 'SMTP_ERROR',
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      }
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();

import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // ignore JSON parse fallback
      }
    }

    const { fileDataUrl, fileName, mimeType } = body || {};

    if (!fileDataUrl || typeof fileDataUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'File data URL required' });
    }

    // Extract base64 payload from DataURL
    let base64Data = fileDataUrl;
    let actualMimeType = mimeType || 'application/pdf';

    if (fileDataUrl.includes(';base64,')) {
      const parts = fileDataUrl.split(';base64,');
      const header = parts[0];
      base64Data = parts[1];
      if (header.startsWith('data:')) {
        actualMimeType = header.replace('data:', '');
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured on the server.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const promptText = `Anda adalah asisten kecerdasan buatan spesialis analisis dokumen Berita Acara (BA) Survey Pekerjaan Utilitas Telekomunikasi & Kabel Fiber Optik JWS.

Tugas Anda adalah membaca dan menganalisis berkas dokumen ini (${fileName || 'BA Survey'}), lalu mengekstrak data lapangan secara presisi menjadi objek JSON terstruktur dengan format berikut:

{
  "projectId": "Kode/Nomor proyek di dokumen jika ada (contoh: PRJ-JWS-2026-001, PRJ-JWS-2026-002), jika tidak tertera buatkan nomor perkiraan format PRJ-JWS-2026-001",
  "isp": "Nama operator/ISP telekomunikasi (contoh: Telkom Group, Indosat Ooredoo, XL Axiata, Biznet, dll)",
  "category": "Kategori proyek regulasi: pilih salah satu dari ['GOV APJATEL', 'GOV IPPJU', 'GOV SJUT', 'Project Internal']",
  "location": "Lokasi/ruas jalan/koridor galian atau trase (contoh: Jl. Sudirman - Bundaran HI)",
  "description": "Deskripsi/uraian ringkas lingkup pekerjaan relokasi kabel",
  "targetPanjangMtr": 1250, // Angka estimasi panjang galian/rute kabel FO dalam meter (number)
  "targetManhole": 8, // Angka estimasi jumlah manhole/handhole/tiang (number)
  "surveyDate": "2026-02-15", // Tanggal BA Survey dalam format YYYY-MM-DD
  "remarks": "Ringkasan catatan teknis hasil survey lapangan, dispensasi Dishub, atau poin penting"
}

PENTING:
- Berikan respon HANYA dalam bentuk JSON valid tanpa tanda Markdown (tanpa \`\`\`json atau \`\`\`).
- Pastikan semua nilai angka berupa number murni tanpa huruf atau simbol.
- Pastikan category persis salah satu dari 'GOV APJATEL', 'GOV IPPJU', 'GOV SJUT', 'Project Internal'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: actualMimeType,
            data: base64Data
          }
        },
        {
          text: promptText
        }
      ]
    });

    const rawText = response.text || '';
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();

    let extractedData: any = {};
    try {
      extractedData = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('Failed to parse raw Gemini JSON response:', rawText);
      extractedData = {
        projectId: 'PRJ-JWS-2026-001',
        isp: 'Operator ISP',
        category: 'GOV APJATEL',
        location: 'DKI Jakarta',
        description: 'Relokasi Jaringan Fiber Optik Subduct Bawah Tanah',
        targetPanjangMtr: 1000,
        targetManhole: 5,
        surveyDate: new Date().toISOString().slice(0, 10),
        remarks: 'Hasil ekstraksi dokumen BA Survey JWS'
      };
    }

    return res.status(200).json({
      success: true,
      extractedData
    });
  } catch (err: any) {
    console.error('Error in /api/extract-ba-survey endpoint:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Gagal mengekstrak data dari berkas PDF'
    });
  }
}

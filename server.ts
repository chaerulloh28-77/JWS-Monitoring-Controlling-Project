import express from 'express';
import { createServer as createViteServer } from 'vite';
import sendEmailHandler from './api/send-email.js';
import extractBaSurveyHandler from './api/extract-ba-survey.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// API Endpoints
app.post('/api/send-email', async (req, res) => {
  try {
    await sendEmailHandler(req, res);
  } catch (err: any) {
    console.error('Unhandled error in /api/send-email route:', err);
    if (!res.headersSent) {
      res.status(400).json({ success: false, error: err?.message || 'Gagal memproses pengiriman email.' });
    }
  }
});
app.post('/api/extract-ba-survey', (req, res) => extractBaSurveyHandler(req, res));

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

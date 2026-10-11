import express from 'express';
import { createServer as createViteServer } from 'vite';
import sendEmailHandler from './api/send-email.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// API Endpoint for sending email with CSV & document attachments (delegated to Vercel Serverless Function)
app.post('/api/send-email', (req, res) => sendEmailHandler(req, res));

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

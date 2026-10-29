// Serverless handler untuk Vercel: memetakan permintaan /api/* ke handler AI aplikasi.

import { readAiEnv } from '../server/env.js';
import { createAiHandler } from '../server/handler.js';

const config = readAiEnv(process.env);
const handleAi = createAiHandler(config);

export default async function handler(req, res) {
  try {
    await handleAi(req, res);
  } catch (err) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Terjadi kesalahan pada server proxy.', kind: 'server' }));
    }
  }
}

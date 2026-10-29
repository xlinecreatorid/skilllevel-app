import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { loadEnv, readAiEnv } from './env.js';
import { createAiHandler } from './handler.js';

const root = resolve(process.cwd());
loadEnv(root);

const dist = join(root, 'dist');
const port = Number.parseInt(process.env.PORT ?? '4173', 10);
const config = readAiEnv(process.env);
const handleAi = createAiHandler(config);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
};

const server = createServer((req, res) => {
  try {
    serve(req, res);
  } catch {
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Terjadi kesalahan pada server.');
  }
});

function serve(req, res) {
  if (req.url?.startsWith('/api/ai/')) {
    handleAi(req, res).catch(() => {
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Terjadi kesalahan pada server.', kind: 'unknown' }));
    });
    return;
  }

  if (!existsSync(dist)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Build belum tersedia. Jalankan "npm run build" lebih dulu.');
    return;
  }

  let requested;
  try {
    requested = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Alamat tidak valid.');
    return;
  }

  const candidate = normalize(join(dist, requested));
  const safe =
    candidate.startsWith(dist + sep) && existsSync(candidate) && statSync(candidate).isFile();

  if (!safe && extname(requested)) {
    // Permintaan berkas yang tidak ada tidak boleh jatuh ke index.html,
    // karena peramban akan mengira itu aset dengan tipe yang salah.
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Berkas tidak ditemukan.');
    return;
  }

  const file = safe ? candidate : join(dist, 'index.html');
  const ext = extname(file);
  const immutable = safe && /-[A-Za-z0-9_-]{8,}\./.test(file);

  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  });
  createReadStream(file).pipe(res);
}

server.listen(port, () => {
  console.log(`Skilllevel berjalan di http://localhost:${port}`);
  if (!config.apiKey) {
    console.log('Catatan: AI_API_KEY belum diisi. Model bawaan tidak aktif sampai .env diisi.');
  }
});

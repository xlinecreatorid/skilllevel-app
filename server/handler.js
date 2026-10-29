import { AiError, completeChat, publicConfig, streamChat } from './aiProxy.js';
import { createRateLimiter } from './security.js';
import { redact } from './security.js';

const MAX_BODY_BYTES = 1_500_000;

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new AiError('Permintaan terlalu besar.', { status: 413, kind: 'input' }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      // BOM UTF-8 dari klien non-peramban bisa membuat JSON.parse gagal, jadi dibuang lebih dulu.
      const raw = Buffer.concat(chunks).toString('utf8').replace(/^\uFEFF/, '');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new AiError('Body permintaan bukan JSON yang valid.', { status: 400, kind: 'input' }));
      }
    });
    req.on('error', () => reject(new AiError('Gagal membaca permintaan.', { status: 400, kind: 'input' })));
  });
}

function clientKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || '').split(',')[0].trim();
  return ip || req.socket?.remoteAddress || 'unknown';
}

/**
 * Handler bersama untuk dev (middleware Vite) dan produksi (server Node).
 * Semua galat dikembalikan dalam bentuk pesan yang sudah diredaksi.
 */
export function createAiHandler(config, { logger = console } = {}) {
  const limit = createRateLimiter({ windowMs: 60_000, max: 40 });
  const secrets = [config.apiKey];

  return async function handle(req, res) {
    const url = new URL(req.url || '/', 'http://localhost');
    const path = url.pathname;

    if (path === '/api/ai/health' && req.method === 'GET') {
      return sendJson(res, 200, { ok: true, ...publicConfig(config) });
    }

    if (path === '/api/ai/chat' && req.method === 'POST') {
      const gate = limit(clientKey(req));
      if (!gate.ok) {
        res.setHeader('Retry-After', String(gate.retryAfter));
        return sendJson(res, 429, { error: 'Terlalu banyak permintaan. Tunggu sebentar.', kind: 'rate' });
      }

      let body;
      try {
        body = await readBody(req);
      } catch (err) {
        return sendJson(res, err.status || 400, { error: redact(err.message, secrets), kind: err.kind || 'input' });
      }

      const wantsStream = Boolean(body.stream) && config.streaming;
      const controller = new AbortController();
      req.on('close', () => controller.abort());

      if (!wantsStream) {
        try {
          const result = await completeChat(config, body, { signal: controller.signal });
          return sendJson(res, 200, { text: result.text, model: result.model, usage: result.usage });
        } catch (err) {
          const status = err instanceof AiError ? err.status : 502;
          const message = redact(err?.message || 'Terjadi kesalahan pada layanan AI.', secrets);
          if (status >= 500) logger.error('[ai]', message);
          return sendJson(res, status, { error: message, kind: err?.kind || 'unknown' });
        }
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });

      const write = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      try {
        await streamChat(config, body, {
          signal: controller.signal,
          onDelta: (delta) => write('delta', { text: delta }),
          onDone: () => write('done', { ok: true }),
        });
      } catch (err) {
        const message = redact(err?.message || 'Terjadi kesalahan pada layanan AI.', secrets);
        if (!controller.signal.aborted) write('error', { error: message, kind: err?.kind || 'unknown' });
      } finally {
        res.end();
      }
      return undefined;
    }

    return sendJson(res, 404, { error: 'Rute tidak ditemukan.', kind: 'notfound' });
  };
}

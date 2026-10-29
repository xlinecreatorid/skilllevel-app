const ENDPOINT = '/api/ai';

export class AiClientError extends Error {
  constructor(message, { kind = 'unknown', status = 0 } = {}) {
    super(message);
    this.name = 'AiClientError';
    this.kind = kind;
    this.status = status;
  }
}

function friendly(status, payload) {
  const kind = payload?.kind || 'unknown';
  const message = payload?.error || 'Layanan AI tidak dapat dihubungi.';
  return new AiClientError(message, { kind, status });
}

export async function health() {
  try {
    const res = await fetch(`${ENDPOINT}/health`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return { ok: false, hasServerKey: false, streaming: false, thinking: 'off' };
    return await res.json();
  } catch {
    return { ok: false, hasServerKey: false, streaming: false, thinking: 'off' };
  }
}

/**
 * Satu jalur untuk semua permintaan AI. Kunci API tidak pernah ada di browser:
 * server memegang kredensial dari .env, atau memakai kunci kustom yang dikirim
 * hanya untuk satu permintaan ini.
 */
export async function complete({ messages, system, json = false, temperature, maxTokens, settings, signal }) {
  const res = await fetch(`${ENDPOINT}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      messages,
      system,
      json,
      temperature,
      maxTokens,
      stream: false,
      endpoint: settings?.endpoint || undefined,
      model: settings?.model || undefined,
      apiKey: settings?.apiKey || undefined,
    }),
    signal,
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  if (!res.ok) throw friendly(res.status, payload);
  if (!payload?.text) throw new AiClientError('Model tidak mengembalikan teks jawaban.', { kind: 'empty' });
  return payload.text;
}

/** Streaming SSE dari proxy; memanggil onDelta untuk setiap potongan teks. */
export async function stream({ messages, system, temperature, maxTokens, settings, signal, onDelta }) {
  const res = await fetch(`${ENDPOINT}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      messages,
      system,
      temperature,
      maxTokens,
      stream: true,
      endpoint: settings?.endpoint || undefined,
      model: settings?.model || undefined,
      apiKey: settings?.apiKey || undefined,
    }),
    signal,
  });

  if (!res.ok) {
    let payload = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
    throw friendly(res.status, payload);
  }
  if (!res.body) throw new AiClientError('Server tidak mengirim aliran data.', { kind: 'network' });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  let failure = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let split;
    while ((split = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, split);
      buffer = buffer.slice(split + 2);

      let event = 'message';
      let data = '';
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
      }
      if (!data) continue;

      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }
      if (event === 'delta' && parsed.text) {
        full += parsed.text;
        onDelta?.(parsed.text);
      } else if (event === 'error') {
        failure = new AiClientError(parsed.error || 'Aliran AI terputus.', { kind: parsed.kind });
      }
    }
  }

  if (failure) throw failure;
  if (!full.trim()) throw new AiClientError('Model tidak mengembalikan teks jawaban.', { kind: 'empty' });
  return full;
}

/** Ambil objek JSON dari model, dengan toleransi terhadap pembungkus kode. */
export async function completeJson(options) {
  const text = await complete({ ...options, json: true, temperature: options.temperature ?? 0.3 });
  const cleaned = text
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new AiClientError('Jawaban model bukan JSON yang valid.', { kind: 'parse' });
  }
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new AiClientError('Jawaban model bukan JSON yang valid.', { kind: 'parse' });
  }
}

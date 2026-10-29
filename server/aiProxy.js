import { redact, validateEndpoint } from './security.js';
import { createLoopDetector, inspectInput, sanitizeAiOutput } from './leakGuard.js';

const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 60_000;
const UPSTREAM_TIMEOUT_MS = 60_000;
const MAX_NETWORK_RETRIES = 3;

export class AiError extends Error {
  constructor(message, { status = 502, kind = 'upstream' } = {}) {
    super(message);
    this.name = 'AiError';
    this.status = status;
    this.kind = kind;
  }
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new AiError('Pesan tidak boleh kosong.', { status: 400, kind: 'input' });
  }
  if (messages.length > MAX_MESSAGES) {
    throw new AiError(`Terlalu banyak pesan (maksimal ${MAX_MESSAGES}).`, { status: 400, kind: 'input' });
  }
  return messages.map((m) => {
    const role = m?.role === 'assistant' ? 'assistant' : 'user';
    const content = typeof m?.content === 'string' ? m.content : '';
    if (!content.trim()) throw new AiError('Ada pesan kosong.', { status: 400, kind: 'input' });
    if (content.length > MAX_MESSAGE_CHARS) {
      throw new AiError('Satu pesan melebihi batas panjang.', { status: 400, kind: 'input' });
    }

    const check = inspectInput(content);
    if (!check.safe) {
      throw new AiError(check.reason, { status: 400, kind: 'input' });
    }

    return { role, content };
  });
}

export function resolveTargets(config, body = {}) {
  const customEndpoint = typeof body.endpoint === 'string' ? body.endpoint.trim() : '';
  const customModel = typeof body.model === 'string' ? body.model.trim() : '';
  const customKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
  const provider = (typeof body.provider === 'string' && body.provider ? body.provider : 'openai').toLowerCase();

  const isSelfProvider = Boolean(
    customEndpoint ||
    customKey ||
    (customModel && customModel !== 'agnes-2.5-flash' && customModel !== 'mercury-3')
  );

  // Jika pengguna mengonfigurasi provider / endpoint mandiri
  if (isSelfProvider) {
    const endpointRaw = customEndpoint || config.baseUrl;
    const model = customModel || config.model;
    const primaryKey = customKey || config.apiKey;

    if (!model) throw new AiError('Nama model mandiri belum diisi.', { status: 400, kind: 'config' });
    if (model.length > 120 || !/^[A-Za-z0-9._:/@+-]+$/.test(model)) {
      throw new AiError('Nama model memuat karakter yang tidak diizinkan.', { status: 400, kind: 'config' });
    }

    const check = validateEndpoint(endpointRaw, { allowPrivate: config.allowPrivateEndpoints });
    if (!check.ok) throw new AiError(check.reason, { status: 400, kind: 'config' });

    const base = check.url.toString().replace(/\/+$/, '');
    let fullUrl = `${base}/chat/completions`;
    if (provider === 'anthropic') {
      fullUrl = base.endsWith('/v1') ? `${base}/messages` : `${base}/v1/messages`;
    }

    return [
      {
        name: `Self Provider (${model})`,
        url: fullUrl,
        baseUrl: base,
        model,
        apiKey: primaryKey || '',
        keyPool: primaryKey ? [primaryKey] : [],
        provider,
        usingServerKey: false,
        usingCustomEndpoint: true,
        isBuiltin: false,
      },
    ];
  }

  // Jika tidak ada konfigurasi kustom, otomatis pakai model bawaan (Agnes & Mercury)
  const builtinList =
    config.builtinModels && config.builtinModels.length > 0
      ? config.builtinModels
      : [
          {
            id: 'agnes-2.5-flash',
            name: 'Agnes 2.5 Flash',
            endpoint: 'https://apihub.agnes-ai.com/v1',
            apiKey: 'sk-Fq20kIW1ReDlBMxEX6FFZQAkBgs8dZSH4P0yKP6o2Nr4MoOe',
            provider: 'openai',
          },
          {
            id: 'mercury-3',
            name: 'Mercury-3 (Inception Labs)',
            endpoint: 'https://api.inceptionlabs.ai/v1',
            apiKey: '',
            provider: 'openai',
          },
        ];

  return builtinList.map((m) => {
    const base = m.endpoint.replace(/\/+$/, '');
    const key =
      m.apiKey ||
      config.apiKey ||
      (m.id.includes('agnes') ? 'sk-Fq20kIW1ReDlBMxEX6FFZQAkBgs8dZSH4P0yKP6o2Nr4MoOe' : '');
    const pool = [key, ...(config.fallbackKeys || [])].filter(Boolean);

    return {
      name: m.name,
      url: `${base}/chat/completions`,
      baseUrl: base,
      model: m.id,
      apiKey: key,
      keyPool: pool,
      provider: m.provider || 'openai',
      usingServerKey: true,
      usingCustomEndpoint: false,
      isBuiltin: true,
    };
  });
}

export function resolveTarget(config, body = {}) {
  const targets = resolveTargets(config, body);
  return targets[0];
}

function buildOpenAiPayload({ model, messages, system, temperature, json, maxTokens, stream, thinking }) {
  const payload = {
    model,
    messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
    stream,
  };
  if (typeof temperature === 'number' && Number.isFinite(temperature)) {
    payload.temperature = Math.min(2, Math.max(0, temperature));
  }
  if (Number.isFinite(maxTokens) && maxTokens > 0) payload.max_tokens = Math.min(16_384, Math.round(maxTokens));
  if (json) payload.response_format = { type: 'json_object' };
  if (thinking === 'auto') payload.thinking = { type: 'auto' };
  return payload;
}

function buildAnthropicPayload({ model, messages, system, maxTokens, stream }) {
  return {
    model,
    system: system || undefined,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    max_tokens: Number.isFinite(maxTokens) && maxTokens > 0 ? Math.min(4096, maxTokens) : 4096,
    stream,
  };
}

function upstreamMessage(status, rawBody, secrets) {
  let detail = '';
  try {
    const parsed = JSON.parse(rawBody);
    detail = parsed?.error?.message || parsed?.message || '';
  } catch {
    detail = String(rawBody || '').slice(0, 300);
  }
  detail = redact(detail, secrets).trim();

  if (status === 401 || status === 403) return 'Kredensial ditolak oleh penyedia model (Kunci API tidak valid atau kadaluarsa).';
  if (status === 404) return `Model atau endpoint tidak ditemukan${detail ? `: ${detail}` : '.'}`;
  if (status === 429) return 'Batas kuota penyedia tercapai. Sedang mencoba jalur cadangan...';
  if (status >= 500) return 'Penyedia model sedang mengalami kendala. Sedang melakukan retry otomatis...';
  return detail || `Permintaan ditolak penyedia (HTTP ${status}).`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(target, payload, { signal, secrets }, key) {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_NETWORK_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort, { once: true });

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (target.provider === 'anthropic') {
        headers['x-api-key'] = key;
        headers['anthropic-version'] = '2023-06-01';
        headers['Accept'] = payload.stream ? 'text/event-stream' : 'application/json';
      } else {
        if (key) {
          headers['Authorization'] = `Bearer ${key}`;
        }
        headers['Accept'] = payload.stream ? 'text/event-stream' : 'application/json';
      }

      const response = await fetch(target.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);

      if (response.ok) return response;

      // Cek apakah status layak di-retry (429, 500, 502, 503, 504)
      if ([429, 500, 502, 503, 504].includes(response.status) && attempt < MAX_NETWORK_RETRIES) {
        const backoff = Math.pow(2, attempt - 1) * 800 + Math.random() * 300;
        await sleep(backoff);
        continue;
      }

      return response;
    } catch (err) {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
      lastError = err;

      if (err?.name === 'AbortError' && signal?.aborted) {
        throw new AiError('Permintaan dibatalkan.', { status: 499 });
      }

      if (attempt < MAX_NETWORK_RETRIES) {
        const backoff = Math.pow(2, attempt - 1) * 800 + Math.random() * 300;
        await sleep(backoff);
        continue;
      }
    }
  }

  throw new AiError(
    lastError?.name === 'AbortError'
      ? 'Permintaan ke penyedia model melewati batas waktu koneksi.'
      : 'Gagal terhubung ke jaringan penyedia AI setelah beberapa percobaan.',
    { status: 504, kind: 'network' }
  );
}

async function requestWithFallbackKeys(target, payloadBuilder, ctx) {
  let lastResponse = null;
  let lastBody = '';

  const pool = target.keyPool && target.keyPool.length > 0 ? target.keyPool : [target.apiKey || ''];

  for (let i = 0; i < pool.length; i++) {
    const currentKey = pool[i];
    const payload = payloadBuilder(target);

    try {
      const response = await fetchWithRetry(target, payload, ctx, currentKey);
      if (response.ok) return response;

      lastResponse = response;
      lastBody = await response.text();

      // Jika thinking parameter ditolak, ulangi tanpa thinking
      if (response.status === 400 && payload.thinking && /thinking|reasoning/i.test(lastBody)) {
        const retryPayload = { ...payload };
        delete retryPayload.thinking;
        const fallbackResp = await fetchWithRetry(target, retryPayload, ctx, currentKey);
        if (fallbackResp.ok) return fallbackResp;
      }

      // Jika error kredensial atau batas kuota dan ada kunci cadangan, rotasi
      if ([401, 403, 429].includes(response.status) && i < pool.length - 1) {
        continue;
      }

      break;
    } catch (err) {
      if (i < pool.length - 1) continue;
      throw err;
    }
  }

  throw new AiError(upstreamMessage(lastResponse?.status || 502, lastBody, ctx.secrets), {
    status: lastResponse?.status === 401 || lastResponse?.status === 403 ? 401 : 502,
    kind: 'upstream',
  });
}

function extractOpenAiText(data) {
  const choice = data?.choices?.[0];
  const content = choice?.delta?.content ?? choice?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((part) => (typeof part?.text === 'string' ? part.text : '')).join('');
  }
  return '';
}

function extractAnthropicText(data) {
  if (Array.isArray(data?.content)) {
    return data.content.map((p) => p?.text || '').join('');
  }
  return '';
}

export async function completeChat(config, body, { signal } = {}) {
  const messages = normalizeMessages(body.messages);
  const targets = resolveTargets(config, body);

  const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0) + String(body.system || '').length;
  if (totalChars > config.maxInputChars) {
    throw new AiError('Konteks terlalu panjang untuk satu permintaan.', { status: 413, kind: 'input' });
  }

  let lastError = null;

  for (let tIdx = 0; tIdx < targets.length; tIdx++) {
    const target = targets[tIdx];
    const secrets = [...target.keyPool, config.apiKey].filter(Boolean);

    const payloadBuilder = (t) => {
      if (t.provider === 'anthropic') {
        return buildAnthropicPayload({
          model: t.model,
          messages,
          system: typeof body.system === 'string' ? body.system : '',
          maxTokens: body.maxTokens,
          stream: false,
        });
      }
      return buildOpenAiPayload({
        model: t.model,
        messages,
        system: typeof body.system === 'string' ? body.system : '',
        temperature: body.temperature,
        json: Boolean(body.json),
        maxTokens: body.maxTokens,
        stream: false,
        thinking: config.thinking,
      });
    };

    try {
      const response = await requestWithFallbackKeys(target, payloadBuilder, { signal, secrets });
      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new AiError('Penyedia model mengembalikan respons yang tidak dapat dibaca.', { status: 502 });
      }

      let text = target.provider === 'anthropic' ? extractAnthropicText(data) : extractOpenAiText(data);
      text = text.trim();
      if (!text) throw new AiError('Model tidak mengembalikan teks jawaban.', { status: 502, kind: 'empty' });

      // Proteksi pengulangan teks (looping)
      const loopDetector = createLoopDetector({ maxRepetitions: 3 });
      text = loopDetector.filterFullText(text);

      // Sanitasi kebocoran
      text = sanitizeAiOutput(text, secrets, body.system);

      return { text, model: target.model, usage: data?.usage || null };
    } catch (err) {
      lastError = err;
      // Jika model bawaan gagal, lanjutkan otomatis ke model bawaan berikutnya (Agnes <-> Mercury)
      if (target.isBuiltin && tIdx < targets.length - 1) {
        console.warn(`[ai] Model bawaan ${target.name} gagal (${err.message}). Beralih otomatis ke ${targets[tIdx + 1].name}...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new AiError('Layanan AI tidak dapat dihubungi.', { status: 502 });
}

export async function streamChat(config, body, { signal, onDelta, onDone }) {
  const messages = normalizeMessages(body.messages);
  const targets = resolveTargets(config, body);

  let lastError = null;

  for (let tIdx = 0; tIdx < targets.length; tIdx++) {
    const target = targets[tIdx];
    const secrets = [...target.keyPool, config.apiKey].filter(Boolean);

    const payloadBuilder = (t) => {
      if (t.provider === 'anthropic') {
        return buildAnthropicPayload({
          model: t.model,
          messages,
          system: typeof body.system === 'string' ? body.system : '',
          maxTokens: body.maxTokens,
          stream: true,
        });
      }
      return buildOpenAiPayload({
        model: t.model,
        messages,
        system: typeof body.system === 'string' ? body.system : '',
        temperature: body.temperature,
        json: Boolean(body.json),
        maxTokens: body.maxTokens,
        stream: true,
        thinking: config.thinking,
      });
    };

    try {
      const response = await requestWithFallbackKeys(target, payloadBuilder, { signal, secrets });
      if (!response.body) throw new AiError('Penyedia model tidak mengirim aliran data.', { status: 502 });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';
      const loopDetector = createLoopDetector({ maxRepetitions: 3 });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();
          if (!dataStr || dataStr === '[DONE]') continue;

          let parsed;
          try {
            parsed = JSON.parse(dataStr);
          } catch {
            continue;
          }

          const delta = target.provider === 'anthropic' ? extractAnthropicText(parsed) : extractOpenAiText(parsed);
          if (!delta) continue;

          const loopCheck = loopDetector.push(delta);
          if (loopCheck.stopped) {
            onDelta(loopCheck.text);
            full += loopCheck.text;
            break;
          }
          if (loopCheck.accept) {
            const sanitizedChunk = sanitizeAiOutput(delta, secrets, body.system);
            full += sanitizedChunk;
            onDelta(sanitizedChunk);
          }
        }
        if (loopDetector.isStopped()) break;
      }

      if (!full.trim()) throw new AiError('Model tidak mengembalikan teks jawaban.', { status: 502, kind: 'empty' });
      onDone(full);
      return { text: full, model: target.model };
    } catch (err) {
      lastError = err;
      if (target.isBuiltin && tIdx < targets.length - 1) {
        console.warn(`[ai] Model bawaan ${target.name} gagal (${err.message}). Beralih otomatis ke ${targets[tIdx + 1].name}...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new AiError('Layanan AI tidak dapat dihubungi.', { status: 502 });
}

export function publicConfig(config) {
  return {
    defaultModel: config.model,
    defaultEndpoint: config.baseUrl,
    provider: config.provider || 'openai',
    hasServerKey: true,
    fallbackKeysCount: config.fallbackKeys?.length || 0,
    streaming: config.streaming,
    thinking: config.thinking,
    builtinModels: (config.builtinModels || []).map((m) => ({ id: m.id, name: m.name })),
  };
}

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function parseEnv(text) {
  const out = {};
  for (const rawLine of String(text ?? '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim().replace(/^export\s+/, '');
    if (!KEY_RE.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/** Muat .env lalu .env.local tanpa menimpa variabel yang sudah ada di process.env. */
export function loadEnv(root) {
  for (const file of ['.env', '.env.local']) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    let parsed;
    try {
      parsed = parseEnv(readFileSync(path, 'utf8'));
    } catch {
      continue;
    }
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
  return process.env;
}

export function readAiEnv(env = process.env) {
  const maxInputChars = Number.parseInt(env.AI_MAX_INPUT_CHARS ?? '', 10);
  const fallbacksRaw = env.AI_API_KEY_FALLBACKS || '';
  const fallbackKeys = fallbacksRaw
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  // Model bawaan otomatis: Agnes 2.5 Flash dan Mercury-3 dengan endpoint & kunci terpisah
  const agnesBaseUrl = (env.AGNES_BASE_URL || 'https://apihub.agnes-ai.com/v1').trim();
  const agnesModel = (env.AGNES_MODEL || 'agnes-2.5-flash').trim();
  const agnesApiKey = (
    env.AGNES_API_KEY ||
    env.AI_API_KEY ||
    'sk-Fq20kIW1ReDlBMxEX6FFZQAkBgs8dZSH4P0yKP6o2Nr4MoOe'
  ).trim();

  const mercuryBaseUrl = (env.MERCURY_BASE_URL || 'https://api.inceptionlabs.ai/v1').trim();
  const mercuryModel = (env.MERCURY_MODEL || 'mercury-3').trim();
  const mercuryApiKey = (env.MERCURY_API_KEY || '').trim();

  const builtinModels = [
    {
      id: agnesModel,
      name: 'Agnes 2.5 Flash',
      endpoint: agnesBaseUrl,
      apiKey: agnesApiKey,
      provider: 'openai',
    },
    {
      id: mercuryModel,
      name: 'Mercury-3 (Inception Labs)',
      endpoint: mercuryBaseUrl,
      apiKey: mercuryApiKey,
      provider: 'openai',
    },
  ];

  return {
    baseUrl: (env.AI_BASE_URL || agnesBaseUrl).trim(),
    model: (env.AI_MODEL || agnesModel).trim(),
    apiKey: (env.AI_API_KEY || '').trim(),
    fallbackKeys,
    builtinModels,
    provider: (env.AI_PROVIDER || 'openai').trim().toLowerCase(),
    streaming: env.AI_STREAMING !== '0',
    thinking: env.AI_THINKING === 'off' ? 'off' : 'auto',
    allowPrivateEndpoints: env.AI_ALLOW_PRIVATE_ENDPOINTS === '1',
    maxInputChars: Number.isFinite(maxInputChars) && maxInputChars > 1000 ? maxInputChars : 120_000,
  };
}

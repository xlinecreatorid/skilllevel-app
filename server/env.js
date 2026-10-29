import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const FREE_MODELS = [
  {
    id: 'mercury-3',
    name: 'Mercury-3 (Inception Labs)',
    endpoint: 'https://api.inceptionlabs.ai/v1',
    provider: 'openai',
    description: 'Model penalaran cepat gratis dari Inception Labs.',
  },
  {
    id: 'agnes-2.5-flash',
    name: 'Agnes 2.5 Flash',
    endpoint: 'https://apihub.agnes-ai.com/v1',
    provider: 'openai',
    description: 'Model bawaan responsif untuk kurikulum web fullstack.',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Google Gemini 2.0 Flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/v1',
    provider: 'gemini',
    description: 'Model multimodal generasi terbaru dari Google.',
  },
];

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

  return {
    baseUrl: (env.AI_BASE_URL || 'https://apihub.agnes-ai.com/v1').trim(),
    model: (env.AI_MODEL || 'agnes-2.5-flash').trim(),
    apiKey: (env.AI_API_KEY || '').trim(),
    fallbackKeys,
    provider: (env.AI_PROVIDER || 'openai').trim().toLowerCase(),
    streaming: env.AI_STREAMING !== '0',
    thinking: env.AI_THINKING === 'off' ? 'off' : 'auto',
    allowPrivateEndpoints: env.AI_ALLOW_PRIVATE_ENDPOINTS === '1',
    maxInputChars: Number.isFinite(maxInputChars) && maxInputChars > 1000 ? maxInputChars : 120_000,
    freeModels: FREE_MODELS,
  };
}

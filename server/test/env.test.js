import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEnv, readAiEnv } from '../env.js';

test('parseEnv membaca pasangan kunci nilai dan melewati komentar', () => {
  const parsed = parseEnv(['# komentar', 'AI_MODEL=agnes-2.5-flash', '', 'AI_STREAMING=1'].join('\n'));
  assert.deepEqual(parsed, { AI_MODEL: 'agnes-2.5-flash', AI_STREAMING: '1' });
});

test('parseEnv melepas tanda kutip dan prefiks export', () => {
  const parsed = parseEnv(['export AI_API_KEY="abc123"', "AI_BASE_URL='https://contoh.test/v1'"].join('\n'));
  assert.equal(parsed.AI_API_KEY, 'abc123');
  assert.equal(parsed.AI_BASE_URL, 'https://contoh.test/v1');
});

test('parseEnv mengabaikan baris tanpa tanda sama dengan dan kunci tidak valid', () => {
  const parsed = parseEnv(['baris tanpa nilai', '2SALAH=nilai', 'BENAR=nilai'].join('\n'));
  assert.deepEqual(parsed, { BENAR: 'nilai' });
});

test('readAiEnv memakai nilai bawaan saat env kosong', () => {
  const config = readAiEnv({});
  assert.equal(config.baseUrl, 'https://apihub.agnes-ai.com/v1');
  assert.equal(config.model, 'agnes-2.5-flash');
  assert.equal(config.apiKey, '');
  assert.equal(config.streaming, true);
  assert.equal(config.thinking, 'auto');
  assert.equal(config.allowPrivateEndpoints, false);
  assert.equal(config.maxInputChars, 120_000);
});

test('readAiEnv menghormati nilai eksplisit', () => {
  const config = readAiEnv({
    AI_BASE_URL: 'https://contoh.test/v1',
    AI_MODEL: 'model-kustom',
    AI_API_KEY: 'kunci',
    AI_STREAMING: '0',
    AI_THINKING: 'off',
    AI_ALLOW_PRIVATE_ENDPOINTS: '1',
    AI_MAX_INPUT_CHARS: '5000',
  });
  assert.equal(config.baseUrl, 'https://contoh.test/v1');
  assert.equal(config.model, 'model-kustom');
  assert.equal(config.apiKey, 'kunci');
  assert.equal(config.streaming, false);
  assert.equal(config.thinking, 'off');
  assert.equal(config.allowPrivateEndpoints, true);
  assert.equal(config.maxInputChars, 5000);
});

test('readAiEnv mengabaikan batas input yang tidak masuk akal', () => {
  assert.equal(readAiEnv({ AI_MAX_INPUT_CHARS: '10' }).maxInputChars, 120_000);
  assert.equal(readAiEnv({ AI_MAX_INPUT_CHARS: 'abc' }).maxInputChars, 120_000);
});

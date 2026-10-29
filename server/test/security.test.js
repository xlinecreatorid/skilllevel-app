import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter, isPrivateHost, redact, validateEndpoint } from '../security.js';

test('redact menghapus kunci yang dikenal dan pola rahasia umum', () => {
  const key = 'sk-live-abcdef1234567890';
  const text = `Authorization: Bearer ${key} dan api_key=rahasia123456`;
  const out = redact(text, [key]);
  assert.equal(out.includes(key), false);
  assert.equal(out.includes('rahasia123456'), false);
  assert.match(out, /\[redacted\]/);
});

test('redact membiarkan teks biasa apa adanya', () => {
  const text = 'Modul 3 membahas tata letak CSS.';
  assert.equal(redact(text), text);
});

test('redact tidak menghapus rahasia pendek yang tidak mungkin berupa kunci', () => {
  assert.equal(redact('nilai abc', ['abc']), 'nilai abc');
});

test('isPrivateHost menandai host internal', () => {
  for (const host of ['localhost', 'api.localhost', 'server.local', 'db.internal', '10.0.0.5', '127.0.0.1', '192.168.1.9', '172.16.4.2', '169.254.1.1', '::1', 'fd00::1', 'fe80::1']) {
    assert.equal(isPrivateHost(host), true, `${host} seharusnya privat`);
  }
});

test('isPrivateHost meloloskan host publik', () => {
  for (const host of ['apihub.agnes-ai.com', 'api.openai.com', '8.8.8.8', '172.32.0.1']) {
    assert.equal(isPrivateHost(host), false, `${host} seharusnya publik`);
  }
});

test('validateEndpoint menerima endpoint https publik', () => {
  const result = validateEndpoint('https://apihub.agnes-ai.com/v1');
  assert.equal(result.ok, true);
  assert.equal(result.url.hostname, 'apihub.agnes-ai.com');
});

test('validateEndpoint menolak http, localhost, kredensial, query, dan skema lain', () => {
  assert.equal(validateEndpoint('http://apihub.agnes-ai.com/v1').ok, false);
  assert.equal(validateEndpoint('https://localhost:8080/v1').ok, false);
  assert.equal(validateEndpoint('https://user:pass@example.com/v1').ok, false);
  assert.equal(validateEndpoint('https://example.com/v1?token=abc').ok, false);
  assert.equal(validateEndpoint('file:///etc/passwd').ok, false);
  assert.equal(validateEndpoint('').ok, false);
  assert.equal(validateEndpoint('bukan url').ok, false);
});

test('validateEndpoint mengizinkan host privat hanya bila diminta eksplisit', () => {
  assert.equal(validateEndpoint('http://127.0.0.1:11434/v1', { allowPrivate: true }).ok, true);
  assert.equal(validateEndpoint('http://127.0.0.1:11434/v1').ok, false);
});

test('createRateLimiter membatasi jumlah permintaan per jendela waktu', () => {
  const check = createRateLimiter({ windowMs: 1000, max: 2 });
  assert.equal(check('ip-a').ok, true);
  assert.equal(check('ip-a').ok, true);
  const blocked = check('ip-a');
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfter >= 1);
  assert.equal(check('ip-b').ok, true);
});

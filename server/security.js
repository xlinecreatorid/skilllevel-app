const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{8,}\b/g,
  /\bAIza[0-9A-Za-z_-]{10,}\b/g,
  /\bBearer\s+[A-Za-z0-9._~+/-]{8,}=*/gi,
  /\b(?:api[_-]?key|access[_-]?token|secret|password)\s*[:=]\s*["']?[^\s"',}]{6,}/gi,
];

const PRIVATE_V4 = [
  /^10\./,
  /^127\./,
  /^0\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
];

/** Hapus nilai rahasia dari teks yang akan dikirim ke klien atau ditulis ke log. */
export function redact(input, extraSecrets = []) {
  let text = typeof input === 'string' ? input : String(input ?? '');
  for (const secret of extraSecrets) {
    if (typeof secret === 'string' && secret.length >= 6) text = text.split(secret).join('[redacted]');
  }
  for (const pattern of SECRET_PATTERNS) text = text.replace(pattern, '[redacted]');
  return text;
}

export function isPrivateHost(hostname = '') {
  const host = String(hostname).toLowerCase().replace(/^\[|\]$/g, '');
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.localhost')) return true;
  if (host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.home.arpa')) return true;
  if (host.includes(':')) {
    if (host === '::1' || host === '::') return true;
    if (/^f[cd][0-9a-f]{2}:/.test(host)) return true;
    if (/^fe80:/.test(host)) return true;
    return false;
  }
  return PRIVATE_V4.some((pattern) => pattern.test(host));
}

/**
 * Endpoint kustom dipakai server sebagai target fetch, jadi harus divalidasi
 * agar tidak menjadi jalur SSRF ke jaringan internal.
 */
export function validateEndpoint(raw, { allowPrivate = false } = {}) {
  const value = String(raw ?? '').trim();
  if (!value) return { ok: false, reason: 'Endpoint belum diisi.' };
  if (value.length > 300) return { ok: false, reason: 'Endpoint terlalu panjang.' };

  let url;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, reason: 'Endpoint bukan URL yang valid.' };
  }

  if (url.username || url.password) return { ok: false, reason: 'Endpoint tidak boleh memuat kredensial.' };
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false, reason: 'Endpoint harus memakai https.' };
  }
  if (url.protocol === 'http:' && !allowPrivate) {
    return { ok: false, reason: 'Endpoint harus memakai https.' };
  }
  if (isPrivateHost(url.hostname) && !allowPrivate) {
    return { ok: false, reason: 'Endpoint localhost atau jaringan privat diblokir.' };
  }
  if (url.search || url.hash) {
    return { ok: false, reason: 'Endpoint tidak boleh memuat query atau fragmen.' };
  }
  return { ok: true, url };
}

/** Pembatas laju sederhana per kunci (alamat IP) untuk mencegah penyalahgunaan kuota. */
export function createRateLimiter({ windowMs = 60_000, max = 30 } = {}) {
  const hits = new Map();
  let lastSweep = Date.now();

  return function check(key) {
    const now = Date.now();
    if (now - lastSweep > windowMs * 5) {
      for (const [k, entry] of hits) if (now - entry.start > windowMs) hits.delete(k);
      lastSweep = now;
    }
    const entry = hits.get(key);
    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      return { ok: true, remaining: max - 1 };
    }
    entry.count += 1;
    if (entry.count > max) {
      return { ok: false, retryAfter: Math.max(1, Math.ceil((entry.start + windowMs - now) / 1000)) };
    }
    return { ok: true, remaining: max - entry.count };
  };
}

// Validasi alamat endpoint di sisi klien. Server tetap memvalidasi ulang, ini hanya
// supaya kesalahan ketik ketahuan sebelum permintaan dikirim.

const ENDPOINT_RE = /^https:\/\/[^\s]+$/i;
const PRIVATE_HOST_RE =
  /^(localhost|127\.|0\.|10\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/i;

export function endpointProblem(raw) {
  const endpoint = String(raw || '').trim();
  if (!endpoint) return '';
  if (!ENDPOINT_RE.test(endpoint)) return 'Alamat endpoint harus dimulai dengan https:// dan tanpa spasi.';
  if (/[?#]/.test(endpoint)) return 'Alamat endpoint tidak boleh memuat tanda tanya atau tanda pagar.';
  let host = '';
  try {
    host = new URL(endpoint).hostname;
  } catch {
    return 'Alamat endpoint tidak bisa dibaca.';
  }
  if (PRIVATE_HOST_RE.test(host) || /\.(local|internal|localhost)$/i.test(host)) {
    return 'Alamat lokal atau jaringan privat diblokir. Pakai alamat publik yang bisa dijangkau server.';
  }
  return '';
}

export function modelProblem(raw) {
  const model = String(raw || '').trim();
  if (!model) return '';
  if (!/^[A-Za-z0-9._:/@+-]+$/.test(model)) {
    return 'Nama model hanya boleh memuat huruf, angka, titik, garis miring, garis bawah, tanda hubung, plus, dan at.';
  }
  if (model.length > 120) return 'Nama model terlalu panjang, maksimal 120 karakter.';
  return '';
}

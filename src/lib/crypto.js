// Enkripsi sisi klien (End-to-End) memakai Web Crypto API standar (AES-GCM 256-bit).

const SALT = new TextEncoder().encode('skilllevel-e2ee-v1-salt');
const KEY_NAME = 'sl_e2ee_device_key';

async function deriveKey(secret) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function getDeviceSecret() {
  let secret = localStorage.getItem(KEY_NAME);
  if (!secret) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    secret = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    try {
      localStorage.setItem(KEY_NAME, secret);
    } catch {
      /* jika storage diblokir, tetap berjalan di memori */
    }
  }
  return secret;
}

export async function encryptData(plainText, customSecret = null) {
  try {
    const key = await deriveKey(customSecret || getDeviceSecret());
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

    const packed = {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(cipher)),
      v: 1,
    };
    return btoa(JSON.stringify(packed));
  } catch (err) {
    console.warn('[crypto] Gagal mengenkripsi data:', err);
    return plainText;
  }
}

export async function decryptData(cipherBase64, customSecret = null) {
  if (!cipherBase64 || typeof cipherBase64 !== 'string') return cipherBase64;
  try {
    const json = atob(cipherBase64);
    const packed = JSON.parse(json);
    if (!packed?.iv || !packed?.data) return cipherBase64;

    const key = await deriveKey(customSecret || getDeviceSecret());
    const iv = new Uint8Array(packed.iv);
    const cipherBytes = new Uint8Array(packed.data);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes);
    return new TextDecoder().decode(decrypted);
  } catch {
    // Jika bukan ciphertext terenkripsi (misal data lama), kembalikan teks asli
    return cipherBase64;
  }
}

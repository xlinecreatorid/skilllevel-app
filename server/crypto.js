// Enkripsi simetris sisi server memakai AES-256-GCM dari modul bawaan node:crypto.

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const SALT = 'skilllevel-server-salt-v1';

function getKey(secret) {
  return scryptSync(secret, SALT, 32);
}

export function encryptServer(text, masterKey = process.env.SERVER_ENCRYPTION_KEY || 'skilllevel-default-production-key-32') {
  if (!text) return '';
  const key = getKey(masterKey);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptServer(payload, masterKey = process.env.SERVER_ENCRYPTION_KEY || 'skilllevel-default-production-key-32') {
  if (!payload || typeof payload !== 'string' || !payload.includes(':')) return payload;
  try {
    const [ivHex, authTagHex, encrypted] = payload.split(':');
    if (!ivHex || !authTagHex || !encrypted) return payload;
    const key = getKey(masterKey);
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return payload;
  }
}

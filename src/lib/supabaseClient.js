import { createClient } from '@supabase/supabase-js';
import { encryptData, decryptData, hashPassword } from './crypto.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('demo.supabase.co')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

const AUTH_USER_KEY = 'sl_auth_user';
const LOCAL_USERS_KEY = 'sl_local_users';

function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalUser(user, passwordHash) {
  try {
    const users = getLocalUsers();
    users[user.username] = { ...user, passwordHash };
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {
    /* abaikan limit local storage */
  }
}

export async function registerUser({ fullName, username, password }) {
  const cleanFullName = String(fullName || '').trim();
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  if (!cleanFullName) {
    return { data: null, error: new Error('Nama lengkap wajib diisi.') };
  }
  if (!cleanUsername || cleanUsername.length < 3) {
    return { data: null, error: new Error('Nama pengguna minimal 3 karakter.') };
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
    return {
      data: null,
      error: new Error('Nama pengguna hanya boleh berisi huruf, angka, garis bawah, titik, atau tanda hubung.'),
    };
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return { data: null, error: new Error('Kata sandi minimal 4 karakter.') };
  }

  const passwordHash = await hashPassword(cleanPassword, cleanUsername);

  // Verifikasi duplikasi akun di Supabase bila terhubung.
  if (isSupabaseConfigured) {
    try {
      const { data: existing } = await supabase
        .from('app_users')
        .select('username')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (existing) {
        return { data: null, error: new Error('Nama pengguna sudah terdaftar. Gunakan nama lain.') };
      }

      const { data: created, error: insertError } = await supabase
        .from('app_users')
        .insert([
          {
            username: cleanUsername,
            full_name: cleanFullName,
            password_hash: passwordHash,
          },
        ])
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          return { data: null, error: new Error('Nama pengguna sudah terdaftar.') };
        }
        throw insertError;
      }

      const user = {
        id: created.id,
        username: created.username,
        full_name: created.full_name,
        user_metadata: { full_name: created.full_name },
      };

      saveLocalUser(user, passwordHash);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event('sl-auth-changed'));
      return { data: { user }, error: null };
    } catch (err) {
      console.warn('Gagal registrasi Supabase, beralih ke penyimpanan lokal:', err.message);
    }
  }

  // Fallback ke penyimpanan akun lokal.
  const localUsers = getLocalUsers();
  if (localUsers[cleanUsername]) {
    return { data: null, error: new Error('Nama pengguna sudah terdaftar di sistem lokal.') };
  }

  const user = {
    id: `usr_${Date.now()}_${cleanUsername}`,
    username: cleanUsername,
    full_name: cleanFullName,
    user_metadata: { full_name: cleanFullName },
  };

  saveLocalUser(user, passwordHash);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('sl-auth-changed'));
  return { data: { user }, error: null };
}

export async function loginUser({ username, password }) {
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  if (!cleanUsername || !cleanPassword) {
    return { data: null, error: new Error('Nama pengguna dan kata sandi wajib diisi.') };
  }

  const expectedHash = await hashPassword(cleanPassword, cleanUsername);

  // Verifikasi kredensial di Supabase bila terhubung.
  if (isSupabaseConfigured) {
    try {
      const { data: found, error } = await supabase
        .from('app_users')
        .select('id, username, full_name, password_hash')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (!error && found) {
        if (found.password_hash === expectedHash) {
          const user = {
            id: found.id,
            username: found.username,
            full_name: found.full_name,
            user_metadata: { full_name: found.full_name },
          };
          saveLocalUser(user, expectedHash);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          window.dispatchEvent(new Event('sl-auth-changed'));
          return { data: { user }, error: null };
        }
        return { data: null, error: new Error('Kata sandi salah. Silakan periksa kembali.') };
      }
    } catch (err) {
      console.warn('Gagal verifikasi Supabase, memeriksa cache lokal:', err.message);
    }
  }

  // Verifikasi kredensial di penyimpanan lokal saat offline.
  const localUsers = getLocalUsers();
  const localUser = localUsers[cleanUsername];
  if (localUser) {
    if (localUser.passwordHash === expectedHash) {
      const user = {
        id: localUser.id,
        username: localUser.username,
        full_name: localUser.full_name,
        user_metadata: { full_name: localUser.full_name },
      };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event('sl-auth-changed'));
      return { data: { user }, error: null };
    }
    return { data: null, error: new Error('Kata sandi salah.') };
  }

  return { data: null, error: new Error('Nama pengguna tidak ditemukan. Silakan daftar terlebih dahulu.') };
}

export async function signOut() {
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event('sl-auth-changed'));
  return { error: null };
}

export async function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* abaikan */
  }
  return null;
}

export function subscribeAuthChanges(callback) {
  getCurrentUser().then((u) => callback?.(u));

  const handleUpdate = () => {
    getCurrentUser().then((u) => callback?.(u));
  };

  window.addEventListener('sl-auth-changed', handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return {
    unsubscribe: () => {
      window.removeEventListener('sl-auth-changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    },
  };
}

export async function saveUserProgressEncrypted(userId, plainState) {
  if (!userId) return false;
  try {
    const ciphertext = await encryptData(plainState);
    if (!ciphertext) return false;

    localStorage.setItem(`sl_progress_${userId}`, ciphertext);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('user_progress').upsert(
        {
          user_id: userId,
          encrypted_data: ciphertext,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (error) {
        console.warn('Gagal sinkronisasi Supabase user_progress:', error.message);
      }
    }
    return true;
  } catch (err) {
    console.error('Gagal enkripsi progres:', err);
    return false;
  }
}

export async function loadUserProgressDecrypted(userId) {
  if (!userId) return null;
  try {
    let ciphertext = localStorage.getItem(`sl_progress_${userId}`);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('user_progress')
        .select('encrypted_data')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data?.encrypted_data) {
        ciphertext = data.encrypted_data;
      }
    }

    if (!ciphertext) return null;
    return await decryptData(ciphertext);
  } catch (err) {
    console.error('Gagal dekripsi progres:', err);
    return null;
  }
}

export const syncProgressToCloud = saveUserProgressEncrypted;
export const loadProgressFromCloud = loadUserProgressDecrypted;

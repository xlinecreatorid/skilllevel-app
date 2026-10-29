import { createClient } from '@supabase/supabase-js';
import { encryptData, decryptData } from './crypto.js';

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

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    // Mode simulasi/demo lokal bila kredensial Supabase belum diisi
    const mockUser = {
      id: `usr_${Date.now()}`,
      email: 'mahasiswa@kampus.ac.id',
      user_metadata: { full_name: 'Mahasiswa Web', avatar_url: '' },
      role: 'student',
    };
    localStorage.setItem('sl_auth_mock_user', JSON.stringify(mockUser));
    return { data: { user: mockUser }, error: null };
  }

  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
}

export async function signInWithAdminSSO(domain = '') {
  const cleanDomain = String(domain || '').trim().toLowerCase();
  if (!cleanDomain) {
    return { data: null, error: new Error('Domain institusi/kampus harus diisi.') };
  }

  if (!isSupabaseConfigured) {
    const mockAdmin = {
      id: `adm_${Date.now()}`,
      email: `admin@${cleanDomain}`,
      user_metadata: { full_name: `Admin Kampus (${cleanDomain})`, avatar_url: '' },
      role: 'admin',
    };
    localStorage.setItem('sl_auth_mock_user', JSON.stringify(mockAdmin));
    return { data: { user: mockAdmin }, error: null };
  }

  return await supabase.auth.signInWithSSO({
    domain: cleanDomain,
    options: {
      redirectTo: window.location.origin,
    },
  });
}

export async function signOut() {
  localStorage.removeItem('sl_auth_mock_user');
  if (isSupabaseConfigured) {
    return await supabase.auth.signOut();
  }
  return { error: null };
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    const raw = localStorage.getItem('sl_auth_mock_user');
    return raw ? JSON.parse(raw) : null;
  }
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export function subscribeAuthChanges(callback) {
  if (!isSupabaseConfigured) {
    const raw = localStorage.getItem('sl_auth_mock_user');
    callback(raw ? JSON.parse(raw) : null);
    const handler = () => {
      const u = localStorage.getItem('sl_auth_mock_user');
      callback(u ? JSON.parse(u) : null);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => subscription.unsubscribe();
}

/** Simpan progres terenkripsi end-to-end ke database Supabase */
export async function syncProgressToCloud(userId, progress) {
  if (!userId || !progress) return;
  try {
    const plainJson = JSON.stringify(progress);
    const encryptedPayload = await encryptData(plainJson);

    if (isSupabaseConfigured) {
      await supabase.from('user_progress').upsert({
        user_id: userId,
        encrypted_data: encryptedPayload,
        updated_at: new Date().toISOString(),
      });
    } else {
      localStorage.setItem(`sl_cloud_backup_${userId}`, encryptedPayload);
    }
  } catch (err) {
    console.warn('[sync] Gagal menyinkronkan progres ke cloud:', err);
  }
}

/** Muat progres terenkripsi dari database Supabase dan dekripsi di sisi klien */
export async function loadProgressFromCloud(userId) {
  if (!userId) return null;
  try {
    let encryptedPayload = null;
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('user_progress')
        .select('encrypted_data')
        .eq('user_id', userId)
        .single();
      encryptedPayload = data?.encrypted_data;
    } else {
      encryptedPayload = localStorage.getItem(`sl_cloud_backup_${userId}`);
    }

    if (!encryptedPayload) return null;
    const decryptedJson = await decryptData(encryptedPayload);
    return JSON.parse(decryptedJson);
  } catch (err) {
    console.warn('[sync] Gagal mendekripsi progres dari cloud:', err);
    return null;
  }
}

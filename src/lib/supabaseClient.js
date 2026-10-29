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
    const mockUser = {
      id: `usr_${Date.now()}`,
      email: 'pelajar@kampus.ac.id',
      user_metadata: { full_name: 'Pelajar Web', avatar_url: '' },
      role: 'student',
    };
    localStorage.setItem('sl_auth_mock_user', JSON.stringify(mockUser));
    return { data: { user: mockUser }, error: null };
  }

  // Pre-flight check apakah Google OAuth sudah diaktifkan di Supabase
  try {
    const checkRes = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=google`, {
      method: 'GET',
    });
    if (!checkRes.ok) {
      const errJson = await checkRes.json().catch(() => null);
      if (errJson?.error_code === 'validation_failed' || errJson?.msg?.includes('not enabled')) {
        return {
          data: null,
          error: new Error(
            'Google OAuth belum diaktifkan di Supabase Dashboard (Authentication -> Providers -> Google). Silakan gunakan Masuk dengan Email di bawah ini.'
          ),
        };
      }
    }
  } catch {
    /* lanjutkan bila terkendala CORS preflight */
  }

  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
}

export async function signInWithEmail(email, password) {
  const cleanEmail = String(email || '').trim();
  const cleanPassword = String(password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return { data: null, error: new Error('Email dan kata sandi wajib diisi.') };
  }

  if (!isSupabaseConfigured) {
    const mockUser = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      user_metadata: { full_name: cleanEmail.split('@')[0] },
      role: 'student',
    };
    localStorage.setItem('sl_auth_mock_user', JSON.stringify(mockUser));
    return { data: { user: mockUser }, error: null };
  }

  return await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPassword,
  });
}

export async function signUpWithEmail(email, password, fullName = '') {
  const cleanEmail = String(email || '').trim();
  const cleanPassword = String(password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return { data: null, error: new Error('Email dan kata sandi wajib diisi.') };
  }

  if (!isSupabaseConfigured) {
    return signInWithEmail(cleanEmail, cleanPassword);
  }

  return await supabase.auth.signUp({
    email: cleanEmail,
    password: cleanPassword,
    options: {
      data: {
        full_name: fullName.trim() || cleanEmail.split('@')[0],
      },
    },
  });
}

export async function signInWithQuickAccess() {
  return await signInWithEmail('skilllevel.user.test@gmail.com', 'user123');
}

export async function signOut() {
  localStorage.removeItem('sl_auth_mock_user');
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch {
      /* abaikan error logout */
    }
  }
  return { error: null };
}

export async function getCurrentUser() {
  const raw = localStorage.getItem('sl_auth_mock_user');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* abaikan */
    }
  }
  if (!isSupabaseConfigured) {
    return null;
  }
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
}

export function subscribeAuthChanges(callback) {
  const raw = localStorage.getItem('sl_auth_mock_user');
  if (raw) {
    try {
      const user = JSON.parse(raw);
      if (user) {
        callback?.(user);
      }
    } catch {
      /* abaikan */
    }
  }

  if (!isSupabaseConfigured) {
    return { unsubscribe: () => {} };
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    const currentMock = localStorage.getItem('sl_auth_mock_user');
    if (currentMock) {
      try {
        const u = JSON.parse(currentMock);
        if (u) return callback?.(u);
      } catch {
        /* abaikan */
      }
    }
    callback?.(session?.user || null);
  });

  return subscription;
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
        console.warn('Gagal sinkronisasi Supabase:', error.message);
      }
    }
    return true;
  } catch (err) {
    console.error('Gagal enkripsi progres:', err);
    return false;
  }
}

export const syncProgressToCloud = saveUserProgressEncrypted;
export const loadProgressFromCloud = loadUserProgressDecrypted;

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

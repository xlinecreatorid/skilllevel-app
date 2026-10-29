// Penyimpanan lokal untuk progres belajar. Tidak ada kredensial yang disimpan di sini:
// kunci API hanya hidup di server (berkas .env) atau di memori tab ini.

const KEYS = {
  progress: 'sl_progress_v2',
  settings: 'sl_ai_settings_v2',
  chat: 'sl_chat_v2',
  uploaded: 'sl_uploaded_v2',
  legacyKey: 'sl_gemini_key',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* penyimpanan penuh atau diblokir: progres tetap jalan di memori */
  }
}

/** Hapus kunci API lama yang dulu disimpan di browser oleh versi sebelumnya. */
export function purgeLegacySecrets() {
  try {
    localStorage.removeItem(KEYS.legacyKey);
  } catch {
    /* tidak ada yang perlu dilakukan */
  }
}

export const emptyProgress = {
  xp: 0,
  completedModules: {},
  quizResults: {},
  streak: { lastDay: '', count: 0 },
};

export function loadProgress() {
  const raw = read(KEYS.progress, null);
  if (!raw || typeof raw !== 'object') return { ...emptyProgress };
  return {
    xp: Number.isFinite(raw.xp) ? raw.xp : 0,
    completedModules: raw.completedModules && typeof raw.completedModules === 'object' ? raw.completedModules : {},
    quizResults: raw.quizResults && typeof raw.quizResults === 'object' ? raw.quizResults : {},
    streak: raw.streak && typeof raw.streak === 'object' ? raw.streak : { lastDay: '', count: 0 },
  };
}

export function saveProgress(progress) {
  write(KEYS.progress, progress);
}

export function loadSettings() {
  const raw = read(KEYS.settings, {});
  return {
    endpoint: typeof raw.endpoint === 'string' ? raw.endpoint : '',
    model: typeof raw.model === 'string' ? raw.model : '',
    streaming: raw.streaming !== false,
    thinking: raw.thinking === 'off' ? 'off' : 'auto',
  };
}

export function saveSettings(settings) {
  write(KEYS.settings, settings);
}

export function loadChat() {
  const raw = read(KEYS.chat, []);
  return Array.isArray(raw) ? raw.filter((m) => m && typeof m.text === 'string') : [];
}

export function saveChat(messages) {
  write(KEYS.chat, messages.slice(-40));
}

export function loadUploaded() {
  const raw = read(KEYS.uploaded, []);
  return Array.isArray(raw) ? raw.filter((m) => m && typeof m.id === 'string' && typeof m.title === 'string') : [];
}

export function saveUploaded(materials) {
  write(KEYS.uploaded, materials);
}

export const LEVELS = [
  { name: 'Pemula', min: 0 },
  { name: 'Menengah', min: 200 },
  { name: 'Mahir', min: 500 },
  { name: 'Ahli', min: 1000 },
];

export function levelFor(xp) {
  let current = LEVELS[0];
  for (const level of LEVELS) if (xp >= level.min) current = level;
  const next = LEVELS.find((l) => l.min > xp) || null;
  const span = next ? next.min - current.min : 1;
  const done = next ? xp - current.min : 1;
  return {
    name: current.name,
    next: next ? next.name : null,
    toNext: next ? next.min - xp : 0,
    percent: Math.round(Math.min(1, done / span) * 100),
  };
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** Catat aktivitas hari ini; dipakai untuk menampilkan rentetan hari belajar. */
export function touchStreak(progress, date = new Date()) {
  const today = todayKey(date);
  if (progress.streak.lastDay === today) return progress;
  const yesterday = todayKey(new Date(date.getTime() - 86_400_000));
  const count = progress.streak.lastDay === yesterday ? progress.streak.count + 1 : 1;
  return { ...progress, streak: { lastDay: today, count } };
}

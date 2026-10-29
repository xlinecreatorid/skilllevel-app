import { useState } from 'react';
import { Button, Notice } from '../components/ui.jsx';
import { signInWithGoogle } from '../lib/supabaseClient.js';
import { useI18n } from '../lib/i18n.jsx';

export function LoginView({ onAuthSuccess }) {
  const { lang, setLang, t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await signInWithGoogle();
      if (res?.error) throw res.error;
      if (res?.data?.user) {
        onAuthSuccess?.(res.data.user);
      }
    } catch (err) {
      setError(err?.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--paper)] text-[var(--ink)]">
      {/* Header */}
      <header className="border-b border-[var(--rule)] bg-[var(--paper-raised)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-[1.375rem] leading-none tracking-tight text-[var(--ink)]">
              Skilllevel
            </span>
            <span className="hidden text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)] sm:inline">
              {t('app_subtitle')}
            </span>
          </div>

          {/* Toggle Bahasa ID / EN */}
          <div className="flex items-center border border-[var(--rule-strong)] text-[0.75rem] font-semibold">
            <button
              type="button"
              onClick={() => setLang('id')}
              aria-pressed={lang === 'id'}
              className={`px-2.5 py-1 transition-colors ${
                lang === 'id'
                  ? 'bg-[var(--accent)] text-[#fbf8f1]'
                  : 'bg-transparent text-[var(--ink-soft)] hover:bg-[var(--paper-sunk)]'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              className={`px-2.5 py-1 transition-colors ${
                lang === 'en'
                  ? 'bg-[var(--accent)] text-[#fbf8f1]'
                  : 'bg-transparent text-[var(--ink-soft)] hover:bg-[var(--paper-sunk)]'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Konten Utama: Gerbang Login */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-lg border border-[var(--rule-strong)] bg-[var(--paper-raised)] p-6 shadow-[0_20px_50px_-20px_rgba(27,26,23,0.35)] sm:p-9">
          {/* Eyebrow & Judul */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                {t('login_gate_eyebrow')}
              </span>
              <span className="font-mono text-[0.6875rem] uppercase text-[var(--ink-faint)]">
                OAuth 2.0
              </span>
            </div>
            <h1 className="mt-1 font-serif text-[1.625rem] leading-tight text-[var(--ink)]">
              {t('login_gate_title')}
            </h1>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
              {t('login_gate_subtitle')}
            </p>
          </div>

          {/* Pesan Kesalahan */}
          {error ? (
            <div className="mb-5">
              <Notice tone="danger">{error}</Notice>
            </div>
          ) : null}

          {/* Form Masuk Google */}
          <div className="space-y-4">
            <p className="text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
              {lang === 'id'
                ? 'Gunakan akun Google Anda untuk masuk secara instan. Data sesi dan riwayat belajar disimpan terenkripsi.'
                : 'Sign in instantly with your Google account. Session and learning history are encrypted end-to-end.'}
            </p>

            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center gap-3 py-3 font-semibold shadow-sm"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {loading ? 'Menghubungkan...' : t('auth_google_btn')}
            </Button>
          </div>

          {/* Catatan Keamanan */}
          <div className="mt-8 border-t border-[var(--rule)] pt-4 text-center">
            <p className="text-[0.75rem] leading-relaxed text-[var(--ink-faint)]">
              {t('login_gate_security')}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--rule)] bg-[var(--paper-raised)] py-4 text-center text-[0.75rem] text-[var(--ink-faint)]">
        <p>Skilllevel Production v2.1 • Keamanan End-to-End Terverifikasi</p>
      </footer>
    </div>
  );
}

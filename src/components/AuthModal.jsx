import { useState, useEffect } from 'react';
import { Button, Notice } from './ui.jsx';
import { signInWithGoogle } from '../lib/supabaseClient.js';
import { useI18n } from '../lib/i18n.jsx';

export function AuthModal({ open, onClose, onAuthSuccess }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setLoading(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await signInWithGoogle();
      if (res?.error) throw res.error;
      onAuthSuccess?.(res?.data?.user);
      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1b1a17]/45 px-4 py-8 sm:py-16">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="sl-enter w-full max-w-md border border-[var(--rule-strong)] bg-[var(--paper-raised)] shadow-[0_18px_50px_-24px_rgba(27,26,23,0.55)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--rule)] px-6 py-5">
          <div>
            <h2 id="auth-modal-title" className="text-[1.375rem] text-[var(--ink)]">
              {t('auth_title')}
            </h2>
            <p className="mt-1 text-[0.875rem] text-[var(--ink-soft)]">
              OAuth 2.0
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={t('btn_close')}>
            {t('btn_close')}
          </Button>
        </div>

        <div className="p-6">
          {error ? (
            <div className="mb-4">
              <Notice tone="danger">{error}</Notice>
            </div>
          ) : null}

          <div className="space-y-4 text-center">
            <p className="text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
              Sinkronkan progres belajar, skor kuis, dan modul unggahan ke cloud secara terenkripsi.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center gap-3 py-3"
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
        </div>
      </div>
    </div>
  );
}

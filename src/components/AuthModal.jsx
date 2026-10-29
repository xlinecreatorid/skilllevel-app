import { useState, useEffect } from 'react';
import { Button, Field, Notice, inputClass } from './ui.jsx';
import { loginUser, registerUser } from '../lib/supabaseClient.js';
import { useI18n } from '../lib/i18n.jsx';

export function AuthModal({ open, onClose, onAuthSuccess }) {
  const { lang, t } = useI18n();
  const [mode, setMode] = useState('login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setLoading(false);
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser({ username, password });
      if (res?.error) {
        setError(res.error.message);
        return;
      }
      if (res?.data?.user) {
        onAuthSuccess?.(res.data.user);
        onClose();
      }
    } catch (err) {
      setError(err?.message || 'Gagal masuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError(
        lang === 'id'
          ? 'Konfirmasi kata sandi tidak cocok.'
          : 'Password confirmation does not match.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        fullName: regFullName,
        username: regUsername,
        password: regPassword,
      });

      if (res?.error) {
        setError(res.error.message);
        return;
      }

      if (res?.data?.user) {
        onAuthSuccess?.(res.data.user);
        onClose();
      }
    } catch (err) {
      setError(err?.message || 'Gagal mendaftar.');
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
            <div className="mt-2 flex gap-4 text-[0.875rem]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`border-b-2 pb-1 font-semibold transition-colors ${
                  mode === 'login'
                    ? 'border-[var(--accent)] text-[var(--ink)]'
                    : 'border-transparent text-[var(--ink-faint)] hover:text-[var(--ink)]'
                }`}
              >
                {t('auth_tab_login')}
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`border-b-2 pb-1 font-semibold transition-colors ${
                  mode === 'register'
                    ? 'border-[var(--accent)] text-[var(--ink)]'
                    : 'border-transparent text-[var(--ink-faint)] hover:text-[var(--ink)]'
                }`}
              >
                {t('auth_tab_register')}
              </button>
            </div>
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

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label={t('auth_username_label')} htmlFor="modal-login-username">
                <input
                  id="modal-login-username"
                  type="text"
                  className={inputClass}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('auth_username_placeholder')}
                  autoComplete="username"
                  spellCheck="false"
                  disabled={loading}
                />
              </Field>

              <Field label={t('auth_password_label')} htmlFor="modal-login-password">
                <input
                  id="modal-login-password"
                  type="password"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth_password_placeholder')}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </Field>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center py-3 font-semibold shadow-sm"
                disabled={loading || !username.trim() || !password.trim()}
              >
                {loading ? 'Memverifikasi...' : t('auth_btn_login')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field label={t('auth_fullname_label')} htmlFor="modal-reg-fullname">
                <input
                  id="modal-reg-fullname"
                  type="text"
                  className={inputClass}
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder={t('auth_fullname_placeholder')}
                  autoComplete="name"
                  spellCheck="false"
                  disabled={loading}
                />
              </Field>

              <Field label={t('auth_username_label')} htmlFor="modal-reg-username">
                <input
                  id="modal-reg-username"
                  type="text"
                  className={inputClass}
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder={t('auth_username_placeholder')}
                  autoComplete="username"
                  spellCheck="false"
                  disabled={loading}
                />
              </Field>

              <Field label={t('auth_password_label')} htmlFor="modal-reg-password">
                <input
                  id="modal-reg-password"
                  type="password"
                  className={inputClass}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder={t('auth_password_placeholder')}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </Field>

              <Field
                label={t('auth_confirm_password_label')}
                htmlFor="modal-reg-confirm-password"
              >
                <input
                  id="modal-reg-confirm-password"
                  type="password"
                  className={inputClass}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder={t('auth_confirm_password_placeholder')}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </Field>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center py-3 font-semibold shadow-sm"
                disabled={
                  loading ||
                  !regFullName.trim() ||
                  !regUsername.trim() ||
                  !regPassword.trim() ||
                  !regConfirmPassword.trim()
                }
              >
                {loading ? 'Mendaftarkan...' : t('auth_btn_register')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

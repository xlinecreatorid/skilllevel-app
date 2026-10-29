import { useState } from 'react';
import { Button, Field, Notice, inputClass } from '../components/ui.jsx';
import { loginUser, registerUser } from '../lib/supabaseClient.js';
import { useI18n } from '../lib/i18n.jsx';

export function LoginView({ onAuthSuccess }) {
  const { lang, setLang, t } = useI18n();
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await loginUser({
        username: loginUsername,
        password: loginPassword,
      });

      if (res?.error) {
        setError(res.error.message);
        return;
      }

      if (res?.data?.user) {
        onAuthSuccess?.(res.data.user);
      }
    } catch (err) {
      setError(err?.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

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
      }
    } catch (err) {
      setError(err?.message || 'Terjadi kesalahan saat mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--paper)] text-[var(--ink)]">
      {/* Header Halaman */}
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

      {/* Konten Utama */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-16">
        <div className="w-full max-w-lg border border-[var(--rule-strong)] bg-[var(--paper-raised)] p-6 shadow-[0_20px_50px_-20px_rgba(27,26,23,0.35)] sm:p-9">
          {/* Eyebrow & Judul */}
          <div className="mb-6">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {t('login_gate_eyebrow')}
            </span>
            <h1 className="mt-1 font-serif text-[1.625rem] leading-tight text-[var(--ink)]">
              {t('login_gate_title')}
            </h1>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
              {t('login_gate_subtitle')}
            </p>
          </div>

          {/* Tab Selector: Masuk / Daftar */}
          <div className="mb-6 flex border-b border-[var(--rule)] text-[0.875rem]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setInfo('');
              }}
              className={`border-b-2 pb-2.5 font-semibold transition-colors ${
                mode === 'login'
                  ? 'border-[var(--accent)] text-[var(--ink)]'
                  : 'border-transparent text-[var(--ink-faint)] hover:text-[var(--ink)]'
              }`}
            >
              {t('auth_tab_login')}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setInfo('');
              }}
              className={`ml-6 border-b-2 pb-2.5 font-semibold transition-colors ${
                mode === 'register'
                  ? 'border-[var(--accent)] text-[var(--ink)]'
                  : 'border-transparent text-[var(--ink-faint)] hover:text-[var(--ink)]'
              }`}
            >
              {t('auth_tab_register')}
            </button>
          </div>

          {/* Pesan Kesalahan / Informasi */}
          {error ? (
            <div className="mb-5">
              <Notice tone="danger">{error}</Notice>
            </div>
          ) : null}

          {info ? (
            <div className="mb-5">
              <Notice tone="ok">{info}</Notice>
            </div>
          ) : null}

          {/* 1. FORM LOGIN: Username, Password */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Field 1: Username */}
              <Field label={t('auth_username_label')} htmlFor="login-username">
                <input
                  id="login-username"
                  type="text"
                  className={inputClass}
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder={t('auth_username_placeholder')}
                  autoComplete="username"
                  spellCheck="false"
                  disabled={loading}
                />
              </Field>

              {/* Field 2: Password */}
              <Field label={t('auth_password_label')} htmlFor="login-password">
                <input
                  id="login-password"
                  type="password"
                  className={inputClass}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
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
                disabled={loading || !loginUsername.trim() || !loginPassword.trim()}
              >
                {loading ? 'Memverifikasi...' : t('auth_btn_login')}
              </Button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className="text-[0.8125rem] text-[var(--ink-soft)] hover:text-[var(--accent)]"
                >
                  {t('auth_switch_to_register')}
                </button>
              </div>
            </form>
          ) : null}

          {/* 2. FORM REGISTRASI: Full name, Username, Password, Confirm password */}
          {mode === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Field 1: Full name */}
              <Field label={t('auth_fullname_label')} htmlFor="reg-fullname">
                <input
                  id="reg-fullname"
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

              {/* Field 2: Username */}
              <Field label={t('auth_username_label')} htmlFor="reg-username">
                <input
                  id="reg-username"
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

              {/* Field 3: Password */}
              <Field label={t('auth_password_label')} htmlFor="reg-password">
                <input
                  id="reg-password"
                  type="password"
                  className={inputClass}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder={t('auth_password_placeholder')}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </Field>

              {/* Field 4: Confirm password */}
              <Field
                label={t('auth_confirm_password_label')}
                htmlFor="reg-confirm-password"
              >
                <input
                  id="reg-confirm-password"
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

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-[0.8125rem] text-[var(--ink-soft)] hover:text-[var(--accent)]"
                >
                  {t('auth_switch_to_login')}
                </button>
              </div>
            </form>
          ) : null}

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

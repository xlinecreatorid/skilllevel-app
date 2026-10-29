import { Button, Meter } from './ui.jsx';
import { useI18n } from '../lib/i18n.jsx';

export function Shell({
  view,
  views,
  onNavigate,
  level,
  xp,
  onOpenSettings,
  serverReady,
  user,
  onOpenAuth,
  onLogout,
  children,
}) {
  const { lang, setLang, t } = useI18n();

  const labels = {
    dashboard: t('nav_dashboard'),
    modul: t('nav_modules'),
    kuis: t('nav_quiz'),
    tutor: t('nav_tutor'),
    unggah: t('nav_upload'),
    progres: t('nav_progress'),
  };

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <a href="#konten" className="sl-skip">
        {t('skip_to_content')}
      </a>

      <header className="border-b border-[var(--rule)] bg-[var(--paper-raised)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-[1.375rem] leading-none tracking-tight text-[var(--ink)]">Skilllevel</span>
            <span className="hidden text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)] sm:inline">
              {t('app_subtitle')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden w-36 sm:block">
              <div className="mb-1 flex items-baseline justify-between text-[0.6875rem] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                <span>{level.name}</span>
                <span>{xp} XP</span>
              </div>
              <Meter value={level.percent} label={`Progres level ${level.name}`} />
            </div>

            {/* Pemilihan Bahasa: ID / EN */}
            <div className="flex items-center border border-[var(--rule-strong)] text-[0.75rem] font-semibold">
              <button
                type="button"
                onClick={() => setLang('id')}
                aria-pressed={lang === 'id'}
                className={`px-2 py-1 transition-colors ${
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
                className={`px-2 py-1 transition-colors ${
                  lang === 'en'
                    ? 'bg-[var(--accent)] text-[#fbf8f1]'
                    : 'bg-transparent text-[var(--ink-soft)] hover:bg-[var(--paper-sunk)]'
                }`}
              >
                EN
              </button>
            </div>

            {/* Tombol Pengaturan AI */}
            <Button variant="quiet" size="sm" onClick={onOpenSettings}>
              {t('btn_settings')}
              <span
                aria-hidden="true"
                className={`ml-1 inline-block h-1.5 w-1.5 rounded-full ${
                  serverReady ? 'bg-[var(--ok)]' : 'bg-[var(--accent)]'
                }`}
              />
            </Button>

            {/* Tombol Masuk / Profil Pengguna */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden font-mono text-[0.75rem] text-[var(--ink-soft)] sm:inline">
                  {user.email?.split('@')[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  {t('btn_logout')}
                </Button>
              </div>
            ) : (
              <Button variant="quiet" size="sm" onClick={onOpenAuth}>
                {t('btn_login')}
              </Button>
            )}
          </div>
        </div>

        <nav aria-label="Navigasi utama" className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <ul className="-mb-px flex flex-wrap gap-x-1 sm:flex-nowrap sm:overflow-x-auto">
            {views.map((item) => {
              const active = item === view;
              return (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item)}
                    aria-current={active ? 'page' : undefined}
                    className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-[0.875rem] transition-colors ${
                      active
                        ? 'border-[var(--accent)] font-semibold text-[var(--ink)]'
                        : 'border-transparent text-[var(--ink-faint)] hover:border-[var(--rule-strong)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {labels[item] || item}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {children}

      <footer className="border-t border-[var(--rule)] bg-[var(--paper-raised)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-[0.8125rem] text-[var(--ink-faint)] sm:px-8">
          <p>{t('footer_note')}</p>
          <p className="font-mono text-[0.75rem]">Skilllevel v2.1</p>
        </div>
      </footer>
    </div>
  );
}

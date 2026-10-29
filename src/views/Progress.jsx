import { Button, Card, EmptyState, Eyebrow, Meter, SectionHeading, Tag } from '../components/ui.jsx';
import { progressPercent } from '../lib/materials.js';
import { useI18n } from '../lib/i18n.jsx';

export function Progress({ materials, progress, level, onOpenModule, onStartQuiz }) {
  const { t } = useI18n();
  const percent = progressPercent(materials, progress.completedModules);
  const done = materials.filter((m) => progress.completedModules[m.id]).length;
  const quizzes = Object.entries(progress.quizResults);
  const average = quizzes.length ? Math.round(quizzes.reduce((sum, [, q]) => sum + q.percent, 0) / quizzes.length) : null;
  const best = quizzes.length ? quizzes.reduce((a, b) => (b[1].percent > a[1].percent ? b : a)) : null;

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow={t('prog_eyebrow')} title={t('prog_title')}>
        {t('prog_subtitle')}
      </SectionHeading>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <Eyebrow>{t('dash_level')}</Eyebrow>
          <p className="mt-1 font-serif text-[1.75rem] text-[var(--ink)]">{level.name}</p>
          <p className="mt-1 text-[0.8125rem] text-[var(--ink-faint)]">
            {level.next ? t('prog_level_next', { xp: level.toNext, next: level.next }) : t('prog_level_cap')}
          </p>
        </Card>
        <Card className="p-5">
          <Eyebrow>{t('dash_total_xp')}</Eyebrow>
          <p className="mt-1 font-serif text-[1.75rem] text-[var(--ink)]">{progress.xp}</p>
          <p className="mt-1 text-[0.8125rem] text-[var(--ink-faint)]">Modul 50 XP, kuis 30-110 XP</p>
        </Card>
        <Card className="p-5">
          <Eyebrow>{t('dash_completed_modules')}</Eyebrow>
          <p className="mt-1 font-serif text-[1.75rem] text-[var(--ink)]">
            {done}/{materials.length}
          </p>
          <p className="mt-1 text-[0.8125rem] text-[var(--ink-faint)]">{percent}% kurikulum</p>
        </Card>
        <Card className="p-5">
          <Eyebrow>{t('dash_quiz_avg')}</Eyebrow>
          <p className="mt-1 font-serif text-[1.75rem] text-[var(--ink)]">{average === null ? '0%' : `${average}%`}</p>
          <p className="mt-1 text-[0.8125rem] text-[var(--ink-faint)]">
            {best ? `Terbaik: ${best[1].percent}%` : 'Selesaikan kuis untuk evaluasi'}
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Eyebrow>Progres Total</Eyebrow>
          <span className="font-mono text-[0.8125rem] text-[var(--ink-faint)]">{percent}%</span>
        </div>
        <div className="mt-3">
          <Meter value={percent} label="Progres jalur belajar" />
        </div>
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-[var(--ink-faint)]">
          {t('dash_streak', { count: progress.streak.count })}
        </p>
      </Card>

      {quizzes.length === 0 ? (
        <EmptyState
          title={t('prog_quiz_empty')}
          action={
            <Button variant="primary" onClick={onStartQuiz}>
              {t('quiz_start_btn')}
            </Button>
          }
        >
          Setelah menyelesaikan kuis per modul, rekapitulasi nilai akan dicatat di sini.
        </EmptyState>
      ) : (
        <div>
          <Eyebrow>Rekapitulasi Nilai per Modul</Eyebrow>
          <ul className="mt-3 divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
            {quizzes.map(([id, result]) => {
              const material = materials.find((m) => m.id === id);
              return (
                <li key={id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[0.9375rem] text-[var(--ink)]">{material?.title || 'Modul'}</p>
                    <p className="text-[0.75rem] text-[var(--ink-faint)]">
                      {result.correct} dari {result.total} benar
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag tone={result.percent >= 80 ? 'ok' : result.percent >= 50 ? 'warn' : 'danger'}>
                      {result.percent}%
                    </Tag>
                    {material ? (
                      <Button variant="ghost" size="sm" onClick={() => onOpenModule(material.id)}>
                        Buka
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div>
        <Eyebrow>{t('prog_module_status')}</Eyebrow>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {materials.map((m) => {
            const isDone = Boolean(progress.completedModules[m.id]);
            return (
              <li key={m.id} className="flex items-center justify-between gap-2 border border-[var(--rule)] px-3 py-2">
                <span className="min-w-0 truncate text-[0.875rem] text-[var(--ink-soft)]">
                  {m.order ? `${String(m.order).padStart(2, '0')} · ${m.title}` : m.title}
                </span>
                <Tag tone={isDone ? 'ok' : 'neutral'}>{isDone ? t('mod_done_badge') : 'Belum'}</Tag>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

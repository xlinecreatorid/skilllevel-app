import { Button, Card, Eyebrow, Meter, SectionHeading, Tag } from '../components/ui.jsx';
import { nextUnfinished, progressPercent } from '../lib/materials.js';
import { useI18n } from '../lib/i18n.jsx';

function Stat({ label, value, note }) {
  return (
    <div className="border-l border-[var(--rule)] pl-4 first:border-l-0 first:pl-0">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">{label}</p>
      <p className="mt-1 font-serif text-[1.75rem] leading-none text-[var(--ink)]">{value}</p>
      {note ? <p className="mt-1 text-[0.75rem] text-[var(--ink-faint)]">{note}</p> : null}
    </div>
  );
}

export function Dashboard({ materials, progress, level, onOpenModule, onStartQuiz, onUpload, onTutor }) {
  const { t } = useI18n();
  const percent = progressPercent(materials, progress.completedModules);
  const done = materials.filter((m) => progress.completedModules[m.id]).length;
  const next = nextUnfinished(materials, progress.completedModules);
  const quizzes = Object.values(progress.quizResults);
  const average = quizzes.length ? Math.round(quizzes.reduce((sum, q) => sum + q.percent, 0) / quizzes.length) : null;

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
        <div>
          {t('dash_eyebrow') ? <Eyebrow>{t('dash_eyebrow')}</Eyebrow> : null}
          <h1
            className={`${t('dash_eyebrow') ? 'mt-3 ' : ''}text-[2.25rem] leading-[1.1] text-[var(--ink)] sm:text-[3rem]`}
          >
            {t('dash_title')}
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-[var(--ink-soft)]">
            {t('dash_desc')}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {next ? (
              <Button variant="primary" size="lg" onClick={() => onOpenModule(next.id)}>
                {t('dash_continue', { order: next.order, title: next.title })}
              </Button>
            ) : (
              <Button variant="primary" size="lg" onClick={onStartQuiz}>
                {t('dash_repeat_quiz')}
              </Button>
            )}
            <Button variant="quiet" size="lg" onClick={onTutor}>
              {t('dash_ask_tutor')}
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <Eyebrow>{t('dash_your_position')}</Eyebrow>
          <div className="mt-4 grid grid-cols-2 gap-5">
            <Stat
              label={t('dash_level')}
              value={level.name}
              note={level.next ? `${level.toNext} XP ke ${level.next}` : 'Level tertinggi'}
            />
            <Stat
              label={t('dash_total_xp')}
              value={progress.xp}
              note={t('dash_streak', { count: progress.streak.count })}
            />
            <Stat
              label={t('dash_completed_modules')}
              value={`${done}/${materials.length}`}
              note={`${percent}% selesai`}
            />
            <Stat
              label={t('dash_quiz_avg')}
              value={average === null ? '0%' : `${average}%`}
              note={`${quizzes.length} kuis`}
            />
          </div>
          <div className="mt-5">
            <Meter value={percent} label="Progres jalur belajar" />
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow={t('dash_curriculum_map')}
          title={t('dash_nine_modules')}
          aside={
            <Button variant="quiet" size="sm" onClick={onUpload}>
              {t('dash_add_custom')}
            </Button>
          }
        >
          {t('dash_nine_modules_desc')}
        </SectionHeading>

        <ol className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
          {materials.map((material) => {
            const isDone = Boolean(progress.completedModules[material.id]);
            const result = progress.quizResults[material.id];
            return (
              <li key={material.id}>
                <button
                  type="button"
                  onClick={() => onOpenModule(material.id)}
                  className="group flex w-full items-start gap-4 px-1 py-4 text-left transition-colors hover:bg-[var(--paper-raised)]"
                >
                  <span className="mt-0.5 w-8 shrink-0 font-mono text-[0.8125rem] text-[var(--ink-faint)]">
                    {material.order ? String(material.order).padStart(2, '0') : '··'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-[1.125rem] text-[var(--ink)] group-hover:text-[var(--accent)]">
                        {material.title}
                      </span>
                      {isDone ? <Tag tone="ok">{t('mod_done_badge')}</Tag> : null}
                      {result ? <Tag tone="accent">Kuis {result.percent}%</Tag> : null}
                      {material.source === 'unggahan' ? <Tag>Kustom</Tag> : null}
                    </span>
                    <span className="mt-1 block text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
                      {material.summary}
                    </span>
                    <span className="mt-1.5 block text-[0.75rem] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                      {material.topic} · {material.level} · {material.minutes} menit
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

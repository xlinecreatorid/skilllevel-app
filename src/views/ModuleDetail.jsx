import { useState } from 'react';
import { Button, Card, Eyebrow, Tag } from '../components/ui.jsx';
import { useI18n } from '../lib/i18n.jsx';

function Flashcards({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!cards.length) return null;
  const card = cards[index];

  const move = (delta) => {
    setFlipped(false);
    setIndex((prev) => (prev + delta + cards.length) % cards.length);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>Flashcard</Eyebrow>
        <span className="font-mono text-[0.75rem] text-[var(--ink-faint)]">
          {index + 1} / {cards.length}
        </span>
      </div>

      <div className="mt-3 min-h-[7rem] border border-[var(--rule)] bg-[var(--paper-sunk)] px-4 py-4">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          {flipped ? 'Jawaban' : 'Pertanyaan'}
        </p>
        <p className="mt-1.5 text-[1rem] leading-relaxed text-[var(--ink)]">{flipped ? card.back : card.front}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => setFlipped((v) => !v)} aria-pressed={flipped}>
          {flipped ? 'Lihat pertanyaan' : 'Lihat jawaban'}
        </Button>
        <Button variant="quiet" size="sm" onClick={() => move(-1)}>
          Sebelumnya
        </Button>
        <Button variant="quiet" size="sm" onClick={() => move(1)}>
          Berikutnya
        </Button>
      </div>
    </Card>
  );
}

export function ModuleDetail({ material, completed, quizResult, onBack, onComplete, onQuiz, onAsk, onDelete }) {
  const { t } = useI18n();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <article className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          {t('detail_back')}
        </Button>
      </div>

      <header className="border-b border-[var(--rule)] pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="accent">
            {material.order ? `Modul ${String(material.order).padStart(2, '0')}` : 'Modul Kustom'}
          </Tag>
          <Tag>{material.topic}</Tag>
          <Tag>{material.level}</Tag>
          <Tag>{material.minutes} menit</Tag>
          {completed ? <Tag tone="ok">{t('mod_done_badge')}</Tag> : null}
          {quizResult ? <Tag tone="accent">Kuis terbaik {quizResult.percent}%</Tag> : null}
        </div>
        <h1 className="mt-3 text-[2rem] leading-tight text-[var(--ink)] sm:text-[2.5rem]">{material.title}</h1>
        <p className="mt-3 max-w-3xl text-[1.0625rem] leading-relaxed text-[var(--ink-soft)]">{material.summary}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="primary" onClick={onQuiz}>
            {t('detail_take_quiz')}
          </Button>
          <Button variant="quiet" onClick={onAsk}>
            {t('detail_ask_tutor')}
          </Button>
          {!completed ? (
            <Button variant="quiet" onClick={onComplete}>
              {t('detail_mark_complete')}
            </Button>
          ) : null}
          {onDelete ? (
            confirmDelete ? (
              <span className="flex items-center gap-2">
                <Button variant="danger" size="sm" onClick={onDelete}>
                  {t('detail_confirm_delete')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  {t('btn_cancel')}
                </Button>
              </span>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
                {t('detail_delete_custom')}
              </Button>
            )
          ) : null}
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="space-y-8">
          <div>
            <Eyebrow>{t('detail_overview')}</Eyebrow>
            <p className="mt-2 text-[1.0625rem] leading-relaxed text-[var(--ink-soft)]">{material.overview}</p>
          </div>

          <div>
            <Eyebrow>{t('detail_steps')}</Eyebrow>
            <ol className="mt-3 space-y-4">
              {(material.stepByStepBreakdown || []).map((step, i) => (
                <li key={i} className="border-l-2 border-[var(--rule-strong)] pl-4">
                  <h3 className="text-[1.0625rem] text-[var(--ink)]">{step.step}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-[var(--ink-soft)]">{step.detail}</p>
                  {step.analogy ? (
                    <p className="mt-2 border-l border-[var(--accent)] pl-3 text-[0.875rem] italic leading-relaxed text-[var(--ink-faint)]">
                      {t('detail_analogy')}: {step.analogy}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          {(material.concreteExamples || []).length ? (
            <div>
              <Eyebrow>{t('detail_examples')}</Eyebrow>
              <div className="mt-3 space-y-3">
                {material.concreteExamples.map((example, i) => (
                  <Card key={i} className="p-4">
                    <h3 className="text-[1rem] text-[var(--ink)]">{example.title}</h3>
                    <p className="mt-1.5 whitespace-pre-wrap text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
                      {example.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <Eyebrow>{t('detail_key_points')}</Eyebrow>
            <ul className="mt-3 space-y-2">
              {(material.keyPoints || []).map((point, i) => (
                <li key={i} className="flex gap-2 text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 bg-[var(--accent)]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Flashcards cards={material.flashcards || []} />
        </aside>
      </section>
    </article>
  );
}

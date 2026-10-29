import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, EmptyState, Eyebrow, Meter, Notice, SectionHeading, Spinner, Tag, inputClass } from '../components/ui.jsx';
import { buildQuiz, scoreQuiz, xpForQuiz } from '../lib/quizRun.js';
import { useI18n } from '../lib/i18n.jsx';

const COUNTS = [7, 10];

export function QuizView({ materials, initialModuleId, level, settings, onRecord, onOpenModule }) {
  const { t } = useI18n();
  const [moduleId, setModuleId] = useState(initialModuleId || materials[0]?.id || '');
  const [count, setCount] = useState(10);
  const [phase, setPhase] = useState('idle');
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const abortRef = useRef(null);
  const headingRef = useRef(null);

  const material = useMemo(() => materials.find((m) => m.id === moduleId) || null, [materials, moduleId]);

  useEffect(() => {
    if (initialModuleId) setModuleId(initialModuleId);
  }, [initialModuleId]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const start = async () => {
    if (!material) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPhase('loading');
    setError('');
    setResult(null);
    setAnswers({});

    try {
      const built = await buildQuiz({
        material,
        count,
        levelName: level.name,
        settings,
        signal: controller.signal,
      });
      if (!built.questions.length) {
        setError(built.note || 'Modul ini belum punya cukup bahan untuk membuat soal.');
        setPhase('error');
        return;
      }
      setSession({ ...built, materialId: material.id, materialTitle: material.title });
      setPhase('running');
      requestAnimationFrame(() => headingRef.current?.focus());
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err?.message || 'Kuis tidak dapat disiapkan saat ini.');
      setPhase('error');
    }
  };

  const submit = () => {
    if (!session) return;
    const score = scoreQuiz(session.questions, answers);
    const xp = xpForQuiz(score.percent);
    setResult({ ...score, xp });
    setPhase('done');
    onRecord(session.materialId, { percent: score.percent, correct: score.correct, total: score.total, xp, at: new Date().toISOString() });
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = session ? answeredCount === session.questions.length : false;

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow={t('quiz_eyebrow')} title={t('quiz_title')}>
        {t('quiz_subtitle')}
      </SectionHeading>

      {phase === 'idle' || phase === 'error' ? (
        <Card className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="kuis-modul" className="mb-1 block text-[0.8125rem] font-semibold text-[var(--ink)]">
                {t('quiz_select_module')}
              </label>
              <select id="kuis-modul" className={inputClass} value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.order ? `${String(m.order).padStart(2, '0')} · ${m.title}` : m.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="kuis-jumlah" className="mb-1 block text-[0.8125rem] font-semibold text-[var(--ink)]">
                {t('quiz_select_count')}
              </label>
              <select
                id="kuis-jumlah"
                className={inputClass}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              >
                {COUNTS.map((n) => (
                  <option key={n} value={n}>
                    {t('quiz_count_label', { count: n })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {material ? (
            <div className="border border-[var(--rule)] bg-[var(--paper-sunk)] px-4 py-3">
              <p className="text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
                <span className="font-semibold text-[var(--ink)]">{material.title}</span> · {material.topic} ·{' '}
                {material.level}
              </p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--ink-faint)]">{material.summary}</p>
            </div>
          ) : null}

          {error ? <Notice tone="danger" title="Kuis Belum Siap">{error}</Notice> : null}

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={start} disabled={!material}>
              {t('quiz_start_btn')}
            </Button>
            {material ? (
              <Button variant="ghost" onClick={() => onOpenModule(material.id)}>
                {t('quiz_read_module_first')}
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      {phase === 'loading' ? (
        <Card className="flex items-center gap-3 p-6">
          <Spinner label="Menyiapkan bank soal..." />
        </Card>
      ) : null}

      {phase === 'running' && session ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] pb-3">
            <div>
              <Eyebrow>Sesi Aktif</Eyebrow>
              <p className="mt-1 font-serif text-[1.25rem] text-[var(--ink)]">{session.materialTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.8125rem] text-[var(--ink-faint)]">
                {t('quiz_answered_progress', { answered: answeredCount, total: session.questions.length })}
              </span>
            </div>
          </div>

          <Meter value={(answeredCount / session.questions.length) * 100} label="Progres pengerjaan" />

          <ol className="space-y-4">
            {session.questions.map((question, qIndex) => (
              <li key={qIndex}>
                <Card className="p-5">
                  <fieldset>
                    <legend className="text-[1rem] leading-relaxed text-[var(--ink)]">
                      <span className="mr-2 font-mono text-[0.8125rem] text-[var(--ink-faint)]">{qIndex + 1}.</span>
                      <span className="whitespace-pre-wrap">{question.question}</span>
                    </legend>
                    <div className="mt-3 space-y-2">
                      {question.options.map((option, oIndex) => {
                        const id = `q${qIndex}-o${oIndex}`;
                        const checked = answers[qIndex] === oIndex;
                        return (
                          <label
                            key={id}
                            htmlFor={id}
                            className={`flex cursor-pointer items-start gap-3 border px-3 py-2 text-[0.9375rem] leading-relaxed transition-colors ${
                              checked
                                ? 'border-[var(--accent)] bg-[var(--accent-wash)] text-[var(--ink)]'
                                : 'border-[var(--rule)] text-[var(--ink-soft)] hover:border-[var(--rule-strong)] hover:bg-[var(--paper-sunk)]'
                            }`}
                          >
                            <input
                              id={id}
                              type="radio"
                              name={`soal-${qIndex}`}
                              className="mt-1 h-4 w-4 accent-[var(--accent)]"
                              checked={checked}
                              onChange={() => setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))}
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </Card>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--rule)] pt-4">
            <Button variant="primary" onClick={submit} disabled={!allAnswered}>
              {t('quiz_submit_btn')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setPhase('idle');
                setSession(null);
                setAnswers({});
              }}
            >
              {t('btn_cancel')}
            </Button>
            {!allAnswered ? (
              <p className="text-[0.8125rem] text-[var(--ink-faint)]">
                {t('quiz_unanswered_warn', { count: session.questions.length - answeredCount })}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {phase === 'done' && session && result ? (
        <div className="space-y-5">
          <Card className="p-6">
            <div ref={headingRef} tabIndex={-1} className="outline-none">
              <Eyebrow>{t('quiz_result_title')}</Eyebrow>
              <h3 className="mt-1 text-[1.75rem] text-[var(--ink)]">
                {t('quiz_score_summary', { correct: result.correct, total: result.total, percent: result.percent })}
              </h3>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Tag tone="ok">+{result.xp} XP</Tag>
              <Button variant="primary" size="sm" onClick={start}>
                {t('btn_retry')}
              </Button>
              <Button variant="quiet" size="sm" onClick={() => onOpenModule(session.materialId)}>
                Modul Terkait
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPhase('idle');
                  setSession(null);
                  setResult(null);
                }}
              >
                Pilih Modul Lain
              </Button>
            </div>
          </Card>

          <div>
            <Eyebrow>{t('quiz_review_heading')}</Eyebrow>
            <ol className="mt-3 space-y-3">
              {session.questions.map((question, qIndex) => {
                const picked = answers[qIndex];
                const correct = picked === question.correctIndex;
                return (
                  <li key={qIndex}>
                    <Card className="p-4">
                      <div className="flex items-start gap-2">
                        <Tag tone={correct ? 'ok' : 'danger'}>{correct ? 'Benar' : 'Salah'}</Tag>
                        <p className="flex-1 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-[var(--ink)]">
                          {question.question}
                        </p>
                      </div>
                      <dl className="mt-3 space-y-1.5 text-[0.875rem] leading-relaxed">
                        <div className="flex gap-2">
                          <dt className="w-28 shrink-0 text-[var(--ink-faint)]">{t('quiz_your_answer')}</dt>
                          <dd className={correct ? 'text-[var(--ok)]' : 'text-[var(--danger)]'}>
                            {question.options[picked] ?? 'Tidak dijawab'}
                          </dd>
                        </div>
                        {!correct ? (
                          <div className="flex gap-2">
                            <dt className="w-28 shrink-0 text-[var(--ink-faint)]">{t('quiz_correct_answer')}</dt>
                            <dd className="text-[var(--ink)]">{question.options[question.correctIndex]}</dd>
                          </div>
                        ) : null}
                        <div className="flex gap-2">
                          <dt className="w-28 shrink-0 text-[var(--ink-faint)]">{t('quiz_explanation')}</dt>
                          <dd className="text-[var(--ink-soft)]">{question.explanation}</dd>
                        </div>
                      </dl>
                    </Card>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      ) : null}

      {!materials.length ? (
        <EmptyState title="Belum ada modul" action={<Button onClick={() => onOpenModule('')}>{t('btn_back')}</Button>}>
          Tambahkan modul terlebih dahulu sebelum membuat kuis.
        </EmptyState>
      ) : null}
    </div>
  );
}

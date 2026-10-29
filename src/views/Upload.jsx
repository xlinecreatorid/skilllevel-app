import { useRef, useState } from 'react';
import { Button, Card, Eyebrow, Notice, SectionHeading, Spinner, Tag } from '../components/ui.jsx';
import { completeJson } from '../lib/aiClient.js';
import { ALLOWED_EXT, MAX_FILE_BYTES, extractText } from '../lib/extract.js';
import { buildAnalysisPrompt, buildFallbackModule, sanitizeAnalysis } from '../lib/module.js';
import { useI18n } from '../lib/i18n.jsx';

const STEPS = {
  idle: 'Pilih berkas',
  reading: 'Membaca berkas',
  analyzing: 'Menyusun modul',
  done: 'Selesai',
};

export function Upload({ settings, serverInfo, onAdd, onOpenModule, onNotice }) {
  const { t } = useI18n();
  const [phase, setPhase] = useState('idle');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const reset = () => {
    setPhase('idle');
    setError('');
    setNote('');
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setNote('');
    setResult(null);
    setPhase('reading');

    let text;
    try {
      text = await extractText(file);
    } catch (err) {
      setError(err?.message || 'Berkas tidak dapat dibaca.');
      setPhase('idle');
      return;
    }

    const title = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Modul unggahan';
    const topic = 'Kustom';

    if (!serverInfo?.hasServerKey && !settings?.apiKey) {
      const fallback = buildFallbackModule(title, text, topic);
      const material = { ...fallback, id: `up-${Date.now()}`, title, source: 'unggahan', order: null, level: 'Umum', minutes: 12 };
      setResult(material);
      setPhase('done');
      return;
    }

    setPhase('analyzing');
    const { systemInstruction, prompt } = buildAnalysisPrompt(title, topic, text);
    try {
      const raw = await completeJson({
        system: systemInstruction,
        messages: [{ role: 'user', content: prompt }],
        settings,
      });
      const clean = sanitizeAnalysis(raw, topic);
      if (!clean) throw new Error('Model tidak mengembalikan struktur modul yang valid.');
      const material = {
        ...clean,
        id: `up-${Date.now()}`,
        title,
        source: 'unggahan',
        order: null,
        level: 'Umum',
        minutes: Math.max(6, Math.min(40, Math.round(text.length / 1800))),
      };
      setResult(material);
      setPhase('done');
    } catch (err) {
      const fallback = buildFallbackModule(title, text, topic);
      setResult({ ...fallback, id: `up-${Date.now()}`, title, source: 'unggahan', order: null, level: 'Umum', minutes: 12 });
      setPhase('done');
    }
  };

  const save = () => {
    if (!result) return;
    onAdd(result);
    onNotice?.({
      tone: 'accent',
      title: 'Modul ditambahkan',
      body: `"${result.title}" berhasil ditambahkan ke jalur belajar Anda.`,
    });
    onOpenModule(result.id);
  };

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow={t('upload_eyebrow')} title={t('upload_title')}>
        {t('upload_subtitle')}
      </SectionHeading>

      <Card className="p-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`border border-dashed px-6 py-10 text-center transition-colors ${
            dragging ? 'border-[var(--accent)] bg-[var(--accent-wash)]' : 'border-[var(--rule-strong)] bg-[var(--paper-sunk)]'
          }`}
        >
          <Eyebrow>Format Terverifikasi</Eyebrow>
          <p className="mt-2 font-serif text-[1.25rem] text-[var(--ink)]">{t('upload_drop_title')}</p>
          <p className="mx-auto mt-2 max-w-md text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
            {t('upload_limit_note', { formats: ALLOWED_EXT.map((e) => `.${e}`).join(', ') })}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={() => inputRef.current?.click()} disabled={phase === 'reading' || phase === 'analyzing'}>
              {t('upload_select_btn')}
            </Button>
            {phase !== 'idle' ? (
              <Button variant="ghost" onClick={reset}>
                {t('upload_reset_btn')}
              </Button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={ALLOWED_EXT.map((e) => `.${e}`).join(',')}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[0.8125rem] text-[var(--ink-faint)]">
          <span className="font-semibold uppercase tracking-[0.12em]">Status</span>
          <Tag tone={phase === 'done' ? 'ok' : phase === 'idle' ? 'neutral' : 'accent'}>{STEPS[phase]}</Tag>
          <span>Maksimal {Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB</span>
        </div>

        {phase === 'reading' || phase === 'analyzing' ? (
          <div className="mt-4">
            <Spinner label={phase === 'reading' ? 'Membaca dokumen' : 'Menyusun langkah dan materi modul'} />
          </div>
        ) : null}

        {error ? (
          <div className="mt-4">
            <Notice tone="danger" title="Berkas Gagal Diproses">
              {error}
            </Notice>
          </div>
        ) : null}
      </Card>

      {result ? (
        <Card className="p-6">
          <Eyebrow>{t('upload_preview_heading')}</Eyebrow>
          <h3 className="mt-1 text-[1.5rem] leading-snug text-[var(--ink)]">{result.title}</h3>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--ink-soft)]">{result.summary}</p>

          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">Langkah</dt>
              <dd className="font-serif text-[1.25rem] text-[var(--ink)]">{result.stepByStepBreakdown?.length ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">Poin penting</dt>
              <dd className="font-serif text-[1.25rem] text-[var(--ink)]">{result.keyPoints?.length ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">Flashcard</dt>
              <dd className="font-serif text-[1.25rem] text-[var(--ink)]">{result.flashcards?.length ?? 0}</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="primary" onClick={save}>
              {t('upload_save_btn')}
            </Button>
            <Button variant="ghost" onClick={reset}>
              {t('btn_cancel')}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

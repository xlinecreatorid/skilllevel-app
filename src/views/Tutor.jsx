import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, EmptyState, Eyebrow, Notice, SectionHeading, Spinner, Tag, inputClass } from '../components/ui.jsx';
import { Markdown } from '../components/Markdown.jsx';
import { stream } from '../lib/aiClient.js';
import { useI18n } from '../lib/i18n.jsx';
import {
  buildChatMessages,
  buildContext,
  buildLocalAnswer,
  buildSuggestions,
  buildSystemPrompt,
} from '../lib/chatContext.js';

export function Tutor({ materials, chat, settings, serverInfo, focusModuleId, onFocusChange, onChatChange, onOpenModule }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const material = useMemo(
    () => materials.find((m) => m.id === focusModuleId) || null,
    [materials, focusModuleId]
  );
  const suggestions = useMemo(() => buildSuggestions(material), [material]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [chat.length, busy]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text) => {
    const question = (text ?? draft).trim();
    if (!question || busy) return;

    setDraft('');
    setError('');
    setBusy(true);

    const ctx = buildContext(material, question, chat);
    const userMessage = { role: 'user', text: question, at: Date.now() };
    const assistantId = `a-${Date.now()}`;
    const base = [...chat, userMessage];
    onChatChange([...base, { id: assistantId, role: 'assistant', text: '', kind: 'pending', at: Date.now() }]);

    const controller = new AbortController();
    abortRef.current = controller;

    const finish = (patch) => {
      onChatChange((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m))
      );
    };

    if (!serverInfo?.hasServerKey && !settings?.apiKey) {
      finish({
        text: buildLocalAnswer(question, material, ctx),
        kind: 'offline',
      });
      setBusy(false);
      return;
    }

    try {
      let acc = '';
      await stream({
        system: buildSystemPrompt(material, ctx),
        messages: buildChatMessages(chat, question),
        settings,
        signal: controller.signal,
        onDelta: (chunk) => {
          acc += chunk;
          finish({ text: acc, kind: 'streaming' });
        },
      });
      if (!acc.trim()) {
        finish({ text: buildLocalAnswer(question, material, ctx), kind: 'offline' });
      } else {
        finish({ text: acc, kind: 'answer' });
      }
    } catch (err) {
      if (controller.signal.aborted) {
        finish({ text: 'Permintaan dihentikan.', kind: 'error' });
      } else {
        setError(err?.message || 'Tutor tidak dapat dihubungi saat ini.');
        finish({
          text: buildLocalAnswer(question, material, ctx),
          kind: 'offline',
        });
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow={t('tutor_eyebrow')} title={t('tutor_title')}>
        {t('tutor_subtitle')}
      </SectionHeading>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
        <Card className="flex min-h-[26rem] flex-col p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--rule)] px-5 py-3">
            <div className="flex items-center gap-2">
              <Eyebrow>{t('tutor_conversation')}</Eyebrow>
              {material ? <Tag tone="accent">{material.title}</Tag> : <Tag>{t('tutor_no_focus')}</Tag>}
            </div>
            {chat.length ? (
              <Button variant="ghost" size="sm" onClick={() => onChatChange([])}>
                {t('tutor_clear_history')}
              </Button>
            ) : null}
          </div>

          <div className="sl-scroll flex-1 space-y-4 overflow-y-auto px-5 py-4" aria-live="polite">
            {chat.length === 0 ? (
              <EmptyState title={t('tutor_empty_title')}>
                {t('tutor_empty_desc')}
              </EmptyState>
            ) : (
              chat.map((message) => (
                <div key={message.id || `${message.role}-${message.at}`} className="space-y-1">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                    {message.role === 'user' ? t('tutor_you') : t('tutor_ai')}
                  </p>
                  <div
                    className={`border-l-2 pl-3 ${
                      message.role === 'user' ? 'border-[var(--rule-strong)]' : 'border-[var(--accent)]'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-[var(--ink)]">
                        {message.text}
                      </p>
                    ) : message.kind === 'pending' ? (
                      <Spinner label="Menyusun penjelasan" />
                    ) : (
                      <>
                        <Markdown text={message.text} />
                        {message.kind === 'streaming' ? <span className="sl-caret" aria-hidden="true" /> : null}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[var(--rule)] px-5 py-4">
            {error ? (
              <div className="mb-3">
                <Notice tone="danger" title="Kendala Jaringan">
                  {error}
                </Notice>
              </div>
            ) : null}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="space-y-2"
            >
              <label htmlFor="tutor-input" className="sr-only">
                {t('tutor_input_placeholder')}
              </label>
              <textarea
                id="tutor-input"
                ref={inputRef}
                className={`${inputClass} min-h-[4.5rem] resize-y`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={t('tutor_input_placeholder')}
                rows={3}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" variant="primary" disabled={busy || !draft.trim()}>
                  {busy ? 'Mengirim...' : t('btn_send')}
                </Button>
                {busy ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      abortRef.current?.abort();
                    }}
                  >
                    {t('btn_stop')}
                  </Button>
                ) : null}
                <p className="text-[0.75rem] text-[var(--ink-faint)]">{t('tutor_input_hint')}</p>
              </div>
            </form>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="p-4">
            <label htmlFor="tutor-fokus" className="mb-1 block text-[0.8125rem] font-semibold text-[var(--ink)]">
              {t('tutor_focus_label')}
            </label>
            <select
              id="tutor-fokus"
              className={inputClass}
              value={focusModuleId || ''}
              onChange={(e) => onFocusChange(e.target.value || null)}
            >
              <option value="">{t('tutor_no_focus')}</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.order ? `${String(m.order).padStart(2, '0')} · ${m.title}` : m.title}
                </option>
              ))}
            </select>
            {material ? (
              <div className="mt-3">
                <Button variant="quiet" size="sm" onClick={() => onOpenModule(material.id)}>
                  {t('tutor_open_focused_module')}
                </Button>
              </div>
            ) : null}
          </Card>

          {suggestions.length ? (
            <Card className="p-4">
              <Eyebrow>{t('tutor_suggestions_heading')}</Eyebrow>
              <ul className="mt-2 space-y-1.5">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => send(s)}
                      disabled={busy}
                      className="w-full border border-[var(--rule)] px-3 py-2 text-left text-[0.8125rem] leading-relaxed text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-wash)] hover:text-[var(--ink)] disabled:opacity-50"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

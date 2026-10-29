import { useEffect, useRef, useState } from 'react';
import { Button, Field, Notice, Tag, inputClass } from './ui.jsx';
import { endpointProblem, modelProblem } from '../lib/endpoint.js';
import { useI18n } from '../lib/i18n.jsx';

export function SettingsDialog({
  open,
  onClose,
  settings,
  onSave,
  customKey,
  onCustomKeyChange,
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(settings);
  const [provider, setProvider] = useState(settings.provider || 'openai');
  const [error, setError] = useState('');
  const firstField = useRef(null);

  useEffect(() => {
    if (!open) return;
    setDraft(settings);
    setProvider(settings.provider || 'openai');
    setError('');

    const timer = setTimeout(() => firstField.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, [open, settings]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isSelfProviderConfigured = Boolean(
    (draft.endpoint && draft.endpoint.trim()) ||
    (customKey && customKey.trim()) ||
    (draft.model && draft.model.trim())
  );

  const handleResetToBuiltin = () => {
    setDraft((prev) => ({
      ...prev,
      endpoint: '',
      model: '',
    }));
    setProvider('openai');
    onCustomKeyChange('');
    setError('');
  };

  const submit = (event) => {
    event.preventDefault();
    const endpoint = draft.endpoint ? draft.endpoint.trim() : '';
    if (endpoint) {
      const problem = endpointProblem(endpoint);
      if (problem) {
        setError(problem);
        return;
      }
    }

    const model = draft.model ? draft.model.trim() : '';
    if (model) {
      const modelIssue = modelProblem(model);
      if (modelIssue) {
        setError(modelIssue);
        return;
      }
    }

    onSave({ ...draft, endpoint, model, provider });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1b1a17]/45 px-4 py-8 sm:py-14">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="sl-enter w-full max-w-2xl border border-[var(--rule-strong)] bg-[var(--paper-raised)] shadow-[0_18px_50px_-24px_rgba(27,26,23,0.55)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--rule)] px-6 py-5">
          <div>
            <h2 id="settings-title" className="text-[1.375rem] text-[var(--ink)]">
              {t('set_title')}
            </h2>
            <p className="mt-1 text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
              {t('set_desc')}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={t('btn_close')}>
            {t('btn_close')}
          </Button>
        </div>

        <form onSubmit={submit} className="space-y-5 px-6 py-5">
          {/* Banner Status Konfigurasi AI */}
          <div className="flex flex-wrap items-center justify-between gap-2 border border-[var(--rule)] bg-[var(--paper-sunk)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Tag tone={isSelfProviderConfigured ? 'accent' : 'ok'}>
                {isSelfProviderConfigured ? t('set_self_provider_active') : t('set_builtin_active')}
              </Tag>
            </div>
            <p className="text-[0.8125rem] text-[var(--ink-soft)]">
              {isSelfProviderConfigured
                ? t('set_self_provider_desc')
                : t('set_builtin_models_desc')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t('set_provider_label')}
              htmlFor="settings-provider"
              hint={t('set_provider_hint')}
            >
              <select
                id="settings-provider"
                ref={firstField}
                className={inputClass}
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="openai">OpenAI Compatible</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </Field>

            <Field
              label={t('set_model_label')}
              htmlFor="settings-model"
              hint={t('set_model_hint')}
            >
              <input
                id="settings-model"
                className={inputClass}
                value={draft.model || ''}
                onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                placeholder={t('set_model_placeholder')}
                autoComplete="off"
                spellCheck="false"
              />
            </Field>
          </div>

          <Field
            label={t('set_endpoint_label')}
            htmlFor="settings-endpoint"
            hint={t('set_endpoint_hint')}
          >
            <input
              id="settings-endpoint"
              className={inputClass}
              value={draft.endpoint || ''}
              onChange={(e) => setDraft({ ...draft, endpoint: e.target.value })}
              placeholder={t('set_endpoint_placeholder')}
              autoComplete="off"
              spellCheck="false"
            />
          </Field>

          <Field
            label={t('set_key_label')}
            htmlFor="settings-key"
            hint={t('set_key_hint')}
          >
            <input
              id="settings-key"
              type="password"
              className={inputClass}
              value={customKey}
              onChange={(e) => onCustomKeyChange(e.target.value)}
              placeholder={t('set_key_placeholder')}
              autoComplete="off"
              spellCheck="false"
            />
          </Field>

          <fieldset className="space-y-3 border border-[var(--rule)] px-4 py-3">
            <legend className="px-1 text-[0.8125rem] font-semibold text-[var(--ink)]">
              {t('set_behavior_legend')}
            </legend>

            <label className="flex items-start gap-3 text-[0.875rem] text-[var(--ink-soft)]">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--accent)]"
                checked={draft.streaming !== false}
                onChange={(e) => setDraft({ ...draft, streaming: e.target.checked })}
              />
              <span>
                <span className="font-semibold text-[var(--ink)]">{t('set_stream_label')}</span>
                <br />
                {t('set_stream_hint')}
              </span>
            </label>

            <div className="flex items-center gap-2 pt-1 text-[0.8125rem] text-[var(--ink-faint)]">
              <span className="h-2 w-2 rounded-full bg-[var(--ok)]" />
              <span>{t('set_loop_prevention')}</span>
            </div>
          </fieldset>

          {error ? <Notice tone="danger">{error}</Notice> : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--rule)] pt-4">
            <div>
              {isSelfProviderConfigured ? (
                <button
                  type="button"
                  onClick={handleResetToBuiltin}
                  className="text-[0.8125rem] font-medium text-[var(--ink-soft)] underline decoration-[var(--rule-strong)] underline-offset-4 hover:text-[var(--accent)]"
                >
                  {t('set_reset_builtin')}
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose}>
                {t('btn_cancel')}
              </Button>
              <Button type="submit" variant="primary">
                {t('btn_save')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

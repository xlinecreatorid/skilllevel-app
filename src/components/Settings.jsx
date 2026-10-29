import { useEffect, useRef, useState } from 'react';
import { Button, Field, Notice, Tag, inputClass } from './ui.jsx';
import { endpointProblem, modelProblem } from '../lib/endpoint.js';
import { useI18n } from '../lib/i18n.jsx';

const PRESET_FREE_MODELS = [
  {
    id: 'mercury-3',
    name: 'Mercury-3 (Inception Labs)',
    endpoint: 'https://api.inceptionlabs.ai/v1',
    provider: 'openai',
  },
  {
    id: 'agnes-2.5-flash',
    name: 'Agnes 2.5 Flash',
    endpoint: 'https://apihub.agnes-ai.com/v1',
    provider: 'openai',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Google Gemini 2.0 Flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/v1',
    provider: 'gemini',
  },
];

export function SettingsDialog({ open, onClose, settings, onSave, serverInfo, customKey, onCustomKeyChange }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(settings);
  const [selectedFreeModel, setSelectedFreeModel] = useState('');
  const [provider, setProvider] = useState(settings.provider || 'openai');
  const [error, setError] = useState('');
  const firstField = useRef(null);

  useEffect(() => {
    if (!open) return;
    setDraft(settings);
    setProvider(settings.provider || 'openai');
    setError('');

    // Deteksi apakah setting cocok dengan model gratis
    const found = PRESET_FREE_MODELS.find(
      (m) => m.endpoint === settings.endpoint && m.id === settings.model
    );
    setSelectedFreeModel(found ? found.id : '');

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

  const handleFreeModelChange = (modelId) => {
    setSelectedFreeModel(modelId);
    if (!modelId) return;

    const preset = PRESET_FREE_MODELS.find((m) => m.id === modelId);
    if (preset) {
      setDraft((prev) => ({
        ...prev,
        endpoint: preset.endpoint,
        model: preset.id,
      }));
      setProvider(preset.provider);
      setError('');
    }
  };

  const submit = (event) => {
    event.preventDefault();
    const endpoint = draft.endpoint.trim();
    const problem = endpointProblem(endpoint);
    if (problem) {
      setError(problem);
      return;
    }
    const model = draft.model.trim();
    const modelIssue = modelProblem(model);
    if (modelIssue) {
      setError(modelIssue);
      return;
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
          <div className="flex flex-wrap items-center justify-between gap-2 border border-[var(--rule)] bg-[var(--paper-sunk)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Tag tone={serverInfo?.hasServerKey ? 'ok' : 'neutral'}>
                {serverInfo?.hasServerKey ? 'Server Key Siap' : 'Kunci Bawaan Tersedia'}
              </Tag>
              {serverInfo?.fallbackKeysCount ? (
                <Tag tone="accent">{serverInfo.fallbackKeysCount} Fallback Key</Tag>
              ) : null}
            </div>
            <p className="text-[0.8125rem] text-[var(--ink-soft)]">
              {t('set_e2ee_badge')}
            </p>
          </div>

          <Field
            label={t('set_free_models_label')}
            htmlFor="settings-free-model"
            hint={t('set_free_models_hint')}
          >
            <select
              id="settings-free-model"
              ref={firstField}
              className={inputClass}
              value={selectedFreeModel}
              onChange={(e) => handleFreeModelChange(e.target.value)}
            >
              <option value="">-- Pilih Model AI Gratis --</option>
              {PRESET_FREE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id})
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t('set_provider_label')}
              htmlFor="settings-provider"
              hint="Dukungan protokol: OpenAI, Anthropic Claude, atau Google Gemini."
            >
              <select
                id="settings-provider"
                className={inputClass}
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="openai">OpenAI Compatible / Inception Labs</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </Field>

            <Field
              label={t('set_model_label')}
              htmlFor="settings-model"
              hint="Contoh: mercury-3, agnes-2.5-flash, claude-3-5-sonnet."
            >
              <input
                id="settings-model"
                className={inputClass}
                value={draft.model}
                onChange={(e) => {
                  setDraft({ ...draft, model: e.target.value });
                  setSelectedFreeModel('');
                }}
                placeholder={serverInfo?.defaultModel || 'mercury-3'}
                autoComplete="off"
                spellCheck="false"
              />
            </Field>
          </div>

          <Field
            label={t('set_endpoint_label')}
            htmlFor="settings-endpoint"
            hint="Alamat endpoint HTTPS publik yang melayani chat completions atau messages API."
          >
            <input
              id="settings-endpoint"
              className={inputClass}
              value={draft.endpoint}
              onChange={(e) => {
                setDraft({ ...draft, endpoint: e.target.value });
                setSelectedFreeModel('');
              }}
              placeholder={serverInfo?.defaultEndpoint || 'https://api.inceptionlabs.ai/v1'}
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
              placeholder="Kosongkan jika memakai kunci server atau model gratis tanpa auth"
              autoComplete="off"
              spellCheck="false"
            />
          </Field>

          <fieldset className="space-y-3 border border-[var(--rule)] px-4 py-3">
            <legend className="px-1 text-[0.8125rem] font-semibold text-[var(--ink)]">
              Perilaku Permintaan & Keamanan
            </legend>

            <label className="flex items-start gap-3 text-[0.875rem] text-[var(--ink-soft)]">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--accent)]"
                checked={draft.streaming}
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

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--rule)] pt-4">
            <Button variant="ghost" onClick={onClose}>
              {t('btn_cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {t('btn_save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

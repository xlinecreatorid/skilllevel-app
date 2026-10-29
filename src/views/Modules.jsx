import { useMemo, useState } from 'react';
import { Button, Card, EmptyState, SectionHeading, Tag, inputClass } from '../components/ui.jsx';
import { useI18n } from '../lib/i18n.jsx';

export function Modules({ materials, progress, onOpen, onUpload }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('semua');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      if (filter === 'selesai' && !progress.completedModules[m.id]) return false;
      if (filter === 'belum' && progress.completedModules[m.id]) return false;
      if (!q) return true;
      return `${m.title} ${m.topic} ${m.summary}`.toLowerCase().includes(q);
    });
  }, [materials, progress.completedModules, query, filter]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={t('nav_modules')}
        title={t('mod_list_title')}
        aside={
          <Button variant="quiet" size="sm" onClick={onUpload}>
            {t('dash_add_custom')}
          </Button>
        }
      >
        {t('dash_nine_modules_desc')}
      </SectionHeading>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="cari-modul" className="mb-1 block text-[0.8125rem] font-semibold text-[var(--ink)]">
            {t('btn_search')}
          </label>
          <input
            id="cari-modul"
            className={inputClass}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('mod_search_placeholder')}
            type="search"
          />
        </div>
        <div>
          <label htmlFor="filter-modul" className="mb-1 block text-[0.8125rem] font-semibold text-[var(--ink)]">
            Status
          </label>
          <select
            id="filter-modul"
            className={inputClass}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="semua">{t('mod_status_all')}</option>
            <option value="belum">{t('mod_status_incomplete')}</option>
            <option value="selesai">{t('mod_status_complete')}</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={t('mod_empty_title')}
          action={
            <Button
              variant="quiet"
              onClick={() => {
                setQuery('');
                setFilter('semua');
              }}
            >
              {t('mod_reset_filter')}
            </Button>
          }
        >
          {t('mod_empty_desc')}
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((material) => {
            const isDone = Boolean(progress.completedModules[material.id]);
            const result = progress.quizResults[material.id];
            return (
              <li key={material.id}>
                <Card className="flex h-full flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[0.75rem] text-[var(--ink-faint)]">
                      {material.order ? `Modul ${String(material.order).padStart(2, '0')}` : 'Modul Kustom'}
                    </span>
                    <div className="flex gap-1.5">
                      {isDone ? <Tag tone="ok">{t('mod_done_badge')}</Tag> : null}
                      {result ? <Tag tone="accent">{result.percent}%</Tag> : null}
                    </div>
                  </div>
                  <h3 className="mt-2 text-[1.25rem] leading-snug text-[var(--ink)]">{material.title}</h3>
                  <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">{material.summary}</p>
                  <p className="mt-3 text-[0.75rem] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                    {material.topic} · {material.level} · {material.minutes} menit
                  </p>
                  <div className="mt-4">
                    <Button variant="quiet" size="sm" onClick={() => onOpen(material.id)}>
                      {t('mod_open_btn')}
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { forwardRef } from 'react';

const base =
  'inline-flex items-center justify-center gap-2 rounded-sm border transition-colors disabled:cursor-not-allowed disabled:opacity-45';

const variants = {
  primary: 'border-[var(--accent)] bg-[var(--accent)] text-[#fbf8f1] hover:bg-[var(--accent-ink)]',
  quiet: 'border-[var(--rule-strong)] bg-transparent text-[var(--ink)] hover:bg-[var(--paper-sunk)]',
  ghost: 'border-transparent bg-transparent text-[var(--ink-soft)] hover:bg-[var(--paper-sunk)] hover:text-[var(--ink)]',
  danger: 'border-[var(--danger)] bg-transparent text-[var(--danger)] hover:bg-[var(--danger-wash)]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-[0.8125rem]',
  md: 'px-4 py-2 text-[0.9375rem]',
  lg: 'px-5 py-2.5 text-[1rem]',
};

export const Button = forwardRef(function Button(
  { variant = 'quiet', size = 'md', className = '', type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  );
});

export function Card({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag
      className={`border border-[var(--rule)] bg-[var(--paper-raised)] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, className = '' }) {
  return (
    <p
      className={`text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)] ${className}`}
    >
      {children}
    </p>
  );
}

export function Tag({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-[var(--rule-strong)] text-[var(--ink-soft)]',
    accent: 'border-[var(--accent)] text-[var(--accent)]',
    ok: 'border-[var(--ok)] text-[var(--ok)]',
    warn: 'border-[var(--warn)] text-[var(--warn)]',
    danger: 'border-[var(--danger)] text-[var(--danger)]',
  };
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Meter({ value, label }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-1.5 w-full bg-[var(--paper-sunk)]"
    >
      <div className="h-full bg-[var(--accent)] transition-[width] duration-300" style={{ width: `${safe}%` }} />
    </div>
  );
}

export function Spinner({ label = 'Memuat' }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.8125rem] text-[var(--ink-faint)]">
      <span
        aria-hidden="true"
        className="h-3 w-3 animate-spin rounded-full border border-[var(--rule-strong)] border-t-[var(--accent)]"
      />
      {label}
    </span>
  );
}

export function Notice({ tone = 'neutral', title, children, action }) {
  const tones = {
    neutral: 'border-[var(--rule-strong)] bg-[var(--paper-sunk)]',
    accent: 'border-[var(--accent)] bg-[var(--accent-wash)]',
    ok: 'border-[var(--ok)] bg-[var(--ok-wash)]',
    warn: 'border-[var(--warn)] bg-[var(--warn-wash)]',
    danger: 'border-[var(--danger)] bg-[var(--danger-wash)]',
  };
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={`border-l-2 px-4 py-3 ${tones[tone]}`}>
      {title ? <p className="text-[0.9375rem] font-semibold text-[var(--ink)]">{title}</p> : null}
      <div className="text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">{children}</div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="border border-dashed border-[var(--rule-strong)] px-6 py-10 text-center">
      <p className="font-serif text-[1.125rem] text-[var(--ink)]">{title}</p>
      <div className="mx-auto mt-2 max-w-md text-[0.875rem] leading-relaxed text-[var(--ink-faint)]">{children}</div>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Field({ label, hint, htmlFor, children, error }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[0.8125rem] font-semibold text-[var(--ink)]">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[0.75rem] text-[var(--danger)]">{error}</p>
      ) : hint ? (
        <p className="text-[0.75rem] leading-relaxed text-[var(--ink-faint)]">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  'w-full border border-[var(--rule-strong)] bg-[var(--paper-raised)] px-3 py-2 text-[0.9375rem] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

export function SectionHeading({ eyebrow, title, children, aside }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--rule)] pb-4">
      <div className="max-w-2xl">
        {eyebrow ? <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow> : null}
        <h2 className="text-[1.75rem] leading-tight text-[var(--ink)] sm:text-[2rem]">{title}</h2>
        {children ? <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--ink-soft)]">{children}</p> : null}
      </div>
      {aside}
    </div>
  );
}

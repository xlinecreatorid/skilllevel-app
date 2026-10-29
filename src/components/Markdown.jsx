// Perender markdown aman untuk jawaban AI: sanitasi HTML, URL aman,
// penanganan streaming tak utuh, dan pencegahan kebocoran sintaks.

import { Fragment } from 'react';

const SAFE_URL_RE = /^https?:\/\/[^\s<>"'`]+$/i;

function sanitizeText(raw) {
  return String(raw ?? '')
    .replace(/<system>[\s\S]*?<\/system>/gi, '')
    .replace(/\[SYSTEM\s+PROMPT[\s\S]*?\]/gi, '')
    .replace(/<[^>]*>/g, ''); // Buang tag HTML mentah untuk proteksi XSS
}

function renderInline(text, keyPrefix) {
  const clean = sanitizeText(text);
  const nodes = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(([^)]+)\))/g;
  let last = 0;
  let match;
  let index = 0;

  while ((match = pattern.exec(clean)) !== null) {
    if (match.index > last) {
      nodes.push(clean.slice(last, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${index++}`;

    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('[')) {
      const label = token.slice(1, token.indexOf(']'));
      const href = match[2]?.trim();
      if (SAFE_URL_RE.test(href)) {
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noreferrer noopener">
            {label}
          </a>
        );
      } else {
        nodes.push(label);
      }
    }
    last = match.index + token.length;
  }

  if (last < clean.length) {
    nodes.push(clean.slice(last));
  }
  return nodes;
}

export function Markdown({ text = '' }) {
  if (!text) return null;

  // Tangani blok kode ganjil (ketika streaming belum menutup backticks)
  let raw = String(text);
  const codeBlockCount = (raw.match(/```/g) || []).length;
  if (codeBlockCount % 2 === 1) {
    raw += '\n```';
  }

  const blocks = raw.split(/```/);

  return (
    <div className="sl-prose">
      {blocks.map((block, blockIndex) => {
        if (blockIndex % 2 === 1) {
          const newline = block.indexOf('\n');
          const code = newline === -1 ? block : block.slice(newline + 1);
          return (
            <pre key={`code-${blockIndex}`} className="sl-scroll">
              <code>{code.replace(/\n$/, '')}</code>
            </pre>
          );
        }

        const lines = block.split('\n');
        const out = [];
        let list = null;

        const flushList = () => {
          if (!list) return;
          const Tag = list.ordered ? 'ol' : 'ul';
          out.push(
            <Tag key={`list-${out.length}`}>
              {list.items.map((item, i) => (
                <li key={i}>{renderInline(item, `li-${blockIndex}-${out.length}-${i}`)}</li>
              ))}
            </Tag>
          );
          list = null;
        };

        lines.forEach((line, lineIndex) => {
          const trimmed = line.trim();
          const bullet = trimmed.match(/^[-*]\s+(.*)$/);
          const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);

          if (bullet || numbered) {
            const ordered = Boolean(numbered);
            if (!list || list.ordered !== ordered) {
              flushList();
              list = { ordered, items: [] };
            }
            list.items.push((bullet || numbered)[1]);
            return;
          }

          flushList();
          if (!trimmed) return;

          const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
          if (heading) {
            const level = Math.min(4, heading[1].length + 2);
            const Tag = `h${level}`;
            out.push(
              <Tag key={`h-${blockIndex}-${lineIndex}`} className="mt-4 mb-1 text-[1.0625rem] text-[var(--ink)]">
                {renderInline(heading[2], `h-${blockIndex}-${lineIndex}`)}
              </Tag>
            );
            return;
          }

          out.push(
            <p key={`p-${blockIndex}-${lineIndex}`} className="my-1.5">
              {renderInline(trimmed, `p-${blockIndex}-${lineIndex}`)}
            </p>
          );
        });

        flushList();
        return <Fragment key={`block-${blockIndex}`}>{out}</Fragment>;
      })}
    </div>
  );
}

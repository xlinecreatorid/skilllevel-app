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

function parseTableRow(line) {
  let content = line.trim();
  if (content.startsWith('|')) content = content.slice(1);
  if (content.endsWith('|')) content = content.slice(0, -1);
  return content.split('|').map((c) => c.trim());
}

function isTableDelimiter(line) {
  const cells = parseTableRow(line);
  return cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));
}

function isTableLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.includes('|');
}

function groupBlockElements(lines) {
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Pemisah horizontal: ---, ***, ___
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      elements.push({ type: 'hr' });
      i++;
      continue;
    }

    // Judul heading markdown (# .. ####)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      elements.push({
        type: 'heading',
        level: Math.min(4, headingMatch[1].length + 2),
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    // Kutipan blockquote (> ...)
    const quoteMatch = trimmed.match(/^>\s*(.*)$/);
    if (quoteMatch) {
      elements.push({
        type: 'quote',
        text: quoteMatch[1],
      });
      i++;
      continue;
    }

    // Tabel markdown (mendeteksi baris tabel dan baris pembatas)
    if (isTableLine(trimmed)) {
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) {
        j++;
      }
      if (j < lines.length && isTableLine(lines[j]) && isTableDelimiter(lines[j])) {
        const headers = parseTableRow(trimmed);
        const rows = [];
        let k = j + 1;
        while (k < lines.length) {
          const nextTrimmed = lines[k].trim();
          if (!nextTrimmed) {
            let lookAhead = k + 1;
            while (lookAhead < lines.length && !lines[lookAhead].trim()) {
              lookAhead++;
            }
            if (lookAhead < lines.length && isTableLine(lines[lookAhead]) && !isTableDelimiter(lines[lookAhead])) {
              k++;
              continue;
            } else {
              break;
            }
          }
          if (isTableLine(nextTrimmed) && !isTableDelimiter(nextTrimmed)) {
            rows.push(parseTableRow(nextTrimmed));
            k++;
          } else {
            break;
          }
        }
        elements.push({
          type: 'table',
          headers,
          rows,
        });
        i = k;
        continue;
      }
    }

    // Daftar bernomor atau poin bulet
    const bullet = trimmed.match(/^[-*]\s+(.*)$/);
    const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const items = [(bullet || numbered)[1]];
      let nextIdx = i + 1;
      while (nextIdx < lines.length) {
        const nextTrimmed = lines[nextIdx].trim();
        if (!nextTrimmed) {
          nextIdx++;
          continue;
        }
        const nextItem = ordered
          ? nextTrimmed.match(/^\d+[.)]\s+(.*)$/)
          : nextTrimmed.match(/^[-*]\s+(.*)$/);
        if (nextItem) {
          items.push(nextItem[1]);
          nextIdx++;
        } else {
          break;
        }
      }
      elements.push({
        type: 'list',
        ordered,
        items,
      });
      i = nextIdx;
      continue;
    }

    // Paragraf teks biasa
    elements.push({
      type: 'paragraph',
      text: trimmed,
    });
    i++;
  }

  return elements;
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
        const elements = groupBlockElements(lines);

        return (
          <Fragment key={`block-${blockIndex}`}>
            {elements.map((el, elIndex) => {
              const elKey = `el-${blockIndex}-${elIndex}`;

              if (el.type === 'hr') {
                return <hr key={elKey} />;
              }

              if (el.type === 'heading') {
                const Tag = `h${el.level}`;
                return (
                  <Tag key={elKey} className="mt-4 mb-1 text-[1.0625rem] text-[var(--ink)]">
                    {renderInline(el.text, `${elKey}-h`)}
                  </Tag>
                );
              }

              if (el.type === 'quote') {
                return (
                  <blockquote
                    key={elKey}
                    className="border-l-2 border-[var(--accent)] pl-3 my-2 text-[var(--ink-soft)] italic"
                  >
                    {renderInline(el.text, `${elKey}-q`)}
                  </blockquote>
                );
              }

              if (el.type === 'table') {
                return (
                  <div key={elKey} className="sl-table-container">
                    <table>
                      <thead>
                        <tr>
                          {el.headers.map((h, i) => (
                            <th key={i}>{renderInline(h, `${elKey}-th-${i}`)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {el.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx}>{renderInline(cell, `${elKey}-td-${rIdx}-${cIdx}`)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              if (el.type === 'list') {
                const Tag = el.ordered ? 'ol' : 'ul';
                return (
                  <Tag key={elKey}>
                    {el.items.map((item, i) => (
                      <li key={i}>{renderInline(item, `${elKey}-li-${i}`)}</li>
                    ))}
                  </Tag>
                );
              }

              return (
                <p key={elKey} className="my-1.5">
                  {renderInline(el.text, `${elKey}-p`)}
                </p>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
}

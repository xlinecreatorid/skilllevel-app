// Modul pencegahan kebocoran system prompt, harness control, dan proteksi repetisi.

const INJECTION_PATTERNS = [
  /\b(?:ignore|forget|disregard)\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|prompts|rules)\b/i,
  /\b(?:repeat|show|display|print|reveal|output|leak|dump)\s+(?:your\s+)?(?:system\s+prompt|instructions|initial\s+prompt|context)\b/i,
  /\b(?:what\s+are\s+your|what\s+is\s+your)\s+(?:instructions|system\s+prompt|hidden\s+prompt)\b/i,
  /\b(?:verbatim|word\s+for\s+word)\s+(?:repeat|output)\s+(?:above|system)\b/i,
  /\b(?:system\s+directive|harness\s+control|anthropic_version|openai_api_key)\b/i,
  /\b(?:sk-[A-Za-z0-9_-]{8,}|AIza[0-9A-Za-z_-]{10,})\b/,
];

const LEAK_PATTERNS = [
  /\[SYSTEM\s+PROMPT[\s\S]*?\]/gi,
  /<system>[\s\S]*?<\/system>/gi,
  /\bAI_API_KEY\b/g,
  /\bAI_BASE_URL\b/g,
  /\bAI_MODEL\b/g,
  /\bAI_API_KEY_FALLBACKS\b/g,
  /\bSERVER_ENCRYPTION_KEY\b/g,
  /\bBearer\s+[A-Za-z0-9._~+/-]{8,}=*/gi,
  /\bsk-[A-Za-z0-9_-]{8,}\b/g,
  /\bAIza[0-9A-Za-z_-]{10,}\b/g,
];

export function inspectInput(text = '') {
  const content = String(text ?? '');
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      return {
        safe: false,
        reason: 'Permintaan dibatalkan karena memuat pola instruksi yang tidak diizinkan.',
      };
    }
  }
  return { safe: true };
}

export function sanitizeAiOutput(text = '', secrets = [], systemSnippet = '') {
  let output = String(text ?? '');

  for (const pattern of LEAK_PATTERNS) {
    output = output.replace(pattern, '[terlindungi]');
  }

  for (const secret of secrets) {
    if (typeof secret === 'string' && secret.length >= 6) {
      output = output.split(secret).join('[terlindungi]');
    }
  }

  if (systemSnippet && systemSnippet.length >= 20) {
    const lines = systemSnippet.split('\n').map((l) => l.trim()).filter((l) => l.length > 25);
    for (const line of lines) {
      if (output.includes(line)) {
        output = output.split(line).join('[konten internal dilindungi]');
      }
    }
  }

  return output;
}

/** Detektor repetisi (looping) untuk memotong respons model yang berulang tanpa henti. */
export function createLoopDetector({ maxRepetitions = 3 } = {}) {
  const phraseCounts = new Map();
  let buffer = '';
  let stopped = false;

  return {
    push(chunk) {
      if (stopped) return { accept: false, text: '', stopped: true };
      const normalizedChunk = String(chunk ?? '').trim();
      buffer += (buffer.length ? ' ' : '') + normalizedChunk;

      if (normalizedChunk.length >= 10) {
        const count = (phraseCounts.get(normalizedChunk) || 0) + 1;
        phraseCounts.set(normalizedChunk, count);

        if (count >= maxRepetitions) {
          stopped = true;
          return {
            accept: false,
            text: '\n\n[Respons dihentikan untuk mencegah looping berulang]',
            stopped: true,
          };
        }
      }

      // Deteksi kalimat berulang dari buffer
      const sentences = buffer.split(/(?<=[.!?\n])\s+/);
      for (const s of sentences) {
        const clean = s.trim();
        if (clean.length >= 15) {
          const sCount = (phraseCounts.get(clean) || 0) + 1;
          phraseCounts.set(clean, sCount);
          if (sCount >= maxRepetitions) {
            stopped = true;
            return {
              accept: false,
              text: '\n\n[Respons dihentikan untuk mencegah looping berulang]',
              stopped: true,
            };
          }
        }
      }

      return { accept: true, text: chunk, stopped: false };
    },
    isStopped() {
      return stopped;
    },
    filterFullText(text) {
      const lines = text.split('\n');
      const filtered = [];
      let repeatCount = 0;
      let lastLine = '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && trimmed === lastLine) {
          repeatCount += 1;
          if (repeatCount >= maxRepetitions) continue;
        } else {
          repeatCount = 0;
          lastLine = trimmed;
        }
        filtered.push(line);
      }
      return filtered.join('\n');
    },
  };
}

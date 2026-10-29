// Pembuatan kuis yang selalu berasal dari modul yang dipilih:
// - prompt AI berisi seluruh modul (bukan potongan awal saja) dan menyesuaikan level pengguna
// - validasi + pengacakan opsi (jawaban benar tidak selalu di posisi yang sama)
// - generator cadangan lokal yang memakai isi modul itu sendiri (bukan soal bawaan)

import { sampleText, extractDefinitions, parseJsonLoose } from './module.js';

export const QUIZ_COUNTS = [7, 10];
export const QUIZ_CONTEXT_LIMIT = 22000;

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
const uniq = (a) => [...new Set(a)];
const clip = (s, n = 170) => {
  const t = String(s).trim();
  return t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, '') + '…';
};

export function shuffle(arr, rnd = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Konteks modul untuk prompt ----------
export function buildModuleContext(material) {
  const m = material || {};
  const parts = [];
  if (m.summary) parts.push(`RINGKASAN:\n${m.summary}`);
  if (m.overview) parts.push(`GAMBARAN UMUM:\n${m.overview}`);
  (m.stepByStepBreakdown || []).forEach((s) =>
    parts.push(`${s.step}\n${s.detail || ''}${s.analogy ? `\nAnalogi: ${s.analogy}` : ''}`)
  );
  (m.concreteExamples || []).forEach((e) => parts.push(`CONTOH - ${e.title}:\n${e.description}`));
  if ((m.keyPoints || []).length) parts.push(`POIN PENTING:\n${m.keyPoints.map((p) => `- ${p}`).join('\n')}`);
  const structured = parts.join('\n\n');
  const room = Math.max(4000, QUIZ_CONTEXT_LIMIT - structured.length);
  const raw = m.text ? `\n\nTEKS DOKUMEN ASLI:\n${sampleText(m.text, room)}` : '';
  return structured + raw;
}

const LEVEL_FOCUS = {
  Pemula: 'pemahaman istilah, definisi, dan fungsi dasar',
  Menengah: 'hubungan antar konsep dan penerapan pada contoh dari modul',
  Mahir: 'analisis contoh/kode/kasus, urutan proses, dan penyebab-akibat',
  Ahli: 'evaluasi, perbandingan, kasus tepi, dan penalaran lintas bagian modul',
};

export function buildQuizPrompt(material, count, levelName = 'Pemula') {
  return {
    systemInstruction: `Anda adalah penyusun soal evaluasi. Semua soal HARUS bisa dijawab dari MODUL yang diberikan dan tidak boleh membutuhkan pengetahuan di luar modul. Gunakan istilah, nama, dan kode persis seperti di modul. Keluarkan JSON valid saja dalam Bahasa Indonesia.`,
    prompt: `Buat TEPAT ${count} soal pilihan ganda dari modul "${material.title}".
Level pengguna: ${levelName} → fokuskan soal pada ${LEVEL_FOCUS[levelName] || LEVEL_FOCUS.Pemula}.

Aturan:
- Sebarkan soal ke seluruh bagian modul (jangan hanya bagian awal) dan jangan ada soal kembar.
- Tepat 4 opsi; hanya satu yang benar menurut modul. Opsi salah harus masuk akal tetapi jelas salah menurut modul.
- Dilarang memakai opsi "semua benar", "semua salah", atau "tidak ada jawaban".
- Panjang opsi benar dan salah dibuat sebanding; variasikan posisi jawaban benar.
- "explanation" menjelaskan mengapa benar dengan merujuk isi modul. "source" berisi nama bagian modul yang menjadi dasar soal.

Format JSON PERSIS (array):
[
  { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "...", "source": "nama bagian modul" }
]

MODUL:
"""
${buildModuleContext(material)}
"""`,
  };
}

// ---------- Validasi hasil AI ----------
function resolveCorrectIndex(q, options) {
  let c = q.correctIndex ?? q.correct_index ?? q.answerIndex ?? q.correct ?? q.answer ?? q.correctAnswer;
  if (typeof c === 'number' && Number.isInteger(c)) return c;
  if (typeof c === 'string') {
    const t = c.trim();
    if (/^\d+$/.test(t)) return Number(t);
    if (/^[A-Da-d][).]?$/.test(t)) return t.toUpperCase().charCodeAt(0) - 65;
    const idx = options.findIndex((o) => norm(o) === norm(t));
    if (idx !== -1) return idx;
  }
  return -1;
}

export function sanitizeQuestions(raw, rnd = Math.random) {
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.questions) ? raw.questions : [];
  const seen = new Set();
  const out = [];
  for (const q of list) {
    if (!q || typeof q !== 'object') continue;
    const question = typeof q.question === 'string' ? q.question.trim() : '';
    const options = Array.isArray(q.options) ? q.options.map((o) => (typeof o === 'string' ? o : String(o ?? '')).trim()) : [];
    if (!question || options.length < 3 || options.some((o) => !o)) continue;
    if (new Set(options.map(norm)).size !== options.length) continue;
    const ci = resolveCorrectIndex(q, options);
    if (ci < 0 || ci >= options.length) continue;
    if (seen.has(norm(question))) continue;
    seen.add(norm(question));

    // Batasi 4 opsi dengan tetap menyertakan jawaban benar
    let opts = options.map((text, i) => ({ text, correct: i === ci }));
    if (opts.length > 4) {
      const wrong = shuffle(opts.filter((o) => !o.correct), rnd).slice(0, 3);
      opts = opts.filter((o) => o.correct).concat(wrong);
    }
    opts = shuffle(opts, rnd);
    out.push({
      question,
      options: opts.map((o) => o.text),
      correctIndex: opts.findIndex((o) => o.correct),
      explanation: typeof q.explanation === 'string' && q.explanation.trim() ? q.explanation.trim() : 'Sesuai dengan isi modul.',
      source: typeof q.source === 'string' ? q.source.trim() : '',
      origin: 'ai',
    });
  }
  return out;
}

export function parseQuizResponse(text) {
  return sanitizeQuestions(parseJsonLoose(text));
}

// ---------- Generator lokal dari isi modul ----------
const stepName = (s) => String(s || '').replace(/^\s*(langkah|tahap|bagian|step)\s*\d+\s*[:.\-)]?\s*/i, '').trim();
const firstSentences = (s, n = 2) => String(s).trim().split(/(?<=[.!?])\s+/).slice(0, n).join(' ').trim();

const TECH_TERM = /\b(?:[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)+|[A-Za-z]+[0-9][A-Za-z0-9]*|[A-Za-z]*[a-z][A-Z][A-Za-z]*|[A-Z]{2,}[A-Za-z]*)\b/g;

function buildItems(material) {
  const items = [];
  const m = material || {};
  const steps = (m.stepByStepBreakdown || []).filter((s) => s.step);
  const defs = extractDefinitions(m.text || '');

  const pools = {
    flash: [],
    detail: [],
    analogy: [],
    def: [],
    stepNames: steps.map((s) => s.step),
  };

  (m.flashcards || []).forEach((f) => f.front && f.back && pools.flash.push(f.back));
  steps.forEach((s) => {
    if (s.detail) pools.detail.push(firstSentences(s.detail));
    if (s.analogy) pools.analogy.push(s.analogy);
  });
  defs.forEach((d) => pools.def.push(d.definition));

  const all = uniq([...pools.flash, ...pools.detail, ...pools.analogy, ...pools.def, ...(m.keyPoints || [])]).filter(Boolean);

  (m.flashcards || []).forEach((f) => {
    if (f.front && f.back)
      items.push({ cat: 'flash', question: f.front, correct: f.back, near: pools.flash, label: 'Flashcard', explanation: `Menurut modul: ${f.back}` });
  });

  steps.forEach((s) => {
    const name = stepName(s.step) || s.step;
    if (s.detail) {
      const d = firstSentences(s.detail);
      items.push({
        cat: 'detail',
        question: `Pada bagian "${name}", apa yang dijelaskan modul?`,
        correct: d,
        near: pools.detail,
        label: s.step,
        explanation: `Modul menjelaskan pada "${s.step}": ${d}`,
      });
      items.push({
        cat: 'reverse',
        question: `Bagian modul manakah yang membahas hal berikut?\n"${clip(d, 150)}"`,
        correct: s.step,
        near: pools.stepNames,
        noFar: true,
        label: s.step,
        explanation: `Penjelasan tersebut terdapat pada "${s.step}".`,
      });
    }
    if (s.analogy) {
      items.push({
        cat: 'analogy',
        question: `Analogi manakah yang dipakai modul untuk menjelaskan "${name}"?`,
        correct: s.analogy,
        near: pools.analogy,
        label: s.step,
        explanation: `Modul menggunakan analogi ini pada "${s.step}".`,
      });
    }
  });

  defs.forEach((d) => {
    items.push({
      cat: 'def',
      question: `Menurut modul, apa yang dimaksud dengan ${d.term}?`,
      correct: d.definition,
      near: pools.def,
      label: 'Definisi',
      explanation: `${d.term}: ${d.definition}`,
    });
  });

  // Soal isian dari poin penting: kosongkan istilah teknis
  const vocab = uniq([...(m.keyPoints || []), ...(m.flashcards || []).map((f) => f.back)].join(' ').match(TECH_TERM) || []);
  if (vocab.length >= 3) {
    (m.keyPoints || []).forEach((kp) => {
      const terms = (kp.match(TECH_TERM) || []).filter((t) => t.length >= 4);
      if (!terms.length) return;
      const term = terms[0];
      const others = vocab.filter((v) => norm(v) !== norm(term));
      items.push({
        cat: 'cloze',
        question: `Lengkapi pernyataan berikut sesuai modul:\n"${kp.replace(term, '_____')}"`,
        correct: term,
        near: others,
        noFar: true,
        label: 'Poin penting',
        explanation: `Pernyataan lengkapnya: ${kp}`,
      });
    });
  }

  return { items, all };
}

export function generateLocalQuiz(material, count, excludeQuestions = new Set(), rnd = Math.random) {
  const { items, all } = buildItems(material);
  const byCat = {};
  for (const it of items) {
    if (excludeQuestions.has(norm(it.question))) continue;
    (byCat[it.cat] ||= []).push(it);
  }
  const queues = Object.values(byCat).map((q) => shuffle(q, rnd));

  const out = [];
  const usedCorrect = new Set();
  const usedQ = new Set();
  let guard = 0;
  while (out.length < count && queues.some((q) => q.length) && guard++ < 1000) {
    for (const q of queues) {
      if (out.length >= count) break;
      const it = q.shift();
      if (!it) continue;
      if (usedCorrect.has(norm(it.correct)) || usedQ.has(norm(it.question))) continue;

      const wrongOk = (d) => d && norm(d) !== norm(it.correct) && !norm(it.correct).includes(norm(d)) && !norm(d).includes(norm(it.correct));
      const near = shuffle(uniq(it.near.filter(wrongOk)), rnd);
      const far = it.noFar ? [] : shuffle(uniq(all.filter(wrongOk)), rnd);
      const distractors = uniq([...near, ...far.filter((d) => !near.includes(d))]).slice(0, 3);
      if (distractors.length < 2) continue; // minimal 3 opsi

      const opts = shuffle([{ text: clip(it.correct), correct: true }, ...distractors.map((d) => ({ text: clip(d), correct: false }))], rnd);
      if (new Set(opts.map((o) => norm(o.text))).size !== opts.length) continue;

      usedCorrect.add(norm(it.correct));
      usedQ.add(norm(it.question));
      out.push({
        question: it.question,
        options: opts.map((o) => o.text),
        correctIndex: opts.findIndex((o) => o.correct),
        explanation: it.explanation,
        source: it.label,
        origin: 'local',
      });
    }
  }
  return shuffle(out, rnd);
}

// Gabungkan soal AI dengan soal lokal bila AI memberi kurang dari jumlah yang diminta
export function assembleQuiz(aiQuestions, material, count, rnd = Math.random) {
  const ai = aiQuestions.slice(0, count);
  let questions = ai;
  if (ai.length < count) {
    const exclude = new Set(ai.map((q) => norm(q.question)));
    questions = ai.concat(generateLocalQuiz(material, count - ai.length, exclude, rnd));
  }
  return {
    questions,
    aiCount: questions.filter((q) => q.origin === 'ai').length,
    localCount: questions.filter((q) => q.origin === 'local').length,
    requested: count,
  };
}

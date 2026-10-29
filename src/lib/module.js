// Analisis materi -> modul belajar: prompt, validasi hasil AI, dan modul cadangan (tanpa AI)
// yang dibuat murni dari teks dokumen yang diunggah.

export const ANALYSIS_TEXT_LIMIT = 24000;

const str = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v)) return v.map(str).filter(Boolean).join('\n');
  if (typeof v === 'object') return Object.values(v).map(str).filter(Boolean).join(' ');
  return String(v).trim();
};

// Ambil cuplikan merata dari seluruh dokumen bila terlalu panjang (bukan hanya bagian awal)
export function sampleText(text = '', limit = ANALYSIS_TEXT_LIMIT) {
  const t = String(text);
  if (t.length <= limit) return t;
  const parts = 6;
  const size = Math.floor(limit / parts);
  const step = Math.floor((t.length - size) / (parts - 1));
  const out = [];
  for (let i = 0; i < parts; i++) out.push(t.slice(i * step, i * step + size));
  return out.join('\n[...]\n');
}

export function cleanDocText(text = '') {
  return String(text).replace(/--- Halaman \d+ ---/g, ' ').replace(/[ \t]+/g, ' ');
}

export function splitSentences(text = '') {
  return cleanDocText(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 25);
}

const DEF_RE = /^\s*([A-Za-z0-9\u00C0-\u00FF][^,:;()]{1,60}?)\s+(adalah|merupakan|yaitu|ialah|disebut|didefinisikan sebagai)\s+(.{15,300}?)\s*$/i;

export function extractDefinitions(text = '') {
  const out = [];
  const seen = new Set();
  for (const s of splitSentences(text)) {
    const m = s.match(DEF_RE);
    if (!m) continue;
    const term = m[1].trim();
    if (term.split(/\s+/).length > 7) continue;
    const def = m[3].replace(/[.!?]+$/, '').trim();
    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ term, definition: def.charAt(0).toUpperCase() + def.slice(1) });
  }
  return out;
}

export function buildAnalysisPrompt(title, topic, text) {
  return {
    systemInstruction: `Anda adalah Pakar Kurikulum & Pengajar Senior. Anda menyusun modul belajar HANYA dari dokumen yang diberikan.
Aturan: jangan menambahkan fakta, istilah, atau kode yang tidak ada di dokumen; kutip nama, istilah, dan kode persis seperti di dokumen; tulis dalam Bahasa Indonesia; keluarkan JSON valid saja.`,
    prompt: `Judul: ${title}
Isi dokumen${text.length > ANALYSIS_TEXT_LIMIT ? ' (cuplikan merata dari seluruh dokumen)' : ''}:
"""
${sampleText(text)}
"""

Susun modul dengan format JSON PERSIS:
{
  "summary": "Ringkasan 2-3 kalimat tentang isi dokumen ini.",
  "overview": "Penjelasan konsep utama dokumen secara runtut.",
  "stepByStepBreakdown": [
    { "step": "Langkah 1: nama bagian sesuai dokumen", "detail": "Penjelasan rinci bagian ini", "analogy": "Analogi dunia nyata yang sederhana" }
  ],
  "concreteExamples": [
    { "title": "Judul contoh", "description": "Contoh kode/skenario yang ADA di dokumen" }
  ],
  "keyPoints": ["Poin penting dari dokumen"],
  "flashcards": [ { "front": "Pertanyaan", "back": "Jawaban dari dokumen" } ],
  "topic": "${topic || 'Umum'}"
}
Ketentuan: 3-8 langkah mengikuti struktur dokumen, 5-10 poin penting, 6-10 flashcard. Jika dokumen tidak memuat kode/contoh, isi "concreteExamples" dengan [].`,
  };
}

export function parseJsonLoose(text = '') {
  const t = String(text).replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(t);
  } catch {
    /* lanjut: cari blok JSON di dalam teks */
  }
  const o = [t.indexOf('{'), t.lastIndexOf('}')];
  const a = [t.indexOf('['), t.lastIndexOf(']')];
  const candidates = [];
  if (o[0] !== -1 && o[1] > o[0]) candidates.push(t.slice(o[0], o[1] + 1));
  if (a[0] !== -1 && a[1] > a[0]) candidates.push(t.slice(a[0], a[1] + 1));
  candidates.sort((x, y) => y.length - x.length);
  for (const c of candidates) {
    try {
      return JSON.parse(c);
    } catch {
      /* coba kandidat berikutnya */
    }
  }
  return null;
}

// Pastikan semua field bertipe benar agar React tidak crash ("Objects are not valid as a React child")
export function sanitizeAnalysis(raw, topicFallback = 'Umum') {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const arr = (v) => (Array.isArray(v) ? v : []);

  const stepByStepBreakdown = arr(raw.stepByStepBreakdown)
    .map((o) =>
      typeof o === 'string'
        ? { step: o, detail: '', analogy: '' }
        : { step: str(o?.step || o?.title || o?.name), detail: str(o?.detail || o?.description), analogy: str(o?.analogy) }
    )
    .filter((s) => s.step || s.detail);

  const concreteExamples = arr(raw.concreteExamples)
    .map((o) =>
      typeof o === 'string'
        ? { title: 'Contoh', description: o }
        : { title: str(o?.title || o?.name) || 'Contoh', description: str(o?.description || o?.code || o?.content) }
    )
    .filter((e) => e.description);

  const keyPoints = arr(raw.keyPoints).map(str).filter(Boolean);
  const flashcards = arr(raw.flashcards)
    .map((f) => ({ front: str(f?.front || f?.question), back: str(f?.back || f?.answer) }))
    .filter((f) => f.front && f.back);

  const result = {
    summary: str(raw.summary),
    overview: str(raw.overview),
    stepByStepBreakdown,
    concreteExamples,
    keyPoints,
    flashcards,
    topic: str(raw.topic) || topicFallback,
  };
  if (!result.summary && !result.overview && !stepByStepBreakdown.length) return null;
  if (!result.summary) result.summary = result.overview.slice(0, 250);
  return result;
}

const clip = (s, n) => (s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, '') + '…');

// Modul cadangan (tanpa AI) yang tetap berisi bagian-bagian dari dokumen, bukan teks generik
export function buildFallbackModule(title, text, topic = 'Umum') {
  const clean = cleanDocText(text).trim();

  // Baris pertama sering berupa judul dokumen tanpa tanda baca akhir. Baris itu dipisahkan
  // agar tidak menempel pada ringkasan dan gambaran umum.
  const firstLine = clean.split('\n')[0].trim();
  const looksLikeHeading = firstLine.length > 0 && firstLine.length <= 80 && !/[.!?:]$/.test(firstLine);
  // Penanda heading markdown dibuang supaya tidak muncul sebagai teks mentah di modul.
  const body = (looksLikeHeading ? clean.slice(firstLine.length) : clean)
    .replace(/^#{1,6}\s+/gm, '')
    .trim();

  const sentences = splitSentences(body);
  const defs = extractDefinitions(body);

  const summary = clip(sentences.slice(0, 2).join(' ') || body, 320) || `Ringkasan untuk ${title}`;
  // Gambaran umum dirangkai dari kalimat utuh supaya judul bagian tidak menempel di tengah kalimat.
  const overview = clip(sentences.join(' ') || body, 1200);

  // Bagian: pakai judul bernomor/berlabel bila ada, jika tidak bagi rata menjadi 3 bagian
  const lines = body.split('\n');
  const headRe = /^\s*((?:\d+[.)]|bab|langkah|tahap|bagian|step)\s*\d*[.):-]?\s*.{3,80})$/i;
  const sections = [];
  let cur = null;
  for (const line of lines) {
    if (headRe.test(line) && line.trim().length <= 90) {
      cur = { step: line.trim(), body: [] };
      sections.push(cur);
    } else if (cur && line.trim()) cur.body.push(line.trim());
  }
  let steps = sections
    .filter((s) => s.body.join(' ').length > 30)
    .slice(0, 8)
    .map((s) => ({ step: s.step, detail: clip(s.body.join(' '), 450), analogy: '' }));

  if (steps.length < 2 && sentences.length >= 3) {
    const groups = Math.min(3, sentences.length);
    // Pembagian dibuat seimbang supaya tidak ada bagian yang hanya berisi satu kalimat.
    const base = Math.floor(sentences.length / groups);
    const extra = sentences.length % groups;
    let cursor = 0;
    steps = Array.from({ length: groups }, (_, i) => {
      const size = base + (i < extra ? 1 : 0);
      const part = sentences.slice(cursor, cursor + size);
      cursor += size;
      if (!part.length) return null;
      const lead = (part[0] || '').replace(/[.!?]+$/, '');
      // Kalimat pertama dipakai sebagai judul bagian, jadi isinya tidak diulang di detail.
      const rest = part.slice(1);
      // Bila bagian hanya berisi satu kalimat, judulnya dibuat netral agar kalimat itu tidak tampil dua kali.
      return rest.length
        ? { step: `Bagian ${i + 1}: ${clip(lead, 60)}`, detail: clip(rest.join(' '), 450), analogy: '' }
        : { step: `Bagian ${i + 1}`, detail: clip(part.join(' '), 450), analogy: '' };
    }).filter((s) => s && s.detail);
  }

  // Poin penting: definisi lebih dulu, lalu kalimat tersebar merata di dokumen
  const keyPoints = defs.slice(0, 4).map((d) => `${d.term}: ${d.definition}`);
  const words = (s) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]+/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 4)
    );
  const overlaps = (a, b) => {
    const wa = words(a);
    if (!wa.size) return false;
    let hit = 0;
    for (const w of words(b)) if (wa.has(w)) hit += 1;
    return hit / wa.size >= 0.6;
  };
  if (sentences.length) {
    const want = Math.max(0, 6 - keyPoints.length);
    const stepSize = Math.max(1, Math.floor(sentences.length / (want || 1)));
    for (let i = 0; i < sentences.length && keyPoints.length < 6; i += stepSize) {
      const s = clip(sentences[i], 220);
      // Definisi dan kalimat sumbernya sering memuat isi yang sama, jadi dicek lewat tumpang tindih kata.
      if (!keyPoints.some((k) => overlaps(k, s))) keyPoints.push(s);
    }
  }

  const flashcards = defs.slice(0, 8).map((d) => ({ front: `Apa yang dimaksud dengan ${d.term}?`, back: d.definition }));

  // Contoh: blok yang terlihat seperti kode
  const codeBlocks = body
    .split(/\n{2,}/)
    .filter((b) => /[{};=]|=>|import |function |SELECT |<\w+>/.test(b) && b.length > 30)
    .slice(0, 3)
    .map((b, i) => ({ title: `Contoh ${i + 1} dari dokumen`, description: clip(b.trim(), 900) }));

  return {
    summary,
    overview,
    stepByStepBreakdown: steps,
    concreteExamples: codeBlocks,
    keyPoints,
    flashcards,
    topic,
  };
}

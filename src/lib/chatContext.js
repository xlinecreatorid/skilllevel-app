// Logika konteks untuk "Tanya AI": memecah modul menjadi potongan (chunk), memilih potongan
// yang relevan dengan pertanyaan (BM25 ringan), dan menyusun prompt + riwayat percakapan
// agar jawaban AI selalu sinkron dengan modul yang dipilih.

const STOPWORDS = new Set(
  `yang dan di ke dari untuk dengan pada adalah itu ini atau juga akan dapat bisa ada apa siapa kapan dimana
   bagaimana mengapa kenapa saya aku kamu anda kita kami mereka sebuah suatu oleh dalam agar sudah telah sedang
   lebih sangat tidak bukan saja hanya tolong jelaskan jelasin berikan kasih contoh tentang mengenai cara sih dong
   deh nih lah kah ya the a an of to is are what how why when who in on for and or with me please explain
   modul materi bab`.split(/\s+/)
);

// Kata rujukan yang menandakan pertanyaan lanjutan ("kodenya?", "contohnya?", "yang tadi")
const FOLLOW_UP_HINT = /\b(itu|tadi|tersebut|nya|lanjut|lagi|selanjutnya|kodenya|contohnya|maksudnya|bagian)\b/i;

export const FULL_CONTEXT_LIMIT = 30000; // karakter; di bawah ini seluruh modul dikirim utuh
export const RETRIEVAL_BUDGET = 14000; // karakter konteks bila modul sangat panjang
const MAX_HISTORY_MESSAGES = 8;

// Tokenisasi dan normalisasi string teks.
const stem = (t) => (t.length > 5 ? t.replace(/(nya|kah|lah|pun)$/, '') : t);

export function tokenize(str = '') {
  return String(str)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // createConnection -> create Connection
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(' ')
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
    .map(stem);
}

const unique = (arr) => [...new Set(arr)];

// Pembagian dokumen menjadi segmen teks kecil.
function splitLong(str, size) {
  if (str.length <= size) return [str];
  const sentences = str.split(/(?<=[.!?;])\s+/);
  const out = [];
  let cur = '';
  const push = () => {
    if (cur.trim()) out.push(cur.trim());
    cur = '';
  };
  for (const s of sentences) {
    if (s.length > size) {
      push();
      const words = s.split(/\s+/);
      for (const w of words) {
        if ((cur + ' ' + w).length > size) push();
        cur += (cur ? ' ' : '') + w;
      }
      push();
    } else if ((cur + ' ' + s).length > size) {
      push();
      cur = s;
    } else {
      cur += (cur ? ' ' : '') + s;
    }
  }
  push();
  return out;
}

export function chunkRawText(text = '', size = 900) {
  const chunks = [];
  const blocks = String(text).split(/\n{2,}/);
  let page = null;
  let buffer = '';
  let bufferPage = null;

  const flush = () => {
    if (buffer.trim()) {
      chunks.push({
        kind: 'raw',
        label: bufferPage ? `Teks materi, halaman ${bufferPage}` : 'Teks materi',
        text: buffer.trim(),
      });
    }
    buffer = '';
  };

  for (let block of blocks) {
    const m = block.match(/^--- Halaman (\d+) ---\s*/);
    if (m) {
      flush();
      page = Number(m[1]);
      block = block.slice(m[0].length);
    }
    if (!block.trim()) continue;
    for (const piece of splitLong(block.trim(), size)) {
      if (buffer && (buffer + '\n\n' + piece).length > size) flush();
      if (!buffer) bufferPage = page;
      buffer += (buffer ? '\n\n' : '') + piece;
    }
  }
  flush();
  return chunks;
}

// Bagian modul hasil analisis AI (ringkasan, langkah, contoh, poin penting, flashcard)
export function chunkModule(material = {}) {
  const chunks = [];
  const add = (label, text, core = false) => {
    if (text && String(text).trim()) chunks.push({ kind: 'module', label, text: String(text).trim(), core });
  };

  add('Ringkasan & gambaran umum', [material.summary, material.overview].filter(Boolean).join('\n'), true);

  (material.stepByStepBreakdown || []).forEach((s) => {
    add(s.step || 'Langkah', [s.step, s.detail, s.analogy && `Analogi: ${s.analogy}`].filter(Boolean).join('\n'));
  });

  (material.concreteExamples || []).forEach((e) => {
    add(e.title || 'Contoh', `${e.title || ''}\n${e.description || ''}`);
  });

  if ((material.keyPoints || []).length) {
    add('Poin penting', material.keyPoints.map((p) => `- ${p}`).join('\n'), true);
  }

  (material.flashcards || []).forEach((f) => {
    add('Flashcard', `T: ${f.front}\nJ: ${f.back}`);
  });

  return chunks;
}

export function buildChunks(material) {
  if (!material) return [];
  const all = [...chunkModule(material), ...chunkRawText(material.text || '')];
  return all.map((c, i) => ({ ...c, id: i }));
}

// Pembobotan relevansi segmen teks menggunakan BM25 ringan.
export function rankChunks(query, chunks) {
  const qTokens = unique(tokenize(query));
  if (!qTokens.length || !chunks.length) return chunks.map((chunk) => ({ chunk, score: 0 }));

  const docs = chunks.map((c) => {
    const tokens = tokenize(c.text);
    const labelTokens = tokenize(c.label);
    return { tokens: [...tokens, ...labelTokens, ...labelTokens], set: new Set(tokens.concat(labelTokens)) };
  });

  const N = docs.length;
  const avgdl = docs.reduce((a, d) => a + d.tokens.length, 0) / N || 1;
  const k1 = 1.4;
  const b = 0.75;

  const tfOf = (d, q) => {
    let tf = 0;
    for (const t of d.tokens) {
      if (t === q) tf += 1;
      else if (q.length >= 4 && t.length >= 4 && (t.startsWith(q) || q.startsWith(t))) tf += 0.5;
    }
    return tf;
  };

  const df = {};
  for (const q of qTokens) df[q] = docs.filter((d) => tfOf(d, q) > 0).length;

  return chunks
    .map((chunk, i) => {
      const d = docs[i];
      let score = 0;
      for (const q of qTokens) {
        const tf = tfOf(d, q);
        if (!tf) continue;
        const idf = Math.log(1 + (N - df[q] + 0.5) / (df[q] + 0.5));
        score += (idf * (tf * (k1 + 1))) / (tf + k1 * (1 - b + (b * d.tokens.length) / avgdl));
      }
      return { chunk, score };
    })
    .sort((a, b2) => b2.score - a.score);
}

// Seberapa banyak kata kunci pertanyaan muncul di modul (0..1)
export function keywordCoverage(query, chunks) {
  const q = unique(tokenize(query));
  if (!q.length) return 1;
  const vocab = new Set(chunks.flatMap((c) => tokenize(c.text + ' ' + c.label)));
  const vocabArr = [...vocab];
  const hit = q.filter((t) => vocab.has(t) || (t.length >= 4 && vocabArr.some((v) => v.length >= 4 && (v.startsWith(t) || t.startsWith(v)))));
  return hit.length / q.length;
}

// Penyusunan kueri temu-kembali dan konteks prompt.
export function buildRetrievalQuery(question, history = []) {
  const qTokens = tokenize(question);
  const isFollowUp = qTokens.length <= 3 || FOLLOW_UP_HINT.test(question);
  if (!isFollowUp) return question;
  const prevUser = [...history].reverse().find((m) => m.role === 'user');
  return prevUser ? `${question} ${prevUser.text}` : question;
}

export function buildContext(material, question, history = []) {
  const chunks = buildChunks(material);
  const retrievalQuery = buildRetrievalQuery(question, history);
  const ranked = rankChunks(retrievalQuery, chunks);
  const coverage = keywordCoverage(question, chunks);
  const topScore = ranked[0]?.score || 0;
  const covered = coverage >= 0.5 && topScore > 0;

  const total = chunks.reduce((a, c) => a + c.text.length, 0);
  const fmt = (c) => `[${c.label}]\n${c.text}`;

  let selected;
  let mode;
  if (total <= FULL_CONTEXT_LIMIT) {
    selected = chunks; // seluruh modul, urutan asli
    mode = 'full';
  } else {
    const picked = new Set(chunks.filter((c) => c.core).map((c) => c.id));
    let used = chunks.filter((c) => c.core).reduce((a, c) => a + c.text.length, 0);
    for (const { chunk, score } of ranked) {
      if (score <= 0) break;
      if (picked.has(chunk.id)) continue;
      if (used + chunk.text.length > RETRIEVAL_BUDGET) continue;
      picked.add(chunk.id);
      used += chunk.text.length;
    }
    selected = chunks.filter((c) => picked.has(c.id));
    mode = 'retrieval';
  }

  const sources = unique(
    ranked
      .filter((r) => r.score > 0 && r.chunk.label !== 'Flashcard' && r.chunk.label !== 'Teks materi')
      .slice(0, 3)
      .map((r) => r.chunk.label)
  );

  return {
    contextText: selected.map(fmt).join('\n\n---\n\n'),
    sources: covered ? sources : [],
    covered,
    coverage,
    topScore,
    mode,
    ranked,
    chunks,
  };
}

export function buildSystemPrompt(material, ctx) {
  if (!material) {
    return `Anda adalah Asisten Belajar SkillLevel yang ramah dan jelas. Tidak ada modul yang dipilih, jadi jawab pertanyaan secara umum dalam Bahasa Indonesia, ringkas dan bertahap. Di akhir jawaban, sarankan pengguna memilih modul di menu "Fokus materi" agar jawaban bisa disesuaikan dengan modulnya.`;
  }

  return `Anda adalah Asisten Belajar SkillLevel untuk modul berjudul "${material.title}" (topik: ${material.topic || 'Umum'}).
Pengguna sedang belajar dari modul ini. Jawaban Anda HARUS sinkron dengan isi modul di bagian KONTEKS MODUL di bawah.

ATURAN:
1. Utamakan isi KONTEKS MODUL sebagai sumber jawaban. Gunakan istilah, nama library, nama endpoint, nama variabel, dan contoh kode persis seperti yang tertulis di modul.
2. Pertanyaan umum (mis. "apa itu web server?") dijawab dengan definisi singkat yang SESUAI cara modul ini membahasnya, lalu hubungkan ke bagian modul (sebutkan nama langkah/contoh/halaman).
3. Jika pertanyaan TIDAK dibahas di modul, kalimat pertama harus: "Hal ini tidak dibahas langsung di modul ini." Setelah itu beri penjelasan umum singkat dengan label "Penjelasan umum (di luar modul):" lalu tunjukkan bagian modul yang paling berkaitan bila ada. Jangan mengarang seolah-olah modul membahasnya.
4. Jangan mengklaim sesuatu ada di modul jika tidak ada di KONTEKS MODUL. Jangan menambah detail (versi, port, nama tabel) yang tidak ada di modul kecuali diberi label di luar modul.
5. Perhatikan riwayat percakapan: pertanyaan singkat seperti "contohnya?" atau "kodenya?" merujuk pada topik pertanyaan sebelumnya.
6. Jelaskan bertahap dan sederhana dalam Bahasa Indonesia. Tulis kode dalam blok \`\`\`. Hindari kalimat template pembuka seperti "Menjawab pertanyaan Anda...". Langsung ke inti.
${ctx && !ctx.covered ? '\nCATATAN SISTEM: kata kunci pertanyaan terakhir tampak tidak ditemukan di modul. Periksa dengan teliti; jika benar tidak ada, terapkan aturan 3.\n' : ''}
${ctx && ctx.mode === 'retrieval' ? '\nCATATAN SISTEM: modul panjang, sehingga hanya bagian paling relevan yang disertakan. Jika jawabannya tidak terlihat, katakan bagian itu tidak ditemukan pada kutipan, jangan menebak.\n' : ''}
KONTEKS MODUL:
"""
${ctx ? ctx.contextText : ''}
"""`;
}

// Riwayat -> format pesan OpenAI (selang-seling user/assistant, diawali user)
export function buildChatMessages(history, question) {
  const usable = history
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.kind !== 'error' && m.kind !== 'offline' && m.text)
    .slice(-MAX_HISTORY_MESSAGES);

  const turns = [];
  for (const m of usable) {
    const role = m.role === 'user' ? 'user' : 'assistant';
    const text = m.text.length > 1500 ? m.text.slice(0, 1500) + '…' : m.text;
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.content += `\n${text}`;
    else turns.push({ role, content: text });
  }
  while (turns.length && turns[0].role !== 'user') turns.shift();

  const last = turns[turns.length - 1];
  if (last && last.role === 'user') last.content += `\n${question}`;
  else turns.push({ role: 'user', content: question });
  return turns;
}

// Jawaban cadangan berbasis kutipan modul saat offline.
export function buildLocalAnswer(question, material, ctx, reason = '') {
  const head = reason ? `${reason}\nBerikut kutipan modul yang paling relevan:\n\n` : '';
  if (!material) {
    // Tanpa modul fokus tidak ada kutipan, jadi kalimat pembuka kutipan tidak dipakai.
    return `${reason ? `${reason}\n\n` : ''}Pilih modul pada bagian Fokus materi agar saya bisa menjawab dari isi modul.`;
  }
  if (!ctx || !ctx.covered) {
    const topics = (material.keyPoints || []).slice(0, 3).map((p) => `- ${p}`).join('\n');
    const lead = reason ? `${reason}\n\n` : '';
    return `${lead}Pertanyaan "${question}" tidak ditemukan di modul "${material.title}".${topics ? `\n\nPoin yang dibahas modul ini:\n${topics}` : ''}`;
  }
  const top = ctx.ranked.filter((r) => r.score > 0).slice(0, 2);
  const body = top
    .map((r) => {
      const label = r.chunk.label;
      // Chunk teks sering diawali judulnya sendiri, jadi judul itu dibuang agar tidak tampil dua kali.
      const text = r.chunk.text.startsWith(label) ? r.chunk.text.slice(label.length).trim() : r.chunk.text;
      const clipped = text.length > 700 ? `${text.slice(0, 700)}…` : text;
      return `**${label}**\n${clipped}`;
    })
    .join('\n\n');
  return `${head}${body}`;
}

// Generator saran pertanyaan konteks modul.
export function buildSuggestions(material) {
  if (!material) {
    return [
      'Dari mana sebaiknya saya mulai belajar web?',
      'Apa bedanya HTML, CSS, dan JavaScript?',
      'Bagaimana cara kerja permintaan HTTP?',
    ];
  }
  const out = [];
  (material.flashcards || []).slice(0, 2).forEach((f) => f.front && out.push(f.front));
  (material.stepByStepBreakdown || []).slice(0, 2).forEach((s) => {
    const name = (s.step || '').replace(/^(langkah|tahap)\s*\d+\s*[:.-]?\s*/i, '').trim();
    if (name) out.push(`Jelaskan "${name}" secara sederhana`);
  });
  out.push('Apa saja poin penting modul ini?');
  return unique(out).slice(0, 4);
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChatMessages, buildContext, buildLocalAnswer, buildSystemPrompt } from '../../src/lib/chatContext.js';
import { buildFallbackModule, parseJsonLoose, sanitizeAnalysis } from '../../src/lib/module.js';
import { assembleQuiz, sanitizeQuestions } from '../../src/lib/quiz.js';
import { scoreQuiz, xpForQuiz } from '../../src/lib/quizRun.js';
import { levelFor, touchStreak } from '../../src/lib/store.js';
import { CURRICULUM } from '../../src/data/curriculum.js';

const sampleMaterial = {
  id: 'uji',
  title: 'Modul Uji',
  topic: 'Umum',
  summary: 'Ringkasan modul uji.',
  overview: 'Gambaran umum modul uji.',
  stepByStepBreakdown: [{ step: 'Langkah 1: Dasar', detail: 'Penjelasan dasar.', analogy: 'Seperti resep.' }],
  concreteExamples: [{ title: 'Contoh', description: 'console.log("halo")' }],
  keyPoints: ['Poin satu', 'Poin dua'],
  flashcards: [{ front: 'Apa itu uji?', back: 'Kegiatan memeriksa.' }],
};

test('sanitizeAnalysis menolak masukan yang bukan objek', () => {
  assert.equal(sanitizeAnalysis(null), null);
  assert.equal(sanitizeAnalysis([]), null);
  assert.equal(sanitizeAnalysis('teks'), null);
  assert.equal(sanitizeAnalysis({}), null);
});

test('sanitizeAnalysis merapikan tipe data dan membuang entri kosong', () => {
  const clean = sanitizeAnalysis({
    summary: 'Ringkas.',
    overview: 'Panjang.',
    stepByStepBreakdown: ['Langkah teks', { step: 'Langkah objek', detail: 'Detail' }, { detail: '' }],
    concreteExamples: [{ description: 'kode' }, { title: 'tanpa isi' }],
    keyPoints: ['a', '', 3],
    flashcards: [{ front: 'tanya', back: 'jawab' }, { front: 'tanpa jawaban' }],
  });
  assert.equal(clean.stepByStepBreakdown.length, 2);
  assert.equal(clean.concreteExamples.length, 1);
  assert.deepEqual(clean.keyPoints, ['a', '3']);
  assert.equal(clean.flashcards.length, 1);
});

test('sanitizeAnalysis mengisi ringkasan dari overview bila kosong', () => {
  const clean = sanitizeAnalysis({ overview: 'Gambaran yang cukup panjang untuk dipakai.' });
  assert.equal(clean.summary, 'Gambaran yang cukup panjang untuk dipakai.');
});

test('parseJsonLoose membaca JSON di dalam pembungkus kode', () => {
  const parsed = parseJsonLoose('Berikut hasilnya:\n```json\n{"summary":"ok"}\n```');
  assert.equal(parsed.summary, 'ok');
  assert.equal(parseJsonLoose('tanpa json'), null);
});

test('buildFallbackModule menyusun modul dari teks tanpa AI', () => {
  const text = [
    'Bab 1: Pengenalan',
    'HTTP adalah protokol yang dipakai browser untuk meminta halaman ke server.',
    'Bab 2: Permintaan',
    'Browser mengirim permintaan lalu server membalas dengan status dan isi.',
  ].join('\n');
  const modul = buildFallbackModule('Dokumen Uji', text, 'Unggahan');
  assert.equal(modul.topic, 'Unggahan');
  assert.ok(modul.summary.length > 0);
  assert.ok(modul.stepByStepBreakdown.length >= 1);
  assert.ok(Array.isArray(modul.keyPoints));
});

test('buildFallbackModule membuang penanda heading markdown dari isi modul', () => {
  const text = [
    '# Catatan Rapat',
    'Rapat membahas rencana peluncuran dasbor baru untuk kuartal berikutnya.',
    '## Keputusan',
    'Dasbor dirilis dalam dua fase supaya risiko teknisnya lebih kecil.',
  ].join('\n');
  const modul = buildFallbackModule('Catatan Rapat', text, 'Unggahan');
  const semua = [modul.summary, modul.overview, ...modul.keyPoints].join(' ');
  assert.ok(!/#/.test(semua), 'penanda heading tidak boleh muncul sebagai teks');
  assert.ok(!modul.summary.startsWith('Catatan Rapat'), 'judul dokumen tidak menempel di ringkasan');
});

test('sanitizeQuestions membuang soal cacat dan menjaga indeks jawaban valid', () => {
  const list = sanitizeQuestions([
    { question: 'Sah?', options: ['a', 'b', 'c'], correctIndex: 1, explanation: 'karena b' },
    { question: 'Kurang opsi', options: ['a'], correctIndex: 0 },
    { question: '', options: ['a', 'b', 'c'], correctIndex: 0 },
    { question: 'Indeks di luar', options: ['a', 'b', 'c'], correctIndex: 9 },
    { question: 'Opsi ganda', options: ['a', 'a', 'b'], correctIndex: 0 },
  ]);
  assert.equal(list.length, 1);
  assert.equal(list[0].question, 'Sah?');
  for (const q of list) {
    assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length);
  }
});

test('assembleQuiz melengkapi soal dari isi modul', () => {
  const material = CURRICULUM[0];
  const result = assembleQuiz([], material, 4);
  assert.ok(result.questions.length > 0);
  assert.ok(result.questions.length <= 4);
  assert.equal(result.aiCount, 0);
  assert.equal(result.localCount, result.questions.length);
  for (const q of result.questions) {
    assert.ok(q.options.length >= 2);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length);
  }
});

test('scoreQuiz menghitung jawaban benar dan persentase', () => {
  const questions = [{ correctIndex: 0 }, { correctIndex: 2 }, { correctIndex: 1 }];
  assert.deepEqual(scoreQuiz(questions, { 0: 0, 1: 2, 2: 0 }), { correct: 2, total: 3, percent: 67 });
  assert.deepEqual(scoreQuiz([], {}), { correct: 0, total: 0, percent: 0 });
});

test('xpForQuiz naik seiring persentase', () => {
  assert.equal(xpForQuiz(0), 30);
  assert.equal(xpForQuiz(100), 110);
  assert.ok(xpForQuiz(80) > xpForQuiz(50));
});

test('levelFor memberi nama level dan sisa XP yang benar', () => {
  assert.equal(levelFor(0).name, 'Pemula');
  assert.equal(levelFor(0).next, 'Menengah');
  assert.equal(levelFor(0).toNext, 200);
  assert.equal(levelFor(250).name, 'Menengah');
  assert.equal(levelFor(1200).name, 'Ahli');
  assert.equal(levelFor(1200).next, null);
  assert.equal(levelFor(1200).percent, 100);
});

test('touchStreak menambah hitungan pada hari berbeda dan tidak menggandakan hari yang sama', () => {
  const day1 = new Date('2024-03-01T10:00:00Z');
  const day2 = new Date('2024-03-02T10:00:00Z');
  const day4 = new Date('2024-03-04T10:00:00Z');
  const start = { xp: 0, completedModules: {}, quizResults: {}, streak: { lastDay: '', count: 0 } };

  const first = touchStreak(start, day1);
  assert.equal(first.streak.count, 1);
  assert.equal(touchStreak(first, day1).streak.count, 1);

  const second = touchStreak(first, day2);
  assert.equal(second.streak.count, 2);

  const reset = touchStreak(second, day4);
  assert.equal(reset.streak.count, 1);
});

test('buildChatMessages menghasilkan format pesan OpenAI yang sah', () => {
  const history = [
    { role: 'user', text: 'Apa itu HTTP?' },
    { role: 'assistant', text: 'Protokol permintaan.' },
    { role: 'assistant', text: 'Tambahan.' },
  ];
  const messages = buildChatMessages(history, 'Contohnya?');
  assert.equal(messages[0].role, 'user');
  assert.equal(messages[messages.length - 1].role, 'user');
  assert.match(messages[messages.length - 1].content, /Contohnya\?/);
  for (const m of messages) {
    assert.ok(m.role === 'user' || m.role === 'assistant');
    assert.equal(typeof m.content, 'string');
  }
});

test('buildChatMessages membuang pesan galat dan pesan offline', () => {
  const history = [
    { role: 'user', text: 'Halo' },
    { role: 'assistant', text: 'Galat', kind: 'error' },
    { role: 'assistant', text: 'Kutipan', kind: 'offline' },
  ];
  const messages = buildChatMessages(history, 'Lanjut');
  assert.equal(messages.some((m) => m.content.includes('Galat')), false);
  assert.equal(messages.some((m) => m.content.includes('Kutipan')), false);
});

test('buildContext menemukan bagian modul yang relevan', () => {
  const ctx = buildContext(sampleMaterial, 'Apa itu uji?', []);
  assert.equal(typeof ctx.contextText, 'string');
  assert.ok(ctx.contextText.length > 0);
  assert.ok(Array.isArray(ctx.ranked));
});

test('buildSystemPrompt menyebut judul modul dan menegaskan batas jawaban', () => {
  const ctx = buildContext(sampleMaterial, 'Apa itu uji?', []);
  const prompt = buildSystemPrompt(sampleMaterial, ctx);
  assert.match(prompt, /Modul Uji/);
  assert.match(prompt, /tidak dibahas langsung di modul ini/);
});

test('buildLocalAnswer tetap menjawab tanpa AI', () => {
  const ctx = buildContext(sampleMaterial, 'Apa itu uji?', []);
  const answer = buildLocalAnswer('Apa itu uji?', sampleMaterial, ctx);
  assert.ok(answer.length > 0);
  assert.equal(/[\u{1F300}-\u{1FAFF}]/u.test(answer), false);
});

test('kurikulum berisi sembilan modul dengan kuis sepuluh soal', () => {
  assert.equal(CURRICULUM.length, 9);
  const ids = new Set();
  for (const modul of CURRICULUM) {
    assert.equal(ids.has(modul.id), false, `id ganda: ${modul.id}`);
    ids.add(modul.id);
    assert.ok(modul.title.length > 0);
    assert.ok(modul.steps.length >= 3);
    assert.ok(modul.keyPoints.length >= 3);
    assert.equal(modul.quiz.length, 10);
    for (const q of modul.quiz) {
      assert.ok(q.options.length >= 2);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length);
      assert.ok(q.explanation.length > 0);
    }
  }
});

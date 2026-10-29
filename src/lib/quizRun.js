// Menyiapkan satu sesi kuis: bank soal bawaan dipakai lebih dulu, lalu AI untuk
// modul hasil unggahan, dan generator lokal sebagai jaring pengaman terakhir.

import { completeJson } from './aiClient.js';
import { buildQuizPrompt, assembleQuiz, generateLocalQuiz, shuffle } from './quiz.js';

function fromBank(material, count, rnd) {
  const bank = Array.isArray(material.quiz) ? material.quiz : [];
  if (!bank.length) return [];
  return shuffle(bank, rnd)
    .slice(0, count)
    .map((q) => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      source: q.source || '',
      origin: 'bawaan',
    }));
}

export async function buildQuiz({ material, count, levelName, settings, signal }) {
  const bank = fromBank(material, count, Math.random);
  if (bank.length >= count) {
    return { questions: bank, origin: 'bawaan', note: '' };
  }

  const { systemInstruction, prompt } = buildQuizPrompt(material, count, levelName);
  try {
    const raw = await completeJson({
      system: systemInstruction,
      messages: [{ role: 'user', content: prompt }],
      settings,
      signal,
    });
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.questions) ? raw.questions : [];
    const assembled = assembleQuiz(
      list
        .filter((q) => q && typeof q.question === 'string' && Array.isArray(q.options))
        .map((q) => ({
          question: String(q.question).trim(),
          options: q.options.map((o) => String(o ?? '').trim()),
          correctIndex: Number.isInteger(q.correctIndex) ? q.correctIndex : 0,
          explanation: typeof q.explanation === 'string' ? q.explanation : 'Sesuai isi modul.',
          source: typeof q.source === 'string' ? q.source : '',
          origin: 'ai',
        })),
      material,
      count
    );
    if (assembled.questions.length) {
      return {
        questions: assembled.questions,
        origin: assembled.aiCount ? 'ai' : 'lokal',
        note: assembled.localCount ? `${assembled.localCount} soal dilengkapi dari isi modul.` : '',
      };
    }
  } catch {
    /* lanjut ke generator lokal */
  }

  const local = generateLocalQuiz(material, count);
  if (local.length) {
    return { questions: local, origin: 'lokal', note: 'Soal disusun dari isi modul tanpa AI.' };
  }
  return { questions: [], origin: 'kosong', note: 'Modul ini belum punya cukup bahan untuk membuat soal.' };
}

export function scoreQuiz(questions, answers) {
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) correct += 1;
  });
  return {
    correct,
    total: questions.length,
    percent: questions.length ? Math.round((correct / questions.length) * 100) : 0,
  };
}

export function xpForQuiz(percent) {
  return Math.round(percent * 0.8) + 30;
}

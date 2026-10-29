// Menyamakan bentuk data modul bawaan dengan modul hasil unggahan, supaya
// tampilan, kuis, dan tutor memakai satu struktur yang sama.

import { CURRICULUM } from '../data/curriculum.js';

export function builtinMaterials() {
  return CURRICULUM.map((m) => ({
    id: m.id,
    title: m.title,
    topic: m.topic,
    level: m.level,
    minutes: m.minutes,
    summary: m.summary,
    overview: m.overview,
    stepByStepBreakdown: m.steps,
    concreteExamples: m.examples,
    keyPoints: m.keyPoints,
    flashcards: m.flashcards,
    quiz: m.quiz,
    order: m.order,
    source: 'bawaan',
    text: '',
  }));
}

export function materialById(materials, id) {
  return materials.find((m) => m.id === id) || null;
}

export function nextUnfinished(materials, completed) {
  return materials.find((m) => !completed[m.id]) || null;
}

export function progressPercent(materials, completed) {
  if (!materials.length) return 0;
  const done = materials.filter((m) => completed[m.id]).length;
  return Math.round((done / materials.length) * 100);
}

# Panduan Pengembang (Developer Guide)

Panduan ini ditujukan bagi pengembang yang ingin menjalankan, mengembangkan, menguji, dan memperluas aplikasi Skilllevel.

---

## 1. Persiapan Lingkungan Lokal

### Prasyarat
- Node.js versi 18 atau 20 ke atas.
- NPM versi 9 atau ke atas.

### Langkah Instalasi
```bash
# 1. Masuk ke direktori proyek
cd skilllevel-exact

# 2. Pasang dependensi
npm install

# 3. Salin template environment
cp .env.example .env       # Di Windows: copy .env.example .env

# 4. Jalankan mode pengembangan
npm run dev                # Akses di http://localhost:5173
```

Pada mode pengembangan (`npm run dev`), server Vite menjalankan plugin middleware bawaan yang langsung memetakan rute `/api/ai/*` ke handler server lokal, sehingga panggilan AI dapat diuji secara penuh tanpa perlu menjalankan proses backend terpisah.

---

## 2. Pengujian dan Verifikasi Kode

Aplikasi menggunakan runner pengujian bawaan Node.js (`node:test`) yang ringan, cepat, dan tanpa dependensi pihak ketiga:

```bash
# Jalankan validasi sintaks berkas JavaScript
npm run lint

# Jalankan seluruh rangkaian pengujian unit dan integrasi
npm test
```

### Menambahkan Pengujian Baru
Tambahkan berkas pengujian di dalam folder `server/test/*.test.js`. Contoh struktur:
```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { fungsiYangDiuji } from '../modul.js';

test('nama skenario pengujian', () => {
  const hasil = fungsiYangDiuji('input');
  assert.equal(hasil, 'ekspektasi');
});
```

---

## 3. Menambahkan Modul Kurikulum Baru

Untuk menambahkan modul baru ke dalam sembilan modul bawaan:
1. Buka berkas `src/data/curriculum.js`.
2. Tambahkan objek modul baru ke dalam array `CURRICULUM` dengan format:
```js
{
  id: 'modul-10',
  order: 10,
  title: 'Judul Modul Baru',
  topic: 'Topik',
  level: 'Menengah',
  minutes: 20,
  summary: 'Ringkasan singkat modul.',
  overview: 'Penjelasan menyeluruh konsep utama.',
  stepByStepBreakdown: [
    { step: 'Langkah 1: Nama', detail: 'Penjelasan', analogy: 'Analogi praktis' }
  ],
  concreteExamples: [
    { title: 'Contoh Kode', description: 'Penjelasan contoh' }
  ],
  keyPoints: ['Poin penting 1', 'Poin penting 2'],
  flashcards: [{ front: 'Pertanyaan', back: 'Jawaban' }],
  quiz: [
    {
      question: 'Pertanyaan kuis?',
      options: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
      correctIndex: 0,
      explanation: 'Alasan jawaban benar.',
      source: 'Rujukan modul'
    }
  ]
}
```

---

## 4. Menambahkan Model AI Gratis Baru

1. Buka `server/env.js`.
2. Tambahkan entri baru ke dalam array `FREE_MODELS`:
```js
export const FREE_MODELS = [
  // ...
  {
    id: 'nama-model-baru',
    name: 'Nama Label Model',
    endpoint: 'https://api.provider.com/v1',
    provider: 'openai', // 'openai', 'anthropic', atau 'gemini'
    description: 'Deskripsi singkat kapabilitas model.',
  },
];
```
3. Buka `src/components/Settings.jsx` dan perbarui array `PRESET_FREE_MODELS` agar muncul di dropdown antarmuka pengguna.

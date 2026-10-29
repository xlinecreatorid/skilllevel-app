# Skilllevel

Aplikasi belajar web fullstack berbahasa Indonesia: sembilan modul berurutan, kuis per modul, tutor AI yang membaca modul, dan modul tambahan dari berkas sendiri.

## Yang berubah dari versi sebelumnya

| Sebelum | Sesudah |
| --- | --- |
| Kunci API Gemini disimpan di `localStorage` dan dipanggil langsung dari browser | Kunci hanya ada di `.env` server. Browser memanggil `/api/ai/*` |
| Endpoint dan model tertanam di kode | Endpoint, model, streaming, dan mode berpikir bisa diatur lewat `.env` atau dialog Pengaturan AI |
| Satu modul contoh | Sembilan modul dengan 90 soal kuis |
| PDF.js dimuat dari CDN | `pdfjs-dist` dipasang sebagai dependensi dan dimuat dinamis |
| Satu komponen 1.929 baris | `App.jsx` sebagai perakit, tujuh view terpisah, primitif UI bersama |

## Menjalankan

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```

Untuk mode produksi:

```bash
npm run build
npm start                 # http://localhost:4173
```

`npm run dev` menjalankan Vite beserta middleware proxy AI. `npm start` menjalankan server Node yang menyajikan `dist/` sekaligus proxy AI.

## Konfigurasi `.env`

| Variabel | Bawaan | Keterangan |
| --- | --- | --- |
| `AI_BASE_URL` | `https://apihub.agnes-ai.com/v1` | Endpoint gaya OpenAI. Server memanggil `{AI_BASE_URL}/chat/completions` |
| `AI_MODEL` | `agnes-2.5-flash` | Model bawaan untuk semua pengguna |
| `AI_API_KEY` | kosong | Kredensial model bawaan. Hanya dibaca server |
| `AI_STREAMING` | `1` | `1` mengalirkan jawaban, `0` menunggu jawaban utuh |
| `AI_THINKING` | `auto` | `auto` mengirim `thinking: {type:"auto"}`, `off` tidak mengirim |
| `AI_ALLOW_PRIVATE_ENDPOINTS` | `0` | `1` mengizinkan endpoint localhost atau jaringan privat, hanya untuk pengembangan |
| `AI_MAX_INPUT_CHARS` | `120000` | Batas total karakter konteks per permintaan |

Tanpa `AI_API_KEY`, aplikasi tetap berjalan penuh untuk modul dan kuis bawaan. Tutor memakai kutipan modul, dan modul unggahan disusun dengan generator lokal.

## Model dan endpoint kustom

Dialog **Pengaturan AI** menyediakan tiga kolom opsional:

1. **Alamat endpoint**: harus `https://`, tanpa query, tanpa fragmen, tanpa kredensial di URL.
2. **Nama model**: hanya huruf, angka, titik, garis miring, garis bawah, tanda hubung, plus, dan at.
3. **Kunci API kustom**: hanya hidup di memori tab, tidak pernah ditulis ke `localStorage`.

Kosongkan ketiganya untuk memakai model bawaan dari `.env`.

## Model keamanan

- **Kunci tidak pernah ke browser.** `GET /api/ai/health` hanya mengembalikan `hasServerKey`, nama model, dan endpoint bawaan.
- **Proteksi SSRF.** `validateEndpoint` menolak skema selain http/https, `http` tanpa izin eksplisit, kredensial di URL, query atau fragmen, serta host `localhost`, `*.local`, `*.internal`, `*.home.arpa`, `::1`, `fc00::/7`, `fe80::/10`, `10/8`, `127/8`, `169.254/16`, `192.168/16`, dan `172.16/12`.
- **Redaksi rahasia.** Semua pesan galat dan log melewati `redact()`, yang menghapus kunci yang dikonfigurasi serta pola `sk-...`, `AIza...`, `Bearer ...`, dan `api_key=...`.
- **Batas laju.** 40 permintaan per menit per alamat IP, dengan `Retry-After` saat terlampaui.
- **Batas ukuran.** Body permintaan maksimal 1,5 MB, 40 pesan, 60.000 karakter per pesan.
- **Kunci lama dibersihkan.** `purgeLegacySecrets()` menghapus `sl_gemini_key` dari `localStorage` saat aplikasi dimuat.
- **Tanpa `dangerouslySetInnerHTML`.** Markdown jawaban dirender sebagai elemen React.
- **PDF lokal.** Tidak ada skrip pihak ketiga yang dimuat saat runtime.

## Sembilan modul

| # | Modul | Topik |
| --- | --- | --- |
| 01 | Cara Browser Menampilkan Halaman | Dasar web |
| 02 | HTML Bermakna dan Aksesibel | HTML |
| 03 | CSS: Tata Letak dan Sistem Desain | CSS |
| 04 | JavaScript: Nilai, Fungsi, dan Array | JavaScript |
| 05 | DOM, Event, dan State Antarmuka | Interaksi |
| 06 | HTTP, REST, dan Bentuk Respons | Jaringan |
| 07 | Web Server dan Basis Data | Backend |
| 08 | Integrasi Model AI yang Aman | AI |
| 09 | Keamanan Aplikasi Web | Keamanan |

Setiap modul berisi ringkasan, gambaran umum, empat langkah dengan analogi, dua contoh, lima poin penting, empat flashcard, dan sepuluh soal kuis dengan pembahasan.

## Struktur

```
server/
  env.js        pembacaan .env dan konfigurasi AI
  security.js   redaksi rahasia, validasi endpoint, pembatas laju
  aiProxy.js    klien OpenAI-compatible, streaming, fallback thinking
  handler.js    rute /api/ai/health dan /api/ai/chat
  index.js      server produksi untuk dist/ dan API
  test/         pengujian node --test
src/
  App.jsx       perakit state dan navigasi
  views/        Dashboard, Modules, ModuleDetail, QuizView, Tutor, Upload, Progress
  components/   Shell, Settings, Markdown, primitif UI
  lib/          aiClient, chatContext, module, quiz, quizRun, extract, materials, store
  data/         curriculum.js
```

## Skrip

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Vite plus proxy AI di port 5173 |
| `npm run build` | Bundel produksi ke `dist/` |
| `npm start` | Server produksi di port 4173 |
| `npm test` | 32 pengujian `node --test` |

## Pengujian

`npm test` mencakup:

- `server/test/security.test.js`: redaksi rahasia, deteksi host privat, validasi endpoint, pembatas laju.
- `server/test/env.test.js`: parser `.env`, nilai bawaan, dan validasi batas input.
- `server/test/lib.test.js`: sanitasi analisis dan soal, generator lokal, skor kuis, level, rentetan harian, format pesan chat, dan integritas kurikulum.

## Yang masih perlu tindak lanjut

- Isi `AI_API_KEY` di `.env` agar model bawaan aktif. Tanpa itu, fitur AI memakai jalur cadangan.
- `npm run lint` belum bisa dipakai karena belum ada berkas konfigurasi ESLint di proyek ini.
- Progres, riwayat chat, dan modul unggahan disimpan di `localStorage` peramban, jadi tidak tersinkron antar perangkat.
- Belum ada autentikasi. Bila aplikasi dipasang publik, tambahkan lapisan autentikasi dan pembatas laju berbasis akun.

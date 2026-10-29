# Struktur dan Penjelasan Kode Sumber

Dokumen ini memetakan seluruh berkas dalam proyek Skilllevel serta menjelaskan fungsi dari setiap modul.

---

## 1. Peta Direktori Proyek

```
skilllevel-exact/
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # Pipeline otomatisasi lint, test, build, deploy
├── api/
│   └── index.js                  # Entry point serverless function untuk Vercel
├── docs/                         # Dokumentasi arsitektur dan developer
├── scripts/
│   └── lint.js                   # Validasi sintaks berkas JS cross-platform
├── server/
│   ├── aiProxy.js                # Inti proxy AI, provider adapter, retry & fallback
│   ├── crypto.js                 # Utilitas enkripsi AES-256-GCM sisi server
│   ├── env.js                    # Parser berkas .env dan konfigurasi model gratis
│   ├── handler.js                # Handler rute HTTP /api/ai/health dan /api/ai/chat
│   ├── index.js                  # Server Node.js untuk penyajian lokal & produksi
│   ├── leakGuard.js              # Deteksi prompt injection, pembersih kebocoran & loop detector
│   ├── security.js               # Redaksi rahasia, validasi endpoint, rate limiter
│   └── test/                     # Kumpulan pengujian unit berbasis node:test
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx         # Modal dialog OAuth Google & SSO Admin
│   │   ├── Markdown.jsx          # Perender markdown aman tanpa dangerouslySetInnerHTML
│   │   ├── Settings.jsx          # Modal konfigurasi model AI gratis & kustom
│   │   ├── Shell.jsx             # Kerangka utama aplikasi, header, navigasi, footer
│   │   └── ui.jsx                # Primitif UI atomik (Button, Card, Tag, Meter, Notice)
│   ├── data/
│   │   └── curriculum.js         # Konten bawaan 9 modul kurikulum dan bank soal
│   ├── lib/
│   │   ├── aiClient.js           # Klien HTTP sisi browser untuk memanggil /api/ai
│   │   ├── chatContext.js        # Ekstraksi chunk modul, pemeringkat BM25, & system prompt
│   │   ├── crypto.js             # Enkripsi sisi klien E2EE (Web Crypto AES-GCM)
│   │   ├── endpoint.js           # Validasi format URL endpoint dan nama model di browser
│   │   ├── extract.js            # Ekstraksi teks dari PDF, Markdown, dan file kode
│   │   ├── i18n.jsx              # Konteks bahasa bilingual (Indonesia & English)
│   │   ├── materials.js          # Pengelola data modul bawaan dan modul kustom
│   │   ├── module.js             # Generator modul lokal dan pembersih struktur JSON
│   │   ├── quiz.js               # Pembuat dan penyeleksi soal kuis
│   │   ├── quizRun.js            # Logika jalannya sesi kuis dan perhitungan skor XP
│   │   ├── store.js              # Pengelola penyimpanan state lokal dan streak belajar
│   │   └── supabaseClient.js     # Integrasi Supabase Auth (OAuth Google, SSO) & sinkronisasi
│   ├── views/
│   │   ├── Dashboard.jsx         # Tampilan beranda jalur belajar dan statistik
│   │   ├── ModuleDetail.jsx      # Tampilan detail langkah modul, flashcard, dan contoh
│   │   ├── Modules.jsx           # Tampilan direktori daftar modul dengan pencarian
│   │   ├── Progress.jsx          # Tampilan rekapitulasi nilai kuis dan progres jalur
│   │   ├── QuizView.jsx          # Tampilan interaktif sesi pengerjaan kuis
│   │   ├── Tutor.jsx             # Tampilan interaktif tanya jawab dengan Tutor AI
│   │   └── Upload.jsx            # Tampilan ekstraksi berkas mandiri menjadi modul
│   ├── App.jsx                   # Komponen akar: perakit state, router tampilan, & providers
│   ├── index.css                 # Gaya Tailwind CSS & variabel tema editorial
│   └── main.jsx                  # Entry point rendering React DOM
├── .env.example                  # Template variabel lingkungan
├── package.json                  # Konfigurasi dependensi dan skrip proyek
├── tailwind.config.js            # Konfigurasi Tailwind CSS
└── vercel.json                   # Konfigurasi deployment platform Vercel
```

---

## 2. Penjelasan Modul Kunci

### `server/aiProxy.js`
Menangani orkestrasi panggilan ke penyedia model bahasa. Mengintegrasikan:
- Resolusi target endpoint dan nama model.
- Dukungan protokol multi-provider: OpenAI Compatible, Anthropic Claude (`/messages`), dan Google Gemini.
- Rotasi kunci API cadangan (`keyPool`) saat mendeteksi kegagalan otorisasi atau limit kuota.
- Mekanisme retry dengan jeda eksponensial untuk kegagalan sementara.

### `server/leakGuard.js`
Melindungi keamanan prompt dan integritas sistem:
- `inspectInput(text)`: Memindai upaya prompt injection atau pembongkaran instruksi tersembunyi.
- `sanitizeAiOutput(text, secrets, snippet)`: Memastikan rahasia, variabel server, dan fragmen instruksi sistem tidak pernah lolos ke pengguna.
- `createLoopDetector()`: Mencegah model mengalami loop repetisi tanpa akhir dengan memotong aliran secara otomatis.

### `src/lib/i18n.jsx`
Menyediakan fungsionalitas multi-bahasa berbasis React Context:
- Mendukung dua bahasa: Indonesia (`id`) dan English (`en`).
- Menangani interpolasi parameter dinamis (contoh: `{count}`, `{order}`).
- Menyimpan preferensi bahasa pengguna di penyimpanan lokal secara persisten.

### `src/lib/crypto.js` & `server/crypto.js`
- `src/lib/crypto.js`: Menggunakan Web Crypto API (`window.crypto.subtle`) untuk enkripsi end-to-end data progres dan modul di peramban pengguna.
- `server/crypto.js`: Menyediakan fungsi enkripsi simetris AES-256-GCM berbasis pustaka inti Node.js untuk perlindungan data server.

### `src/lib/supabaseClient.js`
Menghubungkan aplikasi dengan ekosistem Supabase:
- Otentikasi Google via OAuth (`signInWithOAuth`).
- Otentikasi Single Sign-On (SSO) khusus institusi / administrator kampus (`signInWithSSO`).
- Sinkronisasi awan terenkripsi untuk progres belajar pengguna.

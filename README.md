# Skilllevel

Platform pembelajaran web fullstack berbahasa Indonesia: 9 modul kurikulum terstruktur, evaluasi kuis adaptif, Tutor AI kontekstual tanpa kebocoran data, autentikasi mandiri, serta sinkronisasi cloud aman.

Tautan Produksi: [https://skilllevel-app.vercel.app](https://skilllevel-app.vercel.app)

---

## Fitur Utama

- **Kurikulum Terstruktur (9 Modul)**: Dari dasar peramban web, HTML5 semantik, CSS modern & Flexbox, JavaScript ES6+, DOM manipulation, hingga RESTful API dan integrasi basis data fullstack.
- **Evaluasi Kuis Adaptif**: Bank soal 10 butir per modul dengan opsi acak, pembahasan mendalam, serta kalkulasi perolehan XP dan level belajar.
- **Tutor AI Berkonteks Modul**: Asisten belajar interaktif yang dikunci secara ketat pada modul yang sedang dipelajari untuk mencegah halusinasi dan kebocoran instruksi sistem.
- **Model Bawaan Otomatis (Zero-Config)**: Sistem otomatis menggunakan model bawaan **Agnes 2.5 Flash** dan **Mercury-3** dengan mekanisme fallback cerdas saat terjadi kendala jaringan.
- **Dukungan Provider Mandiri (Self Provider)**: Dialog pengaturan khusus bagi pengguna yang ingin memakai endpoint dan kunci API pribadi (OpenAI Compatible, Groq, OpenRouter, atau server mandiri).
- **Autentikasi Mandiri & Aman**: Pendaftaran dan login akun dengan hashing kata sandi berbasis salt unik di sisi klien, tersinkronisasi ke PostgreSQL Supabase dengan Row Level Security (RLS) serta fallback lokal saat offline.
- **Integrasi Desain Vektor Figma**: Skrip terpadu untuk mengekspor dan menyinkronkan 8 artboard desktop vektor 1440x900 langsung ke berkas Figma resmi.

---

## Menjalankan Aplikasi

### 1. Pengembangan Lokal (Development)

```bash
# Pasang dependensi
npm install

# Salin berkas konfigurasi lingkungan
cp .env.example .env       # Windows PowerShell: copy .env.example .env

# Jalankan server pengembangan Vite
npm run dev                # Buka http://localhost:5173
```

### 2. Mode Produksi Lokal (Production)

```bash
npm run build
npm start                  # Server produksi di port 3000
```

`npm run dev` menjalankan Vite beserta middleware proxy AI. `npm start` menjalankan server Node.js yang menyajikan berkas statis `dist/` sekaligus proxy inferensi AI.

---

## Konfigurasi Lingkungan (`.env`)

Aplikasi menggunakan konfigurasi fleksibel dengan dukungan model bawaan ganda dan multi-kunci cadangan:

| Variabel | Bawaan | Keterangan |
| --- | --- | --- |
| `Mercury` | `https://api.inceptionlabs.ai/v1` | URL basis endpoint untuk model Mercury-3. |
| `Agnes` | `https://apihub.agnes-ai.com/v1` | URL basis endpoint untuk model Agnes 2.5 Flash. |
| `Mercury_key` | *(Kosong)* | Kredensial server Mercury. Mendukung multi-kunci cadangan dipisahkan tanda koma (`key1,key2...`). |
| `Agnes_key` | *(Bawaan Server)* | Kredensial server Agnes. Mendukung multi-kunci cadangan dipisahkan tanda koma (`key1,key2...`). |
| `AI_PROVIDER` | `openai` | Protokol penyedia API (`openai`, `anthropic`, atau `gemini`). |
| `AI_STREAMING` | `1` | `1` untuk streaming respons real-time bertahap, `0` untuk respons utuh. |
| `AI_THINKING` | `auto` | `auto` mengirim parameter penalaran berpikir, `off` untuk mematikan. |
| `AI_ALLOW_PRIVATE_ENDPOINTS` | `0` | `1` mengizinkan host privat/localhost (khusus pengujian lokal). |
| `AI_MAX_INPUT_CHARS` | `120000` | Batas maksimum karakter konteks modul per permintaan AI. |
| `SERVER_ENCRYPTION_KEY` | *(Secret 32-char)* | Kunci enkripsi simetris AES-256 untuk perlindungan token sisi server. |
| `VITE_SUPABASE_URL` | *(Opsional)* | URL instance Supabase untuk autentikasi dan sinkronisasi database cloud. |
| `VITE_SUPABASE_ANON_KEY` | *(Opsional)* | Kunci publik anon Supabase dengan Row Level Security aktif. |

---

## Konfigurasi Provider AI Mandiri

Pengguna yang ingin menggunakan endpoint dan kredensial pribadi dapat mengaturnya melalui tombol **Pengaturan AI** di bilah navigasi:

1. **Protokol Provider**: Pilihan OpenAI Compatible, Anthropic Claude, atau Google Gemini.
2. **Endpoint Kustom**: Alamat HTTPS pribadi (misal: `https://api.openai.com/v1`).
3. **Kunci API Kustom**: Disimpan hanya di memori sesi peramban lokal dan tidak pernah disimpan ke basis data pusat.
4. **Parameter Inferensi**: Pengaturan kustom untuk *Temperature* dan *Max Output Tokens*.

Jika kolom konfigurasi dikosongkan, aplikasi secara otomatis kembali menggunakan model bawaan server (*zero-config*).

---

## Arsitektur Keamanan & Privasi

- **Penyembunyian Kredensial Server**: Kunci API server Agnes dan Mercury tidak pernah dikirim ke peramban pengguna. Endpoint `/api/ai/health` hanya menampilkan status kesiapan dan nama model publik.
- **Proteksi SSRF (Server-Side Request Forgery)**: Fungsi `validateEndpoint` memblokir skema non-HTTPS, kredensial di URL, serta alamat IP jaringan privat (`localhost`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.1`, dll).
- **Pembersihan Kebocoran Rahasia (*Secret Redaction*)**: Modul `sanitizeAiOutput` memfilter token otorisasi, pola kunci (`sk-...`, `AIza...`), serta variabel lingkungan sensitif dari setiap respons AI.
- **Deteksi Anti-Looping Streaming**: Modul `createLoopDetector` memantau kemunculan kalimat yang berulang secara nyata tanpa memutus streaming normal dengan potongan chunk banyak.
- **Autentikasi Mandiri Tanpa Ketergantungan OAuth**: Seluruh data login diproses dengan verifikasi hash mandiri dan tersinkronisasi dua arah antara database Supabase dan cache lokal.

---

## Kurikulum 9 Modul Pembelajaran

| No | Modul Kurikulum | Topik Utama |
| --- | --- | --- |
| 01 | Cara Browser Menampilkan Halaman | Siklus request HTTP, DNS, parsing HTML, DOM, CSSOM, Render Tree |
| 02 | HTML Bermakna dan Aksesibel | Struktur semantik, aksesibilitas ARIA, navigasi SEO ramah mesin pencari |
| 03 | CSS Modern, Grid & Flexbox | Layout 2 dimensi responsif, variabel CSS, auto-fit, media queries |
| 04 | JavaScript: Nilai, Fungsi, dan Array | ES6+, destructuring, immutability, closure, higher-order functions |
| 05 | DOM, Event, dan State Antarmuka | Event bubbling, event delegation efisien, manipulasi tree node |
| 06 | HTTP, REST, dan Bentuk Respons | Asynchronous JS, Promises, Fetch API, penanganan kode status HTTP |
| 07 | Web Server dan Basis Data | Arsitektur runtime Node.js, Express REST API, struktur database relasional |
| 08 | Integrasi Model AI yang Aman | Prompt grounding, mitigasi prompt injection, sanitasi respons model |
| 09 | Keamanan Aplikasi Web | Proteksi OWASP Top 10, sanitasi XSS, pencegahan CSRF, enkripsi data |

Setiap modul dilengkapi materi konsep, contoh kode nyata, daftar isi interaktif, tip performa, serta evaluasi kuis 10 soal adaptif.

---

## Desain Figma & Arsitektur Sistem

Arsitektur desain aplikasi diorganisasi secara modular berbasis alur fitur (*Flow-based Architecture*) dengan artboard desktop standar 1440x900 berbasis vektor asli (*vector node tree*):

- **01 Authentication Flow**: [Figma File 01](https://www.figma.com/design/DogKwsWdp8R8plI3GiaRW1) (Form Login & Register mandiri)
- **02 Dashboard & Curriculum**: [Figma File 02](https://www.figma.com/design/MKtNdIT96Yq5greixL1UMy) (Dasbor Belajar & Katalog 9 Modul)
- **03 Interactive Learning & AI Tutor**: [Figma File 03](https://www.figma.com/design/03imbc2TMZmTUndZyw6Q6n) (Detail Modul, Kuis Adaptif, Drawer AI Tutor)
- **04 Settings & Modals**: [Figma File 04](https://www.figma.com/design/qoM6bDqhnTvY2rzv8kRV6a) (Modal Konfigurasi Provider Mandiri)
- **Flowchart & System Board**: [FigJam Architecture Board](https://www.figma.com/board/pYWqsjI9QUFtjXpW0FdAOc) (Diagram alur sistem, batas keamanan, dan siklus sinkronisasi)

---

## Skrip yang Tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan Vite dan proxy AI lokal (port 5173) |
| `npm run build` | Mengompilasi bundel produksi teroptimasi ke direktori `dist/` |
| `npm start` | Menjalankan server produksi terpadu Node.js (port 3000) |
| `npm run lint` | Memeriksa validitas sintaks seluruh 13 berkas JavaScript utama |
| `npm test` | Menjalankan 45 pengujian unit dan keamanan otomatis (`node --test`) |
| `npm run figma:sync` | Mengenerate 8 artboard vektor desktop 1440x900 dari kode proyek ke folder `design_exports/` |

---

## Struktur Proyek

```
server/
  env.js         Pembacaan konfigurasi lingkungan, parsing multi-kunci Agnes & Mercury
  security.js    Redaksi rahasia, validasi endpoint publik, pembatas frekuensi permintaan
  leakGuard.js   Deteksi anti-injection, sanitasi output AI, deteksi repetisi loop
  aiProxy.js     Proxy inferensi model bawaan & mandiri, fallback otomatis, streaming
  handler.js     Handler endpoint serverless /api/ai/health dan /api/ai/chat
  index.js       Server produksi Node.js penyaji dist/ dan API
  test/          Suite 45 pengujian unit otomatis (security, env, lib, production)
src/
  App.jsx        Komponen utama perakit navigasi dan state global
  views/         LoginView, DashboardView, ModuleDetailView, QuizView, TutorView, UploadView
  components/    Komponen UI, SettingsDialog, Markdown, Tag, Field, Button
  lib/           supabaseClient, aiClient, chatContext, module, quiz, quizRun, crypto, i18n
  data/          curriculum.js (Kurikulum 9 modul bawaan beserta bank soal)
design_exports/  Ekspor lokal 8 artboard vektor SVG 1440x900
scripts/         Skrip verifikasi lint, pengujian, build, dan figma:sync
```

---

## CI/CD & Deployment

- **GitHub Actions Pipeline**: Menguji kepatuhan lint, 45 unit tests, serta verifikasi build produksi pada setiap aktivitas *push* ke branch `main`.
- **Produksi Otomatis Vercel**: Deployment terintegrasi secara otomatis dan langsung aktif saat alur CI berstatus hijau.

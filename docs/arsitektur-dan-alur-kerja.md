# Arsitektur Sistem dan Alur Kerja Aplikasi

Dokumen ini menjelaskan arsitektur teknis menyeluruh dari aplikasi Skilllevel, mulai dari lapisan antarmuka pengguna hingga sistem proksi AI, autentikasi, serta perlindungan data terenkripsi.

---

## 1. Gambaran Arsitektur Tingkat Tinggi

Aplikasi Skilllevel dirancang menggunakan arsitektur hybrid Single Page Application (SPA) dengan Secure Server-Side AI Gateway:

```
[ Klien / Peramban Pengguna ]
   │
   ├─ Antarmuka React 18 (Vite, Tailwind CSS, Editorial Theme)
   ├─ State & Navigasi Terpusat (Dashboard, Modul, Kuis, Tutor, Unggah, Progres)
   ├─ I18n Engine (Dukungan Bahasa Indonesia [ID] & English [EN])
   ├─ Client-Side E2EE Engine (Web Crypto API AES-GCM 256-bit)
   └─ Supabase Auth Adapter (OAuth Google & Enterprise Admin SSO)
            │
            │ HTTPS (Secure Cookie / Authorization)
            ▼
[ Gateway Server / Vercel Serverless Function ]
   │
   ├─ Rate Limiting (Token Bucket: 40 permintaan / menit per IP)
   ├─ Input Sanitizer & Prompt Injection Inspector (leakGuard.js)
   ├─ SSRF Protection & Endpoint Validator (security.js)
   ├─ Multi-Provider Adapter (OpenAI Compatible, Anthropic Claude, Google Gemini)
   ├─ Fallback Key Rotator & Exponential Backoff Retry (aiProxy.js)
   ├─ Repetition & Loop Breaker (leakGuard.js)
   ├─ Secret Redactor & System Prompt Guard (security.js & leakGuard.js)
   └─ Server-Side AES-256-GCM Encryption Engine (crypto.js)
            │
            │ Upstream HTTPS
            ▼
[ Layanan AI Eksternal & Basis Data Cloud ]
   ├─ Inception Labs (Model Mercury-3)
   ├─ Agnes AI / OpenAI Compatible Providers
   ├─ Anthropic API (Claude 3.5 Sonnet / Haiku)
   ├─ Google Gemini API (Gemini 2.0 Flash)
   └─ Supabase Database (PostgreSQL + RLS untuk Penyimpanan Progres Terenkripsi)
```

---

## 2. Alur Kerja Permintaan AI (Chat & Streaming)

Setiap interaksi dengan Tutor AI atau generator modul melalui tahapan pengamanan ketat:

1. **Pemeriksaan Input Klien**: Pertanyaan pengguna diuji terhadap batasan panjang karakter dan diformulasikan ke format riwayat chat terstandar.
2. **Pengiriman via Proxy Server**: Permintaan dikirim ke endpoint `/api/ai/chat` (tanpa menyertakan kredensial server di peramban).
3. **Validasi Keamanan & Deteksi Injeksi**:
   - `inspectInput()` memeriksa apakah ada pola prompt injection seperti instruksi mengabaikan konteks ("ignore previous instructions") atau upaya mengekstrak system prompt internal.
   - `validateEndpoint()` memverifikasi alamat target tidak mengarah ke localhost atau jaringan internal (SSRF prevention).
4. **Pemilihan Provider & Kunci API**:
   - Sistem memilih adapter protokol yang sesuai (OpenAI `/chat/completions`, Anthropic `/messages`, atau Gemini).
   - Kunci API utama diambil dari lingkungan server. Jika terjadi kegagalan (401, 403, 429), kunci cadangan dari daftar `AI_API_KEY_FALLBACKS` langsung diaktifkan secara otomatis.
5. **Jaringan Resilien & Retry Otomatis**:
   - Jika terjadi kendala jaringan sementara (429 rate limit, 500/502/503/504 upstream error), sistem melakukan retry dengan exponential backoff dan jitter.
6. **Deteksi Pengulangan (Loop Breaker)**:
   - Chunk teks yang dialirkan (streaming SSE) dipantau oleh `createLoopDetector()`. Jika model mulai mengulang kalimat yang sama lebih dari 3 kali berturut-turut, aliran segera dipotong secara anggun.
7. **Pembersihan Kebocoran & Rendering**:
   - `sanitizeAiOutput()` menyaring setiap fragmen kunci API, variabel lingkungan, atau token rahasia sebelum teks dikirimkan ke peramban.
   - Komponen `Markdown.jsx` di sisi klien merender teks secara aman tanpa `dangerouslySetInnerHTML`, menyaring URL berbahaya, dan menutup blok kode yang belum tuntas.

---

## 3. Sistem Keamanan Data Pengguna (End-to-End Encryption)

Data progres belajar, riwayat kuis, dan modul unggahan diamankan secara berlapis:

- **Lapisan Klien**: Modul `src/lib/crypto.js` membuat kunci turunan perangkat (PBKDF2 dengan 100.000 iterasi SHA-256) dan mengenkripsi payload dengan cipher AES-GCM 256-bit beserta IV acak 12-byte.
- **Transmisi**: Data yang dikirim ke Supabase atau disimpan di penyimpanan lokal berbentuk ciphertext Base64. Pihak ketiga atau penyedia database tidak dapat membaca isi progres maupun modul pribadi tanpa kunci klien.
- **Lapisan Server**: Modul `server/crypto.js` menyediakan enkripsi simetris AES-256-GCM untuk data sensitif di sisi server menggunakan kunci master terproteksi.

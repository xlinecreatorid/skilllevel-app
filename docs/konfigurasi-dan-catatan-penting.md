# Konfigurasi Lingkungan dan Catatan Penting

Dokumen ini memuat referensi lengkap variabel lingkungan (environment variables), batasan teknis sistem, serta penanganan isu yang diketahui (known issues).

---

## 1. Daftar Lengkap Variabel Lingkungan (.env)

| Variabel | Tipe | Nilai Bawaan | Deskripsi |
| :--- | :--- | :--- | :--- |
| `AI_BASE_URL` | String (URL) | `https://api.inceptionlabs.ai/v1` | Alamat endpoint API model. Wajib berakhiran path API yang valid. |
| `AI_MODEL` | String | `mercury-3` | Model bawaan aplikasi. Dapat diganti dengan `agnes-2.5-flash` atau `gemini-2.0-flash`. |
| `AI_PROVIDER` | String | `openai` | Protokol format panggilan: `openai`, `anthropic`, atau `gemini`. |
| `AI_API_KEY` | String | `""` | Kunci API utama untuk server. Tidak pernah terekspos ke klien. |
| `AI_API_KEY_FALLBACKS` | String (CSV) | `""` | Daftar kunci API cadangan yang dipisahkan koma (`kunci2,kunci3`). Otomatis dirotasi jika kunci utama gagal. |
| `AI_STREAMING` | Number | `1` | Mengaktifkan aliran teks Server-Sent Events (`1` = aktif, `0` = nonaktif). |
| `AI_THINKING` | String | `auto` | Mengatur parameter penalaran (`auto` = kirim ke provider, `off` = jangan kirim). |
| `AI_ALLOW_PRIVATE_ENDPOINTS` | Number | `0` | Proteksi SSRF. Setel `1` hanya jika melakukan pengetesan terhadap endpoint lokal/private. |
| `AI_MAX_INPUT_CHARS` | Number | `120000` | Batas maksimum total karakter input dalam satu permintaan chat. |
| `SERVER_ENCRYPTION_KEY` | String | Random Key | Kunci master untuk enkripsi simetris data server. |
| `VITE_SUPABASE_URL` | String (URL) | `""` | URL proyek Supabase untuk autentikasi Google OAuth dan sinkronisasi awan. |
| `VITE_SUPABASE_ANON_KEY` | String | `""` | Kunci anonim publik Supabase untuk klien. |

---

## 2. Batasan Teknis Sistem (System Limits)

1. **Pembatasan Laju (Rate Limiting)**:
   - Maksimum **40 permintaan per menit per alamat IP** pada rute `/api/ai/*`.
   - Permintaan yang melebihi batas akan menerima respons HTTP 429 dengan header `Retry-After`.
2. **Ukuran Berkas Unggahan**:
   - Maksimum **15 MB** per dokumen.
   - Format yang didukung: PDF, Markdown (`.md`), teks murni (`.txt`), HTML, CSS, JavaScript, JSON, YAML, SQL, Python.
3. **Batas Konteks & Pesan**:
   - Maksimum 40 giliran pesan dalam satu percakapan.
   - Maksimum 60.000 karakter per pesan tunggal.
4. **Pencegahan Looping**:
   - Detektor repetisi otomatis menghentikan aliran jika sebuah kalimat atau klausa yang sama diulang 3 kali berturut-turut.

---

## 3. Catatan Penting & Known Issues

### Penyimpanan Tanpa Akun vs Akun Terotentikasi
- Pengguna tamu (guest) dapat langsung memakai aplikasi tanpa login; seluruh progres tersimpan di penyimpanan lokal browser dengan enkripsi AES-GCM berbasis kunci perangkat acak.
- Jika pengguna membersihkan cache browser, data lokal tamu akan terhapus. Untuk penyimpanan permanen lintas perangkat, pengguna disarankan melakukan login via Akun Google atau SSO Admin.

### Penanganan Fallback Kunci API
- Apabila penyedia model mengembalikan galat `401 Unauthorized`, `403 Forbidden`, atau `429 Too Many Requests`, sistem secara transparan mencoba kunci cadangan berikutnya yang tercantum pada `AI_API_KEY_FALLBACKS`.
- Pengguna tidak akan merasakan gangguan jika setidaknya satu kunci cadangan masih memiliki kuota aktif.

### Kepatuhan Isolasi Kredensial
- Header `Authorization` dengan kunci server dipasang di lapisan server/middleware dan **tidak pernah diinjeksikan** ke browser atau dicetak ke log publik.
- Seluruh pesan galat upstream melewati fungsi `redact()` yang secara otomatis menghapus pola string kredensial (`sk-...`, `Bearer ...`, `AIza...`).

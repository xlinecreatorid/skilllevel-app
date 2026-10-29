const fs = require('fs');
const path = require('path');

// Target Figma Files per Flow
const FIGMA_FILES = {
  auth: {
    key: 'DogKwsWdp8R8plI3GiaRW1',
    name: '01 Authentication Flow',
    url: 'https://www.figma.com/design/DogKwsWdp8R8plI3GiaRW1',
  },
  dashboard: {
    key: 'MKtNdIT96Yq5greixL1UMy',
    name: '02 Dashboard & Curriculum',
    url: 'https://www.figma.com/design/MKtNdIT96Yq5greixL1UMy',
  },
  learning: {
    key: '03imbc2TMZmTUndZyw6Q6n',
    name: '03 Interactive Learning & AI Tutor',
    url: 'https://www.figma.com/design/03imbc2TMZmTUndZyw6Q6n',
  },
  settings: {
    key: 'qoM6bDqhnTvY2rzv8kRV6a',
    name: '04 Settings & Modals',
    url: 'https://www.figma.com/design/qoM6bDqhnTvY2rzv8kRV6a',
  },
};

const outputDir = path.join(__dirname, '..', 'design_exports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// -------------------------------------------------------------
// Vektor Generators Berbasis Kode Nyata Proyek
// -------------------------------------------------------------

function generateAuthLoginSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="1440" height="900">
  <rect width="1440" height="900" fill="#f5f0e6"/>
  <rect width="1440" height="64" fill="#fcfaf5"/>
  <line x1="0" y1="64" x2="1440" y2="64" stroke="#e3ded1" stroke-width="1"/>
  <text x="80" y="38" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#1b1a17">Skilllevel</text>
  <text x="175" y="38" font-family="sans-serif" font-size="11" font-weight="600" letter-spacing="1.5" fill="#8c8577">JALUR WEB FULLSTACK</text>
  
  <rect x="1310" y="20" width="50" height="26" fill="#f5f0e6" stroke="#c8c2b5" rx="2"/>
  <rect x="1310" y="20" width="25" height="26" fill="#294868" rx="2"/>
  <text x="1318" y="37" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff">ID</text>
  <text x="1342" y="37" font-family="sans-serif" font-size="11" font-weight="bold" fill="#5e5a52">EN</text>

  <g transform="translate(480, 140)">
    <rect width="480" height="600" fill="#fcfaf5" stroke="#c8c2b5" stroke-width="1" rx="4"/>
    <text x="40" y="45" font-family="sans-serif" font-size="11" font-weight="bold" letter-spacing="1.5" fill="#294868">GERBANG AUTENTIKASI</text>
    <text x="40" y="80" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#1b1a17">Platform Pembelajaran Web</text>
    <text x="40" y="105" font-family="sans-serif" font-size="13" fill="#5e5a52">Akses 9 modul kurikulum, kuis adaptif, dan AI Tutor terenkripsi.</text>

    <line x1="40" y1="150" x2="440" y2="150" stroke="#e3ded1" stroke-width="1"/>
    <text x="40" y="142" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1b1a17">Masuk</text>
    <line x1="40" y1="150" x2="85" y2="150" stroke="#294868" stroke-width="2"/>
    <text x="110" y="142" font-family="sans-serif" font-size="14" fill="#8c8577">Daftar Akun Baru</text>

    <g transform="translate(40, 190)">
      <text x="0" y="16" font-family="sans-serif" font-size="13" font-weight="600" fill="#1b1a17">Nama Pengguna (Username)</text>
      <rect x="0" y="26" width="400" height="42" fill="#ffffff" stroke="#c8c2b5" rx="3"/>
      <text x="14" y="52" font-family="sans-serif" font-size="13" fill="#1b1a17">siswa_belajar</text>

      <text x="0" y="102" font-family="sans-serif" font-size="13" font-weight="600" fill="#1b1a17">Kata Sandi (Password)</text>
      <rect x="0" y="112" width="400" height="42" fill="#ffffff" stroke="#c8c2b5" rx="3"/>
      <text x="14" y="138" font-family="sans-serif" font-size="16" fill="#1b1a17">••••••••••••</text>

      <rect x="0" y="180" width="400" height="44" fill="#294868" rx="3"/>
      <text x="175" y="207" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Masuk</text>
    </g>
    
    <g transform="translate(40, 480)">
      <rect width="400" height="70" fill="#f5f0e6" stroke="#e3ded1" rx="3"/>
      <text x="16" y="28" font-family="sans-serif" font-size="11" font-weight="bold" fill="#294868">AUTENTIKASI AMAN &amp; PRIVAT</text>
      <text x="16" y="48" font-family="sans-serif" font-size="11" fill="#5e5a52">Kredensial di-hash dengan PBKDF2 salt unik dan disimpan terenkripsi.</text>
    </g>
  </g>
</svg>`;
}

function generateAuthRegisterSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="1440" height="900">
  <rect width="1440" height="900" fill="#f5f0e6"/>
  <rect width="1440" height="64" fill="#fcfaf5"/>
  <line x1="0" y1="64" x2="1440" y2="64" stroke="#e3ded1" stroke-width="1"/>
  <text x="80" y="38" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#1b1a17">Skilllevel</text>
  <text x="175" y="38" font-family="sans-serif" font-size="11" font-weight="600" letter-spacing="1.5" fill="#8c8577">JALUR WEB FULLSTACK</text>

  <g transform="translate(480, 110)">
    <rect width="480" height="680" fill="#fcfaf5" stroke="#c8c2b5" stroke-width="1" rx="4"/>
    <text x="40" y="45" font-family="sans-serif" font-size="11" font-weight="bold" letter-spacing="1.5" fill="#294868">PENDAFTARAN SISWA</text>
    <text x="40" y="80" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#1b1a17">Buat Akun Pembelajaran</text>
    <text x="40" y="105" font-family="sans-serif" font-size="13" fill="#5e5a52">Daftar akun mandiri tanpa ketergantungan pihak ketiga.</text>

    <line x1="40" y1="145" x2="440" y2="145" stroke="#e3ded1" stroke-width="1"/>
    <text x="40" y="137" font-family="sans-serif" font-size="14" fill="#8c8577">Masuk</text>
    <text x="110" y="137" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1b1a17">Daftar Akun Baru</text>
    <line x1="110" y1="145" x2="225" y2="145" stroke="#294868" stroke-width="2"/>

    <g transform="translate(40, 170)">
      <!-- 1. Full Name -->
      <text x="0" y="14" font-family="sans-serif" font-size="12" font-weight="600" fill="#1b1a17">Nama Lengkap (Full name)</text>
      <rect x="0" y="24" width="400" height="38" fill="#ffffff" stroke="#c8c2b5" rx="3"/>
      <text x="14" y="48" font-family="sans-serif" font-size="13" fill="#1b1a17">Ahmad Faiz Pratama</text>

      <!-- 2. Username -->
      <text x="0" y="84" font-family="sans-serif" font-size="12" font-weight="600" fill="#1b1a17">Nama Pengguna (Username)</text>
      <rect x="0" y="94" width="400" height="38" fill="#ffffff" stroke="#c8c2b5" rx="3"/>
      <text x="14" y="118" font-family="sans-serif" font-size="13" fill="#1b1a17">faiz_pratama</text>

      <!-- 3. Password -->
      <text x="0" y="154" font-family="sans-serif" font-size="12" font-weight="600" fill="#1b1a17">Kata Sandi (Password)</text>
      <rect x="0" y="164" width="400" height="38" fill="#ffffff" stroke="#c8c2b5" rx="3"/>
      <text x="14" y="188" font-family="sans-serif" font-size="15" fill="#1b1a17">••••••••••••</text>

      <!-- 4. Confirm Password -->
      <text x="0" y="224" font-family="sans-serif" font-size="12" font-weight="600" fill="#1b1a17">Konfirmasi Kata Sandi (Confirm password)</text>
      <rect x="0" y="234" width="400" height="38" fill="#ffffff" stroke="#c8c2b5" rx="3"/>
      <text x="14" y="258" font-family="sans-serif" font-size="15" fill="#1b1a17">••••••••••••</text>

      <!-- Submit Button -->
      <rect x="0" y="295" width="400" height="42" fill="#294868" rx="3"/>
      <text x="150" y="321" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Daftar Akun Sekarang</text>
    </g>

    <g transform="translate(40, 550)">
      <rect width="400" height="60" fill="#f5f0e6" stroke="#e3ded1" rx="3"/>
      <text x="16" y="26" font-family="sans-serif" font-size="11" font-weight="bold" fill="#294868">PERLINDUNGAN IDENTITAS</text>
      <text x="16" y="44" font-family="sans-serif" font-size="11" fill="#5e5a52">Tersinkronisasi ke basis data Supabase PostgreSQL dengan RLS aktif.</text>
    </g>
  </g>
</svg>`;
}

function generateDashboardSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="1440" height="900">
  <rect width="1440" height="900" fill="#f5f0e6"/>
  <rect width="1440" height="68" fill="#fcfaf5"/>
  <line x1="0" y1="68" x2="1440" y2="68" stroke="#e3ded1" stroke-width="1"/>
  
  <text x="80" y="42" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#1b1a17">Skilllevel</text>
  <rect x="180" y="27" width="165" height="22" fill="#e8f0fe" rx="3"/>
  <text x="188" y="42" font-family="sans-serif" font-size="10" font-weight="700" letter-spacing="1.2" fill="#294868">JALUR WEB FULLSTACK</text>

  <text x="440" y="42" font-family="sans-serif" font-size="14" font-weight="700" fill="#294868">Dasbor Belajar</text>
  <line x1="440" y1="48" x2="538" y2="48" stroke="#294868" stroke-width="2"/>
  <text x="570" y="42" font-family="sans-serif" font-size="14" font-weight="500" fill="#5e5a52">Katalog Modul</text>
  <text x="690" y="42" font-family="sans-serif" font-size="14" font-weight="500" fill="#5e5a52">Statistik Kuis</text>

  <g transform="translate(1080, 20)">
    <rect x="0" y="0" width="90" height="28" fill="#fff7ed" stroke="#fed7aa" rx="14"/>
    <text x="12" y="19" font-family="sans-serif" font-size="14">🔥</text>
    <text x="32" y="18" font-family="sans-serif" font-size="12" font-weight="bold" fill="#c2410c">3 Hari</text>
    <circle cx="235" cy="14" r="14" fill="#294868"/>
    <text x="230" y="19" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff">SB</text>
    <text x="256" y="19" font-family="sans-serif" font-size="13" font-weight="600" fill="#1b1a17">Siswa</text>
  </g>

  <g transform="translate(80, 96)">
    <rect width="1280" height="110" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
    <text x="32" y="42" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#1b1a17">Selamat Datang Kembali, Siswa Belajar</text>
    <text x="32" y="68" font-family="sans-serif" font-size="13" fill="#5e5a52">Lanjutkan perjalanan kurikulum web fullstack terstruktur. 4 dari 9 modul telah tuntas dievaluasi.</text>

    <g transform="translate(880, 25)">
      <text x="0" y="20" font-family="sans-serif" font-size="11" font-weight="bold" letter-spacing="1" fill="#8c8577">STATUS KEMAJUAN</text>
      <text x="240" y="20" font-family="sans-serif" font-size="13" font-weight="bold" fill="#294868">Level 2 • 420 / 600 XP</text>
      <rect x="0" y="32" width="360" height="12" fill="#e3ded1" rx="6"/>
      <rect x="0" y="32" width="252" height="12" fill="#294868" rx="6"/>
      <text x="0" y="58" font-family="sans-serif" font-size="11" fill="#5e5a52">Tinggal 180 XP menuju Gelar Mahir Frontend</text>
    </g>

    <g transform="translate(0, 130)">
      <rect width="410" height="175" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
      <rect x="24" y="24" width="130" height="22" fill="#dbeafe" rx="3"/>
      <text x="32" y="39" font-family="sans-serif" font-size="10" font-weight="bold" fill="#1e40af">SEDANG BERJALAN</text>
      <text x="24" y="74" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#1b1a17">Modul 04: DOM Manipulation</text>
      <text x="24" y="98" font-family="sans-serif" font-size="12" fill="#5e5a52">Pahami event bubbling, delegation, dan manipulasi pohon DOM.</text>
      <rect x="24" y="120" width="200" height="6" fill="#e3ded1" rx="3"/>
      <rect x="24" y="120" width="140" height="6" fill="#1e40af" rx="3"/>
      <text x="232" y="126" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e40af">70% Selesai</text>
      <rect x="290" y="112" width="100" height="34" fill="#294868" rx="3"/>
      <text x="312" y="133" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Lanjutkan</text>

      <g transform="translate(435, 0)">
        <rect width="410" height="175" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
        <text x="24" y="38" font-family="sans-serif" font-size="11" font-weight="bold" letter-spacing="1" fill="#8c8577">AKURASI KUIS ADAPTIF</text>
        <text x="24" y="85" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#15803d">92.5%</text>
        <text x="24" y="112" font-family="sans-serif" font-size="12" fill="#5e5a52">Dari 4 kuis yang telah Anda kerjakan</text>
        <line x1="24" y1="128" x2="386" y2="128" stroke="#e3ded1" stroke-width="1"/>
        <text x="24" y="148" font-family="sans-serif" font-size="11" font-weight="bold" fill="#15803d">✓ 37 Benar</text>
        <text x="110" y="148" font-family="sans-serif" font-size="11" fill="#8c8577">•  3 Remedial  •  Rata-rata 1.4 menit/soal</text>
      </g>

      <g transform="translate(870, 0)">
        <rect width="410" height="175" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
        <text x="24" y="38" font-family="sans-serif" font-size="11" font-weight="bold" letter-spacing="1" fill="#8c8577">TUTOR AI PEMBELAJARAN</text>
        <text x="24" y="74" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#1b1a17">Tersinkronisasi Konteks</text>
        <text x="24" y="98" font-family="sans-serif" font-size="12" fill="#5e5a52">Tanyakan konsep koding rumit secara privat dan instan di dalam modul.</text>
        <rect x="24" y="118" width="130" height="34" fill="#f5f0e6" stroke="#c8c2b5" rx="3"/>
        <text x="36" y="139" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1b1a17">Buka AI Tutor</text>
        <text x="170" y="139" font-family="sans-serif" font-size="11" fill="#15803d">● Siap Digunakan</text>
      </g>
    </g>
  </g>
</svg>`;
}

function generateCurriculumSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="1440" height="900">
  <rect width="1440" height="900" fill="#f5f0e6"/>
  <rect width="1440" height="68" fill="#fcfaf5"/>
  <line x1="0" y1="68" x2="1440" y2="68" stroke="#e3ded1" stroke-width="1"/>
  
  <text x="80" y="42" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#1b1a17">Skilllevel</text>
  <rect x="180" y="27" width="165" height="22" fill="#e8f0fe" rx="3"/>
  <text x="188" y="42" font-family="sans-serif" font-size="10" font-weight="700" letter-spacing="1.2" fill="#294868">JALUR WEB FULLSTACK</text>

  <g transform="translate(80, 95)">
    <text x="0" y="30" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#1b1a17">Katalog Kurikulum Web Fullstack</text>
    <text x="0" y="56" font-family="sans-serif" font-size="14" fill="#5e5a52">9 modul pembelajaran dari fondasi markup hingga deployment dan arsitektur database modern.</text>

    <!-- Grid 9 Modul -->
    <g transform="translate(0, 90)">
      <g transform="translate(0, 0)">
        <rect width="410" height="190" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
        <text x="20" y="28" font-family="sans-serif" font-size="10" font-weight="bold" fill="#15803d">MODUL 01 • SELESAI</text>
        <text x="20" y="56" font-family="Georgia, serif" font-size="15" font-weight="bold" fill="#1b1a17">Dasar HTML5 Semantik &amp; Aksesibilitas</text>
        <text x="20" y="80" font-family="sans-serif" font-size="12" fill="#5e5a52">Struktur dokumen modern, elemen semantik navigasi, heading terstruktur, atribut ARIA.</text>
        <text x="20" y="125" font-family="sans-serif" font-size="11" fill="#8c8577">45 Menit • Pemula • Skor Kuis: 100%</text>
        <rect x="20" y="140" width="370" height="34" fill="#f5f0e6" stroke="#c8c2b5" rx="3"/>
        <text x="145" y="162" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1b1a17">Tinjau Pembahasan</text>
      </g>
      <g transform="translate(435, 0)">
        <rect width="410" height="190" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
        <text x="20" y="28" font-family="sans-serif" font-size="10" font-weight="bold" fill="#15803d">MODUL 02 • SELESAI</text>
        <text x="20" y="56" font-family="Georgia, serif" font-size="15" font-weight="bold" fill="#1b1a17">CSS Modern, Grid &amp; Tata Letak Flexbox</text>
        <text x="20" y="80" font-family="sans-serif" font-size="12" fill="#5e5a52">Pola layout dua dimensi responsif, variabel CSS, auto-fit, auto-fill, dan mobile-first.</text>
        <text x="20" y="125" font-family="sans-serif" font-size="11" fill="#8c8577">60 Menit • Pemula • Skor Kuis: 90%</text>
        <rect x="20" y="140" width="370" height="34" fill="#f5f0e6" stroke="#c8c2b5" rx="3"/>
        <text x="145" y="162" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1b1a17">Tinjau Pembahasan</text>
      </g>
      <g transform="translate(870, 0)">
        <rect width="410" height="190" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
        <text x="20" y="28" font-family="sans-serif" font-size="10" font-weight="bold" fill="#15803d">MODUL 03 • SELESAI</text>
        <text x="20" y="56" font-family="Georgia, serif" font-size="15" font-weight="bold" fill="#1b1a17">JavaScript Modern &amp; Ekosistem ES6+</text>
        <text x="20" y="80" font-family="sans-serif" font-size="12" fill="#5e5a52">Destrukturisasi, arrow functions, immutability, closure, dan sintaks modul ESM.</text>
        <text x="20" y="125" font-family="sans-serif" font-size="11" fill="#8c8577">90 Menit • Menengah • Skor Kuis: 85%</text>
        <rect x="20" y="140" width="370" height="34" fill="#f5f0e6" stroke="#c8c2b5" rx="3"/>
        <text x="145" y="162" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1b1a17">Tinjau Pembahasan</text>
      </g>
    </g>
  </g>
</svg>`;
}

function generateModuleDetailSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="1440" height="900">
  <rect width="1440" height="900" fill="#f5f0e6"/>
  <rect width="1440" height="60" fill="#fcfaf5"/>
  <line x1="0" y1="60" x2="1440" y2="60" stroke="#e3ded1" stroke-width="1"/>
  
  <text x="40" y="36" font-family="sans-serif" font-size="13" font-weight="600" fill="#294868">← Kembali ke Dasbor</text>
  <text x="200" y="36" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#1b1a17">Modul 04: Manipulasi DOM &amp; Penanganan Event</text>
  <rect x="1260" y="16" width="140" height="30" fill="#294868" rx="3"/>
  <text x="1280" y="36" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Mulai Kuis (10)</text>

  <g transform="translate(40, 80)">
    <rect width="280" height="780" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
    <text x="24" y="36" font-family="sans-serif" font-size="11" font-weight="bold" letter-spacing="1" fill="#8c8577">DAFTAR ISI MODUL</text>
    <text x="24" y="80" font-family="sans-serif" font-size="13" font-weight="bold" fill="#294868">1. Konsep Pohon DOM</text>
    <text x="24" y="115" font-family="sans-serif" font-size="13" font-weight="500" fill="#5e5a52">2. Seleksi Node Modern</text>
    <text x="24" y="150" font-family="sans-serif" font-size="13" font-weight="500" fill="#5e5a52">3. Event Listener &amp; Bubbling</text>
    <text x="24" y="185" font-family="sans-serif" font-size="13" font-weight="500" fill="#5e5a52">4. Event Delegation</text>

    <g transform="translate(305, 0)">
      <rect width="1055" height="780" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
      <g transform="translate(60, 48)">
        <text x="0" y="24" font-family="sans-serif" font-size="11" font-weight="bold" letter-spacing="1.5" fill="#8c8577">BAB 1: FONDASI STRUKTURAL</text>
        <text x="0" y="60" font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#1b1a17">Memahami Konsep Pohon DOM</text>
        <text x="0" y="90" font-family="sans-serif" font-size="14" fill="#5e5a52">Document Object Model (DOM) adalah representasi berorientasi objek dari HTML.</text>

        <rect x="0" y="130" width="935" height="160" fill="#1e1e1e" rx="4"/>
        <text x="24" y="35" font-family="monospace" font-size="12" fill="#888888">// Contoh: Pola Seleksi Modern</text>
        <text x="24" y="65" font-family="monospace" font-size="13" fill="#569cd6">const</text>
        <text x="75" y="65" font-family="monospace" font-size="13" fill="#9cdcfe">btn</text>
        <text x="110" y="65" font-family="monospace" font-size="13" fill="#d4d4d4">=</text>
        <text x="130" y="65" font-family="monospace" font-size="13" fill="#9cdcfe">document</text>
        <text x="190" y="65" font-family="monospace" font-size="13" fill="#d4d4d4">.</text>
        <text x="198" y="65" font-family="monospace" font-size="13" fill="#dcdcaa">querySelector</text>
        <text x="300" y="65" font-family="monospace" font-size="13" fill="#ce9178">('.action-button')</text>
        <text x="430" y="65" font-family="monospace" font-size="13" fill="#d4d4d4">;</text>
      </g>
    </g>
  </g>
</svg>`;
}

function generateQuizSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="1440" height="900">
  <rect width="1440" height="900" fill="#f5f0e6"/>
  <rect width="1440" height="60" fill="#fcfaf5"/>
  <line x1="0" y1="60" x2="1440" y2="60" stroke="#e3ded1" stroke-width="1"/>
  <text x="60" y="36" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#1b1a17">Evaluasi Kuis Adaptif</text>
  <text x="270" y="36" font-family="sans-serif" font-size="13" fill="#8c8577">• Modul 04: Manipulasi DOM</text>

  <g transform="translate(260, 100)">
    <rect width="920" height="720" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
    <g transform="translate(50, 40)">
      <text x="0" y="16" font-family="sans-serif" font-size="12" font-weight="bold" fill="#8c8577">PERTANYAAN 4 DARI 10</text>
      <rect x="0" y="28" width="820" height="8" fill="#e3ded1" rx="4"/>
      <rect x="0" y="28" width="328" height="8" fill="#294868" rx="4"/>
    </g>

    <g transform="translate(50, 110)">
      <text x="0" y="32" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#1b1a17">Bagaimana teknik efisien menangani klik pada 50 tombol dinamis tanpa boros memori?</text>
    </g>

    <g transform="translate(50, 200)">
      <rect width="820" height="64" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
      <text x="30" y="37" font-family="sans-serif" font-size="14" fill="#1b1a17">A. Memasang listener click terpisah pada setiap tombol menggunakan loop forEach.</text>
      
      <g transform="translate(0, 80)">
        <rect width="820" height="64" fill="#e8f0fe" stroke="#294868" stroke-width="2" rx="4"/>
        <text x="30" y="37" font-family="sans-serif" font-size="14" font-weight="bold" fill="#294868">B. Menerapkan Event Delegation pada kontainer induk dan memeriksa event.target.</text>
      </g>
    </g>

    <g transform="translate(50, 580)">
      <line x1="0" y1="0" x2="820" y2="0" stroke="#e3ded1" stroke-width="1"/>
      <rect x="660" y="24" width="160" height="40" fill="#294868" rx="3"/>
      <text x="685" y="49" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff">Simpan &amp; Lanjut →</text>
    </g>
  </g>
</svg>`;
}

function generateAiTutorSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="1440" height="900">
  <rect width="1440" height="900" fill="#f5f0e6"/>
  <rect width="1440" height="60" fill="#fcfaf5"/>
  <line x1="0" y1="60" x2="1440" y2="60" stroke="#e3ded1" stroke-width="1"/>
  <text x="40" y="36" font-family="sans-serif" font-size="13" font-weight="600" fill="#294868">← Kembali ke Materi</text>
  <text x="200" y="36" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#1b1a17">AI Tutor Pembelajaran — Ruang Diskusi Terbimbing</text>

  <g transform="translate(40, 80)">
    <rect width="500" height="780" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
    <g transform="translate(30, 36)">
      <text x="0" y="20" font-family="sans-serif" font-size="11" font-weight="bold" letter-spacing="1.2" fill="#8c8577">KONTEKS MATERI AKTIF</text>
      <text x="0" y="52" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#1b1a17">Modul 04: Penanganan Event DOM</text>
    </g>

    <g transform="translate(520, 0)">
      <rect width="840" height="780" fill="#fcfaf5" stroke="#c8c2b5" rx="4"/>
      <g transform="translate(36, 110)">
        <rect width="650" height="72" fill="#f5f0e6" stroke="#e3ded1" rx="4"/>
        <text x="20" y="26" font-family="sans-serif" font-size="11" font-weight="bold" fill="#294868">TUTOR AI</text>
        <text x="20" y="48" font-family="sans-serif" font-size="13" fill="#1b1a17">Halo! Ada bagian dari manipulasi DOM atau Event Delegation yang ingin kita bedah bersama?</text>

        <g transform="translate(118, 92)">
          <rect width="650" height="75" fill="#294868" rx="4"/>
          <text x="20" y="26" font-family="sans-serif" font-size="11" font-weight="bold" fill="#dbeafe">ANDA (SISWA)</text>
          <text x="20" y="50" font-family="sans-serif" font-size="13" fill="#ffffff">Kenapa event delegation lebih hemat memori dibanding memasang listener di tiap tombol?</text>
        </g>
      </g>
    </g>
  </g>
</svg>`;
}

function generateSettingsSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" width="1440" height="900">
  <rect width="1440" height="900" fill="#eae4d8"/>
  <rect width="1440" height="900" fill="#000000" opacity="0.3"/>

  <g transform="translate(380, 110)">
    <rect width="680" height="680" fill="#fcfaf5" stroke="#c8c2b5" stroke-width="1" rx="4"/>
    <g transform="translate(40, 40)">
      <text x="0" y="24" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#1b1a17">Konfigurasi Provider Mandiri</text>
      <text x="0" y="52" font-family="sans-serif" font-size="13" fill="#5e5a52">Khusus pengguna yang ingin memakai endpoint dan kunci AI pribadi. Jika tidak diatur,</text>
      <text x="0" y="70" font-family="sans-serif" font-size="13" fill="#5e5a52">aplikasi otomatis memakai model bawaan.</text>
      <g transform="translate(0, 95)">
        <rect width="215" height="26" fill="#dcfce7" stroke="#bbf7d0" rx="13"/>
        <circle cx="16" cy="13" r="4" fill="#15803d"/>
        <text x="28" y="17" font-family="sans-serif" font-size="11" font-weight="bold" fill="#15803d">Model Bawaan Otomatis Aktif</text>
      </g>
    </g>

    <g transform="translate(40, 205)">
      <text x="0" y="14" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1b1a17">Endpoint Kustom (OpenAI Compatible / Self Host)</text>
      <rect x="0" y="24" width="600" height="42" fill="#ffffff" stroke="#c8c2b5" rx="3"/>
      <text x="16" y="50" font-family="monospace" font-size="13" fill="#8c8577">https://api.openai.com/v1</text>

      <g transform="translate(0, 85)">
        <text x="0" y="14" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1b1a17">Kunci API Mandiri (API Key)</text>
        <rect x="0" y="24" width="600" height="42" fill="#ffffff" stroke="#c8c2b5" rx="3"/>
        <text x="16" y="50" font-family="monospace" font-size="14" fill="#1b1a17">sk-proj-••••••••••••••••••••••••••••••••••••••••</text>
      </g>
    </g>

    <g transform="translate(40, 615)">
      <line x1="0" y1="0" x2="600" y2="0" stroke="#e3ded1" stroke-width="1"/>
      <rect x="440" y="16" width="160" height="38" fill="#294868" rx="3"/>
      <text x="470" y="40" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Simpan Konfigurasi</text>
    </g>
  </g>
</svg>`;
}

// -------------------------------------------------------------
// Main Sync Runner
// -------------------------------------------------------------
function runSync() {
  console.log('=== MEMULAI SINKRONISASI DESAIN FIGMA DARI PROYEK SKILLLEVEL ===\n');

  const files = [
    { name: '01-Login-View.svg', content: generateAuthLoginSvg(), flow: 'auth' },
    { name: '02-Register-View.svg', content: generateAuthRegisterSvg(), flow: 'auth' },
    { name: '03-Dashboard-View.svg', content: generateDashboardSvg(), flow: 'dashboard' },
    { name: '04-Curriculum-Catalog.svg', content: generateCurriculumSvg(), flow: 'dashboard' },
    { name: '05-Module-Detail.svg', content: generateModuleDetailSvg(), flow: 'learning' },
    { name: '06-Adaptive-Quiz.svg', content: generateQuizSvg(), flow: 'learning' },
    { name: '07-Contextual-AI-Tutor.svg', content: generateAiTutorSvg(), flow: 'learning' },
    { name: '08-Self-Provider-Settings.svg', content: generateSettingsSvg(), flow: 'settings' },
  ];

  for (const item of files) {
    const filePath = path.join(outputDir, item.name);
    fs.writeFileSync(filePath, item.content);
    console.log(`✓ Artboard dibuat: ${item.name} (${item.content.length} bytes) -> Alur: ${FIGMA_FILES[item.flow].name}`);
  }

  console.log('\n=== REKAP BERKAS FIGMA AKTIF ===');
  Object.values(FIGMA_FILES).forEach(f => {
    console.log(`- ${f.name}: ${f.url}`);
  });
  console.log(`- FigJam Architecture Board: https://www.figma.com/board/pYWqsjI9QUFtjXpW0FdAOc`);
  console.log('\nSemua artboard vektor desktop 1440x900 berhasil disinkronkan ke folder:', outputDir);
}

runSync();

// Kurikulum bawaan: 9 modul belajar beserta bank soal kuis.
// Semua materi di sini bisa dipakai tanpa API key, jadi aplikasi tetap berfungsi offline.

export const CURRICULUM_TRACK = {
  title: 'Rekayasa Web',
  description:
    'Sembilan modul berurutan dari cara browser bekerja sampai keamanan aplikasi. Setiap modul punya langkah, contoh, dan kuis 10 soal.',
};

export const CURRICULUM = [
  {
    id: 'mod-01',
    order: 1,
    title: 'Cara Browser Menampilkan Halaman',
    topic: 'Dasar Web',
    level: 'Pemula',
    minutes: 25,
    summary:
      'Browser meminta berkas ke server, menyusun struktur halaman, lalu menggambarnya ke layar. Modul ini menjelaskan urutan itu supaya kamu tahu di titik mana masalah tampilan biasanya muncul.',
    overview:
      'Satu halaman web adalah hasil kerja berantai: permintaan jaringan, parsing HTML, pemuatan CSS dan JavaScript, lalu proses render. Memahami urutan ini membuat debugging jadi jauh lebih cepat karena kamu tahu lapisan mana yang harus diperiksa lebih dulu.',
    steps: [
      {
        step: 'Langkah 1: Permintaan jaringan',
        detail:
          'Kamu mengetik alamat, browser mencari alamat IP lewat DNS, membuka koneksi, lalu mengirim permintaan HTTP. Server membalas dengan status dan isi halaman.',
        analogy: 'Seperti memesan makanan: kamu sebut nama menu, dapur menyiapkan, lalu pesanan diantar ke meja.',
      },
      {
        step: 'Langkah 2: Parsing HTML menjadi DOM',
        detail:
          'Browser membaca HTML dari atas ke bawah dan membentuk pohon DOM. Elemen yang salah ditutup bisa membuat struktur pohon berbeda dari yang kamu bayangkan.',
        analogy: 'Seperti menyusun balok: setiap balok harus diletakkan di atas balok induk yang benar.',
      },
      {
        step: 'Langkah 3: Penerapan CSS dan layout',
        detail:
          'CSS digabungkan menjadi satu model gaya, lalu browser menghitung ukuran dan posisi setiap kotak. Di tahap ini muncul masalah tumpang tindih dan lebar yang tidak sesuai.',
        analogy: 'Seperti menata perabot di ruangan: ukuran ruangan dan ukuran meja menentukan apakah semuanya muat.',
      },
      {
        step: 'Langkah 4: Eksekusi JavaScript dan paint',
        detail:
          'JavaScript berjalan setelah DOM tersedia, bisa mengubah struktur dan gaya, lalu browser menggambar ulang bagian yang berubah.',
        analogy: 'Seperti tukang listrik yang datang setelah rumah berdiri: dia bisa menambah lampu, tetapi dindingnya sudah ada.',
      },
    ],
    examples: [
      {
        title: 'Urutan yang terlihat di panel Network',
        description:
          'Buka DevTools, tab Network, muat ulang halaman. Kamu akan melihat dokumen HTML diminta lebih dulu, lalu CSS, lalu JavaScript. Berkas yang diminta setelah JavaScript biasanya dimuat oleh skrip itu sendiri.',
      },
      {
        title: 'Render blocking',
        description:
          'Tag script tanpa atribut defer menghentikan parsing HTML sampai berkas selesai diunduh dan dijalankan. Menambahkan defer membuat parsing berjalan lebih dulu.',
      },
    ],
    keyPoints: [
      'DNS menerjemahkan nama domain menjadi alamat IP sebelum permintaan dikirim.',
      'DOM adalah pohon elemen hasil parsing HTML, bukan berkas HTML itu sendiri.',
      'CSS membentuk render tree bersama DOM sebelum layout dihitung.',
      'Script tanpa defer memblokir parsing HTML.',
      'Perubahan DOM memicu perhitungan ulang layout dan paint.',
    ],
    flashcards: [
      { front: 'Apa fungsi DNS?', back: 'Menerjemahkan nama domain menjadi alamat IP.' },
      { front: 'Apa itu DOM?', back: 'Pohon objek elemen yang dibentuk browser dari HTML.' },
      { front: 'Mengapa defer berguna pada tag script?', back: 'Karena parsing HTML tidak terhenti saat berkas diunduh.' },
      { front: 'Apa yang terjadi saat DOM berubah?', back: 'Browser menghitung ulang layout dan menggambar bagian yang berubah.' },
    ],
    quiz: [
      {
        question: 'Apa tugas DNS pada saat halaman dibuka?',
        options: ['Menerjemahkan nama domain menjadi alamat IP', 'Menggambar halaman ke layar', 'Menyimpan cache CSS', 'Menjalankan JavaScript'],
        correctIndex: 0,
        explanation: 'DNS mengubah nama domain menjadi alamat IP agar browser tahu ke server mana permintaan dikirim.',
        source: 'Langkah 1: Permintaan jaringan',
      },
      {
        question: 'DOM terbentuk dari proses apa?',
        options: ['Parsing HTML oleh browser', 'Kompresi gambar oleh server', 'Eksekusi CSS', 'Permintaan DNS'],
        correctIndex: 0,
        explanation: 'Browser membaca HTML dan membentuk pohon DOM dari elemen yang ditemukan.',
        source: 'Langkah 2: Parsing HTML menjadi DOM',
      },
      {
        question: 'Apa dampak tag script tanpa atribut defer?',
        options: ['Parsing HTML terhenti sampai berkas selesai dijalankan', 'CSS tidak dimuat', 'DOM tidak terbentuk', 'Halaman dimuat dua kali'],
        correctIndex: 0,
        explanation: 'Script tanpa defer bersifat render blocking sehingga parsing HTML menunggu.',
        source: 'Contoh: Render blocking',
      },
      {
        question: 'Kapan layout dihitung oleh browser?',
        options: ['Setelah DOM dan CSS digabungkan', 'Sebelum HTML diunduh', 'Sebelum DNS selesai', 'Hanya saat halaman ditutup'],
        correctIndex: 0,
        explanation: 'Layout butuh struktur DOM dan aturan CSS, jadi dihitung setelah keduanya tersedia.',
        source: 'Langkah 3: Penerapan CSS dan layout',
      },
      {
        question: 'Apa yang biasanya terlihat lebih dulu di panel Network?',
        options: ['Dokumen HTML', 'Berkas gambar terbesar', 'Berkas font', 'Skrip analitik'],
        correctIndex: 0,
        explanation: 'Dokumen HTML diminta lebih dulu karena isinya menentukan berkas lain yang perlu dimuat.',
        source: 'Contoh: Urutan yang terlihat di panel Network',
      },
      {
        question: 'Apa arti render tree?',
        options: ['Gabungan DOM dan informasi gaya yang siap ditata', 'Daftar berkas JavaScript', 'Catatan permintaan jaringan', 'Berkas HTML asli di server'],
        correctIndex: 0,
        explanation: 'Render tree dibentuk dari DOM bersama aturan CSS sebelum layout dihitung.',
        source: 'Langkah 3: Penerapan CSS dan layout',
      },
      {
        question: 'Mengapa debugging tampilan sebaiknya mengikuti urutan lapisan?',
        options: ['Karena setiap lapisan bergantung pada lapisan sebelumnya', 'Karena CSS selalu salah', 'Karena JavaScript tidak pernah error', 'Karena server selalu lambat'],
        correctIndex: 0,
        explanation: 'Masalah di lapisan awal membuat lapisan berikutnya ikut terlihat salah, jadi diperiksa berurutan.',
        source: 'Gambaran umum',
      },
      {
        question: 'Apa yang dilakukan browser saat JavaScript mengubah DOM?',
        options: ['Menghitung ulang layout dan menggambar bagian yang berubah', 'Mengunduh ulang seluruh halaman', 'Mematikan CSS', 'Menghapus cache DNS'],
        correctIndex: 0,
        explanation: 'Perubahan DOM memicu perhitungan layout dan paint ulang pada bagian yang terpengaruh.',
        source: 'Langkah 4: Eksekusi JavaScript dan paint',
      },
      {
        question: 'Elemen yang salah ditutup memengaruhi apa?',
        options: ['Struktur pohon DOM', 'Alamat IP server', 'Isi berkas CSS', 'Hasil query DNS'],
        correctIndex: 0,
        explanation: 'Browser menutup elemen secara otomatis, sehingga pohon DOM bisa berbeda dari yang dimaksud.',
        source: 'Langkah 2: Parsing HTML menjadi DOM',
      },
      {
        question: 'Apa manfaat memahami urutan render?',
        options: ['Debugging lebih cepat karena tahu lapisan yang harus diperiksa', 'Halaman otomatis lebih cepat', 'CSS tidak perlu ditulis', 'Server tidak perlu dikonfigurasi'],
        correctIndex: 0,
        explanation: 'Dengan tahu urutannya, kamu bisa mempersempit penyebab masalah ke lapisan yang tepat.',
        source: 'Gambaran umum',
      },
    ],
  },
  {
    id: 'mod-02',
    order: 2,
    title: 'HTML Bermakna dan Aksesibel',
    topic: 'HTML',
    level: 'Pemula',
    minutes: 30,
    summary:
      'HTML yang baik memilih elemen sesuai maknanya, bukan sesuai tampilannya. Modul ini membahas struktur dokumen, elemen semantik, dan dasar aksesibilitas.',
    overview:
      'Elemen semantik memberi tahu browser dan teknologi bantu apa peran sebuah bagian halaman. Dampaknya terasa pada pembaca layar, navigasi keyboard, dan kualitas SEO.',
    steps: [
      {
        step: 'Langkah 1: Kerangka dokumen',
        detail:
          'Dokumen dimulai dengan deklarasi tipe, elemen html dengan atribut lang, head berisi metadata, dan body berisi konten.',
        analogy: 'Seperti sampul dan daftar isi buku: pembaca tahu ini buku berbahasa apa dan isinya tentang apa.',
      },
      {
        step: 'Langkah 2: Memilih elemen sesuai peran',
        detail:
          'Gunakan header, nav, main, section, article, dan footer sesuai perannya. Tombol memakai button, tautan memakai a, bukan div yang diberi handler klik.',
        analogy: 'Seperti memberi label pada kotak penyimpanan: label yang benar membuat siapa pun langsung tahu isinya.',
      },
      {
        step: 'Langkah 3: Teks alternatif dan label',
        detail:
          'Gambar dekoratif memakai alt kosong, gambar informatif memakai alt yang menjelaskan isinya. Setiap input punya label yang terhubung.',
        analogy: 'Seperti papan nama di depan pintu: tanpa nama, orang harus menebak ruangan mana yang benar.',
      },
      {
        step: 'Langkah 4: Urutan judul yang runtut',
        detail:
          'Satu h1 untuk topik utama, lalu h2 untuk bagian, h3 untuk subbagian. Jangan melompati tingkat judul hanya untuk mengecilkan ukuran huruf.',
        analogy: 'Seperti penomoran bab dan subbab: lompatan nomor membuat pembaca kehilangan arah.',
      },
    ],
    examples: [
      {
        title: 'Tombol yang benar',
        description:
          'Elemen button sudah bisa difokus dengan Tab dan diaktifkan dengan Enter atau Space. Div dengan onClick tidak mendapat perilaku itu secara gratis.',
      },
      {
        title: 'Label yang terhubung',
        description:
          'Atribut for pada label harus sama dengan id pada input. Klik pada teks label akan memindahkan fokus ke input tersebut.',
      },
    ],
    keyPoints: [
      'Atribut lang pada elemen html membantu pembaca layar memilih pelafalan.',
      'Elemen semantik memberi peran yang bisa dibaca teknologi bantu.',
      'Tombol memakai button, navigasi memakai a.',
      'Gambar dekoratif memakai alt kosong agar tidak dibacakan.',
      'Urutan judul tidak boleh melompati tingkat.',
    ],
    flashcards: [
      { front: 'Mengapa memakai button, bukan div dengan onClick?', back: 'Karena button sudah mendukung fokus keyboard dan aktivasi dengan Enter atau Space.' },
      { front: 'Apa fungsi atribut lang?', back: 'Memberi tahu bahasa dokumen agar pelafalan pembaca layar tepat.' },
      { front: 'Kapan alt boleh kosong?', back: 'Saat gambar hanya dekoratif dan tidak menambah informasi.' },
      { front: 'Apa syarat label dan input bisa terhubung?', back: 'Nilai atribut for pada label sama dengan id pada input.' },
    ],
    quiz: [
      {
        question: 'Elemen apa yang tepat untuk aksi yang mengubah state di halaman?',
        options: ['button', 'a tanpa href', 'div dengan onClick', 'span dengan role teks'],
        correctIndex: 0,
        explanation: 'button sudah mendukung fokus keyboard dan aktivasi dengan Enter atau Space.',
        source: 'Contoh: Tombol yang benar',
      },
      {
        question: 'Apa fungsi atribut lang pada elemen html?',
        options: ['Menentukan bahasa dokumen untuk pelafalan dan terjemahan', 'Mengatur ukuran huruf', 'Memuat berkas CSS', 'Menentukan warna latar'],
        correctIndex: 0,
        explanation: 'lang memberi tahu browser dan teknologi bantu bahasa yang dipakai dokumen.',
        source: 'Langkah 1: Kerangka dokumen',
      },
      {
        question: 'Kapan atribut alt sebaiknya kosong?',
        options: ['Saat gambar murni dekoratif', 'Saat gambar berisi diagram penting', 'Saat gambar berupa foto produk', 'Saat gambar memuat teks'],
        correctIndex: 0,
        explanation: 'Gambar dekoratif tidak perlu dibacakan, jadi alt dikosongkan.',
        source: 'Langkah 3: Teks alternatif dan label',
      },
      {
        question: 'Bagaimana label terhubung ke input?',
        options: ['Atribut for pada label sama dengan id pada input', 'Label diletakkan setelah input', 'Input diberi atribut name saja', 'Label memakai class yang sama'],
        correctIndex: 0,
        explanation: 'Hubungan for dan id membuat klik label memindahkan fokus ke input.',
        source: 'Contoh: Label yang terhubung',
      },
      {
        question: 'Berapa banyak h1 yang disarankan dalam satu halaman?',
        options: ['Satu untuk topik utama', 'Sebanyak jumlah bagian', 'Tidak boleh ada', 'Minimal tiga'],
        correctIndex: 0,
        explanation: 'Satu h1 menjaga struktur judul tetap jelas dan tidak menduplikasi topik utama.',
        source: 'Langkah 4: Urutan judul yang runtut',
      },
      {
        question: 'Mengapa melompati tingkat judul bermasalah?',
        options: ['Membuat struktur dokumen sulit diikuti', 'Membuat CSS gagal dimuat', 'Menghapus atribut lang', 'Mematikan JavaScript'],
        correctIndex: 0,
        explanation: 'Lompatan tingkat judul mengaburkan hierarki isi bagi pembaca layar dan pembaca biasa.',
        source: 'Langkah 4: Urutan judul yang runtut',
      },
      {
        question: 'Elemen apa yang tepat membungkus navigasi utama?',
        options: ['nav', 'div', 'section', 'aside'],
        correctIndex: 0,
        explanation: 'nav menandai kumpulan tautan navigasi sehingga bisa dikenali teknologi bantu.',
        source: 'Langkah 2: Memilih elemen sesuai peran',
      },
      {
        question: 'Apa keuntungan elemen semantik?',
        options: ['Peran bagian halaman bisa dikenali browser dan teknologi bantu', 'Halaman otomatis lebih cepat', 'CSS tidak diperlukan', 'Gambar tidak perlu alt'],
        correctIndex: 0,
        explanation: 'Elemen semantik menyampaikan peran, bukan hanya tampilan.',
        source: 'Gambaran umum',
      },
      {
        question: 'Elemen apa yang tepat untuk konten utama halaman?',
        options: ['main', 'footer', 'nav', 'head'],
        correctIndex: 0,
        explanation: 'main menandai konten utama dan sebaiknya hanya muncul sekali per halaman.',
        source: 'Langkah 2: Memilih elemen sesuai peran',
      },
      {
        question: 'Apa isi alt yang baik untuk gambar informatif?',
        options: ['Penjelasan singkat isi gambar', 'Nama berkas gambar', 'Kata gambar', 'Teks kosong'],
        correctIndex: 0,
        explanation: 'Alt harus menyampaikan informasi yang dibawa gambar, bukan nama berkasnya.',
        source: 'Langkah 3: Teks alternatif dan label',
      },
    ],
  },
  {
    id: 'mod-03',
    order: 3,
    title: 'CSS: Tata Letak dan Sistem Desain',
    topic: 'CSS',
    level: 'Pemula',
    minutes: 35,
    summary:
      'CSS yang rapi dimulai dari token, bukan dari nilai acak. Modul ini membahas box model, flexbox, grid, dan cara menyusun token warna serta jarak.',
    overview:
      'Tata letak yang stabil lahir dari aturan yang konsisten. Dengan token dan beberapa pola layout, kamu tidak perlu menulis ulang nilai yang berbeda di setiap komponen.',
    steps: [
      {
        step: 'Langkah 1: Box model',
        detail:
          'Setiap elemen adalah kotak berisi content, padding, border, dan margin. Properti box-sizing border-box membuat lebar yang kamu tulis sudah termasuk padding dan border.',
        analogy: 'Seperti kotak kiriman: ukuran luar kotak berbeda dengan ruang untuk barang di dalamnya.',
      },
      {
        step: 'Langkah 2: Flexbox untuk satu sumbu',
        detail:
          'Flexbox mengatur anak elemen pada satu arah utama. Gunakan untuk baris tombol, navigasi, atau susunan kartu sederhana.',
        analogy: 'Seperti rak satu baris: semua barang berjajar dan bisa dirapatkan atau direnggangkan.',
      },
      {
        step: 'Langkah 3: Grid untuk dua sumbu',
        detail:
          'Grid mengatur baris dan kolom sekaligus. Gunakan untuk tata letak halaman atau galeri yang butuh kolom sejajar.',
        analogy: 'Seperti lemari dengan sekat: setiap barang punya sel sendiri yang sudah ditentukan.',
      },
      {
        step: 'Langkah 4: Token warna, jarak, dan tipografi',
        detail:
          'Simpan nilai berulang sebagai variabel CSS. Komponen memakai token, bukan angka baru, sehingga perubahan desain cukup dilakukan di satu tempat.',
        analogy: 'Seperti kode warna cat di toko: semua tukang memakai kode yang sama, jadi hasilnya seragam.',
      },
    ],
    examples: [
      {
        title: 'Token di root',
        description:
          'Deklarasikan variabel seperti --ink, --paper, dan --space-3 pada pemilih root, lalu pakai var(--ink) di komponen. Mengubah satu nilai di root mengubah seluruh halaman.',
      },
      {
        title: 'Grid responsif tanpa media query tambahan',
        description:
          'repeat(auto-fit, minmax(240px, 1fr)) membuat kolom menyesuaikan lebar wadah. Saat ruang menyempit, jumlah kolom berkurang sendiri.',
      },
    ],
    keyPoints: [
      'box-sizing border-box membuat lebar mencakup padding dan border.',
      'Flexbox mengatur satu sumbu, grid mengatur dua sumbu.',
      'Token desain mencegah nilai acak yang berbeda-beda.',
      'auto-fit dengan minmax membuat grid menyesuaikan lebar wadah.',
      'Margin collapse terjadi pada margin vertikal antar blok.',
    ],
    flashcards: [
      { front: 'Apa efek box-sizing border-box?', back: 'Lebar dan tinggi yang ditulis sudah termasuk padding dan border.' },
      { front: 'Kapan memakai grid dibanding flexbox?', back: 'Saat butuh mengatur baris dan kolom sekaligus.' },
      { front: 'Mengapa memakai token desain?', back: 'Agar nilai berulang konsisten dan mudah diubah dari satu tempat.' },
      { front: 'Apa fungsi minmax pada grid?', back: 'Menentukan batas ukuran minimum dan maksimum sebuah kolom.' },
    ],
    quiz: [
      {
        question: 'Apa efek box-sizing border-box?',
        options: ['Lebar mencakup padding dan border', 'Margin diabaikan', 'Border selalu nol', 'Padding dihitung di luar elemen'],
        correctIndex: 0,
        explanation: 'Dengan border-box, lebar yang ditulis sudah termasuk padding dan border.',
        source: 'Langkah 1: Box model',
      },
      {
        question: 'Kapan grid lebih tepat daripada flexbox?',
        options: ['Saat perlu mengatur baris dan kolom sekaligus', 'Saat hanya mengatur satu baris tombol', 'Saat mengubah warna', 'Saat memuat font'],
        correctIndex: 0,
        explanation: 'Grid mengatur dua sumbu, sedangkan flexbox fokus pada satu sumbu utama.',
        source: 'Langkah 3: Grid untuk dua sumbu',
      },
      {
        question: 'Apa manfaat token desain?',
        options: ['Nilai berulang konsisten dan mudah diubah', 'CSS tidak perlu ditulis', 'Halaman otomatis aksesibel', 'Gambar tidak perlu alt'],
        correctIndex: 0,
        explanation: 'Token menyatukan nilai berulang sehingga perubahan cukup di satu tempat.',
        source: 'Langkah 4: Token warna, jarak, dan tipografi',
      },
      {
        question: 'Apa fungsi repeat(auto-fit, minmax(240px, 1fr))?',
        options: ['Membuat kolom menyesuaikan lebar wadah', 'Mengunci lebar kolom 240px', 'Menghapus jarak antar kolom', 'Membuat kolom selalu satu'],
        correctIndex: 0,
        explanation: 'auto-fit dengan minmax membuat jumlah kolom menyesuaikan ruang yang tersedia.',
        source: 'Contoh: Grid responsif tanpa media query tambahan',
      },
      {
        question: 'Apa yang dimaksud margin collapse?',
        options: ['Margin vertikal antar blok saling melebur', 'Margin berubah menjadi padding', 'Border menghilang', 'Elemen menjadi inline'],
        correctIndex: 0,
        explanation: 'Pada blok vertikal, margin yang berdekatan bisa melebur menjadi satu nilai.',
        source: 'Poin penting',
      },
      {
        question: 'Properti apa yang mengatur arah utama flexbox?',
        options: ['flex-direction', 'align-content', 'grid-template', 'box-shadow'],
        correctIndex: 0,
        explanation: 'flex-direction menentukan sumbu utama tempat anak elemen disusun.',
        source: 'Langkah 2: Flexbox untuk satu sumbu',
      },
      {
        question: 'Mengapa nilai acak di setiap komponen merugikan?',
        options: ['Desain jadi tidak konsisten dan sulit dirawat', 'CSS gagal dikompilasi', 'Browser menolak variabel', 'Halaman tidak bisa di-scroll'],
        correctIndex: 0,
        explanation: 'Nilai berbeda untuk peran yang sama membuat tampilan tidak konsisten dan perubahan mahal.',
        source: 'Langkah 4: Token warna, jarak, dan tipografi',
      },
      {
        question: 'Bagian mana yang termasuk box model?',
        options: ['Content, padding, border, margin', 'Warna, font, bayangan', 'Grid, flex, block', 'Hover, focus, active'],
        correctIndex: 0,
        explanation: 'Box model terdiri dari content, padding, border, dan margin.',
        source: 'Langkah 1: Box model',
      },
      {
        question: 'Apa kegunaan utama flexbox pada modul ini?',
        options: ['Menyusun anak elemen pada satu arah', 'Membuat animasi', 'Mengatur z-index', 'Memuat font eksternal'],
        correctIndex: 0,
        explanation: 'Flexbox menyusun anak elemen pada satu sumbu utama.',
        source: 'Langkah 2: Flexbox untuk satu sumbu',
      },
      {
        question: 'Di mana token sebaiknya dideklarasikan agar berlaku global?',
        options: ['Pemilih root', 'Setiap komponen', 'Berkas HTML', 'Atribut style inline'],
        correctIndex: 0,
        explanation: 'Variabel pada pemilih root tersedia untuk seluruh dokumen.',
        source: 'Contoh: Token di root',
      },
    ],
  },
  {
    id: 'mod-04',
    order: 4,
    title: 'JavaScript: Nilai, Fungsi, dan Array',
    topic: 'JavaScript',
    level: 'Menengah',
    minutes: 40,
    summary:
      'Modul ini membahas tipe nilai, cara kerja fungsi, dan operasi array yang paling sering dipakai untuk mengolah data di aplikasi.',
    overview:
      'Sebagian besar bug JavaScript lahir dari asumsi yang salah tentang nilai: null yang dikira string, referensi yang dikira salinan, atau fungsi yang dipanggil sebelum datanya siap.',
    steps: [
      {
        step: 'Langkah 1: Tipe primitif dan referensi',
        detail:
          'String, number, boolean, null, undefined, dan symbol adalah primitif yang disalin berdasarkan nilai. Objek dan array disalin berdasarkan referensi.',
        analogy: 'Primitif seperti fotokopi dokumen, referensi seperti alamat rumah yang sama untuk dua orang.',
      },
      {
        step: 'Langkah 2: Fungsi dan cakupan',
        detail:
          'Fungsi menyimpan logika yang bisa dipakai ulang. Variabel yang dideklarasikan dengan const atau let hanya berlaku di blok tempat ia dibuat.',
        analogy: 'Seperti alat di kotak kerja: hanya bisa dipakai di ruangan tempat kotaknya berada.',
      },
      {
        step: 'Langkah 3: Operasi array',
        detail:
          'map mengubah setiap item, filter menyaring, reduce merangkum, dan find mengambil satu item pertama yang cocok. Semuanya mengembalikan nilai baru tanpa mengubah array asal.',
        analogy: 'Seperti jalur produksi: setiap stasiun mengubah barang tanpa merusak barang aslinya.',
      },
      {
        step: 'Langkah 4: Nilai kosong dan pengecekan aman',
        detail:
          'Gunakan pengecekan eksplisit sebelum mengakses properti. Operator ?? hanya mengganti null dan undefined, sedangkan || juga mengganti nilai falsy lain seperti 0 dan string kosong.',
        analogy: 'Seperti memeriksa apakah kunci ada sebelum membuka pintu, bukan menebak.',
      },
    ],
    examples: [
      {
        title: 'map dan filter',
        description:
          'const aktif = daftar.filter((m) => m.aktif); const judul = aktif.map((m) => m.judul); Kedua baris menghasilkan array baru dan tidak mengubah daftar asal.',
      },
      {
        title: 'Perbedaan ?? dan ||',
        description:
          'Nilai 0 dengan || 10 menghasilkan 10, sedangkan 0 dengan ?? 10 menghasilkan 0. Pilih ?? saat 0 adalah nilai yang sah.',
      },
    ],
    keyPoints: [
      'Objek dan array disalin berdasarkan referensi.',
      'map, filter, dan reduce mengembalikan nilai baru.',
      'const mencegah penugasan ulang, bukan perubahan isi objek.',
      'Operator ?? hanya mengganti null dan undefined.',
      'Pengecekan eksplisit mencegah error saat data belum siap.',
    ],
    flashcards: [
      { front: 'Apa bedanya ?? dan ||?', back: '?? hanya mengganti null dan undefined, || juga mengganti nilai falsy lain.' },
      { front: 'Apa yang dikembalikan filter?', back: 'Array baru berisi item yang lolos pengujian.' },
      { front: 'Apakah const membuat objek tidak bisa diubah?', back: 'Tidak, const hanya mencegah penugasan ulang variabelnya.' },
      { front: 'Apa fungsi reduce?', back: 'Merangkum seluruh item array menjadi satu nilai.' },
    ],
    quiz: [
      {
        question: 'Bagaimana objek disalin saat dimasukkan ke variabel baru?',
        options: ['Berdasarkan referensi', 'Berdasarkan nilai', 'Selalu sebagai salinan dalam', 'Tidak bisa disalin'],
        correctIndex: 0,
        explanation: 'Objek dan array disalin berdasarkan referensi, sehingga dua variabel bisa menunjuk objek yang sama.',
        source: 'Langkah 1: Tipe primitif dan referensi',
      },
      {
        question: 'Apa hasil 0 dengan operator ?? 10?',
        options: ['0', '10', 'null', 'undefined'],
        correctIndex: 0,
        explanation: 'Operator ?? hanya mengganti null dan undefined, jadi 0 tetap dipakai.',
        source: 'Contoh: Perbedaan ?? dan ||',
      },
      {
        question: 'Apa yang dikembalikan map?',
        options: ['Array baru dengan setiap item sudah diubah', 'Array asal yang berubah', 'Satu nilai ringkasan', 'Nilai boolean'],
        correctIndex: 0,
        explanation: 'map membuat array baru berisi hasil transformasi setiap item.',
        source: 'Langkah 3: Operasi array',
      },
      {
        question: 'Apa fungsi filter?',
        options: ['Menyaring item yang lolos pengujian', 'Mengurutkan item', 'Menjumlahkan item', 'Menggabungkan dua array'],
        correctIndex: 0,
        explanation: 'filter mengembalikan array baru berisi item yang lolos pengujian.',
        source: 'Langkah 3: Operasi array',
      },
      {
        question: 'Apa yang dicegah oleh const?',
        options: ['Penugasan ulang variabel', 'Perubahan isi objek', 'Pemanggilan fungsi', 'Pembuatan array baru'],
        correctIndex: 0,
        explanation: 'const mencegah penugasan ulang, tetapi isi objek tetap bisa diubah.',
        source: 'Poin penting',
      },
      {
        question: 'Apa fungsi reduce?',
        options: ['Merangkum array menjadi satu nilai', 'Menyaring array', 'Mengubah tipe data', 'Menghapus duplikat otomatis'],
        correctIndex: 0,
        explanation: 'reduce mengakumulasi seluruh item menjadi satu nilai akhir.',
        source: 'Langkah 3: Operasi array',
      },
      {
        question: 'Mengapa pengecekan eksplisit penting sebelum mengakses properti?',
        options: ['Mencegah error saat data belum tersedia', 'Mempercepat eksekusi', 'Menghapus kebutuhan fungsi', 'Mengubah tipe data'],
        correctIndex: 0,
        explanation: 'Mengakses properti pada nilai null atau undefined menimbulkan error.',
        source: 'Langkah 4: Nilai kosong dan pengecekan aman',
      },
      {
        question: 'Cakupan variabel let dan const berlaku di mana?',
        options: ['Blok tempat variabel dibuat', 'Seluruh berkas selalu', 'Hanya di dalam fungsi global', 'Hanya di dalam loop'],
        correctIndex: 0,
        explanation: 'let dan const memiliki cakupan blok.',
        source: 'Langkah 2: Fungsi dan cakupan',
      },
      {
        question: 'Apa hasil 0 dengan operator || 10?',
        options: ['10', '0', 'null', 'undefined'],
        correctIndex: 0,
        explanation: 'Operator || mengganti semua nilai falsy, termasuk 0.',
        source: 'Contoh: Perbedaan ?? dan ||',
      },
      {
        question: 'Apa yang dikembalikan find?',
        options: ['Item pertama yang cocok', 'Array semua item yang cocok', 'Jumlah item', 'Nilai boolean'],
        correctIndex: 0,
        explanation: 'find mengembalikan satu item pertama yang memenuhi pengujian.',
        source: 'Langkah 3: Operasi array',
      },
    ],
  },
  {
    id: 'mod-05',
    order: 5,
    title: 'DOM, Event, dan State Antarmuka',
    topic: 'Interaksi',
    level: 'Menengah',
    minutes: 35,
    summary:
      'Antarmuka yang bisa dipercaya menyimpan satu sumber kebenaran untuk state, lalu menggambar ulang tampilan dari state itu. Modul ini membahas event, state, dan siklus render.',
    overview:
      'Mengubah DOM langsung dari banyak tempat membuat tampilan dan data mudah tidak sinkron. Pola yang lebih aman: ubah state, lalu biarkan tampilan mengikuti state.',
    steps: [
      {
        step: 'Langkah 1: Event dan bubbling',
        detail:
          'Event menjalar dari elemen target ke induknya. Satu listener di induk bisa menangani banyak anak, dan event.target memberi tahu elemen mana yang memicu.',
        analogy: 'Seperti kabar di satu lantai kantor: pesan naik dari meja ke kepala ruangan.',
      },
      {
        step: 'Langkah 2: State sebagai sumber kebenaran',
        detail:
          'Simpan data yang memengaruhi tampilan di satu tempat. Tampilan dihitung dari state, bukan disimpan sebagai salinan terpisah.',
        analogy: 'Seperti papan skor: semua orang membaca papan yang sama, bukan catatan masing-masing.',
      },
      {
        step: 'Langkah 3: Siklus render',
        detail:
          'Saat state berubah, tampilan dihitung ulang. Efek samping seperti permintaan jaringan dijalankan setelah render, bukan di tengah perhitungan tampilan.',
        analogy: 'Seperti mencetak ulang halaman setelah naskahnya direvisi, bukan menambal halaman lama.',
      },
      {
        step: 'Langkah 4: Membersihkan efek',
        detail:
          'Listener, timer, dan permintaan yang sedang berjalan harus dihentikan saat komponen tidak lagi dipakai, agar tidak ada pembaruan ke tampilan yang sudah hilang.',
        analogy: 'Seperti mematikan kompor sebelum meninggalkan dapur.',
      },
    ],
    examples: [
      {
        title: 'Satu listener untuk banyak tombol',
        description:
          'Pasang listener pada wadah, lalu baca event.target.dataset.aksi. Satu handler bisa melayani banyak tombol tanpa memasang listener di setiap tombol.',
      },
      {
        title: 'Membatalkan permintaan',
        description:
          'Simpan AbortController di dalam efek, lalu panggil abort pada fungsi pembersihan. Hasil permintaan yang sudah dibatalkan tidak akan menimpa state.',
      },
    ],
    keyPoints: [
      'Event menjalar dari target ke induk (bubbling).',
      'State adalah sumber kebenaran untuk tampilan.',
      'Efek samping dijalankan setelah render.',
      'Fungsi pembersihan mencegah pembaruan ke komponen yang sudah hilang.',
      'AbortController membatalkan permintaan yang tidak lagi dibutuhkan.',
    ],
    flashcards: [
      { front: 'Apa itu event bubbling?', back: 'Perambatan event dari elemen target ke elemen induknya.' },
      { front: 'Mengapa state harus satu sumber kebenaran?', back: 'Agar tampilan dan data tidak pernah berbeda.' },
      { front: 'Apa fungsi AbortController?', back: 'Membatalkan permintaan yang sudah tidak dibutuhkan.' },
      { front: 'Kapan efek samping dijalankan?', back: 'Setelah render selesai.' },
    ],
    quiz: [
      {
        question: 'Apa itu event bubbling?',
        options: ['Event menjalar dari target ke induk', 'Event hanya berjalan di target', 'Event dijalankan dua kali', 'Event berhenti di induk'],
        correctIndex: 0,
        explanation: 'Event naik dari elemen target menuju induknya, sehingga listener di induk ikut menerima.',
        source: 'Langkah 1: Event dan bubbling',
      },
      {
        question: 'Mengapa state sebaiknya menjadi satu sumber kebenaran?',
        options: ['Agar tampilan dan data tidak berbeda', 'Agar kode lebih panjang', 'Agar CSS tidak perlu', 'Agar event tidak menjalar'],
        correctIndex: 0,
        explanation: 'Satu sumber kebenaran mencegah tampilan menyimpan salinan yang bisa tidak sinkron.',
        source: 'Langkah 2: State sebagai sumber kebenaran',
      },
      {
        question: 'Kapan efek samping dijalankan?',
        options: ['Setelah render', 'Sebelum render', 'Saat parsing HTML', 'Saat DNS lookup'],
        correctIndex: 0,
        explanation: 'Efek samping dijalankan setelah tampilan dihitung agar tidak mengganggu proses render.',
        source: 'Langkah 3: Siklus render',
      },
      {
        question: 'Apa fungsi pembersihan pada efek?',
        options: ['Menghentikan listener dan timer yang tidak dipakai', 'Mempercepat render', 'Menghapus state', 'Mengubah CSS'],
        correctIndex: 0,
        explanation: 'Pembersihan mencegah pembaruan ke komponen yang sudah tidak ada.',
        source: 'Langkah 4: Membersihkan efek',
      },
      {
        question: 'Apa kegunaan AbortController?',
        options: ['Membatalkan permintaan yang tidak lagi dibutuhkan', 'Mengubah metode HTTP', 'Menyimpan cache', 'Mengenkripsi data'],
        correctIndex: 0,
        explanation: 'AbortController memberi sinyal pembatalan pada permintaan yang sedang berjalan.',
        source: 'Contoh: Membatalkan permintaan',
      },
      {
        question: 'Bagaimana satu listener bisa melayani banyak tombol?',
        options: ['Pasang di wadah dan baca event.target', 'Pasang di setiap tombol', 'Gunakan setTimeout', 'Gunakan CSS hover'],
        correctIndex: 0,
        explanation: 'Listener di wadah menerima event dari anak melalui bubbling, lalu event.target menunjukkan sumbernya.',
        source: 'Contoh: Satu listener untuk banyak tombol',
      },
      {
        question: 'Apa risiko mengubah DOM langsung dari banyak tempat?',
        options: ['Tampilan dan data mudah tidak sinkron', 'CSS tidak dimuat', 'Event berhenti bekerja', 'Browser menolak render'],
        correctIndex: 0,
        explanation: 'Banyak sumber perubahan membuat tampilan sulit diprediksi dan tidak konsisten dengan data.',
        source: 'Gambaran umum',
      },
      {
        question: 'Apa yang terjadi saat state berubah?',
        options: ['Tampilan dihitung ulang dari state baru', 'Halaman dimuat ulang dari server', 'Semua listener dihapus', 'CSS ditulis ulang'],
        correctIndex: 0,
        explanation: 'Perubahan state memicu perhitungan tampilan baru.',
        source: 'Langkah 3: Siklus render',
      },
      {
        question: 'Mengapa hasil permintaan yang dibatalkan tidak boleh menimpa state?',
        options: ['Karena datanya mungkin sudah tidak relevan', 'Karena permintaan gagal', 'Karena server menolak', 'Karena state bersifat tetap'],
        correctIndex: 0,
        explanation: 'Data lama bisa menimpa data terbaru jika permintaan yang sudah usang tetap diterapkan.',
        source: 'Contoh: Membatalkan permintaan',
      },
      {
        question: 'Apa peran event.target?',
        options: ['Menunjukkan elemen yang memicu event', 'Menentukan warna elemen', 'Menyimpan state', 'Membatalkan event'],
        correctIndex: 0,
        explanation: 'event.target menunjuk elemen asal yang memicu event.',
        source: 'Langkah 1: Event dan bubbling',
      },
    ],
  },
  {
    id: 'mod-06',
    order: 6,
    title: 'HTTP, REST, dan Bentuk Respons',
    topic: 'API',
    level: 'Menengah',
    minutes: 35,
    summary:
      'API bekerja lewat kesepakatan: metode, alamat, status, dan bentuk data. Modul ini membahas cara membaca kontrak itu dan cara menangani kegagalannya.',
    overview:
      'Sebagian besar integrasi gagal bukan karena kode salah, tetapi karena asumsi tentang bentuk respons tidak sesuai kenyataan. Membaca status dan memvalidasi bentuk data adalah kebiasaan wajib.',
    steps: [
      {
        step: 'Langkah 1: Metode dan alamat',
        detail:
          'GET mengambil data, POST membuat, PUT atau PATCH mengubah, DELETE menghapus. Alamat sebaiknya menunjukkan sumber daya, bukan aksi.',
        analogy: 'Seperti formulir layanan: jenis formulir menentukan apa yang boleh kamu minta.',
      },
      {
        step: 'Langkah 2: Kode status',
        detail:
          '2xx berhasil, 3xx pengalihan, 4xx kesalahan dari sisi peminta, 5xx kesalahan dari sisi server. Kode status menentukan apakah percobaan ulang masuk akal.',
        analogy: 'Seperti lampu lalu lintas: hijau lanjut, kuning hati-hati, merah berhenti.',
      },
      {
        step: 'Langkah 3: Bentuk data dan validasi',
        detail:
          'Respons JSON harus diperiksa bentuknya sebelum dipakai. Field yang hilang atau bertipe lain adalah sumber error yang paling sering terjadi.',
        analogy: 'Seperti memeriksa isi paket sebelum dipakai: label benar belum tentu isinya sesuai.',
      },
      {
        step: 'Langkah 4: Batas waktu dan percobaan ulang',
        detail:
          'Setiap permintaan butuh batas waktu. Percobaan ulang hanya untuk kegagalan sementara, dengan jeda yang meningkat, dan tidak untuk kesalahan 4xx.',
        analogy: 'Seperti menelepon ulang saat sibuk: beri jeda, jangan terus-menerus.',
      },
    ],
    examples: [
      {
        title: 'Membaca status sebelum membaca isi',
        description:
          'Periksa response.ok lebih dulu. Jika tidak ok, baca pesan galat dari body dan tampilkan pesan yang ramah, bukan menampilkan objek mentah.',
      },
      {
        title: 'Percobaan ulang dengan jeda',
        description:
          'Untuk status 429 atau 5xx, tunggu 1 detik, lalu 2 detik, lalu 4 detik. Untuk 400 atau 401, hentikan karena mengulang tidak akan mengubah hasil.',
      },
    ],
    keyPoints: [
      'Metode HTTP menunjukkan jenis operasi pada sumber daya.',
      '4xx berarti kesalahan dari sisi peminta, 5xx dari sisi server.',
      'Bentuk respons harus divalidasi sebelum dipakai.',
      'Setiap permintaan jaringan butuh batas waktu.',
      'Percobaan ulang hanya untuk kegagalan sementara.',
    ],
    flashcards: [
      { front: 'Apa arti status 404?', back: 'Sumber daya yang diminta tidak ditemukan.' },
      { front: 'Kapan percobaan ulang masuk akal?', back: 'Saat kegagalan bersifat sementara, seperti 429 atau 5xx.' },
      { front: 'Apa bedanya PUT dan PATCH?', back: 'PUT mengganti seluruh sumber daya, PATCH mengubah sebagian.' },
      { front: 'Mengapa bentuk respons perlu divalidasi?', back: 'Karena field bisa hilang atau bertipe berbeda dari dugaan.' },
    ],
    quiz: [
      {
        question: 'Apa arti kode status 4xx?',
        options: ['Kesalahan dari sisi peminta', 'Kesalahan dari sisi server', 'Berhasil', 'Pengalihan'],
        correctIndex: 0,
        explanation: '4xx menandakan permintaan tidak dapat diproses karena masalah pada sisi peminta.',
        source: 'Langkah 2: Kode status',
      },
      {
        question: 'Kapan percobaan ulang sebaiknya dilakukan?',
        options: ['Saat kegagalan sementara seperti 429 atau 5xx', 'Saat menerima 400', 'Saat menerima 401', 'Saat menerima 404'],
        correctIndex: 0,
        explanation: 'Kegagalan sementara bisa berhasil pada percobaan berikutnya, sedangkan 4xx tidak berubah.',
        source: 'Langkah 4: Batas waktu dan percobaan ulang',
      },
      {
        question: 'Apa perbedaan PUT dan PATCH?',
        options: ['PUT mengganti seluruh sumber daya, PATCH sebagian', 'PUT hanya untuk membaca', 'PATCH menghapus data', 'Keduanya identik'],
        correctIndex: 0,
        explanation: 'PUT mengirim representasi penuh, PATCH hanya bagian yang berubah.',
        source: 'Langkah 1: Metode dan alamat',
      },
      {
        question: 'Mengapa bentuk respons perlu divalidasi?',
        options: ['Karena field bisa hilang atau bertipe berbeda', 'Karena JSON selalu salah', 'Karena server tidak mengirim data', 'Karena browser memblokir JSON'],
        correctIndex: 0,
        explanation: 'Validasi mencegah error saat mengakses field yang tidak ada atau bertipe lain.',
        source: 'Langkah 3: Bentuk data dan validasi',
      },
      {
        question: 'Apa yang harus diperiksa lebih dulu setelah permintaan selesai?',
        options: ['Status respons', 'Warna tombol', 'Ukuran layar', 'Versi browser'],
        correctIndex: 0,
        explanation: 'Status menentukan apakah isi respons boleh dipakai.',
        source: 'Contoh: Membaca status sebelum membaca isi',
      },
      {
        question: 'Apa arti kode status 5xx?',
        options: ['Kesalahan dari sisi server', 'Kesalahan dari sisi peminta', 'Berhasil dibuat', 'Sumber daya dipindahkan'],
        correctIndex: 0,
        explanation: '5xx menandakan server gagal memproses permintaan yang sebenarnya valid.',
        source: 'Langkah 2: Kode status',
      },
      {
        question: 'Mengapa setiap permintaan jaringan butuh batas waktu?',
        options: ['Agar aplikasi tidak menunggu tanpa kepastian', 'Agar data lebih besar', 'Agar status berubah', 'Agar cache aktif'],
        correctIndex: 0,
        explanation: 'Tanpa batas waktu, permintaan yang menggantung membuat antarmuka terlihat macet.',
        source: 'Langkah 4: Batas waktu dan percobaan ulang',
      },
      {
        question: 'Metode apa yang tepat untuk mengambil data?',
        options: ['GET', 'POST', 'DELETE', 'PATCH'],
        correctIndex: 0,
        explanation: 'GET dipakai untuk membaca sumber daya tanpa mengubahnya.',
        source: 'Langkah 1: Metode dan alamat',
      },
      {
        question: 'Bagaimana jeda percobaan ulang sebaiknya disusun?',
        options: ['Meningkat setiap percobaan', 'Tetap sangat pendek', 'Tanpa jeda', 'Selalu satu jam'],
        correctIndex: 0,
        explanation: 'Jeda yang meningkat memberi waktu server pulih dan mengurangi beban.',
        source: 'Contoh: Percobaan ulang dengan jeda',
      },
      {
        question: 'Apa yang sebaiknya ditampilkan saat permintaan gagal?',
        options: ['Pesan yang ramah dan bisa ditindaklanjuti', 'Objek galat mentah', 'Kunci API', 'Isi header permintaan'],
        correctIndex: 0,
        explanation: 'Pesan yang ramah membantu pengguna, sedangkan detail internal tidak perlu ditampilkan.',
        source: 'Contoh: Membaca status sebelum membaca isi',
      },
    ],
  },
  {
    id: 'mod-07',
    order: 7,
    title: 'Web Server dan Basis Data',
    topic: 'Backend',
    level: 'Mahir',
    minutes: 45,
    summary:
      'Server menerima permintaan, memvalidasi, menyimpan ke basis data, lalu membalas. Modul ini membahas alur itu beserta risiko query dan pengelolaan koneksi.',
    overview:
      'Lapisan server adalah tempat kepercayaan berpindah: data dari klien tidak pernah dipercaya begitu saja. Validasi, parameter query, dan pengelolaan koneksi adalah tiga hal yang paling menentukan kualitas backend.',
    steps: [
      {
        step: 'Langkah 1: Alur permintaan di server',
        detail:
          'Permintaan masuk, melewati middleware, dicocokkan ke rute, divalidasi, lalu dijalankan ke basis data. Respons dikirim setelah semua langkah selesai.',
        analogy: 'Seperti loket layanan: berkas diperiksa, dicatat, lalu hasilnya diserahkan kembali.',
      },
      {
        step: 'Langkah 2: Validasi masukan',
        detail:
          'Periksa tipe, panjang, dan rentang nilai sebelum data dipakai. Tolak lebih awal dengan status 400 dan pesan yang jelas.',
        analogy: 'Seperti penjaga pintu yang memeriksa tiket sebelum orang masuk.',
      },
      {
        step: 'Langkah 3: Query berparameter',
        detail:
          'Nilai dari pengguna dikirim sebagai parameter, bukan disambung ke dalam teks query. Ini mencegah nilai diperlakukan sebagai perintah.',
        analogy: 'Seperti menulis nama di kolom formulir, bukan menyisipkan nama ke dalam kalimat instruksi.',
      },
      {
        step: 'Langkah 4: Koneksi dan transaksi',
        detail:
          'Gunakan connection pool agar koneksi dipakai ulang. Bungkus beberapa perubahan terkait dalam transaksi agar semuanya berhasil atau tidak sama sekali.',
        analogy: 'Seperti transfer bank: saldo keluar dan masuk harus terjadi bersama.',
      },
    ],
    examples: [
      {
        title: 'Query berparameter',
        description:
          'SELECT * FROM materi WHERE id = $1 dengan nilai dikirim terpisah. Nilai tidak pernah menjadi bagian dari teks query.',
      },
      {
        title: 'Transaksi',
        description:
          'Mulai transaksi, jalankan beberapa perubahan, lalu commit. Jika satu langkah gagal, rollback mengembalikan keadaan sebelumnya.',
      },
    ],
    keyPoints: [
      'Data dari klien tidak pernah dipercaya tanpa validasi.',
      'Query berparameter mencegah nilai diperlakukan sebagai perintah.',
      'Connection pool memakai ulang koneksi yang sudah dibuka.',
      'Transaksi menjaga beberapa perubahan tetap konsisten.',
      'Validasi dilakukan sebelum data menyentuh basis data.',
    ],
    flashcards: [
      { front: 'Mengapa memakai query berparameter?', back: 'Agar nilai dari pengguna tidak diperlakukan sebagai perintah.' },
      { front: 'Apa fungsi connection pool?', back: 'Memakai ulang koneksi agar tidak membuka koneksi baru terus-menerus.' },
      { front: 'Apa itu rollback?', back: 'Membatalkan perubahan dalam transaksi yang gagal.' },
      { front: 'Kapan validasi dilakukan?', back: 'Sebelum data dipakai atau disimpan.' },
    ],
    quiz: [
      {
        question: 'Mengapa query berparameter lebih aman?',
        options: ['Nilai tidak diperlakukan sebagai perintah', 'Query berjalan lebih cepat selalu', 'Tidak perlu validasi', 'Basis data tidak perlu indeks'],
        correctIndex: 0,
        explanation: 'Parameter memisahkan nilai dari teks query sehingga nilai tidak bisa mengubah perintah.',
        source: 'Langkah 3: Query berparameter',
      },
      {
        question: 'Apa fungsi connection pool?',
        options: ['Memakai ulang koneksi yang sudah dibuka', 'Menghapus tabel', 'Mengenkripsi query', 'Membuat indeks otomatis'],
        correctIndex: 0,
        explanation: 'Pool menyimpan koneksi siap pakai sehingga tidak perlu membuka koneksi baru setiap permintaan.',
        source: 'Langkah 4: Koneksi dan transaksi',
      },
      {
        question: 'Apa yang dilakukan rollback?',
        options: ['Membatalkan perubahan dalam transaksi', 'Menyimpan perubahan', 'Menghapus basis data', 'Membuat cadangan'],
        correctIndex: 0,
        explanation: 'Rollback mengembalikan keadaan sebelum transaksi dimulai.',
        source: 'Contoh: Transaksi',
      },
      {
        question: 'Kapan validasi masukan sebaiknya dilakukan?',
        options: ['Sebelum data dipakai atau disimpan', 'Setelah data disimpan', 'Saat halaman ditutup', 'Hanya di sisi klien'],
        correctIndex: 0,
        explanation: 'Validasi awal mencegah data tidak sah masuk ke lapisan berikutnya.',
        source: 'Langkah 2: Validasi masukan',
      },
      {
        question: 'Apa status yang tepat untuk masukan tidak valid?',
        options: ['400', '200', '500', '302'],
        correctIndex: 0,
        explanation: '400 menandakan permintaan tidak valid dari sisi peminta.',
        source: 'Langkah 2: Validasi masukan',
      },
      {
        question: 'Mengapa data dari klien tidak boleh dipercaya?',
        options: ['Karena bisa dimanipulasi di luar aplikasi', 'Karena selalu salah', 'Karena ukurannya besar', 'Karena formatnya biner'],
        correctIndex: 0,
        explanation: 'Klien bisa mengirim apa pun, jadi server harus memeriksa sendiri.',
        source: 'Gambaran umum',
      },
      {
        question: 'Apa manfaat transaksi untuk beberapa perubahan terkait?',
        options: ['Semua berhasil atau tidak sama sekali', 'Semua perubahan lebih cepat', 'Tidak perlu validasi', 'Koneksi tidak diperlukan'],
        correctIndex: 0,
        explanation: 'Transaksi menjaga konsistensi ketika beberapa perubahan harus terjadi bersama.',
        source: 'Langkah 4: Koneksi dan transaksi',
      },
      {
        question: 'Apa urutan yang benar dalam alur permintaan server?',
        options: ['Rute, validasi, akses data, respons', 'Respons, validasi, rute', 'Akses data, rute, validasi', 'Validasi, respons, rute'],
        correctIndex: 0,
        explanation: 'Permintaan dicocokkan ke rute, divalidasi, lalu data diakses sebelum respons dikirim.',
        source: 'Langkah 1: Alur permintaan di server',
      },
      {
        question: 'Apa risiko menyambung nilai pengguna ke teks query?',
        options: ['Nilai bisa mengubah perintah yang dijalankan', 'Query menjadi lebih lambat', 'Koneksi tertutup', 'Indeks hilang'],
        correctIndex: 0,
        explanation: 'Nilai yang disambung langsung bisa mengubah struktur perintah.',
        source: 'Langkah 3: Query berparameter',
      },
      {
        question: 'Apa yang diperiksa saat validasi masukan?',
        options: ['Tipe, panjang, dan rentang nilai', 'Warna dan font', 'Versi browser', 'Ukuran layar'],
        correctIndex: 0,
        explanation: 'Validasi memeriksa kesesuaian tipe, panjang, dan rentang nilai yang diizinkan.',
        source: 'Langkah 2: Validasi masukan',
      },
    ],
  },
  {
    id: 'mod-08',
    order: 8,
    title: 'Integrasi Model AI yang Aman',
    topic: 'AI',
    level: 'Mahir',
    minutes: 40,
    summary:
      'Memanggil model AI dari aplikasi berarti memindahkan kredensial ke tempat yang tidak bisa dibaca pengguna. Modul ini membahas proxy server, validasi endpoint, dan penanganan galat.',
    overview:
      'Kunci API adalah kredensial, bukan pengaturan tampilan. Jika kunci dikirim ke browser, siapa pun bisa membacanya. Pola yang aman: browser memanggil server sendiri, server memegang kunci dan memanggil penyedia.',
    steps: [
      {
        step: 'Langkah 1: Kunci tetap di server',
        detail:
          'Simpan kunci di variabel lingkungan pada server. Browser hanya memanggil rute milik aplikasi, tanpa pernah menerima kunci.',
        analogy: 'Seperti resepsionis yang menghubungi vendor: tamu tidak perlu tahu nomor akun kantor.',
      },
      {
        step: 'Langkah 2: Endpoint yang dapat dikonfigurasi',
        detail:
          'Alamat penyedia dan nama model dibaca dari konfigurasi. Karena server yang melakukan permintaan, alamat harus divalidasi agar tidak menunjuk ke jaringan internal.',
        analogy: 'Seperti kurir yang hanya boleh mengantar ke alamat yang ada di daftar resmi.',
      },
      {
        step: 'Langkah 3: Redaksi pesan galat',
        detail:
          'Pesan dari penyedia bisa memuat potongan kunci atau detail internal. Saring sebelum ditampilkan atau dicatat, dan tampilkan pesan yang bisa ditindaklanjuti pengguna.',
        analogy: 'Seperti menyensor nomor rekening pada struk sebelum struk itu dibagikan.',
      },
      {
        step: 'Langkah 4: Batas laju dan ukuran',
        detail:
          'Batasi jumlah permintaan per waktu dan panjang masukan. Tanpa batas, satu klien bisa menghabiskan kuota seluruh pengguna.',
        analogy: 'Seperti antrean dengan nomor: semua dapat giliran, tidak ada yang menyerobot.',
      },
    ],
    examples: [
      {
        title: 'Alur proxy',
        description:
          'Browser mengirim pesan ke /api/ai/chat. Server menambahkan kunci dari variabel lingkungan, memanggil penyedia, lalu mengembalikan teks. Kunci tidak pernah melewati jaringan ke browser.',
      },
      {
        title: 'Validasi alamat',
        description:
          'Tolak alamat yang bukan https, yang memuat kredensial di dalam URL, atau yang menunjuk ke localhost dan rentang alamat privat.',
      },
    ],
    keyPoints: [
      'Kunci API tidak boleh dikirim ke browser atau disimpan di penyimpanan lokal browser.',
      'Server memegang kredensial dan menjadi perantara permintaan.',
      'Alamat endpoint harus divalidasi untuk mencegah akses ke jaringan internal.',
      'Pesan galat harus disaring sebelum ditampilkan atau dicatat.',
      'Batas laju melindungi kuota bersama.',
    ],
    flashcards: [
      { front: 'Mengapa kunci API tidak boleh ada di browser?', back: 'Karena siapa pun bisa membacanya dari penyimpanan atau jaringan.' },
      { front: 'Apa fungsi proxy AI di server?', back: 'Menambahkan kredensial dan memanggil penyedia tanpa membocorkan kunci ke klien.' },
      { front: 'Mengapa endpoint perlu divalidasi?', back: 'Agar server tidak diarahkan mengakses alamat internal.' },
      { front: 'Apa gunanya batas laju?', back: 'Mencegah satu klien menghabiskan kuota bersama.' },
    ],
    quiz: [
      {
        question: 'Mengapa kunci API tidak boleh dikirim ke browser?',
        options: ['Karena bisa dibaca dari penyimpanan atau jaringan', 'Karena membuat halaman lambat', 'Karena CSS tidak mendukung', 'Karena browser menolak JSON'],
        correctIndex: 0,
        explanation: 'Apa pun yang sampai ke browser bisa dibaca pengguna atau skrip lain.',
        source: 'Langkah 1: Kunci tetap di server',
      },
      {
        question: 'Apa peran proxy AI di server?',
        options: ['Menambahkan kredensial dan memanggil penyedia', 'Menyimpan kunci di browser', 'Menampilkan kunci di antarmuka', 'Menonaktifkan validasi'],
        correctIndex: 0,
        explanation: 'Proxy memegang kredensial sehingga klien tidak perlu tahu kuncinya.',
        source: 'Contoh: Alur proxy',
      },
      {
        question: 'Mengapa alamat endpoint harus divalidasi?',
        options: ['Agar server tidak diarahkan ke jaringan internal', 'Agar respons lebih cepat', 'Agar model lebih pintar', 'Agar kuota bertambah'],
        correctIndex: 0,
        explanation: 'Tanpa validasi, alamat dari pengguna bisa menunjuk ke alamat internal yang tidak seharusnya diakses.',
        source: 'Langkah 2: Endpoint yang dapat dikonfigurasi',
      },
      {
        question: 'Apa yang harus dilakukan pada pesan galat dari penyedia?',
        options: ['Disaring sebelum ditampilkan atau dicatat', 'Ditampilkan apa adanya', 'Disimpan di penyimpanan lokal', 'Dikirim ke pengguna lain'],
        correctIndex: 0,
        explanation: 'Pesan galat bisa memuat detail internal atau potongan kredensial.',
        source: 'Langkah 3: Redaksi pesan galat',
      },
      {
        question: 'Apa fungsi batas laju?',
        options: ['Mencegah satu klien menghabiskan kuota bersama', 'Mempercepat model', 'Menghapus cache', 'Mengubah model default'],
        correctIndex: 0,
        explanation: 'Batas laju membagi akses secara adil dan melindungi kuota.',
        source: 'Langkah 4: Batas laju dan ukuran',
      },
      {
        question: 'Di mana kunci API sebaiknya disimpan?',
        options: ['Variabel lingkungan di server', 'localStorage browser', 'Atribut data pada HTML', 'Query string URL'],
        correctIndex: 0,
        explanation: 'Variabel lingkungan di server tidak pernah dikirim ke klien.',
        source: 'Langkah 1: Kunci tetap di server',
      },
      {
        question: 'Mengapa panjang masukan perlu dibatasi?',
        options: ['Agar biaya dan waktu proses tetap terkendali', 'Agar CSS valid', 'Agar browser tidak menutup tab', 'Agar model berganti'],
        correctIndex: 0,
        explanation: 'Masukan yang sangat panjang menaikkan biaya dan waktu proses secara tidak terkendali.',
        source: 'Langkah 4: Batas laju dan ukuran',
      },
      {
        question: 'Apa yang membuat sebuah alamat endpoint ditolak?',
        options: ['Memuat kredensial di dalam URL', 'Memakai https', 'Memakai nama domain', 'Memakai jalur /v1'],
        correctIndex: 0,
        explanation: 'Kredensial di dalam URL bisa bocor lewat log dan riwayat.',
        source: 'Contoh: Validasi alamat',
      },
      {
        question: 'Apa manfaat memisahkan konfigurasi model dari kode?',
        options: ['Model dan alamat bisa diganti tanpa mengubah kode', 'Kunci jadi terlihat', 'Validasi tidak diperlukan', 'Respons lebih besar'],
        correctIndex: 0,
        explanation: 'Konfigurasi terpisah membuat penggantian penyedia atau model cukup lewat pengaturan.',
        source: 'Langkah 2: Endpoint yang dapat dikonfigurasi',
      },
      {
        question: 'Apa yang sebaiknya ditampilkan ke pengguna saat kredensial belum diatur?',
        options: ['Pesan bahwa kredensial belum tersedia', 'Nilai kunci yang sedang dipakai', 'Isi berkas konfigurasi', 'Header permintaan'],
        correctIndex: 0,
        explanation: 'Pesan status cukup menjelaskan masalah tanpa membocorkan nilai rahasia.',
        source: 'Langkah 3: Redaksi pesan galat',
      },
    ],
  },
  {
    id: 'mod-09',
    order: 9,
    title: 'Keamanan Aplikasi Web',
    topic: 'Keamanan',
    level: 'Ahli',
    minutes: 45,
    summary:
      'Keamanan bukan satu fitur, melainkan kebiasaan: tidak mempercayai masukan, membatasi akses, dan tidak membocorkan detail internal. Modul ini membahas risiko yang paling sering muncul.',
    overview:
      'Sebagian besar insiden web berawal dari hal sederhana: masukan yang tidak diperiksa, rahasia yang tersimpan di tempat salah, atau pesan galat yang terlalu terbuka. Memperbaiki kebiasaan ini menutup banyak celah sekaligus.',
    steps: [
      {
        step: 'Langkah 1: Tidak mempercayai masukan',
        detail:
          'Semua masukan diperiksa di server, termasuk yang sudah diperiksa di klien. Pemeriksaan di klien hanya untuk kenyamanan, bukan keamanan.',
        analogy: 'Seperti pemeriksaan tas di pintu masuk: dilakukan oleh petugas, bukan oleh pengunjung sendiri.',
      },
      {
        step: 'Langkah 2: Mengelola rahasia',
        detail:
          'Rahasia disimpan di variabel lingkungan, tidak masuk ke repositori, dan tidak pernah dicatat di log. Berkas contoh konfigurasi hanya memuat nama variabel, bukan nilainya.',
        analogy: 'Seperti kunci gedung: disimpan di tempat terkunci, bukan ditempel di pintu.',
      },
      {
        step: 'Langkah 3: Membatasi akses dan laju',
        detail:
          'Setiap rute memeriksa izin pemanggil. Batas laju mencegah percobaan berulang seperti menebak kata sandi.',
        analogy: 'Seperti kartu akses per lantai: tidak semua orang bisa masuk ke semua ruangan.',
      },
      {
        step: 'Langkah 4: Pesan galat yang aman',
        detail:
          'Pesan untuk pengguna menjelaskan langkah berikutnya tanpa menyebut detail internal seperti nama tabel, jalur berkas, atau nilai konfigurasi.',
        analogy: 'Seperti petugas yang mengatakan ruangan sedang diperbaiki, bukan membacakan daftar kabel yang rusak.',
      },
    ],
    examples: [
      {
        title: 'Berkas contoh konfigurasi',
        description:
          'Berkas .env.example hanya berisi nama variabel dan nilai contoh yang tidak nyata. Berkas .env yang berisi nilai sebenarnya tidak pernah dimasukkan ke repositori.',
      },
      {
        title: 'Pesan galat berlapis',
        description:
          'Pengguna menerima pesan singkat yang bisa ditindaklanjuti, sedangkan detail teknis hanya masuk ke log server dengan nilai rahasia sudah disaring.',
      },
    ],
    keyPoints: [
      'Validasi keamanan dilakukan di server, bukan hanya di klien.',
      'Rahasia disimpan di variabel lingkungan dan tidak masuk repositori.',
      'Setiap rute memeriksa izin pemanggil.',
      'Batas laju menghambat percobaan berulang.',
      'Pesan galat tidak boleh memuat detail internal atau nilai rahasia.',
    ],
    flashcards: [
      { front: 'Mengapa validasi di klien tidak cukup?', back: 'Karena klien bisa dimanipulasi, jadi server tetap harus memeriksa.' },
      { front: 'Apa isi berkas .env.example?', back: 'Nama variabel dan nilai contoh, tanpa rahasia sebenarnya.' },
      { front: 'Apa fungsi batas laju pada keamanan?', back: 'Menghambat percobaan berulang seperti menebak kata sandi.' },
      { front: 'Apa yang tidak boleh ada di pesan galat pengguna?', back: 'Detail internal dan nilai rahasia.' },
    ],
    quiz: [
      {
        question: 'Mengapa validasi di klien tidak cukup untuk keamanan?',
        options: ['Karena klien bisa dimanipulasi', 'Karena klien lebih lambat', 'Karena server tidak bisa memvalidasi', 'Karena validasi klien selalu salah'],
        correctIndex: 0,
        explanation: 'Pemeriksaan di klien bisa dilewati, jadi server harus memeriksa ulang.',
        source: 'Langkah 1: Tidak mempercayai masukan',
      },
      {
        question: 'Apa isi berkas .env.example?',
        options: ['Nama variabel dan nilai contoh tanpa rahasia', 'Kunci API sebenarnya', 'Kata sandi basis data', 'Log server'],
        correctIndex: 0,
        explanation: 'Berkas contoh hanya mendokumentasikan nama variabel, bukan nilai rahasia.',
        source: 'Contoh: Berkas contoh konfigurasi',
      },
      {
        question: 'Apa fungsi batas laju dalam keamanan?',
        options: ['Menghambat percobaan berulang', 'Mempercepat enkripsi', 'Menghapus log', 'Mengubah kata sandi'],
        correctIndex: 0,
        explanation: 'Batas laju mempersulit percobaan berulang seperti menebak kata sandi.',
        source: 'Langkah 3: Membatasi akses dan laju',
      },
      {
        question: 'Apa yang tidak boleh muncul di pesan galat untuk pengguna?',
        options: ['Detail internal dan nilai rahasia', 'Langkah berikutnya', 'Kode status', 'Saran mencoba lagi'],
        correctIndex: 0,
        explanation: 'Detail internal membantu penyerang, jadi tidak ditampilkan ke pengguna.',
        source: 'Langkah 4: Pesan galat yang aman',
      },
      {
        question: 'Di mana rahasia aplikasi sebaiknya disimpan?',
        options: ['Variabel lingkungan di server', 'Berkas yang diunggah ke repositori', 'localStorage', 'Komentar kode'],
        correctIndex: 0,
        explanation: 'Variabel lingkungan di server tidak ikut tersimpan di repositori.',
        source: 'Langkah 2: Mengelola rahasia',
      },
      {
        question: 'Apa yang harus diperiksa setiap rute?',
        options: ['Izin pemanggil', 'Warna antarmuka', 'Versi font', 'Ukuran gambar'],
        correctIndex: 0,
        explanation: 'Setiap rute memeriksa apakah pemanggil berhak melakukan operasi tersebut.',
        source: 'Langkah 3: Membatasi akses dan laju',
      },
      {
        question: 'Mengapa detail teknis dipisahkan dari pesan pengguna?',
        options: ['Agar penyerang tidak mendapat petunjuk', 'Agar halaman lebih cepat', 'Agar CSS valid', 'Agar cache aktif'],
        correctIndex: 0,
        explanation: 'Detail teknis bisa memberi petunjuk tentang struktur internal aplikasi.',
        source: 'Contoh: Pesan galat berlapis',
      },
      {
        question: 'Apa risiko menyimpan rahasia di repositori?',
        options: ['Rahasia bisa dibaca siapa pun yang punya akses', 'Repositori menjadi lambat', 'Kode tidak bisa dijalankan', 'Git menolak commit'],
        correctIndex: 0,
        explanation: 'Riwayat repositori menyimpan nilai lama, sehingga rahasia tetap bisa ditemukan.',
        source: 'Langkah 2: Mengelola rahasia',
      },
      {
        question: 'Apa prinsip utama pada modul ini?',
        options: ['Jangan mempercayai masukan dan jangan membocorkan detail', 'Selalu menampilkan galat lengkap', 'Simpan rahasia di klien', 'Lewati validasi server'],
        correctIndex: 0,
        explanation: 'Dua kebiasaan itu menutup banyak celah sekaligus.',
        source: 'Gambaran umum',
      },
      {
        question: 'Mengapa pemeriksaan di klien tetap berguna?',
        options: ['Untuk kenyamanan pengguna, bukan keamanan', 'Untuk menggantikan validasi server', 'Untuk menyimpan rahasia', 'Untuk menonaktifkan batas laju'],
        correctIndex: 0,
        explanation: 'Pemeriksaan klien mempercepat umpan balik, tetapi keamanan tetap bergantung pada server.',
        source: 'Langkah 1: Tidak mempercayai masukan',
      },
    ],
  },
];

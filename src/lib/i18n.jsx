import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'sl_language_v1';

export const DICTIONARY = {
  id: {
    // Navigasi
    nav_dashboard: 'Dashboard',
    nav_modules: 'Modul',
    nav_quiz: 'Kuis',
    nav_tutor: 'Tutor',
    nav_upload: 'Unggah',
    nav_progress: 'Progres',
    skip_to_content: 'Lompat ke konten',
    app_subtitle: 'Jalur Web Fullstack',
    footer_note: 'Progres belajar tersimpan aman secara end-to-end.',

    // Tombol & Aksi Umum
    btn_settings: 'Pengaturan AI',
    btn_login: 'Masuk',
    btn_logout: 'Keluar',
    btn_admin_sso: 'SSO Admin',
    btn_close: 'Tutup',
    btn_cancel: 'Batal',
    btn_save: 'Simpan',
    btn_back: 'Kembali',
    btn_start: 'Mulai',
    btn_send: 'Kirim',
    btn_stop: 'Hentikan',
    btn_retry: 'Coba Lagi',
    btn_delete: 'Hapus',
    btn_search: 'Cari',

    // Dashboard
    dash_eyebrow: 'Jalur Web Fullstack Terstruktur',
    dash_title: 'Sembilan modul terpadu untuk penguasaan web modern.',
    dash_desc: 'Pelajari konsep fundamental dari dasar peramban hingga arsitektur backend aman dan integrasi AI.',
    dash_continue: 'Lanjut ke Modul {order}: {title}',
    dash_repeat_quiz: 'Semua modul selesai, ulangi kuis evaluasi',
    dash_ask_tutor: 'Tanya Tutor AI',
    dash_your_position: 'Posisi Belajar',
    dash_level: 'Level',
    dash_total_xp: 'Total XP',
    dash_streak: '{count} hari berturut-turut',
    dash_completed_modules: 'Modul Selesai',
    dash_quiz_avg: 'Rata-rata Kuis',
    dash_curriculum_map: 'Peta Kurikulum',
    dash_nine_modules: 'Modul Pembelajaran Terstruktur',
    dash_nine_modules_desc: 'Disusun sistematis dari arsitektur browser hingga keamanan aplikasi tingkat lanjut.',
    dash_add_custom: 'Tambah modul dari berkas',

    // Modul
    mod_list_title: 'Daftar Modul Belajar',
    mod_search_placeholder: 'Cari berdasarkan judul, topik, atau kata kunci...',
    mod_status_all: 'Semua Status',
    mod_status_incomplete: 'Belum Selesai',
    mod_status_complete: 'Selesai',
    mod_empty_title: 'Tidak ada modul yang cocok',
    mod_empty_desc: 'Coba gunakan kata kunci pencarian lain atau setel ulang filter status.',
    mod_reset_filter: 'Reset filter',
    mod_open_btn: 'Buka Modul',
    mod_done_badge: 'Selesai',

    // Detail Modul
    detail_back: 'Kembali ke daftar modul',
    detail_overview: 'Gambaran Umum',
    detail_steps: 'Langkah Bertahap',
    detail_analogy: 'Analogi Praktis',
    detail_examples: 'Contoh Konkret',
    detail_key_points: 'Poin Penting',
    detail_flashcards: 'Kartu Memori (Flashcard)',
    detail_take_quiz: 'Kerjakan Kuis Modul',
    detail_ask_tutor: 'Tanya Tutor Tentang Modul Ini',
    detail_mark_complete: 'Tandai Selesai',
    detail_delete_custom: 'Hapus Modul Kustom',
    detail_confirm_delete: 'Hapus Permanen',

    // Kuis
    quiz_eyebrow: 'Evaluasi Pemahaman',
    quiz_title: 'Uji Pemahaman per Modul',
    quiz_subtitle: 'Soal disusun untuk menguji penerapan praktis dan pemahaman konsep secara mendalam.',
    quiz_select_module: 'Pilih Modul',
    quiz_select_count: 'Jumlah Soal',
    quiz_count_label: '{count} Soal',
    quiz_start_btn: 'Mulai Sesi Kuis',
    quiz_read_module_first: 'Baca materi modul terlebih dahulu',
    quiz_answered_progress: '{answered}/{total} soal dijawab',
    quiz_submit_btn: 'Kumpulkan Jawaban',
    quiz_unanswered_warn: 'Masih ada {count} soal yang belum dijawab.',
    quiz_result_title: 'Hasil Evaluasi Kuis',
    quiz_score_summary: '{correct} dari {total} soal benar ({percent}%)',
    quiz_review_heading: 'Pembahasan Lengkap',
    quiz_your_answer: 'Jawaban Anda',
    quiz_correct_answer: 'Jawaban Benar',
    quiz_explanation: 'Penjelasan Teknis',

    // Tutor
    tutor_eyebrow: 'Asisten Belajar Cerdas',
    tutor_title: 'Tanya Jawab Terfokus Modul',
    tutor_subtitle: 'Tutor AI menjawab berlandaskan modul terpilih dengan perlindungan sistem dan konteks terisolasi.',
    tutor_conversation: 'Percakapan',
    tutor_no_focus: 'Tanpa fokus modul spesifik',
    tutor_clear_history: 'Bersihkan Riwayat',
    tutor_empty_title: 'Belum ada pertanyaan',
    tutor_empty_desc: 'Ketik pertanyaan mengenai materi atau pilih salah satu rekomendasi topik di samping.',
    tutor_you: 'Anda',
    tutor_ai: 'Tutor AI',
    tutor_input_placeholder: 'Tulis pertanyaan teknis, lalu tekan Ctrl+Enter untuk mengirim...',
    tutor_input_hint: 'Tekan Ctrl+Enter untuk langsung mengirim',
    tutor_focus_label: 'Fokus Pembahasan Materi',
    tutor_open_focused_module: 'Buka modul yang sedang dibahas',
    tutor_suggestions_heading: 'Rekomendasi Pertanyaan',

    // Unggah
    upload_eyebrow: 'Modul Mandiri',
    upload_title: 'Ekstrak Berkas Menjadi Modul',
    upload_subtitle: 'Mendukung format PDF, Markdown, teks murni, dan kode sumber dengan pemrosesan aman.',
    upload_drop_title: 'Letakkan berkas dokumen di sini atau klik untuk memilih',
    upload_limit_note: 'Batas ukuran maksimal 15 MB. Format: {formats}',
    upload_select_btn: 'Pilih Berkas',
    upload_reset_btn: 'Ganti Berkas',
    upload_preview_heading: 'Pratinjau Modul Hasil Ekstraksi',
    upload_save_btn: 'Simpan ke Jalur Belajar',

    // Progres
    prog_eyebrow: 'Laporan Perkembangan',
    prog_title: 'Rekapitulasi Capaian Belajar',
    prog_subtitle: 'Data aktivitas tersimpan terenkripsi secara end-to-end.',
    prog_level_cap: 'Level puncak telah dicapai',
    prog_level_next: '{xp} XP lagi menuju {next}',
    prog_quiz_empty: 'Belum ada kuis yang diselesaikan',
    prog_module_status: 'Status Sembilan Modul',

    // Pengaturan AI (Khusus Provider Mandiri)
    set_title: 'Konfigurasi Provider Mandiri',
    set_desc: 'Khusus pengguna yang ingin memakai endpoint dan kunci AI pribadi. Jika tidak diatur, aplikasi otomatis memakai model bawaan (Agnes & Mercury).',
    set_builtin_active: 'Model Bawaan Otomatis Aktif',
    set_builtin_models_desc: 'Agnes 2.5 Flash & Mercury-3 (Otomatis beralih saat kendala jaringan).',
    set_self_provider_active: 'Provider Mandiri Aktif',
    set_self_provider_desc: 'Permintaan AI diarahkan ke endpoint & kredensial kustom Anda.',
    set_reset_builtin: 'Reset ke Model Bawaan',
    set_provider_label: 'Protokol Provider',
    set_provider_hint: 'Dukungan protokol: OpenAI Compatible, Anthropic Claude, atau Google Gemini.',
    set_endpoint_label: 'Endpoint API Kustom',
    set_endpoint_placeholder: 'Kosongkan untuk menggunakan model bawaan',
    set_endpoint_hint: 'Alamat HTTPS endpoint pribadi Anda (misal: https://api.openai.com/v1).',
    set_model_label: 'Nama Model Kustom',
    set_model_placeholder: 'Kosongkan untuk menggunakan model bawaan',
    set_model_hint: 'Contoh: gpt-4o-mini, claude-3-5-sonnet, gemini-2.0-flash.',
    set_key_label: 'Kunci API Pribadi',
    set_key_placeholder: 'Kunci API kustom Anda',
    set_key_hint: 'Disimpan hanya di memori sesi browser dan tidak pernah disimpan ke database/server.',
    set_behavior_legend: 'Perilaku Permintaan & Keamanan',
    set_stream_label: 'Streaming Respons',
    set_stream_hint: 'Teks dikirim bertahap secara real-time saat model menghasilkan jawaban.',
    set_loop_prevention: 'Proteksi Repetisi & Sanitasi Aktif',

    // Autentikasi
    auth_title: 'Autentikasi Pengguna',
    auth_tab_login: 'Masuk',
    auth_tab_register: 'Daftar Akun',
    auth_fullname_label: 'Nama Lengkap',
    auth_username_label: 'Nama Pengguna',
    auth_password_label: 'Kata Sandi',
    auth_confirm_password_label: 'Konfirmasi Kata Sandi',
    auth_btn_login: 'Masuk',
    auth_btn_register: 'Daftar Akun',
    auth_fullname_placeholder: 'Contoh: Budi Pratama',
    auth_username_placeholder: 'Contoh: budipratama',
    auth_password_placeholder: 'Minimal 4 karakter',
    auth_confirm_password_placeholder: 'Ketik ulang kata sandi',
    auth_switch_to_register: 'Belum memiliki akun? Daftar di sini',
    auth_switch_to_login: 'Sudah memiliki akun? Masuk di sini',
    auth_logged_as: 'Masuk sebagai',
    login_gate_eyebrow: 'Gerbang Autentikasi',
    login_gate_title: 'Platform Pembelajaran Web',
    login_gate_subtitle: 'Akses 9 modul kurikulum, kuis adaptif, dan AI Tutor terenkripsi.',
    login_gate_security: 'Data progres belajar dienkripsi secara end-to-end (AES-256) dan dilindungi oleh Supabase Authentication.',
    login_verifying: 'Memverifikasi status sesi...',
  },
  en: {
    // Navigation
    nav_dashboard: 'Dashboard',
    nav_modules: 'Modules',
    nav_quiz: 'Quiz',
    nav_tutor: 'Tutor',
    nav_upload: 'Upload',
    nav_progress: 'Progress',
    skip_to_content: 'Skip to content',
    app_subtitle: 'Fullstack Web Track',
    footer_note: 'Learning progress stored securely with end-to-end encryption.',

    // Common Buttons & Actions
    btn_settings: 'AI Settings',
    btn_login: 'Sign In',
    btn_logout: 'Sign Out',
    btn_admin_sso: 'Admin SSO',
    btn_close: 'Close',
    btn_cancel: 'Cancel',
    btn_save: 'Save',
    btn_back: 'Back',
    btn_start: 'Start',
    btn_send: 'Send',
    btn_stop: 'Stop',
    btn_retry: 'Retry',
    btn_delete: 'Delete',
    btn_search: 'Search',

    // Dashboard
    dash_eyebrow: 'Structured Fullstack Web Track',
    dash_title: 'Nine integrated modules for mastering modern web engineering.',
    dash_desc: 'Learn fundamental concepts from browser rendering to secure backend architecture and AI integration.',
    dash_continue: 'Continue to Module {order}: {title}',
    dash_repeat_quiz: 'All modules completed, repeat evaluation quiz',
    dash_ask_tutor: 'Ask AI Tutor',
    dash_your_position: 'Learning Overview',
    dash_level: 'Level',
    dash_total_xp: 'Total XP',
    dash_streak: '{count} day streak',
    dash_completed_modules: 'Completed Modules',
    dash_quiz_avg: 'Quiz Average',
    dash_curriculum_map: 'Curriculum Roadmap',
    dash_nine_modules: 'Structured Learning Modules',
    dash_nine_modules_desc: 'Sequentially organized from browser internals to enterprise application security.',
    dash_add_custom: 'Add module from file',

    // Modules
    mod_list_title: 'Learning Modules Directory',
    mod_search_placeholder: 'Search by title, topic, or keyword...',
    mod_status_all: 'All Statuses',
    mod_status_incomplete: 'Incomplete',
    mod_status_complete: 'Completed',
    mod_empty_title: 'No matching modules found',
    mod_empty_desc: 'Try searching with different terms or reset your status filter.',
    mod_reset_filter: 'Reset filter',
    mod_open_btn: 'Open Module',
    mod_done_badge: 'Done',

    // Module Detail
    detail_back: 'Back to modules list',
    detail_overview: 'Overview',
    detail_steps: 'Step-by-Step Breakdown',
    detail_analogy: 'Practical Analogy',
    detail_examples: 'Concrete Examples',
    detail_key_points: 'Key Points',
    detail_flashcards: 'Memory Flashcards',
    detail_take_quiz: 'Take Module Quiz',
    detail_ask_tutor: 'Ask Tutor About This Module',
    detail_mark_complete: 'Mark as Completed',
    detail_delete_custom: 'Delete Custom Module',
    detail_confirm_delete: 'Delete Permanently',

    // Quiz
    quiz_eyebrow: 'Knowledge Assessment',
    quiz_title: 'Module Understanding Quiz',
    quiz_subtitle: 'Questions crafted to evaluate deep conceptual grasp and practical code application.',
    quiz_select_module: 'Select Module',
    quiz_select_count: 'Question Count',
    quiz_count_label: '{count} Questions',
    quiz_start_btn: 'Start Quiz Session',
    quiz_read_module_first: 'Read module contents first',
    quiz_answered_progress: '{answered}/{total} questions answered',
    quiz_submit_btn: 'Submit Answers',
    quiz_unanswered_warn: '{count} questions remain unanswered.',
    quiz_result_title: 'Evaluation Result',
    quiz_score_summary: '{correct} of {total} correct ({percent}%)',
    quiz_review_heading: 'Detailed Review',
    quiz_your_answer: 'Your Answer',
    quiz_correct_answer: 'Correct Answer',
    quiz_explanation: 'Technical Explanation',

    // Tutor
    tutor_eyebrow: 'Intelligent Learning Assistant',
    tutor_title: 'Module-Focused Inquiries',
    tutor_subtitle: 'AI Tutor responds based on the selected curriculum module with isolated context protection.',
    tutor_conversation: 'Conversation',
    tutor_no_focus: 'No specific module focus',
    tutor_clear_history: 'Clear History',
    tutor_empty_title: 'No questions yet',
    tutor_empty_desc: 'Type a technical question or choose one of the recommended prompts on the side.',
    tutor_you: 'You',
    tutor_ai: 'AI Tutor',
    tutor_input_placeholder: 'Type your technical question, then press Ctrl+Enter to send...',
    tutor_input_hint: 'Press Ctrl+Enter to send immediately',
    tutor_focus_label: 'Focus Learning Topic',
    tutor_open_focused_module: 'Open active module',
    tutor_suggestions_heading: 'Suggested Questions',

    // Upload
    upload_eyebrow: 'Custom Modules',
    upload_title: 'Extract File into Module',
    upload_subtitle: 'Supports PDF, Markdown, plain text, and source code with secure client-side extraction.',
    upload_drop_title: 'Drop your document here or click to browse',
    upload_limit_note: 'Max file size 15 MB. Supported formats: {formats}',
    upload_select_btn: 'Browse File',
    upload_reset_btn: 'Choose Different File',
    upload_preview_heading: 'Module Extraction Preview',
    upload_save_btn: 'Save to Learning Path',

    // Progress
    prog_eyebrow: 'Performance Metrics',
    prog_title: 'Learning Track Recap',
    prog_subtitle: 'All activity records are protected with client and server end-to-end encryption.',
    prog_level_cap: 'Max level achieved',
    prog_level_next: '{xp} XP remaining to {next}',
    prog_quiz_empty: 'No quizzes completed yet',
    prog_module_status: 'Nine Modules Status',

    // Settings (Self Provider Only)
    set_title: 'Self Provider Configuration',
    set_desc: 'For users who want to use their own personal AI endpoint and key. If left empty, the app automatically uses built-in models (Agnes & Mercury).',
    set_builtin_active: 'Built-in Models Active',
    set_builtin_models_desc: 'Agnes 2.5 Flash & Mercury-3 (Automatic fallback on network issues).',
    set_self_provider_active: 'Self Provider Active',
    set_self_provider_desc: 'AI requests are routed to your custom endpoint & credentials.',
    set_reset_builtin: 'Reset to Built-in Models',
    set_provider_label: 'Provider Protocol',
    set_provider_hint: 'Supported protocols: OpenAI Compatible, Anthropic Claude, or Google Gemini.',
    set_endpoint_label: 'Custom API Endpoint',
    set_endpoint_placeholder: 'Leave blank to use built-in models',
    set_endpoint_hint: 'Your private HTTPS endpoint address (e.g. https://api.openai.com/v1).',
    set_model_label: 'Custom Model ID',
    set_model_placeholder: 'Leave blank to use built-in models',
    set_model_hint: 'e.g. gpt-4o-mini, claude-3-5-sonnet, gemini-2.0-flash.',
    set_key_label: 'Personal API Key',
    set_key_placeholder: 'Your personal API key',
    set_key_hint: 'Stored only in browser session memory and never committed to server or database.',
    set_behavior_legend: 'Request Behavior & Security',
    set_stream_label: 'Stream Response',
    set_stream_hint: 'Progressively receive streamed output tokens as the model generates content.',
    set_loop_prevention: 'Loop & Repetition Guard Active',

    // Auth
    auth_title: 'User Authentication',
    auth_tab_login: 'Sign In',
    auth_tab_register: 'Register',
    auth_fullname_label: 'Full Name',
    auth_username_label: 'Username',
    auth_password_label: 'Password',
    auth_confirm_password_label: 'Confirm Password',
    auth_btn_login: 'Sign In',
    auth_btn_register: 'Create Account',
    auth_fullname_placeholder: 'e.g. John Doe',
    auth_username_placeholder: 'e.g. johndoe',
    auth_password_placeholder: 'At least 4 characters',
    auth_confirm_password_placeholder: 'Re-enter your password',
    auth_switch_to_register: "Don't have an account? Register here",
    auth_switch_to_login: 'Already have an account? Sign in here',
    auth_logged_as: 'Signed in as',
    login_gate_eyebrow: 'Authentication Gate',
    login_gate_title: 'Web Learning Platform',
    login_gate_subtitle: 'Full access to 9 modules, adaptive quizzes, and encrypted AI Tutor.',
    login_gate_security: 'Learning progress data is end-to-end encrypted (AES-256) and secured by Supabase Authentication.',
    login_verifying: 'Verifying session status...',
  },
};

const I18nContext = createContext({
  lang: 'id',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'id') return saved;
    } catch {
      /* fallback */
    }
    return 'id';
  });

  const setLang = (nextLang) => {
    const target = nextLang === 'en' ? 'en' : 'id';
    setLangState(target);
    try {
      localStorage.setItem(STORAGE_KEY, target);
      document.documentElement.lang = target;
    } catch {
      /* ignore storage failure */
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const dict = DICTIONARY[lang] || DICTIONARY.id;
    const t = (key, params = {}) => {
      let str = dict[key] || DICTIONARY.id[key] || key;
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
      return str;
    };
    return { lang, setLang, t };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

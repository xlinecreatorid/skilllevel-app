// Ekstraksi teks dari berkas yang diunggah. PDF dibaca lewat pdfjs-dist yang
// dipasang sebagai dependensi, bukan skrip dari CDN, agar tidak ada kode pihak
// ketiga yang dimuat saat runtime. Pustaka PDF dimuat dinamis supaya bundel awal
// tetap ringan saat pengguna hanya membaca modul.

export const ALLOWED_EXT = ['pdf', 'txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx', 'py', 'csv', 'html', 'css', 'java', 'c', 'cpp', 'sql'];
export const MAX_FILE_BYTES = 15 * 1024 * 1024;

export class ExtractError extends Error {}

export function extensionOf(name = '') {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
}

let pdfjsPromise = null;

function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]).then(([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

async function readPdf(file) {
  const pdfjs = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // hasEOL menandai akhir baris di PDF, dipakai agar judul dan isi tidak menempel jadi satu kalimat.
    let text = '';
    for (const item of content.items) {
      if (!('str' in item)) continue;
      text += item.str;
      text += item.hasEOL ? '\n' : ' ';
    }
    pages.push(`--- Halaman ${i} ---\n${text.replace(/[ \t]+/g, ' ').trim()}`);
  }
  await doc.destroy();
  return pages.join('\n\n');
}

export async function extractText(file) {
  const ext = extensionOf(file.name);
  if (!ALLOWED_EXT.includes(ext)) {
    throw new ExtractError(`Format .${ext || 'tanpa ekstensi'} belum didukung.`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ExtractError('Berkas melebihi 15 MB. Pecah dokumen menjadi bagian lebih kecil.');
  }

  const text = ext === 'pdf' ? await readPdf(file) : await file.text();
  const clean = text.replace(/\u0000/g, '').trim();
  if (clean.length < 40) {
    throw new ExtractError(
      ext === 'pdf'
        ? 'PDF ini tidak memuat teks yang bisa dibaca. Kemungkinan hasil pindai, jadi tempelkan teksnya secara manual.'
        : 'Isi berkas terlalu pendek untuk dijadikan modul.'
    );
  }
  return clean;
}

/**
 * PDF to Image Converter Tool
 * Export PDF pages as PNG, JPEG, or WebP images
 */

const pdfjsPromise = import('../../../vendor/pdf.mjs').then(m => {
  m.GlobalWorkerOptions.workerSrc = new URL('../../../vendor/pdf.worker.mjs', import.meta.url).href;
  return m;
});

export default {
  id: 'pdf-to-image',
  title: 'PDF to Images',
  description: 'Export every page as a PNG, JPG or WEBP image',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><circle cx="12" cy="8" r="2"/></svg>`,
  category: 'pdf',
  accept: '.pdf',
  single: true,
  hints: 'Choose one PDF. Encrypted PDFs must be unlocked before use.',
  order: 4,
  limitations: 'Conversion creates raster images. Text, links, forms and vector content become pixels. Encrypted files must be unlocked first.',
  optionsSchema: {
    format: {
      type: 'select',
      label: 'Output Format',
      default: 'image/png',
      options: [
        { value: 'image/png', label: 'PNG (lossless, transparency)' },
        { value: 'image/jpeg', label: 'JPG (smaller, no transparency)' },
        { value: 'image/webp', label: 'WEBP (modern, efficient)' }
      ],
      description: 'Image format for output'
    },
    dpi: {
      type: 'select',
      label: 'Resolution (DPI)',
      default: '150',
      options: [
        { value: '72', label: '72 DPI (screen)' },
        { value: '150', label: '150 DPI (standard)' },
        { value: '300', label: '300 DPI (print)' }
      ],
      description: 'Higher DPI = larger, sharper images'
    },
    pages: {
      type: 'text',
      label: 'Page Range (optional)',
      default: '',
      placeholder: 'e.g. 1, 3-5 (blank = all pages)',
      description: 'Leave blank to convert all pages'
    }
  },

  init() {},
  cleanup() {},

  validate(files) {
    if (!files.length) return { valid: false, error: 'Choose a PDF file first.' };
    if (files.length > 1) return { valid: false, error: 'Choose only one PDF for this tool.' };
    if (files[0].type !== 'application/pdf' && !files[0].name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: 'File must be a PDF.' };
    }
    return { valid: true };
  },

  async process(files, options, onProgress, cancelled) {
    const pdfjs = await pdfjsPromise;
    const file = files[0];
    const format = options.format;
    const dpi = parseInt(options.dpi, 10);
    const pagesInput = options.pages;

    const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!IMAGE_TYPES.includes(format)) throw new Error('Unsupported output format.');

    onProgress?.('Loading PDF…');
    cancelled?.();

    const arrayBuffer = await file.arrayBuffer();
    const task = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer), isEvalSupported: false });
    const doc = await task.promise;

    if (doc.numPages === 0) {
      await doc.destroy();
      throw new Error('PDF has no pages.');
    }

    let indices;
    if (pagesInput.trim()) {
      indices = parsePages(pagesInput, doc.numPages);
    } else {
      indices = Array.from({ length: doc.numPages }, (_, i) => i);
    }

    const scale = dpi / 72;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const ext = format.split('/')[1].replace('jpeg', 'jpg');
    const results = [];

    function parsePages(value, count) {
      if (!String(value || '').trim()) throw new Error('Enter page numbers, for example 1, 3-5, 8.');
      const out = [];
      for (const part of value.split(',')) {
        const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
        if (!match) throw new Error('Enter pages like 1, 3-5, 8.');
        const start = Number(match[1]);
        const end = Number(match[2] || match[1]);
        if (start < 1 || end < start || end > count) throw new Error(`Pages must be between 1 and ${count}.`);
        for (let n = start; n <= end; n++) if (!out.includes(n - 1)) out.push(n - 1);
      }
      return out;
    }

    try {
      for (let i = 0; i < indices.length; i++) {
        cancelled?.();
        onProgress?.(`Rendering page ${i + 1} of ${indices.length}…`);

        const page = await doc.getPage(indices[i] + 1);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(viewport.width));
        canvas.height = Math.max(1, Math.round(viewport.height));

        try {
          await page.render({ canvasContext: canvas.getContext('2d'), viewport, background: 'white' }).promise;

          const blob = await new Promise(resolve => canvas.toBlob(resolve, format, format === 'image/jpeg' ? 0.92 : undefined));
          if (!blob || blob.type !== format) throw new Error('Canvas toBlob failed');

          results.push({
            name: `${baseName}-page-${indices[i] + 1}.${ext}`,
            blob
          });
        } finally {
          canvas.width = canvas.height = 0;
          page.cleanup();
        }
      }

      await doc.destroy();
      return results;
    } catch (error) {
      await doc.destroy();
      throw error;
    }
  }
};
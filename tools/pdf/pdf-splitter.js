/**
 * PDF Splitter & Page Extractor Tool
 * Extract pages or split into individual files
 */

import { PDFDocument } from 'pdf-lib';

function parsePages(value, count, allowRepeats = false) {
  if (!String(value || '').trim()) throw new Error('Enter page numbers, for example 1, 3-5, 8.');
  const out = [];
  for (const part of value.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('Enter pages like 1, 3-5, 8.');
    const start = Number(match[1]);
    const end = Number(match[2] || match[1]);
    if (start < 1 || end < start || end > count) throw new Error(`Pages must be between 1 and ${count}.`);
    for (let n = start; n <= end; n++) {
      if (allowRepeats || !out.includes(n - 1)) out.push(n - 1);
    }
  }
  return out;
}

export default {
  id: 'pdf-splitter',
  title: 'Split PDF',
  description: 'Extract pages or save every page as a separate PDF',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M12 4v16"/></svg>`,
  category: 'pdf',
  accept: '.pdf',
  single: true,
  hints: 'Choose one PDF. Encrypted PDFs must be unlocked before use.',
  order: 3,
  limitations: 'Splitting preserves page content but may invalidate digital signatures on the split pages. Encrypted files must be unlocked first.',
  optionsSchema: {
    mode: {
      type: 'select',
      label: 'Split Mode',
      default: 'extract',
      options: [
        { value: 'extract', label: 'Extract selected pages into one PDF' },
        { value: 'split', label: 'Split into individual page PDFs' }
      ],
      description: 'How to split the document'
    },
    pages: {
      type: 'text',
      label: 'Pages to Extract',
      default: '1',
      placeholder: 'e.g. 1, 3-5, 8',
      description: 'Page numbers or ranges (only used in Extract mode)'
    }
  },

  init(workspace) {
    const modeSelect = workspace.options.querySelector('#opt-mode');
    const pagesInput = workspace.options.querySelector('#opt-pages').closest('.form-group');
    if (modeSelect && pagesInput) {
      modeSelect.addEventListener('change', () => {
        pagesInput.style.display = modeSelect.value === 'extract' ? 'block' : 'none';
      });
      pagesInput.style.display = modeSelect.value === 'extract' ? 'block' : 'none';
    }
  },

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
    const file = files[0];
    const mode = options.mode;
    const pagesInput = options.pages;

    onProgress?.('Loading PDF…');
    cancelled?.();

    const arrayBuffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    if (doc.isEncrypted) {
      throw new Error('PDF is encrypted. Please unlock it first.');
    }

    const count = doc.getPageCount();
    const baseName = file.name.replace(/\.pdf$/i, '');

    if (mode === 'split') {
      // Split into individual pages
      const results = [];
      for (let i = 0; i < count; i++) {
        cancelled?.();
        onProgress?.(`Splitting page ${i + 1} of ${count}…`);

        const single = await PDFDocument.create();
        const [page] = await single.copyPages(doc, [i]);
        single.addPage(page);
        const bytes = await single.save();
        results.push({
          name: `${baseName}-page-${i + 1}.pdf`,
          blob: new Blob([bytes], { type: 'application/pdf' })
        });
      }
      return results;
    } else {
      // Extract selected pages
      const indices = parsePages(pagesInput, count, true);
      if (!indices.length) throw new Error('No valid pages selected.');

      const out = await PDFDocument.create();
      for (let i = 0; i < indices.length; i++) {
        cancelled?.();
        onProgress?.(`Extracting page ${i + 1} of ${indices.length}…`);
        const [page] = await out.copyPages(doc, [indices[i]]);
        out.addPage(page);
      }

      const bytes = await out.save();
      return [{
        name: `${baseName}-pages.pdf`,
        blob: new Blob([bytes], { type: 'application/pdf' })
      }];
    }
  }
};
/**
 * PDF Merger Tool
 * Combine multiple PDFs in chosen order
 */

import { PDFDocument } from 'pdf-lib';

export default {
  id: 'pdf-merger',
  title: 'Merge PDFs',
  description: 'Combine PDFs in your chosen file order',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`,
  category: 'pdf',
  accept: '.pdf',
  single: false,
  hints: 'Choose two or more PDFs and arrange their order. Encrypted PDFs must be unlocked before use.',
  order: 2,
  limitations: 'Merging preserves page content but may invalidate digital signatures. Encrypted files must be unlocked first. The output is a new PDF with all pages in the selected order.',
  optionsSchema: {},

  init() {},
  cleanup() {},

  validate(files) {
    if (files.length < 2) return { valid: false, error: 'Choose at least two PDFs to merge.' };
    for (const file of files) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        return { valid: false, error: `${file.name} is not a PDF.` };
      }
    }
    return { valid: true };
  },

  async process(files, options, onProgress, cancelled) {
    onProgress?.('Loading PDFs…');
    cancelled?.();

    const out = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      cancelled?.();
      onProgress?.(`Merging PDF ${i + 1} of ${files.length}…`);

      const arrayBuffer = await files[i].arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      if (doc.isEncrypted) {
        throw new Error(`${files[i].name} is encrypted. Please unlock it first.`);
      }

      const pages = await out.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => out.addPage(p));
    }

    cancelled?.();
    onProgress?.('Finalizing…');

    const mergedBytes = await out.save();
    const blob = new Blob([mergedBytes], { type: 'application/pdf' });

    return [{
      name: 'merged.pdf',
      blob
    }];
  }
};
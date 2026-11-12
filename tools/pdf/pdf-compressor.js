/**
 * PDF Compressor Tool
 * Reduces PDF file size through rasterization with quality controls
 */

import { PDFDocument } from 'pdf-lib';

// Module-relative vendor paths for GitHub Pages subdirectory and Live Server compatibility
const pdfjsUrl = new URL('../../vendor/pdf.mjs', import.meta.url);
const pdfjsWorkerUrl = new URL('../../vendor/pdf.worker.mjs', import.meta.url);

const pdfjsPromise = import(pdfjsUrl.href).then(m => {
  m.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl.href;
  return m;
});

export default {
  id: 'pdf-compressor',
  title: 'Compress PDF',
  description: 'Reduce scanned PDF size with quality controls',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16 3H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M12 8v8M8 12h8"/></svg>`,
  category: 'pdf',
  accept: '.pdf',
  single: true,
  hints: 'Choose one PDF. Encrypted PDFs must be unlocked before use. Compression works best on scanned documents.',
  order: 1,
  limitations: 'Compression creates image-only PDF pages. Searchable text, links, forms, tags and digital signatures are not preserved. Keep the original; a smaller size is not guaranteed for already-optimized or text-based PDFs.',
  optionsSchema: {
    quality: {
      type: 'select',
      label: 'Compression Quality',
      default: '0.7',
      options: [
        { value: '0.5', label: 'Low (smaller file, lower quality)' },
        { value: '0.7', label: 'Medium (balanced)' },
        { value: '0.85', label: 'High (better quality)' },
        { value: 'custom', label: 'Custom…' }
      ],
      description: 'JPEG quality for rasterized pages (0.1 - 1.0)'
    },
    customQuality: {
      type: 'number',
      label: 'Custom Quality',
      default: 0.7,
      min: 0.1,
      max: 1,
      step: 0.05,
      description: 'Used when "Custom" is selected above'
    },
    dimension: {
      type: 'select',
      label: 'Maximum Dimension',
      default: '8000',
      options: [
        { value: '8000', label: 'Original (up to 8000 px)' },
        { value: '3000', label: '3000 pixels' },
        { value: '2200', label: '2200 pixels' },
        { value: '1600', label: '1600 pixels' },
        { value: '1200', label: '1200 pixels' }
      ],
      description: 'Downscale pages larger than this'
    }
  },

  init(workspace) {
    // Add change listener for custom quality
    const qualitySelect = workspace.options.querySelector('#opt-quality');
    const customQualityInput = workspace.options.querySelector('#opt-customQuality');
    if (qualitySelect && customQualityInput) {
      qualitySelect.addEventListener('change', () => {
        customQualityInput.style.display = qualitySelect.value === 'custom' ? 'block' : 'none';
      });
      customQualityInput.style.display = qualitySelect.value === 'custom' ? 'block' : 'none';
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

  async process(file, options, onProgress, cancelled) {
    const pdfjs = await pdfjsPromise;
    const quality = options.quality === 'custom' ? options.customQuality : parseFloat(options.quality);
    const maxDimension = parseInt(options.dimension, 10);

    onProgress?.('Loading PDF…');
    cancelled?.();

    const arrayBuffer = await file.arrayBuffer();
    const task = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer), isEvalSupported: false });
    const doc = await task.promise;

    if (doc.numPages === 0) {
      await doc.destroy();
      throw new Error('PDF has no pages.');
    }

    onProgress?.(`Processing ${doc.numPages} page${doc.numPages !== 1 ? 's' : ''}…`);
    cancelled?.();

    const out = await PDFDocument.create();
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;

    try {
      for (let n = 1; n <= doc.numPages; n++) {
        cancelled?.();
        onProgress?.(`Rendering page ${n} of ${doc.numPages}…`);

        const page = await doc.getPage(n);
        const originalViewport = page.getViewport({ scale: 1 });
        totalOriginalSize += originalViewport.width * originalViewport.height * 4; // rough estimate

        const scale = Math.min(3, maxDimension / Math.max(originalViewport.width, originalViewport.height));
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(viewport.width));
        canvas.height = Math.max(1, Math.round(viewport.height));

        try {
          await page.render({
            canvasContext: canvas.getContext('2d'),
            viewport,
            background: 'white'
          }).promise;

          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
          if (!blob) throw new Error('Canvas toBlob failed');

          totalCompressedSize += blob.size;

          const img = await out.embedJpg(await blob.arrayBuffer());
          const newPage = out.addPage([originalViewport.width, originalViewport.height]);
          newPage.drawImage(img, { x: 0, y: 0, width: originalViewport.width, height: originalViewport.height });
        } finally {
          canvas.width = canvas.height = 0;
          page.cleanup();
        }
      }

      cancelled?.();
      onProgress?.('Finalizing…');

      const compressedBytes = await out.save();
      const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });

      await doc.destroy();

      const originalSize = file.size;
      const compressedSize = compressedBlob.size;
      const savings = originalSize > 0 ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : 0;

      // If no meaningful reduction, return original
      if (compressedSize >= originalSize * 0.95) {
        onProgress?.('The original is already smaller; preserving it.');
        return [{
          name: `${file.name.replace(/\.pdf$/i, '')}-original.pdf`,
          blob: file
        }];
      }

      return [{
        name: `${file.name.replace(/\.pdf$/i, '')}-compressed.pdf`,
        blob: compressedBlob
      }];
    } catch (error) {
      await doc.destroy();
      throw error;
    }
  }
};
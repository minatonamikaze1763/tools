/**
 * Images to PDF Tool
 * Combine images into a PDF document
 */

import { PDFDocument } from 'pdf-lib';

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  fit: null
};

const MARGINS = {
  none: 0,
  small: 24,
  medium: 48,
  large: 72
};

export default {
  id: 'images-to-pdf',
  title: 'Images to PDF',
  description: 'Combine photos and scans into one PDF',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M8 8l4 4 4-4"/><path d="M8 16l4-4 4 4"/></svg>`,
  category: 'pdf',
  accept: 'image/jpeg,image/png,image/webp',
  single: false,
  hints: 'Select JPG, PNG or WEBP images. Use the arrows to change file order.',
  order: 5,
  limitations: 'Images are placed on pages at the selected size. Very large images may be scaled down. No OCR or text extraction is performed.',
  optionsSchema: {
    pageSize: {
      type: 'select',
      label: 'Page Size',
      default: 'a4',
      options: [
        { value: 'a4', label: 'A4 (210 × 297 mm)' },
        { value: 'letter', label: 'Letter (8.5 × 11 in)' },
        { value: 'fit', label: 'Fit to image (no margins)' }
      ],
      description: 'Output page dimensions'
    },
    orientation: {
      type: 'select',
      label: 'Orientation',
      default: 'portrait',
      options: [
        { value: 'portrait', label: 'Portrait' },
        { value: 'landscape', label: 'Landscape' }
      ],
      description: 'Page orientation (ignored for Fit to image)'
    },
    margin: {
      type: 'select',
      label: 'Margins',
      default: 'medium',
      options: [
        { value: 'none', label: 'None (edge to edge)' },
        { value: 'small', label: 'Small (24 pt)' },
        { value: 'medium', label: 'Medium (48 pt)' },
        { value: 'large', label: 'Large (72 pt)' }
      ],
      description: 'Margin around images (ignored for Fit to image)'
    }
  },

  init() {},
  cleanup() {},

  validate(files) {
    if (!files.length) return { valid: false, error: 'Choose at least one image.' };
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        return { valid: false, error: `${file.name} is not a supported image format.` };
      }
    }
    return { valid: true };
  },

  async process(files, options, onProgress, cancelled) {
    const pageSize = PAGE_SIZES[options.pageSize];
    const orientation = options.orientation;
    const margin = MARGINS[options.margin];

    let pageWidth, pageHeight;
    if (pageSize) {
      if (orientation === 'landscape') {
        pageWidth = pageSize.height;
        pageHeight = pageSize.width;
      } else {
        pageWidth = pageSize.width;
        pageHeight = pageSize.height;
      }
    }

    const out = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      cancelled?.();
      onProgress?.(`Adding image ${i + 1} of ${files.length}…`);

      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();

      let img;
      if (file.type === 'image/jpeg') {
        img = await out.embedJpg(arrayBuffer);
      } else if (file.type === 'image/png') {
        img = await out.embedPng(arrayBuffer);
      } else {
        // Convert WebP to PNG via canvas
        const blob = await new Promise(resolve => {
          const imgEl = new Image();
          imgEl.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = imgEl.width;
            canvas.height = imgEl.height;
            canvas.getContext('2d').drawImage(imgEl, 0, 0);
            canvas.toBlob(resolve, 'image/png');
          };
          imgEl.src = URL.createObjectURL(file);
        });
        img = await out.embedPng(await blob.arrayBuffer());
      }

      let drawWidth, drawHeight, x, y;

      if (options.pageSize === 'fit') {
        // Fit page to image
        drawWidth = img.width;
        drawHeight = img.height;
        x = 0;
        y = 0;
        out.addPage([drawWidth, drawHeight]);
      } else {
        // Fit image within page with margins
        const maxW = pageWidth - margin * 2;
        const maxH = pageHeight - margin * 2;
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        drawWidth = img.width * ratio;
        drawHeight = img.height * ratio;
        x = margin + (pageWidth - margin * 2 - drawWidth) / 2;
        y = margin + (pageHeight - margin * 2 - drawHeight) / 2;
        out.addPage([pageWidth, pageHeight]);
      }

      const page = out.getPages()[out.getPageCount() - 1];
      page.drawImage(img, { x, y, width: drawWidth, height: drawHeight });
    }

    cancelled?.();
    onProgress?.('Finalizing…');

    const bytes = await out.save();
    return [{
      name: 'images.pdf',
      blob: new Blob([bytes], { type: 'application/pdf' })
    }];
  }
};
/**
 * Barcode Generator
 * Generate 1D and 2D barcodes (Code128, EAN, UPC, etc.)
 */

// Load bwip-js from vendor
let bwipjs = null;
async function loadBwipjs() {
  if (bwipjs) return bwipjs;
  // Load the minified bundle
  const script = document.createElement('script');
  script.src = '/tools/vendor/bwip-js.min.js';
  document.head.appendChild(script);
  await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
  });
  bwipjs = window.bwipjs;
  return bwipjs;
}

const BARCODE_TYPES = {
  code128: { label: 'Code 128', desc: 'Alphanumeric, variable length' },
  code39: { label: 'Code 39', desc: 'Alphanumeric, uppercase' },
  ean13: { label: 'EAN-13', desc: '13 digits (12 + check)' },
  ean8: { label: 'EAN-8', desc: '8 digits (7 + check)' },
  upca: { label: 'UPC-A', desc: '12 digits (11 + check)' },
  upce: { label: 'UPC-E', desc: '6 digits compressed' },
  isbn: { label: 'ISBN', desc: 'Book identifier (EAN-13 based)' },
  issn: { label: 'ISSN', desc: 'Serial identifier (EAN-13 based)' },
  datamatrix: { label: 'Data Matrix', desc: '2D, high density' },
  qrcode: { label: 'QR Code', desc: '2D, error correction' },
  pdf417: { label: 'PDF417', desc: '2D stacked, high capacity' },
  azteccode: { label: 'Aztec Code', desc: '2D, compact' },
  code93: { label: 'Code 93', desc: 'Alphanumeric, compact' },
  codabar: { label: 'Codabar', desc: 'Numeric + symbols' },
  itf14: { label: 'ITF-14', desc: '14 digits, shipping' },
  gs1databar: { label: 'GS1 DataBar', desc: 'Retail POS' }
};

export default {
  id: 'barcode-generator',
  title: 'Barcode Generator',
  description: 'Create 1D and 2D barcodes for products, inventory, logistics',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18"/></svg>`,
  category: 'text',
  accept: '',
  single: false,
  hints: '20+ barcode formats · customizable size, text, colors · PNG/SVG/PDF output',
  order: 15,
  limitations: 'Each format has specific data requirements (length, character set). Invalid data will show an error. 1D barcodes need adequate width for scanning.',
  optionsSchema: {
    type: {
      type: 'select',
      label: 'Barcode Type',
      default: 'code128',
      options: Object.entries(BARCODE_TYPES).map(([k, v]) => ({ value: k, label: v.label, description: v.desc })),
      description: 'Select barcode symbology'
    },
    data: {
      type: 'text',
      label: 'Data to Encode',
      default: '1234567890',
      description: 'Value to encode (format-specific rules apply)'
    },
    // 1D options
    height: {
      type: 'number',
      label: 'Bar Height (mm)',
      default: 25,
      min: 5,
      max: 100,
      step: 1,
      description: 'Height of bars (1D only)'
    },
    width: {
      type: 'number',
      label: 'Module Width (px)',
      default: 2,
      min: 1,
      max: 10,
      step: 1,
      description: 'Width of narrowest bar (1D) or module (2D)'
    },
    showText: {
      type: 'checkbox',
      label: 'Show Human-Readable Text',
      default: true,
      description: 'Display data below/above barcode'
    },
    textPosition: {
      type: 'select',
      label: 'Text Position',
      default: 'bottom',
      options: [
        { value: 'bottom', label: 'Below' },
        { value: 'top', label: 'Above' },
        { value: 'both', label: 'Both' },
        { value: 'none', label: 'Hidden' }
      ],
      description: 'Where to place human-readable text'
    },
    fontSize: {
      type: 'number',
      label: 'Font Size (pt)',
      default: 10,
      min: 6,
      max: 24,
      step: 1,
      description: 'Text size for human-readable'
    },
    // 2D options
    columns: {
      type: 'number',
      label: 'Columns (DataMatrix/QR)',
      default: 0,
      min: 0,
      max: 144,
      description: '0 = auto (2D only)'
    },
    rows: {
      type: 'number',
      label: 'Rows (DataMatrix/PDF417)',
      default: 0,
      min: 0,
      max: 90,
      description: '0 = auto (2D only)'
    },
    ecLevel: {
      type: 'select',
      label: 'Error Correction',
      default: 'M',
      options: [
        { value: 'L', label: 'Low (L)' },
        { value: 'M', label: 'Medium (M)' },
        { value: 'Q', label: 'Quartile (Q)' },
        { value: 'H', label: 'High (H)' }
      ],
      description: 'Error correction level (QR, DataMatrix, PDF417, Aztec)'
    },
    // Appearance
    backgroundColor: {
      type: 'color',
      label: 'Background Color',
      default: '#FFFFFF',
      description: 'Background color'
    },
    foregroundColor: {
      type: 'color',
      label: 'Bar/Foreground Color',
      default: '#000000',
      description: 'Bar/module color'
    },
    padding: {
      type: 'number',
      label: 'Padding (mm)',
      default: 10,
      min: 0,
      max: 50,
      step: 1,
      description: 'Quiet zone around barcode'
    },
    // Output
    format: {
      type: 'select',
      label: 'Output Format',
      default: 'png',
      options: [
        { value: 'png', label: 'PNG' },
        { value: 'svg', label: 'SVG' },
        { value: 'pdf', label: 'PDF' }
      ],
      description: 'Image format'
    },
    scale: {
      type: 'number',
      label: 'Scale Factor',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
      description: 'Render scale (higher = sharper)'
    },
    batchCount: {
      type: 'number',
      label: 'Batch Count',
      default: 1,
      min: 1,
      max: 100,
      description: 'Generate sequential codes (data + 001, 002...)'
    },
    batchStart: {
      type: 'number',
      label: 'Batch Start Number',
      default: 1,
      min: 0,
      max: 999999,
      description: 'Starting number for batch'
    },
    batchPad: {
      type: 'number',
      label: 'Batch Number Padding',
      default: 3,
      min: 1,
      max: 10,
      description: 'Zero-padding for batch numbers'
    }
  },

  init(workspace) {
    const typeSelect = workspace.options.querySelector('#opt-type');
    const is1D = (type) => !['datamatrix', 'qrcode', 'pdf417', 'azteccode'].includes(type);

    const groups = {
      '1d': ['height', 'showText', 'textPosition', 'fontSize'],
      '2d': ['columns', 'rows', 'ecLevel']
    };

    const updateVisibility = () => {
      const type = typeSelect.value;
      const oneD = is1D(type);

      Object.entries(groups).forEach(([k, fields]) => {
        const show = (k === '1d' && oneD) || (k === '2d' && !oneD);
        fields.forEach(f => {
          const el = workspace.options.querySelector(`#opt-${f}`)?.closest('.form-group');
          if (el) el.style.display = show ? 'block' : 'none';
        });
      });
    };

    typeSelect.addEventListener('change', updateVisibility);
    updateVisibility();
  },

  cleanup() {},

  validate() {
    return { valid: true };
  },

  async process(files, options, onProgress, cancelled) {
    const type = options.type;
    const baseData = options.data || '';
    const format = options.format;
    const scale = parseInt(options.scale, 10);
    const batchCount = parseInt(options.batchCount, 10);
    const batchStart = parseInt(options.batchStart, 10);
    const batchPad = parseInt(options.batchPad, 10);

    const bwipOpts = {
      bcid: type,
      text: baseData,
      scale,
      backgroundcolor: options.backgroundColor.replace('#', ''),
      color: options.foregroundColor.replace('#', ''),
      padding: parseInt(options.padding, 10) * 2.83, // mm to px at 72 DPI
    };

    if (['datamatrix', 'qrcode', 'pdf417', 'azteccode'].includes(type)) {
      // 2D specific
      if (options.columns) bwipOpts.columns = parseInt(options.columns, 10);
      if (options.rows) bwipOpts.rows = parseInt(options.rows, 10);
      bwipOpts.eclevel = options.ecLevel;
    } else {
      // 1D specific
      bwipOpts.height = parseInt(options.height, 10) * 2.83; // mm to px
      bwipOpts.width = parseInt(options.width, 10);
      bwipOpts.includetext = options.showText && options.textPosition !== 'none';
      bwipOpts.textxalign = 'center';
      if (options.textPosition === 'top') bwipOpts.textposition = 'top';
      else if (options.textPosition === 'both') bwipOpts.textposition = 'both';
      bwipOpts.fontsize = parseInt(options.fontSize, 10);
    }

    const results = [];

    for (let i = 0; i < batchCount; i++) {
      cancelled?.();
      onProgress?.(`Generating barcode ${i + 1} of ${batchCount}…`);

      const num = batchStart + i;
      const paddedNum = String(num).padStart(batchPad, '0');
      const data = baseData.includes('{num}') ? baseData.replace('{num}', paddedNum) : baseData + paddedNum;

      const opts = { ...bwipOpts, text: data };

      try {
        if (format === 'svg') {
          const svg = await bwipjs.toSVG(opts);
          results.push({
            name: `barcode-${type}-${paddedNum}.svg`,
            blob: new Blob([svg], { type: 'image/svg+xml' })
          });
        } else {
          const png = await bwipjs.toBuffer(opts);
          if (format === 'pdf') {
            const { PDFDocument } = await import('pdf-lib');
            const pdf = await PDFDocument.create();
            const page = pdf.addPage([png.width, png.height]);
            const img = await pdf.embedPng(png);
            page.drawImage(img, { x: 0, y: 0, width: png.width, height: png.height });
            const bytes = await pdf.save();
            results.push({
              name: `barcode-${type}-${paddedNum}.pdf`,
              blob: new Blob([bytes], { type: 'application/pdf' })
            });
          } else {
            results.push({
              name: `barcode-${type}-${paddedNum}.png`,
              blob: new Blob([png], { type: 'image/png' })
            });
          }
        }
      } catch (e) {
        results.push({
          name: `barcode-${type}-${paddedNum}-error.txt`,
          blob: new Blob([`Error: ${e.message}\nData: ${data}`], { type: 'text/plain' })
        });
      }
    }

    return results;
  }
};
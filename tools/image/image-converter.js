/**
 * Image Format Converter Tool
 * Convert between JPEG, PNG, WebP
 */

export default {
  id: 'image-converter',
  title: 'Convert Image Format',
  description: 'Convert images between JPG, PNG, and WEBP',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M8 8l8 8M16 8l-8 8"/></svg>`,
  category: 'image',
  accept: 'image/jpeg,image/png,image/webp',
  single: false,
  hints: 'JPG, PNG or WEBP · up to 20 files · 25 MB per file',
  order: 8,
  limitations: 'JPG does not support transparency (white background used). PNG and WEBP preserve transparency. Converting to JPG from PNG/WEBP loses transparency.',
  optionsSchema: {
    format: {
      type: 'select',
      label: 'Output Format',
      default: 'image/png',
      options: [
        { value: 'image/jpeg', label: 'JPG (smaller, no transparency)' },
        { value: 'image/png', label: 'PNG (lossless, transparency)' },
        { value: 'image/webp', label: 'WEBP (modern, efficient, transparency)' }
      ],
      description: 'Target format for all images'
    },
    quality: {
      type: 'select',
      label: 'Quality (JPG/WEBP)',
      default: '0.92',
      options: [
        { value: '1', label: 'Maximum · 100%' },
        { value: '0.92', label: 'High · 92%' },
        { value: '0.8', label: 'Balanced · 80%' },
        { value: '0.6', label: 'Medium · 60%' }
      ],
      description: 'Compression quality for lossy formats'
    },
    background: {
      type: 'color',
      label: 'Background Color (for JPG)',
      default: '#FFFFFF',
      description: 'Color to replace transparency when converting to JPG'
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
    const format = options.format;
    const quality = parseFloat(options.quality);
    const bgColor = options.background || '#FFFFFF';

    const results = [];

    for (let i = 0; i < files.length; i++) {
      cancelled?.();
      onProgress?.(`Converting image ${i + 1} of ${files.length}…`);

      const file = files[i];
      const bitmap = await createImageBitmap(file);
      const w = bitmap.width;
      const h = bitmap.height;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      // Fill background for JPG (no transparency support)
      if (format === 'image/jpeg') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();

      const q = format === 'image/png' ? undefined : quality;
      const blob = await new Promise(r => canvas.toBlob(r, format, q));

      if (!blob) throw new Error('Conversion failed.');

      const ext = format.split('/')[1].replace('jpeg', 'jpg');
      const baseName = file.name.replace(/\.[^.]+$/, '');
      results.push({
        name: `${baseName}.${ext}`,
        blob
      });

      canvas.width = canvas.height = 0;
    }

    return results;
  }
};
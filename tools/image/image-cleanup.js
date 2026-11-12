/**
 * Image Cleanup & Enhancement Tool
 * Adjust brightness, contrast, sharpness, grayscale, threshold
 */

export default {
  id: 'image-cleanup',
  title: 'Cleanup & Enhance',
  description: 'Adjust brightness, contrast, sharpness, apply filters',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M12 8v8M8 12h8"/><path d="M12 4a8 8 0 0 1 0 16"/></svg>`,
  category: 'image',
  accept: 'image/jpeg,image/png,image/webp',
  single: false,
  hints: 'JPG, PNG or WEBP · up to 20 files · 25 MB per file',
  order: 10,
  limitations: 'Filters are applied uniformly to all images. Heavy sharpening may introduce artifacts. Grayscale removes color information permanently. Original files are never modified.',
  optionsSchema: {
    brightness: {
      type: 'range',
      label: 'Brightness',
      default: 0,
      min: -100,
      max: 100,
      step: 1,
      description: 'Adjust image brightness (-100 to +100)'
    },
    contrast: {
      type: 'range',
      label: 'Contrast',
      default: 0,
      min: -100,
      max: 100,
      step: 1,
      description: 'Adjust image contrast (-100 to +100)'
    },
    saturation: {
      type: 'range',
      label: 'Saturation',
      default: 0,
      min: -100,
      max: 100,
      step: 1,
      description: 'Adjust color intensity (-100 = grayscale, +100 = vivid)'
    },
    sharpness: {
      type: 'range',
      label: 'Sharpness',
      default: 0,
      min: 0,
      max: 100,
      step: 1,
      description: 'Sharpen image (0 = none, 100 = maximum)'
    },
    grayscale: {
      type: 'checkbox',
      label: 'Convert to grayscale',
      default: false,
      description: 'Remove all color information'
    },
    threshold: {
      type: 'range',
      label: 'Threshold (B&W)',
      default: 0,
      min: 0,
      max: 255,
      step: 1,
      description: 'Convert to black & white using threshold (0 = disabled)'
    },
    preset: {
      type: 'select',
      label: 'Document Preset',
      default: 'none',
      options: [
        { value: 'none', label: 'Custom' },
        { value: 'scan', label: 'Document Scan (high contrast B&W)' },
        { value: 'photo', label: 'Photo Enhance (auto levels)' },
        { value: 'fax', label: 'Fax/Print (high contrast)' },
        { value: 'sketch', label: 'Pencil Sketch' }
      ],
      description: 'Quick presets for common cleanup tasks'
    },
    format: {
      type: 'select',
      label: 'Output Format',
      default: 'original',
      options: [
        { value: 'original', label: 'Keep original' },
        { value: 'image/jpeg', label: 'JPG' },
        { value: 'image/png', label: 'PNG' },
        { value: 'image/webp', label: 'WEBP' }
      ],
      description: 'Convert all images to this format'
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
    }
  },

  init(workspace) {
    const presetSelect = workspace.options.querySelector('#opt-preset');
    const controls = ['brightness', 'contrast', 'saturation', 'sharpness', 'grayscale', 'threshold']
      .map(f => workspace.options.querySelector(`#opt-${f}`)?.closest('.form-group'))
      .filter(Boolean);

    const applyPreset = () => {
      const preset = presetSelect.value;
      let values = {};

      switch (preset) {
        case 'scan':
          values = { brightness: 10, contrast: 50, saturation: -100, sharpness: 30, grayscale: true, threshold: 180 };
          break;
        case 'photo':
          values = { brightness: 5, contrast: 20, saturation: 15, sharpness: 20, grayscale: false, threshold: 0 };
          break;
        case 'fax':
          values = { brightness: 0, contrast: 80, saturation: -100, sharpness: 40, grayscale: true, threshold: 160 };
          break;
        case 'sketch':
          values = { brightness: 20, contrast: 60, saturation: -100, sharpness: 50, grayscale: true, threshold: 0 };
          break;
        default:
          values = { brightness: 0, contrast: 0, saturation: 0, sharpness: 0, grayscale: false, threshold: 0 };
      }

      Object.entries(values).forEach(([key, val]) => {
        const input = workspace.options.querySelector(`#opt-${key}`);
        if (input) {
          input.value = val;
          if (input.type === 'checkbox') input.checked = val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      // Show/hide threshold based on grayscale
      const thresholdGroup = workspace.options.querySelector('#opt-threshold').closest('.form-group');
      if (thresholdGroup) {
        thresholdGroup.style.display = values.grayscale || values.threshold > 0 ? 'block' : 'none';
      }
    };

    presetSelect.addEventListener('change', applyPreset);

    // Show threshold when grayscale is checked
    const grayscaleInput = workspace.options.querySelector('#opt-grayscale');
    const thresholdGroup = workspace.options.querySelector('#opt-threshold')?.closest('.form-group');
    if (grayscaleInput && thresholdGroup) {
      grayscaleInput.addEventListener('change', () => {
        thresholdGroup.style.display = grayscaleInput.checked ? 'block' : 'none';
      });
    }
  },

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
    const brightness = parseInt(options.brightness, 10);
    const contrast = parseInt(options.contrast, 10);
    const saturation = parseInt(options.saturation, 10);
    const sharpness = parseInt(options.sharpness, 10);
    const grayscale = options.grayscale;
    const threshold = parseInt(options.threshold, 10);
    const outputFormat = options.format === 'original' ? null : options.format;
    const quality = parseFloat(options.quality);

    const results = [];

    for (let i = 0; i < files.length; i++) {
      cancelled?.();
      onProgress?.(`Enhancing image ${i + 1} of ${files.length}…`);

      const file = files[i];
      const bitmap = await createImageBitmap(file);
      const w = bitmap.width;
      const h = bitmap.height;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      // Apply adjustments
      const b = brightness * 2.55; // -255 to +255
      const c = (contrast + 100) / 100; // 0 to 2
      const s = (saturation + 100) / 100; // 0 to 2

      for (let j = 0; j < data.length; j += 4) {
        let r = data[j];
        let g = data[j + 1];
        let bl = data[j + 2];

        // Brightness
        r += b;
        g += b;
        bl += b;

        // Contrast
        r = (r - 128) * c + 128;
        g = (g - 128) * c + 128;
        bl = (bl - 128) * c + 128;

        // Saturation
        const gray = 0.299 * r + 0.587 * g + 0.114 * bl;
        r = gray + (r - gray) * s;
        g = gray + (g - gray) * s;
        bl = gray + (bl - gray) * s;

        // Clamp
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        bl = Math.max(0, Math.min(255, bl));

        // Grayscale
        if (grayscale) {
          const lum = 0.299 * r + 0.587 * g + 0.114 * bl;
          r = g = bl = lum;
        }

        // Threshold (B&W)
        if (threshold > 0) {
          const lum = 0.299 * r + 0.587 * g + 0.114 * bl;
          const val = lum >= threshold ? 255 : 0;
          r = g = bl = val;
        }

        data[j] = r;
        data[j + 1] = g;
        data[j + 2] = bl;
      }

      ctx.putImageData(imageData, 0, 0);

      // Sharpness - apply unsharp mask
      if (sharpness > 0) {
        const strength = sharpness / 100 * 1.5;
        const radius = Math.max(1, Math.min(3, sharpness / 30));

        // Simple sharpening kernel
        const sharpCanvas = document.createElement('canvas');
        sharpCanvas.width = w;
        sharpCanvas.height = h;
        const sharpCtx = sharpCanvas.getContext('2d');
        sharpCtx.drawImage(canvas, 0, 0);

        // Create blurred version for unsharp mask
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = w;
        blurCanvas.height = h;
        const blurCtx = blurCanvas.getContext('2d');
        blurCtx.filter = `blur(${radius}px)`;
        blurCtx.drawImage(sharpCanvas, 0, 0);

        // Unsharp mask: original + (original - blurred) * strength
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = 'none';

        const sharpData = sharpCtx.getImageData(0, 0, w, h);
        const blurData = blurCtx.getImageData(0, 0, w, h);
        const outData = ctx.getImageData(0, 0, w, h);

        for (let j = 0; j < data.length; j += 4) {
          for (let c = 0; c < 3; c++) {
            const original = sharpData.data[j + c];
            const blurred = blurData.data[j + c];
            outData.data[j + c] = Math.max(0, Math.min(255, original + (original - blurred) * strength));
          }
        }

        ctx.putImageData(outData, 0, 0);
      }

      const format = outputFormat || file.type;
      const q = format === 'image/png' ? undefined : quality;
      const blob = await new Promise(r => canvas.toBlob(r, format, q));

      if (!blob) throw new Error('Enhancement failed.');

      const ext = format.split('/')[1].replace('jpeg', 'jpg');
      const baseName = file.name.replace(/\.[^.]+$/, '');
      results.push({
        name: `${baseName}-enhanced.${ext}`,
        blob
      });

      canvas.width = canvas.height = 0;
    }

    return results;
  }
};
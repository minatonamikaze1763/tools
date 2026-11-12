/**
 * Smart Image Compressor Tool
 * Compress JPEG, PNG, WebP with quality presets and target size mode
 */

export default {
  id: 'image-compressor',
  title: 'Compress Images',
  description: 'Smaller JPG/PNG/WEBP files with quality controls',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16 3H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M12 8v8M8 12h8"/></svg>`,
  category: 'image',
  accept: 'image/jpeg,image/png,image/webp',
  single: false,
  hints: 'JPG, PNG or WEBP · up to 20 files · 25 MB per file',
  order: 6,
  limitations: 'Compression is lossy for JPEG/WebP. PNG compression is lossless but limited. Original files are never modified.',
  optionsSchema: {
    mode: {
      type: 'select',
      label: 'Compression Mode',
      default: 'quality',
      options: [
        { value: 'quality', label: 'Quality preset' },
        { value: 'target', label: 'Target file size (KB)' }
      ],
      description: 'Choose how to control compression'
    },
    quality: {
      type: 'select',
      label: 'Quality Preset',
      default: '0.8',
      options: [
        { value: '1', label: 'Maximum · 100%' },
        { value: '0.92', label: 'High · 92%' },
        { value: '0.8', label: 'Balanced · 80%' },
        { value: '0.6', label: 'Medium · 60%' },
        { value: '0.4', label: 'Small · 40%' },
        { value: 'custom', label: 'Custom…' }
      ],
      description: 'JPEG/WebP quality (1.0 = best quality)'
    },
    customQuality: {
      type: 'range',
      label: 'Custom Quality',
      default: 0.8,
      min: 0.1,
      max: 1,
      step: 0.05,
      description: 'Used when "Custom" is selected'
    },
    targetKB: {
      type: 'number',
      label: 'Target Size (KB)',
      default: 200,
      min: 10,
      max: 25000,
      description: 'Target file size per image (JPEG only)'
    },
    format: {
      type: 'select',
      label: 'Output Format',
      default: 'original',
      options: [
        { value: 'original', label: 'Keep original format' },
        { value: 'image/jpeg', label: 'JPG' },
        { value: 'image/png', label: 'PNG' },
        { value: 'image/webp', label: 'WEBP' }
      ],
      description: 'Convert all images to this format'
    },
    maxDimension: {
      type: 'select',
      label: 'Max Dimension',
      default: '0',
      options: [
        { value: '0', label: 'Original' },
        { value: '3000', label: '3000 px' },
        { value: '2200', label: '2200 px' },
        { value: '1600', label: '1600 px' },
        { value: '1200', label: '1200 px' }
      ],
      description: 'Downscale images larger than this'
    }
  },

  init(workspace) {
    const modeSelect = workspace.options.querySelector('#opt-mode');
    const qualityGroup = workspace.options.querySelector('#opt-quality').closest('.form-group');
    const customQualityGroup = workspace.options.querySelector('#opt-customQuality').closest('.form-group');
    const targetGroup = workspace.options.querySelector('#opt-targetKB').closest('.form-group');

    const updateVisibility = () => {
      const isQuality = modeSelect.value === 'quality';
      qualityGroup.style.display = isQuality ? 'block' : 'none';
      customQualityGroup.style.display = isQuality && modeSelect.value === 'custom' ? 'block' : 'none';
      targetGroup.style.display = !isQuality ? 'block' : 'none';
    };

    modeSelect.addEventListener('change', updateVisibility);
    workspace.options.querySelector('#opt-quality').addEventListener('change', updateVisibility);
    updateVisibility();
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
    const mode = options.mode;
    const quality = options.quality === 'custom' ? options.customQuality : parseFloat(options.quality);
    const targetKB = parseInt(options.targetKB, 10);
    const outputFormat = options.format === 'original' ? null : options.format;
    const maxDimension = parseInt(options.maxDimension, 10);

    const results = [];

    for (let i = 0; i < files.length; i++) {
      cancelled?.();
      onProgress?.(`Compressing image ${i + 1} of ${files.length}…`);

      const file = files[i];
      const bitmap = await createImageBitmap(file);

      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      let w = bitmap.width;
      let h = bitmap.height;

      // Apply max dimension
      if (maxDimension > 0 && Math.max(w, h) > maxDimension) {
        const ratio = maxDimension / Math.max(w, h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(bitmap, 0, 0, w, h);
      bitmap.close();

      let blob;
      let format = outputFormat || file.type;

      if (mode === 'target' && format === 'image/jpeg') {
        // Binary search for target size
        const targetBytes = targetKB * 1024;
        let low = 0.1, high = 1, bestBlob = null;

        for (let attempt = 0; attempt < 12; attempt++) {
          const mid = (low + high) / 2;
          const testBlob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', mid));
          if (testBlob.size <= targetBytes) {
            bestBlob = testBlob;
            low = mid;
          } else {
            high = mid;
          }
          if (high - low < 0.01) break;
        }

        if (bestBlob) {
          blob = bestBlob;
        } else {
          // Downscale and retry
          let scale = 0.9;
          while (scale > 0.2) {
            const newCanvas = document.createElement('canvas');
            newCanvas.width = Math.max(1, Math.round(w * scale));
            newCanvas.height = Math.max(1, Math.round(h * scale));
            const newCtx = newCanvas.getContext('2d');
            newCtx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
            canvas.width = canvas.height = 0;
            canvas = newCanvas;
            ctx = newCtx;
            w = canvas.width;
            h = canvas.height;

            for (let attempt = 0; attempt < 8; attempt++) {
              const mid = (low + high) / 2;
              const testBlob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', mid));
              if (testBlob.size <= targetBytes) {
                bestBlob = testBlob;
                low = mid;
              } else {
                high = mid;
              }
            }
            if (bestBlob) break;
            scale *= 0.85;
          }
          blob = bestBlob;
        }

        if (!blob) throw new Error(`Could not reach ${targetKB} KB. Choose a larger limit.`);
      } else {
        // Standard quality compression
        const q = format === 'image/png' ? undefined : quality;
        blob = await new Promise(r => canvas.toBlob(r, format, q));
      }

      if (!blob) throw new Error('Compression failed.');

      const ext = format.split('/')[1].replace('jpeg', 'jpg');
      const baseName = file.name.replace(/\.[^.]+$/, '');
      results.push({
        name: `${baseName}-compressed.${ext}`,
        blob
      });

      canvas.width = canvas.height = 0;
    }

    return results;
  }
};
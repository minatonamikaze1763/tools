/**
 * Image Resizer & Cropper Tool
 * Resize by dimensions, percentage, with interactive cropper
 */

const PRESETS = {
  instagram: { w: 1080, h: 1080 },
  hd: { w: 1920, h: 1080 },
  '4k': { w: 3840, h: 2160 },
  passport: { w: 600, h: 600 },
  idcard: { w: 1008, h: 648 },
  thumbnail: { w: 320, h: 180 },
  square: { w: 512, h: 512 }
};

export default {
  id: 'image-resizer',
  title: 'Resize & Crop Images',
  description: 'Set exact dimensions, crop, or scale images',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M12 4v16"/></svg>`,
  category: 'image',
  accept: 'image/jpeg,image/png,image/webp',
  single: false,
  hints: 'JPG, PNG or WEBP · up to 20 files · 25 MB per file',
  order: 7,
  limitations: 'Resizing may reduce quality when upscaling. Cropping applies the same region to all selected images. Original files are never modified.',
  optionsSchema: {
    mode: {
      type: 'select',
      label: 'Resize Mode',
      default: 'dimensions',
      options: [
        { value: 'dimensions', label: 'Exact dimensions' },
        { value: 'percentage', label: 'Percentage scale' },
        { value: 'preset', label: 'Common preset' },
        { value: 'crop', label: 'Crop to region' }
      ],
      description: 'How to resize or crop'
    },
    width: {
      type: 'number',
      label: 'Width (pixels)',
      default: 1200,
      min: 1,
      max: 8000,
      required: true,
      description: 'Output width'
    },
    height: {
      type: 'number',
      label: 'Height (pixels)',
      default: 800,
      min: 1,
      max: 8000,
      description: 'Output height (auto if aspect locked)'
    },
    keepAspect: {
      type: 'checkbox',
      label: 'Keep aspect ratio',
      default: true,
      description: 'Width controls size, height calculated automatically'
    },
    percentage: {
      type: 'number',
      label: 'Scale (%)',
      default: 100,
      min: 1,
      max: 500,
      step: 1,
      description: 'Percentage of original size'
    },
    preset: {
      type: 'select',
      label: 'Preset',
      default: 'instagram',
      options: Object.entries(PRESETS).map(([k, v]) => ({ value: k, label: `${k.charAt(0).toUpperCase() + k.slice(1)} (${v.w}×${v.h})` })),
      description: 'Common dimensions'
    },
    cropX: {
      type: 'number',
      label: 'Crop X (left)',
      default: 0,
      min: 0,
      description: 'Left edge of crop region'
    },
    cropY: {
      type: 'number',
      label: 'Crop Y (top)',
      default: 0,
      min: 0,
      description: 'Top edge of crop region'
    },
    cropWidth: {
      type: 'number',
      label: 'Crop Width',
      default: 400,
      min: 1,
      required: true,
      description: 'Width of crop region'
    },
    cropHeight: {
      type: 'number',
      label: 'Crop Height',
      default: 400,
      min: 1,
      required: true,
      description: 'Height of crop region'
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
    const modeSelect = workspace.options.querySelector('#opt-mode');
    const groups = {
      dimensions: ['width', 'height', 'keepAspect'],
      percentage: ['percentage'],
      preset: ['preset'],
      crop: ['cropX', 'cropY', 'cropWidth', 'cropHeight']
    };

    const toggleGroups = () => {
      const mode = modeSelect.value;
      Object.entries(groups).forEach(([m, fields]) => {
        const show = m === mode;
        fields.forEach(f => {
          const el = workspace.options.querySelector(`#opt-${f}`)?.closest('.form-group');
          if (el) el.style.display = show ? 'block' : 'none';
        });
      });
      // Update crop guide
      if (mode === 'crop') {
        workspace.cropGuide.hidden = false;
      } else {
        workspace.cropGuide.hidden = true;
      }
    };

    modeSelect.addEventListener('change', toggleGroups);

    // Aspect ratio lock
    const widthInput = workspace.options.querySelector('#opt-width');
    const heightInput = workspace.options.querySelector('#opt-height');
    const keepAspectInput = workspace.options.querySelector('#opt-keepAspect');

    if (widthInput && heightInput && keepAspectInput) {
      let aspectRatio = 1;
      widthInput.addEventListener('input', () => {
        if (keepAspectInput.checked && aspectRatio) {
          heightInput.value = Math.round(widthInput.value / aspectRatio);
        }
      });
      // Update aspect ratio from first image
      const checkAspect = () => {
        if (workspace.files[0]?.type?.startsWith('image/')) {
          createImageBitmap(workspace.files[0]).then(b => {
            aspectRatio = b.width / b.height;
            b.close();
            if (keepAspectInput.checked) {
              heightInput.value = Math.round(widthInput.value / aspectRatio);
            }
          }).catch(() => {});
        }
      };
      // Call when files change
      const originalHandleFiles = workspace.handleFilesChange;
      workspace.handleFilesChange = (files) => {
        originalHandleFiles.call(workspace, files);
        checkAspect();
      };
    }

    toggleGroups();
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
    const outputFormat = options.format === 'original' ? null : options.format;
    const quality = parseFloat(options.quality);

    const results = [];

    for (let i = 0; i < files.length; i++) {
      cancelled?.();
      onProgress?.(`Processing image ${i + 1} of ${files.length}…`);

      const file = files[i];
      const bitmap = await createImageBitmap(file);
      const origW = bitmap.width;
      const origH = bitmap.height;

      let w, h, cropX = 0, cropY = 0, cropW = origW, cropH = origH;

      if (mode === 'dimensions') {
        w = parseInt(options.width, 10);
        h = options.keepAspect ? Math.round(origH * w / origW) : parseInt(options.height, 10);
      } else if (mode === 'percentage') {
        const pct = parseFloat(options.percentage) / 100;
        w = Math.round(origW * pct);
        h = Math.round(origH * pct);
      } else if (mode === 'preset') {
        const preset = PRESETS[options.preset];
        w = preset.w;
        h = preset.h;
      } else if (mode === 'crop') {
        cropX = Math.min(Math.max(0, parseInt(options.cropX, 10)), origW - 1);
        cropY = Math.min(Math.max(0, parseInt(options.cropY, 10)), origH - 1);
        cropW = Math.min(parseInt(options.cropWidth, 10), origW - cropX);
        cropH = Math.min(parseInt(options.cropHeight, 10), origH - cropY);
        w = cropW;
        h = cropH;
      }

      if (w * h > 40000000) {
        bitmap.close();
        throw new Error(`Output too large (${w}×${h}). Reduce dimensions.`);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, cropX, cropY, cropW, cropH, 0, 0, w, h);
      bitmap.close();

      const format = outputFormat || file.type;
      const q = format === 'image/png' ? undefined : quality;
      const blob = await new Promise(r => canvas.toBlob(r, format, q));

      if (!blob) throw new Error('Processing failed.');

      const ext = format.split('/')[1].replace('jpeg', 'jpg');
      const baseName = file.name.replace(/\.[^.]+$/, '');
      let suffix = mode === 'crop' ? 'cropped' : mode === 'preset' ? options.preset : 'resized';
      results.push({
        name: `${baseName}-${suffix}.${ext}`,
        blob
      });

      canvas.width = canvas.height = 0;
    }

    return results;
  }
};
/**
 * Image Watermark & Signature Tool
 * Add text or image watermark with positioning controls
 */

export default {
  id: 'image-watermark',
  title: 'Watermark Images',
  description: 'Add text or image watermark to photos',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M12 8v8M8 12h8"/></svg>`,
  category: 'image',
  accept: 'image/jpeg,image/png,image/webp',
  single: false,
  hints: 'JPG, PNG or WEBP · up to 20 files · 25 MB per file',
  order: 9,
  limitations: 'Watermark is applied to all selected images. Text watermark uses system fonts. Image watermark should be PNG with transparency for best results.',
  optionsSchema: {
    type: {
      type: 'select',
      label: 'Watermark Type',
      default: 'text',
      options: [
        { value: 'text', label: 'Text watermark' },
        { value: 'image', label: 'Image watermark' }
      ],
      description: 'Choose watermark type'
    },
    text: {
      type: 'text',
      label: 'Watermark Text',
      default: '© NDC',
      maxlength: 120,
      required: true,
      description: 'Text to use as watermark'
    },
    fontSize: {
      type: 'range',
      label: 'Font Size (%)',
      default: 5,
      min: 1,
      max: 20,
      description: 'Size as percentage of image width'
    },
    opacity: {
      type: 'range',
      label: 'Opacity (%)',
      default: 50,
      min: 0,
      max: 100,
      description: 'Watermark transparency'
    },
    rotation: {
      type: 'range',
      label: 'Rotation (degrees)',
      default: -15,
      min: -180,
      max: 180,
      step: 1,
      description: 'Rotate watermark'
    },
    position: {
      type: 'select',
      label: 'Position',
      default: 'bottom-right',
      options: [
        { value: 'top-left', label: 'Top Left' },
        { value: 'top-center', label: 'Top Center' },
        { value: 'top-right', label: 'Top Right' },
        { value: 'middle-left', label: 'Middle Left' },
        { value: 'center', label: 'Center' },
        { value: 'middle-right', label: 'Middle Right' },
        { value: 'bottom-left', label: 'Bottom Left' },
        { value: 'bottom-center', label: 'Bottom Center' },
        { value: 'bottom-right', label: 'Bottom Right' },
        { value: 'tile', label: 'Tile (repeat)' }
      ],
      description: 'Where to place the watermark'
    },
    watermarkImage: {
      type: 'file',
      label: 'Watermark Image (PNG recommended)',
      accept: 'image/png,image/jpeg,image/webp',
      description: 'Upload an image to use as watermark'
    },
    imageScale: {
      type: 'range',
      label: 'Image Scale (%)',
      default: 20,
      min: 5,
      max: 50,
      description: 'Watermark image size as percentage of image width'
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
        { value: '0.8', label: 'Balanced · 80%' }
      ],
      description: 'Compression quality for lossy formats'
    }
  },

  init(workspace) {
    const typeSelect = workspace.options.querySelector('#opt-type');
    const textGroup = workspace.options.querySelector('#opt-text').closest('.form-group');
    const textOptionsGroups = ['fontSize', 'opacity', 'rotation', 'position'].map(f => workspace.options.querySelector(`#opt-${f}`)?.closest('.form-group')).filter(Boolean);
    const imageGroup = workspace.options.querySelector('#opt-watermarkImage').closest('.form-group');
    const imageOptionsGroups = ['imageScale', 'opacity', 'rotation', 'position'].map(f => workspace.options.querySelector(`#opt-${f}`)?.closest('.form-group')).filter(Boolean);

    const toggleType = () => {
      const isText = typeSelect.value === 'text';
      textGroup.style.display = isText ? 'block' : 'none';
      textOptionsGroups.forEach(g => g.style.display = isText ? 'block' : 'none');
      imageGroup.style.display = !isText ? 'block' : 'none';
      imageOptionsGroups.forEach(g => g.style.display = !isText ? 'block' : 'none');
    };

    typeSelect.addEventListener('change', toggleType);
    toggleType();
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
    const type = options.type;
    const outputFormat = options.format === 'original' ? null : options.format;
    const quality = parseFloat(options.quality);
    const opacity = parseInt(options.opacity, 10) / 100;
    const rotation = parseInt(options.rotation, 10);
    const position = options.position;

    // Load watermark image if needed
    let watermarkBitmap = null;
    if (type === 'image' && options.watermarkImage) {
      watermarkBitmap = await createImageBitmap(options.watermarkImage);
    }

    const results = [];

    for (let i = 0; i < files.length; i++) {
      cancelled?.();
      onProgress?.(`Watermarking image ${i + 1} of ${files.length}…`);

      const file = files[i];
      const bitmap = await createImageBitmap(file);
      const w = bitmap.width;
      const h = bitmap.height;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      // Draw original image
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();

      // Apply watermark
      ctx.globalAlpha = opacity;

      if (type === 'text') {
        const text = options.text;
        const fontSize = Math.max(12, Math.round(w * parseInt(options.fontSize, 10) / 100));
        ctx.font = `600 ${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;

        let x, y;
        const padding = fontSize * 0.5;

        switch (position) {
          case 'top-left': x = padding; y = padding + textHeight; break;
          case 'top-center': x = (w - textWidth) / 2; y = padding + textHeight; break;
          case 'top-right': x = w - textWidth - padding; y = padding + textHeight; break;
          case 'middle-left': x = padding; y = (h + textHeight) / 2; break;
          case 'center': x = (w - textWidth) / 2; y = (h + textHeight) / 2; break;
          case 'middle-right': x = w - textWidth - padding; y = (h + textHeight) / 2; break;
          case 'bottom-left': x = padding; y = h - padding; break;
          case 'bottom-center': x = (w - textWidth) / 2; y = h - padding; break;
          case 'bottom-right': x = w - textWidth - padding; y = h - padding; break;
          case 'tile':
            // Tile pattern
            const tileSpacing = fontSize * 3;
            for (let ty = -textHeight; ty < h + textHeight; ty += tileSpacing) {
              for (let tx = -textWidth; tx < w + textWidth; tx += textWidth + padding * 2) {
                ctx.save();
                ctx.translate(tx + textWidth/2, ty + textHeight/2);
                ctx.rotate(rotation * Math.PI / 180);
                ctx.fillText(text, -textWidth/2, textHeight/4);
                ctx.restore();
              }
            }
            break;
        }

        if (position !== 'tile') {
          ctx.save();
          ctx.translate(x + textWidth/2, y - textHeight/2);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.fillText(text, -textWidth/2, textHeight/4);
          ctx.restore();
        }
      } else if (watermarkBitmap) {
        const wmW = watermarkBitmap.width;
        const wmH = watermarkBitmap.height;
        const scale = (w * parseInt(options.imageScale, 10) / 100) / wmW;
        const drawW = Math.round(wmW * scale);
        const drawH = Math.round(wmH * scale);

        let x, y;
        switch (position) {
          case 'top-left': x = 10; y = 10; break;
          case 'top-center': x = (w - drawW) / 2; y = 10; break;
          case 'top-right': x = w - drawW - 10; y = 10; break;
          case 'middle-left': x = 10; y = (h - drawH) / 2; break;
          case 'center': x = (w - drawW) / 2; y = (h - drawH) / 2; break;
          case 'middle-right': x = w - drawW - 10; y = (h - drawH) / 2; break;
          case 'bottom-left': x = 10; y = h - drawH - 10; break;
          case 'bottom-center': x = (w - drawW) / 2; y = h - drawH - 10; break;
          case 'bottom-right': x = w - drawW - 10; y = h - drawH - 10; break;
          case 'tile':
            const spacingX = drawW * 1.5;
            const spacingY = drawH * 1.5;
            for (let ty = -drawH; ty < h + drawH; ty += spacingY) {
              for (let tx = -drawW; tx < w + drawW; tx += spacingX) {
                ctx.save();
                ctx.translate(tx + drawW/2, ty + drawH/2);
                ctx.rotate(rotation * Math.PI / 180);
                ctx.drawImage(watermarkBitmap, -drawW/2, -drawH/2, drawW, drawH);
                ctx.restore();
              }
            }
            break;
        }

        if (position !== 'tile') {
          ctx.save();
          ctx.translate(x + drawW/2, y + drawH/2);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.drawImage(watermarkBitmap, -drawW/2, -drawH/2, drawW, drawH);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      const format = outputFormat || file.type;
      const q = format === 'image/png' ? undefined : quality;
      const blob = await new Promise(r => canvas.toBlob(r, format, q));

      if (!blob) throw new Error('Watermarking failed.');

      const ext = format.split('/')[1].replace('jpeg', 'jpg');
      const baseName = file.name.replace(/\.[^.]+$/, '');
      results.push({
        name: `${baseName}-watermarked.${ext}`,
        blob
      });

      canvas.width = canvas.height = 0;
    }

    if (watermarkBitmap) watermarkBitmap.close();
    return results;
  }
};
/**
 * File Organizer
 * Rename, sort, organize files by rules
 */

export default {
  id: 'file-organizer',
  title: 'File Organizer',
  description: 'Rename, sort, and organize files in bulk',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M8 12h8M12 8v8"/></svg>`,
  category: 'dev',
  accept: '*/*',
  single: false,
  hints: 'Any files · up to 200 files · rename, sort, organize by metadata',
  order: 20,
  limitations: 'Runs in browser - files are returned as downloads, not written to disk. EXIF/metadata extraction for images only.',
  optionsSchema: {
    mode: {
      type: 'select',
      label: 'Operation',
      default: 'rename',
      options: [
        { value: 'rename', label: 'Rename Files' },
        { value: 'sort', label: 'Sort & Number' },
        { value: 'organize', label: 'Organize by Type/Date' },
        { value: 'metadata', label: 'Extract Metadata' }
      ],
      description: 'What to do with the files'
    },
    // Rename options
    pattern: {
      type: 'text',
      label: 'Name Pattern',
      default: '{name}_{index}',
      description: 'Tokens: {name}, {ext}, {index}, {date}, {time}, {size}, {width}, {height}, {hash}'
    },
    startIndex: {
      type: 'number',
      label: 'Start Index',
      default: 1,
      min: 0,
      max: 10000,
      step: 1,
      description: 'Starting number for {index}'
    },
    padIndex: {
      type: 'number',
      label: 'Index Padding',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
      description: 'Zero-pad index (e.g., 3 = 001)'
    },
    caseOption: {
      type: 'select',
      label: 'Case',
      default: 'original',
      options: [
        { value: 'original', label: 'Keep original' },
        { value: 'lower', label: 'lowercase' },
        { value: 'upper', label: 'UPPERCASE' },
        { value: 'title', label: 'Title Case' }
      ],
      description: 'Case transformation for new names'
    },
    replacePattern: {
      type: 'text',
      label: 'Find (regex)',
      default: '',
      description: 'Regex pattern to find in filename'
    },
    replaceWith: {
      type: 'text',
      label: 'Replace with',
      default: '',
      description: 'Replacement string ($1, $2 for groups)'
    },
    addPrefix: {
      type: 'text',
      label: 'Add Prefix',
      default: '',
      description: 'Text to prepend to filename'
    },
    addSuffix: {
      type: 'text',
      label: 'Add Suffix',
      default: '',
      description: 'Text to append before extension'
    },

    // Sort options
    sortBy: {
      type: 'select',
      label: 'Sort By',
      default: 'name',
      options: [
        { value: 'name', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
        { value: 'size', label: 'Size (smallest first)' },
        { value: 'size-desc', label: 'Size (largest first)' },
        { value: 'date', label: 'Date modified (oldest first)' },
        { value: 'date-desc', label: 'Date modified (newest first)' },
        { value: 'type', label: 'File type' },
        { value: 'random', label: 'Random' }
      ],
      description: 'Sort order before numbering'
    },
    numberFiles: {
      type: 'checkbox',
      label: 'Add sequential numbers',
      default: true,
      description: 'Prefix files with 001, 002, etc.'
    },
    sortPrefix: {
      type: 'text',
      label: 'Number Prefix',
      default: '',
      description: 'Text before number (e.g., "img_")'
    },

    // Organize options
    organizeBy: {
      type: 'select',
      label: 'Organize By',
      default: 'type',
      options: [
        { value: 'type', label: 'File Type (images/, documents/, etc.)' },
        { value: 'date', label: 'Date (YYYY/MM/DD/)' },
        { value: 'extension', label: 'Extension (jpg/, png/, pdf/)' },
        { value: 'size', label: 'Size Range (small/, medium/, large/)' },
        { value: 'first-letter', label: 'First Letter (a/, b/, c/)' }
      ],
      description: 'How to group files into folders'
    },
    dateFormat: {
      type: 'select',
      label: 'Date Format',
      default: 'YYYY/MM/DD',
      options: [
        { value: 'YYYY/MM/DD', label: 'Year/Month/Day' },
        { value: 'YYYY-MM', label: 'Year-Month' },
        { value: 'YYYY', label: 'Year only' },
        { value: 'MM-DD', label: 'Month-Day' }
      ],
      description: 'Folder structure for date organization'
    },
    sizeThresholds: {
      type: 'text',
      label: 'Size Thresholds (KB)',
      default: '100,1000',
      description: 'Comma-separated: small < 100KB, medium < 1000KB, large >= 1000KB'
    },

    // Metadata
    metaFormat: {
      type: 'select',
      label: 'Output Format',
      default: 'json',
      options: [
        { value: 'json', label: 'JSON' },
        { value: 'csv', label: 'CSV' },
        { value: 'text', label: 'Text report' }
      ],
      description: 'Format for metadata output'
    },

    // General
    dryRun: {
      type: 'checkbox',
      label: 'Preview only (no files returned)',
      default: false,
      description: 'Show what would happen without generating output files'
    },
    outputFormat: {
      type: 'select',
      label: 'Output Format',
      default: 'zip',
      options: [
        { value: 'zip', label: 'ZIP archive' },
        { value: 'individual', label: 'Individual files' }
      ],
      description: 'How to return organized files'
    }
  },

  init(workspace) {
    const modeSelect = workspace.options.querySelector('#opt-mode');
    const groups = {
      rename: ['pattern', 'startIndex', 'padIndex', 'caseOption', 'replacePattern', 'replaceWith', 'addPrefix', 'addSuffix'],
      sort: ['sortBy', 'numberFiles', 'sortPrefix'],
      organize: ['organizeBy', 'dateFormat', 'sizeThresholds'],
      metadata: ['metaFormat']
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
    };

    modeSelect.addEventListener('change', toggleGroups);
    toggleGroups();
  },

  cleanup() {},

  validate(files) {
    if (!files.length) return { valid: false, error: 'Choose at least one file.' };
    return { valid: true };
  },

  async process(files, options, onProgress, cancelled) {
    const mode = options.mode;
    const dryRun = options.dryRun;
    const outputFormat = options.outputFormat;

    // Helper to get image dimensions
    const getImageMeta = async (file) => {
      if (!file.type.startsWith('image/')) return {};
      try {
        const bitmap = await createImageBitmap(file);
        const meta = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        return meta;
      } catch {
        return {};
      }
    };

    // Helper to compute simple hash
    const simpleHash = async (file) => {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let hash = 0;
      for (let i = 0; i < Math.min(bytes.length, 10000); i++) {
        hash = ((hash << 5) - hash) + bytes[i];
        hash |= 0;
      }
      return Math.abs(hash).toString(16).padStart(8, '0');
    };

    // Token replacement
    const applyPattern = (pattern, file, index, meta) => {
      const date = new Date(file.lastModified);
      const pad = (n, w) => String(n).padStart(w, '0');
      const name = file.name.replace(/\.[^.]+$/, '');
      const ext = file.name.split('.').pop().toLowerCase();

      return pattern
        .replace('{name}', name)
        .replace('{ext}', ext)
        .replace('{index}', pad(index, options.padIndex))
        .replace('{date}', `${date.getFullYear()}-${pad(date.getMonth()+1,2)}-${pad(date.getDate(),2)}`)
        .replace('{time}', `${pad(date.getHours(),2)}-${pad(date.getMinutes(),2)}-${pad(date.getSeconds(),2)}`)
        .replace('{size}', (file.size / 1024).toFixed(1) + 'KB')
        .replace('{width}', meta.width || '')
        .replace('{height}', meta.height || '')
        .replace('{hash}', meta.hash || '');
    };

    const applyCase = (str, caseOpt) => {
      switch (caseOpt) {
        case 'lower': return str.toLowerCase();
        case 'upper': return str.toUpperCase();
        case 'title': return str.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
        default: return str;
      }
    };

    const results = [];
    const fileMetas = [];

    // Pre-compute metadata
    for (let i = 0; i < files.length; i++) {
      cancelled?.();
      onProgress?.(`Analyzing ${files[i].name}…`);
      const meta = await getImageMeta(files[i]);
      meta.hash = await simpleHash(files[i]);
      fileMetas.push(meta);
    }

    let processedFiles = files.map((f, i) => ({ file: f, index: i, meta: fileMetas[i] }));

    if (mode === 'rename') {
      // Sort by name first for consistent indexing
      processedFiles.sort((a, b) => a.file.name.localeCompare(b.file.name));

      for (let i = 0; i < processedFiles.length; i++) {
        cancelled?.();
        onProgress?.(`Renaming ${i + 1} of ${processedFiles.length}…`);

        const { file, meta } = processedFiles[i];
        const idx = options.startIndex + i;

        let newName = applyPattern(options.pattern, file, idx, meta);

        // Apply find/replace
        if (options.replacePattern) {
          try {
            const re = new RegExp(options.replacePattern, 'g');
            newName = newName.replace(re, options.replaceWith);
          } catch (e) { /* ignore invalid regex */ }
        }

        // Apply prefix/suffix
        if (options.addPrefix) newName = options.addPrefix + newName;
        if (options.addSuffix) {
          const ext = '.' + newName.split('.').pop();
          const base = newName.slice(0, -ext.length);
          newName = base + options.addSuffix + ext;
        }

        // Apply case
        newName = applyCase(newName, options.caseOption);

        // Ensure extension
        if (!newName.includes('.')) newName += '.' + file.name.split('.').pop();

        processedFiles[i].newName = newName;
      }

      if (!dryRun) {
        if (outputFormat === 'zip') {
          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();
          for (const pf of processedFiles) {
            zip.file(pf.newName, pf.file);
          }
          const blob = await zip.generateAsync({ type: 'blob' });
          results.push({ name: 'renamed-files.zip', blob });
        } else {
          for (const pf of processedFiles) {
            results.push({ name: pf.newName, blob: pf.file });
          }
        }
      }

      // Always return report
      const report = processedFiles.map(pf => `${pf.file.name} -> ${pf.newName || '(unchanged)'}`).join('\n');
      results.push({ name: 'rename-report.txt', blob: new Blob([report], { type: 'text/plain' }) });

    } else if (mode === 'sort') {
      // Sort files
      switch (options.sortBy) {
        case 'name': processedFiles.sort((a, b) => a.file.name.localeCompare(b.file.name)); break;
        case 'name-desc': processedFiles.sort((a, b) => b.file.name.localeCompare(a.file.name)); break;
        case 'size': processedFiles.sort((a, b) => a.file.size - b.file.size); break;
        case 'size-desc': processedFiles.sort((a, b) => b.file.size - a.file.size); break;
        case 'date': processedFiles.sort((a, b) => a.file.lastModified - b.file.lastModified); break;
        case 'date-desc': processedFiles.sort((a, b) => b.file.lastModified - a.file.lastModified); break;
        case 'type': processedFiles.sort((a, b) => a.file.type.localeCompare(b.file.type)); break;
        case 'random': processedFiles.sort(() => Math.random() - 0.5); break;
      }

      for (let i = 0; i < processedFiles.length; i++) {
        cancelled?.();
        const { file, meta } = processedFiles[i];
        const idx = i + 1;

        let newName = file.name;
        if (options.numberFiles) {
          const ext = file.name.split('.').pop();
          const base = file.name.slice(0, -ext.length - 1);
          const prefix = options.sortPrefix || '';
          newName = `${prefix}${String(idx).padStart(3, '0')}_${base}.${ext}`;
        }
        processedFiles[i].newName = newName;
      }

      if (!dryRun) {
        if (outputFormat === 'zip') {
          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();
          for (const pf of processedFiles) {
            zip.file(pf.newName, pf.file);
          }
          const blob = await zip.generateAsync({ type: 'blob' });
          results.push({ name: 'sorted-files.zip', blob });
        } else {
          for (const pf of processedFiles) {
            results.push({ name: pf.newName, blob: pf.file });
          }
        }
      }

      const report = processedFiles.map((pf, i) => `${i + 1}. ${pf.file.name} -> ${pf.newName}`).join('\n');
      results.push({ name: 'sort-report.txt', blob: new Blob([report], { type: 'text/plain' }) });

    } else if (mode === 'organize') {
      const folders = new Map();

      for (let i = 0; i < processedFiles.length; i++) {
        cancelled?.();
        onProgress?.(`Organizing ${i + 1} of ${processedFiles.length}…`);

        const { file, meta } = processedFiles[i];
        let folder = '';

        switch (options.organizeBy) {
          case 'type': {
            if (file.type.startsWith('image/')) folder = 'images';
            else if (file.type.startsWith('video/')) folder = 'videos';
            else if (file.type.startsWith('audio/')) folder = 'audio';
            else if (file.type === 'application/pdf') folder = 'documents';
            else if (file.type.includes('word') || file.type.includes('document')) folder = 'documents';
            else if (file.type.includes('spreadsheet') || file.type.includes('excel')) folder = 'spreadsheets';
            else if (file.type.includes('presentation') || file.type.includes('powerpoint')) folder = 'presentations';
            else if (file.type.includes('zip') || file.type.includes('compressed')) folder = 'archives';
            else if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) folder = 'text';
            else if (file.type.includes('javascript') || file.type.includes('typescript') || file.name.match(/\.(js|ts|py|java|cpp|cs|go|rs)$/)) folder = 'code';
            else folder = 'other';
            break;
          }
          case 'date': {
            const date = new Date(file.lastModified);
            const pad = (n) => String(n).padStart(2, '0');
            const fmt = options.dateFormat;
            if (fmt === 'YYYY/MM/DD') folder = `${date.getFullYear()}/${pad(date.getMonth()+1)}/${pad(date.getDate())}`;
            else if (fmt === 'YYYY-MM') folder = `${date.getFullYear()}-${pad(date.getMonth()+1)}`;
            else if (fmt === 'YYYY') folder = String(date.getFullYear());
            else if (fmt === 'MM-DD') folder = `${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
            break;
          }
          case 'extension': {
            folder = file.name.split('.').pop().toLowerCase();
            break;
          }
          case 'size': {
            const kb = file.size / 1024;
            const thresholds = options.sizeThresholds.split(',').map(s => parseFloat(s.trim()));
            const [small, medium] = thresholds;
            if (kb < small) folder = 'small';
            else if (kb < medium) folder = 'medium';
            else folder = 'large';
            break;
          }
          case 'first-letter': {
            const first = file.name.charAt(0).toLowerCase();
            folder = /[a-z]/.test(first) ? first : 'other';
            break;
          }
        }

        if (!folders.has(folder)) folders.set(folder, []);
        folders.get(folder).push({ file, meta, originalName: file.name });
      }

      if (!dryRun) {
        if (outputFormat === 'zip') {
          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();
          for (const [folder, files] of folders) {
            for (const f of files) {
              zip.file(`${folder}/${f.originalName}`, f.file);
            }
          }
          const blob = await zip.generateAsync({ type: 'blob' });
          results.push({ name: 'organized-files.zip', blob });
        } else {
          for (const [folder, files] of folders) {
            for (const f of files) {
              results.push({ name: `${folder}/${f.originalName}`, blob: f.file });
            }
          }
        }
      }

      // Report
      let report = '';
      for (const [folder, files] of folders) {
        report += `\n${folder}/ (${files.length} files)\n`;
        for (const f of files) {
          report += `  ${f.originalName}\n`;
        }
      }
      results.push({ name: 'organize-report.txt', blob: new Blob([report.trim()], { type: 'text/plain' }) });

    } else if (mode === 'metadata') {
      const metaData = [];

      for (let i = 0; i < processedFiles.length; i++) {
        cancelled?.();
        onProgress?.(`Extracting metadata ${i + 1} of ${processedFiles.length}…`);

        const { file, meta } = processedFiles[i];
        const date = new Date(file.lastModified);

        metaData.push({
          name: file.name,
          type: file.type || 'unknown',
          size: file.size,
          sizeKB: (file.size / 1024).toFixed(1),
          modified: date.toISOString(),
          modifiedLocal: date.toLocaleString(),
          width: meta.width,
          height: meta.height,
          hash: meta.hash
        });
      }

      let output;
      if (options.metaFormat === 'json') {
        output = JSON.stringify(metaData, null, 2);
      } else if (options.metaFormat === 'csv') {
        const headers = ['name', 'type', 'size', 'sizeKB', 'modified', 'modifiedLocal', 'width', 'height', 'hash'];
        output = [headers.join(',')];
        for (const m of metaData) {
          output.push(headers.map(h => `"${String(m[h] || '').replace(/"/g, '""')}"`).join(','));
        }
        output = output.join('\n');
      } else {
        output = metaData.map(m =>
          `${m.name}\n  Type: ${m.type}\n  Size: ${m.sizeKB} KB\n  Modified: ${m.modifiedLocal}\n  Dimensions: ${m.width || 'N/A'} x ${m.height || 'N/A'}\n  Hash: ${m.hash}\n`
        ).join('\n');
      }

      const ext = options.metaFormat === 'json' ? 'json' : options.metaFormat === 'csv' ? 'csv' : 'txt';
      const mime = options.metaFormat === 'json' ? 'application/json' : options.metaFormat === 'csv' ? 'text/csv' : 'text/plain';
      results.push({ name: `metadata.${ext}`, blob: new Blob([output], { type: mime }) });
    }

    return results;
  }
};
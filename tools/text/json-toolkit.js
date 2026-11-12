/**
 * JSON Toolkit
 * Format, validate, query, transform JSON
 */

export default {
  id: 'json-toolkit',
  title: 'JSON Toolkit',
  description: 'Format, validate, query and transform JSON',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`,
  category: 'text',
  accept: '.json,text/json,application/json',
  single: false,
  hints: 'JSON files · up to 20 files · 5 MB per file',
  order: 12,
  limitations: 'Invalid JSON will be reported per file. JSONPath queries use a simplified syntax. Large files may take time to process.',
  optionsSchema: {
    mode: {
      type: 'select',
      label: 'Operation',
      default: 'format',
      options: [
        { value: 'format', label: 'Format / Pretty-print' },
        { value: 'minify', label: 'Minify (compact)' },
        { value: 'validate', label: 'Validate only' },
        { value: 'query', label: 'JSONPath query' },
        { value: 'transform', label: 'Transform (map/filter)' },
        { value: 'merge', label: 'Merge multiple files' },
        { value: 'diff', label: 'Diff two files' },
        { value: 'csv', label: 'Convert to CSV' },
        { value: 'schema', label: 'Generate JSON Schema' }
      ],
      description: 'What to do with the JSON'
    },
    indent: {
      type: 'select',
      label: 'Indentation',
      default: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
        { value: 'tab', label: 'Tab' }
      ],
      description: 'For formatted output'
    },
    query: {
      type: 'text',
      label: 'JSONPath Query',
      default: '$',
      description: 'Query expression (e.g., $.store.book[*].author, $..price)'
    },
    transformScript: {
      type: 'textarea',
      label: 'Transform Function (JS)',
      default: '/* Return transformed value */\nreturn data;',
      rows: 10,
      description: 'Arrow function receiving `data` (parsed JSON), return transformed data'
    },
    csvDelimiter: {
      type: 'select',
      label: 'CSV Delimiter',
      default: ',',
      options: [
        { value: ',', label: 'Comma (,)' },
        { value: ';', label: 'Semicolon (;)' },
        { value: '\t', label: 'Tab' },
        { value: '|', label: 'Pipe (|)' }
      ],
      description: 'For JSON to CSV conversion'
    },
    flatten: {
      type: 'checkbox',
      label: 'Flatten nested objects',
      default: true,
      description: 'Flatten nested properties with dot notation for CSV'
    }
  },

  init(workspace) {
    const modeSelect = workspace.options.querySelector('#opt-mode');
    const groups = {
      format: ['indent'],
      minify: [],
      validate: [],
      query: ['query'],
      transform: ['transformScript'],
      merge: [],
      diff: [],
      csv: ['csvDelimiter', 'flatten'],
      schema: []
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
    if (!files.length) return { valid: false, error: 'Choose at least one JSON file.' };
    return { valid: true };
  },

  async process(files, options, onProgress, cancelled) {
    const mode = options.mode;
    const indent = options.indent === 'tab' ? '\t' : parseInt(options.indent, 10);
    const query = options.query || '$';
    const transformScript = options.transformScript;
    const csvDelimiter = options.csvDelimiter || ',';
    const flatten = options.flatten;

    // Simple JSONPath implementation
    const jsonPath = (obj, path) => {
      if (path === '$') return [obj];
      const parts = path.split('.').filter(p => p);
      let current = [obj];
      for (const part of parts) {
        const next = [];
        for (const item of current) {
          if (part === '*') {
            if (Array.isArray(item)) next.push(...item);
            else if (item && typeof item === 'object') next.push(...Object.values(item));
          } else if (part.startsWith('[') && part.endsWith(']')) {
            const index = parseInt(part.slice(1, -1), 10);
            if (!isNaN(index) && Array.isArray(item) && item[index] !== undefined) {
              next.push(item[index]);
            }
          } else if (item && typeof item === 'object' && part in item) {
            next.push(item[part]);
          }
        }
        current = next;
        if (!current.length) break;
      }
      return current;
    };

    const flattenObject = (obj, prefix = '') => {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(result, flattenObject(value, newKey));
        } else {
          result[newKey] = value;
        }
      }
      return result;
    };

    const arrayToCSV = (arr, delimiter) => {
      if (!arr.length) return '';
      const flat = flatten ? arr.map(flattenObject) : arr;
      const headers = [...new Set(flat.flatMap(o => Object.keys(o)))];
      const rows = [headers.join(delimiter)];
      for (const obj of flat) {
        rows.push(headers.map(h => {
          const val = obj[h];
          if (val === null || val === undefined) return '';
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return str.includes(delimiter) || str.includes('"') || str.includes('\n')
            ? '"' + str.replace(/"/g, '""') + '"'
            : str;
        }).join(delimiter));
      }
      return rows.join('\n');
    };

    const generateSchema = (obj) => {
      const typeOf = (val) => {
        if (val === null) return 'null';
        if (Array.isArray(val)) return 'array';
        return typeof val;
      };

      const infer = (val) => {
        const t = typeOf(val);
        if (t === 'object') {
          const props = {};
          for (const [k, v] of Object.entries(val)) {
            props[k] = infer(v);
          }
          return { type: 'object', properties: props };
        }
        if (t === 'array') {
          if (val.length === 0) return { type: 'array', items: {} };
          return { type: 'array', items: infer(val[0]) };
        }
        return { type: t };
      };

      return infer(obj);
    };

    const results = [];
    const parsedFiles = [];

    // Parse all files first
    for (let i = 0; i < files.length; i++) {
      cancelled?.();
      onProgress?.(`Parsing ${files[i].name}…`);
      try {
        const text = await files[i].text();
        const data = JSON.parse(text);
        parsedFiles.push({ name: files[i].name, data, valid: true });
      } catch (e) {
        parsedFiles.push({ name: files[i].name, data: null, valid: false, error: e.message });
      }
    }

    if (mode === 'merge') {
      cancelled?.();
      onProgress?.('Merging files…');
      const merged = {};
      for (const pf of parsedFiles) {
        if (!pf.valid) continue;
        Object.assign(merged, pf.data);
      }
      const output = JSON.stringify(merged, null, indent);
      results.push({ name: 'merged.json', blob: new Blob([output], { type: 'application/json' }) });
    } else if (mode === 'diff') {
      if (parsedFiles.length < 2 || !parsedFiles[0].valid || !parsedFiles[1].valid) {
        throw new Error('Diff requires exactly two valid JSON files.');
      }
      const a = JSON.stringify(parsedFiles[0].data, null, indent).split('\n');
      const b = JSON.stringify(parsedFiles[1].data, null, indent).split('\n');
      const maxLen = Math.max(a.length, b.length);
      const diff = [];
      for (let i = 0; i < maxLen; i++) {
        const av = a[i], bv = b[i];
        if (av === bv) diff.push(`  ${av}`);
        else {
          if (av !== undefined) diff.push(`- ${av}`);
          if (bv !== undefined) diff.push(`+ ${bv}`);
        }
      }
      results.push({ name: 'diff.txt', blob: new Blob([diff.join('\n')], { type: 'text/plain' }) });
    } else {
      for (let i = 0; i < parsedFiles.length; i++) {
        cancelled?.();
        onProgress?.(`Processing ${parsedFiles[i].name}…`);

        const pf = parsedFiles[i];
        const baseName = pf.name.replace(/\.[^.]+$/, '');

        if (!pf.valid && mode !== 'validate') {
          results.push({ name: `${baseName}-error.txt`, blob: new Blob([pf.error], { type: 'text/plain' }) });
          continue;
        }

        let output;
        let mime = 'application/json';
        let ext = 'json';

        switch (mode) {
          case 'format':
            output = JSON.stringify(pf.data, null, indent);
            break;
          case 'minify':
            output = JSON.stringify(pf.data);
            break;
          case 'validate':
            output = pf.valid ? 'VALID' : `INVALID: ${pf.error}`;
            mime = 'text/plain';
            ext = 'txt';
            break;
          case 'query':
            const queryResults = jsonPath(pf.data, query);
            output = JSON.stringify(queryResults, null, indent);
            break;
          case 'transform':
            try {
              const fn = new Function('data', transformScript);
              const transformed = fn(pf.data);
              output = JSON.stringify(transformed, null, indent);
            } catch (e) {
              output = `Transform error: ${e.message}`;
              mime = 'text/plain';
              ext = 'txt';
            }
            break;
          case 'csv':
            if (Array.isArray(pf.data)) {
              output = arrayToCSV(pf.data, csvDelimiter);
            } else if (pf.data && typeof pf.data === 'object') {
              output = arrayToCSV([pf.data], csvDelimiter);
            } else {
              output = 'CSV conversion requires an array or object';
              mime = 'text/plain';
              ext = 'txt';
            }
            mime = 'text/csv';
            ext = 'csv';
            break;
          case 'schema':
            output = JSON.stringify(generateSchema(pf.data), null, indent);
            break;
        }

        results.push({ name: `${baseName}.${ext}`, blob: new Blob([output], { type: mime }) });
      }
    }

    return results;
  }
};
/**
 * Text Toolkit
 * Case transform, find/replace, regex, line ops, encoding, word count
 */

export default {
  id: 'text-toolkit',
  title: 'Text Toolkit',
  description: 'Transform, clean, and analyze text',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 6h16M4 12h16M4 18h10"/></svg>`,
  category: 'text',
  accept: 'text/plain,text/csv,text/markdown,.txt,.md,.csv,.json,.xml,.html,.css,.js,.ts,.py',
  single: false,
  hints: 'Text files · up to 50 files · 5 MB per file',
  order: 11,
  limitations: 'All operations apply to each file independently. Large files (>1 MB) may take longer. Regex operations use JavaScript regex engine.',
  optionsSchema: {
    operations: {
      type: 'multiselect',
      label: 'Operations (applied in order)',
      default: ['trim'],
      options: [
        { value: 'trim', label: 'Trim whitespace' },
        { value: 'normalize-space', label: 'Normalize whitespace (collapse multiple spaces)' },
        { value: 'remove-empty-lines', label: 'Remove empty lines' },
        { value: 'remove-duplicate-lines', label: 'Remove duplicate lines' },
        { value: 'sort-lines', label: 'Sort lines alphabetically' },
        { value: 'reverse-lines', label: 'Reverse line order' },
        { value: 'number-lines', label: 'Add line numbers' },
        { value: 'uppercase', label: 'UPPERCASE' },
        { value: 'lowercase', label: 'lowercase' },
        { value: 'title-case', label: 'Title Case' },
        { value: 'sentence-case', label: 'Sentence case' },
        { value: 'camel-case', label: 'camelCase' },
        { value: 'snake-case', label: 'snake_case' },
        { value: 'kebab-case', label: 'kebab-case' },
        { value: 'pascal-case', label: 'PascalCase' },
        { value: 'url-encode', label: 'URL Encode' },
        { value: 'url-decode', label: 'URL Decode' },
        { value: 'html-encode', label: 'HTML Encode' },
        { value: 'html-decode', label: 'HTML Decode' },
        { value: 'base64-encode', label: 'Base64 Encode' },
        { value: 'base64-decode', label: 'Base64 Decode' }
      ],
      description: 'Select one or more operations to apply'
    },
    find: {
      type: 'text',
      label: 'Find (regex supported)',
      default: '',
      description: 'Pattern to find (JavaScript regex)'
    },
    replace: {
      type: 'text',
      label: 'Replace with',
      default: '',
      description: 'Replacement string ($1, $2 for capture groups)'
    },
    regexFlags: {
      type: 'select',
      label: 'Regex Flags',
      default: 'g',
      options: [
        { value: 'g', label: 'Global (g)' },
        { value: 'gi', label: 'Global + Case-insensitive (gi)' },
        { value: 'gm', label: 'Global + Multiline (gm)' },
        { value: 'gim', label: 'Global + Case-insensitive + Multiline (gim)' }
      ],
      description: 'Flags for find/replace regex'
    },
    prefix: {
      type: 'text',
      label: 'Prefix each line',
      default: '',
      description: 'Text to prepend to each line'
    },
    suffix: {
      type: 'text',
      label: 'Suffix each line',
      default: '',
      description: 'Text to append to each line'
    },
    outputFormat: {
      type: 'select',
      label: 'Output Format',
      default: 'text',
      options: [
        { value: 'text', label: 'Plain text' },
        { value: 'json', label: 'JSON array of lines' },
        { value: 'csv', label: 'CSV (single column)' }
      ],
      description: 'Format for output file'
    }
  },

  init() {},

  cleanup() {},

  validate(files) {
    if (!files.length) return { valid: false, error: 'Choose at least one text file.' };
    return { valid: true };
  },

  async process(files, options, onProgress, cancelled) {
    const ops = Array.isArray(options.operations) ? options.operations : (options.operations ? [options.operations] : []);
    const find = options.find || '';
    const replace = options.replace || '';
    const flags = options.regexFlags || 'g';
    const prefix = options.prefix || '';
    const suffix = options.suffix || '';
    const outputFormat = options.outputFormat || 'text';

    const regex = find ? new RegExp(find, flags) : null;

    // Case transform functions
    const toTitleCase = (str) => str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    const toSentenceCase = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const toCamelCase = (str) => str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^./, c => c.toLowerCase());
    const toSnakeCase = (str) => str.replace(/[-\s]+/g, '_').replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '').replace(/__+/g, '_');
    const toKebabCase = (str) => str.replace(/[_\s]+/g, '-').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '').replace(/--+/g, '-');
    const toPascalCase = (str) => str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^./, c => c.toUpperCase());

    const htmlEncode = (str) => str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, ''');
    const htmlDecode = (str) => str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, "'");

    const results = [];

    for (let i = 0; i < files.length; i++) {
      cancelled?.();
      onProgress?.(`Processing ${files[i].name}…`);

      const text = await files[i].text();
      let lines = text.split(/\r?\n/);

      // Apply operations in order
      for (const op of ops) {
        cancelled?.();
        switch (op) {
          case 'trim':
            lines = lines.map(l => l.trim());
            break;
          case 'normalize-space':
            lines = lines.map(l => l.replace(/\s+/g, ' ').trim());
            break;
          case 'remove-empty-lines':
            lines = lines.filter(l => l.trim().length > 0);
            break;
          case 'remove-duplicate-lines':
            lines = [...new Set(lines)];
            break;
          case 'sort-lines':
            lines = lines.sort((a, b) => a.localeCompare(b));
            break;
          case 'reverse-lines':
            lines = lines.reverse();
            break;
          case 'number-lines':
            lines = lines.map((l, idx) => `${idx + 1}. ${l}`);
            break;
          case 'uppercase':
            lines = lines.map(l => l.toUpperCase());
            break;
          case 'lowercase':
            lines = lines.map(l => l.toLowerCase());
            break;
          case 'title-case':
            lines = lines.map(l => toTitleCase(l));
            break;
          case 'sentence-case':
            lines = lines.map(l => toSentenceCase(l));
            break;
          case 'camel-case':
            lines = lines.map(l => toCamelCase(l));
            break;
          case 'snake-case':
            lines = lines.map(l => toSnakeCase(l));
            break;
          case 'kebab-case':
            lines = lines.map(l => toKebabCase(l));
            break;
          case 'pascal-case':
            lines = lines.map(l => toPascalCase(l));
            break;
          case 'url-encode':
            lines = lines.map(l => encodeURIComponent(l));
            break;
          case 'url-decode':
            lines = lines.map(l => decodeURIComponent(l));
            break;
          case 'html-encode':
            lines = lines.map(l => htmlEncode(l));
            break;
          case 'html-decode':
            lines = lines.map(l => htmlDecode(l));
            break;
          case 'base64-encode':
            lines = lines.map(l => btoa(unescape(encodeURIComponent(l))));
            break;
          case 'base64-decode':
            lines = lines.map(l => decodeURIComponent(escape(atob(l))));
            break;
        }
      }

      // Find/Replace
      if (regex) {
        lines = lines.map(l => l.replace(regex, replace));
      }

      // Prefix/Suffix
      if (prefix || suffix) {
        lines = lines.map(l => prefix + l + suffix);
      }

      let output;
      const baseName = files[i].name.replace(/\.[^.]+$/, '');

      switch (outputFormat) {
        case 'json':
          output = JSON.stringify(lines, null, 2);
          results.push({ name: `${baseName}.json`, blob: new Blob([output], { type: 'application/json' }) });
          break;
        case 'csv':
          output = lines.map(l => `"${l.replace(/"/g, '""')}"`).join('\n');
          results.push({ name: `${baseName}.csv`, blob: new Blob([output], { type: 'text/csv' }) });
          break;
        default:
          output = lines.join('\n');
          results.push({ name: `${baseName}.txt`, blob: new Blob([output], { type: 'text/plain' }) });
      }
    }

    return results;
  }
};
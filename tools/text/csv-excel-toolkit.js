/**
 * CSV/Excel Toolkit
 * Convert, filter, transform CSV and Excel files
 */

import * as XLSX from 'xlsx';

export default {
  id: 'csv-excel-toolkit',
  title: 'CSV / Excel Toolkit',
  description: 'Convert, filter, transform CSV and Excel files',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/><path d="M16 8v8"/></svg>`,
  category: 'text',
  accept: '.csv,.tsv,.txt,.xlsx,.xls,text/csv,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
  single: false,
  hints: 'CSV, TSV, XLSX, XLS · up to 10 files · 10 MB per file',
  order: 13,
  limitations: 'Excel formulas are not preserved (values only). Large files (>100k rows) may be slow. Password-protected Excel files not supported.',
  optionsSchema: {
    mode: {
      type: 'select',
      label: 'Operation',
      default: 'convert',
      options: [
        { value: 'convert', label: 'Convert format' },
        { value: 'filter', label: 'Filter rows' },
        { value: 'select', label: 'Select columns' },
        { value: 'merge', label: 'Merge files' },
        { value: 'split', label: 'Split by column value' },
        { value: 'dedupe', label: 'Remove duplicates' },
        { value: 'pivot', label: 'Pivot table' },
        { value: 'stats', label: 'Column statistics' }
      ],
      description: 'What to do with the data'
    },
    outputFormat: {
      type: 'select',
      label: 'Output Format',
      default: 'csv',
      options: [
        { value: 'csv', label: 'CSV' },
        { value: 'tsv', label: 'TSV' },
        { value: 'xlsx', label: 'Excel (XLSX)' },
        { value: 'json', label: 'JSON' },
        { value: 'md', label: 'Markdown table' }
      ],
      description: 'Format for output file(s)'
    },
    delimiter: {
      type: 'select',
      label: 'Input Delimiter (CSV/TSV)',
      default: 'auto',
      options: [
        { value: 'auto', label: 'Auto-detect' },
        { value: ',', label: 'Comma (,)' },
        { value: ';', label: 'Semicolon (;)' },
        { value: '\t', label: 'Tab' },
        { value: '|', label: 'Pipe (|)' }
      ],
      description: 'Delimiter for reading CSV/TSV'
    },
    hasHeader: {
      type: 'checkbox',
      label: 'First row is header',
      default: true,
      description: 'Treat first row as column names'
    },
    filterColumn: {
      type: 'text',
      label: 'Filter Column',
      default: '',
      description: 'Column name to filter on'
    },
    filterOp: {
      type: 'select',
      label: 'Filter Operator',
      default: 'equals',
      options: [
        { value: 'equals', label: 'Equals' },
        { value: 'not-equals', label: 'Not equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'not-contains', label: 'Does not contain' },
        { value: 'starts-with', label: 'Starts with' },
        { value: 'ends-with', label: 'Ends with' },
        { value: 'gt', label: 'Greater than (number)' },
        { value: 'lt', label: 'Less than (number)' },
        { value: 'regex', label: 'Regex match' }
      ],
      description: 'How to compare filter value'
    },
    filterValue: {
      type: 'text',
      label: 'Filter Value',
      default: '',
      description: 'Value to filter by'
    },
    selectColumns: {
      type: 'text',
      label: 'Columns to Keep (comma-separated)',
      default: '',
      description: 'Leave empty to keep all columns'
    },
    mergeStrategy: {
      type: 'select',
      label: 'Merge Strategy',
      default: 'append',
      options: [
        { value: 'append', label: 'Append rows (same columns)' },
        { value: 'join', label: 'Join on key column' }
      ],
      description: 'How to combine multiple files'
    },
    joinKey: {
      type: 'text',
      label: 'Join Key Column',
      default: '',
      description: 'Column name to join on (for join strategy)'
    },
    splitColumn: {
      type: 'text',
      label: 'Split by Column',
      default: '',
      description: 'Create one file per unique value in this column'
    },
    dedupeColumns: {
      type: 'text',
      label: 'Dedupe Key Columns (comma-separated)',
      default: '',
      description: 'Columns to consider for duplicates (empty = all columns)'
    },
    pivotRow: {
      type: 'text',
      label: 'Pivot Row Column',
      default: '',
      description: 'Column for row headers'
    },
    pivotCol: {
      type: 'text',
      label: 'Pivot Column',
      default: '',
      description: 'Column for column headers'
    },
    pivotVal: {
      type: 'text',
      label: 'Pivot Value Column',
      default: '',
      description: 'Column for values (numeric)'
    },
    pivotAgg: {
      type: 'select',
      label: 'Aggregation',
      default: 'sum',
      options: [
        { value: 'sum', label: 'Sum' },
        { value: 'count', label: 'Count' },
        { value: 'avg', label: 'Average' },
        { value: 'min', label: 'Min' },
        { value: 'max', label: 'Max' }
      ],
      description: 'How to aggregate pivot values'
    }
  },

  init(workspace) {
    const modeSelect = workspace.options.querySelector('#opt-mode');
    const groups = {
      convert: ['outputFormat'],
      filter: ['filterColumn', 'filterOp', 'filterValue', 'outputFormat'],
      select: ['selectColumns', 'outputFormat'],
      merge: ['mergeStrategy', 'joinKey', 'outputFormat'],
      split: ['splitColumn', 'outputFormat'],
      dedupe: ['dedupeColumns', 'outputFormat'],
      pivot: ['pivotRow', 'pivotCol', 'pivotVal', 'pivotAgg', 'outputFormat'],
      stats: ['outputFormat']
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
    const validTypes = ['.csv', '.tsv', '.txt', '.xlsx', '.xls'];
    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!validTypes.includes(ext) && !file.type.includes('spreadsheet') && !file.type.includes('csv')) {
        return { valid: false, error: `${file.name} is not a supported format.` };
      }
    }
    return { valid: true };
  },

  async process(files, options, onProgress, cancelled) {
    const mode = options.mode;
    const outputFormat = options.outputFormat || 'csv';
    const delimiter = options.delimiter;
    const hasHeader = options.hasHeader;

    // Parse all files
    const workbooks = [];
    for (let i = 0; i < files.length; i++) {
      cancelled?.();
      onProgress?.(`Reading ${files[i].name}…`);
      const arrayBuffer = await files[i].arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
      workbooks.push({ name: files[i].name, wb });
    }

    // Convert workbook to array of arrays
    const wbToData = (wb) => {
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
    };

    const dataToWb = (data, header) => {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      return wb;
    };

    let allData = workbooks.map(w => wbToData(w.wb));
    const headers = hasHeader ? allData.map(d => d[0] || []) : allData.map(() => []);
    const rows = allData.map((d, i) => hasHeader ? d.slice(1) : d);

    let results = [];

    if (mode === 'convert') {
      for (let i = 0; i < workbooks.length; i++) {
        cancelled?.();
        const baseName = workbooks[i].name.replace(/\.[^.]+$/, '');
        const data = hasHeader ? [headers[i], ...rows[i]] : rows[i];
        const output = await exportData(data, outputFormat);
        results.push({ name: `${baseName}.${outputFormat}`, blob: output.blob, mime: output.mime });
      }
    } else if (mode === 'filter') {
      const colIdx = headers[0].indexOf(options.filterColumn);
      if (colIdx === -1) throw new Error(`Column "${options.filterColumn}" not found.`);
      const op = options.filterOp;
      const val = options.filterValue;

      const matches = (cell) => {
        const c = String(cell);
        const v = String(val);
        switch (op) {
          case 'equals': return c === v;
          case 'not-equals': return c !== v;
          case 'contains': return c.includes(v);
          case 'not-contains': return !c.includes(v);
          case 'starts-with': return c.startsWith(v);
          case 'ends-with': return c.endsWith(v);
          case 'gt': return parseFloat(c) > parseFloat(v);
          case 'lt': return parseFloat(c) < parseFloat(v);
          case 'regex': return new RegExp(v).test(c);
        }
      };

      for (let i = 0; i < workbooks.length; i++) {
        cancelled?.();
        const filtered = rows[i].filter(r => matches(r[colIdx]));
        const data = hasHeader ? [headers[i], ...filtered] : filtered;
        const baseName = workbooks[i].name.replace(/\.[^.]+$/, '');
        const output = await exportData(data, outputFormat);
        results.push({ name: `${baseName}-filtered.${outputFormat}`, blob: output.blob, mime: output.mime });
      }
    } else if (mode === 'select') {
      const cols = options.selectColumns.split(',').map(c => c.trim()).filter(Boolean);
      const indices = cols.map(c => headers[0].indexOf(c)).filter(idx => idx !== -1);
      if (!indices.length) throw new Error('No valid columns selected.');

      for (let i = 0; i < workbooks.length; i++) {
        cancelled?.();
        const selected = rows[i].map(r => indices.map(idx => r[idx]));
        const newHeaders = hasHeader ? indices.map(idx => headers[i][idx]) : [];
        const data = hasHeader ? [newHeaders, ...selected] : selected;
        const baseName = workbooks[i].name.replace(/\.[^.]+$/, '');
        const output = await exportData(data, outputFormat);
        results.push({ name: `${baseName}-selected.${outputFormat}`, blob: output.blob, mime: output.mime });
      }
    } else if (mode === 'merge') {
      cancelled?.();
      onProgress?.('Merging files…');
      if (options.mergeStrategy === 'append') {
        const mergedRows = [];
        let commonHeaders = headers[0];
        for (let i = 0; i < rows.length; i++) {
          // Align columns to first file's headers
          const aligned = rows[i].map(r => {
            const row = new Array(commonHeaders.length).fill('');
            for (let j = 0; j < headers[i].length; j++) {
              const idx = commonHeaders.indexOf(headers[i][j]);
              if (idx !== -1) row[idx] = r[j];
            }
            return row;
          });
          mergedRows.push(...aligned);
        }
        const data = hasHeader ? [commonHeaders, ...mergedRows] : mergedRows;
        const output = await exportData(data, outputFormat);
        results.push({ name: `merged.${outputFormat}`, blob: output.blob, mime: output.mime });
      } else {
        // Join strategy
        const key = options.joinKey;
        const keyIdx = headers[0].indexOf(key);
        if (keyIdx === -1) throw new Error(`Join key "${key}" not found in first file.`);

        const map = new Map();
        for (const row of rows[0]) {
          const keyVal = row[keyIdx];
          if (!map.has(keyVal)) map.set(keyVal, []);
          map.get(keyVal).push(row);
        }

        const merged = [];
        for (let i = 1; i < rows.length; i++) {
          const keyIdx2 = headers[i].indexOf(key);
          if (keyIdx2 === -1) continue;
          for (const row of rows[i]) {
            const keyVal = row[keyIdx2];
            if (map.has(keyVal)) {
              for (const baseRow of map.get(keyVal)) {
                merged.push([...baseRow, ...row]);
              }
            }
          }
        }

        const newHeaders = hasHeader ? [...headers[0], ...headers.slice(1).flat()] : [];
        const data = hasHeader ? [newHeaders, ...merged] : merged;
        const output = await exportData(data, outputFormat);
        results.push({ name: `joined.${outputFormat}`, blob: output.blob, mime: output.mime });
      }
    } else if (mode === 'split') {
      const colIdx = headers[0].indexOf(options.splitColumn);
      if (colIdx === -1) throw new Error(`Column "${options.splitColumn}" not found.`);

      const groups = new Map();
      for (let i = 0; i < rows.length; i++) {
        for (const row of rows[i]) {
          const key = String(row[colIdx] || 'empty');
          if (!groups.has(key)) groups.set(key, hasHeader ? [headers[i]] : []);
          groups.get(key).push(row);
        }
      }

      for (const [key, data] of groups) {
        cancelled?.();
        const safeKey = key.replace(/[^a-z0-9_-]/gi, '_').substring(0, 50);
        const output = await exportData(data, outputFormat);
        results.push({ name: `split_${safeKey}.${outputFormat}`, blob: output.blob, mime: output.mime });
      }
    } else if (mode === 'dedupe') {
      const keyCols = options.dedupeColumns.split(',').map(c => c.trim()).filter(Boolean);
      const keyIndices = keyCols.length ? keyCols.map(c => headers[0].indexOf(c)).filter(idx => idx !== -1) : null;

      for (let i = 0; i < workbooks.length; i++) {
        cancelled?.();
        const seen = new Set();
        const unique = [];
        for (const row of rows[i]) {
          const key = keyIndices ? keyIndices.map(idx => row[idx]).join('|') : row.join('|');
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(row);
          }
        }
        const data = hasHeader ? [headers[i], ...unique] : unique;
        const baseName = workbooks[i].name.replace(/\.[^.]+$/, '');
        const output = await exportData(data, outputFormat);
        results.push({ name: `${baseName}-deduped.${outputFormat}`, blob: output.blob, mime: output.mime });
      }
    } else if (mode === 'pivot') {
      const rowIdx = headers[0].indexOf(options.pivotRow);
      const colIdx = headers[0].indexOf(options.pivotCol);
      const valIdx = headers[0].indexOf(options.pivotVal);
      if (rowIdx === -1 || colIdx === -1 || valIdx === -1) throw new Error('Pivot columns not found.');

      const rowVals = new Set();
      const colVals = new Set();
      const dataMap = new Map();

      for (let i = 0; i < rows.length; i++) {
        for (const row of rows[i]) {
          const rv = String(row[rowIdx]);
          const cv = String(row[colIdx]);
          const v = parseFloat(row[valIdx]) || 0;
          rowVals.add(rv);
          colVals.add(cv);
          const key = `${rv}|${cv}`;
          if (!dataMap.has(key)) dataMap.set(key, []);
          dataMap.get(key).push(v);
        }
      }

      const sortedRows = [...rowVals].sort();
      const sortedCols = [...colVals].sort();
      const headerRow = ['', ...sortedCols];
      const pivotData = [headerRow];

      for (const rv of sortedRows) {
        const row = [rv];
        for (const cv of sortedCols) {
          const vals = dataMap.get(`${rv}|${cv}`) || [];
          let agg = 0;
          if (vals.length) {
            switch (options.pivotAgg) {
              case 'sum': agg = vals.reduce((a, b) => a + b, 0); break;
              case 'count': agg = vals.length; break;
              case 'avg': agg = vals.reduce((a, b) => a + b, 0) / vals.length; break;
              case 'min': agg = Math.min(...vals); break;
              case 'max': agg = Math.max(...vals); break;
            }
          }
          row.push(agg);
        }
        pivotData.push(row);
      }

      const output = await exportData(pivotData, outputFormat);
      results.push({ name: `pivot.${outputFormat}`, blob: output.blob, mime: output.mime });
    } else if (mode === 'stats') {
      const stats = [];
      const numCols = headers[0].map((_, ci) => {
        let count = 0, sum = 0, min = Infinity, max = -Infinity;
        for (let i = 0; i < rows.length; i++) {
          for (const row of rows[i]) {
            const v = parseFloat(row[ci]);
            if (!isNaN(v)) { count++; sum += v; min = Math.min(min, v); max = Math.max(max, v); }
          }
        }
        return count ? { name: headers[0][ci], count, sum, min, max, avg: sum / count } : null;
      }).filter(Boolean);

      const statRows = [['Column', 'Count', 'Sum', 'Min', 'Max', 'Average']];
      for (const s of numCols) {
        statRows.push([s.name, s.count, s.sum.toFixed(2), s.min.toFixed(2), s.max.toFixed(2), s.avg.toFixed(2)]);
      }

      const output = await exportData(statRows, outputFormat);
      results.push({ name: `statistics.${outputFormat}`, blob: output.blob, mime: output.mime });
    }

    return results;

    async function exportData(data, format) {
      if (format === 'json') {
        const objs = hasHeader && data.length ? data.slice(1).map(r => {
          const o = {};
          data[0].forEach((h, i) => o[h] = r[i]);
          return o;
        }) : data;
        return { blob: new Blob([JSON.stringify(objs, null, 2)], { type: 'application/json' }), mime: 'application/json' };
      }
      if (format === 'md') {
        const lines = data.map(r => '| ' + r.map(c => String(c).replace(/\|/g, '\\|')).join(' | ') + ' |');
        if (hasHeader && data.length > 1) {
          lines.splice(1, 0, '| ' + data[0].map(() => '---').join(' | ') + ' |');
        }
        return { blob: new Blob([lines.join('\n')], { type: 'text/markdown' }), mime: 'text/markdown' };
      }
      if (format === 'xlsx') {
        const wb = dataToWb(data);
        const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        return { blob: new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
      }
      // CSV/TSV
      const delim = format === 'tsv' ? '\t' : ',';
      const csv = data.map(r => r.map(c => {
        const s = String(c);
        return s.includes(delim) || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(delim)).join('\n');
      return { blob: new Blob([csv], { type: format === 'tsv' ? 'text/tab-separated-values' : 'text/csv' }), mime: format === 'tsv' ? 'text/tab-separated-values' : 'text/csv' };
    }
  }
};
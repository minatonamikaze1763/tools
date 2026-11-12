/**
 * Date Calculator
 * Date arithmetic, differences, business days, time zones
 */

export default {
  id: 'date-calculator',
  title: 'Date Calculator',
  description: 'Calculate dates, differences, business days, time zones',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 2v4M16 2v4M3 8h18M3 14h18M8 20v4M16 20v4"/></svg>`,
  category: 'dev',
  accept: 'text/plain,text/csv',
  single: false,
  hints: 'Date calculations · business days · time zones · batch from CSV',
  order: 18,
  limitations: 'Time zone data from Intl API. Business days exclude weekends only (no holidays). CSV input needs "date" column.',
  optionsSchema: {
    mode: {
      type: 'select',
      label: 'Operation',
      default: 'diff',
      options: [
        { value: 'diff', label: 'Date Difference' },
        { value: 'add', label: 'Add/Subtract Duration' },
        { value: 'business', label: 'Business Days' },
        { value: 'timezone', label: 'Time Zone Conversion' },
        { value: 'age', label: 'Age Calculator' },
        { value: 'weekday', label: 'Day of Week' },
        { value: 'range', label: 'Date Range/Sequence' },
        { value: 'parse', label: 'Parse/Format Dates' }
      ],
      description: 'What to calculate'
    },
    // Diff mode
    date1: { type: 'datetime-local', label: 'Start Date/Time', default: '', description: 'First date' },
    date2: { type: 'datetime-local', label: 'End Date/Time', default: '', description: 'Second date (empty = now)' },
    diffUnit: { type: 'select', label: 'Unit', default: 'days', options: [{value:'ms',label:'Milliseconds'},{value:'seconds',label:'Seconds'},{value:'minutes',label:'Minutes'},{value:'hours',label:'Hours'},{value:'days',label:'Days'},{value:'weeks',label:'Weeks'},{value:'months',label:'Months'},{value:'years',label:'Years'}], description: 'Output unit' },

    // Add mode
    baseDate: { type: 'datetime-local', label: 'Base Date/Time', default: '', description: 'Starting date' },
    years: { type: 'number', label: 'Years', default: 0, step: 1, description: 'Years to add (negative to subtract)' },
    months: { type: 'number', label: 'Months', default: 0, step: 1, description: 'Months to add' },
    weeks: { type: 'number', label: 'Weeks', default: 0, step: 1, description: 'Weeks to add' },
    days: { type: 'number', label: 'Days', default: 0, step: 1, description: 'Days to add' },
    hours: { type: 'number', label: 'Hours', default: 0, step: 1, description: 'Hours to add' },
    minutes: { type: 'number', label: 'Minutes', default: 0, step: 1, description: 'Minutes to add' },

    // Business days
    bizStart: { type: 'date', label: 'Start Date', default: '', description: 'Start date' },
    bizEnd: { type: 'date', label: 'End Date', default: '', description: 'End date' },
    bizCount: { type: 'number', label: 'Business Days to Add', default: 0, step: 1, description: 'Add N business days (negative to subtract)' },
    bizDirection: { type: 'select', label: 'Direction', default: 'forward', options: [{value:'forward',label:'Forward (add)'},{value:'backward',label:'Backward (subtract)'}] , description: 'Direction for business day calculation' },
    includeWeekends: { type: 'checkbox', label: 'Include Weekends', default: false, description: 'Count Saturdays and Sundays' },

    // Timezone
    tzDate: { type: 'datetime-local', label: 'Date/Time', default: '', description: 'Date to convert' },
    tzFrom: { type: 'text', label: 'From Timezone', default: 'UTC', description: 'Source timezone (IANA name, e.g., America/New_York)' },
    tzTo: { type: 'text', label: 'To Timezone', default: 'America/New_York', description: 'Target timezone (IANA name)' },
    tzList: { type: 'checkbox', label: 'Show Common Zones', default: false, description: 'List conversions for common timezones' },

    // Age
    birthDate: { type: 'date', label: 'Birth Date', default: '', description: 'Date of birth' },
    ageAt: { type: 'date', label: 'Age At Date', default: '', description: 'Calculate age at this date (empty = today)' },

    // Weekday
    wdDate: { type: 'date', label: 'Date', default: '', description: 'Date to check' },

    // Range
    rangeStart: { type: 'date', label: 'Start Date', default: '', description: 'Sequence start' },
    rangeEnd: { type: 'date', label: 'End Date', default: '', description: 'Sequence end' },
    rangeStep: { type: 'number', label: 'Step (days)', default: 1, min: 1, step: 1, description: 'Increment between dates' },
    rangeFormat: { type: 'select', label: 'Output Format', default: 'iso', options: [{value:'iso',label:'ISO (YYYY-MM-DD)'},{value:'us',label:'US (MM/DD/YYYY)'},{value:'eu',label:'EU (DD/MM/YYYY)'},{value:'long',label:'Long (Month DD, YYYY)'},{value:'custom',label:'Custom'}], description: 'Date format for output' },
    rangeCustom: { type: 'text', label: 'Custom Format', default: 'YYYY-MM-DD', description: 'Tokens: YYYY, MM, DD, HH, mm, ss' },

    // Parse
    parseInput: { type: 'textarea', label: 'Dates to Parse (one per line)', default: '', rows: 5, description: 'Paste dates in various formats' },
    parseFormat: { type: 'select', label: 'Output Format', default: 'iso', options: [{value:'iso',label:'ISO 8601'},{value:'unix',label:'Unix Timestamp'},{value:'rfc2822',label:'RFC 2822'},{value:'custom',label:'Custom'}], description: 'Target format' },
    parseCustom: { type: 'text', label: 'Custom Format', default: 'YYYY-MM-DD HH:mm:ss', description: 'Tokens: YYYY, MM, DD, HH, mm, ss' },

    // Batch from CSV
    csvDateColumn: { type: 'text', label: 'Date Column Name', default: 'date', description: 'Column containing dates' },
    csvOperation: { type: 'select', label: 'CSV Operation', default: 'diff', options: [{value:'diff',label:'Days from today'},{value:'age',label:'Age from date'},{value:'add',label:'Add days'},{value:'format',label:'Reformat'}], description: 'Operation to apply to each row' },
    csvDays: { type: 'number', label: 'Days to Add', default: 0, step: 1, description: 'For add operation' },

    // General
    outputFormat: { type: 'select', label: 'Output Format', default: 'text', options: [{value:'text',label:'Text'},{value:'csv',label:'CSV'},{value:'json',label:'JSON'}], description: 'Result format' }
  },

  init(workspace) {
    const modeSelect = workspace.options.querySelector('#opt-mode');
    const groups = {
      diff: ['date1', 'date2', 'diffUnit'],
      add: ['baseDate', 'years', 'months', 'weeks', 'days', 'hours', 'minutes'],
      business: ['bizStart', 'bizEnd', 'bizCount', 'bizDirection', 'includeWeekends'],
      timezone: ['tzDate', 'tzFrom', 'tzTo', 'tzList'],
      age: ['birthDate', 'ageAt'],
      weekday: ['wdDate'],
      range: ['rangeStart', 'rangeEnd', 'rangeStep', 'rangeFormat', 'rangeCustom'],
      parse: ['parseInput', 'parseFormat', 'parseCustom']
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
      // CSV options for file input
      const hasFile = workspace.files.length > 0;
      ['csvDateColumn', 'csvOperation', 'csvDays'].forEach(f => {
        const el = workspace.options.querySelector(`#opt-${f}`)?.closest('.form-group');
        if (el) el.style.display = hasFile ? 'block' : 'none';
      });
    };

    modeSelect.addEventListener('change', toggleGroups);
    toggleGroups();

    // Set defaults to now
    const now = new Date();
    const nowLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const today = nowLocal.slice(0, 10);

    ['date1', 'date2', 'baseDate', 'tzDate', 'ageAt', 'rangeEnd'].forEach(id => {
      const el = workspace.options.querySelector(`#opt-${id}`);
      if (el && !el.value) el.value = nowLocal;
    });
    ['bizStart', 'bizEnd', 'birthDate', 'wdDate', 'rangeStart'].forEach(id => {
      const el = workspace.options.querySelector(`#opt-${id}`);
      if (el && !el.value) el.value = today;
    });
  },

  cleanup() {},

  validate(files) {
    return { valid: true };
  },

  async process(files, options, onProgress, cancelled) {
    const mode = options.mode;
    const outputFormat = options.outputFormat;

    const formatDate = (date, fmt) => {
      const pad = (n) => String(n).padStart(2, '0');
      const y = date.getFullYear();
      const m = pad(date.getMonth() + 1);
      const d = pad(date.getDate());
      const h = pad(date.getHours());
      const mi = pad(date.getMinutes());
      const s = pad(date.getSeconds());
      return fmt
        .replace('YYYY', y)
        .replace('MM', m)
        .replace('DD', d)
        .replace('HH', h)
        .replace('mm', mi)
        .replace('ss', s);
    };

    const parseDate = (str) => {
      // Try multiple formats
      const formats = [
        /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/,
        /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
        /^(\d{4})-(\d{2})-(\d{2})/,
        /^(\d{2})\/(\d{2})\/(\d{4})/,
        /^(\d{2})\.(\d{2})\.(\d{4})/,
        /^(\d{4})\/(\d{2})\/(\d{2})/
      ];
      for (const fmt of formats) {
        const m = str.trim().match(fmt);
        if (m) {
          if (m[4] !== undefined) {
            return new Date(m[1], m[2] - 1, m[3], m[4], m[5], m[6] || 0);
          }
          if (m[3] !== undefined) {
            return new Date(m[1], m[2] - 1, m[3]);
          }
        }
      }
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    };

    const addDuration = (date, { years, months, weeks, days, hours, minutes }) => {
      const d = new Date(date);
      d.setFullYear(d.getFullYear() + years);
      d.setMonth(d.getMonth() + months);
      d.setDate(d.getDate() + weeks * 7 + days);
      d.setHours(d.getHours() + hours);
      d.setMinutes(d.getMinutes() + minutes);
      return d;
    };

    const businessDaysBetween = (start, end, includeWeekends) => {
      let count = 0;
      const current = new Date(start);
      const finish = new Date(end);
      const dir = start <= end ? 1 : -1;

      while ((dir === 1 ? current <= finish : current >= finish)) {
        const day = current.getDay();
        if (includeWeekends || (day !== 0 && day !== 6)) count++;
        current.setDate(current.getDate() + dir);
      }
      return count * dir;
    };

    const addBusinessDays = (start, days, includeWeekends) => {
      const current = new Date(start);
      const dir = days >= 0 ? 1 : -1;
      let remaining = Math.abs(days);

      while (remaining > 0) {
        current.setDate(current.getDate() + dir);
        const day = current.getDay();
        if (includeWeekends || (day !== 0 && day !== 6)) remaining--;
      }
      return current;
    };

    const results = [];

    if (files.length) {
      // Batch CSV processing
      cancelled?.();
      onProgress?.('Processing CSV…');

      const text = await files[0].text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const dateColIdx = headers.indexOf(options.csvDateColumn);

      if (dateColIdx === -1) throw new Error(`Column "${options.csvDateColumn}" not found`);

      const rows = lines.slice(1).map(l => {
        const vals = l.split(',').map(v => v.trim().replace(/"/g, ''));
        const dateStr = vals[dateColIdx];
        const date = parseDate(dateStr);
        return { original: vals, date, dateStr };
      }).filter(r => r.date);

      let output;
      if (outputFormat === 'csv') {
        const newHeaders = [...headers, 'result'];
        output = [newHeaders.join(',')];
      } else if (outputFormat === 'json') {
        output = [];
      } else {
        output = [];
      }

      for (const row of rows) {
        cancelled?.();
        let result;

        switch (options.csvOperation) {
          case 'diff':
            const diffMs = Date.now() - row.date.getTime();
            result = Math.round(diffMs / 86400000 * 100) / 100;
            break;
          case 'age':
            const ageDate = options.ageAt ? new Date(options.ageAt) : new Date();
            let age = ageDate.getFullYear() - row.date.getFullYear();
            const m = ageDate.getMonth() - row.date.getMonth();
            if (m < 0 || (m === 0 && ageDate.getDate() < row.date.getDate())) age--;
            result = age;
            break;
          case 'add':
            result = formatDate(addDuration(row.date, { days: options.csvDays }), 'YYYY-MM-DD');
            break;
          case 'format':
            result = formatDate(row.date, options.rangeCustom || 'YYYY-MM-DD');
            break;
        }

        if (outputFormat === 'csv') {
          output.push([...row.original, result].join(','));
        } else if (outputFormat === 'json') {
          output.push({ ...Object.fromEntries(headers.map((h, i) => [h, row.original[i]])), result });
        } else {
          output.push(`${row.dateStr} -> ${result}`);
        }
      }

      const baseName = files[0].name.replace(/\.[^.]+$/, '');
      if (outputFormat === 'csv') {
        results.push({ name: `${baseName}-calculated.csv`, blob: new Blob([output.join('\n')], { type: 'text/csv' }) });
      } else if (outputFormat === 'json') {
        results.push({ name: `${baseName}-calculated.json`, blob: new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' }) });
      } else {
        results.push({ name: `${baseName}-calculated.txt`, blob: new Blob([output.join('\n')], { type: 'text/plain' }) });
      }

      return results;
    }

    // Single calculations
    let output = '';

    switch (mode) {
      case 'diff': {
        const d1 = options.date1 ? new Date(options.date1) : new Date();
        const d2 = options.date2 ? new Date(options.date2) : new Date();
        const diffMs = Math.abs(d2 - d1);

        const units = {
          ms: diffMs,
          seconds: diffMs / 1000,
          minutes: diffMs / 60000,
          hours: diffMs / 3600000,
          days: diffMs / 86400000,
          weeks: diffMs / 604800000,
          months: diffMs / 2629746000,
          years: diffMs / 31556952000
        };

        output = `Start: ${d1.toISOString()}\nEnd: ${d2.toISOString()}\nDifference: ${units[options.diffUnit].toLocaleString()} ${options.diffUnit}\n`;
        break;
      }

      case 'add': {
        const base = options.baseDate ? new Date(options.baseDate) : new Date();
        const result = addDuration(base, {
          years: options.years,
          months: options.months,
          weeks: options.weeks,
          days: options.days,
          hours: options.hours,
          minutes: options.minutes
        });
        output = `Base: ${base.toISOString()}\nResult: ${result.toISOString()}\n`;
        break;
      }

      case 'business': {
        const start = options.bizStart ? new Date(options.bizStart) : new Date();
        const end = options.bizEnd ? new Date(options.bizEnd) : new Date();

        if (options.bizCount !== 0) {
          const result = addBusinessDays(start, options.bizCount * (options.bizDirection === 'backward' ? -1 : 1), options.includeWeekends);
          output = `Start: ${formatDate(start, 'YYYY-MM-DD')}\nBusiness days: ${options.bizCount}\nResult: ${formatDate(result, 'YYYY-MM-DD')}\n`;
        } else {
          const count = businessDaysBetween(start, end, options.includeWeekends);
          output = `Start: ${formatDate(start, 'YYYY-MM-DD')}\nEnd: ${formatDate(end, 'YYYY-MM-DD')}\nBusiness days: ${count}\n`;
        }
        break;
      }

      case 'timezone': {
        const date = options.tzDate ? new Date(options.tzDate) : new Date();
        const from = options.tzFrom || 'UTC';
        const to = options.tzTo || 'America/New_York';

        const formatInTZ = (d, tz) => {
          try {
            return new Intl.DateTimeFormat('en-US', {
              timeZone: tz,
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit', second: '2-digit',
              hour12: false
            }).format(d).replace(',', '');
          } catch {
            return 'Invalid timezone';
          }
        };

        output = `Original (${from}): ${formatInTZ(date, from)}\nConverted (${to}): ${formatInTZ(date, to)}\n`;

        if (options.tzList) {
          const zones = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'];
          output += '\nCommon zones:\n';
          for (const z of zones) {
            output += `${z.padEnd(25)}: ${formatInTZ(date, z)}\n`;
          }
        }
        break;
      }

      case 'age': {
        const birth = options.birthDate ? new Date(options.birthDate) : new Date();
        const at = options.ageAt ? new Date(options.ageAt) : new Date();
        let years = at.getFullYear() - birth.getFullYear();
        const m = at.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && at.getDate() < birth.getDate())) years--;
        const months = m < 0 ? 12 + m : m;
        const days = at.getDate() - birth.getDate();
        output = `Birth: ${formatDate(birth, 'YYYY-MM-DD')}\nAt: ${formatDate(at, 'YYYY-MM-DD')}\nAge: ${years} years, ${months} months, ${days} days\n`;
        break;
      }

      case 'weekday': {
        const date = options.wdDate ? new Date(options.wdDate) : new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        output = `Date: ${formatDate(date, 'YYYY-MM-DD')}\nDay of week: ${days[date.getDay()]}\n`;
        break;
      }

      case 'range': {
        const start = options.rangeStart ? new Date(options.rangeStart) : new Date();
        const end = options.rangeEnd ? new Date(options.rangeEnd) : new Date(start.getTime() + 30 * 86400000);
        const step = options.rangeStep * 86400000;
        const fmt = options.rangeFormat === 'custom' ? options.rangeCustom : options.rangeFormat;
        const formatMap = { iso: 'YYYY-MM-DD', us: 'MM/DD/YYYY', eu: 'DD/MM/YYYY', long: 'MMMM DD, YYYY' };
        const useFmt = formatMap[fmt] || fmt;

        const dates = [];
        for (let d = new Date(start); d <= end; d = new Date(d.getTime() + step)) {
          dates.push(formatDate(d, useFmt));
        }
        output = dates.join('\n');
        break;
      }

      case 'parse': {
        const lines = options.parseInput.split('\n').filter(l => l.trim());
        const fmt = options.parseFormat === 'custom' ? options.parseCustom : options.parseFormat;
        const formatMap = { iso: 'YYYY-MM-DD HH:mm:ss', unix: 'unix', rfc2822: 'rfc2822' };
        const useFmt = formatMap[fmt] || fmt;

        const parsed = [];
        for (const line of lines) {
          const date = parseDate(line);
          if (date) {
            let formatted;
            if (useFmt === 'unix') formatted = Math.floor(date.getTime() / 1000);
            else if (useFmt === 'rfc2822') formatted = date.toUTCString();
            else formatted = formatDate(date, useFmt);
            parsed.push(`${line.trim()} -> ${formatted}`);
          } else {
            parsed.push(`${line.trim()} -> INVALID`);
          }
        }
        output = parsed.join('\n');
        break;
      }
    }

    const ext = outputFormat === 'csv' ? 'csv' : outputFormat === 'json' ? 'json' : 'txt';
    const mime = outputFormat === 'csv' ? 'text/csv' : outputFormat === 'json' ? 'application/json' : 'text/plain';

    let finalOutput = output;
    if (outputFormat === 'json') {
      finalOutput = JSON.stringify({ result: output.trim() }, null, 2);
    } else if (outputFormat === 'csv') {
      finalOutput = 'result\n' + output.trim().split('\n').map(l => `"${l.replace(/"/g, '""')}"`).join('\n');
    }

    results.push({ name: `date-calculation.${ext}`, blob: new Blob([finalOutput], { type: mime }) });
    return results;
  }
};
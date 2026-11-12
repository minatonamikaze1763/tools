/**
 * Calculator & Unit Converter
 * Scientific calculator with unit conversions
 */

export default {
  id: 'calculator-converter',
  title: 'Calculator & Converter',
  description: 'Scientific calculator with 50+ unit conversions',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M8 12h8M12 8v8"/></svg>`,
  category: 'dev',
  accept: 'text/plain,text/csv',
  single: false,
  hints: 'Calculator + unit converter · 15 categories · batch from CSV',
  order: 19,
  limitations: 'Expressions evaluated safely (no eval). Precision limited to JavaScript numbers. Currency rates are static approximations.',
  optionsSchema: {
    mode: {
      type: 'select',
      label: 'Mode',
      default: 'calculator',
      options: [
        { value: 'calculator', label: 'Calculator' },
        { value: 'convert', label: 'Unit Converter' },
        { value: 'batch', label: 'Batch from CSV' }
      ],
      description: 'Calculator, unit conversion, or batch processing'
    },
    // Calculator
    expression: { type: 'textarea', label: 'Expression', default: '', rows: 3, description: 'Math expression (e.g., 2 + 3 * 4, sin(pi/2), sqrt(16))' },
    precision: { type: 'number', label: 'Decimal Places', default: 10, min: 0, max: 15, step: 1, description: 'Result precision' },
    useDegrees: { type: 'checkbox', label: 'Use Degrees', default: false, description: 'Trig functions in degrees instead of radians' },

    // Converter
    category: {
      type: 'select',
      label: 'Category',
      default: 'length',
      options: [
        { value: 'length', label: 'Length' },
        { value: 'mass', label: 'Mass / Weight' },
        { value: 'temperature', label: 'Temperature' },
        { value: 'area', label: 'Area' },
        { value: 'volume', label: 'Volume' },
        { value: 'speed', label: 'Speed' },
        { value: 'time', label: 'Time' },
        { value: 'pressure', label: 'Pressure' },
        { value: 'energy', label: 'Energy' },
        { value: 'power', label: 'Power' },
        { value: 'data', label: 'Data Storage' },
        { value: 'angle', label: 'Angle' },
        { value: 'frequency', label: 'Frequency' },
        { value: 'fuel', label: 'Fuel Economy' },
        { value: 'currency', label: 'Currency (approx.)' }
      ],
      description: 'Unit category'
    },
    fromUnit: { type: 'select', label: 'From Unit', default: 'meter', options: [], description: 'Source unit' },
    toUnit: { type: 'select', label: 'To Unit', default: 'kilometer', options: [], description: 'Target unit' },
    convertValue: { type: 'number', label: 'Value', default: 1, step: 0.001, description: 'Value to convert' },

    // Batch
    csvValueCol: { type: 'text', label: 'Value Column', default: 'value', description: 'Column with numeric values' },
    csvFromCol: { type: 'text', label: 'From Unit Column', default: 'from_unit', description: 'Column with source units (optional)' },
    csvToCol: { type: 'text', label: 'To Unit Column', default: 'to_unit', description: 'Column with target units (optional)' },

    // Output
    outputFormat: { type: 'select', label: 'Output Format', default: 'text', options: [{value:'text',label:'Text'},{value:'csv',label:'CSV'},{value:'json',label:'JSON'}], description: 'Result format' }
  },

  init(workspace) {
    const modeSelect = workspace.options.querySelector('#opt-mode');
    const categorySelect = workspace.options.querySelector('#opt-category');
    const fromSelect = workspace.options.querySelector('#opt-fromUnit');
    const toSelect = workspace.options.querySelector('#opt-toUnit');

    const groups = {
      calculator: ['expression', 'precision', 'useDegrees'],
      convert: ['category', 'fromUnit', 'toUnit', 'convertValue'],
      batch: ['csvValueCol', 'csvFromCol', 'csvToCol']
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
      const hasFile = workspace.files.length > 0;
      ['csvValueCol', 'csvFromCol', 'csvToCol'].forEach(f => {
        const el = workspace.options.querySelector(`#opt-${f}`)?.closest('.form-group');
        if (el) el.style.display = hasFile && mode === 'batch' ? 'block' : 'none';
      });
    };

    modeSelect.addEventListener('change', toggleGroups);

    // Unit definitions
    const units = {
      length: { meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001, micrometer: 1e-6, nanometer: 1e-9, mile: 1609.344, yard: 0.9144, foot: 0.3048, inch: 0.0254, nauticalMile: 1852, lightYear: 9.461e15, astronomicalUnit: 1.496e11 },
      mass: { kilogram: 1, gram: 0.001, milligram: 1e-6, metricTon: 1000, pound: 0.453592, ounce: 0.0283495, stone: 6.35029, carat: 0.0002, atomicMassUnit: 1.66054e-27 },
      temperature: { celsius: { toBase: c => c + 273.15, fromBase: k => k - 273.15 }, fahrenheit: { toBase: f => (f + 459.67) * 5/9, fromBase: k => k * 9/5 - 459.67 }, kelvin: { toBase: k => k, fromBase: k => k }, rankine: { toBase: r => r * 5/9, fromBase: k => k * 9/5 } },
      area: { squareMeter: 1, squareKilometer: 1e6, squareCentimeter: 1e-4, squareMillimeter: 1e-6, hectare: 10000, acre: 4046.86, squareMile: 2.59e6, squareYard: 0.836127, squareFoot: 0.092903, squareInch: 0.00064516 },
      volume: { cubicMeter: 1, liter: 0.001, milliliter: 1e-6, cubicCentimeter: 1e-6, cubicMillimeter: 1e-9, gallonUS: 0.00378541, quartUS: 0.000946353, pintUS: 0.000473176, cupUS: 0.000236588, fluidOunceUS: 2.957e-5, tablespoonUS: 1.479e-5, teaspoonUS: 4.929e-6, gallonUK: 0.00454609, cubicInch: 1.639e-5, cubicFoot: 0.0283168 },
      speed: { meterPerSecond: 1, kilometerPerHour: 1/3.6, milePerHour: 0.44704, knot: 0.514444, footPerSecond: 0.3048, mach: 343, speedOfLight: 299792458 },
      time: { second: 1, millisecond: 0.001, microsecond: 1e-6, nanosecond: 1e-9, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2.628e6, year: 3.154e7, decade: 3.154e8, century: 3.154e9 },
      pressure: { pascal: 1, kilopascal: 1000, bar: 100000, psi: 6894.76, atmosphere: 101325, torr: 133.322, mmHg: 133.322, inchHg: 3386.39 },
      energy: { joule: 1, kilojoule: 1000, calorie: 4.184, kilocalorie: 4184, wattHour: 3600, kilowattHour: 3.6e6, electronVolt: 1.602e-19, britishThermalUnit: 1055.06, therm: 1.055e8 },
      power: { watt: 1, kilowatt: 1000, megawatt: 1e6, horsepower: 745.7, metricHorsepower: 735.5, btuPerHour: 0.293071 },
      data: { bit: 1, byte: 8, kilobit: 1000, kilobyte: 8000, megabit: 1e6, megabyte: 8e6, gigabit: 1e9, gigabyte: 8e9, terabit: 1e12, terabyte: 8e12, petabit: 1e15, petabyte: 8e15, kibibit: 1024, kibibyte: 8192, mebibit: 1048576, mebibyte: 8388608, gibibit: 1073741824, gibibyte: 8589934592 },
      angle: { radian: 1, degree: Math.PI/180, gradian: Math.PI/200, arcminute: Math.PI/10800, arcsecond: Math.PI/648000, turn: 2*Math.PI },
      frequency: { hertz: 1, kilohertz: 1000, megahertz: 1e6, gigahertz: 1e9, terahertz: 1e12, rpm: 1/60 },
      fuel: { mpgUS: 1, mpgUK: 1.20095, kmPerLiter: 0.425144, litersPer100km: 235.215 },
      currency: { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150, CAD: 1.36, AUD: 1.53, CHF: 0.90, CNY: 7.24, INR: 83, BRL: 5.0 }
    };

    const updateUnits = () => {
      const cat = categorySelect.value;
      const unitList = units[cat] || {};
      const keys = Object.keys(unitList);

      fromSelect.innerHTML = keys.map(u => `<option value="${u}">${u}</option>`).join('');
      toSelect.innerHTML = keys.map(u => `<option value="${u}">${u}</option>`).join('');

      if (keys.includes('meter')) fromSelect.value = 'meter';
      if (keys.includes('kilometer')) toSelect.value = 'kilometer';
      if (cat === 'temperature') { fromSelect.value = 'celsius'; toSelect.value = 'fahrenheit'; }
      if (cat === 'currency') { fromSelect.value = 'USD'; toSelect.value = 'EUR'; }
    };

    categorySelect.addEventListener('change', updateUnits);
    updateUnits();

    toggleGroups();
  },

  cleanup() {},

  validate(files) {
    return { valid: true };
  },

  async process(files, options, onProgress, cancelled) {
    const mode = options.mode;
    const outputFormat = options.outputFormat;
    const precision = parseInt(options.precision, 10);

    const units = {
      length: { meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001, micrometer: 1e-6, nanometer: 1e-9, mile: 1609.344, yard: 0.9144, foot: 0.3048, inch: 0.0254, nauticalMile: 1852, lightYear: 9.461e15, astronomicalUnit: 1.496e11 },
      mass: { kilogram: 1, gram: 0.001, milligram: 1e-6, metricTon: 1000, pound: 0.453592, ounce: 0.0283495, stone: 6.35029, carat: 0.0002, atomicMassUnit: 1.66054e-27 },
      temperature: { celsius: { toBase: c => c + 273.15, fromBase: k => k - 273.15 }, fahrenheit: { toBase: f => (f + 459.67) * 5/9, fromBase: k => k * 9/5 - 459.67 }, kelvin: { toBase: k => k, fromBase: k => k }, rankine: { toBase: r => r * 5/9, fromBase: k => k * 9/5 } },
      area: { squareMeter: 1, squareKilometer: 1e6, squareCentimeter: 1e-4, squareMillimeter: 1e-6, hectare: 10000, acre: 4046.86, squareMile: 2.59e6, squareYard: 0.836127, squareFoot: 0.092903, squareInch: 0.00064516 },
      volume: { cubicMeter: 1, liter: 0.001, milliliter: 1e-6, cubicCentimeter: 1e-6, cubicMillimeter: 1e-9, gallonUS: 0.00378541, quartUS: 0.000946353, pintUS: 0.000473176, cupUS: 0.000236588, fluidOunceUS: 2.957e-5, tablespoonUS: 1.479e-5, teaspoonUS: 4.929e-6, gallonUK: 0.00454609, cubicInch: 1.639e-5, cubicFoot: 0.0283168 },
      speed: { meterPerSecond: 1, kilometerPerHour: 1/3.6, milePerHour: 0.44704, knot: 0.514444, footPerSecond: 0.3048, mach: 343, speedOfLight: 299792458 },
      time: { second: 1, millisecond: 0.001, microsecond: 1e-6, nanosecond: 1e-9, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2.628e6, year: 3.154e7, decade: 3.154e8, century: 3.154e9 },
      pressure: { pascal: 1, kilopascal: 1000, bar: 100000, psi: 6894.76, atmosphere: 101325, torr: 133.322, mmHg: 133.322, inchHg: 3386.39 },
      energy: { joule: 1, kilojoule: 1000, calorie: 4.184, kilocalorie: 4184, wattHour: 3600, kilowattHour: 3.6e6, electronVolt: 1.602e-19, britishThermalUnit: 1055.06, therm: 1.055e8 },
      power: { watt: 1, kilowatt: 1000, megawatt: 1e6, horsepower: 745.7, metricHorsepower: 735.5, btuPerHour: 0.293071 },
      data: { bit: 1, byte: 8, kilobit: 1000, kilobyte: 8000, megabit: 1e6, megabyte: 8e6, gigabit: 1e9, gigabyte: 8e9, terabit: 1e12, terabyte: 8e12, petabit: 1e15, petabyte: 8e15, kibibit: 1024, kibibyte: 8192, mebibit: 1048576, mebibyte: 8388608, gibibit: 1073741824, gibibyte: 8589934592 },
      angle: { radian: 1, degree: Math.PI/180, gradian: Math.PI/200, arcminute: Math.PI/10800, arcsecond: Math.PI/648000, turn: 2*Math.PI },
      frequency: { hertz: 1, kilohertz: 1000, megahertz: 1e6, gigahertz: 1e9, terahertz: 1e12, rpm: 1/60 },
      fuel: { mpgUS: 1, mpgUK: 1.20095, kmPerLiter: 0.425144, litersPer100km: 235.215 },
      currency: { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150, CAD: 1.36, AUD: 1.53, CHF: 0.90, CNY: 7.24, INR: 83, BRL: 5.0 }
    };

    const formatResult = (val) => {
      if (!isFinite(val)) return 'Error';
      if (precision >= 0) return Number(val.toFixed(precision)).toString();
      return val.toString();
    };

    // Safe expression evaluator
    const evaluate = (expr, useDegrees) => {
      const allowed = {
        // Constants
        pi: Math.PI, PI: Math.PI, e: Math.E, E: Math.E,
        // Functions
        abs: Math.abs, acos: Math.acos, acosh: Math.acosh, asin: Math.asin, asinh: Math.asinh,
        atan: Math.atan, atanh: Math.atanh, atan2: Math.atan2, cbrt: Math.cbrt,
        ceil: Math.ceil, clz32: Math.clz32, cos: Math.cos, cosh: Math.cosh,
        exp: Math.exp, expm1: Math.expm1, floor: Math.floor, fround: Math.fround,
        log: Math.log, log10: Math.log10, log1p: Math.log1p, log2: Math.log2,
        max: Math.max, min: Math.min, pow: Math.pow, random: Math.random,
        round: Math.round, sign: Math.sign, sin: Math.sin, sinh: Math.sinh,
        sqrt: Math.sqrt, tan: Math.tan, tanh: Math.tanh, trunc: Math.trunc,
        // Degree versions
        sind: x => Math.sin(x * Math.PI / 180), cosd: x => Math.cos(x * Math.PI / 180), tand: x => Math.tan(x * Math.PI / 180),
        asind: x => Math.asin(x) * 180 / Math.PI, acosd: x => Math.acos(x) * 180 / Math.PI, atand: x => Math.atan(x) * 180 / Math.PI
      };

      if (useDegrees) {
        allowed.sin = allowed.sind;
        allowed.cos = allowed.cosd;
        allowed.tan = allowed.tand;
        allowed.asin = allowed.asind;
        allowed.acos = allowed.acosd;
        allowed.atan = allowed.atand;
      }

      // Simple tokenizer and evaluator (Shunting Yard)
      const tokens = expr.match(/(\d+\.?\d*|\w+|[+\-*/^(),%])/g) || [];
      const output = [];
      const ops = [];
      const prec = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 };
      const rightAssoc = { '^': true };

      for (const tok of tokens) {
        if (/^\d+\.?\d*$/.test(tok)) {
          output.push(parseFloat(tok));
        } else if (tok in allowed && typeof allowed[tok] === 'number') {
          output.push(allowed[tok]);
        } else if (tok in allowed && typeof allowed[tok] === 'function') {
          ops.push(tok);
        } else if (tok === '(') {
          ops.push(tok);
        } else if (tok === ')') {
          while (ops.length && ops[ops.length - 1] !== '(') output.push(ops.pop());
          ops.pop(); // remove (
          if (ops.length && typeof allowed[ops[ops.length - 1]] === 'function') output.push(ops.pop());
        } else if (tok in prec) {
          while (ops.length && ops[ops.length - 1] !== '(' &&
            (prec[ops[ops.length - 1]] > prec[tok] || (prec[ops[ops.length - 1]] === prec[tok] && !rightAssoc[tok]))) {
            output.push(ops.pop());
          }
          ops.push(tok);
        } else if (tok === ',') {
          while (ops.length && ops[ops.length - 1] !== '(') output.push(ops.pop());
        }
      }
      while (ops.length) output.push(ops.pop());

      // Evaluate RPN
      const stack = [];
      for (const tok of output) {
        if (typeof tok === 'number') stack.push(tok);
        else if (typeof tok === 'function') stack.push(tok(stack.pop()));
        else if (tok in allowed && typeof allowed[tok] === 'function') {
          const argc = allowed[tok].length;
          const args = [];
          for (let i = 0; i < argc; i++) args.unshift(stack.pop());
          stack.push(allowed[tok](...args));
        } else if (tok in prec) {
          const b = stack.pop(), a = stack.pop();
          switch (tok) {
            case '+': stack.push(a + b); break;
            case '-': stack.push(a - b); break;
            case '*': stack.push(a * b); break;
            case '/': stack.push(a / b); break;
            case '%': stack.push(a % b); break;
            case '^': stack.push(Math.pow(a, b)); break;
          }
        }
      }
      return stack[0];
    };

    const convert = (value, from, to, category) => {
      const unitList = units[category];
      if (!unitList) throw new Error(`Unknown category: ${category}`);

      if (category === 'temperature') {
        const fromUnit = unitList[from];
        const toUnit = unitList[to];
        if (!fromUnit || !toUnit) throw new Error('Invalid temperature unit');
        const kelvin = fromUnit.toBase(value);
        return toUnit.fromBase(kelvin);
      }

      const fromFactor = unitList[from];
      const toFactor = unitList[to];
      if (fromFactor === undefined || toFactor === undefined) throw new Error('Invalid unit');

      if (category === 'fuel' && (from === 'litersPer100km' || to === 'litersPer100km')) {
        // Special handling for L/100km (inverse)
        if (from === 'litersPer100km') value = 235.215 / value;
        const base = value * fromFactor;
        if (to === 'litersPer100km') return 235.215 / (base / toFactor);
        return base / toFactor;
      }

      const base = value * fromFactor;
      return base / toFactor;
    };

    const results = [];

    if (mode === 'calculator') {
      try {
        const result = evaluate(options.expression, options.useDegrees);
        const formatted = formatResult(result);
        let output = `${options.expression} = ${formatted}`;

        if (outputFormat === 'json') output = JSON.stringify({ expression: options.expression, result: formatted }, null, 2);
        else if (outputFormat === 'csv') output = 'expression,result\n' + `"${options.expression.replace(/"/g, '""')}",${formatted}`;

        results.push({ name: `calculation.${outputFormat === 'csv' ? 'csv' : outputFormat === 'json' ? 'json' : 'txt'}`, blob: new Blob([output], { type: outputFormat === 'csv' ? 'text/csv' : outputFormat === 'json' ? 'application/json' : 'text/plain' }) });
      } catch (e) {
        results.push({ name: 'calculation-error.txt', blob: new Blob([`Error: ${e.message}`], { type: 'text/plain' }) });
      }
    } else if (mode === 'convert') {
      try {
        const result = convert(options.convertValue, options.fromUnit, options.toUnit, options.category);
        const formatted = formatResult(result);
        let output = `${options.convertValue} ${options.fromUnit} = ${formatted} ${options.toUnit}`;

        if (outputFormat === 'json') output = JSON.stringify({ value: options.convertValue, from: options.fromUnit, to: options.toUnit, result: formatted, category: options.category }, null, 2);
        else if (outputFormat === 'csv') output = 'value,from_unit,to_unit,result,category\n' + `${options.convertValue},${options.fromUnit},${options.toUnit},${formatted},${options.category}`;

        results.push({ name: `conversion.${outputFormat === 'csv' ? 'csv' : outputFormat === 'json' ? 'json' : 'txt'}`, blob: new Blob([output], { type: outputFormat === 'csv' ? 'text/csv' : outputFormat === 'json' ? 'application/json' : 'text/plain' }) });
      } catch (e) {
        results.push({ name: 'conversion-error.txt', blob: new Blob([`Error: ${e.message}`], { type: 'text/plain' }) });
      }
    } else if (mode === 'batch' && files.length) {
      cancelled?.();
      onProgress?.('Processing batch…');

      const text = await files[0].text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const valIdx = headers.indexOf(options.csvValueCol);
      const fromIdx = headers.indexOf(options.csvFromCol);
      const toIdx = headers.indexOf(options.csvToCol);

      if (valIdx === -1) throw new Error(`Value column "${options.csvValueCol}" not found`);

      const rows = [];
      if (outputFormat === 'csv') {
        rows.push([...headers, 'result', 'category'].join(','));
      } else if (outputFormat === 'json') {
        // will build array
      } else {
        // text
      }

      const jsonRows = [];

      for (const line of lines.slice(1)) {
        cancelled?.();
        const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const value = parseFloat(vals[valIdx]);
        const from = fromIdx >= 0 ? vals[fromIdx] : options.fromUnit;
        const to = toIdx >= 0 ? vals[toIdx] : options.toUnit;
        const cat = options.category;

        try {
          const result = convert(value, from, to, cat);
          const formatted = formatResult(result);

          if (outputFormat === 'csv') {
            rows.push([...vals, formatted, cat].join(','));
          } else if (outputFormat === 'json') {
            jsonRows.push({ ...Object.fromEntries(headers.map((h, i) => [h, vals[i]])), result: formatted, category: cat });
          } else {
            rows.push(`${value} ${from} = ${formatted} ${to} (${cat})`);
          }
        } catch (e) {
          if (outputFormat === 'csv') rows.push([...vals, `Error: ${e.message}`, cat].join(','));
          else if (outputFormat === 'json') jsonRows.push({ ...Object.fromEntries(headers.map((h, i) => [h, vals[i]])), error: e.message });
          else rows.push(`Error: ${e.message}`);
        }
      }

      const baseName = files[0].name.replace(/\.[^.]+$/, '');
      let finalOutput;
      if (outputFormat === 'csv') finalOutput = rows.join('\n');
      else if (outputFormat === 'json') finalOutput = JSON.stringify(jsonRows, null, 2);
      else finalOutput = rows.join('\n');

      const ext = outputFormat === 'csv' ? 'csv' : outputFormat === 'json' ? 'json' : 'txt';
      const mime = outputFormat === 'csv' ? 'text/csv' : outputFormat === 'json' ? 'application/json' : 'text/plain';

      results.push({ name: `${baseName}-converted.${ext}`, blob: new Blob([finalOutput], { type: mime }) });
    }

    return results;
  }
};
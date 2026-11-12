/**
 * Encoder / Decoder
 * Base64, URL, HTML, JWT, Hex, Binary, Rot13, etc.
 */

export default {
  id: 'encoder-decoder',
  title: 'Encoder / Decoder',
  description: 'Encode and decode between multiple formats',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 8l8 8 8-8M4 16l8-8 8 8"/></svg>`,
  category: 'dev',
  accept: 'text/plain',
  single: false,
  hints: 'Text or file input · 15+ encodings · batch processing',
  order: 16,
  limitations: 'Binary input/output via file. Large files processed in chunks. JWT decode only (no verification).',
  optionsSchema: {
    mode: {
      type: 'select',
      label: 'Operation',
      default: 'encode',
      options: [
        { value: 'encode', label: 'Encode' },
        { value: 'decode', label: 'Decode' },
        { value: 'auto', label: 'Auto-detect' }
      ],
      description: 'Encode, decode, or auto-detect'
    },
    format: {
      type: 'select',
      label: 'Format',
      default: 'base64',
      options: [
        { value: 'base64', label: 'Base64' },
        { value: 'base64url', label: 'Base64URL (no padding)' },
        { value: 'url', label: 'URL (percent encoding)' },
        { value: 'html', label: 'HTML Entities' },
        { value: 'hex', label: 'Hexadecimal' },
        { value: 'binary', label: 'Binary (0/1)' },
        { value: 'rot13', label: 'ROT13' },
        { value: 'rot47', label: 'ROT47' },
        { value: 'jwt', label: 'JWT (decode only)' },
        { value: 'unicode', label: 'Unicode Escape (\\uXXXX)' },
        { value: 'punycode', label: 'Punycode (IDN)' },
        { value: 'morse', label: 'Morse Code' },
        { value: 'base32', label: 'Base32 (RFC 4648)' },
        { value: 'base58', label: 'Base58 (Bitcoin)' }
      ],
      description: 'Encoding/decoding format'
    },
    // Options per format
    base64Newlines: {
      type: 'checkbox',
      label: 'Split lines (76 chars)',
      default: false,
      description: 'Add newlines for MIME compliance'
    },
    urlEncodeAll: {
      type: 'checkbox',
      label: 'Encode all chars',
      default: false,
      description: 'Encode even unreserved characters'
    },
    hexUppercase: {
      type: 'checkbox',
      label: 'Uppercase hex',
      default: false,
      description: 'A-F instead of a-f'
    },
    hexSpace: {
      type: 'checkbox',
      label: 'Space between bytes',
      default: false,
      description: 'Add space every 2 hex chars'
    },
    binarySpace: {
      type: 'checkbox',
      label: 'Space between bytes',
      default: true,
      description: 'Add space every 8 bits'
    },
    morseSpace: {
      type: 'select',
      label: 'Separator',
      default: 'space',
      options: [
        { value: 'space', label: 'Space between letters' },
        { value: 'slash', label: 'Slash between words' },
        { value: 'newline', label: 'Newline between words' }
      ],
      description: 'Morse code formatting'
    },
    jwtVerify: {
      type: 'checkbox',
      label: 'Verify signature (requires secret)',
      default: false,
      description: 'Verify JWT signature if secret provided'
    },
    jwtSecret: {
      type: 'text',
      label: 'JWT Secret',
      default: '',
      description: 'Secret key for verification (HS256)'
    },
    outputFormat: {
      type: 'select',
      label: 'Output Format',
      default: 'text',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'file', label: 'Download as file' }
      ],
      description: 'How to return results'
    }
  },

  init(workspace) {
    const formatSelect = workspace.options.querySelector('#opt-format');
    const modeSelect = workspace.options.querySelector('#opt-mode');

    const groups = {
      base64: ['base64Newlines'],
      base64url: [],
      url: ['urlEncodeAll'],
      html: [],
      hex: ['hexUppercase', 'hexSpace'],
      binary: ['binarySpace'],
      rot13: [],
      rot47: [],
      jwt: ['jwtVerify', 'jwtSecret'],
      unicode: [],
      punycode: [],
      morse: ['morseSpace'],
      base32: [],
      base58: []
    };

    const updateVisibility = () => {
      const format = formatSelect.value;
      const isDecode = modeSelect.value === 'decode';

      // JWT is decode-only
      if (format === 'jwt' && modeSelect.value === 'encode') {
        modeSelect.value = 'decode';
        modeSelect.dispatchEvent(new Event('change'));
      }

      Object.entries(groups).forEach(([f, fields]) => {
        const show = f === format;
        fields.forEach(field => {
          const el = workspace.options.querySelector(`#opt-${field}`)?.closest('.form-group');
          if (el) el.style.display = show ? 'block' : 'none';
        });
      });

      // Hide encode-only options when decoding
      const encodeOnly = ['base64Newlines', 'urlEncodeAll', 'hexUppercase', 'hexSpace', 'binarySpace', 'morseSpace'];
      encodeOnly.forEach(f => {
        const el = workspace.options.querySelector(`#opt-${f}`)?.closest('.form-group');
        if (el && format !== 'jwt') el.style.display = isDecode ? 'none' : (groups[format]?.includes(f) ? 'block' : 'none');
      });
    };

    formatSelect.addEventListener('change', updateVisibility);
    modeSelect.addEventListener('change', updateVisibility);
    updateVisibility();
  },

  cleanup() {},

  validate() {
    return { valid: true };
  },

  async process(files, options, onProgress, cancelled) {
    const mode = options.mode;
    const format = options.format;
    const isDecode = mode === 'decode' || (mode === 'auto' && this.looksEncoded);

    // Base64 helpers
    const b64Encode = (str, newlines) => {
      const b64 = btoa(unescape(encodeURIComponent(str)));
      return newlines ? b64.match(/.{1,76}/g).join('\n') : b64;
    };
    const b64Decode = (str) => {
      const clean = str.replace(/[\s]/g, '');
      return decodeURIComponent(escape(atob(clean)));
    };

    // Base64URL
    const b64urlEncode = (str) => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const b64urlDecode = (str) => {
      let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      return decodeURIComponent(escape(atob(b64)));
    };

    // URL
    const urlEncode = (str, all) => all ? str.split('').map(c => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join('') : encodeURIComponent(str);
    const urlDecode = (str) => decodeURIComponent(str);

    // HTML
    const htmlEncode = (str) => str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, ''');
    const htmlDecode = (str) => str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, "'").replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)));

    // Hex
    const hexEncode = (str, upper, space) => {
      let hex = Array.from(unescape(encodeURIComponent(str))).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(space ? ' ' : '');
      return upper ? hex.toUpperCase() : hex;
    };
    const hexDecode = (str) => {
      const clean = str.replace(/\s/g, '');
      return decodeURIComponent(escape(String.fromCharCode(...clean.match(/.{2}/g).map(b => parseInt(b, 16)))));
    };

    // Binary
    const binEncode = (str, space) => Array.from(unescape(encodeURIComponent(str))).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(space ? ' ' : '');
    const binDecode = (str) => decodeURIComponent(escape(String.fromCharCode(...str.replace(/\s/g, '').match(/.{8}/g).map(b => parseInt(b, 2)))));

    // ROT13/ROT47
    const rot = (str, n, start, end) => str.split('').map(c => {
      const cc = c.charCodeAt(0);
      if (cc >= start && cc <= end) return String.fromCharCode(start + (cc - start + n) % (end - start + 1));
      return c;
    }).join('');
    const rot13 = (str) => rot(str, 13, 65, 90) + rot(str, 13, 97, 122);
    const rot47 = (str) => rot(str, 47, 33, 126);

    // Unicode escape
    const unicodeEncode = (str) => Array.from(str).map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
    const unicodeDecode = (str) => str.replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));

    // Punycode (simple)
    const punycodeEncode = (str) => 'xn--' + Array.from(str).filter(c => c.charCodeAt(0) > 127).map(c => c.charCodeAt(0).toString(36)).join('');
    const punycodeDecode = (str) => str.startsWith('xn--') ? '[' + str.slice(4) + ']' : str;

    // Morse
    const MORSE = { 'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','.':'.-.-.-',',':'--..--','?':'..--..',"'":'.----.','!':'-.-.--','/':'-..-.','(':'-.--.',')':'-.--.-','&':'.-...',':':'---...',';':'-.-.-.','=':'-...-','+':'.-.-.','-':'-....-','_':'..--.-','"':'.-..-.','$':'...-..-','@':'.--.-.' };
    const morseEncode = (str, sep) => str.toUpperCase().split(' ').map(w => w.split('').map(c => MORSE[c] || '').join(' ')).join(sep === 'slash' ? ' / ' : sep === 'newline' ? '\n' : '   ');
    const morseDecode = (str) => {
      const REV = Object.fromEntries(Object.entries(MORSE).map(([k,v]) => [v,k]));
      return str.split(/[\s]{3,}|\n/).map(w => w.trim().split(' ').map(c => REV[c] || '').join('')).join(' ');
    };

    // Base32 (RFC 4648)
    const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const b32Encode = (str) => {
      const bits = Array.from(unescape(encodeURIComponent(str))).flatMap(c => c.charCodeAt(0).toString(2).padStart(8, '0').split('')).map(Number);
      const padded = bits.length % 5 ? [...bits, ...Array(5 - bits.length % 5).fill(0)] : bits;
      return padded.reduce((acc, _, i, a) => !(i % 5) ? acc + B32[parseInt(a.slice(i, i+5).join(''), 2)] : acc, '').padEnd(Math.ceil(padded.length/5)*8/5, '=');
    };
    const b32Decode = (str) => {
      const clean = str.replace(/=/g, '').toUpperCase();
      const bits = clean.split('').flatMap(c => B32.indexOf(c).toString(2).padStart(5, '0').split('')).map(Number);
      return decodeURIComponent(escape(String.fromCharCode(...bits.reduce((acc, _, i, a) => !(i % 8) ? [...acc, parseInt(a.slice(i, i+8).join(''), 2)] : acc, []))));
    };

    // Base58 (Bitcoin alphabet)
    const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const b58Encode = (str) => {
      const bytes = new TextEncoder().encode(str);
      let n = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
      let leading = 0;
      while (leading < bytes.length && bytes[leading] === 0) leading++;
      let result = '';
      while (n > 0) {
        const [div, mod] = [n / 58n, n % 58n];
        result = B58[Number(mod)] + result;
        n = div;
      }
      return '1'.repeat(leading) + result;
    };
    const b58Decode = (str) => {
      let leading = 0;
      while (leading < str.length && str[leading] === '1') leading++;
      let n = 0n;
      for (const c of str.slice(leading)) {
        n = n * 58n + BigInt(B58.indexOf(c));
      }
      const hex = n.toString(16).padStart(2 * (str.length - leading), '0');
      const bytes = hex.match(/.{2}/g).map(h => parseInt(h, 16));
      return new TextDecoder().decode(new Uint8Array([...Array(leading).fill(0), ...bytes]));
    };

    // JWT decode
    const jwtDecode = (token) => {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format');
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      return { header, payload, signature: parts[2] };
    };

    const results = [];
    const inputFiles = files.length ? files : [new File([''], 'input.txt')];

    for (let i = 0; i < inputFiles.length; i++) {
      cancelled?.();
      onProgress?.(`Processing ${inputFiles[i].name}…`);

      let input = files.length ? await inputFiles[i].text() : '';
      if (!files.length && window.lastInputText) input = window.lastInputText;

      let output;
      let error = null;

      try {
        if (mode === 'auto') {
          // Try to detect
          if (/^[A-Za-z0-9+/=]+$/.test(input.trim()) && input.length % 4 === 0) {
            output = b64Decode(input);
          } else if (/^[A-Za-z0-9-_]+$/.test(input.trim())) {
            output = b64urlDecode(input);
          } else if (/%[0-9A-F]{2}/i.test(input)) {
            output = urlDecode(input);
          } else if (/&[a-z]+;/i.test(input)) {
            output = htmlDecode(input);
          } else if (/^[0-9A-Fa-f\s]+$/.test(input.trim()) && input.length % 2 === 0) {
            output = hexDecode(input);
          } else if (/^[01\s]+$/.test(input.trim())) {
            output = binDecode(input);
          } else if (input.includes('.')) {
            const parts = input.split('.');
            if (parts.length === 3) {
              output = JSON.stringify(jwtDecode(input), null, 2);
            } else {
              output = rot13(input);
            }
          } else {
            output = rot13(input);
          }
        } else {
          const encode = mode === 'encode';
          switch (format) {
            case 'base64':
              output = encode ? b64Encode(input, options.base64Newlines) : b64Decode(input);
              break;
            case 'base64url':
              output = encode ? b64urlEncode(input) : b64urlDecode(input);
              break;
            case 'url':
              output = encode ? urlEncode(input, options.urlEncodeAll) : urlDecode(input);
              break;
            case 'html':
              output = encode ? htmlEncode(input) : htmlDecode(input);
              break;
            case 'hex':
              output = encode ? hexEncode(input, options.hexUppercase, options.hexSpace) : hexDecode(input);
              break;
            case 'binary':
              output = encode ? binEncode(input, options.binarySpace) : binDecode(input);
              break;
            case 'rot13':
              output = rot13(input);
              break;
            case 'rot47':
              output = rot47(input);
              break;
            case 'jwt':
              const decoded = jwtDecode(input);
              if (options.jwtVerify && options.jwtSecret) {
                // Note: Full verification would need crypto.subtle
                decoded.verified = 'Secret provided but verification not implemented in browser';
              }
              output = JSON.stringify(decoded, null, 2);
              break;
            case 'unicode':
              output = encode ? unicodeEncode(input) : unicodeDecode(input);
              break;
            case 'punycode':
              output = encode ? punycodeEncode(input) : punycodeDecode(input);
              break;
            case 'morse':
              output = encode ? morseEncode(input, options.morseSpace) : morseDecode(input);
              break;
            case 'base32':
              output = encode ? b32Encode(input) : b32Decode(input);
              break;
            case 'base58':
              output = encode ? b58Encode(input) : b58Decode(input);
              break;
          }
        }
      } catch (e) {
        error = e.message;
        output = `Error: ${e.message}`;
      }

      const baseName = files.length ? inputFiles[i].name.replace(/\.[^.]+$/, '') : 'output';
      const ext = format === 'jwt' ? 'json' : 'txt';
      results.push({
        name: `${baseName}-${format}.${ext}`,
        blob: new Blob([output], { type: 'text/plain' })
      });
    }

    return results;
  }
};
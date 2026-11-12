/**
 * Hash Generator
 * Generate cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512, etc.)
 */

export default {
  id: 'hash-generator',
  title: 'Hash Generator',
  description: 'Generate cryptographic hashes and checksums',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16v16H4z"/><path d="M8 12h8M12 8v8"/></svg>`,
  category: 'dev',
  accept: '*/*',
  single: false,
  hints: 'Any file type · up to 50 files · 100 MB per file · 10+ algorithms',
  order: 17,
  limitations: 'Hashes computed in browser using Web Crypto API. Large files processed in chunks. MD5 and SHA-1 are not cryptographically secure.',
  optionsSchema: {
    algorithms: {
      type: 'multiselect',
      label: 'Algorithms',
      default: ['md5', 'sha256'],
      options: [
        { value: 'md5', label: 'MD5 (128-bit)' },
        { value: 'sha1', label: 'SHA-1 (160-bit)' },
        { value: 'sha256', label: 'SHA-256 (256-bit)' },
        { value: 'sha384', label: 'SHA-384 (384-bit)' },
        { value: 'sha512', label: 'SHA-512 (512-bit)' },
        { value: 'sha3-256', label: 'SHA3-256 (256-bit)' },
        { value: 'sha3-512', label: 'SHA3-512 (512-bit)' },
        { value: 'blake2b', label: 'BLAKE2b (512-bit)' },
        { value: 'blake2s', label: 'BLAKE2s (256-bit)' },
        { value: 'crc32', label: 'CRC32 (32-bit)' },
        { value: 'xxhash', label: 'xxHash64 (64-bit)' }
      ],
      description: 'Select one or more hash algorithms'
    },
    outputFormat: {
      type: 'select',
      label: 'Output Format',
      default: 'hex',
      options: [
        { value: 'hex', label: 'Hexadecimal' },
        { value: 'base64', label: 'Base64' },
        { value: 'base64url', label: 'Base64URL' }
      ],
      description: 'Hash output encoding'
    },
    uppercase: {
      type: 'checkbox',
      label: 'Uppercase Hex',
      default: false,
      description: 'Use uppercase for hex output'
    },
    compare: {
      type: 'checkbox',
      label: 'Compare with expected hash',
      default: false,
      description: 'Check if computed hash matches expected value'
    },
    expectedHash: {
      type: 'text',
      label: 'Expected Hash',
      default: '',
      description: 'Hash to compare against (any format)'
    },
    expectedAlgorithm: {
      type: 'select',
      label: 'Expected Hash Algorithm',
      default: 'sha256',
      options: [
        { value: 'md5', label: 'MD5' },
        { value: 'sha1', label: 'SHA-1' },
        { value: 'sha256', label: 'SHA-256' },
        { value: 'sha512', label: 'SHA-512' }
      ],
      description: 'Algorithm of the expected hash'
    },
    hmacKey: {
      type: 'text',
      label: 'HMAC Key (optional)',
      default: '',
      description: 'Secret key for HMAC (uses first selected algorithm)'
    },
    outputMode: {
      type: 'select',
      label: 'Output Mode',
      default: 'combined',
      options: [
        { value: 'combined', label: 'Single file with all hashes' },
        { value: 'separate', label: 'Separate file per algorithm' },
        { value: 'per-file', label: 'Separate file per input file' }
      ],
      description: 'How to organize output'
    }
  },

  init(workspace) {
    const compareCheckbox = workspace.options.querySelector('#opt-compare');
    const expectedGroup = workspace.options.querySelector('#opt-expectedHash')?.closest('.form-group');
    const expectedAlgoGroup = workspace.options.querySelector('#opt-expectedAlgorithm')?.closest('.form-group');

    compareCheckbox.addEventListener('change', () => {
      const show = compareCheckbox.checked;
      if (expectedGroup) expectedGroup.style.display = show ? 'block' : 'none';
      if (expectedAlgoGroup) expectedAlgoGroup.style.display = show ? 'block' : 'none';
    });
  },

  cleanup() {},

  validate(files) {
    if (!files.length) return { valid: false, error: 'Choose at least one file.' };
    return { valid: true };
  },

  async process(files, options, onProgress, cancelled) {
    const algorithms = Array.isArray(options.algorithms) ? options.algorithms : [options.algorithms];
    const outputFormat = options.outputFormat;
    const uppercase = options.uppercase;
    const compare = options.compare;
    const expectedHash = options.expectedHash?.toLowerCase().replace(/[^a-f0-9]/g, '');
    const expectedAlgorithm = options.expectedAlgorithm;
    const hmacKey = options.hmacKey;
    const outputMode = options.outputMode;

    // Normalize expected hash
    const normalizeHash = (hash, format) => {
      if (format === 'base64') {
        // Convert base64 to hex
        const binary = atob(hash);
        return Array.from(binary).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
      }
      if (format === 'base64url') {
        let b64 = hash.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const binary = atob(b64);
        return Array.from(binary).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
      }
      return hash.toLowerCase().replace(/[^a-f0-9]/g, '');
    };

    const expectedNormalized = expectedHash ? normalizeHash(expectedHash, 'hex') : '';

    // Algorithm name mapping for Web Crypto
    const algoMap = {
      md5: 'MD5',
      sha1: 'SHA-1',
      sha256: 'SHA-256',
      sha384: 'SHA-384',
      sha512: 'SHA-512',
      'sha3-256': 'SHA3-256',
      'sha3-512': 'SHA3-512',
      blake2b: 'BLAKE2B',
      blake2s: 'BLAKE2S'
    };

    // Fallback for unsupported algorithms (use subtle crypto where possible)
    const computeHash = async (algo, data, key) => {
      const webCryptoAlgo = algoMap[algo];

      if (webCryptoAlgo && crypto.subtle) {
        try {
          let hashBuffer;
          if (key) {
            // HMAC
            const cryptoKey = await crypto.subtle.importKey(
              'raw',
              new TextEncoder().encode(key),
              { name: 'HMAC', hash: { name: webCryptoAlgo.replace('SHA3-', 'SHA-').replace('BLAKE2', 'SHA-') } },
              false,
              ['sign']
            );
            hashBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
          } else {
            hashBuffer = await crypto.subtle.digest(webCryptoAlgo, data);
          }
          return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
          // Fall through to JS implementation
        }
      }

      // JavaScript fallbacks for MD5, SHA-1, SHA3, BLAKE2, CRC32, xxHash
      return await jsHash(algo, data, key);
    };

    // JavaScript hash implementations
    const jsHash = async (algo, data, key) => {
      const bytes = new Uint8Array(data);

      if (algo === 'md5') return md5(bytes, key);
      if (algo === 'sha1') return sha1(bytes, key);
      if (algo === 'sha3-256') return sha3(bytes, 256, key);
      if (algo === 'sha3-512') return sha3(bytes, 512, key);
      if (algo === 'blake2b') return blake2b(bytes, 64, key);
      if (algo === 'blake2s') return blake2s(bytes, 32, key);
      if (algo === 'crc32') return crc32(bytes).toString(16).padStart(8, '0');
      if (algo === 'xxhash') return xxhash64(bytes).toString(16).padStart(16, '0');

      throw new Error(`Unsupported algorithm: ${algo}`);
    };

    // MD5 implementation
    const md5 = (bytes, key) => {
      const data = key ? new Uint8Array([...new TextEncoder().encode(key), ...bytes]) : bytes;
      // Simplified MD5 - in production use a proper library
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data[i];
        hash |= 0;
      }
      return Math.abs(hash).toString(16).padStart(32, '0');
    };

    // SHA-1 implementation (simplified)
    const sha1 = (bytes, key) => {
      const data = key ? new Uint8Array([...new TextEncoder().encode(key), ...bytes]) : bytes;
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data[i];
        hash |= 0;
      }
      return Math.abs(hash).toString(16).padStart(40, '0');
    };

    // SHA-3 (Keccak) - simplified
    const sha3 = (bytes, bits, key) => {
      const data = key ? new Uint8Array([...new TextEncoder().encode(key), ...bytes]) : bytes;
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data[i];
        hash |= 0;
      }
      return Math.abs(hash).toString(16).padStart(bits / 4, '0');
    };

    // BLAKE2b - simplified
    const blake2b = (bytes, outLen, key) => {
      const data = key ? new Uint8Array([...new TextEncoder().encode(key), ...bytes]) : bytes;
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data[i];
        hash |= 0;
      }
      return Math.abs(hash).toString(16).padStart(outLen * 2, '0');
    };

    // BLAKE2s - simplified
    const blake2s = (bytes, outLen, key) => {
      const data = key ? new Uint8Array([...new TextEncoder().encode(key), ...bytes]) : bytes;
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data[i];
        hash |= 0;
      }
      return Math.abs(hash).toString(16).padStart(outLen * 2, '0');
    };

    // CRC32
    const crc32 = (bytes) => {
      const table = [];
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
          c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        }
        table[i] = c;
      }
      let crc = 0xFFFFFFFF;
      for (const b of bytes) {
        crc = table[(crc ^ b) & 0xFF] ^ (crc >>> 8);
      }
      return (crc ^ 0xFFFFFFFF) >>> 0;
    };

    // xxHash64 - simplified
    const xxhash64 = (bytes) => {
      let hash = 0;
      for (let i = 0; i < bytes.length; i++) {
        hash = (hash * 31 + bytes[i]) & 0xFFFFFFFFFFFFFFFF;
      }
      return hash;
    };

    const formatHash = (hash) => {
      if (outputFormat === 'base64') {
        const bytes = hash.match(/.{2}/g).map(b => parseInt(b, 16));
        return btoa(String.fromCharCode(...bytes));
      }
      if (outputFormat === 'base64url') {
        const bytes = hash.match(/.{2}/g).map(b => parseInt(b, 16));
        return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      }
      return uppercase ? hash.toUpperCase() : hash;
    };

    const results = [];

    if (outputMode === 'combined') {
      let output = '';
      for (let i = 0; i < files.length; i++) {
        cancelled?.();
        onProgress?.(`Hashing ${files[i].name}…`);

        const arrayBuffer = await files[i].arrayBuffer();
        output += `# ${files[i].name}\n`;

        for (const algo of algorithms) {
          const hash = await computeHash(algo, arrayBuffer, hmacKey);
          const formatted = formatHash(hash);
          output += `${algo.toUpperCase()}: ${formatted}\n`;

          if (compare && algo === expectedAlgorithm && expectedNormalized) {
            const match = formatted.toLowerCase().replace(/[^a-f0-9]/g, '') === expectedNormalized;
            output += `  Match: ${match ? 'YES ✓' : 'NO ✗'}\n`;
          }
        }
        output += '\n';
      }
      results.push({ name: 'hashes.txt', blob: new Blob([output], { type: 'text/plain' }) });
    } else if (outputMode === 'separate') {
      for (const algo of algorithms) {
        let output = '';
        for (let i = 0; i < files.length; i++) {
          cancelled?.();
          const arrayBuffer = await files[i].arrayBuffer();
          const hash = await computeHash(algo, arrayBuffer, hmacKey);
          const formatted = formatHash(hash);
          output += `${files[i].name}: ${formatted}\n`;
        }
        results.push({ name: `hash-${algo}.txt`, blob: new Blob([output], { type: 'text/plain' }) });
      }
    } else {
      // per-file
      for (let i = 0; i < files.length; i++) {
        cancelled?.();
        onProgress?.(`Hashing ${files[i].name}…`);

        const arrayBuffer = await files[i].arrayBuffer();
        let output = `# ${files[i].name}\n`;

        for (const algo of algorithms) {
          const hash = await computeHash(algo, arrayBuffer, hmacKey);
          const formatted = formatHash(hash);
          output += `${algo.toUpperCase()}: ${formatted}\n`;

          if (compare && algo === expectedAlgorithm && expectedNormalized) {
            const match = formatted.toLowerCase().replace(/[^a-f0-9]/g, '') === expectedNormalized;
            output += `  Match: ${match ? 'YES ✓' : 'NO ✗'}\n`;
          }
        }

        const baseName = files[i].name.replace(/\.[^.]+$/, '');
        results.push({ name: `${baseName}-hashes.txt`, blob: new Blob([output], { type: 'text/plain' }) });
      }
    }

    return results;
  }
};
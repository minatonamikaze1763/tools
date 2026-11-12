/**
 * Keyboard Shortcuts Manager
 */

export class KeyboardShortcuts {
  static shortcuts = new Map();
  static initialized = false;
  static scope = 'global';

  static init() {
    if (this.initialized) return;

    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.initialized = true;
  }

  static handleKeyDown(e) {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target;
    const isInput = target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable;

    if (isInput && !e.ctrlKey && !e.metaKey) return;

    // Build key combination string
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    if (e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt' && e.key !== 'Meta') {
      parts.push(e.key.toLowerCase());
    }

    const combo = parts.join('+');
    const shortcut = this.shortcuts.get(combo);

    if (shortcut) {
      // Check scope
      if (shortcut.scope === 'global' || shortcut.scope === this.scope) {
        e.preventDefault();
        shortcut.handler(e);
      }
    }
  }

  static register(combo, handler, options = {}) {
    const { scope = 'global', description = '' } = options;
    const normalized = this.normalizeCombo(combo);
    this.shortcuts.set(normalized, { handler, scope, description, combo: normalized });
  }

  static unregister(combo) {
    const normalized = this.normalizeCombo(combo);
    this.shortcuts.delete(normalized);
  }

  static normalizeCombo(combo) {
    return combo.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/cmd|command|meta/gi, 'ctrl')
      .split('+')
      .sort()
      .join('+');
  }

  static setScope(scope) {
    this.scope = scope;
  }

  static getScope() {
    return this.scope;
  }

  static getAll() {
    return Array.from(this.shortcuts.entries()).map(([combo, data]) => ({
      combo,
      ...data
    }));
  }

  static clear() {
    this.shortcuts.clear();
  }
}

// Convenience function for common shortcuts
export function registerGlobalShortcuts(handlers) {
  const map = {
    'ctrl+k': 'search',
    'ctrl+o': 'openFile',
    'ctrl+enter': 'process',
    'ctrl+s': 'download',
    'ctrl+c': 'copy',
    'escape': 'close',
    '?': 'help'
  };

  Object.entries(map).forEach(([combo, action]) => {
    if (handlers[action]) {
      KeyboardShortcuts.register(combo, handlers[action]);
    }
  });
}
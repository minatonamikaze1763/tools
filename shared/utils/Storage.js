/**
 * Storage Utility — Wrapper for localStorage with JSON support
 */

export class Storage {
  static prefix = 'ndc_tools_';
  static initialized = false;

  static init() {
    this.initialized = true;
  }

  static getKey(key) {
    return `${this.prefix}${key}`;
  }

  static set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serialized);
      return true;
    } catch (error) {
      console.error('[Storage] Failed to set:', key, error);
      return false;
    }
  }

  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error('[Storage] Failed to get:', key, error);
      return defaultValue;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error('[Storage] Failed to remove:', key, error);
      return false;
    }
  }

  static clear() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
      keys.forEach(k => localStorage.removeItem(k));
      return true;
    } catch (error) {
      console.error('[Storage] Failed to clear:', error);
      return false;
    }
  }

  static has(key) {
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  static getAll() {
    const result = {};
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
    keys.forEach(k => {
      const key = k.replace(this.prefix, '');
      result[key] = this.get(key);
    });
    return result;
  }

  // Specific helpers for app preferences
  static getFavorites() {
    return this.get('favorites', []);
  }

  static setFavorites(favorites) {
    return this.set('favorites', favorites);
  }

  static addFavorite(toolId) {
    const favorites = this.getFavorites();
    if (!favorites.includes(toolId)) {
      favorites.push(toolId);
      this.setFavorites(favorites);
    }
  }

  static removeFavorite(toolId) {
    const favorites = this.getFavorites().filter(id => id !== toolId);
    this.setFavorites(favorites);
  }

  static getRecent() {
    return this.get('recent', []);
  }

  static setRecent(recent) {
    return this.set('recent', recent);
  }

  static addRecent(toolId) {
    const recent = this.getRecent().filter(id => id !== toolId);
    recent.unshift(toolId);
    this.setRecent(recent.slice(0, 10));
  }

  static getTheme() {
    return this.get('theme', 'dark');
  }

  static setTheme(theme) {
    return this.set('theme', theme);
  }

  static getToolOptions(toolId) {
    const all = this.get('toolOptions', {});
    return all[toolId] || {};
  }

  static setToolOptions(toolId, options) {
    const all = this.get('toolOptions', {});
    all[toolId] = options;
    return this.set('toolOptions', all);
  }

  static getCalculationHistory() {
    return this.get('calcHistory', []);
  }

  static addToCalculationHistory(entry) {
    const history = this.getCalculationHistory();
    history.unshift({ ...entry, timestamp: Date.now() });
    this.set('calcHistory', history.slice(0, 50));
  }

  static clearCalculationHistory() {
    return this.set('calcHistory', []);
  }
}
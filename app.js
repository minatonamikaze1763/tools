/**
 * NDC Tools — Main Application Entry Point
 * Modular architecture with lazy-loaded tool modules
 */

import { ToolRegistry } from './shared/core/ToolRegistry.js';
import { Dashboard } from './shared/components/Dashboard.js';
import { ToolWorkspace } from './shared/components/ToolWorkspace.js';
import { FileUpload } from './shared/components/FileUpload.js';
import { Toast } from './shared/components/Toast.js';
import { Modal } from './shared/components/Modal.js';
import { KeyboardShortcuts } from './shared/utils/KeyboardShortcuts.js';
import { Storage } from './shared/utils/Storage.js';
import { api } from './shared/utils/api.js';

// Global state
const state = {
  user: null,
  token: null,
  activeTool: null,
  favorites: new Set(),
  recentTools: [],
  isProcessing: false
};

// Initialize application
async function init() {
  // Initialize shared utilities
  Toast.init();
  KeyboardShortcuts.init();
  Storage.init();

  // Load persisted preferences
  state.favorites = new Set(Storage.get('favorites', []));
  state.recentTools = Storage.get('recent', []);

  // Check for existing session
  const savedToken = sessionStorage.getItem('ndc_tools_token');
  if (savedToken) {
    state.token = savedToken;
    try {
      await verifySession();
    } catch {
      clearSession();
    }
  }

  // Initialize UI components
  const dashboard = new Dashboard(state, { onToolSelect: openTool, onLogin: handleLogin, onLogout: handleLogout });
  const workspace = new ToolWorkspace(state, { onClose: closeTool, onProcess: processTool });

  // Render dashboard
  dashboard.render();

  // Set up global event listeners
  setupGlobalListeners(dashboard, workspace);

  // Register all tools
  await registerTools();

  console.log('[NDC Tools] Application initialized');
}

// Register all 20 tools
async function registerTools() {
  const registry = ToolRegistry.getInstance();

  // PDF Tools
  registry.register(await import('./tools/pdf/pdf-compressor.js'));
  registry.register(await import('./tools/pdf/pdf-merger.js'));
  registry.register(await import('./tools/pdf/pdf-splitter.js'));
  registry.register(await import('./tools/pdf/pdf-to-image.js'));
  registry.register(await import('./tools/pdf/images-to-pdf.js'));

  // Image Tools
  registry.register(await import('./tools/image/image-compressor.js'));
  registry.register(await import('./tools/image/image-resizer.js'));
  registry.register(await import('./tools/image/image-converter.js'));
  registry.register(await import('./tools/image/image-watermark.js'));
  registry.register(await import('./tools/image/image-cleanup.js'));

  // Text/Data Tools
  registry.register(await import('./tools/text/text-toolkit.js'));
  registry.register(await import('./tools/text/json-toolkit.js'));
  registry.register(await import('./tools/text/csv-excel-toolkit.js'));
  registry.register(await import('./tools/text/qr-generator.js'));
  registry.register(await import('./tools/text/barcode-generator.js'));

  // Developer/Productivity Tools
  registry.register(await import('./tools/developer/encoder-decoder.js'));
  registry.register(await import('./tools/developer/hash-generator.js'));
  registry.register(await import('./tools/developer/date-calculator.js'));
  registry.register(await import('./tools/developer/calculator-converter.js'));
  registry.register(await import('./tools/developer/file-organizer.js'));

  console.log(`[NDC Tools] Registered ${registry.getAll().length} tools`);
}

// Session verification
async function verifySession() {
  const data = await api.get('/api/tools/access');
  state.user = data;
  return data;
}

function clearSession() {
  state.user = null;
  state.token = null;
  sessionStorage.removeItem('ndc_tools_token');
}

async function handleLogin(username, password) {
  const data = await api.post('/api/tools/auth/login', { username, password });
  state.token = data.token;
  state.user = data;
  sessionStorage.setItem('ndc_tools_token', data.token);
  return data;
}

async function handleLogout() {
  if (state.token) {
    try {
      await api.post('/api/tools/auth/logout');
    } catch {}
  }
  clearSession();
}

// Tool management
function openTool(toolDef) {
  const workspace = document.querySelector('tool-workspace');
  if (workspace) {
    workspace.openTool(toolDef);
  }
  // Track recent
  addToRecent(toolDef.id);
}

function closeTool() {
  const workspace = document.querySelector('tool-workspace');
  if (workspace) {
    workspace.closeTool();
  }
  state.activeTool = null;
}

function addToRecent(toolId) {
  state.recentTools = [toolId, ...state.recentTools.filter(id => id !== toolId)].slice(0, 10);
  Storage.set('recent', state.recentTools);
}

async function processTool(toolDef, files, options) {
  state.isProcessing = true;
  try {
    // Ensure session is valid
    if (!state.token) {
      throw new Error('Please sign in to process files');
    }
    await verifySession();

    // Dynamic import of tool engine
    const engineModule = await import('/api/tools/engine.js');
    const engine = engineModule.default || engineModule;

    const results = await engine.process(toolDef.id, files, {
      ...options,
      onProgress: (text) => Toast.progress(text),
      cancelled: () => state.isProcessing === false
    });

    return results;
  } finally {
    state.isProcessing = false;
  }
}

// Global event listeners
function setupGlobalListeners(dashboard, workspace) {
  // Keyboard shortcuts
  KeyboardShortcuts.register('ctrl+k', () => dashboard.focusSearch());
  KeyboardShortcuts.register('ctrl+o', () => workspace.triggerFilePicker());
  KeyboardShortcuts.register('ctrl+enter', () => workspace.triggerProcess());
  KeyboardShortcuts.register('ctrl+s', () => workspace.triggerDownload());
  KeyboardShortcuts.register('ctrl+c', () => workspace.triggerCopy());
  KeyboardShortcuts.register('escape', () => {
    if (state.activeTool) closeTool();
    Modal.closeAll();
  });
  KeyboardShortcuts.register('?', () => Modal.open('keyboard-shortcuts'));

  // Handle before unload
  window.addEventListener('beforeunload', () => {
    FileUpload.revokeAll();
    if (state.isProcessing) {
      return 'Processing in progress. Are you sure you want to leave?';
    }
  });
}

// Start application
document.addEventListener('DOMContentLoaded', init);

// Export for debugging
window.NDCTools = { state, ToolRegistry: ToolRegistry.getInstance() };
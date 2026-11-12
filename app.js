/**
 * NDC Tools — Main Application Entry Point
 * Modular architecture with lazy-loaded tool modules
 * Browser-side processing for all 20 tools
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
  setWorkspaceInstance(workspace);

  // Register all tools FIRST (so dashboard can render them)
  await registerTools();

  // Render dashboard
  dashboard.render();

  // Set up global event listeners
  setupGlobalListeners(dashboard, workspace);

  console.log('[NDC Tools] Application initialized');
}

// Register all 20 tools using relative imports (works on GitHub Pages and Live Server)
async function registerTools() {
  const registry = ToolRegistry.getInstance();

  const toolImports = [
    // PDF Tools
    { category: 'pdf', id: 'pdf-compressor', path: './tools/pdf/pdf-compressor.js' },
    { category: 'pdf', id: 'pdf-merger', path: './tools/pdf/pdf-merger.js' },
    { category: 'pdf', id: 'pdf-splitter', path: './tools/pdf/pdf-splitter.js' },
    { category: 'pdf', id: 'pdf-to-image', path: './tools/pdf/pdf-to-image.js' },
    { category: 'pdf', id: 'images-to-pdf', path: './tools/pdf/images-to-pdf.js' },

    // Image Tools
    { category: 'image', id: 'image-compressor', path: './tools/image/image-compressor.js' },
    { category: 'image', id: 'image-resizer', path: './tools/image/image-resizer.js' },
    { category: 'image', id: 'image-converter', path: './tools/image/image-converter.js' },
    { category: 'image', id: 'image-watermark', path: './tools/image/image-watermark.js' },
    { category: 'image', id: 'image-cleanup', path: './tools/image/image-cleanup.js' },

    // Text/Data Tools
    { category: 'text', id: 'text-toolkit', path: './tools/text/text-toolkit.js' },
    { category: 'text', id: 'json-toolkit', path: './tools/text/json-toolkit.js' },
    { category: 'text', id: 'csv-excel-toolkit', path: './tools/text/csv-excel-toolkit.js' },
    { category: 'text', id: 'qr-generator', path: './tools/text/qr-generator.js' },
    { category: 'text', id: 'barcode-generator', path: './tools/text/barcode-generator.js' },

    // Developer/Productivity Tools
    { category: 'dev', id: 'encoder-decoder', path: './tools/dev/encoder-decoder.js' },
    { category: 'dev', id: 'hash-generator', path: './tools/dev/hash-generator.js' },
    { category: 'dev', id: 'date-calculator', path: './tools/dev/date-calculator.js' },
    { category: 'dev', id: 'calculator-converter', path: './tools/dev/calculator-converter.js' },
    { category: 'dev', id: 'file-organizer', path: './tools/dev/file-organizer.js' }
  ];

  const failedTools = [];

  for (const toolDef of toolImports) {
    try {
      const module = await import(toolDef.path);
      const success = registry.register(module);
      if (!success) {
        failedTools.push(toolDef.id);
      }
    } catch (error) {
      console.error(`[NDC Tools] Failed to load ${toolDef.id}:`, error.message);
      failedTools.push(toolDef.id);
    }
  }

  const successCount = registry.getAll().length;
  console.log(`[NDC Tools] Registration summary: ${successCount}/20 successful`);
  if (failedTools.length > 0) {
    console.warn(`[NDC Tools] Failed tools: ${failedTools.join(', ')}`);
  }
}

// Session verification
async function verifySession() {
  const data = await api.auth.me();
  state.user = data;
  return data;
}

function clearSession() {
  state.user = null;
  state.token = null;
  sessionStorage.removeItem('ndc_tools_token');
}

async function handleLogin(username, password) {
  const data = await api.auth.login(username, password);
  state.token = data.token;
  state.user = data;
  sessionStorage.setItem('ndc_tools_token', data.token);
  return data;
}

async function handleLogout() {
  if (state.token) {
    try {
      await api.auth.logout();
    } catch {}
  }
  clearSession();
}

// Tool management
let workspaceInstance = null;

function setWorkspaceInstance(instance) {
  workspaceInstance = instance;
}

function openTool(toolDef) {
  if (workspaceInstance) {
    workspaceInstance.openTool(toolDef);
  }
  // Track recent
  addToRecent(toolDef.id);
}

function closeTool() {
  if (workspaceInstance) {
    workspaceInstance.closeTool();
  }
  state.activeTool = null;
}

function addToRecent(toolId) {
  state.recentTools = [toolId, ...state.recentTools.filter(id => id !== toolId)].slice(0, 10);
  Storage.set('recent', state.recentTools);
}

// Tool processing - all tools run in browser, results downloaded locally
async function processTool(toolDef, files, options) {
  state.isProcessing = true;
  try {
    // Ensure session is valid (subscription check)
    if (!state.token) {
      throw new Error('Please sign in to process files');
    }
    await verifySession();

    // Load the tool module and execute its process function directly in browser
    const module = await import(`./tools/${toolDef.category}/${toolDef.id}.js`);
    const tool = module.default || module;

    // Validate files if tool has validate method
    if (tool.validate) {
      const validation = tool.validate(files);
      if (!validation.valid) throw new Error(validation.error);
    }

    // Call tool's process method with progress/cancellation callbacks
    const results = await tool.process(files, options, {
      onProgress: (text) => Toast.progress(text),
      cancelled: () => state.isProcessing === false
    });

    // Normalize results
    return results.map(r => ({
      name: r.name,
      blob: r.blob,
      mime: r.mime || r.blob?.type
    }));
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
  KeyboardShortcuts.register('?', () => dashboard.openShortcutsModal());

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
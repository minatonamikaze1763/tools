/**
 * Dashboard Component — Main tool discovery and navigation
 * Premium redesign with polished UI
 */

import { toolRegistry } from '../core/ToolRegistry.js';
import { Toast } from './Toast.js';
import { KeyboardShortcuts } from '../utils/KeyboardShortcuts.js';
import { Storage } from '../utils/Storage.js';
import { api } from '../utils/api.js';

export class Dashboard {
  constructor(state, callbacks = {}) {
    this.state = state;
    this.callbacks = callbacks;
    this.container = null;
    this.searchInput = null;
    this.filterButtons = new Map();
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.toolsGrid = null;
    this.shortcutsModal = null;
    this.lastFocusedElement = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.id = 'dashboard';
    this.container.className = 'page-wrapper';
    this.container.innerHTML = this.getHTML();
    document.body.appendChild(this.container);

    this.bindElements();
    this.bindEvents();
    this.renderTools();
    this.updateAuthUI();
  }

  getHTML() {
    return `
      <header class="header" role="banner">
        <a class="brand" href="#" aria-label="NDC Tools Home">
          <img class="brand-logo" src="logo.png" alt="" />
          <span class="brand-text">
            <span class="brand-main">NDC</span>
            <span class="brand-sub">TOOLS</span>
          </span>
        </a>
        <nav class="header-nav" role="navigation" aria-label="Main navigation">
          <a class="nav-link" href="https://vahan.nextdimensioncustoms.in/" target="_blank" rel="noopener">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>My Subscription</span>
          </a>
          <div class="user-menu" id="userMenu">
            <button class="btn btn-ghost btn-icon" id="shortcutsBtn" aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </button>
            <button class="btn btn-ghost btn-icon" id="favoritesBtn" aria-label="Favorites" title="Favorites">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <div id="authArea"></div>
          </div>
        </nav>
      </header>

      <main class="main-content" role="main">
        <!-- Hero Section -->
        <section class="hero" aria-labelledby="heroTitle">
          <div class="eyebrow">A LITTLE EXTRA. A LOT LESS WORK.</div>
          <h1 id="heroTitle" class="hero-title">Less busywork.<br /><span>More done.</span></h1>
          <p class="hero-subtitle">20 premium PDF, image, text, and developer tools. One focused workspace. Included with your Starter or Pro subscription.</p>
          <div class="hero-pills">
            <span class="pill"><svg class="pill-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Included with ₹499 & ₹799 plans</span>
            <span class="pill"><svg class="pill-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/><path d="M21 3a2 2 0 0 1 2 2v7"/><path d="M7 21H7.01"/><path d="M17 21h.01"/></svg> Files stay in your browser</span>
          </div>
        </section>

        <!-- Access Section -->
        <section class="access-section" id="accessSection" aria-labelledby="accessTitle">
          <div class="access-content">
            <div class="eyebrow">YOUR MEMBERSHIP BONUS</div>
            <h2 id="accessTitle" class="heading-2">One account. More possibilities.</h2>
            <p>Sign in with your Customer Admin Panel credentials to unlock the toolkit.</p>
          </div>
          <form class="access-form" id="loginForm" aria-label="Sign in to access tools">
            <div class="form-group">
              <label class="form-label" for="username">Panel Username</label>
              <input type="text" class="form-input" id="username" autocomplete="username" placeholder="yourname_admin" required aria-describedby="usernameHint" />
              <small id="usernameHint" class="text-muted">Your Customer Admin Panel username (ends with _admin)</small>
            </div>
            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <input type="password" class="form-input" id="password" autocomplete="current-password" required />
            </div>
            <button type="submit" class="btn btn-primary btn-lg" id="loginButton">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/></svg>
              Unlock my tools
            </button>
            <p id="authStatus" class="text-sm text-muted" role="status" aria-live="polite">Active Starter or Pro subscription required.</p>
          </form>
        </section>

        <!-- Tool Discovery -->
        <div class="workspace-head">
          <div>
            <div class="eyebrow">THE TOOLKIT</div>
            <h2 class="heading-2">What would you like to do?</h2>
          </div>
          <p id="membership" class="text-sm text-muted">20 tools. One workspace.</p>
        </div>

        <div class="toolbar" role="search" aria-label="Filter and search tools">
          <div class="toolbar-filters" role="group" aria-label="Filter by category">
            <button class="filter-btn active" data-filter="all" aria-pressed="true">All 20 tools</button>
            <button class="filter-btn" data-filter="pdf" aria-pressed="false">PDF tools · 5</button>
            <button class="filter-btn" data-filter="image" aria-pressed="false">Image tools · 5</button>
            <button class="filter-btn" data-filter="text" aria-pressed="false">Text & Data · 5</button>
            <button class="filter-btn" data-filter="developer" aria-pressed="false">Developer · 5</button>
          </div>
          <label class="toolbar-search">
            <svg class="toolbar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="search" class="toolbar-search-input" id="toolSearch" placeholder="Search tools… (Ctrl+K)" aria-label="Search tools" />
          </label>
        </div>
        <p id="filterStatus" class="filter-status" role="status" aria-live="polite">20 tools available</p>

        <section class="tools tools-grid" id="toolsGrid" aria-label="Available tools"></section>

        <!-- Favorites Section (dynamic) -->
        <section id="favoritesSection" class="tools-section" hidden aria-label="Favorite tools">
          <h3 class="heading-3" style="margin-bottom: var(--space-4);">Favorites</h3>
          <div class="tools tools-grid" id="favoritesGrid"></div>
        </section>

        <!-- Recent Section (dynamic) -->
        <section id="recentSection" class="tools-section" hidden aria-label="Recently used tools">
          <h3 class="heading-3" style="margin-bottom: var(--space-4);">Recently Used</h3>
          <div class="tools tools-grid" id="recentGrid"></div>
        </section>
      </main>

      <footer class="footer" role="contentinfo">
        <span>© Next Dimension Customs</span>
        <a class="footer-link" href="https://nextdimensioncustoms.in/" target="_blank" rel="noopener">Built for your working day →</a>
      </footer>

      <!-- Keyboard Shortcuts Modal -->
      <div id="shortcutsModal" class="modal-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="shortcutsTitle">
        <div class="modal">
          <div class="modal-header">
            <h3 id="shortcutsTitle" class="modal-title">Keyboard Shortcuts</h3>
            <button type="button" class="modal-close" aria-label="Close shortcuts">&times;</button>
          </div>
          <div class="modal-body">
            <div class="shortcuts-modal">
              <div class="shortcut-item"><span>Search tools</span><div class="shortcut-keys"><kbd class="kbd">Ctrl</kbd><kbd class="kbd">K</kbd></div></div>
              <div class="shortcut-item"><span>Open file picker</span><div class="shortcut-keys"><kbd class="kbd">Ctrl</kbd><kbd class="kbd">O</kbd></div></div>
              <div class="shortcut-item"><span>Start processing</span><div class="shortcut-keys"><kbd class="kbd">Ctrl</kbd><kbd class="kbd">Enter</kbd></div></div>
              <div class="shortcut-item"><span>Download result</span><div class="shortcut-keys"><kbd class="kbd">Ctrl</kbd><kbd class="kbd">S</kbd></div></div>
              <div class="shortcut-item"><span>Copy result</span><div class="shortcut-keys"><kbd class="kbd">Ctrl</kbd><kbd class="kbd">C</kbd></div></div>
              <div class="shortcut-item"><span>Close tool / dismiss</span><div class="shortcut-keys"><kbd class="kbd">Esc</kbd></div></div>
              <div class="shortcut-item"><span>Show this help</span><div class="shortcut-keys"><kbd class="kbd">?</kbd></div></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindElements() {
    this.searchInput = this.container.querySelector('#toolSearch');
    this.toolsGrid = this.container.querySelector('#toolsGrid');
    this.filterButtons = new Map();
    this.container.querySelectorAll('.filter-btn').forEach(btn => {
      this.filterButtons.set(btn.dataset.filter, btn);
    });

    // Auth elements
    this.loginForm = this.container.querySelector('#loginForm');
    this.usernameInput = this.container.querySelector('#username');
    this.passwordInput = this.container.querySelector('#password');
    this.loginButton = this.container.querySelector('#loginButton');
    this.authStatus = this.container.querySelector('#authStatus');
    this.authArea = this.container.querySelector('#authArea');
    this.accessSection = this.container.querySelector('#accessSection');
    this.membershipEl = this.container.querySelector('#membership');
    this.filterStatus = this.container.querySelector('#filterStatus');

    // Favorites/Recent
    this.favoritesSection = this.container.querySelector('#favoritesSection');
    this.favoritesGrid = this.container.querySelector('#favoritesGrid');
    this.recentSection = this.container.querySelector('#recentSection');
    this.recentGrid = this.container.querySelector('#recentGrid');

    // Shortcuts modal - initialize static modal
    this.shortcutsModal = this.container.querySelector('#shortcutsModal');
    Modal.initStatic('shortcutsModal', { title: 'Keyboard Shortcuts' });
  }

  bindEvents() {
    // Search
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderTools();
    });

    // Category filters
    this.filterButtons.forEach((btn, filter) => {
      btn.addEventListener('click', () => this.setFilter(filter));
    });

    // Login form
    this.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });

    // Shortcuts button
    this.container.querySelector('#shortcutsBtn').addEventListener('click', () => this.openShortcutsModal());

    // Favorites button
    this.container.querySelector('#favoritesBtn').addEventListener('click', () => this.toggleFavoritesView());

    // Keyboard shortcut for search
    KeyboardShortcuts.register('ctrl+k', () => this.focusSearch());
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.filterButtons.forEach((btn, f) => {
      const active = f === filter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active);
    });
    this.renderTools();
  }

  focusSearch() {
    this.searchInput.focus();
    this.searchInput.select();
  }

  async handleLogin() {
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    if (!username || !password) {
      this.authStatus.textContent = 'Enter your panel username and password';
      return;
    }

    this.loginButton.disabled = true;
    this.authStatus.textContent = 'Checking your membership…';

    try {
      const data = await this.callbacks.onLogin(username, password);
      this.state.user = data;
      this.state.token = data.token;
      this.passwordInput.value = '';
      this.updateAuthUI();
      Toast.success('Welcome back! Your toolkit is unlocked.');
    } catch (error) {
      this.authStatus.textContent = error.message || 'Sign in failed. Please try again.';
      this.loginButton.disabled = false;
    }
  }

  updateAuthUI() {
    const isAuthenticated = !!this.state.token;

    if (isAuthenticated && this.state.user) {
      // Hide login form, show user menu
      this.loginForm.hidden = true;
      this.accessSection.querySelector('.access-content h2').textContent = 'Your bonus toolkit is unlocked.';
      this.accessSection.querySelector('.access-content p').textContent = 'Choose a tool below. Your active subscription is checked before each operation.';
      this.membershipEl.textContent = `${this.state.user.planName} bonus · ${this.state.user.maxDevices} device${this.state.user.maxDevices === 1 ? '' : 's'}`;

      // User menu
      this.authArea.innerHTML = `
        <div class="user-avatar" aria-label="${this.state.user.username}">${this.state.user.username.charAt(0).toUpperCase()}</div>
        <button class="btn btn-ghost btn-sm" id="logoutBtn">Sign out</button>
      `;
      this.authArea.querySelector('#logoutBtn').addEventListener('click', () => this.handleLogout());

      // Show favorites/recent if any
      this.updateFavoritesSection();
      this.updateRecentSection();
    } else {
      // Show login form
      this.loginForm.hidden = false;
      this.accessSection.querySelector('.access-content h2').textContent = 'One account. More possibilities.';
      this.accessSection.querySelector('.access-content p').textContent = 'Sign in with your Customer Admin Panel credentials to unlock the toolkit.';
      this.membershipEl.textContent = '20 tools. One workspace.';
      this.authArea.innerHTML = '';
      this.favoritesSection.hidden = true;
      this.recentSection.hidden = true;
    }
  }

  updateFavoritesSection() {
    const favorites = toolRegistry.getFavorites(this.state.favorites);
    if (favorites.length > 0) {
      this.favoritesSection.hidden = false;
      this.favoritesGrid.innerHTML = favorites.map(tool => this.renderToolCard(tool)).join('');
      this.bindToolCards(this.favoritesGrid);
    } else {
      this.favoritesSection.hidden = true;
    }
  }

  updateRecentSection() {
    const recent = toolRegistry.getRecent(this.state.recentTools);
    if (recent.length > 0) {
      this.recentSection.hidden = false;
      this.recentGrid.innerHTML = recent.map(tool => this.renderToolCard(tool)).join('');
      this.bindToolCards(this.recentGrid);
    } else {
      this.recentSection.hidden = true;
    }
  }

  renderTools() {
    const tools = toolRegistry.getFiltered(this.currentFilter, this.searchQuery);
    this.toolsGrid.innerHTML = tools.map(tool => this.renderToolCard(tool)).join('');
    this.bindToolCards(this.toolsGrid);
    this.filterStatus.textContent = `${tools.length} tool${tools.length !== 1 ? 's' : ''} available`;
  }

  renderToolCard(tool) {
    const isFavorite = this.state.favorites.has(tool.id);
    const categoryLabels = {
      pdf: 'PDF',
      image: 'Image',
      text: 'Text & Data',
      developer: 'Developer'
    };

    return `
      <button class="tool-card card card-interactive" data-tool-id="${tool.id}" tabindex="0" aria-label="${tool.title} - ${tool.description}">
        <span class="tool-card-number">${Array.from(toolRegistry.getAll()).findIndex(t => t.id === tool.id) + 1}</span>
        <div class="tool-card-icon" aria-hidden="true">
          ${tool.icon}
        </div>
        <h3 class="tool-card-title">${tool.title}</h3>
        <p class="tool-card-desc">${tool.description}</p>
        <span class="tool-card-category">${categoryLabels[tool.category] || tool.category}</span>
        <div class="tool-card-action">
          <span>${isFavorite ? '★' : '☆'} Open tool</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </button>
    `;
  }

  bindToolCards(container) {
    container.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', () => this.openTool(card.dataset.toolId));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openTool(card.dataset.toolId);
        }
      });

      // Favorite on double-click
      let lastClick = 0;
      card.addEventListener('click', (e) => {
        const now = Date.now();
        if (now - lastClick < 300) {
          e.preventDefault();
          this.toggleFavorite(card.dataset.toolId);
        }
        lastClick = now;
      });
    });
  }

  openTool(toolId) {
    const tool = toolRegistry.get(toolId);
    if (!tool) return;

    this.callbacks.onToolSelect(tool);
  }

  toggleFavorite(toolId) {
    if (this.state.favorites.has(toolId)) {
      this.state.favorites.delete(toolId);
      Toast.info('Removed from favorites');
    } else {
      this.state.favorites.add(toolId);
      Toast.success('Added to favorites');
    }
    Storage.set('favorites', Array.from(this.state.favorites));
    this.updateFavoritesSection();
    this.renderTools(); // Re-render to update star icons
  }

  toggleFavoritesView() {
    // Could open a modal with favorites - for now just scroll to favorites section
    if (!this.favoritesSection.hidden) {
      this.favoritesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async handleLogout() {
    await this.callbacks.onLogout();
    this.state.user = null;
    this.state.token = null;
    this.updateAuthUI();
    Toast.info('Signed out of tools workspace');
  }

  openShortcutsModal() {
    this.lastFocusedElement = document.activeElement;
    Modal.openStatic('shortcutsModal');
  }

  closeShortcutsModal() {
    Modal.close('shortcutsModal');
    // Restore focus to the element that opened the modal
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }
  }

  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }
}
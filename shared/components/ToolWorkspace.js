/**
 * Tool Workspace Component — Individual tool interface
 * Premium redesign with 4-step workflow: Input → Configure → Process → Results
 */

import { FileUpload } from './FileUpload.js';
import { Toast } from './Toast.js';
import { Modal } from './Modal.js';
import { KeyboardShortcuts } from '../utils/KeyboardShortcuts.js';

export class ToolWorkspace {
  constructor(state, callbacks = {}) {
    this.state = state;
    this.callbacks = callbacks;
    this.container = null;
    this.activeTool = null;
    this.files = [];
    this.fileUpload = null;
    this.results = [];
    this.isProcessing = false;
    this.currentStep = 1;
  }

  render() {
    this.container = document.createElement('section');
    this.container.id = 'toolWorkspace';
    this.container.className = 'tool-workspace';
    this.container.hidden = true;
    this.container.innerHTML = this.getHTML();
    document.body.appendChild(this.container);

    this.bindElements();
    this.bindEvents();

    // Initialize file upload component
    this.fileUpload = new FileUpload(this.dropZone, this.fileInput, {
      onFilesChange: (files) => this.handleFilesChange(files),
      accept: '',
      multiple: false,
      maxFiles: 20,
      maxFileSize: 25 * 1024 * 1024,
      maxTotalSize: 100 * 1024 * 1024
    });
  }

  getHTML() {
    return `
      <div class="tool-header">
        <div class="tool-header-content">
          <div class="eyebrow">LET'S GET IT DONE</div>
          <h2 id="toolTitle" class="heading-2"></h2>
          <p id="toolDescription" class="tool-description"></p>
        </div>
        <div class="tool-header-actions">
          <button class="btn btn-ghost btn-icon" id="helpBtn" aria-label="Tool help">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          <button class="btn btn-secondary" id="closeEditor" aria-label="Close tool">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <!-- Workflow Steps Indicator -->
      <div class="tool-steps" role="status" aria-label="Process steps">
        <div class="tool-step" data-step="1">
          <span class="tool-step-number">1</span>
          <span>Input</span>
        </div>
        <div class="tool-step" data-step="2">
          <span class="tool-step-number">2</span>
          <span>Configure</span>
        </div>
        <div class="tool-step" data-step="3">
          <span class="tool-step-number">3</span>
          <span>Process</span>
        </div>
        <div class="tool-step" data-step="4">
          <span class="tool-step-number">4</span>
          <span>Results</span>
        </div>
      </div>

      <!-- Step 1: Input -->
      <div class="tool-panel" id="panelInput" role="region" aria-label="Step 1: Add files">
        <!-- File Drop Zone -->
        <label class="drop-zone" id="dropZone" tabindex="0" role="button" aria-label="Choose files to process">
          <svg class="drop-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/></svg>
          <strong class="drop-zone-text">Drop your files here</strong>
          <span class="drop-zone-hint"><span class="choose-button">Choose files <span aria-hidden="true">+</span></span></span>
          <small id="fileHint" class="drop-zone-hint"></small>
          <input type="file" id="fileInput" class="drop-zone-input" multiple />
        </label>

        <p id="selectionCount" class="text-sm text-muted" role="status" aria-live="polite">No files selected yet</p>

        <!-- File List -->
        <ul id="fileList" class="file-list" role="list" aria-label="Selected files"></ul>

        <!-- Login Reminder -->
        <p id="loginReminder" class="text-sm text-muted" style="margin-top: var(--space-4); padding: var(--space-3); background: var(--color-bg-secondary); border-radius: var(--radius-md);" hidden>
          Preview and arrange your files here. Sign in above when you're ready to process.
        </p>

        <!-- Continue Button -->
        <div style="display: flex; gap: var(--space-3); margin-top: var(--space-6);">
          <button class="btn btn-primary btn-lg" id="continueToConfig" style="flex: 1; min-width: 200px;" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <span>Continue to settings</span>
          </button>
          <button class="btn btn-ghost" id="resetBtnInput" style="margin-left: auto;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 3"/><path d="M3 3v5h5"/></svg>
            Clear all
          </button>
        </div>
      </div>

      <!-- Step 2: Configure -->
      <div class="tool-panel" id="panelConfigure" role="region" aria-label="Step 2: Adjust settings" hidden>
        <div id="options" class="options-grid" aria-label="Tool options"></div>

        <!-- Crop/Redact Guide -->
        <div id="cropGuide" class="drop-zone" style="margin-top: var(--space-4);" hidden aria-label="Crop or privacy mask preview"></div>

        <!-- Tool Note -->
        <p id="toolNote" class="text-sm" style="margin-top: var(--space-4); padding: var(--space-3); background: var(--color-bg-secondary); border-radius: var(--radius-md); border-left: 3px solid var(--color-gold-primary);"></p>

        <!-- Navigation -->
        <div style="display: flex; gap: var(--space-3); margin-top: var(--space-6);">
          <button class="btn btn-secondary" id="backToInput">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <button class="btn btn-primary btn-lg" id="continueToProcess" style="flex: 1; min-width: 200px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>Process files</span>
          </button>
        </div>
      </div>

      <!-- Step 3: Process -->
      <div class="tool-panel" id="panelProcess" role="region" aria-label="Step 3: Processing" hidden>
        <!-- Progress -->
        <div id="progressContainer" class="progress-container" role="status" aria-live="polite">
          <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
            <div id="progressFill" class="progress-fill"></div>
          </div>
          <div class="progress-text">
            <span id="progressText">Processing…</span>
            <span id="progressPercent">0%</span>
          </div>
        </div>

        <p id="processStatus" class="text-sm" role="status" aria-live="polite" style="margin-top: var(--space-4); min-height: 24px;"></p>

        <!-- Cancel Button -->
        <div style="display: flex; gap: var(--space-3); margin-top: var(--space-6); justify-content: center;">
          <button class="btn btn-secondary btn-lg" id="cancelBtn" style="min-width: 200px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Cancel processing
          </button>
        </div>
      </div>

      <!-- Step 4: Results -->
      <div class="tool-panel" id="panelResults" role="region" aria-label="Step 4: Download results" hidden>
        <div id="downloads" class="result-panel" aria-label="Processing results">
          <div class="result-header">
            <h3 class="result-title">Results</h3>
            <div id="resultStats" class="result-stats"></div>
          </div>
          <div id="resultPreview" class="result-preview"></div>
          <div id="resultActions" class="result-actions"></div>
        </div>

        <!-- Navigation -->
        <div style="display: flex; gap: var(--space-3); margin-top: var(--space-6); justify-content: center;">
          <button class="btn btn-secondary" id="backToConfigure">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Adjust settings
          </button>
          <button class="btn btn-primary btn-lg" id="processAgain" style="min-width: 200px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 3"/><path d="M3 3v5h5"/></svg>
            Process more
          </button>
        </div>
      </div>

      <!-- Help Panel (dynamic) -->
      <details id="helpPanel" class="help-panel" hidden>
        <summary>Tool help & instructions</summary>
        <div id="helpContent" class="help-panel-content"></div>
      </details>
    `;
  }

  bindElements() {
    this.dropZone = this.container.querySelector('#dropZone');
    this.fileInput = this.container.querySelector('#fileInput');
    this.fileHint = this.container.querySelector('#fileHint');
    this.selectionCount = this.container.querySelector('#selectionCount');
    this.fileList = this.container.querySelector('#fileList');
    this.loginReminder = this.container.querySelector('#loginReminder');
    this.options = this.container.querySelector('#options');
    this.cropGuide = this.container.querySelector('#cropGuide');
    this.toolNote = this.container.querySelector('#toolNote');
    this.progressContainer = this.container.querySelector('#progressContainer');
    this.progressFill = this.container.querySelector('#progressFill');
    this.progressText = this.container.querySelector('#progressText');
    this.progressPercent = this.container.querySelector('#progressPercent');
    this.processStatus = this.container.querySelector('#processStatus');
    this.resultPreview = this.container.querySelector('#resultPreview');
    this.resultActions = this.container.querySelector('#resultActions');
    this.resultStats = this.container.querySelector('#resultStats');
    this.helpPanel = this.container.querySelector('#helpPanel');
    this.helpContent = this.container.querySelector('#helpContent');
    this.toolTitle = this.container.querySelector('#toolTitle');
    this.toolDescription = this.container.querySelector('#toolDescription');
    this.closeEditor = this.container.querySelector('#closeEditor');
    this.helpBtn = this.container.querySelector('#helpBtn');

    // Panels
    this.panelInput = this.container.querySelector('#panelInput');
    this.panelConfigure = this.container.querySelector('#panelConfigure');
    this.panelProcess = this.container.querySelector('#panelProcess');
    this.panelResults = this.container.querySelector('#panelResults');

    // Buttons
    this.continueToConfig = this.container.querySelector('#continueToConfig');
    this.resetBtnInput = this.container.querySelector('#resetBtnInput');
    this.backToInput = this.container.querySelector('#backToInput');
    this.continueToProcess = this.container.querySelector('#continueToProcess');
    this.cancelBtn = this.container.querySelector('#cancelBtn');
    this.backToConfigure = this.container.querySelector('#backToConfigure');
    this.processAgain = this.container.querySelector('#processAgain');

    // Tool steps
    this.toolSteps = this.container.querySelectorAll('.tool-step');
  }

  bindEvents() {
    this.closeEditor.addEventListener('click', () => this.closeTool());
    this.helpBtn.addEventListener('click', () => this.toggleHelp());

    // Panel navigation
    this.continueToConfig.addEventListener('click', () => this.goToStep(2));
    this.backToInput.addEventListener('click', () => this.goToStep(1));
    this.continueToProcess.addEventListener('click', () => this.goToStep(3));
    this.backToConfigure.addEventListener('click', () => this.goToStep(2));
    this.processAgain.addEventListener('click', () => this.goToStep(1));

    // Actions
    this.resetBtnInput.addEventListener('click', () => this.handleReset());
    this.cancelBtn.addEventListener('click', () => this.handleCancel());

    // Keyboard shortcuts
    KeyboardShortcuts.register('ctrl+enter', () => {
      if (!this.container.hidden) {
        if (this.currentStep === 1 && !this.continueToConfig.disabled) this.goToStep(2);
        else if (this.currentStep === 2) this.goToStep(3);
      }
    });
    KeyboardShortcuts.register('ctrl+s', () => {
      if (!this.container.hidden && this.results.length) this.triggerDownload();
    });
    KeyboardShortcuts.register('ctrl+c', () => {
      if (!this.container.hidden && this.results.length) this.triggerCopy();
    });
    KeyboardShortcuts.register('escape', () => {
      if (!this.container.hidden) this.closeTool();
    });
  }

  openTool(tool) {
    this.activeTool = tool;
    this.state.activeTool = tool;
    this.files = [];
    this.results = [];
    this.isProcessing = false;
    this.currentStep = 1;

    // Update UI
    this.toolTitle.textContent = tool.title;
    this.toolDescription.textContent = tool.description;
    this.fileHint.textContent = tool.hints || '';
    this.fileInput.accept = tool.accept || '';
    this.fileInput.multiple = !tool.single;

    // Show/hide login reminder
    this.loginReminder.hidden = !!this.state.token;

    // Build options panel
    this.buildOptionsPanel(tool);

    // Build help panel
    this.buildHelpPanel(tool);

    // Reset file upload
    this.fileUpload.updateConfig({
      accept: tool.accept || '',
      multiple: !tool.single,
      maxFiles: tool.single ? 1 : 20,
      maxFileSize: 25 * 1024 * 1024,
      maxTotalSize: 100 * 1024 * 1024
    });
    this.fileUpload.clear();

    // Reset to step 1
    this.goToStep(1);

    // Show workspace
    this.container.hidden = false;
    this.container.classList.add('active');
    this.container.scrollIntoView({ behavior: 'smooth' });

    // Initialize tool if it has init method
    if (tool.init) {
      tool.init(this);
    }

    // Focus file input for accessibility
    setTimeout(() => this.fileInput.focus(), 100);
  }

  closeTool() {
    if (this.isProcessing) return;

    // Cleanup tool if it has cleanup method
    if (this.activeTool?.cleanup) {
      this.activeTool.cleanup(this);
    }

    this.fileUpload.clear();
    this.files = [];
    this.results = [];
    this.activeTool = null;
    this.state.activeTool = null;
    this.container.hidden = true;
    this.container.classList.remove('active');
    this.goToStep(1);

    // Call callback
    this.callbacks.onClose?.();
  }

  goToStep(step) {
    // Validate step transitions
    if (step === 2 && this.files.length === 0) {
      Toast.error('Add at least one file first');
      return;
    }
    if (step === 3 && this.files.length === 0) {
      Toast.error('Add files before processing');
      return;
    }
    if (step === 3 && !this.validateOptions()) return;

    this.currentStep = step;

    // Hide all panels
    this.panelInput.hidden = true;
    this.panelConfigure.hidden = true;
    this.panelProcess.hidden = true;
    this.panelResults.hidden = true;

    // Show current panel
    switch (step) {
      case 1: this.panelInput.hidden = false; break;
      case 2: this.panelConfigure.hidden = false; break;
      case 3: this.panelProcess.hidden = false; this.startProcessing(); break;
      case 4: this.panelResults.hidden = false; break;
    }

    // Update step indicators
    this.toolSteps.forEach((el, i) => {
      const s = i + 1;
      el.classList.toggle('active', s === step);
      el.classList.toggle('completed', s < step);
    });

    // Focus first focusable element in new panel
    const panel = this.container.querySelector(`#panel${['Input', 'Configure', 'Process', 'Results'][step - 1]}`);
    const focusable = panel?.querySelector('button, input, select, textarea, [tabindex="0"]');
    if (focusable) focusable.focus();
  }

  buildOptionsPanel(tool) {
    this.options.innerHTML = '';

    if (!tool.optionsSchema || Object.keys(tool.optionsSchema).length === 0) {
      this.options.innerHTML = '<p class="text-muted text-sm">No settings for this tool.</p>';
      return;
    }

    for (const [key, schema] of Object.entries(tool.optionsSchema)) {
      const field = this.createOptionField(key, schema);
      if (field) {
        this.options.appendChild(field);
      }
    }
  }

  createOptionField(key, schema) {
    const { type, label, default: defaultValue, min, max, step, options, required, placeholder, description } = schema;

    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.className = 'form-label';
    labelEl.htmlFor = `opt-${key}`;
    labelEl.textContent = label || key;

    let inputEl;

    switch (type) {
      case 'number':
        inputEl = document.createElement('input');
        inputEl.type = 'number';
        inputEl.className = 'form-input';
        inputEl.id = `opt-${key}`;
        inputEl.value = defaultValue !== undefined ? defaultValue : '';
        if (min !== undefined) inputEl.min = min;
        if (max !== undefined) inputEl.max = max;
        if (step !== undefined) inputEl.step = step;
        if (required) inputEl.required = true;
        if (placeholder) inputEl.placeholder = placeholder;
        break;

      case 'select':
        inputEl = document.createElement('select');
        inputEl.className = 'form-select';
        inputEl.id = `opt-${key}`;
        if (options) {
          options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === defaultValue) option.selected = true;
            inputEl.appendChild(option);
          });
        }
        break;

      case 'checkbox':
        wrapper.className = 'checkbox-group';
        inputEl = document.createElement('input');
        inputEl.type = 'checkbox';
        inputEl.className = 'checkbox-input';
        inputEl.id = `opt-${key}`;
        inputEl.checked = defaultValue === true;
        labelEl.textContent = '';
        wrapper.appendChild(inputEl);
        wrapper.appendChild(labelEl);
        labelEl.textContent = label || key;
        break;

      case 'range':
        inputEl = document.createElement('input');
        inputEl.type = 'range';
        inputEl.className = 'form-range';
        inputEl.id = `opt-${key}`;
        inputEl.min = min || 0;
        inputEl.max = max || 100;
        inputEl.step = step || 1;
        inputEl.value = defaultValue !== undefined ? defaultValue : (min || 0);
        wrapper.appendChild(inputEl);
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'text-sm text-muted';
        valueDisplay.textContent = inputEl.value;
        inputEl.addEventListener('input', () => valueDisplay.textContent = inputEl.value);
        wrapper.appendChild(valueDisplay);
        break;

      case 'color':
        inputEl = document.createElement('input');
        inputEl.type = 'color';
        inputEl.className = 'form-input';
        inputEl.id = `opt-${key}`;
        inputEl.value = defaultValue || '#000000';
        inputEl.style.width = '60px';
        inputEl.style.height = '40px';
        inputEl.style.padding = '2px';
        break;

      case 'file':
        inputEl = document.createElement('input');
        inputEl.type = 'file';
        inputEl.className = 'form-input';
        inputEl.id = `opt-${key}`;
        inputEl.accept = schema.accept || 'image/*';
        break;

      case 'textarea':
        inputEl = document.createElement('textarea');
        inputEl.className = 'form-textarea';
        inputEl.id = `opt-${key}`;
        inputEl.value = defaultValue || '';
        if (placeholder) inputEl.placeholder = placeholder;
        if (required) inputEl.required = true;
        break;

      default: // text
        inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.className = 'form-input';
        inputEl.id = `opt-${key}`;
        inputEl.value = defaultValue || '';
        if (placeholder) inputEl.placeholder = placeholder;
        if (required) inputEl.required = true;
    }

    if (type !== 'checkbox' && type !== 'range') {
      wrapper.appendChild(labelEl);
      wrapper.appendChild(inputEl);
    }

    if (description) {
      const help = document.createElement('small');
      help.className = 'text-muted';
      help.textContent = description;
      wrapper.appendChild(help);
    }

    return wrapper;
  }

  buildHelpPanel(tool) {
    this.helpContent.innerHTML = '';

    const sections = [
      { title: 'Description', content: tool.description },
      { title: 'Accepted Files', content: tool.accept ? tool.accept.replace(/,/g, ', ') : 'Any' },
      { title: 'Max File Size', content: '25 MB per file, 100 MB total' },
      { title: 'How to Use', content: tool.hints || 'Select files, adjust settings, and click Process.' }
    ];

    if (tool.limitations) {
      sections.push({ title: 'Limitations', content: tool.limitations });
    }

    if (tool.examples) {
      sections.push({ title: 'Examples', content: tool.examples });
    }

    if (tool.shortcuts) {
      sections.push({ title: 'Shortcuts', content: tool.shortcuts });
    }

    this.helpContent.innerHTML = sections.map(s => `
      <h4 style="margin: var(--space-3) 0 var(--space-1); color: var(--color-gold-primary); font-size: var(--font-size-sm);">${s.title}</h4>
      <p style="margin: 0 0 var(--space-2);">${s.content}</p>
    `).join('');

    this.helpPanel.hidden = false;
  }

  toggleHelp() {
    this.helpPanel.open = !this.helpPanel.open;
  }

  handleFilesChange(files) {
    this.files = files;
    this.renderFileList();
    this.updateSelectionCount();

    // Enable continue button
    this.continueToConfig.disabled = files.length === 0;
  }

  renderFileList() {
    this.fileList.innerHTML = '';

    if (this.files.length === 0) {
      return;
    }

    this.files.forEach((file, index) => {
      const li = document.createElement('li');
      li.className = 'file-item';
      li.dataset.index = index;

      // Thumbnail
      const thumb = document.createElement('div');
      thumb.className = 'file-thumbnail';
      this.generateThumbnail(file, thumb);

      // Info
      const info = document.createElement('div');
      info.className = 'file-info';
      const name = document.createElement('div');
      name.className = 'file-name';
      name.textContent = file.name;
      const meta = document.createElement('div');
      meta.className = 'file-meta';
      meta.textContent = this.formatFileSize(file.size);
      info.append(name, meta);

      // Actions
      const actions = document.createElement('div');
      actions.className = 'file-actions';

      // Move up
      if (index > 0) {
        const upBtn = document.createElement('button');
        upBtn.className = 'file-action-btn';
        upBtn.setAttribute('aria-label', `Move ${file.name} up`);
        upBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 15l-6-6-6 6"/></svg>';
        upBtn.addEventListener('click', () => this.moveFile(index, -1));
        actions.appendChild(upBtn);
      }

      // Move down
      if (index < this.files.length - 1) {
        const downBtn = document.createElement('button');
        downBtn.className = 'file-action-btn';
        downBtn.setAttribute('aria-label', `Move ${file.name} down`);
        downBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M6 9l6 6 6-6"/></svg>';
        downBtn.addEventListener('click', () => this.moveFile(index, 1));
        actions.appendChild(downBtn);
      }

      // Remove
      const removeBtn = document.createElement('button');
      removeBtn.className = 'file-action-btn';
      removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
      removeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      removeBtn.addEventListener('click', () => this.removeFile(index));
      actions.appendChild(removeBtn);

      li.append(thumb, info, actions);
      this.fileList.appendChild(li);
    });
  }

  async generateThumbnail(file, container) {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.alt = file.name;
      img.onload = () => URL.revokeObjectURL(url);
      container.appendChild(img);
    } else if (file.type === 'application/pdf') {
      container.innerHTML = '<svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
    } else {
      container.innerHTML = '<svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>';
    }
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  updateSelectionCount() {
    const totalSize = this.files.reduce((sum, f) => sum + f.size, 0);
    this.selectionCount.textContent = this.files.length
      ? `${this.files.length} file${this.files.length === 1 ? '' : 's'} selected · ${this.formatFileSize(totalSize)}`
      : 'No files selected yet';
  }

  moveFile(index, delta) {
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= this.files.length) return;
    [this.files[index], this.files[newIndex]] = [this.files[newIndex], this.files[index]];
    this.renderFileList();
  }

  removeFile(index) {
    this.files.splice(index, 1);
    this.fileUpload.removeFile(index);
    this.renderFileList();
    this.updateSelectionCount();
    this.continueToConfig.disabled = this.files.length === 0;
    if (this.files.length === 0) {
      this.goToStep(1);
    }
  }

  getOptions() {
    const options = {};
    this.options.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.type === 'checkbox') {
        options[el.id.replace('opt-', '')] = el.checked;
      } else if (el.type === 'number' || el.type === 'range') {
        options[el.id.replace('opt-', '')] = Number(el.value);
      } else {
        options[el.id.replace('opt-', '')] = el.value;
      }
    });
    return options;
  }

  validateOptions() {
    const inputs = this.options.querySelectorAll('input[required], select[required], textarea[required]');
    for (const input of inputs) {
      if (!input.reportValidity()) {
        input.focus();
        return false;
      }
    }
    return true;
  }

  async startProcessing() {
    if (this.isProcessing) return;
    if (!this.files.length) {
      this.processStatus.textContent = 'Choose files first.';
      this.goToStep(1);
      return;
    }
    if (!this.validateOptions()) {
      this.goToStep(2);
      return;
    }
    if (!this.state.token) {
      this.processStatus.textContent = 'Please sign in to process files.';
      this.goToStep(1);
      return;
    }

    this.isProcessing = true;
    this.cancelBtn.disabled = false;
    this.progressContainer.hidden = false;
    this.updateProgress(0, 'Starting…');

    try {
      // Verify session
      await this.callbacks.onVerifySession?.();

      const options = this.getOptions();
      this.results = await this.callbacks.onProcess(this.activeTool, this.files, options, (percent, text) => {
        this.updateProgress(percent, text);
      });

      this.showResults();
      this.goToStep(4);
      Toast.success(`Done. ${this.results.length} file${this.results.length !== 1 ? 's' : ''} ready.`);
    } catch (error) {
      this.processStatus.textContent = error.message || 'Unable to process files. Try a smaller or unencrypted file.';
      if ([401, 403].includes(error.status)) {
        // Session expired
        this.state.token = null;
        this.state.user = null;
        sessionStorage.removeItem('ndc_tools_token');
        this.loginReminder.hidden = false;
        this.goToStep(1);
      } else {
        this.goToStep(2);
      }
    } finally {
      this.isProcessing = false;
      this.cancelBtn.disabled = true;
    }
  }

  handleCancel() {
    this.isProcessing = false;
    this.processStatus.textContent = 'Cancelling…';
    Toast.info('Processing cancelled');
    // Allow going back to configure
    this.goToStep(2);
  }

  handleReset() {
    if (this.isProcessing) return;
    this.files = [];
    this.results = [];
    this.fileUpload.clear();
    this.renderFileList();
    this.updateSelectionCount();
    this.continueToConfig.disabled = true;
    this.goToStep(1);
  }

  showResults() {
    this.resultPreview.innerHTML = '';
    this.resultActions.innerHTML = '';

    // Stats
    const totalInput = this.files.reduce((sum, f) => sum + f.size, 0);
    const totalOutput = this.results.reduce((sum, r) => sum + r.blob.size, 0);
    const savings = totalInput > 0 ? ((1 - totalOutput / totalInput) * 100).toFixed(1) : 0;

    this.resultStats.innerHTML = `
      <div class="result-stat"><span>${this.results.length} file${this.results.length !== 1 ? 's' : ''}</span></div>
      <div class="result-stat"><span class="result-stat-value">${this.formatFileSize(totalOutput)}</span> total output</div>
      ${totalInput > 0 && totalOutput < totalInput ? `<div class="result-stat"><span class="result-stat-value success">${savings}%</span> smaller</div>` : ''}
    `;

    // Previews for images
    const imageResults = this.results.filter(r => r.blob.type.startsWith('image/'));
    if (imageResults.length > 0) {
      const previewGrid = document.createElement('div');
      previewGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: var(--space-3);';
      imageResults.forEach((result, i) => {
        const url = URL.createObjectURL(result.blob);
        const img = document.createElement('img');
        img.src = url;
        img.alt = result.name;
        img.style.cssText = 'width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--color-border);';
        previewGrid.appendChild(img);
      });
      this.resultPreview.appendChild(previewGrid);
    }

    // Download buttons
    this.results.forEach((result, i) => {
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.name;
      a.className = 'btn btn-secondary';
      a.style.cssText = 'flex: 1; min-width: 180px;';
      a.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        ${result.name} (${this.formatFileSize(result.blob.size)})
      `;
      this.resultActions.appendChild(a);
    });

    // ZIP download for multiple results
    if (this.results.length > 1) {
      const zipBtn = document.createElement('button');
      zipBtn.className = 'btn btn-primary';
      zipBtn.style.cssText = 'flex: 1; min-width: 180px;';
      zipBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download all as ZIP
      `;
      zipBtn.addEventListener('click', () => this.downloadAsZip());
      this.resultActions.prepend(zipBtn);
    }
  }

  async downloadAsZip() {
    const zipBtn = this.resultActions.querySelector('.btn-primary');
    if (!zipBtn) return;

    zipBtn.disabled = true;
    zipBtn.textContent = 'Preparing ZIP…';

    try {
      // Load JSZip
      const JSZip = (await import('../../vendor/jszip.min.js')).default;
      const zip = new JSZip();

      for (const [i, result] of this.results.entries()) {
        const name = `${String(i + 1).padStart(3, '0')}-${result.name}`;
        zip.file(name, await result.blob.arrayBuffer());
      }

      const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.activeTool.id}-results.zip`;
      a.textContent = `Download ZIP (${this.formatFileSize(blob.size)})`;
      a.className = 'btn btn-primary';
      a.style.cssText = 'flex: 1; min-width: 180px;';
      this.resultActions.prepend(a);
      a.click();

      Toast.success('ZIP ready for download');
    } catch (error) {
      Toast.error('ZIP creation failed: ' + error.message);
    } finally {
      zipBtn.disabled = false;
      zipBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download all as ZIP
      `;
    }
  }

  triggerFilePicker() {
    this.fileInput.click();
  }

  triggerProcess() {
    if (!this.isProcessing) {
      if (this.currentStep === 1) this.goToStep(2);
      else if (this.currentStep === 2) this.goToStep(3);
    }
  }

  triggerDownload() {
    const firstLink = this.resultActions.querySelector('a[download]');
    if (firstLink) firstLink.click();
  }

  triggerCopy() {
    // Copy first result as text/blob - simplified
    Toast.info('Copy not implemented for this result type');
  }

  updateProgress(percent, text) {
    this.progressFill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    this.progressPercent.textContent = `${Math.round(percent)}%`;
    if (text) this.progressText.textContent = text;
  }

  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }
}
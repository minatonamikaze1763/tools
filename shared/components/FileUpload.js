/**
 * File Upload Component — Reusable drag-and-drop file handling
 */

export class FileUpload {
  constructor(dropZone, fileInput, config = {}) {
    this.dropZone = dropZone;
    this.fileInput = fileInput;
    this.config = {
      accept: '',
      multiple: false,
      maxFiles: 20,
      maxFileSize: 25 * 1024 * 1024,
      maxTotalSize: 100 * 1024 * 1024,
      onFilesChange: () => {},
      ...config
    };
    this.files = [];
    this.objectUrls = new Set();
    this.bindEvents();
  }

  bindEvents() {
    // Click to browse
    this.dropZone.addEventListener('click', (e) => {
      if (e.target === this.dropZone || e.target.closest('.choose-button')) {
        this.fileInput.click();
      }
    });

    // Keyboard activation
    this.dropZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.fileInput.click();
      }
    });

    // File input change
    this.fileInput.addEventListener('change', (e) => {
      this.handleFiles(Array.from(e.target.files));
      this.fileInput.value = '';
    });

    // Drag and drop
    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.add('dragging');
    });

    this.dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.dropZone.contains(e.relatedTarget)) {
        this.dropZone.classList.remove('dragging');
      }
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.dropZone.classList.remove('dragging');
      this.handleFiles(Array.from(e.dataTransfer.files));
    });

    // Paste files (Ctrl+V)
    document.addEventListener('paste', (e) => {
      if (this.dropZone === document.activeElement || this.dropZone.contains(document.activeElement)) {
        const items = e.clipboardData.items;
        const files = [];
        for (const item of items) {
          if (item.kind === 'file') {
            files.push(item.getAsFile());
          }
        }
        if (files.length) {
          this.handleFiles(files);
        }
      }
    });
  }

  handleFiles(newFiles) {
    if (this.config.onFilesChange) {
      // Validate files
      const validFiles = [];
      const errors = [];

      for (const file of newFiles) {
        const validation = this.validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      }

      // Check total count
      if (this.files.length + validFiles.length > this.config.maxFiles) {
        errors.push(`Maximum ${this.config.maxFiles} files allowed`);
        validFiles.splice(this.config.maxFiles - this.files.length);
      }

      // Check total size
      const totalSize = this.files.reduce((sum, f) => sum + f.size, 0) +
        validFiles.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > this.config.maxTotalSize) {
        errors.push(`Total size exceeds ${this.formatSize(this.config.maxTotalSize)}`);
        // Remove largest files until under limit
        validFiles.sort((a, b) => b.size - a.size);
        while (totalSize > this.config.maxTotalSize && validFiles.length) {
          totalSize -= validFiles.shift().size;
        }
      }

      if (errors.length) {
        // Show first error
        this.config.onFilesChange(this.files, errors[0]);
        return;
      }

      this.files = [...this.files, ...validFiles];
      this.config.onFilesChange(this.files, null);
    }
  }

  validateFile(file) {
    // Check file type
    if (this.config.accept) {
      const acceptedTypes = this.config.accept.split(',').map(t => t.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });
      if (!isAccepted) {
        return { valid: false, error: `File type not allowed. Accepted: ${this.config.accept}` };
      }
    }

    // Check file size
    if (file.size > this.config.maxFileSize) {
      return { valid: false, error: `File too large (max ${this.formatSize(this.config.maxFileSize)})` };
    }

    // Check empty
    if (file.size === 0) {
      return { valid: false, error: 'File is empty' };
    }

    return { valid: true };
  }

  removeFile(index) {
    if (index >= 0 && index < this.files.length) {
      this.files.splice(index, 1);
      this.config.onFilesChange(this.files, null);
    }
  }

  clear() {
    this.files = [];
    this.config.onFilesChange(this.files, null);
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.fileInput.accept = this.config.accept;
    this.fileInput.multiple = this.config.multiple;
  }

  formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  // Static method to revoke all object URLs
  static revokeAll() {
    // This would be called on page unload
    // Individual components should track their own URLs
  }

  destroy() {
    this.files = [];
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls.clear();
  }
}
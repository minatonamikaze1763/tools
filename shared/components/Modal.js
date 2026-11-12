/**
 * Modal System — Accessible modal dialogs
 */

export class Modal {
  static modals = new Map();
  static activeModal = null;
  static focusStack = [];

  static open(id, content, options = {}) {
    // Close existing modal with same ID
    if (this.modals.has(id)) {
      this.close(id);
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', `${id}-title`);
    overlay.hidden = true;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = id;

    const { title, size = 'md', closable = true, onClose } = options;

    const sizes = {
      sm: 'max-width: 360px;',
      md: 'max-width: 560px;',
      lg: 'max-width: 720px;',
      xl: 'max-width: 960px;',
      full: 'max-width: 95vw; max-height: 95vh;'
    };

    modal.style.cssText = sizes[size] || sizes.md;

    let headerHTML = '';
    if (title) {
      headerHTML = `
        <div class="modal-header">
          <h3 id="${id}-title" class="modal-title">${title}</h3>
          ${closable ? '<button class="modal-close" aria-label="Close">&times;</button>' : ''}
        </div>
      `;
    }

    modal.innerHTML = `
      ${headerHTML}
      <div class="modal-body">${content}</div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Store modal reference
    this.modals.set(id, { overlay, modal, onClose, title });

    // Bind events
    if (closable) {
      overlay.querySelector('.modal-close').addEventListener('click', () => this.close(id));
    }
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close(id);
    });

    // Show with animation
    requestAnimationFrame(() => {
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      this.activeModal = id;
      this.focusStack.push(document.activeElement);

      // Focus management
      const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
      else modal.focus();

      // Trap focus
      this.trapFocus(modal);
    });

    // Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape' && this.activeModal === id) {
        this.close(id);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    overlay._escapeHandler = escapeHandler;

    return {
      close: () => this.close(id),
      updateContent: (newContent) => {
        modal.querySelector('.modal-body').innerHTML = newContent;
      }
    };
  }

  static close(id) {
    const modalData = this.modals.get(id);
    if (!modalData) return;

    const { overlay, modal, onClose } = modalData;

    // Remove focus trap
    document.removeEventListener('keydown', overlay._escapeHandler);

    // Restore focus
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }

    // Animation
    overlay.style.animation = 'fadeIn 0.2s ease reverse';
    modal.style.animation = 'slideUp 0.3s ease reverse';

    setTimeout(() => {
      overlay.remove();
      this.modals.delete(id);
      if (this.activeModal === id) {
        this.activeModal = this.modals.size > 0 ? Array.from(this.modals.keys()).pop() : null;
      }
      if (this.modals.size === 0) {
        document.body.style.overflow = '';
      }
      onClose?.();
    }, 200);
  }

  static closeAll() {
    const ids = Array.from(this.modals.keys());
    ids.forEach(id => this.close(id));
  }

  static trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    modal._focusTrapHandler = handleTab;
  }

  static get(id) {
    return this.modals.get(id);
  }

  static isOpen(id) {
    return this.modals.has(id);
  }
}

// Confirmation dialog helper
export async function confirmDialog(message, options = {}) {
  const { title = 'Confirm', confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' } = options;

  return new Promise((resolve) => {
    const content = `
      <p style="margin: 0 0 var(--space-6); color: var(--color-text-secondary);">${message}</p>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
        <button class="btn btn-${type === 'danger' ? 'primary' : 'secondary'}" data-action="confirm">${confirmText}</button>
      </div>
    `;

    const modal = Modal.open('confirm-dialog', content, { title, size: 'sm' });

    modal.modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
      modal.close();
      resolve(true);
    });
    modal.modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      modal.close();
      resolve(false);
    });
  });
}

// Alert dialog helper
export function alertDialog(message, options = {}) {
  const { title = 'Notice', confirmText = 'OK', type = 'info' } = options;

  return new Promise((resolve) => {
    const content = `
      <p style="margin: 0 0 var(--space-6); color: var(--color-text-secondary);">${message}</p>
      <div class="modal-footer">
        <button class="btn btn-primary" data-action="ok">${confirmText}</button>
      </div>
    `;

    const modal = Modal.open('alert-dialog', content, { title, size: 'sm' });

    modal.modal.querySelector('[data-action="ok"]').addEventListener('click', () => {
      modal.close();
      resolve(true);
    });
  });
}

// Prompt dialog helper
export function promptDialog(message, defaultValue = '', options = {}) {
  const { title = 'Input', confirmText = 'OK', cancelText = 'Cancel', inputType = 'text', placeholder = '' } = options;

  return new Promise((resolve) => {
    const content = `
      <p style="margin: 0 0 var(--space-4); color: var(--color-text-secondary);">${message}</p>
      <input type="${inputType}" class="form-input" id="promptInput" value="${defaultValue}" placeholder="${placeholder}" style="margin-bottom: var(--space-6);" />
      <div class="modal-footer">
        <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
        <button class="btn btn-primary" data-action="confirm">${confirmText}</button>
      </div>
    `;

    const modal = Modal.open('prompt-dialog', content, { title, size: 'sm' });

    const input = modal.modal.querySelector('#promptInput');
    input.focus();
    input.select();

    const handleConfirm = () => {
      modal.close();
      resolve(input.value);
    };
    const handleCancel = () => {
      modal.close();
      resolve(null);
    };

    modal.modal.querySelector('[data-action="confirm"]').addEventListener('click', handleConfirm);
    modal.modal.querySelector('[data-action="cancel"]').addEventListener('click', handleCancel);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleConfirm();
      if (e.key === 'Escape') handleCancel();
    });
  });
}
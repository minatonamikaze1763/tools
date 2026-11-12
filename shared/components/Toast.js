/**
 * Toast Notification System
 */

export class Toast {
  static container = null;
  static initialized = false;

  static init() {
    if (this.initialized) return;

    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Notifications');
    this.container.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.container);

    this.initialized = true;
  }

  static show(message, type = 'info', options = {}) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      progress: '<svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        ${options.title ? `<div class="toast-title">${options.title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => this.remove(toast));

    // Auto-dismiss
    const duration = options.duration || (type === 'progress' ? 0 : 5000);
    let dismissTimer = null;
    if (duration > 0) {
      dismissTimer = setTimeout(() => this.remove(toast), duration);
    }

    // Pause on hover
    toast.addEventListener('mouseenter', () => {
      if (dismissTimer) clearTimeout(dismissTimer);
    });
    toast.addEventListener('mouseleave', () => {
      if (duration > 0) {
        dismissTimer = setTimeout(() => this.remove(toast), 2000);
      }
    });

    this.container.appendChild(toast);

    // Limit number of toasts
    const maxToasts = 5;
    while (this.container.children.length > maxToasts) {
      this.remove(this.container.firstElementChild);
    }

    return {
      element: toast,
      update: (newMessage, newType) => {
        toast.querySelector('.toast-message').textContent = newMessage;
        if (newType) {
          toast.className = `toast toast-${newType}`;
          toast.querySelector('.toast-icon').innerHTML = icons[newType] || icons.info;
        }
      },
      dismiss: () => this.remove(toast)
    };
  }

  static remove(toast) {
    if (!toast || !toast.parentElement) return;
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }

  static success(message, options) {
    return this.show(message, 'success', options);
  }

  static error(message, options) {
    return this.show(message, 'error', { duration: 8000, ...options });
  }

  static warning(message, options) {
    return this.show(message, 'warning', options);
  }

  static info(message, options) {
    return this.show(message, 'info', options);
  }

  static progress(message, options) {
    return this.show(message, 'progress', { duration: 0, ...options });
  }

  static clearAll() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Add slideIn animation for toast removal
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
  }
`;
document.head.appendChild(style);
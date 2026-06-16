/**
 * PrimeADB Toast Notification System
 * Global toast manager that shows messages in the bottom-right corner.
 */

const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

let container = null;

function getContainer() {
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a toast notification.
 * @param {object} options
 * @param {string} options.title
 * @param {string} [options.message]
 * @param {'success'|'error'|'warning'|'info'} [options.type='info']
 * @param {number} [options.duration=3500]
 */
function showToast({ title, message = '', type = 'info', duration = 3500 }) {
  const c = getContainer();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="btn-ghost btn btn-sm" onclick="this.parentElement.remove()" style="margin-left:auto; padding:4px 6px;">✕</button>
  `;

  c.appendChild(toast);

  // Auto-remove
  setTimeout(() => {
    toast.classList.add('exiting');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Convenience wrappers
const toast = {
  success: (title, message, duration) => showToast({ title, message, type: 'success', duration }),
  error:   (title, message, duration) => showToast({ title, message, type: 'error', duration: duration || 5000 }),
  warning: (title, message, duration) => showToast({ title, message, type: 'warning', duration }),
  info:    (title, message, duration) => showToast({ title, message, type: 'info', duration }),
};

// Make globally available
window.toast = toast;

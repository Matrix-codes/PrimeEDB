/**
 * PrimeADB Modal Component
 * Reusable modal dialogs for confirmations and inputs.
 */

/**
 * Show a confirmation modal.
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} [options.confirmText='Confirm']
 * @param {string} [options.cancelText='Cancel']
 * @param {'danger'|'primary'|'warning'} [options.confirmType='primary']
 * @returns {Promise<boolean>}
 */
function confirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmType = 'primary' }) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal animate-scale-in">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">${message}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-cancel">${cancelText}</button>
          <button class="btn btn-${confirmType}" id="modal-confirm">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = (result) => {
      overlay.remove();
      resolve(result);
    };

    overlay.querySelector('#modal-confirm').onclick = () => close(true);
    overlay.querySelector('#modal-cancel').onclick = () => close(false);
    overlay.querySelector('#modal-close-btn').onclick = () => close(false);
    overlay.onclick = (e) => { if (e.target === overlay) close(false); };
  });
}

/**
 * Show a text input modal.
 * @param {object} options
 * @param {string} options.title
 * @param {string} [options.placeholder]
 * @param {string} [options.defaultValue]
 * @param {string} [options.confirmText='OK']
 * @returns {Promise<string|null>} null if cancelled
 */
function prompt({ title, placeholder = '', defaultValue = '', confirmText = 'OK' }) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal animate-scale-in">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">
          <input type="text" id="modal-input" class="" placeholder="${placeholder}" value="${defaultValue}" style="width:100%;"/>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-confirm">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const input = overlay.querySelector('#modal-input');
    input.focus();
    input.select();

    const close = (result) => {
      overlay.remove();
      resolve(result);
    };

    overlay.querySelector('#modal-confirm').onclick = () => close(input.value.trim() || null);
    overlay.querySelector('#modal-cancel').onclick = () => close(null);
    overlay.querySelector('#modal-close-btn').onclick = () => close(null);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') close(input.value.trim() || null);
      if (e.key === 'Escape') close(null);
    });
  });
}

window.modal = { confirm, prompt };

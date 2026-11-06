import { $ } from '../utils/dom.js';

/**
 * Toast Notification View
 */
export class Toast {
  constructor() {
    this.timer = null;
  }

  show(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => el.classList.remove('show'), 2800);
  }
}

export const toast = new Toast();

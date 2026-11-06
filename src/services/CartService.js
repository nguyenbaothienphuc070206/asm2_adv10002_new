import { Cart } from '../models/Cart.js';
import { storageService } from './StorageService.js';
import { analyticsService } from './AnalyticsService.js';
import { C } from '../config/catalog.js';
import { $ } from '../utils/dom.js';

/**
 * Shopping Bag Service
 * Coordinates cart state, persistence, UI badge synchronization, and animations.
 */
export class CartService {
  constructor() {
    const rawBag = storageService.get('bag', {});
    const filteredBag = Object.fromEntries(
      Object.entries(rawBag).filter(([k, v]) => C[k] && Number.isInteger(v) && v > 0 && v < 100)
    );
    const promo = storageService.get('promo', null);

    this.cart = new Cart(filteredBag, promo);
    this.onToastCallback = null;
    this.onCartChangeCallback = null;
  }

  save() {
    storageService.set('bag', this.cart.items);
    storageService.set('promo', this.cart.promo);
  }

  updateBadge() {
    const totalCount = this.cart.getItemCount();
    const cntEl = $('#cnt');
    if (cntEl) cntEl.textContent = totalCount;
    const boEl = $('#bo');
    if (boEl) boEl.setAttribute('aria-label', 'Bag (' + totalCount + ')');
  }

  add(id, triggerElement = null) {
    if (!C[id]) return;
    this.cart.add(id, 1);
    this.save();
    this.updateBadge();

    if (triggerElement) {
      const r = triggerElement.getBoundingClientRect();
      for (let i = 0; i < 5; i++) {
        const leaf = document.createElement('span');
        leaf.className = 'leaf';
        leaf.textContent = '✦';
        leaf.style.left = r.left + r.width / 2 + 'px';
        leaf.style.top = r.top + 'px';
        leaf.style.setProperty('--x', (i - 2) * 27 + 'px');
        document.body.appendChild(leaf);
        setTimeout(() => leaf.remove(), 850);
      }
    }

    analyticsService.track('add_to_bag');
    if (this.onToastCallback) {
      this.onToastCallback("Grandma's secret is in your bag.");
    }
    if (this.onCartChangeCallback) {
      this.onCartChangeCallback();
    }
  }

  setQuantity(id, count) {
    this.cart.setQuantity(id, count);
    this.save();
    this.updateBadge();
    if (this.onCartChangeCallback) {
      this.onCartChangeCallback();
    }
  }

  swapForDuo() {
    const swapped = this.cart.swapForDuo();
    if (swapped) {
      this.save();
      this.updateBadge();
      if (this.onCartChangeCallback) {
        this.onCartChangeCallback();
      }
    }
    return swapped;
  }

  applyPromo(code) {
    const ok = this.cart.applyPromoCode(code);
    if (ok) {
      analyticsService.track('promo_apply');
    }
    this.save();
    if (this.onCartChangeCallback) {
      this.onCartChangeCallback();
    }
    return ok;
  }

  clear() {
    this.cart.clear();
    this.save();
    this.updateBadge();
    if (this.onCartChangeCallback) {
      this.onCartChangeCallback();
    }
  }
}

export const cartService = new CartService();

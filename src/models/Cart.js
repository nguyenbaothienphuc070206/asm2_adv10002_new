import { CODES } from '../config/constants.js';
import { C } from '../config/catalog.js';
import { M } from '../utils/formatters.js';

/**
 * Cart Domain Model
 */
export class Cart {
  constructor(initialItems = {}, promo = null) {
    this.items = { ...initialItems };
    this.promo = CODES[promo] ? promo : null;
    this.promoMessage = '';
  }

  setQuantity(id, qty) {
    if (!C[id]) return;
    const count = Math.max(0, Math.min(99, qty));
    if (count > 0) {
      this.items[id] = count;
    } else {
      delete this.items[id];
    }
  }

  add(id, amount = 1) {
    if (!C[id]) return;
    const current = this.items[id] || 0;
    this.items[id] = Math.min(99, current + amount);
  }

  remove(id, amount = 1) {
    if (!this.items[id]) return;
    const count = this.items[id] - amount;
    if (count > 0) {
      this.items[id] = count;
    } else {
      delete this.items[id];
    }
  }

  clear() {
    for (const key in this.items) {
      delete this.items[key];
    }
    this.promo = null;
    this.promoMessage = '';
  }

  swapForDuo() {
    if (this.items.wash && this.items.cream) {
      this.items.wash--;
      this.items.cream--;
      if (!this.items.wash) delete this.items.wash;
      if (!this.items.cream) delete this.items.cream;
      this.items.duo = Math.min(99, (this.items.duo || 0) + 1);
      return true;
    }
    return false;
  }

  getItemCount() {
    return Object.values(this.items).reduce((sum, count) => sum + count, 0);
  }

  getSubtotal() {
    return Object.keys(this.items).reduce((sum, id) => {
      const product = C[id];
      return sum + (product ? product.p * this.items[id] : 0);
    }, 0);
  }

  getDiscount(subtotal = this.getSubtotal()) {
    if (!this.promo || !CODES[this.promo]) return 0;
    const [pct, min] = CODES[this.promo];
    return subtotal >= min ? Math.floor((subtotal * pct) / 100 / 1000) * 1000 : 0;
  }

  getShipping(subtotal = this.getSubtotal()) {
    if (this.promo === 'FREESHIP') return 0;
    return !subtotal || subtotal >= 199000 ? 0 : 20000;
  }

  getTotal() {
    const sub = this.getSubtotal();
    const d = this.getDiscount(sub);
    const ship = this.getShipping(sub);
    return sub - d + ship;
  }

  getRecommendedTier(subtotal = this.getSubtotal()) {
    if (subtotal >= 250000) return ['THORA20', 20];
    if (subtotal >= 150000) return ['THORA15', 15];
    return ['THORA10', 10];
  }

  applyPromoCode(rawCode) {
    const code = String(rawCode || '').trim().toUpperCase();
    const sub = this.getSubtotal();
    if (!CODES[code]) {
      this.promoMessage = 'That code is not valid.';
      return false;
    }
    if (sub < CODES[code][1]) {
      this.promoMessage = 'Add ' + M(CODES[code][1] - sub) + ' more to use ' + code + '.';
      return false;
    }
    this.promo = code;
    this.promoMessage = 'Code ' + code + ' applied.';
    return true;
  }
}

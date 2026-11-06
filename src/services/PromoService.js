import { storageService } from './StorageService.js';
import { analyticsService } from './AnalyticsService.js';
import { cartService } from './CartService.js';
import { PROMO_AFTER } from '../config/constants.js';
import { $, $$ } from '../utils/dom.js';

/**
 * Timed Promo Popup Service
 * Evaluates active browsing time and eligibility rules for showing retention discount codes.
 */
export class PromoService {
  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.promoAfter = +urlParams.get('promo') || PROMO_AFTER;
    this.activeSeconds = 0;
    this.lastActivity = Date.now();
    this.pShown = false;
    this.timer = null;

    this.bindActivityListeners();
    this.startTracker();
  }

  bindActivityListeners() {
    ['pointermove', 'keydown', 'scroll', 'touchstart', 'click'].forEach((evt) => {
      window.addEventListener(evt, () => (this.lastActivity = Date.now()), { passive: true });
    });
  }

  showPromo(force = false) {
    const [code, pct] = cartService.cart.getRecommendedTier();
    const pcodeEl = $('#pcode');
    const ppctEl = $('#ppct');
    const pnoteEl = $('#pnote');
    const promoEl = $('#promo');
    const liveEl = $('#live');

    if (pcodeEl) pcodeEl.textContent = code;
    if (ppctEl) ppctEl.textContent = pct + '%';
    if (pnoteEl) {
      pnoteEl.textContent =
        'Demo offer for this concept. Orders over 150,000 VND unlock 15%, over 250,000 VND unlock 20%.';
    }
    if (promoEl) promoEl.hidden = false;
    if (liveEl) liveEl.textContent = 'A discount code is available.';

    this.pShown = true;
    storageService.set('pshown', Date.now());
    analyticsService.track('promo_shown');
  }

  isPromoReady() {
    const scanView = $('#scan-view');
    const scanBusy =
      scanView &&
      !scanView.hidden &&
      ['s-capture', 's-work', 's-q'].some((id) => {
        const el = $('#' + id);
        return el && !el.hidden;
      });

    const bag = $('#bag');
    const contactView = $('#contact-view');
    const openDialogs = $$('dialog[open]').length;
    const lastShown = storageService.get('pshown', 0);

    return (
      !this.pShown &&
      Date.now() - lastShown > 864e5 &&
      bag &&
      bag.hidden &&
      !openDialogs &&
      !scanBusy &&
      !cartService.cart.promo &&
      contactView &&
      contactView.hidden
    );
  }

  startTracker() {
    this.timer = setInterval(() => {
      if (document.visibilityState !== 'visible' || Date.now() - this.lastActivity > 30000) {
        return;
      }
      this.activeSeconds++;
      if (this.activeSeconds >= this.promoAfter && this.isPromoReady()) {
        this.showPromo();
      }
    }, 1000);
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
  }
}

export const promoService = new PromoService();

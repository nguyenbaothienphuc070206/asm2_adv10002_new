import { cartService } from '../services/CartService.js';
import { analyticsService } from '../services/AnalyticsService.js';
import { ecommerceService } from '../services/EcommerceService.js';
import { authService } from '../services/AuthService.js';
import { BagDrawer } from '../views/BagDrawer.js';
import { M } from '../utils/formatters.js';
import { lockScrollAndInert, $ } from '../utils/dom.js';

/**
 * Shopping Bag and Checkout Drawer Controller
 */
export class BagController {
  constructor() {
    this.lastFocusedElement = null;

    cartService.onCartChangeCallback = () => this.render();
  }

  open() {
    this.lastFocusedElement = document.activeElement;
    const bag = $('#bag');
    const bb = $('#bb');
    if (bag) bag.hidden = false;
    if (bb) bb.hidden = false;
    lockScrollAndInert(true);
    this.render();

    const bx = $('#bx');
    if (bx) bx.focus();
  }

  close() {
    const bag = $('#bag');
    const bb = $('#bb');
    if (!bag || bag.hidden) return;
    bag.hidden = true;
    if (bb) bb.hidden = true;
    lockScrollAndInert(false);
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.focus();
    }
  }

  render() {
    const bl = $('#bl');
    const bf = $('#bf');

    if (bl) {
      bl.innerHTML = BagDrawer.renderItemsList(cartService.cart.items);
    }
    if (bf) {
      bf.innerHTML = BagDrawer.renderFooter(cartService.cart);
    }
  }

  openCheckout() {
    analyticsService.track('checkout_start');
    const bf = $('#bf');
    if (bf) {
      bf.innerHTML = BagDrawer.renderCheckoutForm();
    }
  }

  handleCheckoutSubmit(form) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const btn = form.querySelector('button');
    if (btn) btn.disabled = true;

    const sub = cartService.cart.getSubtotal();
    const d = cartService.cart.getDiscount(sub);
    const inputs = form.querySelectorAll('input,select');
    const customerName = inputs[0]?.value || 'Thorakao Customer';
    const phone = inputs[1]?.value || '';
    const address = inputs[2]?.value || 'Ho Chi Minh City';

    const createdOrder = ecommerceService.createOrder({
      customerName,
      customerEmail: authService.getCurrentUser()?.email || '',
      phone,
      city: address.toLowerCase().includes('hanoi') ? 'Hanoi' : 'Ho Chi Minh City',
      address,
      items: { ...cartService.cart.items },
      subtotal: sub,
      discount: d,
      promoCode: cartService.cart.promo || ''
    });

    cartService.clear();

    const bl = $('#bl');
    const bf = $('#bf');
    if (bl) bl.innerHTML = '';
    if (bf) {
      bf.innerHTML = `<h3>Thank you!</h3><p style="margin-top:8px">Order #${
        createdOrder.id
      } is confirmed. Estimated delivery in 1 to 2 days (sample). This is a demo, so no payment was taken.</p>${
        d ? `<p class="save">You saved ${M(d)} with your code.</p>` : ''
      }<div class="row" style="margin-top:12px" data-i18n-skip="true"><button type="button" class="pill outline" data-eco-open="account">Track Order #${
        createdOrder.id
      } (${M(createdOrder.total)})</button></div>`;
    }

    analyticsService.track('purchase_complete');
  }
}

export const bagController = new BagController();

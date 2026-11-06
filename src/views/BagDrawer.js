import { C } from '../config/catalog.js';
import { M } from '../utils/formatters.js';

/**
 * Bag Drawer View Renderer
 */
export class BagDrawer {
  static renderItemsList(itemsMap) {
    const ids = Object.keys(itemsMap);
    if (!ids.length) {
      return '<p style="margin:16px 0">Your bag is empty. The Turmeric Set is a good start.</p>';
    }

    return ids
      .map(
        (i) =>
          `<div class="li"><span>${C[i].n}</span><span><button type="button" data-q="${i}|-1" aria-label="Remove one ${C[i].n}">−</button> ${itemsMap[i]} <button type="button" data-q="${i}|1" aria-label="Add one ${C[i].n}">+</button></span><b>${M(C[i].p * itemsMap[i])}</b></div>`
      )
      .join('');
  }

  static renderFooter(cart) {
    const ids = Object.keys(cart.items);
    if (!ids.length) {
      return '';
    }

    const sub = cart.getSubtotal();
    const d = cart.getDiscount(sub);
    const ship = cart.getShipping(sub);
    const total = sub - d + ship;

    const canSwap = cart.items.wash && cart.items.cream && !cart.items.duo;
    const promo = cart.promo;
    const pmsg = cart.promoMessage || (promo && !d ? 'Code ' + promo + ' needs a larger order.' : '');

    return `${
      canSwap
        ? '<p style="margin-top:12px"><button type="button" class="pill outline" data-swap>Swap for the Turmeric Set, save 15,000 VND</button></p>'
        : ''
    }
<form id="pf" class="row" style="margin-top:14px"><label for="pcin" class="sr">Promo code</label><input class="in" id="pcin" placeholder="Promo code" value="${
      promo || ''
    }" autocomplete="off" style="flex:1;min-width:150px"><button type="submit" class="pill outline">Apply</button></form><p id="pm" role="status" class="small">${pmsg}</p>
<p style="margin-top:12px"><progress max="199000" value="${Math.min(
      sub,
      199000
    )}"></progress><br>${
      sub >= 199000 ? 'Free shipping unlocked.' : 'Add ' + M(199000 - sub) + ' for free shipping.'
    }</p>
<p class="tot"><span>Subtotal</span><span>${M(sub)}</span></p>${
      d ? `<p class="tot save"><span>Discount (${promo})</span><span>-${M(d)}</span></p>` : ''
    }<p class="tot"><span>Shipping (sample)</span><span>${
      ship ? M(ship) : 'Free'
    }</span></p><p class="tot"><b>Total</b><b>${M(total)}</b></p><button type="button" class="pill" data-co>Checkout as guest</button>`;
  }

  static renderCheckoutForm() {
    return `<form id="co"><label for="cn">Full name</label><input class="in" id="cn" required autocomplete="name"><label for="cp">Phone</label><input class="in" id="cp" required type="tel" inputmode="tel" pattern="0[0-9]{9}" title="10 digits, starting with 0" autocomplete="tel"><label for="ca">Address (province/city, ward/commune, street)</label><input class="in" id="ca" required autocomplete="street-address"><fieldset><legend>Payment</legend><label><input type="radio" name="pm" checked> Cash on delivery</label><label><input type="radio" name="pm"> Bank transfer by QR</label><label><input type="radio" name="pm"> E-wallet</label></fieldset><button class="pill">Place order</button></form>`;
  }
}

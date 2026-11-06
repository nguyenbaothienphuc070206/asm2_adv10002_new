/**
 * Thorakao Web Application Entry Point
 * Orchestrates modules and provides backward-compatible window bridges.
 */

import { C } from './config/catalog.js';
import { M } from './utils/formatters.js';
import { toast } from './views/Toast.js';
import { i18nService } from './services/I18nService.js';
import { cartService } from './services/CartService.js';
import { mapService } from './services/MapService.js';
import { shopController } from './controllers/ShopController.js';
import { quizController } from './controllers/QuizController.js';
import { bagController } from './controllers/BagController.js';
import { tipsController } from './controllers/TipsController.js';
import { contactController } from './controllers/ContactController.js';
import { appController } from './controllers/AppController.js';

// Global window bridges for regression test suites and runtime integration
window.app = appController;
window.i18nService = i18nService;
window.cartService = cartService;
window.mapService = mapService;
window.shopController = shopController;
window.quizController = quizController;
window.bagController = bagController;
window.tipsController = tipsController;
window.contactController = contactController;

window.C = C;
window.M = M;
window.toast = (m) => toast.show(m);
window.go = (p, s, f, pop, cb) => appController.navigationController.go(p, s, f, pop, cb);
window.route = () => appController.navigationController.route();
window.add = (id, ev) => cartService.add(id, ev);
window.bo = () => bagController.open();
window.closeBag = () => bagController.close();
window.openPd = (id) => shopController.openProductDetails(id);
window.openArt = (id) => tipsController.openArticle(id);
window.subtotal = () => cartService.cart.getSubtotal();
window.disc = (sub) => cartService.cart.getDiscount(sub);
window.tier = () => cartService.cart.getRecommendedTier();
window.setStep = (i) => appController.setStep(i);
window.shop = () => shopController.renderShop();
window.qr = () => quizController.renderQuestion();
window.st = (id) => quizController.switchState(id);
window.locr = () => contactController.renderLocations();
window.mapr = () => mapService.renderMap();

window.B = cartService.cart.items;
window.W = shopController.wishlist;
window.S = quizController.profile;

Object.defineProperty(window, 'PROMO', {
  get: () => cartService.cart.promo,
  set: (v) => {
    cartService.cart.promo = v;
    cartService.save();
  },
  configurable: true
});

Object.defineProperty(window, 'MISS', {
  get: () => i18nService.missingStrings,
  configurable: true
});

Object.defineProperty(window, 'LANG', {
  get: () => i18nService.lang,
  set: (v) => i18nService.setLanguage(v),
  configurable: true
});

// Initialize application on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => appController.init());
} else {
  appController.init();
}

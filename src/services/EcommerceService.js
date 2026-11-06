/**
 * Complete E-Commerce, Inventory, Order Lifecycle & Shipping Service (Priority 4)
 * Manages real product stock counts, sorting, shipping fee calculation,
 * local order creation, live order tracking (#TH...), cancellations, and 30-day return requests.
 */

import { C } from '../config/catalog.js';
import { FREE_SHIPPING_THRESHOLD } from '../config/constants.js';
import { storageService } from './StorageService.js';

const DEFAULT_STOCK = {
  wash: 42,
  cream: 58,
  toner: 34,
  lip: 29,
  duo: 25,
  routine: 19,
  pomelo: 38,
  ginseng: 31,
  boket: 46,
  ginger: 22
};

export class EcommerceService {
  constructor() {
    this.ordersKey = 'thk_orders_v2';
    this.stockKey = 'thk_stock_v2';
    this.pricesKey = 'thk_prices_v2';
    this.vouchersKey = 'thk_vouchers_v2';
    this.ensureSeedData();
  }

  ensureSeedData() {
    const stock = storageService.get(this.stockKey, null);
    if (!stock || typeof stock !== 'object') {
      storageService.set(this.stockKey, { ...DEFAULT_STOCK });
    }

    const orders = storageService.get(this.ordersKey, null);
    if (!Array.isArray(orders) || orders.length === 0) {
      storageService.set(this.ordersKey, [
        {
          id: 'TH849201',
          customerName: 'Nguyễn Minh Anh (Sample Order)',
          customerEmail: 'minhanh.student@example.edu.vn',
          city: 'Ho Chi Minh City',
          address: '241bis Cách Mạng Tháng Tám, Quận 3',
          paymentMethod: 'COD (Cash on Delivery — Pending)',
          status: 'In Transit — Out for Delivery',
          items: { duo: 1, toner: 1 },
          subtotal: 144000,
          discount: 14400,
          shippingFee: 25000,
          total: 154600,
          createdAt: '2026-11-04T09:30:00.000Z',
          isSample: true
        }
      ]);
    }
  }

  getStockMap() {
    const saved = storageService.get(this.stockKey, {});
    return { ...DEFAULT_STOCK, ...(saved || {}) };
  }

  getStock(sku) {
    const map = this.getStockMap();
    return map[sku] !== undefined ? map[sku] : 20;
  }

  updateStock(sku, nextQty) {
    if (!C[sku]) return false;
    const map = this.getStockMap();
    map[sku] = Math.max(0, Math.min(999, Math.round(Number(nextQty) || 0)));
    storageService.set(this.stockKey, map);
    return true;
  }

  /**
   * Update SKU price (Admin Portal capability) within valid VND bounds
   * @param {string} sku
   * @param {number} nextPrice
   * @returns {boolean}
   */
  updatePrice(sku, nextPrice) {
    if (!C[sku]) return false;
    const clamped = Math.max(15000, Math.min(950000, Math.round(Number(nextPrice) / 1000) * 1000));
    C[sku].p = clamped;
    const savedPrices = storageService.get(this.pricesKey, {}) || {};
    savedPrices[sku] = clamped;
    storageService.set(this.pricesKey, savedPrices);
    return true;
  }

  /**
   * Sort an array of Product instances by user-selected criterion
   * @param {Array} products
   * @param {string} sortBy - 'featured' | 'price-asc' | 'price-desc' | 'rating-desc'
   * @returns {Array}
   */
  sortProducts(products, sortBy = 'featured') {
    const copy = [...products];
    if (sortBy === 'price-asc') {
      return copy.sort((a, b) => a.p - b.p);
    }
    if (sortBy === 'price-desc') {
      return copy.sort((a, b) => b.p - a.p);
    }
    if (sortBy === 'rating-desc') {
      return copy.sort((a, b) => b.r - a.r || b.c - a.c);
    }
    return copy;
  }

  /**
   * Calculate shipping fee based on subtotal, city, and promo code
   * @param {number} subtotalAfterDiscount
   * @param {string} city
   * @param {string} promoCode
   * @returns {number}
   */
  calculateShipping(subtotalAfterDiscount, city = 'Ho Chi Minh City', promoCode = '') {
    if (subtotalAfterDiscount <= 0) return 0;
    if (subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD) return 0;
    if (String(promoCode || '').toUpperCase() === 'FREESHIP') return 0;
    const isHcm = String(city || '').toLowerCase().includes('ho chi minh') || String(city || '').toLowerCase().includes('hcm');
    return isHcm ? 25000 : 35000;
  }

  /**
   * Create a new order record (never simulates fake payment card capture; records COD / Bank Transfer pending)
   * @param {object} payload
   * @returns {object}
   */
  createOrder(payload = {}) {
    const {
      customerName = 'Guest Customer',
      customerEmail = '',
      phone = '',
      city = 'Ho Chi Minh City',
      address = '',
      items = {},
      subtotal = 0,
      discount = 0,
      promoCode = '',
      paymentMethod = 'COD (Cash on Delivery — Pay upon inspection)'
    } = payload;

    const netSubtotal = Math.max(0, subtotal - discount);
    const shippingFee = this.calculateShipping(netSubtotal, city, promoCode);
    const total = netSubtotal + shippingFee;
    const orderId = 'TH' + Math.floor(100000 + Math.random() * 899999);

    // Deduct stock
    const stockMap = this.getStockMap();
    Object.entries(items).forEach(([sku, qty]) => {
      if (stockMap[sku] !== undefined) {
        stockMap[sku] = Math.max(0, stockMap[sku] - Number(qty || 1));
      }
    });
    storageService.set(this.stockKey, stockMap);

    const newOrder = {
      id: orderId,
      customerName: String(customerName).replace(/[<>]/g, '').trim().slice(0, 80),
      customerEmail: String(customerEmail).replace(/[<>]/g, '').trim().slice(0, 120),
      phone: String(phone).replace(/[<>]/g, '').trim().slice(0, 30),
      city: String(city).replace(/[<>]/g, '').trim(),
      address: String(address).replace(/[<>]/g, '').trim().slice(0, 200),
      paymentMethod: String(paymentMethod).replace(/[<>]/g, ''),
      status: 'Order Placed — Pending Dispatch (No online charge taken)',
      items: { ...items },
      subtotal,
      discount,
      shippingFee,
      total,
      createdAt: new Date().toISOString(),
      isSample: false
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    storageService.set(this.ordersKey, orders.slice(0, 30));
    return newOrder;
  }

  getOrders() {
    const list = storageService.get(this.ordersKey, []);
    return Array.isArray(list) ? list : [];
  }

  /**
   * Returns only orders belonging to the active customer (or guest/sample orders) to prevent cross-user data leakage
   * @param {object|null} user
   * @returns {Array}
   */
  getOrdersForUser(user = null) {
    const all = this.getOrders();
    if (!user) {
      return all.filter((o) => !o.customerEmail || o.isSample);
    }
    const email = String(user.email || '').toLowerCase();
    return all.filter(
      (o) => !o.customerEmail || o.customerEmail.toLowerCase() === email || o.isSample
    );
  }

  findOrder(orderId = '') {
    const clean = String(orderId || '')
      .replace(/^#/, '')
      .trim()
      .toUpperCase();
    return this.getOrders().find((o) => o.id.toUpperCase() === clean) || null;
  }

  updateOrderStatus(orderId, nextStatus) {
    const orders = this.getOrders();
    const target = orders.find((o) => o.id === orderId);
    if (!target) return null;
    target.status = String(nextStatus || '').replace(/[<>]/g, '');
    target.updatedAt = new Date().toISOString();
    storageService.set(this.ordersKey, orders);
    return target;
  }

  cancelOrder(orderId, reason = 'Customer requested cancellation') {
    const orders = this.getOrders();
    const target = orders.find((o) => o.id === orderId);
    if (!target) return null;
    target.status = `Cancelled (${String(reason).replace(/[<>]/g, '')})`;
    target.updatedAt = new Date().toISOString();
    storageService.set(this.ordersKey, orders);
    return target;
  }

  requestReturn(orderId, reason = 'Unopened 30-day return request') {
    const orders = this.getOrders();
    const target = orders.find((o) => o.id === orderId);
    if (!target) return null;
    target.status = `Return Requested — 30-Day Policy (${String(reason).replace(/[<>]/g, '')})`;
    target.updatedAt = new Date().toISOString();
    storageService.set(this.ordersKey, orders);
    return target;
  }
}

export const ecommerceService = new EcommerceService();

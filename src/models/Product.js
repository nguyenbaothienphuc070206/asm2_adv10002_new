import { M } from '../utils/formatters.js';

/**
 * Product Domain Model
 */
export class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.n;
    this.price = data.p;
    this.originalPrice = data.o || null;
    this.rating = data.r;
    this.reviewCount = data.c;
    this.benefits = data.b;
    this.bestFor = data.bf;
    this.tags = data.t;
    this.imageKey = data.k;
  }

  get formattedPrice() {
    return M(this.price);
  }

  get formattedOriginalPrice() {
    return this.originalPrice ? M(this.originalPrice) : null;
  }

  get hasDiscount() {
    return Boolean(this.originalPrice && this.originalPrice > this.price);
  }

  matchesTag(tag) {
    if (!tag || tag === 'all') return true;
    return this.tags.includes(tag);
  }

  toJSON() {
    return {
      id: this.id,
      n: this.name,
      p: this.price,
      o: this.originalPrice,
      r: this.rating,
      c: this.reviewCount,
      b: this.benefits,
      bf: this.bestFor,
      t: this.tags,
      k: this.imageKey
    };
  }
}

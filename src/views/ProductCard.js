import { IMG } from '../config/images.js';
import { M } from '../utils/formatters.js';

/**
 * Reusable Image Renderer
 * @param {string} key
 * @param {string} alt
 * @param {string} cls
 * @returns {string}
 */
export const renderImage = (key, alt, cls = '') =>
  `<img class="photo ${cls}" ${IMG[key] ? `src="${IMG[key]}" ` : ''}alt="${alt}" loading="lazy" decoding="async">`;

/**
 * Product Card Component Template
 * @param {object} p Product data object
 * @param {boolean} isWishlisted
 * @returns {string}
 */
export const renderProductCard = (p, isWishlisted = false) =>
  `<article class="product"><div class="product-img">${renderImage(p.k, p.n)}<button type="button" class="heart${
    isWishlisted ? ' on' : ''
  }" data-heart="${p.id}" aria-pressed="${Boolean(isWishlisted)}" aria-label="Save ${p.n}">${
    isWishlisted ? '♥' : '♡'
  }</button><button type="button" class="qv" data-pd="${p.id}">Quick view</button></div><div class="product-info"><span class="chip">Best for ${
    p.bf
  }</span><h3><button type="button" class="lnk" data-pd="${p.id}">${p.n}</button></h3><p>${
    p.b
  }</p><p aria-label="Rating ${p.r} of 5">★ ${p.r} (${p.c}, sample)</p><div class="product-foot"><strong>${M(
    p.p
  )}${p.o ? ` <s>${M(p.o)}</s>` : ''}</strong><button type="button" class="pill" data-add="${
    p.id
  }">Add to bag</button></div></div></article>`;

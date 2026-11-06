import { C } from '../config/catalog.js';
import { PRODUCT_INGREDIENTS, PRODUCT_HOW_TO_USE } from '../config/content.js';
import { getProductManifestEntry } from '../config/productManifest.js';
import { storageService } from '../services/StorageService.js';
import { analyticsService } from '../services/AnalyticsService.js';
import { ecommerceService } from '../services/EcommerceService.js';
import { herbalEcosystemService } from '../services/HerbalEcosystemService.js';
import { i18nService } from '../services/I18nService.js';
import { toast } from '../views/Toast.js';
import { renderProductCard, renderImage } from '../views/ProductCard.js';
import { M } from '../utils/formatters.js';
import { escapeHtml } from '../utils/string.js';
import { $, $$ } from '../utils/dom.js';

/**
 * Shop Controller
 * Manages product listings, categories, sorting, stock badges, wishlist,
 * 3D packaging inspection, and Digital Ingredient Passport quick-view dialogs.
 */
export class ShopController {
  constructor() {
    const rawWish = storageService.get('wish', {});
    this.wishlist = Object.fromEntries(
      Object.keys(rawWish)
        .filter((k) => C[k])
        .map((k) => [k, 1])
    );
    this.activeFilter = 'all';
    this.activeSort = 'featured';
  }

  isWishlisted(id) {
    return Boolean(this.wishlist[id]);
  }

  setSort(sortBy = 'featured') {
    this.activeSort = sortBy;
    this.renderShop(this.activeFilter);
  }

  setPackagingPerspective(mode = 'front') {
    const stage = $('#pd-pkg-stage');
    if (!stage) return;
    const img = stage.querySelector('img');
    if (!img) return;
    img.style.transition = 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)';
    if (mode === 'angle') {
      img.style.transform = 'perspective(720px) rotateY(-18deg) rotateX(7deg) scale(1.04)';
    } else if (mode === 'zoom') {
      img.style.transform = 'perspective(720px) scale(1.22)';
    } else {
      img.style.transform = 'none';
    }
    $$('[data-pkg-view]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.pkgView === mode);
    });
  }

  toggleWishlist(id) {
    if (this.wishlist[id]) {
      delete this.wishlist[id];
    } else {
      this.wishlist[id] = 1;
    }
    storageService.set('wish', this.wishlist);

    $$(`[data-heart="${id}"]`).forEach((btn) => {
      const isSaved = Boolean(this.wishlist[id]);
      btn.classList.toggle('on', isSaved);
      btn.textContent = btn.classList.contains('heart2')
        ? isSaved
          ? '♥ Saved'
          : '♡ Save'
        : isSaved
        ? '♥'
        : '♡';
      btn.setAttribute('aria-pressed', isSaved);
    });

    toast.show(
      this.wishlist[id] ? 'Saved to your wish list.' : 'Removed from your wish list.'
    );

    const shopView = $('#shop-view');
    if (this.activeFilter === 'saved' && shopView && !shopView.hidden) {
      this.renderShop();
    }
  }

  renderShop(filter = this.activeFilter) {
    this.activeFilter = filter;
    const isVi = i18nService.lang === 'vi';
    const filterOptions = [
      ['all', 'All'],
      ['saved', 'Saved (' + Object.keys(this.wishlist).length + ')'],
      ['blemish', 'Blemish-prone'],
      ['marks', 'Dark marks'],
      ['dull', 'Dull skin'],
      ['dry', 'Dry skin'],
      ['lips', 'Lip care']
    ];

    const sortOptions = [
      ['featured', isVi ? 'Nổi bật' : 'Featured'],
      ['price-asc', isVi ? 'Giá: Thấp → Cao' : 'Price: Low → High'],
      ['price-desc', isVi ? 'Giá: Cao → Thấp' : 'Price: High → Low'],
      ['rating-desc', isVi ? 'Đánh giá cao nhất' : 'Highest Rated']
    ];

    const fl = $('#fl');
    if (fl) {
      fl.innerHTML =
        filterOptions
          .map(
            (opt) =>
              `<button type="button" data-f="${opt[0]}" class="${
                this.activeFilter === opt[0] ? 'active' : ''
              }" aria-pressed="${this.activeFilter === opt[0]}">${opt[1]}</button>`
          )
          .join('') +
        `<span style="margin-left:auto;display:inline-flex;gap:6px;flex-wrap:wrap" data-i18n-skip="true">${sortOptions
          .map(
            (s) =>
              `<button type="button" data-sort="${s[0]}" class="${
                this.activeSort === s[0] ? 'active' : ''
              }" aria-pressed="${this.activeSort === s[0]}">${s[1]}</button>`
          )
          .join('')}</span>`;
    }

    const sg = $('#sg');
    if (sg) {
      const filtered = Object.values(C).filter(
        (p) =>
          this.activeFilter === 'all' ||
          (this.activeFilter === 'saved' ? this.wishlist[p.id] : p.t.includes(this.activeFilter))
      );

      const sorted = ecommerceService.sortProducts(filtered, this.activeSort);

      sg.innerHTML =
        sorted.map((p) => renderProductCard(p, this.isWishlisted(p.id))).join('') ||
        `<p>${
          this.activeFilter === 'saved'
            ? 'Nothing saved yet. Tap the heart on any product.'
            : 'No products match. Try another filter.'
        }</p>`;
    }
  }

  openProductDetails(id) {
    const p = C[id];
    if (!p) return;

    const pdc = $('#pdc');
    if (!pdc) return;

    const manifest = getProductManifestEntry(id);
    const passport = herbalEcosystemService.getProductPassport(id);
    const stockQty = ecommerceService.getStock(id);
    const isVi = i18nService.lang === 'vi';
    const isVerifiedStudio = manifest?.verificationStatus === 'VERIFIED_AUTHENTIC_PACKAGING';
    const manifestBadge = manifest
      ? `<div class="pd-manifest-meta" data-i18n-skip="true">
          <span class="yolo-badge ${isVerifiedStudio ? 'ok' : 'warn'}">${
            isVerifiedStudio
              ? `✓ ${
                  isVi ? 'Ảnh sản phẩm chính hãng' : 'Verified Thorakao Studio Asset'
                } (${manifest.dimensions})`
              : `ℹ️ ${
                  isVi
                    ? 'Sản phẩm Concept Học thuật — Đã ghi nhận trong Báo cáo Kiểm toán Ảnh'
                    : 'Academic Concept SKU — Documented in Missing-Image Report'
                } (${manifest.fallbackDimensions || '600x750'})`
          }</span>
          <span class="yolo-badge ok" style="margin-left:6px">${
            isVi ? `Còn hàng: ${stockQty} sản phẩm` : `In Stock: ${stockQty} units`
          }</span>
          <small style="display:block;margin-top:4px">${
            manifest.sourceAttribution || manifest.reason || ''
          }</small>
        </div>`
      : '';

    const passportSectionHtml = passport
      ? `<details open data-i18n-skip="true" style="margin-top:10px;border:1px solid var(--line);border-radius:14px;padding:12px;background:rgba(255,248,236,0.7)">
          <summary style="font-weight:700;cursor:pointer">
            🛡️ ${
              isVi
                ? `Hộ chiếu Thành phần Số & Truy xuất QR (${passport.passportId})`
                : `Digital Ingredient Passport & QR Traceability (${passport.passportId})`
            }
          </summary>
          <div style="display:flex;gap:14px;align-items:flex-start;margin-top:10px;flex-wrap:wrap">
            ${passport.qrSvg}
            <div style="flex:1;min-width:210px;font-size:13px">
              <p style="margin:0 0 6px"><b>${isVi ? 'Nhà sản xuất:' : 'Manufacturer:'}</b> ${escapeHtml(
                passport.manufacturer
              )}</p>
              <p style="margin:0 0 6px"><b>${isVi ? 'Địa chỉ:' : 'Registered Facility:'}</b> ${escapeHtml(
                passport.headquarters
              )}</p>
              <p style="margin:0 0 6px"><b>${isVi ? 'Tiêu chuẩn:' : 'Quality Standard:'}</b> ${escapeHtml(
                isVi ? passport.qualityStandardVi : passport.qualityStandardEn
              )}</p>
              <p style="margin:0 0 6px"><b>${isVi ? 'Thành phần INCI:' : 'Verified INCI List:'}</b> ${passport.inciList
                .map((item) => `<span class="chip" style="margin:2px">${escapeHtml(item)}</span>`)
                .join(' ')}</p>
              <p style="margin:0 0 6px"><b>${isVi ? 'Bảo quản:' : 'Storage:'}</b> ${escapeHtml(
                isVi ? passport.storageVi : passport.storageEn
              )}</p>
              <p style="margin:0;color:#6e5034"><small>ℹ️ <b>${
                isVi ? 'Trạng thái Lô SX (ERP):' : 'Batch/Lot Telemetry:'
              }</b> ${escapeHtml(isVi ? passport.batchStatusVi : passport.batchStatusEn)}</small></p>
            </div>
          </div>
        </details>`
      : '';

    pdc.innerHTML = `<div class="pdgrid"><div><div id="pd-pkg-stage" class="product-img pd-studio-stage" style="border-radius:20px;aspect-ratio:1/1.05;overflow:hidden">${renderImage(
      p.k,
      p.n
    )}</div><div class="row" style="margin-top:10px;justify-content:center" data-i18n-skip="true"><button type="button" class="yolo-preset-btn active" data-pkg-view="front">${
      isVi ? 'Góc Chính diện' : 'Front Studio'
    }</button><button type="button" class="yolo-preset-btn" data-pkg-view="angle">${
      isVi ? 'Góc Xoay 3D (+22°)' : '3D Packaging Angle'
    }</button><button type="button" class="yolo-preset-btn" data-pkg-view="zoom">${
      isVi ? 'Phóng to Nhãn (Zoom)' : 'Inspect Label Zoom'
    }</button></div></div><div><span class="chip">Best for ${p.bf}</span><h2 style="margin:10px 0 6px;font-size:30px">${
      p.n
    }</h2>${manifestBadge}<p style="margin:8px 0">★ ${p.r} (${p.c} reviews, sample)</p><p style="margin:8px 0">${
      p.b
    }</p><p class="price2">${M(p.p)}${
      p.o ? ` <s style="font-size:18px;opacity:.7">${M(p.o)}</s>` : ''
    }</p><p><small>Free shipping over 199,000 VND · 30-day returns · Cash on delivery (sample policies)</small></p>
<div class="row" style="margin:14px 0"><button type="button" class="pill" data-add="${
      p.id
    }">Add to bag</button><button type="button" class="pill outline heart2${
      this.wishlist[p.id] ? ' on' : ''
    }" data-heart="${p.id}" aria-pressed="${Boolean(this.wishlist[p.id])}">${
      this.wishlist[p.id] ? '♥ Saved' : '♡ Save'
    }</button></div>
<details open><summary>How to use</summary><p>${
      PRODUCT_HOW_TO_USE[p.id]
    } Always follow the leaflet in the box.</p></details><details><summary>Ingredients</summary><p>${
      PRODUCT_INGREDIENTS[p.id]
    }</p></details>${passportSectionHtml}<details><summary>Delivery and returns</summary><p>1 to 2 days in Ho Chi Minh City (sample). Unopened products can be returned within 30 days (sample).</p></details></div></div><button type="button" class="pill outline" data-close style="margin-top:14px">Close</button>`;

    const pd = $('#pd');
    if (pd) pd.showModal();
    analyticsService.track('product_view');
  }
}

export const shopController = new ShopController();

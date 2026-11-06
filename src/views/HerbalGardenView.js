import { BOTANICAL_WORLDS, HerbalGardenScene } from '../botanical3d/HerbalGardenScene.js';
import { C } from '../config/catalog.js';
import { PRODUCT_IMAGE_MANIFEST, MISSING_IMAGE_REPORT } from '../config/productManifest.js';
import { i18nService } from '../services/I18nService.js';
import { shopController } from '../controllers/ShopController.js';
import { renderProductCard } from './ProductCard.js';
import { $, $$ } from '../utils/dom.js';

/**
 * The Herbal Garden of Vietnam — 5-Act Interactive Botanical & 3D Storytelling Controller
 */
export class HerbalGardenView {
  constructor() {
    this.activeBotanicalId = 'turmeric';
    this.controlsCollapsed = false;
    this.scene3d = null;
  }

  /**
   * Mount the 5-Act Herbal Garden experience inside #story-view
   */
  mount() {
    const storyWrap = $('#story-view .wrap');
    if (!storyWrap) return;

    let root = $('#herbal-garden-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'herbal-garden-root';
      root.setAttribute('data-i18n-skip', 'true');
      const storyGrid = storyWrap.querySelector('.story-grid');
      if (storyGrid) {
        storyGrid.insertAdjacentElement('afterend', root);
      } else {
        storyWrap.appendChild(root);
      }
    }

    this.render();
  }

  /**
   * Render the 5-Act Vietnamese Botanical Experience
   */
  render() {
    const root = $('#herbal-garden-root');
    if (!root) return;

    const isVi = i18nService.lang === 'vi';
    const activeWorld =
      BOTANICAL_WORLDS.find((b) => b.id === this.activeBotanicalId) || BOTANICAL_WORLDS[0];

    root.innerHTML = `
      <!-- ACT 1: THE ORIGIN & ACT 2: THE 3D BOTANICAL WORLD -->
      <section class="hg-sanctuary" aria-label="${
        isVi ? 'Khu Vườn Thảo Mộc Việt Nam 3D' : 'The Herbal Garden of Vietnam 3D Sanctuary'
      }">
        <div class="hg-act-header">
          <span class="chip">${
            isVi
              ? 'Hồi 1 & 2 · Nguồn Cội & Thế Giới Thảo Mộc 3D'
              : 'Act I & II · The Origin & Interactive 3D Botanical Sanctuary'
          }</span>
          <h2 style="margin-top:10px">${
            isVi
              ? 'Khu Vườn Thảo Mộc Việt Nam — Di sản từ năm 1961'
              : 'The Herbal Garden of Vietnam — Living Botanicals in 3D'
          }</h2>
          <p class="lead" style="margin-top:10px">
            ${
              isVi
                ? 'Khám phá 5 thảo dược bản địa cốt lõi làm nên tên tuổi Thorakao suốt hơn sáu thập kỷ: Nghệ Vàng, Hoa Bưởi, Nhân Sâm, Bồ Kết Nướng và Gừng Tươi.'
                : 'Explore the five signature Vietnamese botanicals behind six decades of Thorakao formulations: Turmeric, Pomelo Blossom, Ginseng, Roasted Soapberry, and Ginger.'
            }
          </p>
        </div>

        <div class="hg-stage-grid">
          <div class="hg-viewport-wrap">
            <div id="herbal-3d-stage" class="hg-3d-canvas-box"></div>
            <div class="hg-hud-badge">
              <span>WebGL2 · Studio IBL</span>
              <span id="hg-active-latin">${activeWorld.latin}</span>
            </div>
            <div class="hg-dock ${this.controlsCollapsed ? 'collapsed' : ''}" id="hg-dock">
              <div class="hg-dock-bar">
                <div class="hg-dock-pills" role="group" aria-label="${
                  isVi ? 'Chọn thảo mộc 3D' : 'Select 3D botanical'
                }">
                  ${BOTANICAL_WORLDS.map(
                    (b) =>
                      `<button type="button" class="hg-bot-btn${
                        b.id === activeWorld.id ? ' active' : ''
                      }" data-botanical="${b.id}" aria-pressed="${b.id === activeWorld.id}">
                        ${isVi ? b.nameVi.split(' · ')[0] : b.nameEn.split(' · ')[0]}
                      </button>`
                  ).join('')}
                </div>
                <div class="hg-dock-actions">
                  <button type="button" class="hg-ctrl-btn" data-hg-action="spin" aria-label="${
                    isVi ? 'Bật/Tắt tự xoay 3D' : 'Toggle 3D auto-rotation'
                  }">${isVi ? 'Xoay 3D' : 'Auto-Spin'}</button>
                  <button type="button" class="hg-ctrl-btn" data-hg-action="reset" aria-label="${
                    isVi ? 'Đặt lại góc nhìn 3D' : 'Reset 3D camera angle'
                  }">${isVi ? 'Góc chuẩn' : 'Reset View'}</button>
                  <button type="button" class="hg-ctrl-btn" data-hg-action="toggle-dock" aria-expanded="${!this.controlsCollapsed}">
                    ${
                      this.controlsCollapsed
                        ? isVi
                          ? '▴ Mở điều khiển'
                          : '▴ Show Controls'
                        : isVi
                        ? '▾ Thu gọn'
                        : '▾ Hide Controls'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="hg-lore-card" id="hg-lore-card">
            ${this.renderBotanicalLoreHTML(activeWorld, isVi)}
          </div>
        </div>
      </section>

      <!-- ACT 3: THE SCIENCE OF FORMULATION -->
      <section class="hg-science-section" aria-label="${
        isVi ? 'Hồi 3: Khoa học bào chế thảo mộc' : 'Act III: The Science of Botanical Formulation'
      }">
        <span class="chip">${
          isVi
            ? 'Hồi 3 · Khoa Học Bào Chế Thảo Dược'
            : 'Act III · The Science of Botanical Formulation'
        }</span>
        <h2 style="margin-top:10px">${
          isVi
            ? 'Từ bí quyết gia truyền đến chuẩn mực CGMP-ASEAN'
            : 'From Ancestral Decoction to Modern CGMP-ASEAN Formulation'
        }</h2>
        <div class="hg-science-grid">
          <div class="hg-science-card">
            <span class="hg-step-num">01</span>
            <h3>${isVi ? 'Tuyển chọn thổ nhưỡng Việt Nam' : '1. Regional Terroir & Harvest'}</h3>
            <p>${
              isVi
                ? 'Nghệ vàng miền Bắc, vỏ bưởi Bến Tre, bồ kết trung du và gừng sẻ Tây Nguyên được thu hoạch đúng độ chín sinh học để tối ưu hàm lượng tinh dầu.'
                : 'Turmeric rhizomes, Mekong pomelo peel, midland soapberry pods, and highland ginger are harvested at peak phyto-active maturity.'
            }</p>
          </div>
          <div class="hg-science-card">
            <span class="hg-step-num">02</span>
            <h3>${
              isVi ? 'Chiết xuất bảo toàn hoạt chất' : '2. Cold-Maceration & Hydro-Distillation'
            }</h3>
            <p>${
              isVi
                ? 'Chưng cất hơi nước và ngâm chiết kiểm soát nhiệt giúp giữ trọn Curcuminoids, D-Limonene, Ginsenosides và Saponin tự nhiên mà không biến tính.'
                : 'Controlled steam distillation and gentle maceration preserve heat-sensitive curcuminoids, d-limonene, ginsenosides, and natural saponins.'
            }</p>
          </div>
          <div class="hg-science-card">
            <span class="hg-step-num">03</span>
            <h3>${
              isVi ? 'Cân bằng sinh lý da & Tối giản bước' : '3. Barrier-Safe Clinical Balance'
            }</h3>
            <p>${
              isVi
                ? 'Phối hợp hoạt chất thảo mộc với nền dưỡng ẩm dịu nhẹ, phù hợp khí hậu nhiệt đới nóng ẩm và mức giá sinh viên dễ tiếp cận.'
                : 'Botanical extracts are balanced for humid tropical skin in 2-to-3 step routines that remain accessible to every student and family.'
            }</p>
          </div>
        </div>
        <div class="hg-arch-svg-box">
          <svg viewBox="0 0 920 150" role="img" aria-label="${
            isVi
              ? 'Sơ đồ quy trình chiết xuất thảo dược và phân tích AI YOLOv8n'
              : 'Botanical Extraction & YOLOv8n AI Personalization Architecture Diagram'
          }">
            <rect x="12" y="22" width="200" height="106" rx="18" fill="#fbf3e2" stroke="#212e46" stroke-width="2"/>
            <text x="112" y="64" text-anchor="middle" font-weight="700" font-size="15" fill="#212e46">${
              isVi ? 'Thảo Mộc Bản Địa' : 'Raw VN Botanicals'
            }</text>
            <text x="112" y="88" text-anchor="middle" font-size="12" fill="#444e2d">Nghệ · Bưởi · Sâm · Bồ Kết · Gừng</text>

            <path d="M214 75 H254" stroke="#a51f1e" stroke-width="3"/>
            <polygon points="254,70 264,75 254,80" fill="#a51f1e"/>

            <rect x="266" y="22" width="200" height="106" rx="18" fill="#fbf3e2" stroke="#212e46" stroke-width="2"/>
            <text x="366" y="64" text-anchor="middle" font-weight="700" font-size="15" fill="#212e46">${
              isVi ? 'Chiết Xuất CGMP-ASEAN' : 'Phyto-Active Extraction'
            }</text>
            <text x="366" y="88" text-anchor="middle" font-size="12" fill="#444e2d">Curcumin · Limonene · Saponin</text>

            <path d="M468 75 H508" stroke="#a51f1e" stroke-width="3"/>
            <polygon points="508,70 518,75 508,80" fill="#a51f1e"/>

            <rect x="520" y="22" width="180" height="106" rx="18" fill="#fbf3e2" stroke="#212e46" stroke-width="2"/>
            <text x="610" y="64" text-anchor="middle" font-weight="700" font-size="15" fill="#212e46">YOLOv8n Skin Lab</text>
            <text x="610" y="88" text-anchor="middle" font-size="12" fill="#444e2d">mAP@50 0.809 · 5 Features</text>

            <path d="M702 75 H738" stroke="#a51f1e" stroke-width="3"/>
            <polygon points="738,70 748,75 738,80" fill="#a51f1e"/>

            <rect x="750" y="22" width="158" height="106" rx="18" fill="#a51f1e" stroke="#212e46" stroke-width="2"/>
            <text x="829" y="64" text-anchor="middle" font-weight="700" font-size="15" fill="#ffffff">${
              isVi ? 'Chu Trình Cá Nhân' : 'Personal Routine'
            }</text>
            <text x="829" y="88" text-anchor="middle" font-size="12" fill="#f8f0df">&lt; 100,000 VND / SKU</text>
          </svg>
        </div>
      </section>

      <!-- ACT 4: THE AUTHENTIC PRODUCT COLLECTION & MANIFEST INSPECTOR -->
      <section class="hg-collection-section" aria-label="${
        isVi ? 'Hồi 4: Bộ sưu tập sản phẩm chính hãng' : 'Act IV: Authentic Botanical Product Collection'
      }">
        <span class="chip">${
          isVi
            ? 'Hồi 4 · Sản Phẩm Thorakao Chính Hãng Theo Thảo Mộc'
            : 'Act IV · Verified Thorakao Botanical Formulations'
        }</span>
        <h2 style="margin-top:10px">${
          isVi
            ? 'Kết nối từng thảo dược với sản phẩm Thorakao thật'
            : 'Authentic Thorakao Products Matched to Each Botanical'
        }</h2>
        <div id="hg-matched-products" class="shop-layout" style="margin-top:18px">
          ${this.renderMatchedProductsHTML(activeWorld)}
        </div>

        <details class="hg-manifest-details" style="margin-top:26px">
          <summary>${
            isVi
              ? 'Xem Danh mục Kiểm định Hình ảnh Sản phẩm Chính hãng (12 ảnh chuẩn + Báo cáo kiểm toán)'
              : 'Inspect Verified Thorakao Product Image Manifest & Missing-Image Audit Report (12 Assets)'
          }</summary>
          <div class="hg-manifest-body">
            <p class="small">
              ${
                isVi
                  ? 'Toàn bộ ảnh sản phẩm được thu thập trực tiếp từ trang chủ chính thức thorakao.com và store.thorakao.com, kiểm tra độ phân giải gốc (1200×1200 và 1000×1500) và lưu trữ nội bộ.'
                  : 'All product assets were acquired directly from official thorakao.com and store.thorakao.com product pages, verified for authentic packaging and high resolution (1200×1200 and 1000×1500), and locally cached.'
              }
            </p>
            <div class="yolo-table-wrap" style="margin-top:12px">
              <table class="yolo-bench-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>${isVi ? 'Tên sản phẩm chính hãng' : 'Official Product Name'}</th>
                    <th>${isVi ? 'Thảo mộc' : 'Botanical'}</th>
                    <th>${isVi ? 'Độ phân giải' : 'Dimensions'}</th>
                    <th>${isVi ? 'Trạng thái xác thực' : 'Verification Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${PRODUCT_IMAGE_MANIFEST.map(
                    (item) => `
                    <tr>
                      <td><code>${item.id}</code></td>
                      <td><b>${item.productName}</b></td>
                      <td>${item.botanicalKey}</td>
                      <td>${item.dimensions}</td>
                      <td><span class="yolo-badge ok">${item.verificationStatus}</span></td>
                    </tr>`
                  ).join('')}
                </tbody>
              </table>
            </div>
            <div class="hg-missing-report">
              <h4>${
                isVi
                  ? 'Báo cáo Kiểm toán Ảnh Thiếu (Missing-Image Audit Report)'
                  : 'Missing-Image Audit Report (Strict Anti-Fabrication Policy)'
              }</h4>
              ${MISSING_IMAGE_REPORT.map(
                (m) =>
                  `<p class="small"><b>${m.productName} (<code>${m.id}</code> — ${m.status}):</b> ${m.reason}</p>`
              ).join('')}
            </div>
          </div>
        </details>
      </section>

      <!-- ACT 5: THE FUTURE OF BEAUTY -->
      <section class="hg-future-banner" aria-label="${
        isVi ? 'Hồi 5: Tương lai chăm sóc da bằng AI' : 'Act V: The Future of Botanical Skincare'
      }">
        <div>
          <span class="chip">${
            isVi ? 'Hồi 5 · Di Sản Gặp Gỡ Trí Tuệ Nhân Tạo' : 'Act V · Heritage Meets Computer Vision'
          }</span>
          <h2 style="margin-top:10px">${
            isVi
              ? 'Tìm thảo dược hợp nhất với làn da bạn trong 30 giây'
              : 'Match Your Skin to the Right Vietnamese Botanical in 30 Seconds'
          }</h2>
          <p style="margin-top:10px;max-width:640px">
            ${
              isVi
                ? 'Kết hợp 65 năm kinh nghiệm thảo dược Lan Hảo – Thorakao với mô hình thị giác máy tính YOLOv8n đã hiệu chuẩn độ tin cậy để gợi ý chu trình tối giản, an toàn.'
                : 'Combine 65 years of Lan Hảo – Thorakao herbal craftsmanship with our calibrated YOLOv8n skin feature detector for a personalized routine.'
            }
          </p>
          <div class="row" style="margin-top:18px">
            <button type="button" class="pill" data-go="scan">${
              isVi ? 'Quét da AI YOLOv8n ngay' : 'Launch YOLOv8n AI Skin Scan'
            }</button>
            <button type="button" class="pill outline" data-go="shop">${
              isVi ? 'Khám phá toàn bộ sản phẩm' : 'Explore All 10 Botanical Products'
            }</button>
          </div>
        </div>
      </section>
    `;

    this.init3DStage();
  }

  /**
   * Render lore details for the currently selected botanical
   * @param {object} world
   * @param {boolean} isVi
   * @returns {string}
   */
  renderBotanicalLoreHTML(world, isVi) {
    return `
      <span class="chip">${world.latin}</span>
      <h3 style="margin-top:10px;font-size:28px">${isVi ? world.nameVi : world.nameEn}</h3>
      <p style="margin-top:10px">${isVi ? world.storyVi : world.storyEn}</p>
      <div class="hg-lore-meta">
        <div>
          <strong>${isVi ? 'Hoạt chất sinh học chính' : 'Key Phyto-Actives'}</strong>
          <p class="small">${isVi ? world.activesVi : world.activesEn}</p>
        </div>
        <div>
          <strong>${isVi ? 'Nghi thức chăm sóc truyền thống' : 'Traditional Care Ritual'}</strong>
          <p class="small">${isVi ? world.ritualVi : world.ritualEn}</p>
        </div>
      </div>
      <div class="row" style="margin-top:16px">
        <button type="button" class="pill" data-pd="${world.productIds[0]}">
          ${isVi ? 'Xem sản phẩm tiêu biểu' : 'Inspect Flagship Product'}
        </button>
        <button type="button" class="pill outline" data-go="scan">
          ${isVi ? 'Kiểm tra mức độ phù hợp da' : 'Check Skin Compatibility'}
        </button>
      </div>
    `;
  }

  /**
   * Render product cards strictly matched to the selected botanical
   * @param {object} world
   * @returns {string}
   */
  renderMatchedProductsHTML(world) {
    return world.productIds
      .map((pid) => C[pid])
      .filter(Boolean)
      .map((prod) => renderProductCard(prod, shopController.isWishlisted(prod.id)))
      .join('');
  }

  /**
   * Initialize or refresh the Three.js 3D stage inside #herbal-3d-stage
   */
  init3DStage() {
    const stageEl = $('#herbal-3d-stage');
    if (!stageEl) return;

    if (this.scene3d) {
      this.scene3d.dispose();
      this.scene3d = null;
    }
    this.scene3d = new HerbalGardenScene(stageEl);
    this.scene3d.setBotanical(this.activeBotanicalId);
  }

  /**
   * Switch active botanical without rebuilding the entire 3D WebGL context
   * @param {string} botanicalId
   */
  selectBotanical(botanicalId) {
    const world = BOTANICAL_WORLDS.find((b) => b.id === botanicalId);
    if (!world) return;
    this.activeBotanicalId = world.id;

    if (this.scene3d) {
      this.scene3d.setBotanical(world.id);
    }

    const isVi = i18nService.lang === 'vi';
    $$('[data-botanical]').forEach((btn) => {
      const active = btn.dataset.botanical === world.id;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active);
    });

    const latinEl = $('#hg-active-latin');
    if (latinEl) latinEl.textContent = world.latin;

    const loreCard = $('#hg-lore-card');
    if (loreCard) {
      loreCard.innerHTML = this.renderBotanicalLoreHTML(world, isVi);
    }

    const matchedEl = $('#hg-matched-products');
    if (matchedEl) {
      matchedEl.innerHTML = this.renderMatchedProductsHTML(world);
    }
  }

  /**
   * Handle 3D dock control actions (spin, reset, toggle-dock)
   * @param {string} action
   */
  handleDockAction(action) {
    if (action === 'spin' && this.scene3d) {
      this.scene3d.toggleAutoRotate();
    } else if (action === 'reset' && this.scene3d) {
      this.scene3d.resetCamera();
    } else if (action === 'toggle-dock') {
      this.controlsCollapsed = !this.controlsCollapsed;
      const dock = $('#hg-dock');
      if (dock) {
        dock.classList.toggle('collapsed', this.controlsCollapsed);
      }
      const btn = $('[data-hg-action="toggle-dock"]');
      if (btn) {
        const isVi = i18nService.lang === 'vi';
        btn.setAttribute('aria-expanded', !this.controlsCollapsed);
        btn.textContent = this.controlsCollapsed
          ? isVi
            ? '▴ Mở điều khiển'
            : '▴ Show Controls'
          : isVi
          ? '▾ Thu gọn'
          : '▾ Hide Controls';
      }
    }
  }
}

export const herbalGardenView = new HerbalGardenView();

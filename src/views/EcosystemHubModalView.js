/**
 * Thorakao AI Ecosystem Hub View & Controller (Priorities 4, 5, 6, 8, 9, 10)
 * Provides three integrated modules inside an accessible modal (#ecod):
 * 1. Customer Account, Order Tracking, Saved Routines & Privacy Controls (Priorities 4, 5, 10)
 * 2. RAG Botanical AI Customer Assistant powered by server-side @google/genai (Priority 8)
 * 3. Role-Based Admin Portal across Product, Order, Customer, Marketing, Content & AI/Analytics (Priorities 6 & 9)
 */

import { C } from '../config/catalog.js';
import { TIPS_ARTICLES } from '../config/content.js';
import { PRODUCT_IMAGE_MANIFEST, MISSING_IMAGE_REPORT } from '../config/productManifest.js';
import { MODEL_EVALUATION_REPORT } from '../ai/modelEvaluation.js';
import { DATASET_QUALITY_REPORT } from '../ai/datasetReport.js';
import { authService } from '../services/AuthService.js';
import { ecommerceService } from '../services/EcommerceService.js';
import { routineEngine } from '../services/RoutineEngine.js';
import { ragAssistantService } from '../services/RagAssistantService.js';
import { herbalEcosystemService } from '../services/HerbalEcosystemService.js';
import { enterpriseOperationsService } from '../services/EnterpriseOperationsService.js';
import { analyticsService } from '../services/AnalyticsService.js';
import { i18nService } from '../services/I18nService.js';
import { toast } from './Toast.js';
import { M } from '../utils/formatters.js';
import { escapeHtml } from '../utils/string.js';
import { $ } from '../utils/dom.js';

export class EcosystemHubModalView {
  constructor() {
    this.activeTab = 'assistant';
    this.adminSubTab = 'products';
    this.herbalCategory = 'all';
    this.isAsking = false;
    this.progressStepText = '';
  }

  /**
   * Open the Ecosystem Hub modal on a specific tab
   * @param {'assistant'|'account'|'academy'|'admin'} tab
   */
  open(tab = 'assistant') {
    this.activeTab = tab;
    this.render();
    const dlg = $('#ecod');
    if (dlg && !dlg.open) {
      dlg.showModal();
    }
  }

  render() {
    const root = $('#ecodc');
    if (!root) return;

    const isVi = i18nService.lang === 'vi';
    const user = authService.getCurrentUser();
    const userOrdersCount = ecommerceService.getOrdersForUser(user).length;
    const pts = herbalEcosystemService.state.loyaltyPoints || 0;

    root.innerHTML = `
      <div class="eco-hub" data-i18n-skip="true">
        <div class="eco-head">
          <div>
            <span class="eyebrow">${
              isVi ? 'Hệ sinh thái AI & Thảo mộc Thorakao' : 'Thorakao AI & Herbal Beauty Ecosystem'
            }</span>
            <h2 style="margin-top:4px;font-size:clamp(24px,3vw,32px)">
              ${
                this.activeTab === 'assistant'
                  ? isVi
                    ? 'Cố vấn Thảo mộc AI (Server RAG)'
                    : 'Virtual Herbal Beauty Advisor (RAG)'
                  : this.activeTab === 'account'
                  ? isVi
                    ? 'Hành trình Da, Đơn hàng & Dữ liệu Cá nhân'
                    : 'Skin Journey, Orders & Personal Data Dashboard'
                  : this.activeTab === 'academy'
                  ? isVi
                    ? 'Phòng Lab Thảo mộc, Học viện INCI & Cộng đồng'
                    : 'Herbal Intelligence Lab, Academy & Community'
                  : isVi
                  ? 'Cổng Quản trị & Studio Đổi mới R&D (RBAC)'
                  : 'Admin Portal & AI Innovation Studio (RBAC)'
              }
            </h2>
          </div>
          <button type="button" class="round" data-close aria-label="Close">×</button>
        </div>

        <div class="tabs eco-tabs" role="tablist" aria-label="Ecosystem sections">
          <button type="button" role="tab" class="${
            this.activeTab === 'assistant' ? 'active' : ''
          }" aria-selected="${this.activeTab === 'assistant'}" data-eco-tab="assistant">
            ${isVi ? '✦ Cố vấn AI (RAG)' : '✦ AI Advisor (RAG)'}
          </button>
          <button type="button" role="tab" class="${
            this.activeTab === 'academy' ? 'active' : ''
          }" aria-selected="${this.activeTab === 'academy'}" data-eco-tab="academy">
            ${isVi ? '🌿 Lab Thảo mộc & Cộng đồng' : '🌿 Herbal Lab & Community'}
          </button>
          <button type="button" role="tab" class="${
            this.activeTab === 'account' ? 'active' : ''
          }" aria-selected="${this.activeTab === 'account'}" data-eco-tab="account">
            ${
              isVi
                ? `Hành trình Da & Đơn (${userOrdersCount} · ${pts} đ)`
                : `Skin Journey & Orders (${userOrdersCount} · ${pts} pts)`
            }
          </button>
          <button type="button" role="tab" class="${
            this.activeTab === 'admin' ? 'active' : ''
          }" aria-selected="${this.activeTab === 'admin'}" data-eco-tab="admin">
            ${
              isVi
                ? `Quản trị & R&D (${user?.role === 'admin' ? 'Đã mở' : 'RBAC'})`
                : `Admin & R&D (${user?.role === 'admin' ? 'Unlocked' : 'RBAC'})`
            }
          </button>
        </div>

        <div class="eco-body">
          ${
            this.activeTab === 'assistant'
              ? this.renderAssistantTab(isVi)
              : this.activeTab === 'academy'
              ? this.renderAcademyAndLabTab(isVi)
              : this.activeTab === 'account'
              ? this.renderAccountTab(isVi, user)
              : this.renderAdminTab(isVi, user)
          }
        </div>
      </div>
    `;
  }

  renderAssistantTab(isVi) {
    const samplePrompts = isVi
      ? [
          'Gợi ý quy trình dưới 100.000đ cho da dầu mụn và thâm?',
          'Thành phần chính hãng của Kem Nghệ Thorakao và Nước Hoa Hồng là gì?',
          'Tra cứu trạng thái đơn hàng #TH849201',
          'Tóc yếu dễ gãy rụng nên chọn Dầu gội Hoa Bưởi hay Bồ Kết?'
        ]
      : [
          'Recommend a routine under 100,000 VND for oily, blemish-prone skin',
          'What are the verified ingredients in Turmeric Cream and Cucumber Toner?',
          'Track my order #TH849201 status and return policy',
          'Should I choose Pomelo Blossom or Soapberry shampoo for fragile hair?'
        ];

    const historyHtml = ragAssistantService.history.length
      ? ragAssistantService.history
          .map(
            (msg) => `
          <article class="rag-card">
            <div class="rag-user-q">
              <span class="chip">${isVi ? 'Câu hỏi của bạn' : 'Your Question'}</span>
              <strong>${escapeHtml(msg.query)}</strong>
            </div>
            <div class="rag-steps">
              ${(msg.retrievalSteps || [])
                .map((s) => `<span class="rag-step-chip">✓ ${escapeHtml(s)}</span>`)
                .join('')}
              <span class="yolo-badge ${msg.isFallback ? 'warn' : 'ok'}">
                ${
                  msg.isFallback
                    ? isVi
                      ? 'Chế độ Dự phòng Tất định (Dữ liệu nhãn chính hãng)'
                      : 'Deterministic Grounded Fallback (Verified Catalog)'
                    : `Gemini Server RAG (${escapeHtml(msg.model)})`
                }
              </span>
            </div>
            <p class="rag-answer">${escapeHtml(msg.answer)}</p>
            ${
              msg.recommendedSkus && msg.recommendedSkus.length
                ? `<div class="row" style="margin:10px 0">
                    ${msg.recommendedSkus
                      .map((sku) =>
                        C[sku]
                          ? `<button type="button" class="pill" data-add="${sku}">+ ${escapeHtml(
                              C[sku].n
                            )} (${M(C[sku].p)})</button>`
                          : ''
                      )
                      .join('')}
                  </div>`
                : ''
            }
            <div class="rag-citations">
              <small><b>${isVi ? 'Nguồn trích dẫn:' : 'Verified Sources:'}</b> ${(
              msg.citations || []
            )
              .map((c) => escapeHtml(c))
              .join(' · ')}</small>
              <small style="display:block;margin-top:4px;opacity:.85">ℹ️ ${escapeHtml(
                msg.uncertaintyNote || ''
              )}</small>
            </div>
            ${
              msg.needsHumanEscalation
                ? `<div class="yolo-gate-reject" style="margin-top:10px">
                    <b>${
                      isVi
                        ? 'Khuyến nghị chuyển tiếp Chuyên gia / Bác sĩ da liễu'
                        : 'Human Support & Dermatologist Escalation Recommended'
                    }</b>
                    <p class="small">${
                      isVi
                        ? 'Trợ lý AI không chẩn đoán bệnh lý da liễu. Liên hệ hotline Thorakao 028 8887 3241 hoặc bác sĩ chuyên khoa.'
                        : 'The AI assistant does not diagnose medical conditions. Contact Thorakao support at 028 8887 3241 or a dermatologist.'
                    }</p>
                  </div>`
                : ''
            }
          </article>
        `
          )
          .join('')
      : `<div class="rbox" style="text-align:center;padding:24px">
          <strong>${
            isVi
              ? 'Trợ lý AI được neo chặt vào cơ sở dữ liệu sản phẩm Thorakao chính hãng'
              : 'Grounded in Verified Thorakao Formulations, Pricing & Store Policies'
          }</strong>
          <p class="small" style="margin-top:6px">
            ${
              isVi
                ? 'Chọn một câu hỏi mẫu bên trên hoặc nhập câu hỏi của bạn (hỗ trợ tra cứu mã đơn #TH849201).'
                : 'Select a sample prompt above or type your own question (supports live order lookup e.g. #TH849201).'
            }
          </p>
        </div>`;

    return `
      <div class="rag-panel">
        <p class="small">
          ${
            isVi
              ? 'Sử dụng kiến trúc RAG kết hợp @google/genai trên Server. Không bao giờ tự bịa giá bán, thành phần hay cam kết y khoa.'
              : 'Powered by server-side @google/genai with Retrieval-Augmented Generation over verified Thorakao labels and policies.'
          }
        </p>
        <div class="yolo-preset-row" style="margin:12px 0">
          ${samplePrompts
            .map(
              (q) =>
                `<button type="button" class="yolo-preset-btn" data-rag-prompt="${q.replace(
                  /"/g,
                  '&quot;'
                )}">${q}</button>`
            )
            .join('')}
        </div>

        <form id="rag-form" class="row" style="margin:12px 0;align-items:stretch">
          <label class="sr" for="rag-input">${
            isVi ? 'Đặt câu hỏi cho Trợ lý AI' : 'Ask Thorakao AI Assistant'
          }</label>
          <input id="rag-input" class="in" style="flex:1" placeholder="${
            isVi
              ? 'Hỏi về thành phần nghệ, quy trình theo ngân sách, hoặc mã đơn #TH849201...'
              : 'Ask about turmeric ingredients, budget routines, or order #TH849201...'
          }" ${this.isAsking ? 'disabled' : ''}>
          <button type="submit" class="pill" ${this.isAsking ? 'disabled' : ''}>
            ${this.isAsking ? (isVi ? 'Đang xử lý...' : 'Analysing...') : isVi ? 'Gửi câu hỏi' : 'Ask AI'}
          </button>
        </form>

        ${
          this.isAsking
            ? `<div class="yolo-gate-pass" role="status" aria-live="polite" style="margin:12px 0">
                <b>⚡ ${
                  isVi ? 'Tiến trình RAG & Suy luận Gemini' : 'Live RAG Retrieval & Gemini Pipeline'
                }</b>
                <span>${escapeHtml(this.progressStepText)}</span>
              </div>`
            : ''
        }

        <div class="rag-feed">${historyHtml}</div>

        <div class="row" style="justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid var(--line)">
          <small>${
            isVi
              ? 'Cần nhân viên tư vấn trực tiếp? Hotline: 028 8887 3241 · info@thorakao.com'
              : 'Need human assistance? Hotline: 028 8887 3241 · info@thorakao.com'
          }</small>
          <button type="button" class="pill outline" data-go="contact" data-close>
            ${isVi ? 'Chuyển gặp Nhân viên Hỗ trợ' : 'Escalate to Human Support'}
          </button>
        </div>
      </div>
    `;
  }

  renderAcademyAndLabTab(isVi) {
    const herbs = herbalEcosystemService.getHerbalIngredients(this.herbalCategory);
    const academy = herbalEcosystemService.getAcademyData();
    const challenges = herbalEcosystemService.getChallengesWithProgress();
    const posts = herbalEcosystemService.getCommunityPosts(false);

    const catButtons = [
      ['all', isVi ? 'Tất cả Thảo mộc (7)' : 'All Botanicals (7)'],
      ['botanical_active', isVi ? 'Hoạt chất Thảo mộc' : 'Botanical Actives'],
      ['hydrating_botanical', isVi ? 'Cấp ẩm Tự nhiên' : 'Hydrating Extracts'],
      ['scalp_botanical', isVi ? 'Chăm sóc Tóc & Da đầu' : 'Scalp & Hair Herbs'],
      ['barrier_base', isVi ? 'Hệ nền Khóa ẩm' : 'Barrier & Emollient Base']
    ]
      .map(
        ([id, lbl]) =>
          `<button type="button" class="yolo-preset-btn ${
            this.herbalCategory === id ? 'active' : ''
          }" data-herbal-cat="${id}">${lbl}</button>`
      )
      .join('');

    return `
      <div class="academy-panel">
        <div class="rbox" style="margin-bottom:16px">
          <div class="row" style="justify-content:space-between;align-items:flex-start">
            <div>
              <span class="chip">SECTION 08 · HERBAL INTELLIGENCE LAB</span>
              <h3 style="margin-top:6px">${
                isVi
                  ? 'Phòng Thí nghiệm Trí tuệ Thảo mộc & Tra cứu INCI'
                  : 'Interactive Herbal Ingredient & INCI Knowledge Center'
              }</h3>
              <p class="small" style="margin-top:4px">
                ${
                  isVi
                    ? 'Phân tách minh bạch giữa: (1) Kinh nghiệm dân gian, (2) Chức năng mỹ phẩm INCI, (3) Tài liệu khoa học xuất bản, và (4) Sản phẩm Thorakao chính hãng.'
                    : 'Clearly distinguishes: (1) Traditional Knowledge, (2) Cosmetic INCI Function, (3) Published Scientific Literature, and (4) Verified Thorakao Products.'
                }
              </p>
            </div>
          </div>

          <div class="yolo-preset-row" style="margin:12px 0">${catButtons}</div>

          <div class="rgrid">
            ${herbs
              .map(
                (h) => `
              <article class="rbox" style="background:rgba(255,248,236,0.65)">
                <span class="chip">${escapeHtml(h.inci)}</span>
                <h4 style="margin:6px 0 4px;font-size:17px">${escapeHtml(
                  isVi ? h.nameVi : h.nameEn
                )}</h4>
                <small style="display:block;color:#6e5034;margin-bottom:8px"><i>${escapeHtml(
                  h.botanicalFamily
                )}</i></small>
                <p style="font-size:13.5px;margin:6px 0"><b>1. ${
                  isVi ? 'Truyền thống Việt Nam:' : 'Traditional Knowledge:'
                }</b> ${escapeHtml(isVi ? h.traditionalUseVi : h.traditionalUseEn)}</p>
                <p style="font-size:13.5px;margin:6px 0"><b>2. ${
                  isVi ? 'Chức năng Mỹ phẩm (INCI):' : 'Cosmetic Function (INCI):'
                }</b> ${escapeHtml(isVi ? h.cosmeticFunctionVi : h.cosmeticFunctionEn)}</p>
                <p style="font-size:13px;margin:6px 0"><b>3. ${
                  isVi ? 'Tài liệu Khoa học:' : 'Published Reference:'
                }</b> ${escapeHtml(h.scientificReference)}</p>
                <p style="font-size:13px;margin:6px 0"><b>4. ${
                  isVi ? 'Tương thích & Lưu ý:' : 'Compatibility & Usage:'
                }</b> ${escapeHtml(isVi ? h.compatibilityVi : h.compatibilityEn)} ${escapeHtml(
                  isVi ? h.usageConsiderationVi : h.usageConsiderationEn
                )}</p>
                <div class="row" style="margin-top:8px">
                  ${h.verifiedProducts
                    .map((sku) =>
                      C[sku]
                        ? `<button type="button" class="yolo-preset-btn" data-add="${sku}">+ ${escapeHtml(
                            C[sku].n
                          )} (${M(C[sku].p)})</button>`
                        : ''
                    )
                    .join('')}
                </div>
              </article>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="rgrid">
          <div class="rbox">
            <span class="chip">SECTION 16 · THORAKAO KNOWLEDGE ACADEMY</span>
            <h3 style="margin-top:6px">${
              isVi
                ? 'Học viện Khoa học Mỹ phẩm & Đọc hiểu INCI'
                : 'Herbal & Cosmetic Science Knowledge Academy'
            }</h3>
            <p class="small" style="margin:4px 0 10px">
              ${
                isVi
                  ? 'Kiến thức phổ thông dành cho người tiêu dùng và sinh viên (không phải chứng chỉ hành nghề y tế).'
                  : 'Consumer & student cosmetic science literacy modules (not a professional or clinical qualification).'
              }
            </p>
            ${academy.modules
              .map(
                (m) => `
              <div style="border-top:1px solid var(--line);padding:10px 0;font-size:13.5px">
                <small style="font-weight:700;color:#7a291c">${escapeHtml(m.code)} · ${escapeHtml(
                  m.duration
                )}</small>
                <h4 style="margin:4px 0;font-size:15.5px">${escapeHtml(
                  isVi ? m.titleVi : m.titleEn
                )}</h4>
                <p style="margin:4px 0">${escapeHtml(isVi ? m.summaryVi : m.summaryEn)}</p>
                <small style="display:block;color:#463527"><b>💡 ${
                  isVi ? 'Điểm cốt lõi:' : 'Key Takeaway:'
                }</b> ${escapeHtml(isVi ? m.keyTakeawayVi : m.keyTakeawayEn)}</small>
              </div>
            `
              )
              .join('')}

            <form id="academy-quiz-form" style="margin-top:12px;border-top:1px solid var(--line);padding-top:12px">
              <h4 style="font-size:15.5px;margin-bottom:8px">🎓 ${
                isVi
                  ? 'Trắc nghiệm Nhanh: Đọc nhãn INCI & Hiểu đúng AI (+50 điểm)'
                  : 'Interactive Literacy Quiz: INCI & AI Skin Scan (+50 pts)'
              }</h4>
              ${academy.questions
                .map(
                  (q, idx) => `
                <fieldset style="margin:8px 0;padding:8px;border:1px solid var(--line);border-radius:10px;font-size:13px">
                  <legend style="font-weight:600">${idx + 1}. ${escapeHtml(
                    isVi ? q.questionVi : q.questionEn
                  )}</legend>
                  ${(isVi ? q.optionsVi : q.optionsEn)
                    .map(
                      (opt, oIdx) => `
                    <label style="display:block;margin:4px 0">
                      <input type="radio" name="acad_q_${idx}" value="${oIdx}" ${
                        oIdx === q.correctIndex ? 'checked' : ''
                      }>
                      ${escapeHtml(opt)}
                    </label>
                  `
                    )
                    .join('')}
                </fieldset>
              `
                )
                .join('')}
              <button type="submit" class="pill">${
                isVi ? 'Nộp bài Trắc nghiệm Khoa học' : 'Submit Cosmetic Science Quiz'
              }</button>
              ${
                academy.quizScore
                  ? `<div class="yolo-gate-pass" style="margin-top:10px">
                      <b>✓ ${
                        isVi ? 'Kết quả Trắc nghiệm Học viện:' : 'Academy Quiz Result:'
                      } ${academy.quizScore.correct}/${academy.quizScore.total}</b>
                      <span>${
                        isVi
                          ? 'Đã ghi nhận hoàn thành học phần Nhận thức INCI & Thảo mộc tiêu dùng.'
                          : 'Consumer INCI & Herbal Literacy completion recorded.'
                      }</span>
                    </div>`
                  : ''
              }
            </form>
          </div>

          <div class="rbox">
            <span class="chip">SECTION 15 · THORAKAO COMMUNITY LAB</span>
            <h3 style="margin-top:6px">${
              isVi
                ? 'Thử thách Duy trì Thói quen & Nhật ký Cộng đồng'
                : 'Skincare Consistency Challenges & Community Journals'
            }</h3>
            <p class="small" style="margin:4px 0 10px">
              ${
                isVi
                  ? 'Lưu ý: Chia sẻ từ cộng đồng là cảm nhận cá nhân, không phải bằng chứng lâm sàng về hiệu quả điều trị.'
                  : 'Disclaimer: Individual community journals reflect personal routines and are not scientific proof of clinical efficacy.'
              }
            </p>
            ${challenges
              .map(
                (c) => `
              <div style="border-top:1px solid var(--line);padding:10px 0;font-size:13.5px">
                <div class="row" style="justify-content:space-between">
                  <strong>${escapeHtml(isVi ? c.titleVi : c.titleEn)}</strong>
                  <span class="yolo-badge ok">${c.completedDays}/${c.days} ${
                  isVi ? 'ngày' : 'days'
                } (+${c.rewardPoints} pts)</span>
                </div>
                <p style="margin:4px 0;font-size:13px">${escapeHtml(
                  isVi ? c.targetVi : c.targetEn
                )}</p>
                <progress max="${c.days}" value="${c.completedDays}" style="width:100%;height:8px"></progress>
                <div class="row" style="margin-top:6px">
                  <button type="button" class="yolo-preset-btn" data-chal-checkin="${escapeHtml(
                    c.id
                  )}">✓ ${isVi ? 'Điểm danh Hôm nay (+10 đ)' : 'Check In Today (+10 pts)'}</button>
                  <button type="button" class="yolo-preset-btn" data-add="${escapeHtml(
                    c.recommendedSku
                  )}">+ ${escapeHtml(C[c.recommendedSku]?.n || c.recommendedSku)}</button>
                </div>
              </div>
            `
              )
              .join('')}

            <h4 style="margin:12px 0 6px;font-size:15px">${
              isVi ? 'Nhật ký Chia sẻ Quy trình Đã kiểm duyệt' : 'Moderated Routine Journals'
            }</h4>
            ${posts
              .slice(0, 4)
              .map(
                (p) => `
              <div style="border-top:1px solid var(--line);padding:8px 0;font-size:13px">
                <div class="row" style="justify-content:space-between">
                  <strong>${escapeHtml(p.author)}</strong>
                  <span class="chip">${escapeHtml(C[p.sku]?.n || p.sku)}</span>
                </div>
                <p style="margin:4px 0">“${escapeHtml(p.note)}”</p>
                <div class="row" style="justify-content:space-between">
                  <small>${
                    p.isSample
                      ? isVi
                        ? 'Nhật ký minh họa · Cảm nhận cá nhân'
                        : 'Sample journal · Personal experience'
                      : isVi
                      ? 'Thành viên chia sẻ · Cảm nhận cá nhân'
                      : 'Member journal · Personal experience'
                  }</small>
                  <button type="button" class="yolo-preset-btn" data-post-flag="${escapeHtml(
                    p.id
                  )}">${isVi ? 'Báo cáo / Ẩn' : 'Report / Hide'}</button>
                </div>
              </div>
            `
              )
              .join('')}

            <form id="community-post-form" style="margin-top:10px;border-top:1px solid var(--line);padding-top:10px">
              <label for="comm-note-in" style="font-size:13px;font-weight:600">${
                isVi ? 'Chia sẻ nhật ký chăm sóc da của bạn (+20 đ):' : 'Share your routine experience note (+20 pts):'
              }</label>
              <div class="row" style="margin-top:6px">
                <select id="comm-sku-in" class="in" style="max-width:170px" aria-label="Product">
                  ${Object.values(C)
                    .map((p) => `<option value="${p.id}">${escapeHtml(p.n)}</option>`)
                    .join('')}
                </select>
                <input id="comm-note-in" class="in" style="flex:1" required maxlength="240" placeholder="${
                  isVi
                    ? 'Cảm nhận thực tế khi dùng sản phẩm...'
                    : 'Your personal routine experience...'
                }">
                <button type="submit" class="pill outline">${
                  isVi ? 'Đăng nhật ký' : 'Post Journal'
                }</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  renderAccountTab(isVi, user) {
    const orders = ecommerceService.getOrdersForUser(user);
    const savedRoutines = routineEngine.getSavedRoutines();
    const scanHistory = routineEngine.getScanHistory();
    const progress = routineEngine.compareScanProgress();
    const hasConsent = routineEngine.hasStorageConsent();
    const subjectiveLogs = herbalEcosystemService.getSubjectiveFeedbackLog();
    const lifecycleReminders = herbalEcosystemService.getProductLifecycleReminders(orders);
    const streakDays = herbalEcosystemService.state.habitStreakDays || 0;
    const loyaltyPts = herbalEcosystemService.state.loyaltyPoints || 0;

    return `
      <div class="acc-panel">
        <div class="rbox" style="margin-bottom:16px">
          <div class="row" style="justify-content:space-between">
            <div>
              <span class="chip">${
                user
                  ? `${isVi ? 'Đang đăng nhập:' : 'Signed in:'} ${escapeHtml(
                      user.role.toUpperCase()
                    )}`
                  : isVi
                  ? 'Khách vãng lai (Guest)'
                  : 'Guest Session'
              }</span>
              <span class="yolo-badge ok" style="margin-left:6px">★ ${loyaltyPts} ${
      isVi ? 'Điểm Di sản Thorakao' : 'Thorakao Heritage Points'
    } · 🔥 ${streakDays} ${isVi ? 'ngày duy trì' : 'day habit streak'}</span>
              <h3 style="margin-top:6px">${
                user
                  ? `${escapeHtml(user.name)} (${escapeHtml(user.email)})`
                  : isVi
                  ? 'Chưa đăng nhập'
                  : 'Not signed in'
              }</h3>
            </div>
            <div class="row">
              <button type="button" class="yolo-preset-btn" data-habit-checkin>
                ✓ ${isVi ? 'Điểm danh Quy trình Hôm nay (+10 đ)' : 'Log Daily Routine Check-In (+10 pts)'}
              </button>
              <button type="button" class="yolo-preset-btn ${
                user?.role === 'customer' ? 'active' : ''
              }" data-auth-demo="customer">
                ${isVi ? 'Dùng thử Tài khoản Khách hàng' : 'Demo Customer Account'}
              </button>
              <button type="button" class="yolo-preset-btn ${
                user?.role === 'admin' ? 'active' : ''
              }" data-auth-demo="admin">
                ${isVi ? 'Dùng thử Tài khoản Admin' : 'Demo Admin Account'}
              </button>
              ${
                user
                  ? `<button type="button" class="yolo-preset-btn" data-auth-logout>
                      ${isVi ? 'Đăng xuất' : 'Sign Out'}
                    </button>`
                  : ''
              }
            </div>
          </div>

          ${
            !user
              ? `<form id="auth-login-form" class="row" style="margin-top:12px">
                  <input id="auth-name-in" class="in" style="max-width:200px" aria-label="${
                    isVi ? 'Họ và tên' : 'Your name'
                  }" placeholder="${isVi ? 'Họ và tên' : 'Your name'}">
                  <input id="auth-email-in" type="email" required class="in" style="max-width:240px" aria-label="Email" placeholder="email@example.com">
                  <button type="submit" class="pill">${
                    isVi ? 'Đăng nhập / Đăng ký' : 'Sign In / Register'
                  }</button>
                </form>`
              : `<div style="margin-top:10px">
                  <small><b>${isVi ? 'Sổ địa chỉ giao hàng:' : 'Saved Delivery Addresses:'}</b></small>
                  <ul style="margin:6px 0;padding-left:18px;font-size:14px">
                    ${(user.addresses || [])
                      .map((a) => `<li><b>${escapeHtml(a.label)}:</b> ${escapeHtml(a.line)}</li>`)
                      .join('')}
                  </ul>
                  <form id="addr-add-form" class="row" style="margin-top:8px">
                    <input id="addr-label-in" class="in" style="max-width:160px" aria-label="${
                      isVi ? 'Nhãn địa chỉ' : 'Address label'
                    }" placeholder="${isVi ? 'Nhãn (VD: Nhà riêng)' : 'Label (e.g. Home)'}" required>
                    <input id="addr-line-in" class="in" style="flex:1" aria-label="${
                      isVi ? 'Địa chỉ chi tiết' : 'Street address'
                    }" placeholder="${
                      isVi ? 'Địa chỉ chi tiết & Thành phố' : 'Street address & City'
                    }" required>
                    <button type="submit" class="pill outline">${
                      isVi ? '+ Thêm địa chỉ' : '+ Add Address'
                    }</button>
                  </form>
                </div>`
          }
        </div>

        <div class="rgrid">
          <div class="rbox">
            <h3>${isVi ? 'Lịch sử Đơn hàng & Vòng đời Sản phẩm' : 'Order History, Returns & Product Lifecycle'}</h3>
            <p class="small" style="margin:6px 0 10px">
              ${
                isVi
                  ? 'Không thu tiền giả lập; hỗ trợ hủy đơn, đổi trả 30 ngày và nhắc lịch dùng hết sản phẩm.'
                  : 'Authentic local order records; supports instant cancellation, 30-day returns, and depletion tracking.'
              }
            </p>
            ${orders
              .map(
                (o) => `
              <div style="border-top:1px solid var(--line);padding:10px 0;font-size:14px">
                <div class="row" style="justify-content:space-between">
                  <strong>#${escapeHtml(o.id)} · ${M(o.total)}</strong>
                  <span class="yolo-badge ${
                    o.status.includes('Cancelled') || o.status.includes('Return') ? 'warn' : 'ok'
                  }">${escapeHtml(o.status)}</span>
                </div>
                <small style="display:block;margin:4px 0">${escapeHtml(o.customerName)} · ${escapeHtml(
                  o.city
                )} · ${escapeHtml(o.paymentMethod)}</small>
                <div class="row" style="margin-top:6px">
                  <button type="button" class="yolo-preset-btn" data-order-cancel="${escapeHtml(o.id)}">
                    ${isVi ? 'Hủy đơn' : 'Cancel Order'}
                  </button>
                  <button type="button" class="yolo-preset-btn" data-order-return="${escapeHtml(o.id)}">
                    ${isVi ? 'Yêu cầu Đổi trả 30 ngày' : 'Request 30-Day Return'}
                  </button>
                </div>
              </div>
            `
              )
              .join('')}

            <h4 style="margin:14px 0 6px;font-size:15px">♻️ ${
              isVi
                ? 'Theo dõi Vòng đời Sử dụng & Tái chế Bao bì (Section 14)'
                : 'Product Depletion Lifecycle & Packaging Guidance (Section 14)'
            }</h4>
            ${
              lifecycleReminders.length
                ? lifecycleReminders
                    .map(
                      (item) => `
                  <div style="border-top:1px solid var(--line);padding:8px 0;font-size:13px">
                    <div class="row" style="justify-content:space-between">
                      <b>${escapeHtml(item.name)}</b>
                      <span class="chip">~${item.estimatedRemainingDays}/${item.cycleDays} ${
                        isVi ? 'ngày còn lại' : 'days left'
                      }</span>
                    </div>
                    <small style="display:block;margin:4px 0">${escapeHtml(
                      item.packagingNote
                    )}</small>
                    <button type="button" class="yolo-preset-btn" data-add="${escapeHtml(
                      item.sku
                    )}">↻ ${isVi ? 'Mua bổ sung' : 'Reorder'} (${M(
                        C[item.sku]?.p || 0
                      )})</button>
                  </div>
                `
                    )
                    .join('')
                : ''
            }
          </div>

          <div class="rbox">
            <h3>${
              isVi
                ? 'Hành trình Làn da AI: Khách quan (YOLOv8n) vs. Cảm nhận Chủ quan'
                : 'AI Skin Journey: Objective Scan Metrics vs. Subjective Feedback'
            }</h3>
            <label style="margin:8px 0;font-size:14px">
              <input type="checkbox" id="scan-consent-toggle" ${hasConsent ? 'checked' : ''}>
              ${
                isVi
                  ? 'Cho phép lưu lịch sử quét da trên thiết bị để so sánh tiến triển'
                  : 'Consent to store scan history on this device for progress comparison'
              }
            </label>

            ${
              progress
                ? `<div class="yolo-gate-pass" style="margin:10px 0">
                    <b>📈 ${
                      isVi
                        ? '1. Quan sát Bề mặt Khách quan (YOLOv8n-v8.2)'
                        : '1. Objective Model Observation (YOLOv8n-v8.2)'
                    }</b>
                    <span>${escapeHtml(isVi ? progress.summaryVi : progress.summaryEn)}</span>
                  </div>`
                : ''
            }

            <h4 style="margin:12px 0 6px;font-size:15px">${
              isVi
                ? `Lịch sử Quét da Khách quan (${scanHistory.length})`
                : `Objective Scan History (${scanHistory.length})`
            }</h4>
            ${
              scanHistory.length
                ? `<ul style="margin:4px 0;padding-left:18px;font-size:13px">
                    ${scanHistory
                      .slice(0, 4)
                      .map(
                        (s) =>
                          `<li><b>${new Date(s.date).toLocaleDateString()}</b> — ${escapeHtml(
                            s.severity
                          )} (${s.totalRois} ROIs, Quality ${s.qualityScore}/100)</li>`
                      )
                      .join('')}
                  </ul>`
                : `<p class="small">${
                    isVi ? 'Chưa có bản ghi lịch sử quét da.' : 'No stored scan history records.'
                  }</p>`
            }

            <h4 style="margin:12px 0 6px;font-size:15px">${
              isVi
                ? `2. Nhật ký Cảm nhận Chủ quan của Khách hàng (${subjectiveLogs.length})`
                : `2. Subjective Customer Comfort & Habit Log (${subjectiveLogs.length})`
            }</h4>
            <p class="small" style="margin-bottom:6px">
              ${
                isVi
                  ? 'Tách biệt rõ cảm nhận thực tế hàng ngày của bạn với số liệu mô hình thị giác máy tính.'
                  : 'Separates your personal skin comfort observations from automated computer-vision detections.'
              }
            </p>
            <ul style="margin:4px 0;padding-left:18px;font-size:13px">
              ${subjectiveLogs
                .slice(0, 3)
                .map(
                  (log) =>
                    `<li style="margin:4px 0"><b>${new Date(
                      log.date
                    ).toLocaleDateString()}</b> (${log.comfortRating}/5 ★ · ${escapeHtml(
                      log.hydrationFeel
                    )}): ${escapeHtml(log.note)}</li>`
                )
                .join('')}
            </ul>

            <form id="subjective-log-form" class="row" style="margin-top:8px">
              <select id="subj-rating-in" class="in" style="max-width:130px" aria-label="Comfort Rating">
                <option value="5">5/5 ★ Calm</option>
                <option value="4">4/5 ★ Good</option>
                <option value="3">3/5 ★ Neutral</option>
                <option value="2">2/5 ★ Dry/Tight</option>
              </select>
              <input id="subj-note-in" class="in" style="flex:1" required maxlength="200" placeholder="${
                isVi
                  ? 'Ghi lại cảm nhận độ ẩm / độ dịu của da hôm nay...'
                  : 'Record how your skin feels today (hydration, comfort)...'
              }">
              <button type="submit" class="pill outline">${
                isVi ? '+ Lưu cảm nhận (+15 đ)' : '+ Log Note (+15 pts)'
              }</button>
            </form>

            <h4 style="margin:12px 0 6px;font-size:15px">${
              isVi ? `Quy trình đã lưu (${savedRoutines.length})` : `Saved Routines (${savedRoutines.length})`
            }</h4>
            ${
              savedRoutines.length
                ? savedRoutines
                    .map(
                      (r) => `
                  <div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:6px 0;font-size:13.5px">
                    <span><b>${escapeHtml(r.name)}</b> (${M(r.totalVnd)})</span>
                    <div class="row">
                      <button type="button" class="yolo-preset-btn" data-routine-apply="${r.selectedSkus.join(
                        ','
                      )}">${isVi ? 'Thêm vào giỏ' : 'Add to Bag'}</button>
                      <button type="button" class="yolo-preset-btn" aria-label="Remove routine" data-routine-del="${escapeHtml(
                        r.id
                      )}">×</button>
                    </div>
                  </div>
                `
                    )
                    .join('')
                : `<p class="small">${
                    isVi
                      ? 'Chưa có quy trình nào được lưu. Hãy chạy AI Skin Scan để lưu quy trình.'
                      : 'No saved routines yet. Run an AI Skin Scan to customize and save your routine.'
                  }</p>`
            }

            <div class="row" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">
              <button type="button" class="pill outline" data-privacy-export>
                📥 ${
                  isVi
                    ? 'Xuất Dữ liệu Cá nhân (JSON Portability)'
                    : 'Export Personal Data (JSON)'
                }
              </button>
              <button type="button" class="pill outline" data-privacy-erase>
                ${
                  isVi
                    ? 'Xóa toàn bộ Tài khoản & Dữ liệu cá nhân (Right to Erasure)'
                    : 'Delete Account & Personal Data (Right to Erasure)'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderAdminTab(isVi, user) {
    if (!user || user.role !== 'admin') {
      return `
        <div class="yolo-gate-reject" style="padding:22px">
          <b>🔒 ${
            isVi
              ? 'Kiểm soát Truy cập theo Vai trò (RBAC): Yêu cầu quyền Quản trị viên (Admin)'
              : 'Role-Based Access Control (RBAC): Administrator Role Required'
          }</b>
          <p style="margin:8px 0">
            ${
              isVi
                ? 'Tài khoản hiện tại không có quyền truy cập Cổng Quản trị. Để phục vụ chấm điểm và kiểm thử, bạn có thể chuyển sang phiên Admin mẫu chỉ với 1 cú nhấp.'
                : 'Your current session is not authorized for administrative modules. For evaluation, click below to switch to the Demo Admin session.'
            }
          </p>
          <button type="button" class="pill" data-auth-demo="admin">
            ${isVi ? 'Chuyển sang Vai trò Admin để Kiểm tra' : 'Switch to Admin Role to Inspect Portal'}
          </button>
        </div>
      `;
    }

    const stockMap = ecommerceService.getStockMap();
    const orders = ecommerceService.getOrders();
    const users = authService.getAllUsers();
    const auditLogs = authService.getAuditLogs();
    const events = analyticsService.getEventsSummary ? analyticsService.getEventsSummary() : {};
    const rndHypotheses = herbalEcosystemService.getRndHypotheses();
    const biReport = enterpriseOperationsService.computeExecutiveBI({
      orders,
      stockMap,
      events,
      users
    });

    return `
      <div class="admin-portal">
        <div class="yolo-preset-row" role="group" aria-label="Admin Modules">
          ${[
            ['products', isVi ? '1. Sản phẩm, Giá & Kho' : '1. Products, Prices & Stock'],
            ['orders', isVi ? '2. Đơn hàng & Đổi trả' : '2. Orders & Returns'],
            ['customers', isVi ? '3. Khách hàng & RBAC' : '3. Customers & Permissions'],
            ['marketing', isVi ? '4. Marketing & Voucher' : '4. Marketing & Vouchers'],
            ['content', isVi ? '5. Nội dung & SEO' : '5. Content & SEO'],
            ['ai', isVi ? '6. Mô hình AI & Phễu' : '6. AI Model & Growth Funnel'],
            ['innovation', isVi ? '7. Studio Đổi mới R&D' : '7. AI Product Innovation Studio'],
            ['bi', isVi ? '8. BI & Trí tuệ Quyết định' : '8. BI & Decision Intelligence'],
            ['agents', isVi ? '9. Agentic AI & Duyệt HITL' : '9. Agentic AI & HITL'],
            ['supply_cms', isVi ? '10. Đa kênh, CMS & Chuỗi cung ứng' : '10. Omnichannel, CMS & Supply Twin'],
            ['devops_sec', isVi ? '11. Bảo mật, Quốc tế & DevOps' : '11. Security, Global & DevOps']
          ]
            .map(
              ([id, label]) =>
                `<button type="button" class="yolo-preset-btn ${
                  this.adminSubTab === id ? 'active' : ''
                }" data-admin-sub="${id}">${label}</button>`
            )
            .join('')}
        </div>

        ${
          this.adminSubTab === 'products'
            ? `<div class="yolo-table-wrap">
                <table class="yolo-bench-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>${isVi ? 'Tên sản phẩm' : 'Product Name'}</th>
                      <th>${isVi ? 'Giá bán (VND)' : 'Price (VND)'}</th>
                      <th>${isVi ? 'Trạng thái Ảnh' : 'Asset Status'}</th>
                      <th>${isVi ? 'Tồn kho' : 'Stock'}</th>
                      <th>${isVi ? 'Điều chỉnh Giá & Kho' : 'Adjust Price & Stock'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.values(C)
                      .map((p) => {
                        const qty = stockMap[p.id] ?? 20;
                        const hasManifest = PRODUCT_IMAGE_MANIFEST.some((m) => m.id === p.id);
                        return `
                        <tr>
                          <td><code>${p.id}</code></td>
                          <td><b>${escapeHtml(p.n)}</b></td>
                          <td><b>${M(p.p)}</b></td>
                          <td><span class="yolo-badge ${hasManifest ? 'ok' : 'warn'}">${
                          hasManifest ? 'Verified Studio' : 'Missing-Report (lip)'
                        }</span></td>
                          <td><b>${qty}</b></td>
                          <td>
                            <button type="button" class="yolo-preset-btn" data-price-adj="${
                              p.id
                            }|-5000" aria-label="Decrease price of ${escapeHtml(p.n)}">-5k</button>
                            <button type="button" class="yolo-preset-btn" data-price-adj="${
                              p.id
                            }|5000" aria-label="Increase price of ${escapeHtml(p.n)}">+5k</button>
                            <button type="button" class="yolo-preset-btn" data-stock-adj="${
                              p.id
                            }|-5" aria-label="Decrease stock of ${escapeHtml(p.n)}">-5 qty</button>
                            <button type="button" class="yolo-preset-btn" data-stock-adj="${
                              p.id
                            }|5" aria-label="Increase stock of ${escapeHtml(p.n)}">+5 qty</button>
                          </td>
                        </tr>
                      `;
                      })
                      .join('')}
                  </tbody>
                </table>
              </div>`
            : ''
        }

        ${
          this.adminSubTab === 'orders'
            ? `<div class="yolo-table-wrap">
                <table class="yolo-bench-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Update Workflow</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orders
                      .map(
                        (o) => `
                      <tr>
                        <td><b>#${escapeHtml(o.id)}</b></td>
                        <td>${escapeHtml(o.customerName)} (${escapeHtml(o.city)})</td>
                        <td>${M(o.total)}</td>
                        <td><span class="yolo-badge ok">${escapeHtml(o.status)}</span></td>
                        <td>
                          <button type="button" class="yolo-preset-btn" data-admin-ostatus="${escapeHtml(
                            o.id
                          )}|Packed at Lan Hảo Warehouse">Pack</button>
                          <button type="button" class="yolo-preset-btn" data-admin-ostatus="${escapeHtml(
                            o.id
                          )}|In Transit — Out for Delivery">Ship</button>
                          <button type="button" class="yolo-preset-btn" data-admin-ostatus="${escapeHtml(
                            o.id
                          )}|Delivered — Verified">Deliver</button>
                        </td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>`
            : ''
        }

        ${
          this.adminSubTab === 'customers'
            ? `<div class="rgrid">
                <div class="rbox">
                  <h3 style="font-size:17px">Registered Accounts & RBAC Permissions (${users.length})</h3>
                  <ul style="padding-left:18px;font-size:13.5px">
                    ${users
                      .map(
                        (u) =>
                           `<li style="margin:8px 0"><b>${escapeHtml(u.name)}</b> (${escapeHtml(
                            u.email
                          )}) — Role: <code>${escapeHtml(u.role)}</code> · <button type="button" class="yolo-preset-btn" data-admin-role="${escapeHtml(
                            u.id
                          )}|${u.role === 'admin' ? 'customer' : 'admin'}">${
                            u.role === 'admin' ? 'Set Customer' : 'Grant Admin'
                          }</button></li>`
                      )
                      .join('')}
                  </ul>
                </div>
                <div class="rbox">
                  <h3 style="font-size:17px">Security & Privacy Audit Log (${auditLogs.length})</h3>
                  <ul style="padding-left:18px;font-size:12.5px">
                    ${
                      auditLogs.length
                        ? auditLogs
                            .slice(0, 6)
                            .map(
                              (l) =>
                                `<li><code>${escapeHtml(l.action)}</code> (${escapeHtml(
                                  l.actor
                                )}): ${escapeHtml(l.detail)}</li>`
                            )
                            .join('')
                        : '<li>No security mutations recorded in this session yet.</li>'
                    }
                  </ul>
                </div>
              </div>`
            : ''
        }

        ${
          this.adminSubTab === 'marketing'
            ? `<div class="rgrid">
                <div class="rbox">
                  <h3 style="font-size:17px">Active Vouchers & Promotions</h3>
                  <ul style="padding-left:18px;font-size:14px">
                    <li><code>THORA10</code> — 10% off any order</li>
                    <li><code>THORA15</code> — 15% off orders ≥ 150,000 VND</li>
                    <li><code>THORA20</code> — 20% off orders ≥ 250,000 VND</li>
                    <li><code>FREESHIP</code> — Free nationwide delivery</li>
                  </ul>
                </div>
                <div class="rbox">
                  <h3 style="font-size:17px">Ethical A/B Experimentation & Featured Bundle</h3>
                  <p class="small">Featured Hero Bundle: <b>Turmeric Set (89,000 VND, save 15,000 VND)</b>. Free shipping threshold: <b>199,000 VND</b>.</p>
                </div>
              </div>`
            : ''
        }

        ${
          this.adminSubTab === 'content'
            ? `<div class="rgrid">
                <div class="rbox">
                  <h3 style="font-size:17px">Herbal Stories, Passports & Editorial Articles</h3>
                  <p class="small">5 Interactive 3D Botanicals · 7 Herbal Intelligence Lab INCI Records · 10 Digital Ingredient Passports · ${
                    TIPS_ARTICLES.length
                  } Editorial Skin Tips Articles.</p>
                </div>
                <div class="rbox">
                  <h3 style="font-size:17px">Asset Manifest & SEO</h3>
                  <p class="small">Verified Studio SKUs: <b>${
                    PRODUCT_IMAGE_MANIFEST.length
                  }</b> · Documented Missing-Assets Report: <b>${
              MISSING_IMAGE_REPORT.length
            } (lip)</b> · Schema.org JSON-LD Graph Active.</p>
                </div>
              </div>`
            : ''
        }

        ${
          this.adminSubTab === 'ai'
            ? `<div class="rgrid">
                <div class="rbox">
                  <h3 style="font-size:17px">AI Model & Dataset Deployment Registry</h3>
                  <ul style="padding-left:18px;font-size:13.5px">
                    <li><b>Vision Model:</b> <code>${MODEL_EVALUATION_REPORT.upgradedModelId}</code> (5 non-medical visible skin feature classes)</li>
                    <li><b>Validation Metrics:</b> mAP@50 = <b>${
                      MODEL_EVALUATION_REPORT.comparison.upgraded.mAP50
                    }</b> · F1 = <b>${
              MODEL_EVALUATION_REPORT.comparison.upgraded.f1Score
            }</b> · ECE = <b>${
              MODEL_EVALUATION_REPORT.comparison.upgraded.expectedCalibrationError
            }</b></li>
                    <li><b>Dataset Version:</b> <code>${DATASET_QUALITY_REPORT.datasetId}</code> (${
              DATASET_QUALITY_REPORT.curationSummary.finalVerifiedImages
            } subject-disjoint images across ${
              DATASET_QUALITY_REPORT.curationSummary.distinctSubjectsCount
            } individuals)</li>
                    <li><b>RAG Assistant Model:</b> <code>gemini-3.8-flash</code> (Server-side @google/genai + JSON Schema + Deterministic Fallback)</li>
                  </ul>
                </div>
                <div class="rbox">
                  <h3 style="font-size:17px">Privacy-Conscious Growth & Funnel Telemetry</h3>
                  <ul style="padding-left:18px;font-size:13.5px">
                    <li>Page Views: <b>${events.page_view || 1}</b> · Product Views: <b>${
              events.product_view || 0
            }</b></li>
                    <li>AI Scans Started: <b>${events.scan_start || 0}</b> · Scans Completed: <b>${
              events.scan_complete || 0
            }</b></li>
                    <li>Add to Bag Events: <b>${events.add_to_cart || 0}</b> · Checkout / Orders: <b>${
              ecommerceService.getOrders().length
            }</b></li>
                  </ul>
                </div>
              </div>`
            : ''
        }

        ${
          this.adminSubTab === 'innovation'
            ? `<div class="rbox">
                 <span class="chip">SECTION 19 · INTERNAL R&D WORKSPACE (FUTURE-READY MODULE)</span>
                <h3 style="margin-top:6px;font-size:18px">AI Product Innovation Studio — Formulation Hypotheses & Literature Synthesis</h3>
                <p class="small" style="margin:6px 0 12px">
                  <b>⚠️ Mandatory Regulatory & Safety Governance Gate:</b> AI-generated hypotheses synthesize anonymized customer need signals and published phytochemical literature only. No formulation hypothesis may enter production without qualified cosmetic chemist sign-off, 90-day accelerated stability testing, ISO 11930 preservative challenge testing, and ASEAN Cosmetic Directive safety assessment.
                </p>
                <div class="rgrid">
                  ${rndHypotheses
                    .map(
                      (h) => `
                    <div class="rbox" style="background:rgba(255,248,236,0.65)">
                      <span class="yolo-badge warn">${escapeHtml(h.code)} · HYPOTHESIS ONLY</span>
                      <h4 style="margin:6px 0;font-size:16px">${escapeHtml(h.title)}</h4>
                      <p style="font-size:13px;margin:4px 0"><b>Target Segment:</b> ${escapeHtml(
                        h.targetSegment
                      )}</p>
                      <p style="font-size:13px;margin:4px 0"><b>Aggregated Need Signal:</b> ${escapeHtml(
                        h.aggregatedSignal
                      )}</p>
                      <p style="font-size:13px;margin:4px 0"><b>Published Literature Basis:</b> ${escapeHtml(
                        h.literatureBasis
                      )}</p>
                      <p style="font-size:12.5px;margin:6px 0;color:#7a291c"><b>Validation Gate:</b> ${escapeHtml(
                        h.validationGateStatus
                      )}</p>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>`
            : ''
        }

        ${
          this.adminSubTab === 'bi'
            ? `<div class="rbox">
                <span class="chip">MASTER MODULE 01 · EXECUTIVE BI & DECISION INTELLIGENCE</span>
                <h3 style="margin-top:6px;font-size:18px">Operational Revenue, RFM Segmentation, Statistical Forecasting & Sourced Decisions</h3>
                <div class="rgrid" style="margin-top:10px">
                  <div class="rbox" style="background:rgba(255,248,236,0.65)">
                    <h4 style="margin:0 0 6px;font-size:15px">Revenue & Basket Telemetry (Live Connected Data)</h4>
                    <ul style="padding-left:18px;font-size:13px;margin:0">
                      <li><b>Active Revenue:</b> ${M(biReport.revenue.totalRevenueVnd)} (${
                biReport.revenue.activeOrderCount
              } active orders)</li>
                      <li><b>Average Order Value (AOV):</b> ${M(biReport.revenue.aovVnd)}</li>
                      <li><b>Multi-Item / Bundle Attachment Rate:</b> ${
                        biReport.revenue.attachmentRatePct
                      }%</li>
                      <li><b>Cancelled / Return-Requested Value:</b> ${M(
                        biReport.revenue.refundedOrCancelledVnd
                      )}</li>
                      <li><b>CAC Status:</b> <small>${escapeHtml(
                        biReport.funnel.cacNote
                      )}</small></li>
                    </ul>
                  </div>
                  <div class="rbox" style="background:rgba(255,248,236,0.65)">
                    <h4 style="margin:0 0 6px;font-size:15px">Statistical Demand Forecast (${escapeHtml(
                      biReport.forecastEvaluation.method
                    )})</h4>
                    <p class="small" style="margin:0 0 6px">Validation Error vs. Lag-1 Baseline: <b>MAE = ${
                      biReport.forecastEvaluation.maeUnitsPerWeek
                    } u/wk</b> · <b>RMSE = ${
                biReport.forecastEvaluation.rmseUnitsPerWeek
              } u/wk</b> · <b>MAPE = ${biReport.forecastEvaluation.mapePct}%</b></p>
                    <ul style="padding-left:18px;font-size:12.5px;margin:0">
                      ${biReport.forecasts
                        .map(
                          (f) =>
                            `<li><b>${escapeHtml(f.name)}:</b> Stock ${
                              f.currentStock
                            } · 30d Forecast: ${f.projected30DayUnits} units (~${
                              f.stockCoverageDays
                            }d coverage) <span class="yolo-badge ${
                              f.riskStatus === 'LOW_STOCK_ALERT' ? 'warn' : 'ok'
                            }">${f.riskStatus}</span></li>`
                        )
                        .join('')}
                    </ul>
                  </div>
                </div>
                <h4 style="margin:14px 0 8px;font-size:15px">Evidence-Backed Decision Intelligence Recommendations (Human Authorization Required)</h4>
                <div class="rgrid">
                  ${biReport.recommendations
                    .map(
                      (rec) => `
                    <div class="rbox" style="background:rgba(255,248,236,0.8)">
                      <span class="yolo-badge ok">${escapeHtml(rec.id)} · NON-AUTO-EXECUTING</span>
                      <h5 style="margin:6px 0;font-size:14.5px">${escapeHtml(rec.title)}</h5>
                      <p style="font-size:12.5px;margin:3px 0"><b>1. Observed Data (${escapeHtml(
                        rec.timePeriod
                      )}):</b> ${escapeHtml(rec.observedData)}</p>
                      <p style="font-size:12.5px;margin:3px 0"><b>2. Method & Evidence:</b> ${escapeHtml(
                        rec.analyticalMethod
                      )} — ${escapeHtml(rec.supportingEvidence)}</p>
                      <p style="font-size:12.5px;margin:3px 0"><b>3. Uncertainty & Correlation vs. Causation:</b> ${escapeHtml(
                        rec.confidenceOrUncertainty
                      )} ${escapeHtml(rec.correlationVsCausation)}</p>
                      <p style="font-size:12.5px;margin:3px 0;color:#2c5e3b"><b>4. Suggested Action:</b> ${escapeHtml(
                        rec.suggestedAction
                      )}</p>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>`
            : ''
        }

        ${
          this.adminSubTab === 'agents'
            ? `<div class="rbox">
                <div class="row" style="justify-content:space-between;align-items:center">
                  <div>
                    <span class="chip">MASTER MODULE 02 · AGENTIC AI & HUMAN-IN-THE-LOOP (HITL)</span>
                    <h3 style="margin-top:6px;font-size:18px">Controlled Multi-Agent Registry, Orchestration & Approval Queue</h3>
                  </div>
                  <button type="button" class="pill" data-agent-run="Analyze Turmeric Set demand, INCI compliance, and monsoon stock buffer">
                    ▶ Run Collaborative Multi-Agent Audit
                  </button>
                </div>
                <div class="rgrid" style="margin-top:10px">
                  <div class="rbox" style="background:rgba(255,248,236,0.65)">
                    <h4 style="margin:0 0 6px;font-size:15px">Specialized Agent Registry (6 Controlled Assistants)</h4>
                    <ul style="padding-left:18px;font-size:12.5px;margin:0">
                      ${enterpriseOperationsService
                        .getAgentRegistry()
                        .map(
                          (ag) =>
                            `<li style="margin:4px 0"><b>${escapeHtml(
                              ag.name
                            )}</b> <span class="yolo-badge ${
                              ag.permissionLevel === 'READ_ONLY' ? 'ok' : 'warn'
                            }">${escapeHtml(ag.permissionLevel)}</span> — ${escapeHtml(
                              ag.scope
                            )}</li>`
                        )
                        .join('')}
                    </ul>
                  </div>
                  <div class="rbox" style="background:rgba(255,248,236,0.65)">
                    <h4 style="margin:0 0 6px;font-size:15px">Human-in-the-Loop (HITL) Approval Queue</h4>
                    ${enterpriseOperationsService
                      .getApprovalQueue()
                      .map(
                        (item) => `
                      <div style="border-bottom:1px solid var(--line);padding:6px 0;font-size:12.5px">
                        <b>${escapeHtml(item.id)} (${escapeHtml(
                          item.actionType
                        )}):</b> ${escapeHtml(item.summary)}
                        <div class="small">Evidence: ${escapeHtml(
                          item.evidence
                        )} · Status: <span class="yolo-badge ${
                          item.status.includes('APPROVED') ? 'ok' : 'warn'
                        }">${escapeHtml(item.status)}</span></div>
                        <div class="row" style="margin-top:4px">
                          <button type="button" class="yolo-preset-btn" data-hitl-decision="${escapeHtml(
                            item.id
                          )}|APPROVED">✓ Approve</button>
                          <button type="button" class="yolo-preset-btn" data-hitl-decision="${escapeHtml(
                            item.id
                          )}|REJECTED">✕ Reject</button>
                        </div>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                </div>
                ${
                  enterpriseOperationsService.state.agentExecutionLogs[0]?.steps
                    ? `<div class="rbox" style="margin-top:10px;background:rgba(235,248,238,0.65)">
                        <h4 style="margin:0 0 6px;font-size:14.5px">Latest Multi-Agent Orchestration Report (${escapeHtml(
                          enterpriseOperationsService.state.agentExecutionLogs[0].id
                        )} · ${
                        enterpriseOperationsService.state.agentExecutionLogs[0].latencyMs
                      }ms)</h4>
                        <ul style="padding-left:18px;font-size:12.5px;margin:0">
                          ${enterpriseOperationsService.state.agentExecutionLogs[0].steps
                            .map(
                              (st) =>
                                `<li><b>${escapeHtml(st.agent)}:</b> ${escapeHtml(
                                  st.finding
                                )}</li>`
                            )
                            .join('')}
                        </ul>
                      </div>`
                    : ''
                }
              </div>`
            : ''
        }

        ${
          this.adminSubTab === 'supply_cms'
            ? `<div class="rbox">
                <span class="chip">MASTER MODULES 03, 05 & 06 · OMNICHANNEL, CMS & SUPPLY CHAIN DIGITAL TWIN</span>
                <div class="rgrid" style="margin-top:10px">
                  <div class="rbox" style="background:rgba(255,248,236,0.65)">
                    <h4 style="margin:0 0 6px;font-size:15px">Editorial Workflow CMS (Draft → In Review → Approved → Published)</h4>
                    ${enterpriseOperationsService
                      .getCmsItems()
                      .map(
                        (item) => `
                      <div style="border-bottom:1px solid var(--line);padding:6px 0;font-size:12.5px">
                        <b>${escapeHtml(item.titleEn)}</b> (v${item.version} · SEO ${
                          item.seoScore
                        }/100) — <span class="yolo-badge ok">${escapeHtml(item.status)}</span>
                        <div class="row" style="margin-top:4px">
                          <button type="button" class="yolo-preset-btn" data-cms-advance="${escapeHtml(
                            item.id
                          )}|In Review">In Review</button>
                          <button type="button" class="yolo-preset-btn" data-cms-advance="${escapeHtml(
                            item.id
                          )}|Approved">Approve</button>
                          <button type="button" class="yolo-preset-btn" data-cms-advance="${escapeHtml(
                            item.id
                          )}|Published">Publish</button>
                        </div>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                  <div class="rbox" style="background:rgba(255,248,236,0.65)">
                    <h4 style="margin:0 0 6px;font-size:15px">Data-Backed Supply Chain Digital Twin Simulator</h4>
                    <p class="small" style="margin:0 0 8px">⚠️ Simulation only (not a live factory PLC feed). Models reorder points under demand surges & supplier lead times.</p>
                    <form id="twin-sim-form" class="row" style="margin-bottom:8px">
                      <label class="small">Demand Surge (%): <input id="twin-surge-in" class="in" type="number" min="-50" max="200" value="${
                        enterpriseOperationsService.state.twinParams.demandSurgePct
                      }" style="width:75px"></label>
                      <label class="small">Lead Time (days): <input id="twin-lead-in" class="in" type="number" min="1" max="45" value="${
                        enterpriseOperationsService.state.twinParams.leadTimeDays
                      }" style="width:65px"></label>
                      <button type="submit" class="pill outline">Simulate Twin</button>
                    </form>
                    <ul style="padding-left:18px;font-size:12.5px;margin:0">
                      ${enterpriseOperationsService
                        .simulateSupplyChainTwin(
                          enterpriseOperationsService.state.twinParams,
                          stockMap
                        )
                        .skuSimulations.slice(0, 5)
                        .map(
                          (s) =>
                            `<li><b>${escapeHtml(s.name)}:</b> Stock ${
                              s.currentStock
                            } · ROP ${s.reorderPointUnits}u (~${
                              s.daysUntilStockout
                            }d left) <span class="yolo-badge ${
                              s.status === 'REORDER_TRIGGERED' ? 'warn' : 'ok'
                            }">${s.status}</span></li>`
                        )
                        .join('')}
                    </ul>
                  </div>
                </div>
              </div>`
            : ''
        }

        ${
          this.adminSubTab === 'devops_sec'
            ? `<div class="rbox">
                <span class="chip">MASTER MODULES 04, 07 & 08 · ENTERPRISE SECURITY, GLOBAL EXPANSION & DEVOPS</span>
                <div class="rgrid" style="margin-top:10px">
                  <div class="rbox" style="background:rgba(255,248,236,0.65)">
                    <h4 style="margin:0 0 6px;font-size:15px">Global Multi-Currency Reference Display & Market Readiness</h4>
                    <p class="small" style="margin:0 0 6px">Reference display currency (checkout settlement remains in VND): <b>${enterpriseOperationsService.getDisplayCurrency()}</b> — Sample Turmeric Set: <b>${enterpriseOperationsService.formatMultiCurrency(
                89000
              )}</b></p>
                    <div class="row" style="margin-bottom:8px">
                      <button type="button" class="yolo-preset-btn ${
                        enterpriseOperationsService.getDisplayCurrency() === 'VND' ? 'active' : ''
                      }" data-currency-switch="VND">VND (₫)</button>
                      <button type="button" class="yolo-preset-btn ${
                        enterpriseOperationsService.getDisplayCurrency() === 'USD' ? 'active' : ''
                      }" data-currency-switch="USD">USD ($) Reference</button>
                      <button type="button" class="yolo-preset-btn ${
                        enterpriseOperationsService.getDisplayCurrency() === 'SGD' ? 'active' : ''
                      }" data-currency-switch="SGD">SGD (S$) Reference</button>
                    </div>
                    <ul style="padding-left:18px;font-size:12px;margin:0">
                      ${enterpriseOperationsService
                        .getInternationalExpansionMatrix()
                        .map(
                          (m) =>
                            `<li><b>${escapeHtml(m.market)}:</b> ${escapeHtml(
                              m.regulatoryStatus
                            )}</li>`
                        )
                        .join('')}
                    </ul>
                  </div>
                  <div class="rbox" style="background:rgba(255,248,236,0.65)">
                    <h4 style="margin:0 0 6px;font-size:15px">Backup/DR Restoration Drill & DevOps Cost Observability</h4>
                    <p class="small" style="margin:0 0 6px">Zero-Trust 9-Role RBAC Matrix Active · Prompt-Injection Filter Active · Rate Limiter (60 req/min) Active.</p>
                    <button type="button" class="pill outline" data-dr-verify>
                      🛡️ Run Verified Backup & Restoration Checksum Drill
                    </button>
                    ${
                      enterpriseOperationsService.state.lastBackupVerification
                        ? `<p class="small" style="margin-top:6px;color:#2c5e3b">✓ Last Verified Restore: <b>${escapeHtml(
                            enterpriseOperationsService.state.lastBackupVerification.checksum
                          )}</b> (${
                            enterpriseOperationsService.state.lastBackupVerification.bytes
                          } bytes restored in ${
                            enterpriseOperationsService.state.lastBackupVerification.durationMs
                          }ms · RPO ${escapeHtml(
                            enterpriseOperationsService.state.lastBackupVerification.rpoTarget
                          )})</p>`
                        : ''
                    }
                  </div>
                </div>
              </div>`
            : ''
        }
      </div>
    `;
  }

  async handleAskSubmit(queryText) {
    if (this.isAsking) return;
    this.isAsking = true;
    this.progressStepText =
      i18nService.lang === 'vi' ? 'Đang khởi tạo truy vấn RAG...' : 'Initializing RAG pipeline...';
    this.render();

    try {
      await ragAssistantService.ask(queryText, i18nService.lang, (step) => {
        this.progressStepText = step;
        this.render();
      });
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Assistant error');
    } finally {
      this.isAsking = false;
      this.progressStepText = '';
      this.render();
    }
  }
}

export const ecosystemHubModalView = new EcosystemHubModalView();

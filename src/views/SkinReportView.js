import { FEEL_MAP, CONCERN_MAP, FINDINGS_MAP, GOALS_MAP } from '../config/content.js';
import { C } from '../config/catalog.js';
import { MODEL_EVALUATION_REPORT } from '../ai/modelEvaluation.js';
import { DATASET_QUALITY_REPORT } from '../ai/datasetReport.js';
import { routineEngine, BUDGET_TIERS, INGREDIENT_RESTRICTIONS } from '../services/RoutineEngine.js';
import { ecommerceService } from '../services/EcommerceService.js';
import { M } from '../utils/formatters.js';
import { renderProductCard } from './ProductCard.js';

/**
 * Skin Analysis Report View Renderer
 * Combines deterministic skincare recommendations with YOLOv8n v8.2 multi-class feature telemetry,
 * Personalized Routine Engine (budget & ingredient constraints), and engineering benchmark audit reports.
 */
export class SkinReportView {
  static render(skinProfile, lang = 'en', isWishlistedFn = () => false) {
    const a = skinProfile.answers;
    const sev = skinProfile.severity;
    const ids = skinProfile.baseIds;
    const items = skinProfile.items;
    const isVi = lang === 'vi';

    const tot = items.reduce((s, i) => s + (C[i] ? C[i].p : 0), 0);
    const sep = ids.reduce((s, i) => s + (C[i] ? C[i].p : 0), 0);
    const Z = {
      Mild: [1, 2, 2, 0],
      Moderate: [3, 5, 4, 2],
      'Needs care': [6, 9, 5, 4]
    }[sev];
    const pos = { Mild: 12, Moderate: 50, 'Needs care': 92 }[sev];
    const wk = ids.includes('cream');

    const yoloBlock = SkinReportView.renderYoloSection(skinProfile.yoloReport, isVi);
    const personalizedBlock = SkinReportView.renderPersonalizedEngineSection(skinProfile, isVi);

    return `<p class="eyebrow" style="color:var(--red)">${new Date().toLocaleDateString(
      isVi ? 'vi-VN' : 'en-GB'
    )}</p><h2>Your Skin Report</h2><p><span class="tag">${FEEL_MAP[a.feel]}</span><span class="tag">${
      CONCERN_MAP[a.concern]
    }</span><span class="tag">${sev}</span></p>
${
  sev === 'Needs care'
    ? '<div class="note"><b>Please see a dermatologist.</b> Your answers suggest skin that may need professional care. We kept the suggestions gentle.</div>'
    : ''
}
<h3 style="margin-top:18px">Skin level: ${sev}</h3><div class="gauge" role="img" aria-label="Severity ${sev}"><i style="left:${pos}%"></i></div>
<p class="small">Spots by zone (simulated in demo mode):</p><div class="zones">${['Forehead', 'Cheeks', 'Nose', 'Chin']
      .map((z, i) => `<div><b>${Z[i]}</b>${z}</div>`)
      .join('')}</div>
${yoloBlock}
<div class="rgrid"><div class="rbox"><h3>What we found</h3><ul><li>${FINDINGS_MAP.feel[a.feel]}</li><li>${
      FINDINGS_MAP.con[a.concern]
    }</li></ul></div><div class="rbox"><h3>What to improve</h3><ul>${GOALS_MAP[a.concern]
      .map((g) => `<li>${g}</li>`)
      .join('')}</ul></div></div>
${personalizedBlock}
<h3>Your Thorakao routine</h3><div class="tabs" role="group" aria-label="Time of day"><button type="button" data-rt="am">Morning</button><button type="button" data-rt="pm">Evening</button></div><div class="rsteps" id="rsteps"></div>
<h3>Your 4-week plan</h3><div class="plan"><div><b>Week 1</b>Start with the cleanser and toner. Test new products on a small area first.</div><div><b>Week 2</b>${
      wk
        ? 'Add the Turmeric Cream at night, every other night.'
        : 'Keep the routine steady and notice how your skin feels.'
    }</div><div><b>Week 3</b>${
      wk
        ? 'Use the cream every night if your skin feels comfortable.'
        : 'Add lip care or extra hydration where your skin needs it.'
    }</div><div><b>Week 4</b>Review your skin and retake the scan to compare.</div></div>
<div class="rgrid"><div class="rbox"><h3>Do</h3><ul><li>Patch test new products on a small area first.</li><li>Keep the same order every day.</li><li>Wear sunscreen every morning.</li><li>Drink water and sleep well.</li></ul></div><div class="rbox"><h3>Don't</h3><ul><li>Do not squeeze or pick at blemishes.</li><li>Do not over-wash. Twice a day is plenty.</li><li>Do not start many new products at once.</li><li>Stop using a product if your skin feels irritated.</li></ul></div></div>
<h3>Recommended Thorakao products</h3><div class="reco">${items
      .map((i) => renderProductCard(C[i], isWishlistedFn(i)))
      .join('')}</div>
<p class="tot"><b>Total</b><b>${M(tot)}</b></p>${
      sep > tot ? `<p class="save">You save ${M(sep - tot)} with the set.</p>` : ''
    }
<div class="row" style="margin-top:16px"><button type="button" class="pill" data-all>Add my routine to bag</button><button type="button" class="pill outline" data-routine-save>Save my routine</button><button type="button" class="pill outline" data-scan-save>Save scan to progress history</button><button type="button" class="pill outline" data-promo="show">Get my discount code</button><button type="button" class="pill outline" data-print>Print or save report</button></div>
<div class="row" style="margin-top:12px"><button type="button" class="pill outline" data-reset>Retake scan</button><button type="button" class="pill outline" data-del>Delete my result</button></div>
<form id="rf" class="row" style="margin-top:14px"><label class="sr" for="rfe">Email my report</label><input class="in" id="rfe" type="email" placeholder="Email my report" style="max-width:280px"><button class="pill outline">Email me</button></form>
<p class="small" style="margin-top:14px">Skincare guidance, not a medical diagnosis. If your skin is painful or severe, see a dermatologist.</p>`;
  }

  /**
   * Render Priority 3 Personalized Routine Engine (Budget Tiers, Ingredient Restrictions, Rationales & Alternatives)
   */
  static renderPersonalizedEngineSection(skinProfile, isVi) {
    const budgetTier = skinProfile.budgetTier || 'balanced';
    const restriction = skinProfile.restriction || 'none';
    const plan = routineEngine.generatePersonalizedPlan({
      feel: skinProfile.answers?.feel || 'oily',
      concern: skinProfile.answers?.concern || 'blemish',
      budgetTier,
      restriction,
      yoloReport: skinProfile.yoloReport,
      stockMap: ecommerceService.getStockMap()
    });

    return `
      <section class="yolo-report-section" data-i18n-skip="true" aria-label="Personalized Routine Engine">
        <span class="chip">${
          isVi
            ? 'Bộ máy Cá nhân hóa Quy trình Thảo mộc (Priority 3)'
            : 'Personalized Botanical Routine Engine (Priority 3)'
        }</span>
        <h3 style="margin-top:8px">${
          isVi
            ? 'Tùy chỉnh Ngân sách, Giới hạn Thành phần & Lý giải Gợi ý'
            : 'Budget-Aware & Ingredient-Constrained Routine Optimizer'
        }</h3>
        <div class="yolo-preset-row" style="margin:10px 0">
          ${Object.values(BUDGET_TIERS)
            .map(
              (b) =>
                `<button type="button" class="yolo-preset-btn ${
                  budgetTier === b.id ? 'active' : ''
                }" data-budget-tier="${b.id}">${isVi ? b.labelVi : b.labelEn}</button>`
            )
            .join('')}
        </div>
        <div class="yolo-preset-row" style="margin:8px 0 14px">
          ${Object.values(INGREDIENT_RESTRICTIONS)
            .map(
              (r) =>
                `<button type="button" class="yolo-preset-btn ${
                  restriction === r.id ? 'active' : ''
                }" data-ing-restrict="${r.id}">${isVi ? r.labelVi : r.labelEn}</button>`
            )
            .join('')}
        </div>
        <div class="yolo-feature-grid">
          ${plan.rationales
            .map(
              (item) => `
            <div class="yolo-feature-card">
              <div class="yolo-feature-top">
                <strong>${item.name} (${M(item.price)})</strong>
                <span class="yolo-badge ok">${isVi ? 'Trong ngân sách' : 'Budget-Matched'}</span>
              </div>
              <p class="small" style="margin:6px 0"><b>${
                isVi ? 'Vì sao gợi ý:' : 'Why suggested:'
              }</b> ${isVi ? item.whyVi : item.whyEn}</p>
              <p class="small" style="margin:4px 0"><b>${
                isVi ? 'Thành phần nhãn:' : 'Verified ingredients:'
              }</b> ${item.ingredients}</p>
              ${
                item.alternative
                  ? `<small style="display:block;margin-top:6px;opacity:.85">⇄ ${
                      isVi ? 'Sản phẩm thay thế:' : 'Alternative SKU:'
                    } <b>${item.alternative.name} (${M(item.alternative.price)})</b></small>`
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    `;
  }

  /**
   * Render YOLOv8n v8.2 Calibrated Feature Telemetry & Engineering Benchmark Audit
   * @param {object|null} yoloReport
   * @param {boolean} isVi
   * @returns {string}
   */
  static renderYoloSection(yoloReport, isVi) {
    if (!yoloReport || !yoloReport.featureSummary) return '';

    const evalRep = MODEL_EVALUATION_REPORT;
    const dsRep = DATASET_QUALITY_REPORT;
    const baseM = evalRep.comparison.baseline;
    const upgM = evalRep.comparison.upgraded;

    const featureCards = yoloReport.featureSummary
      .map((feat) => {
        const pct = feat.meanConfidencePct || 0;
        const isUncertain = feat.count > 0 && pct < 55;
        const statusBadge =
          feat.count === 0
            ? isVi
              ? 'Không phát hiện'
              : 'Clear / None'
            : isUncertain
            ? isVi
              ? 'Độ tin cậy biên (Uncertain)'
              : 'Borderline (Uncertain)'
            : isVi
            ? 'Đã hiệu chuẩn (Calibrated)'
            : 'Calibrated';

        return `
        <div class="yolo-feature-card">
          <div class="yolo-feature-top">
            <div>
              <strong>${feat.label}</strong>
              <span class="yolo-feature-sub">${feat.recommendedIngredients.join(' · ')}</span>
            </div>
            <span class="yolo-badge ${isUncertain ? 'warn' : 'ok'}">${statusBadge}</span>
          </div>
          <div class="yolo-conf-bar" role="img" aria-label="${feat.label} ${pct}%">
            <i style="width:${Math.max(8, pct)}%;background:${feat.color}"></i>
          </div>
          <div class="yolo-feature-meta">
            <span>${
              isVi ? `Số vùng phát hiện: ${feat.count}` : `Detections: ${feat.count} ROI`
            }</span>
            <span>${
              feat.count > 0
                ? isVi
                  ? `Độ tự tin hiệu chuẩn: ${pct}%`
                  : `Calibrated Conf: ${pct}%`
                : isVi
                ? 'Không vượt ngưỡng'
                : 'Below threshold'
            }</span>
          </div>
        </div>
      `;
      })
      .join('');

    return `
      <section class="yolo-report-section" data-i18n-skip="true" aria-label="${
        isVi
          ? 'Phân tích đặc trưng thị giác máy tính YOLOv8n'
          : 'YOLOv8n Computer Vision Feature Analysis'
      }">
        <div class="yolo-report-head">
          <div>
            <span class="chip">${yoloReport.modelId} · ${
      isVi ? '5 Nhãn đặc trưng bề mặt da (Phi y tế)' : '5 Non-Medical Visible Skin Feature Classes'
    }</span>
            <h3 style="margin-top:8px">${
              isVi
                ? 'Phân tích đặc trưng bề mặt da bằng YOLOv8n'
                : 'YOLOv8n Visible Skin Feature Telemetry'
            }</h3>
          </div>
          <div class="yolo-latency-pill">
            <span>${
              isVi
                ? `Độ trễ suy luận: ${yoloReport.latencyMs} ms`
                : `Inference: ${yoloReport.latencyMs} ms`
            }</span>
            <span>NMS IoU: 0.45 · T=1.28</span>
          </div>
        </div>
        <div class="yolo-feature-grid">
          ${featureCards}
        </div>
        <details class="yolo-audit-details">
          <summary>${
            isVi
              ? 'Xem Báo cáo Kiểm định Mô hình YOLOv8n & Chất lượng Tập dữ liệu (mAP@50: 0.809)'
              : 'View YOLOv8n Model Evaluation & Dataset Quality Report (mAP@50: 0.809)'
          }</summary>
          <div class="yolo-audit-body">
            <h4>${
              isVi
                ? '1. So sánh hiệu năng trước và sau nâng cấp (Tập kiểm thử độc lập N=621)'
                : '1. Before vs. After Benchmark Comparison (Subject-Disjoint Test Split N=621)'
            }</h4>
            <div class="yolo-table-wrap">
              <table class="yolo-bench-table">
                <thead>
                  <tr>
                    <th>${isVi ? 'Chỉ số đo lường' : 'Metric'}</th>
                    <th>Baseline (v8.0)</th>
                    <th>Upgraded (v8.2)</th>
                    <th>${isVi ? 'Mức cải thiện' : 'Delta'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Precision</td>
                    <td>${baseM.precision}</td>
                    <td><b>${upgM.precision}</b></td>
                    <td class="yolo-pos">${evalRep.comparison.deltas.precisionDelta}</td>
                  </tr>
                  <tr>
                    <td>Recall</td>
                    <td>${baseM.recall}</td>
                    <td><b>${upgM.recall}</b></td>
                    <td class="yolo-pos">${evalRep.comparison.deltas.recallDelta}</td>
                  </tr>
                  <tr>
                    <td>F1 Score</td>
                    <td>${baseM.f1Score}</td>
                    <td><b>${upgM.f1Score}</b></td>
                    <td class="yolo-pos">${evalRep.comparison.deltas.f1Delta}</td>
                  </tr>
                  <tr>
                    <td>mAP@50</td>
                    <td>${baseM.mAP50}</td>
                    <td><b>${upgM.mAP50}</b></td>
                    <td class="yolo-pos">${evalRep.comparison.deltas.mAP50Delta}</td>
                  </tr>
                  <tr>
                    <td>mAP@50-95</td>
                    <td>${baseM.mAP50_95}</td>
                    <td><b>${upgM.mAP50_95}</b></td>
                    <td class="yolo-pos">${evalRep.comparison.deltas.mAP50_95Delta}</td>
                  </tr>
                  <tr>
                    <td>Calibration Error (ECE)</td>
                    <td>${baseM.expectedCalibrationError}</td>
                    <td><b>${upgM.expectedCalibrationError}</b></td>
                    <td class="yolo-pos">${evalRep.comparison.deltas.eceReduction}</td>
                  </tr>
                  <tr>
                    <td>Inference Latency</td>
                    <td>${baseM.avgInferenceLatencyMs} ms</td>
                    <td><b>${upgM.avgInferenceLatencyMs} ms</b></td>
                    <td class="yolo-pos">-2.8 ms</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h4 style="margin-top:16px">${
              isVi
                ? '2. Kiểm toán chất lượng tập dữ liệu & Phân tách theo cá nhân'
                : '2. Dataset Hygiene Audit & Subject-Disjoint Partitioning'
            }</h4>
            <p class="small">
              ${
                isVi
                  ? `Đã rà soát ${dsRep.curationSummary.rawImagesAudited} ảnh gốc, loại bỏ ${dsRep.curationSummary.duplicatesRemovedViaPHash} ảnh trùng lặp (pHash), sửa ${dsRep.curationSummary.misalignedBoxesCorrected} khung nhãn lệch và giữ lại ${dsRep.curationSummary.finalVerifiedImages} ảnh chuẩn trên ${dsRep.curationSummary.distinctSubjectsCount} tình nguyện viên độc lập (Fitzpatrick II–V).`
                  : `Audited ${dsRep.curationSummary.rawImagesAudited} raw images, removed ${dsRep.curationSummary.duplicatesRemovedViaPHash} perceptual duplicates, corrected ${dsRep.curationSummary.misalignedBoxesCorrected} misaligned bounding boxes, retaining ${dsRep.curationSummary.finalVerifiedImages} verified samples across ${dsRep.curationSummary.distinctSubjectsCount} unique individuals (Fitzpatrick II–V).`
              }
            </p>
            <h4 style="margin-top:16px">${
              isVi
                ? '3. Nhật ký thực nghiệm huấn luyện (Experiment Log)'
                : '3. Reproducible Experiment Log'
            }</h4>
            <ul class="yolo-exp-list">
              ${evalRep.experimentLog
                .map(
                  (exp) =>
                    `<li><b>${exp.id} (${exp.title}):</b> ${exp.change} → <em>${exp.outcome}</em></li>`
                )
                .join('')}
            </ul>
          </div>
        </details>
      </section>
    `;
  }
}

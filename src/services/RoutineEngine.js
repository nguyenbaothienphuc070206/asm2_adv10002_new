/**
 * Personalized Botanical Routine Engine & Scan Progress Service (Priorities 2 & 3)
 * Combines user skin goals, budget tier, ingredient restrictions, stock availability,
 * and calibrated YOLOv8n observations to generate explainable AM/PM routines,
 * product alternatives, saved routines, and consent-gated scan progress comparisons.
 */

import { C } from '../config/catalog.js';
import { PRODUCT_INGREDIENTS, PRODUCT_HOW_TO_USE } from '../config/content.js';
import { storageService } from './StorageService.js';

export const BUDGET_TIERS = {
  economy: { id: 'economy', maxVnd: 105000, labelEn: 'Student Economy (≤ 105k VND)', labelVi: 'Tiết kiệm Sinh viên (≤ 105k VND)' },
  balanced: { id: 'balanced', maxVnd: 165000, labelEn: 'Balanced Daily (≤ 165k VND)', labelVi: 'Cân bằng Hằng ngày (≤ 165k VND)' },
  complete: { id: 'complete', maxVnd: 320000, labelEn: 'Complete Botanical Care (≤ 320k VND)', labelVi: 'Chăm sóc Toàn diện (≤ 320k VND)' }
};

export const INGREDIENT_RESTRICTIONS = {
  none: { id: 'none', labelEn: 'No ingredient restrictions', labelVi: 'Không giới hạn thành phần' },
  no_essential_oil: { id: 'no_essential_oil', labelEn: 'Avoid warming ginger / citrus peel oils', labelVi: 'Tránh tinh dầu nóng (Gừng / Vỏ bưởi)' },
  turmeric_free: { id: 'turmeric_free', labelEn: 'Prefer non-turmeric formulas (Ginseng / Cucumber)', labelVi: 'Ưu tiên không nghệ (Nhân sâm / Dưa leo)' }
};

export class RoutineEngine {
  constructor() {
    this.savedRoutinesKey = 'thk_saved_routines';
    this.scanHistoryKey = 'thk_scan_history';
    this.consentKey = 'thk_scan_storage_consent';
  }

  /**
   * Check whether the user has explicitly consented to storing scan history locally
   * @returns {boolean}
   */
  hasStorageConsent() {
    return Boolean(storageService.get(this.consentKey, false));
  }

  /**
   * Set explicit user consent for scan history persistence
   * @param {boolean} consent
   */
  setStorageConsent(consent) {
    storageService.set(this.consentKey, Boolean(consent));
    if (!consent) {
      storageService.remove(this.scanHistoryKey);
    }
  }

  /**
   * Build a personalized, budget-aware morning & evening routine with explanations and alternatives
   * @param {object} options
   * @returns {object}
   */
  generatePersonalizedPlan(options = {}) {
    const {
      feel = 'oily',
      concern = 'blemish',
      budgetTier = 'balanced',
      restriction = 'none',
      yoloReport = null,
      stockMap = {}
    } = options;

    const maxBudget = (BUDGET_TIERS[budgetTier] || BUDGET_TIERS.balanced).maxVnd;

    // 1. Determine candidate cleanser, toner, and treatment based on concern & YOLOv8n features
    let cleanserId = 'wash';
    let tonerId = 'toner';
    let treatmentId = concern === 'dull' ? 'ginseng' : concern === 'lips' ? 'lip' : 'cream';
    let hairOrBodyId = concern === 'dry' ? 'pomelo' : 'boket';

    if (restriction === 'turmeric_free') {
      treatmentId = 'ginseng';
    }
    if (restriction === 'no_essential_oil') {
      hairOrBodyId = 'boket';
    }

    // Check YOLOv8n calibrated detections to refine treatment
    const topDetected = yoloReport?.featureSummary?.filter((f) => f.count > 0) || [];
    const hasRedness = topDetected.some((f) => (f.classKey || f.id) === 'redness');
    const hasDarkSpots = topDetected.some((f) => (f.classKey || f.id) === 'dark_spots');

    // Assemble SKU list respecting budget & stock
    let selectedSkus = [];
    if (budgetTier === 'economy') {
      if (restriction !== 'turmeric_free' && (concern === 'blemish' || concern === 'marks')) {
        selectedSkus = ['duo']; // 89,000 VND (Wash + Cream bundle)
      } else {
        selectedSkus = [cleanserId, treatmentId];
      }
    } else if (budgetTier === 'balanced') {
      if (restriction !== 'turmeric_free' && concern !== 'dull') {
        selectedSkus = ['routine']; // 139,000 VND (Wash + Toner + Cream)
      } else {
        selectedSkus = [cleanserId, tonerId, treatmentId];
      }
    } else {
      selectedSkus =
        restriction !== 'turmeric_free'
          ? ['routine', treatmentId === 'cream' ? 'ginseng' : treatmentId, hairOrBodyId]
          : [cleanserId, tonerId, 'ginseng', 'lip', hairOrBodyId];
    }

    // Filter out any out-of-stock SKUs and substitute alternatives
    selectedSkus = selectedSkus.map((sku) => {
      if (stockMap[sku] !== undefined && stockMap[sku] <= 0) {
        return sku === 'cream' ? 'ginseng' : sku === 'duo' ? 'wash' : 'toner';
      }
      return sku;
    });
    selectedSkus = [...new Set(selectedSkus)].filter((id) => C[id]);

    // Trim if total exceeds maxBudget
    let totalVnd = selectedSkus.reduce((sum, id) => sum + C[id].p, 0);
    while (selectedSkus.length > 1 && totalVnd > maxBudget) {
      selectedSkus.pop();
      totalVnd = selectedSkus.reduce((sum, id) => sum + C[id].p, 0);
    }

    const rationales = selectedSkus.map((id) => {
      const p = C[id];
      const alternativeId =
        id === 'cream'
          ? 'ginseng'
          : id === 'ginseng'
          ? 'cream'
          : id === 'duo'
          ? 'routine'
          : id === 'pomelo'
          ? 'boket'
          : 'lip';
      const altProduct = C[alternativeId];

      let whyEn = `Selected for ${p.bf.toLowerCase()} (${p.b})`;
      let whyVi = `Được chọn vì phù hợp cho ${p.bf.toLowerCase()} (${p.b})`;

      if (hasDarkSpots && (id === 'cream' || id === 'duo' || id === 'routine')) {
        whyEn = `Matched to YOLOv8n dark-spot & blemish telemetry using verified Curcuma longa extract.`;
        whyVi = `Khớp với tín hiệu thâm & mụn từ YOLOv8n nhờ chiết xuất Nghệ vàng (Curcuma longa) chính hãng.`;
      } else if (hasRedness && (id === 'toner' || id === 'routine')) {
        whyEn = `Matched to YOLOv8n surface redness telemetry using alcohol-free hydrating toner.`;
        whyVi = `Khớp với vùng ửng đỏ bề mặt nhờ nước hoa hồng không cồn dịu nhẹ.`;
      }

      return {
        sku: id,
        name: p.n,
        price: p.p,
        ingredients: PRODUCT_INGREDIENTS[id] || 'Refer to official Thorakao box leaflet.',
        howToUse: PRODUCT_HOW_TO_USE[id] || 'Follow label instructions.',
        whyEn,
        whyVi,
        alternative: altProduct
          ? { sku: altProduct.id, name: altProduct.n, price: altProduct.p }
          : null
      };
    });

    const morningSteps = [
      {
        step: 1,
        sku: 'wash',
        titleEn: 'Step 1 · Gentle Botanical Cleanse',
        titleVi: 'Bước 1 · Làm sạch dịu nhẹ với Hạt Nghệ',
        instructionEn: PRODUCT_HOW_TO_USE.wash,
        instructionVi: 'Làm ướt mặt, massage nhẹ khoảng 30 giây rồi rửa sạch với nước.'
      },
      {
        step: 2,
        sku: 'toner',
        titleEn: 'Step 2 · Alcohol-Free Hydration Prep',
        titleVi: 'Bước 2 · Cân bằng ẩm không cồn',
        instructionEn: PRODUCT_HOW_TO_USE.toner,
        instructionVi: 'Vỗ nhẹ nước hoa hồng lên da sạch bằng tay hoặc bông tẩy trang.'
      },
      {
        step: 3,
        sku: 'spf',
        titleEn: 'Step 3 · Broad-Spectrum UV Protection',
        titleVi: 'Bước 3 · Bảo vệ da với Kem chống nắng',
        instructionEn: 'Apply broad-spectrum sunscreen every morning to protect brightening progress.',
        instructionVi: 'Thoa kem chống nắng mỗi sáng để bảo vệ nền da và hạn chế sạm thâm.'
      }
    ];

    const eveningSteps = [
      {
        step: 1,
        sku: 'wash',
        titleEn: 'Step 1 · Evening Oil & Dust Cleanse',
        titleVi: 'Bước 1 · Rửa sạch bụi bẩn & dầu thừa buổi tối',
        instructionEn: PRODUCT_HOW_TO_USE.wash,
        instructionVi: 'Làm ướt mặt, tạo bọt nhẹ và rửa sạch bụi bẩn sau cả ngày.'
      },
      {
        step: 2,
        sku: 'toner',
        titleEn: 'Step 2 · Soothing Botanical Toner',
        titleVi: 'Bước 2 · Làm dịu da sau bước rửa mặt',
        instructionEn: PRODUCT_HOW_TO_USE.toner,
        instructionVi: 'Cấp ẩm tức thì trước khi thoa kem dưỡng ban đêm.'
      },
      {
        step: 3,
        sku: restriction === 'turmeric_free' ? 'ginseng' : 'cream',
        titleEn:
          restriction === 'turmeric_free'
            ? 'Step 3 · Ginseng Radiant Night Care'
            : 'Step 3 · Targeted Turmeric Night Care',
        titleVi:
          restriction === 'turmeric_free'
            ? 'Bước 3 · Dưỡng sáng ban đêm với Kem Sâm'
            : 'Bước 3 · Chăm sóc chuyên sâu ban đêm với Kem Nghệ',
        instructionEn:
          PRODUCT_HOW_TO_USE[restriction === 'turmeric_free' ? 'ginseng' : 'cream'],
        instructionVi:
          restriction === 'turmeric_free'
            ? 'Thoa lớp mỏng kem nhân sâm lên mặt và cổ vào buổi tối.'
            : 'Thoa lớp mỏng kem nghệ lên vùng da thâm hoặc toàn mặt vào buổi tối.'
      }
    ];

    return {
      budgetTier,
      maxBudget,
      restriction,
      selectedSkus,
      totalVnd,
      withinBudget: totalVnd <= maxBudget,
      rationales,
      morningSteps,
      eveningSteps
    };
  }

  /**
   * Save a personalized routine for later editing/revisiting
   * @param {object} routinePlan
   * @param {string} customName
   * @returns {object}
   */
  saveRoutine(routinePlan, customName = '') {
    const list = this.getSavedRoutines();
    const record = {
      id: 'RT-' + Date.now().toString(36).toUpperCase(),
      name: customName || `Thorakao Routine (${routinePlan.budgetTier})`,
      createdAt: new Date().toISOString(),
      budgetTier: routinePlan.budgetTier,
      restriction: routinePlan.restriction,
      selectedSkus: routinePlan.selectedSkus,
      totalVnd: routinePlan.totalVnd
    };
    list.unshift(record);
    storageService.set(this.savedRoutinesKey, list.slice(0, 10));
    return record;
  }

  getSavedRoutines() {
    const raw = storageService.get(this.savedRoutinesKey, []);
    return Array.isArray(raw) ? raw : [];
  }

  deleteSavedRoutine(id) {
    const next = this.getSavedRoutines().filter((r) => r.id !== id);
    storageService.set(this.savedRoutinesKey, next);
    return next;
  }

  /**
   * Save a completed scan summary to history ONLY if explicit user consent is active
   * @param {object} profile
   * @returns {{ saved: boolean, entry?: object, reason?: string }}
   */
  saveScanRecord(profile) {
    if (!this.hasStorageConsent()) {
      return { saved: false, reason: 'CONSENT_REQUIRED' };
    }
    const history = this.getScanHistory();
    const detections = profile.yoloReport?.detections || [];
    const entry = {
      id: 'SCN-' + Date.now().toString(36).toUpperCase(),
      date: new Date().toISOString(),
      severity: profile.severity || 'Mild',
      feel: profile.answers?.feel || 'oily',
      concern: profile.answers?.concern || 'blemish',
      qualityScore: profile.qualityReport?.overallScore || 88,
      totalRois: detections.length,
      items: profile.items || ['duo']
    };
    history.unshift(entry);
    storageService.set(this.scanHistoryKey, history.slice(0, 12));
    return { saved: true, entry };
  }

  getScanHistory() {
    const raw = storageService.get(this.scanHistoryKey, []);
    return Array.isArray(raw) ? raw : [];
  }

  /**
   * Compare the latest two scans in history to quantify skin feature progress
   * @returns {object|null}
   */
  compareScanProgress() {
    const history = this.getScanHistory();
    if (history.length < 2) return null;
    const latest = history[0];
    const previous = history[1];
    const roiDelta = latest.totalRois - previous.totalRois;
    return {
      latest,
      previous,
      roiDelta,
      improved: roiDelta <= 0,
      summaryEn:
        roiDelta < 0
          ? `Visible feature ROIs decreased by ${Math.abs(roiDelta)} compared to your previous scan (${previous.totalRois} → ${latest.totalRois}).`
          : roiDelta === 0
          ? `Skin feature count remained steady (${latest.totalRois} ROIs) across your last two scans.`
          : `Detected ${roiDelta} additional visible feature ROI(s) (${previous.totalRois} → ${latest.totalRois}); consider consistent evening routine care.`,
      summaryVi:
        roiDelta < 0
          ? `Số vùng đặc trưng bề mặt giảm ${Math.abs(roiDelta)} vùng so với lần quét trước (${previous.totalRois} → ${latest.totalRois}).`
          : roiDelta === 0
          ? `Số vùng đặc trưng ổn định (${latest.totalRois} vùng) qua 2 lần quét gần nhất.`
          : `Phát hiện thêm ${roiDelta} vùng đặc trưng (${previous.totalRois} → ${latest.totalRois}); hãy duy trì đều đặn quy trình buổi tối.`
    };
  }
}

export const routineEngine = new RoutineEngine();

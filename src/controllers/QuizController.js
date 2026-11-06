import { SkinProfile } from '../models/SkinProfile.js';
import { QUIZ_QUESTIONS } from '../config/content.js';
import { C } from '../config/catalog.js';
import { IMG } from '../config/images.js';
import { imageQualityGate, renderSampleSkinCanvas } from '../ai/ImageQualityGate.js';
import { yoloV8nSkinAnalyzer } from '../ai/YoloV8nSkinAnalyzer.js';
import { analyticsService } from '../services/AnalyticsService.js';
import { i18nService } from '../services/I18nService.js';
import { shopController } from './ShopController.js';
import { SkinReportView } from '../views/SkinReportView.js';
import { renderImage } from '../views/ProductCard.js';
import { toast } from '../views/Toast.js';
import { $, $$ } from '../utils/dom.js';

/**
 * YOLOv8n AI Skin Scan and Quiz Controller
 * Orchestrates client-side Image Quality Gate, YOLOv8n multi-class skin feature detection,
 * step-by-step inference telemetry, and personalized skincare routine generation.
 */
export class QuizController {
  constructor() {
    this.profile = new SkinProfile();
    this.questions = QUIZ_QUESTIONS;
    this.scanTimeout = null;
    this.currentImageBuffer = null;
  }

  /**
   * Switch visible state panel within #scan-view
   * @param {string} stateId
   */
  switchState(stateId) {
    $$('#scan-view .state').forEach((s) => {
      s.hidden = s.id !== stateId;
    });
    if (stateId === 's-capture') {
      this.renderCaptureLabUI();
      if (!this.currentImageBuffer) {
        this.loadSamplePreset(this.profile.selectedPreset || 'balanced_daylight');
      } else {
        this.renderQualityTelemetry();
      }
    }
  }

  /**
   * Render bilingual Quality Gate preset selector and live telemetry
   */
  renderCaptureLabUI() {
    const labEl = $('#yolo-capture-lab');
    if (!labEl) return;
    const isVi = i18nService.lang === 'vi';
    const preset = this.profile.selectedPreset || 'balanced_daylight';

    const presets = [
      {
        id: 'balanced_daylight',
        label: isVi ? 'Mẫu chuẩn ánh sáng tự nhiên (Đạt)' : 'Clear Daylight Sample (Pass)'
      },
      {
        id: 'post_blemish_marks',
        label: isVi ? 'Mẫu da dầu & thâm sau mụn (Đạt)' : 'Blemish & Dark Spot Sample (Pass)'
      },
      {
        id: 'low_light_reject',
        label: isVi ? 'Mẫu thiếu sáng (Kiểm thử từ chối)' : 'Low-Light Sample (Reject Gate)'
      },
      {
        id: 'motion_blur_reject',
        label: isVi ? 'Mẫu rung nhòe (Kiểm thử từ chối)' : 'Motion-Blur Sample (Reject Gate)'
      }
    ];

    labEl.innerHTML = `
      <div class="yolo-lab-header">
        <span class="chip">${
          isVi
            ? 'Cổng kiểm định chất lượng ảnh YOLOv8n'
            : 'YOLOv8n Pre-Inference Image Quality Gate'
        }</span>
        <p class="small" style="margin-top:6px">
          ${
            isVi
              ? 'Kiểm tra độ nét (Laplacian Variance), độ sáng phơi sáng và tỷ lệ vùng da (YCbCr) trước khi chạy mô hình YOLOv8n.'
              : 'Checks sharpness (Laplacian variance), luminance exposure, and YCbCr facial framing before executing YOLOv8n inference.'
          }
        </p>
      </div>
      <div class="yolo-preset-row" role="group" aria-label="${
        isVi ? 'Chọn ảnh mẫu kiểm thử' : 'Select test sample preset'
      }">
        ${presets
          .map(
            (p) =>
              `<button type="button" class="yolo-preset-btn${
                preset === p.id ? ' active' : ''
              }" data-scan-preset="${p.id}" aria-pressed="${preset === p.id}">${p.label}</button>`
          )
          .join('')}
      </div>
      <div id="yolo-telemetry-panel" class="yolo-telemetry-panel" aria-live="polite"></div>
    `;

    this.renderQualityTelemetry();
  }

  /**
   * Load one of the 4 synthetic dermatological test samples into canvas & evaluate quality gate
   * @param {string} presetId
   */
  loadSamplePreset(presetId) {
    this.profile.selectedPreset = presetId;
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 240;
    const imgData = renderSampleSkinCanvas(canvas, presetId);
    this.currentImageBuffer = {
      data: imgData.data,
      width: canvas.width,
      height: canvas.height
    };
    this.profile.qualityReport = imageQualityGate.evaluateBuffer(this.currentImageBuffer);

    const dataUrl = canvas.toDataURL('image/png');
    const lp = $('#lp');
    const lph = $('#lph');
    if (lp) {
      lp.src = dataUrl;
      lp.hidden = false;
    }
    if (lph) {
      lph.hidden = true;
    }

    $$('[data-scan-preset]').forEach((btn) => {
      const isSelected = btn.dataset.scanPreset === presetId;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-pressed', isSelected);
    });

    this.renderQualityTelemetry();
  }

  /**
   * Render live Quality Gate metrics and pass/reject notice
   */
  renderQualityTelemetry() {
    const panel = $('#yolo-telemetry-panel');
    if (!panel || !this.profile.qualityReport) return;

    const isVi = i18nService.lang === 'vi';
    const q = this.profile.qualityReport;
    const m = q.metrics;

    panel.innerHTML = `
      <div class="yolo-metrics-grid">
        <div class="yolo-metric-item">
          <span>${isVi ? 'Độ nét (Laplacian)' : 'Sharpness (Laplacian)'}</span>
          <strong>${m.sharpness}/100</strong>
        </div>
        <div class="yolo-metric-item">
          <span>${isVi ? 'Độ sáng (Luminance)' : 'Brightness (Luma)'}</span>
          <strong>${m.brightness} / 255</strong>
        </div>
        <div class="yolo-metric-item">
          <span>${isVi ? 'Độ tương phản (RMS)' : 'Contrast (RMS)'}</span>
          <strong>${m.contrast}</strong>
        </div>
        <div class="yolo-metric-item">
          <span>${isVi ? 'Tỷ lệ vùng da' : 'Skin Coverage'}</span>
          <strong>${m.skinCoverage}%</strong>
        </div>
      </div>
      ${
        q.passed
          ? `<div class="yolo-gate-pass">
              <b>✓ ${
                isVi
                  ? 'Đạt chuẩn đầu vào YOLOv8n (Điểm chất lượng: ' + q.overallScore + '/100)'
                  : 'YOLOv8n Quality Gate Passed (Quality Score: ' + q.overallScore + '/100)'
              }</b>
              <span>${
                isVi
                  ? 'Ảnh đủ độ nét và ánh sáng cân bằng để trích xuất 5 nhóm đặc trưng bề mặt da.'
                  : 'Image meets sharpness and illumination thresholds for calibrated 5-class skin feature detection.'
              }</span>
            </div>`
          : `<div class="yolo-gate-reject" role="alert">
              <b>✕ ${
                isVi
                  ? 'Cổng chất lượng từ chối ảnh (Điểm: ' + q.overallScore + '/100)'
                  : 'Image Rejected by Quality Gate (Score: ' + q.overallScore + '/100)'
              }</b>
              <ul>
                ${q.issues.map((issue) => `<li>${issue}</li>`).join('')}
              </ul>
              <div class="row" style="margin-top:10px">
                <button type="button" class="pill" data-scan-preset="balanced_daylight">
                  ${isVi ? 'Dùng mẫu chuẩn đủ sáng' : 'Switch to Clear Daylight Sample'}
                </button>
              </div>
            </div>`
      }
    `;
  }

  /**
   * Render current quiz question
   */
  renderQuestion() {
    const q = this.questions[this.profile.q];
    if (!q) return;

    const qb = $('#qb');
    if (!qb) return;

    qb.innerHTML = `<p>Question ${this.profile.q + 1} of 4</p><div class="bar"><i style="width:${
      (this.profile.q + 1) * 25
    }%"></i></div><h2>${q[1]}</h2><div class="question-options">${q[2]
      .map((o) => `<button type="button" data-a="${q[0]}|${o[0]}">${o[1]}</button>`)
      .join('')}</div>${
      this.profile.q ? '<button type="button" class="pill outline" data-qback>Back</button>' : ''
    }`;
  }

  /**
   * Render morning / evening routine steps
   */
  renderRoutineSteps() {
    const rsteps = $('#rsteps');
    if (!rsteps) return;

    const stepsList = this.profile.getRoutineSteps(this.profile.routineTime);
    rsteps.innerHTML = stepsList
      .map(
        (s) =>
          `<div class="rstep">${
            C[s[0]]
              ? renderImage(C[s[0]].k, C[s[0]].n)
              : '<div class="avatar" aria-hidden="true" style="width:84px;height:84px;border-radius:12px;font-size:30px;margin:0">☀</div>'
          }<div><b>${s[1]}</b><p style="margin:4px 0 0;font-size:15px">${s[2]}</p></div></div>`
      )
      .join('');

    $$('[data-rt]').forEach((b) => {
      const active = b.dataset.rt === this.profile.routineTime;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active);
    });
  }

  /**
   * Ensure YOLOv8n analysis has been computed (even if user skipped photo and went straight to quiz)
   */
  ensureYoloReport() {
    if (!this.currentImageBuffer || !this.profile.qualityReport?.passed) {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const imgData = renderSampleSkinCanvas(canvas, 'balanced_daylight');
      this.currentImageBuffer = {
        data: imgData.data,
        width: 240,
        height: 240
      };
    }
    const analysis = yoloV8nSkinAnalyzer.analyzeImageBuffer(
      this.currentImageBuffer,
      this.profile.answers
    );
    if (analysis.ok) {
      this.profile.setYoloAnalysis(analysis, analysis.qualityReport);
    }
  }

  /**
   * Render the final Skin Report view
   */
  renderResult() {
    if (!this.profile.yoloReport) {
      this.ensureYoloReport();
    }
    this.profile.evaluateRecommendation();
    analyticsService.track('scan_complete');

    const resEl = $('#s-res');
    if (resEl) {
      resEl.innerHTML = SkinReportView.render(
        this.profile,
        i18nService.lang,
        (id) => shopController.isWishlisted(id)
      );
    }

    this.profile.routineTime = 'am';
    this.renderRoutineSteps();
    this.switchState('s-res');
  }

  handleAnswer(key, value) {
    this.profile.setAnswer(key, value);
    if (this.profile.q < 3) {
      this.profile.q++;
      this.renderQuestion();
    } else {
      this.renderResult();
    }
  }

  handleBack() {
    if (this.profile.q > 0) {
      this.profile.q--;
      this.renderQuestion();
    }
  }

  setRoutineTime(time) {
    this.profile.routineTime = time;
    this.renderRoutineSteps();
  }

  resetConsent() {
    this.profile.q = 0;
    this.profile.answers = {};
    this.profile.photoUrl = null;
    this.profile.selectedPreset = 'balanced_daylight';
    const cc = $('#cc');
    if (cc) cc.checked = false;
    this.switchState('s-consent');
  }

  deleteResult() {
    this.profile.reset();
    this.currentImageBuffer = null;
    const lp = $('#lp');
    const lph = $('#lph');
    const sf = $('#sf');
    const cc = $('#cc');

    if (lp) lp.hidden = true;
    if (lph) lph.hidden = false;
    if (sf) sf.value = '';
    if (cc) cc.checked = false;

    this.switchState('s-consent');
    toast.show('Your result and photo were deleted.');
  }

  /**
   * Execute YOLOv8n pipeline with quality gate validation and step-by-step progress display
   */
  startSimulation() {
    if (!this.currentImageBuffer) {
      this.loadSamplePreset(this.profile.selectedPreset || 'balanced_daylight');
    }

    const quality = imageQualityGate.evaluateBuffer(this.currentImageBuffer);
    this.profile.qualityReport = quality;

    if (!quality.passed) {
      this.renderQualityTelemetry();
      const isVi = i18nService.lang === 'vi';
      toast.show(
        isVi
          ? 'Ảnh chưa đạt chuẩn độ nét/ánh sáng. Vui lòng chọn ảnh rõ hơn hoặc dùng mẫu chuẩn.'
          : 'Image rejected by Quality Gate. Please select a clearer photo or use the Daylight Sample.'
      );
      return;
    }

    const analysis = yoloV8nSkinAnalyzer.analyzeImageBuffer(
      this.currentImageBuffer,
      this.profile.answers
    );
    this.profile.setYoloAnalysis(analysis, quality);

    const wp = $('#wp');
    const lp = $('#lp');
    if (wp) {
      if (this.profile.photoUrl) {
        wp.src = this.profile.photoUrl;
      } else if (lp && lp.src && !lp.hidden) {
        wp.src = lp.src;
      } else {
        wp.src = IMG['botanical'] || '';
      }
    }

    this.renderWorkOverlayBoxes(analysis.detections || []);
    this.switchState('s-work');

    clearTimeout(this.scanTimeout);
    this.scanTimeout = setTimeout(() => {
      this.profile.q = 0;
      this.profile.answers = {};
      this.renderQuestion();
      this.switchState('s-q');
    }, 2200);
  }

  /**
   * Position bounding boxes on #s-work preview corresponding to YOLOv8n detections
   * @param {Array} detections
   */
  renderWorkOverlayBoxes(detections) {
    const boxes = $$('#s-work .bx');
    detections.slice(0, boxes.length).forEach((det, idx) => {
      const bx = boxes[idx];
      if (!bx) return;
      const [nx, ny, nw, nh] = det.bboxNormalized;
      bx.style.left = `${Math.round(nx * 100)}%`;
      bx.style.top = `${Math.round(ny * 100)}%`;
      bx.style.width = `${Math.max(36, Math.round(nw * 240))}px`;
      bx.style.height = `${Math.max(36, Math.round(nh * 240))}px`;
      if (det.color) {
        bx.style.borderColor = det.color;
      }
    });
  }

  /**
   * Handle user file upload and run pre-inference ImageQualityGate
   * @param {File} file
   */
  handlePhotoChange(file) {
    if (this.profile.photoUrl) {
      URL.revokeObjectURL(this.profile.photoUrl);
    }
    if (!file || !file.type.startsWith('image/')) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.show('Please choose an image smaller than 8 MB.');
      return;
    }

    this.profile.photoUrl = URL.createObjectURL(file);
    this.profile.selectedPreset = 'custom_upload';
    const lp = $('#lp');
    const lph = $('#lph');
    if (lp) {
      lp.src = this.profile.photoUrl;
      lp.hidden = false;
    }
    if (lph) lph.hidden = true;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = 240;
      const h = 240;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      this.currentImageBuffer = { data: imageData.data, width: w, height: h };
      this.profile.qualityReport = imageQualityGate.evaluateBuffer(this.currentImageBuffer);
      this.renderQualityTelemetry();
    };
    img.src = this.profile.photoUrl;
  }
}

export const quizController = new QuizController();

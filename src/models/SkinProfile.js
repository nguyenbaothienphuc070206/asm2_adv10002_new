import { C } from '../config/catalog.js';
import { ROUTINE_INSTRUCTIONS } from '../config/content.js';

/**
 * Skin Profile and Routine Calculation Model
 * Integrates Quiz Answers with YOLOv8n Computer Vision Skin Feature Detections.
 */
export class SkinProfile {
  constructor() {
    this.q = 0;
    this.answers = {};
    this.photoUrl = null;
    this.selectedPreset = 'balanced_daylight';
    this.qualityReport = null;
    this.yoloReport = null;
    this.baseIds = [];
    this.items = [];
    this.severity = 'Mild';
    this.routineTime = 'am';
  }

  /**
   * Store a single quiz answer
   * @param {string} key
   * @param {string} val
   */
  setAnswer(key, val) {
    this.answers[key] = val;
  }

  /**
   * Store YOLOv8n analysis report and quality gate telemetry
   * @param {object|null} yoloReport
   * @param {object|null} qualityReport
   */
  setYoloAnalysis(yoloReport, qualityReport = null) {
    this.yoloReport = yoloReport;
    if (qualityReport) {
      this.qualityReport = qualityReport;
    }
  }

  /**
   * Reset profile state and revoke any temporary blob URLs
   */
  reset() {
    this.q = 0;
    this.answers = {};
    if (this.photoUrl) {
      URL.revokeObjectURL(this.photoUrl);
      this.photoUrl = null;
    }
    this.selectedPreset = 'balanced_daylight';
    this.qualityReport = null;
    this.yoloReport = null;
    this.baseIds = [];
    this.items = [];
    this.severity = 'Mild';
    this.routineTime = 'am';
  }

  /**
   * Evaluate skincare severity and recommended product IDs.
   * Preserves deterministic quiz rules while enriching with YOLOv8n detections when present.
   * @returns {{sev: string, ids: string[], items: string[]}}
   */
  evaluateRecommendation() {
    const a = this.answers;
    let sev = 'Mild';
    if (a.concern === 'breakouts' && a.feel === 'oily') sev = 'Moderate';
    if (a.concern === 'breakouts' && a.feel === 'tight') sev = 'Needs care';

    let ids = ['wash', 'toner'];
    if (sev !== 'Needs care') {
      if (['breakouts', 'marks', 'dull'].includes(a.concern) || a.feel === 'oily') {
        ids.push('cream');
      }
      if (a.concern === 'dryness' || a.feel === 'tight') {
        ids.push('lip');
      }
    }

    if (a.time === 'quick') {
      ids = ids.includes('cream') ? ['wash', 'cream'] : ['wash', 'toner'];
    }

    this.severity = sev;
    this.baseIds = ids;

    const has3 = ['wash', 'toner', 'cream'].every((i) => ids.includes(i));
    const has2 = ids.includes('wash') && ids.includes('cream');
    this.items = has3
      ? ['routine', ...ids.filter((i) => i === 'lip')]
      : has2
      ? ['duo', ...ids.filter((i) => i !== 'wash' && i !== 'cream')]
      : ids;

    return { sev, ids, items: this.items };
  }

  /**
   * Return 4-zone counts [Forehead, Cheeks, Nose, Chin]
   * @returns {number[]}
   */
  getZoneCounts() {
    if (this.yoloReport && this.yoloReport.zones) {
      const z = this.yoloReport.zones;
      return [
        z.forehead ? z.forehead.count : 1,
        z.cheeks ? z.cheeks.count : 2,
        z.nose ? z.nose.count : 2,
        z.chin ? z.chin.count : 0
      ];
    }
    const fallbackMap = {
      Mild: [1, 2, 2, 0],
      Moderate: [3, 5, 4, 2],
      'Needs care': [6, 9, 5, 4]
    };
    return fallbackMap[this.severity] || [1, 2, 2, 0];
  }

  /**
   * Build step-by-step morning or evening routine instructions
   * @param {string} time 'am' | 'pm'
   * @returns {Array<[string, string, string]>}
   */
  getRoutineSteps(time = this.routineTime) {
    const ids = this.baseIds;
    const out = [];
    const RS = ROUTINE_INSTRUCTIONS;

    if (time === 'am') {
      if (this.answers.feel === 'tight') {
        out.push([
          'rinse',
          'Rinse with water',
          'Splash lukewarm water over your face. Skip the face wash if your skin feels tight.'
        ]);
      } else if (ids.includes('wash')) {
        out.push(['wash', C.wash.n, RS.wash.am]);
      }

      if (ids.includes('toner')) {
        out.push(['toner', C.toner.n, RS.toner.am]);
      }

      out.push([
        'sun',
        'Sun protection (your choice)',
        'Finish with a sunscreen you like. It is the most important step of the morning.'
      ]);

      if (ids.includes('lip')) {
        out.push(['lip', C.lip.n, RS.lip.am]);
      }
    } else {
      if (ids.includes('wash')) out.push(['wash', C.wash.n, RS.wash.pm]);
      if (ids.includes('toner')) out.push(['toner', C.toner.n, RS.toner.pm]);
      if (ids.includes('cream')) out.push(['cream', C.cream.n, RS.cream.pm]);
      if (ids.includes('lip')) out.push(['lip', C.lip.n, RS.lip.pm]);
    }

    return out;
  }
}

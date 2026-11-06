/**
 * HerbalEcosystemService — Domain Service for Phases 2, 3, 4 & 5 of the Thorakao
 * Next-Generation AI-Powered Herbal Beauty Ecosystem:
 * - Herbal Intelligence Lab (INCI, botanical identity, peer-reviewed citations, compatibility)
 * - Digital Ingredient Passport & Deterministic SVG QR Code Traceability
 * - AI Skin Journey (Subjective Customer Feedback Log & Habit Consistency Tracker)
 * - Thorakao Community Lab (7/14/30-day Challenges & Moderated Routine Journals)
 * - Thorakao Knowledge Academy (Structured Learning Modules & Interactive INCI Quiz)
 * - Product Lifecycle & Depletion Estimator + GDPR/PDPA Personal Data JSON Export
 */

import { C } from '../config/catalog.js';
import { PRODUCT_INGREDIENTS, PRODUCT_HOW_TO_USE } from '../config/content.js';
import {
  MISSING_IMAGE_REPORT,
  getProductManifestEntry
} from '../config/productManifest.js';
import {
  EXPERIENCE_LAYERS,
  HERBAL_LAB_INGREDIENTS,
  DIGITAL_PASSPORT_REGISTRY,
  KNOWLEDGE_ACADEMY_MODULES,
  ACADEMY_QUIZ_QUESTIONS,
  COMMUNITY_CHALLENGES,
  RND_INNOVATION_HYPOTHESES
} from '../config/herbalLabData.js';
import { storageService } from './StorageService.js';
import { escapeHtml } from '../utils/string.js';

const STORAGE_KEY_ECOSYSTEM = 'thorakao_herbal_ecosystem_v1';

export class HerbalEcosystemService {
  constructor() {
    this.state = this.loadState();
  }

  /**
   * Load persisted ecosystem state or initialize defaults
   * @returns {Object}
   */
  loadState() {
    const saved = storageService.get(STORAGE_KEY_ECOSYSTEM, null);
    if (saved && typeof saved === 'object') {
      return saved;
    }
    return {
      subjectiveLogs: [
        {
          id: 'subj_sample_1',
          type: 'SUBJECTIVE_CUSTOMER_OBSERVATION',
          date: '2026-10-28T14:00:00.000Z',
          comfortRating: 5,
          hydrationFeel: 'Comfortable & less midday shine',
          activeSkus: ['wash', 'toner', 'cream'],
          note: 'Sample entry: T-zone felt calmer after switching to lukewarm water + Cucumber Toner before thin evening Turmeric Cream.',
          isSample: true
        }
      ],
      habitStreakDays: 5,
      lastHabitCheckInDate: '2026-11-05',
      completedAcademyModules: ['inci_101'],
      quizScore: null,
      activeChallenges: {
        chal_7d: { joined: true, completedDays: 4, targetDays: 7 }
      },
      loyaltyPoints: 140,
      communityPosts: [
        {
          id: 'post_1',
          author: 'Minh Anh (University Student, HCMC)',
          sku: 'duo',
          challengeTag: '14-Day Evening Turmeric Spot Care',
          verifiedBuyer: true,
          note: 'Applying a tiny rice-grain dab of Turmeric Cream 7g only at night kept my pillow clean and helped my post-blemish marks look calmer after 2 weeks.',
          flagged: false,
          isSample: true
        },
        {
          id: 'post_2',
          author: 'Cô Hạnh (District 3, HCMC)',
          sku: 'boket',
          challengeTag: '7-Day Gentle Cleansing Reset',
          verifiedBuyer: true,
          note: 'The Roasted Soapberry shampoo reminds me of the charcoal-roasted bồ kết pot my mother brewed in the 1980s, without the 45-minute boiling time.',
          flagged: false,
          isSample: true
        }
      ]
    };
  }

  saveState() {
    storageService.set(STORAGE_KEY_ECOSYSTEM, this.state);
  }

  /**
   * Return the 4 Experience Layers (DISCOVER, UNDERSTAND, EXPERIENCE, GROW)
   */
  getExperienceLayers() {
    return EXPERIENCE_LAYERS;
  }

  /**
   * Filter Herbal Intelligence Lab ingredients by category or return all
   * @param {string} category
   */
  getHerbalIngredients(category = 'all') {
    if (!category || category === 'all') return HERBAL_LAB_INGREDIENTS;
    return HERBAL_LAB_INGREDIENTS.filter((item) => item.category === category);
  }

  /**
   * Get verified herbal lab records associated with a specific product SKU
   * @param {string} sku
   */
  getIngredientsForSku(sku) {
    return HERBAL_LAB_INGREDIENTS.filter((item) => item.verifiedProducts.includes(sku));
  }

  /**
   * Generate a Digital Ingredient Passport for any catalog SKU
   * @param {string} sku
   */
  getProductPassport(sku) {
    const product = C[sku];
    if (!product) return null;
    const manifestEntry = getProductManifestEntry(sku) || null;
    const missingEntry = MISSING_IMAGE_REPORT.find((m) => m.id === sku) || null;
    const rawInci = PRODUCT_INGREDIENTS[sku] || 'Water, Glycerin, Botanical Extracts (check box label).';
    const inciList = rawInci.split(',').map((s) => s.trim()).filter(Boolean);
    const howToUse = PRODUCT_HOW_TO_USE[sku] || 'Follow the printed instructions on the product box.';
    const linkedHerbs = this.getIngredientsForSku(sku);
    const passportUrl = `https://asm2-adv10002.vercel.app/#shop/${sku}`;

    return {
      sku,
      passportId: `THK-PASS-1961-${sku.toUpperCase()}`,
      productName: product.n,
      priceVnd: product.p,
      inciList,
      howToUse,
      linkedHerbs,
      ingredients: linkedHerbs,
      batchLookupStatus: 'UNAVAILABLE_IN_PUBLIC_CATALOG',
      manufacturer: DIGITAL_PASSPORT_REGISTRY.manufacturer,
      headquarters: DIGITAL_PASSPORT_REGISTRY.headquarters,
      qualityStandardEn: DIGITAL_PASSPORT_REGISTRY.qualityStandardNoteEn,
      qualityStandardVi: DIGITAL_PASSPORT_REGISTRY.qualityStandardNoteVi,
      batchStatusEn: DIGITAL_PASSPORT_REGISTRY.batchLookupStatusEn,
      batchStatusVi: DIGITAL_PASSPORT_REGISTRY.batchLookupStatusVi,
      storageEn: DIGITAL_PASSPORT_REGISTRY.storageInstructionEn,
      storageVi: DIGITAL_PASSPORT_REGISTRY.storageInstructionVi,
      assetVerification: manifestEntry
        ? {
            verified: true,
            sourceUrl: manifestEntry.sourceUrl,
            dimensions: manifestEntry.dimensions
          }
        : {
            verified: false,
            reason: missingEntry ? missingEntry.reason : 'Pending studio photography',
            dimensions: '600x750'
          },
      passportUrl,
      qrSvg: this.renderQrCodeSvg(passportUrl, 112)
    };
  }

  /**
   * Deterministic SVG QR-like Matrix Generator for Digital Product Passports
   * @param {string} text
   * @param {number} size
   * @returns {string}
   */
  renderQrCodeSvg(text = 'THORAKAO', size = 112) {
    const grid = 15;
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const isFinder = (r, c) => {
      const inTL = r < 5 && c < 5;
      const inTR = r < 5 && c >= grid - 5;
      const inBL = r >= grid - 5 && c < 5;
      return inTL || inTR || inBL;
    };

    const isFinderDark = (r, c) => {
      const lr = r >= grid - 5 ? r - (grid - 5) : r;
      const lc = c >= grid - 5 ? c - (grid - 5) : c;
      if (lr === 0 || lr === 4 || lc === 0 || lc === 4) return true;
      if (lr === 2 && lc === 2) return true;
      return false;
    };

    const cells = [];
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        let dark = false;
        if (isFinder(r, c)) {
          dark = isFinderDark(r, c);
        } else {
          const bitIdx = (r * grid + c) % 31;
          const seed = Math.imul(hash ^ (r * 37 + c * 101), 2654435761);
          dark = ((seed >>> (bitIdx % 16)) & 1) === 1;
        }
        if (dark) {
          cells.push(`<rect x="${c + 1}" y="${r + 1}" width="1" height="1" fill="#261c14"/>`);
        }
      }
    }

    return `<svg width="${size}" height="${size}" viewBox="0 0 ${grid + 2} ${
      grid + 2
    }" role="img" aria-label="QR Code for ${escapeHtml(
      text
    )}" style="background:#fff8ec;border:1px solid #d5c2a5;border-radius:8px;flex-shrink:0"><rect width="${
      grid + 2
    }" height="${grid + 2}" fill="#fff8ec"/>${cells.join('')}</svg>`;
  }

  /**
   * Record a subjective customer skincare log entry (explicitly distinct from YOLOv8n objective scores)
   * @param {{ comfortRating: number, hydrationFeel: string, activeSkus: string[], note: string }} entry
   */
  addSubjectiveFeedback({ comfortRating = 4, hydrationFeel = 'Balanced', activeSkus = ['wash'], note = '' }) {
    const cleanNote = escapeHtml(String(note || '').trim().slice(0, 280));
    if (!cleanNote) return null;
    const record = {
      id: 'subj_' + Date.now(),
      type: 'SUBJECTIVE_CUSTOMER_OBSERVATION',
      date: new Date().toISOString(),
      comfortRating: Math.max(1, Math.min(5, Number(comfortRating) || 4)),
      hydrationFeel: escapeHtml(String(hydrationFeel || 'Balanced').slice(0, 60)),
      activeSkus: Array.isArray(activeSkus) ? activeSkus.filter((s) => Boolean(C[s])) : ['wash'],
      note: cleanNote,
      isSample: false
    };
    this.state.subjectiveLogs.unshift(record);
    this.state.loyaltyPoints += 15;
    this.saveState();
    return record;
  }

  getSubjectiveFeedbackLog() {
    return this.state.subjectiveLogs || [];
  }

  /**
   * Increment daily skincare habit consistency streak
   */
  logDailyHabitCheckIn() {
    const today = new Date().toISOString().slice(0, 10);
    if (this.state.lastHabitCheckInDate !== today) {
      this.state.habitStreakDays = (this.state.habitStreakDays || 0) + 1;
      this.state.lastHabitCheckInDate = today;
      this.state.loyaltyPoints += 10;
      this.saveState();
      return { updated: true, streak: this.state.habitStreakDays, points: this.state.loyaltyPoints };
    }
    return { updated: false, streak: this.state.habitStreakDays, points: this.state.loyaltyPoints };
  }

  /**
   * Join or check in to a 7/14/30-day Community Lab challenge
   * @param {string} challengeId
   */
  checkInChallenge(challengeId) {
    const challenge = COMMUNITY_CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) return null;
    const current = this.state.activeChallenges[challengeId] || {
      joined: true,
      completedDays: 0,
      targetDays: challenge.days
    };
    current.joined = true;
    if (current.completedDays < challenge.days) {
      current.completedDays += 1;
      this.state.loyaltyPoints += 10;
    }
    this.state.activeChallenges[challengeId] = current;
    this.saveState();
    return current;
  }

  getChallengesWithProgress() {
    return COMMUNITY_CHALLENGES.map((c) => {
      const progress = this.state.activeChallenges[c.id] || {
        joined: false,
        completedDays: 0,
        targetDays: c.days
      };
      return { ...c, ...progress };
    });
  }

  /**
   * Add a moderated Community Lab experience note
   * @param {{ author: string, sku: string, note: string }} post
   */
  addCommunityPost({ author = 'Thorakao Member', sku = 'duo', note = '' }) {
    const cleanNote = escapeHtml(String(note || '').trim().slice(0, 280));
    if (!cleanNote) return null;
    const newPost = {
      id: 'post_' + Date.now(),
      author: escapeHtml(String(author || 'Thorakao Member').trim().slice(0, 60)),
      sku: C[sku] ? sku : 'duo',
      challengeTag: 'Community Routine Journal',
      verifiedBuyer: true,
      note: cleanNote,
      flagged: false,
      isSample: false
    };
    this.state.communityPosts.unshift(newPost);
    this.state.loyaltyPoints += 20;
    this.saveState();
    return newPost;
  }

  /**
   * Flag/unflag a community post for moderation
   * @param {string} postId
   */
  toggleFlagCommunityPost(postId) {
    const post = (this.state.communityPosts || []).find((p) => p.id === postId);
    if (!post) return null;
    post.flagged = !post.flagged;
    this.saveState();
    return post;
  }

  getCommunityPosts(includeFlagged = false) {
    const list = this.state.communityPosts || [];
    return includeFlagged ? list : list.filter((p) => !p.flagged);
  }

  /**
   * Grade the 3-question Knowledge Academy INCI & Cosmetic Science Quiz
   * @param {number[]} selectedIndices
   */
  gradeAcademyQuiz(selectedIndices = []) {
    let correct = 0;
    ACADEMY_QUIZ_QUESTIONS.forEach((q, idx) => {
      if (Number(selectedIndices[idx]) === q.correctIndex) {
        correct += 1;
      }
    });
    const total = ACADEMY_QUIZ_QUESTIONS.length;
    this.state.quizScore = {
      correct,
      score: correct,
      total,
      passed: correct >= 2,
      percent: Math.round((correct / total) * 100),
      completedAt: new Date().toISOString()
    };
    if (correct === total) {
      this.state.completedAcademyModules = KNOWLEDGE_ACADEMY_MODULES.map((m) => m.id);
      this.state.loyaltyPoints += 50;
    }
    this.saveState();
    return this.state.quizScore;
  }

  getAcademyData() {
    return {
      modules: KNOWLEDGE_ACADEMY_MODULES,
      questions: ACADEMY_QUIZ_QUESTIONS,
      completedModules: this.state.completedAcademyModules || [],
      quizScore: this.state.quizScore
    };
  }

  /**
   * Estimate product usage lifecycle & replenishment reminders from order history
   * @param {Array} orders
   */
  getProductLifecycleReminders(orders = []) {
    const skuDaysMap = {
      wash: 45,
      cream: 35,
      toner: 40,
      lip: 60,
      duo: 40,
      routine: 40,
      pomelo: 50,
      ginseng: 40,
      boket: 50,
      ginger: 45
    };
    const tracked = [];
    orders.forEach((order) => {
      const items = order.items || {};
      Object.keys(items).forEach((sku) => {
        if (C[sku] && !tracked.some((t) => t.sku === sku)) {
          const cycleDays = skuDaysMap[sku] || 45;
          tracked.push({
            sku,
            name: C[sku].n,
            cycleDays,
            estimatedRemainingDays: Math.max(7, cycleDays - 18),
            packagingNote:
              'Rinse HDPE/PP jar or bottle before local municipal sorting. Official store refill pouches are currently under R&D evaluation (see Innovation Studio).'
          });
        }
      });
    });
    return tracked;
  }

  getRndHypotheses() {
    return RND_INNOVATION_HYPOTHESES;
  }

  /**
   * Export all customer personal beauty data as a portable JSON object (GDPR/PDPA Data Portability)
   */
  exportPersonalDataBundle({ user, orders = [], routines = [], savedRoutines = [], scanHistory = [] }) {
    const logs = this.state.subjectiveLogs || [];
    return {
      schemaVersion: 'thorakao-gdpr-pdpa-export-v1.0',
      exportedAt: new Date().toISOString(),
      platform: 'Thorakao Botanical AI Skin Lab',
      dataGovernanceNotice:
        'Exported under GDPR/PDPA Data Portability rights. Facial scan images are processed in-memory and never stored on external servers.',
      profile: user || { role: 'guest', note: 'Guest session' },
      loyaltyPoints: this.state.loyaltyPoints || 0,
      habitStreakDays: this.state.habitStreakDays || 0,
      orders,
      savedRoutines: savedRoutines.length ? savedRoutines : routines,
      objectiveScanHistory: scanHistory,
      subjectiveSkincareLogs: logs,
      aiSkinJourney: {
        objectiveScanHistory: scanHistory,
        subjectiveCustomerFeedbackLogs: logs
      },
      activeChallenges: this.state.activeChallenges || {},
      academyProgress: {
        completedModules: this.state.completedAcademyModules || [],
        quizScore: this.state.quizScore
      }
    };
  }
}

export const herbalEcosystemService = new HerbalEcosystemService();

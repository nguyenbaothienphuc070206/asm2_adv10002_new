import { storageService } from './StorageService.js';

/**
 * Privacy-Conscious Analytics, Funnel Telemetry & Cookie Consent Service (Priority 9)
 */
export class AnalyticsService {
  constructor() {
    this.consent = storageService.get('ck', null);
    this.counts = storageService.get('thk_funnel_counts', {
      page_view: 1,
      product_view: 0,
      add_to_cart: 0,
      checkout_start: 0,
      purchase_complete: 0,
      scan_start: 0,
      scan_complete: 0,
      routine_saved: 0,
      newsletter_signup: 0
    });
  }

  setConsent(allowed) {
    this.consent = Boolean(allowed);
    storageService.set('ck', this.consent);
  }

  hasConsent() {
    return this.consent === true;
  }

  isConsentGivenOrDenied() {
    return this.consent !== null;
  }

  track(eventName) {
    this.counts[eventName] = (this.counts[eventName] || 0) + 1;
    storageService.set('thk_funnel_counts', this.counts);
    if (this.consent === true && typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, ts: Date.now() });
    }
  }

  getEventsSummary() {
    return { ...this.counts };
  }
}

export const analyticsService = new AnalyticsService();

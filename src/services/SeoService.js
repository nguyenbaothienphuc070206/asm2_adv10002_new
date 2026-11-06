import { C } from '../config/catalog.js';
import { PAGE_TITLES } from '../config/constants.js';

/**
 * Technical SEO, OpenGraph & Schema.org JSON-LD Service (Phase 7)
 * Dynamically synchronizes canonical URLs, OpenGraph/Twitter meta tags,
 * and Schema.org structured data across SPA route transitions.
 */
export class SeoService {
  constructor() {
    this.routeDescriptions = {
      home:
        'Thorakao Vietnamese botanical skincare since 1961. Explore authentic turmeric, pomelo, ginseng, soapberry, and ginger formulas plus our YOLOv8n AI Skin Scan.',
      shop:
        'Shop verified Thorakao Vietnamese skincare and haircare: Turmeric Face Wash, Turmeric Cream, Rose Water Toner, Pomelo Shampoo, Ginseng Cream, and Soapberry.',
      scan:
        'Run a 30-second on-device YOLOv8n AI Skin Scan with pre-inference image quality checks, 5-class calibrated skin feature detection, and a personalized routine.',
      story:
        'Explore The Herbal Garden of Vietnam in interactive 3D: 65 years of Lan Hảo – Thorakao heritage across Turmeric, Pomelo Blossom, Ginseng, Soapberry, and Ginger.',
      tips:
        'Practical Vietnamese skincare habits for humid weather, blemish-prone skin, dark marks, and simple student-friendly routines.',
      contact:
        'Find where to buy authentic Thorakao products across Ho Chi Minh City, Hanoi, Da Nang, Can Tho, pharmacies, and official online stores.'
    };
  }

  /**
   * Update document meta tags and canonical URL for the active route
   * @param {string} page
   */
  updateRouteMeta(page = 'home') {
    if (typeof document === 'undefined') return;

    const description = this.routeDescriptions[page] || this.routeDescriptions.home;
    const title =
      page === 'home'
        ? "THORAKAO · Grandma's Secret"
        : `${PAGE_TITLES[page] || 'Thorakao'} · THORAKAO`;

    const setMeta = (selector, attr, val) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, val);
    };

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);

    if (typeof window !== 'undefined' && window.location) {
      const canonicalUrl =
        window.location.origin +
        window.location.pathname +
        (page === 'home' ? '' : `#${page}`);
      setMeta('link[rel="canonical"]', 'href', canonicalUrl);
      setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    }
  }

  /**
   * Generate Schema.org @graph JSON-LD structured data for Organization, WebApplication, and Product catalog
   * @returns {object}
   */
  buildStructuredDataGraph() {
    const productsList = Object.values(C).map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: p.n,
        description: p.b,
        brand: {
          '@type': 'Brand',
          name: 'Thorakao'
        },
        offers: {
          '@type': 'Offer',
          price: String(p.p),
          priceCurrency: 'VND',
          availability: 'https://schema.org/InStock'
        }
      }
    }));

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: 'THORAKAO · Lan Hảo Cosmetics',
          foundingDate: '1961',
          description:
            'Vietnamese botanical skincare and haircare crafted with natural local ingredients since 1961.'
        },
        {
          '@type': 'WebApplication',
          name: 'Thorakao Botanical AI Skin Lab',
          applicationCategory: 'HealthApplication',
          operatingSystem: 'All',
          description:
            'Interactive Vietnamese botanical skincare platform with YOLOv8n AI Skin Scan and 3D Herbal Garden exploration.'
        },
        {
          '@type': 'ItemList',
          name: 'Thorakao Botanical Skincare Collection',
          numberOfItems: productsList.length,
          itemListElement: productsList
        }
      ]
    };
  }

  /**
   * Inject Schema.org JSON-LD graph into #schema-ld script tag
   */
  injectStructuredData() {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('schema-ld');
    if (el) {
      el.textContent = JSON.stringify(this.buildStructuredDataGraph());
    }
  }
}

export const seoService = new SeoService();

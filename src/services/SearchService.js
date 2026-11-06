import { C } from '../config/catalog.js';
import { TIPS_ARTICLES } from '../config/content.js';
import { PAGE_ROUTES, PAGE_TITLES } from '../config/constants.js';
import { VI } from '../config/translations.js';
import { normalizeDiacritics } from '../utils/string.js';
import { M } from '../utils/formatters.js';

/**
 * Unified Search Service
 * Searches across products, articles, and pages with diacritic-insensitive matching.
 */
export class SearchService {
  constructor() {
    this.pages = PAGE_ROUTES.filter((x) => x !== 'home');
  }

  getIndex() {
    return [
      ...Object.values(C).map((p) => [
        'p',
        p.id,
        p.n,
        M(p.p),
        p.n + ' ' + (VI[p.n] || '') + ' ' + p.bf + ' ' + p.t
      ]),
      ...TIPS_ARTICLES.map((a) => [
        'a',
        a[0],
        a[3],
        'Article',
        a[3] + ' ' + (VI[a[3]] || '') + ' ' + a[1]
      ]),
      ...this.pages.map((x) => [
        'g',
        x,
        PAGE_TITLES[x],
        'Page',
        PAGE_TITLES[x] + ' ' + (VI[PAGE_TITLES[x]] || '')
      ])
    ];
  }

  search(rawQuery) {
    const raw = (rawQuery || '').trim();
    const q = normalizeDiacritics(raw);
    const items = this.getIndex();

    if (!q) {
      return { raw, results: items.slice(0, 6) };
    }

    const filtered = items
      .filter((item) => normalizeDiacritics(item[4]).includes(q))
      .slice(0, 7);

    return { raw, results: filtered };
  }
}

export const searchService = new SearchService();

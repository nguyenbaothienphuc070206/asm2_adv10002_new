import { PAGE_ROUTES, PAGE_TITLES, FILTER_TAGS } from '../config/constants.js';
import { analyticsService } from '../services/AnalyticsService.js';
import { i18nService } from '../services/I18nService.js';
import { seoService } from '../services/SeoService.js';
import { $, $$ } from '../utils/dom.js';

/**
 * Navigation and Routing Controller
 * Orchestrates Single Page Application hash routing, history, page views, and focus management.
 */
export class NavigationController {
  constructor(options = {}) {
    this.routes = PAGE_ROUTES;
    this.titles = PAGE_TITLES;
    this.filterTags = FILTER_TAGS;
    this.pendingCallback = null;
    this.isFirstLoad = true;

    this.onShopRoute = options.onShopRoute || (() => {});
    this.onScanRoute = options.onScanRoute || (() => {});
    this.onLeaveScan = options.onLeaveScan || (() => {});
    this.onStoryRoute = options.onStoryRoute || (() => {});
    this.onTipsRoute = options.onTipsRoute || (() => {});
    this.onContactRoute = options.onContactRoute || (() => {});
    this.onCloseBag = options.onCloseBag || (() => {});
  }

  isReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  go(page, section, filter, pop = false, callback = null) {
    const path =
      page +
      (page === 'shop' && filter
        ? '/' + filter
        : page === 'home' && section
        ? '/' + section
        : '');
    this.pendingCallback = callback || null;

    if (window.location.hash === '#' + path || (!window.location.hash && path === 'home')) {
      this.route();
    } else {
      window.location.hash = path;
    }
  }

  route() {
    const [p0, param] = (window.location.hash.slice(1) || 'home').split('/');
    const page = this.routes.includes(p0) ? p0 : 'home';

    const run = () => {
      $$('dialog[open]').forEach((d) => d.close());
      $$('.page-view').forEach((e) => (e.hidden = e.id !== page + '-view'));

      const ma = $('#ma');
      if (ma) ma.hidden = page !== 'home';

      this.onCloseBag();

      const nav = $('#nav');
      if (nav) nav.classList.remove('open');
      const menub = $('#menub');
      if (menub) menub.setAttribute('aria-expanded', 'false');

      if (page === 'shop') {
        const activeFilter = this.filterTags.includes(param) ? param : 'all';
        if (param && !this.filterTags.includes(param)) {
          history.replaceState(null, '', '#shop');
        }
        this.onShopRoute(activeFilter);
      }

      clearTimeout(this.scanTimeout);
      if (page === 'scan') {
        this.onScanRoute();
      }

      if (page === 'story') {
        this.onStoryRoute();
      }

      if (page === 'tips') {
        this.onTipsRoute(param);
      }

      if (page === 'contact') {
        this.onContactRoute();
      }

      $$('#nav button').forEach((btn) => {
        btn.setAttribute('aria-current', btn.dataset.go === page ? 'page' : 'false');
      });

      const titleEn =
        page === 'home' ? 'THORAKAO · ' + this.titles.home : this.titles[page] + ' · THORAKAO';
      i18nService.setTitle(titleEn);
      seoService.updateRouteMeta(page);

      const targetSection = page === 'home' && param && document.getElementById(param);
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (targetSection) {
        requestAnimationFrame(() =>
          targetSection.scrollIntoView({ behavior: this.isReducedMotion() ? 'auto' : 'smooth' })
        );
      }

      if (!this.isFirstLoad) {
        const live = $('#live');
        if (live) live.textContent = this.titles[page] + ' page';
        const h = $('#' + page + '-view h1');
        if (h && !targetSection) {
          h.tabIndex = -1;
          h.focus({ preventScroll: true });
        }
      }

      this.isFirstLoad = false;
      analyticsService.track('page_view');

      if (this.pendingCallback) {
        this.pendingCallback();
        this.pendingCallback = null;
      }
    };

    if (window.location.hash && p0 !== page) {
      history.replaceState(null, '', '#' + page);
    }

    if (document.startViewTransition && !this.isReducedMotion() && !this.isFirstLoad) {
      document.startViewTransition(run);
    } else {
      run();
    }
  }

  init() {
    window.addEventListener('hashchange', () => this.route());
  }
}

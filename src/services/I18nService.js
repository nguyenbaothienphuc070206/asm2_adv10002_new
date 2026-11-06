import { storageService } from './StorageService.js';
import { VI, PAT, setPatternTranslator } from '../config/translations.js';
import { formatVNDSeparators } from '../utils/formatters.js';
import { $$ } from '../utils/dom.js';

/**
 * Internationalization (I18n) Engine
 * Manages EN/VI translations, DOM mutation observation, and currency localized separators.
 */
export class I18nService {
  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    let initialLang =
      urlParams.get('lang') ||
      storageService.get('lang', null) ||
      ((navigator.language || 'en').toLowerCase().startsWith('vi') ? 'vi' : 'en');

    this.lang = initialLang === 'vi' ? 'vi' : 'en';
    this.missingStrings = new Set();
    this.originalTexts = new WeakMap();
    this.originalAttrs = new WeakMap();
    this.attrsToTranslate = ['alt', 'aria-label', 'placeholder', 'title', 'aria-valuetext'];
    this.currentEnglishTitle = "THORAKAO · Grandma's Secret";
    this.onToastCallback = null;
    this.onLanguageChangeCallback = null;

    // Connect pattern callback translator
    setPatternTranslator(this.translate.bind(this));

    const observerOpts = {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: this.attrsToTranslate
    };

    this.mutationObserver = new MutationObserver((mutations) => {
      if (this.lang !== 'vi') return;
      this.mutationObserver.disconnect();
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach((node) => this.walk(node));
        } else {
          this.translateNode(m.target);
        }
      }
      this.mutationObserver.observe(document.body, observerOpts);
    });

    this.observerOpts = observerOpts;
  }

  formatMoney(s) {
    return formatVNDSeparators(s, this.lang);
  }

  translate(s) {
    if (this.lang !== 'vi') return s;
    const k = (s || '').trim();
    if (!k) return s;

    let v = VI[k];
    if (v === undefined) {
      for (const [pattern, handler] of PAT) {
        const m = k.match(pattern);
        if (m) {
          v = handler(m);
          break;
        }
      }
    }

    if (v === undefined) {
      const rest = k
        .replace(/[\d.,]+\s*VND/g, '')
        .replace(/[^A-Za-z\u00C0-\u1EF9]/g, '');
      if (rest.length >= 2 && !/[\u00C0-\u1EF9]/.test(k)) {
        this.missingStrings.add(k);
      }
      return this.formatMoney(s);
    }

    return this.formatMoney(s.replace(k, v));
  }

  translateNode(node) {
    if (node.nodeType === 3) {
      const parent = node.parentNode;
      if (!parent || /^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(parent.nodeName)) return;
      if (parent.closest && parent.closest('[data-i18n-skip]')) return;
      const record = this.originalTexts.get(node);
      const original = record && node.nodeValue === record.t ? record.o : node.nodeValue;
      const translated = this.translate(original);
      this.originalTexts.set(node, { o: original, t: translated });
      if (node.nodeValue !== translated) {
        node.nodeValue = translated;
      }
    } else if (node.nodeType === 1) {
      if (node.closest && node.closest('[data-i18n-skip]')) return;
      for (const attr of this.attrsToTranslate) {
        if (!node.hasAttribute(attr)) continue;
        let map = this.originalAttrs.get(node);
        if (!map) {
          map = {};
          this.originalAttrs.set(node, map);
        }
        const current = node.getAttribute(attr);
        const record = map[attr];
        const original = record && current === record.t ? record.o : current;
        const translated = this.translate(original);
        map[attr] = { o: original, t: translated };
        if (current !== translated) {
          node.setAttribute(attr, translated);
        }
      }
    }
  }

  walk(node) {
    if (node.nodeType === 3) {
      this.translateNode(node);
      return;
    }
    if (node.nodeType !== 1) return;
    if (node.hasAttribute && node.hasAttribute('data-i18n-skip')) return;
    this.translateNode(node);
    node.childNodes.forEach((child) => this.walk(child));
  }

  updateTitle() {
    document.title = this.translate(this.currentEnglishTitle);
  }

  setTitle(titleEn) {
    this.currentEnglishTitle = titleEn;
    this.updateTitle();
  }

  setLanguage(l, silent = false) {
    this.lang = l;
    storageService.set('lang', l);

    const url = new URL(window.location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', l);
      history.replaceState(null, '', url);
    }

    document.documentElement.lang = l;
    this.mutationObserver.disconnect();
    this.walk(document.body);

    if (this.lang === 'vi') {
      this.mutationObserver.observe(document.body, this.observerOpts);
    }

    $$('[data-lang]').forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.lang === l);
    });

    this.updateTitle();

    if (this.onLanguageChangeCallback) {
      this.onLanguageChangeCallback(l);
    }

    if (!silent && this.onToastCallback) {
      this.onToastCallback(l === 'vi' ? 'Đã chuyển sang tiếng Việt.' : 'Switched to English.');
    }
  }

  init() {
    if (this.lang === 'vi') {
      this.setLanguage('vi', true);
    } else {
      document.documentElement.lang = 'en';
      this.mutationObserver.observe(document.body, this.observerOpts);
    }
  }
}

export const i18nService = new I18nService();

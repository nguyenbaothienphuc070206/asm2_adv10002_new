import { TIPS_ARTICLES } from '../config/content.js';
import { C } from '../config/catalog.js';
import { Article } from '../models/Article.js';
import { analyticsService } from '../services/AnalyticsService.js';
import { renderImage } from '../views/ProductCard.js';
import { toast } from '../views/Toast.js';
import { M } from '../utils/formatters.js';
import { $ } from '../utils/dom.js';

/**
 * Skin Tips and Articles Controller
 */
export class TipsController {
  constructor() {
    this.articles = TIPS_ARTICLES.map((data) => new Article(data));
    this.activeCategory = 'All';
  }

  renderTips(category = this.activeCategory) {
    this.activeCategory = category;
    const cats = ['All', ...new Set(this.articles.map((a) => a.category))];

    const tcats = $('#tcats');
    if (tcats) {
      tcats.innerHTML = cats
        .map(
          (c) =>
            `<button type="button" data-cat="${c}" class="${
              this.activeCategory === c ? 'active' : ''
            }" aria-pressed="${this.activeCategory === c}">${c}</button>`
        )
        .join('');
    }

    const tg2 = $('#tg2');
    if (tg2) {
      const filtered = this.articles.filter(
        (a) => this.activeCategory === 'All' || a.category === this.activeCategory
      );
      tg2.innerHTML =
        filtered
          .map(
            (a) =>
              `<article class="card2">${renderImage(
                a.imageKey,
                a.title,
                'tcover'
              )}<span class="chip">${a.category}</span><h3><button type="button" class="lnk" data-art="${
                a.id
              }">${a.title}</button></h3><p><small>${a.readTime}</small></p></article>`
          )
          .join('') +
        (this.activeCategory === 'All'
          ? '<article class="card2"><span class="chip">Sponsored content</span><h3>Partner pick: a reusable tote bag</h3><p>Native ad slot for a partner brand. Placeholder content.</p></article><div class="ad" style="grid-column:1/-1">Ad space: sidebar</div>'
          : '');
    }
  }

  openArticle(id) {
    const a = this.articles.find((x) => x.id === id);
    if (!a) return;
    const p = C[a.relatedProductId];
    const rdc = $('#rdc');
    if (!rdc) return;

    rdc.innerHTML = `${renderImage(a.imageKey, a.title, 'tcover')}<span class="chip" style="margin-top:14px">${
      a.category
    }</span><h2 style="margin:10px 0">${a.title}</h2><p><small>${
      a.readTime
    } · Sample article for this concept</small></p><p style="margin:14px 0;font-size:18px">${
      a.content
    }</p><div class="note" style="background:var(--sand)"><b>Related product</b><br>${p.n}, ${M(
      p.p
    )}<div class="row" style="margin-top:10px"><button type="button" class="pill" data-add="${
      p.id
    }">Add to bag</button><button type="button" class="pill outline" data-go="shop">Browse all products</button></div></div><div class="row"><button type="button" class="pill outline" data-share-art="${
      a.id
    }">Share this article</button><button type="button" class="pill outline" data-close>Close</button></div>`;

    const rd = $('#rd');
    if (rd) rd.showModal();
    history.replaceState(null, '', '#tips/' + id);
    analyticsService.track('article_open');
  }

  shareArticle(id) {
    const a = this.articles.find((x) => x.id === id);
    if (!a) return;
    if (navigator.share) {
      navigator.share({ title: a.title, url: location.href }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(location.href)
        .then(() => toast.show('Link copied.'))
        .catch(() => toast.show('Copy the address from your browser bar to share.'));
    } else {
      toast.show('Copy the address from your browser bar to share.');
    }
  }
}

export const tipsController = new TipsController();

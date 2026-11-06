import { C, DAYS_DATA, ROUTINE_STEPS_DATA } from '../config/catalog.js';
import {
  REVIEWS_DATA,
  GALLERY_DATA,
  INGREDIENTS_DATA,
  TIPS_ARTICLES
} from '../config/content.js';
import { IMG } from '../config/images.js';
import { YEAR_SLIDER_LABELS, EMAIL_REGEX } from '../config/constants.js';

import { i18nService } from '../services/I18nService.js';
import { analyticsService } from '../services/AnalyticsService.js';
import { cartService } from '../services/CartService.js';
import { searchService } from '../services/SearchService.js';
import { promoService } from '../services/PromoService.js';
import { mapService } from '../services/MapService.js';

import { NavigationController } from './NavigationController.js';
import { shopController } from './ShopController.js';
import { quizController } from './QuizController.js';
import { bagController } from './BagController.js';
import { tipsController } from './TipsController.js';
import { contactController } from './ContactController.js';

import { renderImage, renderProductCard } from '../views/ProductCard.js';
import { herbalGardenView } from '../views/HerbalGardenView.js';
import { ecosystemHubModalView } from '../views/EcosystemHubModalView.js';
import { toast } from '../views/Toast.js';
import { seoService } from '../services/SeoService.js';
import { routineEngine } from '../services/RoutineEngine.js';
import { ecommerceService } from '../services/EcommerceService.js';
import { authService } from '../services/AuthService.js';
import { herbalEcosystemService } from '../services/HerbalEcosystemService.js';
import { enterpriseOperationsService } from '../services/EnterpriseOperationsService.js';
import { init3DTiltInteraction } from '../utils/tilt3d.js';
import { M } from '../utils/formatters.js';
import { $, $$ } from '../utils/dom.js';

/**
 * Master Application Controller and Coordinator
 */
export class AppController {
  constructor() {
    this.navigationController = new NavigationController({
      onShopRoute: (filter) => shopController.renderShop(filter),
      onScanRoute: () => quizController.switchState('s-consent'),
      onLeaveScan: () => clearTimeout(quizController.scanTimeout),
      onStoryRoute: () => herbalGardenView.mount(),
      onTipsRoute: (param) => {
        tipsController.renderTips();
        if (param && TIPS_ARTICLES.some((a) => a[0] === +param)) {
          tipsController.openArticle(+param);
        } else if (param) {
          history.replaceState(null, '', '#tips');
        }
      },
      onContactRoute: () => contactController.renderLocations(),
      onCloseBag: () => bagController.close()
    });

    cartService.onToastCallback = (msg) => toast.show(msg);
    i18nService.onToastCallback = (msg) => toast.show(msg);
    i18nService.onLanguageChangeCallback = () => {
      const contactView = $('#contact-view');
      if (contactView && !contactView.hidden) {
        mapService.renderMap();
      }
      const storyView = $('#story-view');
      if (storyView && !storyView.hidden) {
        herbalGardenView.render();
      }
      const scanView = $('#scan-view');
      if (scanView && !scanView.hidden) {
        quizController.renderCaptureLabUI();
        const resEl = $('#s-res');
        if (resEl && !resEl.hidden && quizController.profile.baseIds.length) {
          quizController.renderResult();
        }
      }
    };
  }

  init() {
    this.renderStaticSections();
    this.bindEvents();
    this.initHeroSlider();
    this.initNumberCounters();
    this.initCountdown();
    this.initCookieBanner();
    this.navigationController.init();

    i18nService.init();
    cartService.updateBadge();
    bagController.render();
    seoService.injectStructuredData();
    init3DTiltInteraction();

    this.navigationController.route();
  }

  renderStaticSections() {
    // Populate data-img elements
    $$('img[data-img]').forEach((i) => {
      if (IMG[i.dataset.img]) {
        i.src = IMG[i.dataset.img];
      } else {
        i.alt = '';
      }
      i.decoding = 'async';
    });

    // Marquee
    const mq = $('#mq');
    if (mq) {
      mq.innerHTML =
        "Grandma's secret<i></i>Since 1961<i></i>Turmeric<i></i>Cucumber<i></i>Simple routines<i></i>Prices students can afford";
    }

    // Days rows
    const daysRows = $('#days-rows');
    if (daysRows) {
      daysRows.innerHTML = DAYS_DATA.map(
        (d) =>
          `<article class="day-row" style="background:${d[5]}">${renderImage(
            d[4],
            C[d[1]].n,
            'day-photo'
          )}<div class="day-content"><span class="eyebrow">${d[0]}</span><h3>${
            C[d[1]].n
          }</h3><p>${d[2]}</p><strong>${M(
            C[d[1]].p
          )}</strong><div class="row" style="margin-top:18px"><button type="button" class="pill" data-add="${
            d[1]
          }">Add to bag</button><button type="button" class="pill outline" data-go="shop" data-f="${
            d[3]
          }">See more for this</button></div></div></article>`
      ).join('');
    }

    // Best sellers carousel
    const car = $('#car');
    if (car) {
      car.innerHTML = Object.values(C)
        .map((p) => renderProductCard(p, shopController.isWishlisted(p.id)))
        .join('');
    }

    // Routine steps tabs & photos
    const tabs = $('#tabs');
    const rphotos = $('#rphotos');
    if (tabs) {
      tabs.innerHTML = ROUTINE_STEPS_DATA.map(
        (s, i) => `<button type="button" data-tab="${i}">${s[0]}</button>`
      ).join('');
    }
    if (rphotos) {
      rphotos.innerHTML = ROUTINE_STEPS_DATA.map((s) =>
        renderImage(s[2], s[0], 'routine-photo')
      ).join('');
    }
    this.setStep(0);

    // Reviews
    this.renderReviews(false);
    const moreRv = $('#more-rv');
    if (moreRv) {
      moreRv.onclick = (e) => {
        this.renderReviews(true);
        e.target.hidden = true;
      };
    }

    // Botanical gallery
    const gal = $('#gal');
    if (gal) {
      gal.innerHTML = GALLERY_DATA.map(
        (g) => `<figure>${renderImage(g[0], g[1])}<figcaption>${g[1]}</figcaption></figure>`
      ).join('');
    }

    // Ingredients & 4 Experience Layers on story page
    const ing = $('#ing');
    if (ing) {
      const layerCards = herbalEcosystemService
        .getExperienceLayers()
        .map(
          (l) => `
          <article class="card2" style="background:rgba(255,248,236,0.92)">
            <span class="chip">${l.code}</span>
            <h3 style="margin-top:8px">${l.titleEn}</h3>
            <p>${l.descEn}</p>
            <div class="row" style="margin-top:10px">
              <button type="button" class="pill outline" ${l.actionAttr}>${l.ctaLabelEn}</button>
            </div>
          </article>
        `
        )
        .join('');

      ing.innerHTML =
        INGREDIENTS_DATA.map(
          (g) =>
            `<article class="card2">${renderImage(
              g[1],
              g[0],
              'tcover'
            )}<h3>${g[0]}</h3><p>${g[2]}</p><div class="row" style="margin-top:10px"><button type="button" class="pill outline" data-go="shop" data-f="${
              g[3]
            }">Shop products with this</button><button type="button" class="pill outline" data-eco-open="academy">INCI & Science Lab</button></div></article>`
        ).join('') + layerCards;
    }
  }

  setStep(index) {
    $$('#tabs button').forEach((b, j) => b.classList.toggle('active', j === index));
    const stepEl = $('#step');
    if (stepEl && ROUTINE_STEPS_DATA[index]) {
      stepEl.innerHTML = `<h3>${ROUTINE_STEPS_DATA[index][0]}</h3><p>${ROUTINE_STEPS_DATA[index][1]}</p>`;
    }
    $$('#rphotos img').forEach((e, j) => (e.hidden = j !== index));
  }

  renderReviews(showAll) {
    const rv = $('#rv');
    if (rv) {
      rv.innerHTML = REVIEWS_DATA.slice(0, showAll ? 6 : 3)
        .map(
          (r) =>
            `<article class="review"><div class="avatar" aria-hidden="true">${r[0]}</div><p aria-label="5 stars">★★★★★</p><h3>“${r[3]}”</h3><p><span class="chip">${r[2]}</span></p><small>${r[1]}, verified buyer (sample review)</small></article>`
        )
        .join('');
    }
  }

  initHeroSlider() {
    const yr = $('#yr');
    const yl = $('#yl');
    const hart = $('#hart');
    if (yr) {
      yr.oninput = (e) => {
        const v = +e.target.value;
        const i = v < 34 ? 0 : v < 67 ? 1 : 2;
        if (yl) yl.textContent = YEAR_SLIDER_LABELS[i];
        if (hart) {
          hart.style.filter = `saturate(${1 + (0.12 * v) / 100}) brightness(${1 + (0.04 * v) / 100})`;
        }
        e.target.setAttribute('aria-valuetext', 1961 + Math.round(v * 0.65) + ': ' + YEAR_SLIDER_LABELS[i]);
      };
    }
  }

  initNumberCounters() {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = +el.dataset.count;
        const t0 = performance.now();
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          el.textContent = end;
        } else {
          (function tick(now) {
            const progress = Math.min(1, (now - t0) / 1100);
            el.textContent = Math.round(end * (1 - Math.pow(1 - progress, 3)));
            if (progress < 1) requestAnimationFrame(tick);
          })(t0);
        }
        counterObserver.unobserve(el);
      });
    });

    $$('[data-count]').forEach((el) => counterObserver.observe(el));
  }

  initCountdown() {
    const cd = $('#cd');
    const updateCountdown = () => {
      const remaining = new Date('2026-12-31T23:59:59+07:00') - Date.now();
      if (!cd) return;
      if (remaining <= 0) {
        cd.textContent = 'Campaign ended. Prices are samples.';
      } else {
        const d = Math.floor(remaining / 864e5);
        const h = Math.floor((remaining % 864e5) / 36e5);
        const m = Math.floor((remaining % 36e5) / 6e4);
        cd.textContent = `Campaign ends 31 Dec 2026: ${d}d ${h}h ${m}m left`;
      }
    };
    updateCountdown();
    setInterval(updateCountdown, 60000);
  }

  initCookieBanner() {
    setTimeout(() => {
      const promoEl = $('#promo');
      const isPromoHidden = !promoEl || promoEl.hidden;
      if (!analyticsService.isConsentGivenOrDenied() && isPromoHidden) {
        const ck = $('#ck');
        if (ck) ck.hidden = false;
      }
    }, 2500);
  }

  openSearchDialog() {
    const srchd = $('#srchd');
    const sqi = $('#sqi');
    if (srchd) srchd.showModal();
    if (sqi) {
      sqi.value = '';
      this.renderSearchResults('');
      sqi.focus();
    }
    analyticsService.track('search_open');
  }

  renderSearchResults(query) {
    const { raw, results } = searchService.search(query);
    const sres = $('#sres');
    if (!sres) return;

    if (results.length) {
      sres.innerHTML = results
        .map(
          (i) =>
            `<li><button type="button" data-sr="${i[0]}|${i[1]}"><span>${i[2]}</span><small>${i[3]}</small></button></li>`
        )
        .join('');
    } else {
      sres.innerHTML = `<li class="empty">No results for “${raw.replace(
        /[<>&"]/g,
        ''
      )}”. Try “turmeric”, “toner” or “lip balm”.</li>`;
    }
  }

  bindEvents() {
    // Scroll progress & sticky header
    window.addEventListener(
      'scroll',
      () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = $('#progress');
        if (progress) {
          progress.style.width = (maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0) + '%';
        }
        const sh = $('#sh');
        if (sh) {
          sh.classList.toggle('stuck', window.scrollY > 8);
        }
      },
      { passive: true }
    );

    // Global errors toast
    window.addEventListener('error', () => toast.show('Something went wrong. Please reload the page.'));
    window.addEventListener('unhandledrejection', () =>
      toast.show('Something went wrong. Please try again.')
    );

    // Global click delegation
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button,a');
      if (!target) return;
      const d = target.dataset;

      if (d.lang) {
        i18nService.setLanguage(d.lang);
        return;
      }

      if (d.add) {
        cartService.add(d.add, target);
        const originalText = target.textContent;
        if (!target.dataset.o) {
          target.dataset.o = originalText;
          target.textContent = 'Added ✓';
          setTimeout(() => {
            target.textContent = target.dataset.o;
            delete target.dataset.o;
          }, 1400);
        }
        const bo = $('#bo');
        if (bo) {
          bo.classList.remove('bump');
          void bo.offsetWidth;
          bo.classList.add('bump');
        }
        return;
      }

      if (d.go) {
        this.navigationController.go(
          d.go,
          d.sec,
          d.f,
          false,
          d.quiz
            ? () => {
                quizController.profile.q = 0;
                quizController.profile.answers = {};
                quizController.renderQuestion();
                quizController.switchState('s-q');
              }
            : null
        );
        return;
      }

      if (d.f) {
        history.replaceState(null, '', '#shop' + (d.f === 'all' ? '' : '/' + d.f));
        shopController.renderShop(d.f);
        return;
      }

      if (d.sort) {
        shopController.setSort(d.sort);
        return;
      }

      if (d.pkgView) {
        shopController.setPackagingPerspective(d.pkgView);
        return;
      }

      if (d.ecoOpen) {
        bagController.close();
        ecosystemHubModalView.open(d.ecoOpen);
        return;
      }

      if (d.ecoTab) {
        ecosystemHubModalView.activeTab = d.ecoTab;
        ecosystemHubModalView.render();
        return;
      }

      if (d.herbalCat) {
        ecosystemHubModalView.herbalCategory = d.herbalCat;
        ecosystemHubModalView.render();
        return;
      }

      if ('habitCheckin' in d) {
        const res = herbalEcosystemService.logDailyHabitCheckIn();
        ecosystemHubModalView.render();
        toast.show(
          res.updated
            ? `Daily herbal routine logged (+10 pts · ${res.streak}-day streak)!`
            : `Today's routine already logged (${res.streak}-day streak).`
        );
        return;
      }

      if (d.chalCheckin) {
        herbalEcosystemService.checkInChallenge(d.chalCheckin);
        ecosystemHubModalView.render();
        toast.show('Community challenge progress updated (+10 pts)!');
        return;
      }

      if (d.postFlag) {
        herbalEcosystemService.toggleFlagCommunityPost(d.postFlag);
        ecosystemHubModalView.render();
        toast.show('Community post flagged and hidden for moderation.');
        return;
      }

      if ('privacyExport' in d) {
        const user = authService.getCurrentUser();
        const bundle = herbalEcosystemService.exportPersonalDataBundle({
          user,
          orders: ecommerceService.getOrdersForUser(user),
          savedRoutines: routineEngine.getSavedRoutines(),
          scanHistory: routineEngine.getScanHistory()
        });
        try {
          const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `thorakao-personal-data-${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch {
          // Non-fatal in headless environments without Blob download
        }
        authService.logSecurityEvent('GDPR_DATA_EXPORT', user ? user.email : 'guest');
        toast.show('Personal data JSON bundle exported (GDPR/PDPA Data Portability).');
        return;
      }

      if (d.ragPrompt) {
        ecosystemHubModalView.handleAskSubmit(d.ragPrompt);
        return;
      }

      if (d.authDemo) {
        const u = authService.loginDemoRole(d.authDemo);
        ecosystemHubModalView.render();
        toast.show(`Active session: ${u.name} (${u.role.toUpperCase()})`);
        return;
      }

      if ('authLogout' in d) {
        authService.logout();
        ecosystemHubModalView.render();
        toast.show('Signed out.');
        return;
      }

      if (d.orderCancel) {
        ecommerceService.cancelOrder(d.orderCancel);
        authService.logSecurityEvent('ORDER_CANCEL', d.orderCancel);
        ecosystemHubModalView.render();
        toast.show(`Order #${d.orderCancel} cancelled.`);
        return;
      }

      if (d.orderReturn) {
        ecommerceService.requestReturn(d.orderReturn);
        authService.logSecurityEvent('ORDER_RETURN_REQ', d.orderReturn);
        ecosystemHubModalView.render();
        toast.show(`30-day return requested for #${d.orderReturn}.`);
        return;
      }

      if (d.routineApply) {
        d.routineApply
          .split(',')
          .filter(Boolean)
          .forEach((sku) => cartService.cart.add(sku, 1));
        cartService.save();
        cartService.updateBadge();
        bagController.render();
        const ecod = $('#ecod');
        if (ecod && ecod.open) ecod.close();
        bagController.open();
        toast.show('Saved routine added to your bag.');
        return;
      }

      if (d.routineDel) {
        routineEngine.deleteSavedRoutine(d.routineDel);
        ecosystemHubModalView.render();
        toast.show('Saved routine removed.');
        return;
      }

      if ('privacyErase' in d) {
        authService.deleteAccountAndPersonalData();
        ecosystemHubModalView.render();
        toast.show('All personal profile, routine, and scan history data erased.');
        return;
      }

      if (d.adminSub) {
        ecosystemHubModalView.adminSubTab = d.adminSub;
        ecosystemHubModalView.render();
        return;
      }

      if (d.stockAdj) {
        if (!authService.requireAdmin('STOCK_ADJUST')) {
          toast.show('Administrator role required.');
          return;
        }
        const [sku, deltaStr] = d.stockAdj.split('|');
        const nextQty = ecommerceService.getStock(sku) + Number(deltaStr || 0);
        ecommerceService.updateStock(sku, nextQty);
        authService.logSecurityEvent('STOCK_ADJUST', `${sku} -> ${nextQty}`);
        ecosystemHubModalView.render();
        return;
      }

      if (d.priceAdj) {
        if (!authService.requireAdmin('PRICE_ADJUST')) {
          toast.show('Administrator role required.');
          return;
        }
        const [sku, deltaStr] = d.priceAdj.split('|');
        if (C[sku]) {
          const nextPrice = C[sku].p + Number(deltaStr || 0);
          ecommerceService.updatePrice(sku, nextPrice);
          authService.logSecurityEvent('PRICE_ADJUST', `${sku} -> ${C[sku].p} VND`);
          ecosystemHubModalView.render();
          const shopView = $('#shop-view');
          if (shopView && !shopView.hidden) {
            shopController.renderShop();
          }
          toast.show(`Updated ${C[sku].n} to ${M(C[sku].p)}.`);
        }
        return;
      }

      if (d.adminRole) {
        const [uid, nextRole] = d.adminRole.split('|');
        if (!authService.updateUserRole(uid, nextRole)) {
          toast.show('Administrator role required.');
          return;
        }
        ecosystemHubModalView.render();
        toast.show(`Updated user role to ${nextRole.toUpperCase()}.`);
        return;
      }

      if (d.adminOstatus) {
        if (!authService.requireAdmin('ORDER_STATUS_UPDATE')) {
          toast.show('Administrator role required.');
          return;
        }
        const [oid, statusText] = d.adminOstatus.split('|');
        ecommerceService.updateOrderStatus(oid, statusText);
        authService.logSecurityEvent('ORDER_STATUS_UPDATE', `${oid} -> ${statusText}`);
        ecosystemHubModalView.render();
        toast.show(`Order #${oid} updated.`);
        return;
      }

      if (d.agentRun) {
        if (!authService.requireAdmin('AGENT_ORCHESTRATION_RUN')) {
          toast.show('Administrator role required.');
          return;
        }
        const out = enterpriseOperationsService.runCollaborativeWorkflow(d.agentRun, {
          orders: ecommerceService.getOrders(),
          stockMap: ecommerceService.getStockMap()
        });
        authService.logSecurityEvent('AGENT_ORCHESTRATION_RUN', d.agentRun);
        ecosystemHubModalView.render();
        toast.show(
          out.ok
            ? `Multi-Agent Audit completed (${out.report.latencyMs}ms · 4 agents).`
            : `Blocked: ${out.blockedReason}`
        );
        return;
      }

      if (d.hitlDecision) {
        if (!authService.requireAdmin('HITL_APPROVAL_DECISION')) {
          toast.show('Administrator role required.');
          return;
        }
        const [itemId, decision] = d.hitlDecision.split('|');
        const actor = authService.getCurrentUser()?.email || 'admin@thorakao-lab.vn';
        enterpriseOperationsService.resolveApprovalItem(itemId, decision, actor);
        authService.logSecurityEvent('HITL_APPROVAL_DECISION', `${itemId} -> ${decision}`);
        ecosystemHubModalView.render();
        toast.show(`HITL item ${itemId} marked ${decision}.`);
        return;
      }

      if (d.cmsAdvance) {
        if (!authService.requireAdmin('CMS_WORKFLOW_ADVANCE')) {
          toast.show('Administrator role required.');
          return;
        }
        const [cmsId, nextStatus] = d.cmsAdvance.split('|');
        const actor = authService.getCurrentUser()?.email || 'admin@thorakao-lab.vn';
        enterpriseOperationsService.advanceCmsWorkflow(cmsId, nextStatus, actor);
        authService.logSecurityEvent('CMS_WORKFLOW_ADVANCE', `${cmsId} -> ${nextStatus}`);
        ecosystemHubModalView.render();
        toast.show(`CMS item ${cmsId} moved to ${nextStatus}.`);
        return;
      }

      if (d.currencySwitch) {
        const code = enterpriseOperationsService.setDisplayCurrency(d.currencySwitch);
        ecosystemHubModalView.render();
        toast.show(`Reference display currency set to ${code} (Settlement remains VND).`);
        return;
      }

      if ('drVerify' in d) {
        if (!authService.requireAdmin('BACKUP_DR_VERIFY')) {
          toast.show('Administrator role required.');
          return;
        }
        const dr = enterpriseOperationsService.runBackupAndRestoreDrill({
          orders: ecommerceService.getOrders(),
          stockMap: ecommerceService.getStockMap(),
          users: authService.getAllUsers()
        });
        authService.logSecurityEvent('BACKUP_DR_VERIFY', `${dr.checksum} (${dr.bytes}B)`);
        ecosystemHubModalView.render();
        toast.show(`Backup & Restore DR Verified: ${dr.checksum} (${dr.durationMs}ms).`);
        return;
      }

      if (d.budgetTier) {
        quizController.profile.budgetTier = d.budgetTier;
        quizController.renderResult();
        return;
      }

      if (d.ingRestrict) {
        quizController.profile.restriction = d.ingRestrict;
        quizController.renderResult();
        return;
      }

      if ('routineSave' in d) {
        const plan = routineEngine.generatePersonalizedPlan({
          feel: quizController.profile.answers?.feel || 'oily',
          concern: quizController.profile.answers?.concern || 'blemish',
          budgetTier: quizController.profile.budgetTier || 'balanced',
          restriction: quizController.profile.restriction || 'none',
          yoloReport: quizController.profile.yoloReport,
          stockMap: ecommerceService.getStockMap()
        });
        routineEngine.saveRoutine(plan);
        analyticsService.track('routine_saved');
        toast.show('Routine saved to your account.');
        return;
      }

      if ('scanSave' in d) {
        routineEngine.setStorageConsent(true);
        routineEngine.saveScanRecord(quizController.profile);
        toast.show('Scan saved to your consent-gated progress history.');
        return;
      }

      if (d.tab !== undefined) {
        this.setStep(+d.tab);
        return;
      }

      if (d.scroll) {
        const car = $('#car');
        if (car) car.scrollBy({ left: d.scroll * 340, behavior: 'smooth' });
        return;
      }

      if (d.q) {
        const [id, countStr] = d.q.split('|');
        const currentQty = cartService.cart.items[id] || 0;
        cartService.setQuantity(id, currentQty + +countStr);
        bagController.render();
        return;
      }

      if ('swap' in d) {
        cartService.swapForDuo();
        bagController.render();
        return;
      }

      if ('co' in d) {
        bagController.openCheckout();
        return;
      }

      if (d.a) {
        const [k, v] = d.a.split('|');
        quizController.handleAnswer(k, v);
        return;
      }

      if (d.scanPreset) {
        quizController.loadSamplePreset(d.scanPreset);
        return;
      }

      if (d.botanical) {
        herbalGardenView.selectBotanical(d.botanical);
        return;
      }

      if (d.hgAction) {
        herbalGardenView.handleDockAction(d.hgAction);
        return;
      }

      if ('qback' in d) {
        quizController.handleBack();
        return;
      }

      if (d.rt) {
        quizController.setRoutineTime(d.rt);
        return;
      }

      if ('all' in d) {
        quizController.profile.items.forEach((i) => cartService.cart.add(i, 1));
        cartService.save();
        cartService.updateBadge();
        bagController.render();
        toast.show('Routine added to your bag.');
        bagController.open();
        return;
      }

      if ('print' in d) {
        analyticsService.track('report_print');
        window.print();
        return;
      }

      if ('reset' in d) {
        quizController.resetConsent();
        return;
      }

      if ('del' in d) {
        quizController.deleteResult();
        return;
      }

      if ('ck' in d) {
        const allowed = d.ck === '1';
        analyticsService.setConsent(allowed);
        const ck = $('#ck');
        if (ck) ck.hidden = true;
        toast.show(allowed ? 'Thanks. Analytics enabled.' : 'Analytics declined.');
        return;
      }

      if (d.promo) {
        const action = d.promo;
        if (action === 'show') {
          promoService.showPromo(true);
        } else if (action === 'close') {
          const promoEl = $('#promo');
          if (promoEl) promoEl.hidden = true;
          analyticsService.track('promo_dismiss');
        } else if (action === 'apply') {
          const codeEl = $('#pcode');
          const code = codeEl ? codeEl.textContent : '';
          const promoEl = $('#promo');
          if (promoEl) promoEl.hidden = true;
          cartService.applyPromo(code);
          bagController.open();
        } else if (action === 'copy') {
          const codeEl = $('#pcode');
          const code = codeEl ? codeEl.textContent : '';
          if (navigator.clipboard) {
            navigator.clipboard
              .writeText(code)
              .then(() => toast.show('Code copied.'))
              .catch(() => toast.show('Code: ' + code));
          } else {
            toast.show('Code: ' + code);
          }
        }
        return;
      }

      if ('skip' in d) {
        const main = $('#main');
        if (main) main.focus();
        return;
      }

      if (target.id === 'srch') {
        this.openSearchDialog();
        return;
      }

      if (target.id === 'menub') {
        const nav = $('#nav');
        if (nav) {
          const isOpen = nav.classList.toggle('open');
          target.setAttribute('aria-expanded', isOpen);
        }
        return;
      }

      if (d.pd) {
        shopController.openProductDetails(d.pd);
        return;
      }

      if (d.heart) {
        shopController.toggleWishlist(d.heart);
        return;
      }

      if (d.cat) {
        tipsController.renderTips(d.cat);
        return;
      }

      if (d.art) {
        tipsController.openArticle(+d.art);
        return;
      }

      if (d.loc) {
        contactController.handleLocationSelect(d.loc);
        return;
      }

      if ('map' in d) {
        mapService.grantConsent();
        mapService.renderMap();
        return;
      }

      if (d.sr) {
        const [type, id] = d.sr.split('|');
        const srchd = $('#srchd');
        if (srchd) srchd.close();
        if (type === 'p') shopController.openProductDetails(id);
        else if (type === 'a') tipsController.openArticle(+id);
        else this.navigationController.go(id);
        return;
      }

      if (d.focus) {
        const el = $('#' + d.focus);
        if (el) el.focus();
        return;
      }

      if ('close' in d) {
        const dlg = target.closest('dialog');
        if (dlg) dlg.close();
        return;
      }

      if (d.shareArt) {
        tipsController.shareArticle(+d.shareArt);
        return;
      }

      if (target.id === 'bo') bagController.open();
      if (target.id === 'bx') bagController.close();
    });

    const bb = $('#bb');
    if (bb) bb.onclick = () => bagController.close();

    // Global keyboard handling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') bagController.close();

      const bag = $('#bag');
      if (e.key === 'Tab' && bag && !bag.hidden) {
        const focusable = $$('button,input,a[href],select', bag).filter(
          (x) => !x.disabled && x.offsetParent
        );
        if (focusable.length) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }

      if (
        (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) &&
        !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)
      ) {
        e.preventDefault();
        this.openSearchDialog();
      }
    });

    // Quiz triggers
    const go1 = $('#go1');
    if (go1) {
      go1.onclick = () => {
        const cc = $('#cc');
        const ce = $('#ce');
        if (!cc || !cc.checked) {
          if (ce) ce.textContent = 'Please confirm before continuing.';
          return;
        }
        if (ce) ce.textContent = '';
        analyticsService.track('scan_start');
        quizController.switchState('s-capture');
      };
    }

    const go2 = $('#go2');
    if (go2) {
      go2.onclick = () => {
        const cc = $('#cc');
        const ce = $('#ce');
        if (!cc || !cc.checked) {
          if (ce) ce.textContent = 'Please confirm before continuing.';
          return;
        }
        if (ce) ce.textContent = '';
        quizController.profile.q = 0;
        quizController.profile.answers = {};
        quizController.renderQuestion();
        quizController.switchState('s-q');
      };
    }

    const sk = $('#sk');
    if (sk) {
      sk.onclick = () => {
        quizController.profile.q = 0;
        quizController.profile.answers = {};
        quizController.renderQuestion();
        quizController.switchState('s-q');
      };
    }

    const an = $('#an');
    if (an) {
      an.onclick = () => quizController.startSimulation();
    }

    const sf = $('#sf');
    if (sf) {
      sf.onchange = (e) => quizController.handlePhotoChange(e.target.files[0]);
    }

    // Contact triggers
    const lcity = $('#lcity');
    if (lcity) {
      lcity.onchange = () => contactController.handleCityChange();
    }

    // Search dialog triggers
    const sqi = $('#sqi');
    if (sqi) {
      sqi.oninput = (e) => this.renderSearchResults(e.target.value);
    }

    const srchd = $('#srchd');
    if (srchd) {
      srchd.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          srchd.close();
          return;
        }
        const buttons = $$('#sres button');
        if (!buttons.length) return;
        const idx = buttons.indexOf(document.activeElement);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          buttons[Math.min(buttons.length - 1, idx + 1)].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (idx > 0) {
            buttons[idx - 1].focus();
          } else {
            const input = $('#sqi');
            if (input) input.focus();
          }
        } else if (e.key === 'Enter' && document.activeElement === $('#sqi')) {
          e.preventDefault();
          buttons[0].click();
        }
      });
    }

    // Dialog backdrop click to close
    $$('dialog').forEach((d) =>
      d.addEventListener('click', (e) => {
        if (e.target === d) d.close();
      })
    );

    // Article reader close resets hash
    const rd = $('#rd');
    if (rd) {
      rd.addEventListener('close', () => {
        if (location.hash.startsWith('#tips/')) {
          history.replaceState(null, '', '#tips');
        }
      });
    }

    const ecod = $('#ecod');
    if (ecod) {
      ecod.addEventListener('close', () => {
        const ecodc = $('#ecodc');
        if (ecodc) ecodc.innerHTML = '';
      });
    }

    // Form submits
    document.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;

      if (form.id === 'co') {
        bagController.handleCheckoutSubmit(form);
      }

      if (form.id === 'pf') {
        const input = $('#pcin');
        cartService.applyPromo(input ? input.value : '');
        bagController.render();
      }

      if (form.id === 'nf') {
        const ne = $('#ne');
        const nn = $('#nn');
        const ns = $('#ns');
        const email = ne ? ne.value.trim() : '';

        if (!EMAIL_REGEX.test(email)) {
          if (ns) ns.textContent = 'Please enter an email like name@email.com.';
          return;
        }

        analyticsService.track('newsletter_signup');
        const record = {
          name: nn ? nn.value.trim() : '',
          email,
          topic: 'newsletter',
          message: '',
          submitted_at: new Date().toISOString()
        };

        const savePromise =
          window.dataSdk && window.dataSdk.create
            ? window.dataSdk.create(record).then((r) => r.isOk).catch(() => false)
            : Promise.resolve(true);

        savePromise.then((ok) => {
          if (ns) {
            ns.textContent = ok
              ? 'You are on the list. Thank you!'
              : 'We could not save that. Please try again.';
          }
          if (ok) form.reset();
        });
      }

      if (form.id === 'rf') {
        const rfe = $('#rfe');
        const email = rfe ? rfe.value.trim() : '';
        toast.show(
          EMAIL_REGEX.test(email)
            ? 'Demo: your report would be emailed to ' +
                email.replace(/(.).+(@.+)/, '$1***$2') +
                '.'
            : 'Please enter a valid email.'
        );
      }

      if (form.id === 'cf') {
        contactController.handleContactSubmit(form);
      }

      if (form.id === 'rag-form') {
        const ragIn = $('#rag-input');
        const q = ragIn ? ragIn.value.trim() : '';
        if (q) {
          ecosystemHubModalView.handleAskSubmit(q);
        }
      }

      if (form.id === 'auth-login-form') {
        const nameIn = $('#auth-name-in');
        const emailIn = $('#auth-email-in');
        const u = authService.register({
          name: nameIn ? nameIn.value : '',
          email: emailIn ? emailIn.value : '',
          city: 'Ho Chi Minh City'
        });
        ecosystemHubModalView.render();
        toast.show(`Welcome, ${u.name}!`);
      }

      if (form.id === 'addr-add-form') {
        const lbl = $('#addr-label-in');
        const line = $('#addr-line-in');
        authService.addAddress(lbl ? lbl.value : 'Address', line ? line.value : '');
        ecosystemHubModalView.render();
        toast.show('Delivery address saved.');
      }

      if (form.id === 'academy-quiz-form') {
        const data = new FormData(form);
        const indices = [
          Number(data.get('q0') ?? 0),
          Number(data.get('q1') ?? 0),
          Number(data.get('q2') ?? 0)
        ];
        const res = herbalEcosystemService.gradeAcademyQuiz(indices);
        ecosystemHubModalView.render();
        toast.show(
          res.passed
            ? `Academy Quiz passed (${res.score}/${res.total} · ${res.percent}%)!`
            : `Score: ${res.score}/${res.total}. Review the INCI explanations and try again.`
        );
      }

      if (form.id === 'community-post-form') {
        const skuEl = $('#comm-sku-in');
        const noteEl = $('#comm-note-in');
        const u = authService.getCurrentUser();
        const post = herbalEcosystemService.addCommunityPost({
          author: u ? u.name : 'Verified Customer',
          city: u ? u.city : 'Ho Chi Minh City',
          sku: skuEl ? skuEl.value : 'cream',
          note: noteEl ? noteEl.value : ''
        });
        if (post) {
          ecosystemHubModalView.render();
          toast.show('Routine journal shared (+20 Heritage Points)!');
        }
      }

      if (form.id === 'subjective-log-form') {
        const ratingEl = $('#subj-rating-in');
        const noteEl = $('#subj-note-in');
        const entry = herbalEcosystemService.addSubjectiveFeedback({
          comfortRating: ratingEl ? Number(ratingEl.value) : 5,
          hydrationFeel: 'balanced',
          note: noteEl ? noteEl.value : ''
        });
        if (entry) {
          ecosystemHubModalView.render();
          toast.show('Subjective skin comfort note logged (+15 pts)!');
        }
      }

      if (form.id === 'twin-sim-form') {
        const surgeIn = $('#twin-surge-in');
        const leadIn = $('#twin-lead-in');
        const sim = enterpriseOperationsService.simulateSupplyChainTwin(
          {
            demandSurgePct: surgeIn ? Number(surgeIn.value) : 25,
            leadTimeDays: leadIn ? Number(leadIn.value) : 7,
            safetyStockDays: 10
          },
          ecommerceService.getStockMap()
        );
        ecosystemHubModalView.render();
        toast.show(
          `Digital Twin simulated: ${sim.triggeredCount} SKU(s) at/below reorder point.`
        );
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target && e.target.id === 'scan-consent-toggle') {
        routineEngine.setStorageConsent(e.target.checked);
        ecosystemHubModalView.render();
        toast.show(
          e.target.checked
            ? 'Scan history storage consent enabled.'
            : 'Scan history storage disabled and cleared.'
        );
      }
    });
  }
}

export const appController = new AppController();

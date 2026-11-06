# THORAKAO · Botanical AI Skin Lab & E-Commerce Ecosystem (`Design.md`)

## 1. Mission & Product Vision
Transform **THORAKAO (Lan Hảo Cosmetics Since 1961)** into a complete AI-powered Vietnamese botanical skincare ecosystem combining:
1. **Priority 1 — Authentic Thorakao Product Database**: 12 verified studio assets (`1200×1200` and `1000×1500`) from `thorakao.com` and `store.thorakao.com` across 10 SKUs (`wash`, `cream`, `toner`, `lip`, `duo`, `routine`, `pomelo`, `ginseng`, `boket`, `ginger`) + honest Missing-Assets Report (`lip`).
2. **Priority 2 — Real YOLOv8n AI Skin Scan (`yolov8n-thorakao-skin-v8.2`)**: Pre-inference `ImageQualityGate` (Laplacian sharpness, luminance exposure, RMS contrast, YCbCr skin framing), 5 calibrated non-medical visible skin feature classes (`acne_features`, `dark_spots`, `redness`, `pore_visibility`, `uneven_texture`), NMS (`IoU=0.45`), temperature scaling (`T=1.28`), subject-disjoint evaluation (`mAP@50 = 0.809`), and consent-gated Scan Progress History.
3. **Priority 3 — Personalized Botanical Routine Engine**: Budget-tier (`≤105k`, `≤165k`, `≤320k VND`) and ingredient-restriction (`none`, `no_essential_oil`, `turmeric_free`) optimizer generating AM/PM routines, "Why Suggested" rationales, verified alternatives, and saved routines.
4. **Priority 4 — Complete E-Commerce**: Search, category filtering, multi-criteria sorting, live inventory stock & price management, shipping calculation (Free `≥199,000 VND` or `FREESHIP`), voucher system, order creation (`#TH...`), customer-isolated order tracking (`getOrdersForUser`), cancellation, and 30-day return requests.
5. **Priority 5 — Customer Accounts & Personal Beauty Data Dashboard**: Registration (strictly assigned `customer` role to prevent privilege escalation), login, logout, demo role switchers, address book, saved routines, consent-gated Objective YOLOv8n Scan History separated from Subjective Customer Comfort Logs, Heritage Points & Daily Habit Streaks, Product Depletion Lifecycle Reminders, 1-click GDPR/PDPA JSON Data Export (`exportPersonalDataBundle`), and 1-click Right-to-Erasure.
6. **Priority 6 — RBAC Admin & Enterprise Control Center (11 Modules)**: Products, Prices & Stock, Orders & Returns, Customers & Permissions, Marketing & Vouchers, Content & SEO, AI Model & Growth Funnel Analytics, AI Product Innovation Studio (R&D), Executive BI & Decision Intelligence (Master Module 01), Agentic AI & HITL Approvals (Master Module 02), Omnichannel, CMS & Supply Chain Digital Twin (Master Modules 03, 05, 06), and Enterprise Security, Global Expansion & DevOps Observability (Master Modules 04, 07, 08).
7. **Priority 7 — The Herbal Garden of Vietnam & 4 Experience Layers (`DISCOVER · UNDERSTAND · EXPERIENCE · GROW`)**: 5-Act interactive WebGL2 Three.js botanical sanctuary featuring Turmeric, Pomelo Blossom, Ginseng, Roasted Soapberry, and Fresh Ginger, plus Herbal Intelligence Lab, Thorakao Knowledge Academy, and Thorakao Community Lab.
8. **Priority 8 — Digital Ingredient Passport, QR Traceability & 3D Packaging Explorer**: Every SKU includes a Digital Ingredient Passport (`THK-PASS-1961-<SKU>`) with verified INCI list, official Lan Hảo manufacturer metadata, storage instructions, honest unavailable status for live ERP batch/lot numbers, deterministic SVG QR code (`renderQrCodeSvg`), and interactive 3D packaging perspective controls inside Product Quick View (`#pd`).
9. **Priority 9 — Server-Side Gemini RAG Customer Assistant**: Grounded in verified Thorakao catalog, formulations, and order status via server-side `@google/genai` (`gemini-3.8-flash`) with structured JSON `responseSchema`, timeout, retry, and deterministic catalog fallback.
10. **Priority 10 — Security, Analytics, Backup/DR & Data Governance**: Path-traversal protection (`resolveSafePath`), IP rate limiting (`60 req/min` on `/api/*`), correlation-ID distributed tracing (`X-Correlation-ID`), 9-role enterprise permission matrix, prompt-injection guard, verified state backup/restoration checksum drill (`FNV1A`), and explicit facial scan storage consent.

---

## 2. File Structure
- `/server.js`: Static HTTP server + security headers + IP rate limiter + correlation-ID tracing + `GET /api/enterprise/status` + server-side `@google/genai` RAG endpoint (`POST /api/assistant/query`).
- `/index.html`: Semantic SPA shell with OpenGraph, Twitter Cards, canonical URL, and Schema.org `@graph` JSON-LD.
- `/src/config/`: `designTokens.js`, `productManifest.js`, `herbalLabData.js`, `catalog.js`, `content.js`, `images.js`, `constants.js`, `translations.js`.
- `/src/ai/`: `modelConfig.js`, `datasetReport.js`, `modelEvaluation.js`, `ImageQualityGate.js`, `YoloV8nSkinAnalyzer.js`.
- `/src/botanical3d/`: `HerbalGardenScene.js` (Three.js WebGL2 3D botanical sanctuary).
- `/src/models/`: `Product.js`, `Cart.js`, `SkinProfile.js`, `Article.js`, `StoreLocation.js`.
- `/src/services/`: `EnterpriseOperationsService.js`, `HerbalEcosystemService.js`, `RoutineEngine.js`, `EcommerceService.js`, `AuthService.js`, `RagAssistantService.js`, `CartService.js`, `SearchService.js`, `I18nService.js`, `PromoService.js`, `MapService.js`, `AnalyticsService.js`, `StorageService.js`, `SeoService.js`.
- `/src/views/`: `EcosystemHubModalView.js`, `HerbalGardenView.js`, `SkinReportView.js`, `ProductCard.js`, `BagDrawer.js`, `Toast.js`.
- `/src/controllers/`: `AppController.js`, `NavigationController.js`, `ShopController.js`, `QuizController.js`, `BagController.js`, `TipsController.js`, `ContactController.js`.
- `/tests/unit.test.js`: 16 automated unit & integration tests via `node:test`.

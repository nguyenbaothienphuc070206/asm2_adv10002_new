# Thorakao Skincare E-Commerce Application

An e-commerce and skincare guidance web application for **Thorakao** (Vietnamese skincare since 1961), featuring an AI Skin Scan diagnostic, full multilingual English/Vietnamese localization, product catalog, cart & checkout, store locator with Google Maps integration, skin tips, and retention promotional offers.

## 🏗 Modular Object-Oriented Architecture (OOP)

This codebase has been refactored from a single monolithic standalone file into a clean, modular, maintainable architectural structure following modern Object-Oriented Programming (OOP) and Software Engineering best practices:

- **Single Responsibility Principle (SRP)**: Each class and module has a single reason to change.
- **Separation of Concerns**: UI rendering, state management, domain models, third-party services, and utility helpers are strictly decoupled.
- **Encapsulation**: State manipulation is encapsulated within dedicated Domain Models (`Cart`, `SkinProfile`, `Product`, `StoreLocation`) and Services (`StorageService`, `I18nService`, `PromoService`, `MapService`).
- **High Cohesion & Low Coupling**: Controllers orchestrate interactions without tightly binding to DOM structure or business calculation algorithms.

```
.
├── assets/                  # High-resolution optimized image assets
│   ├── botanical.jpg
│   ├── hero-art.jpg
│   ├── p-bottle.jpg
│   ├── p-jar.jpg
│   ├── p-lip.jpg
│   ├── p-toner.jpg
│   ├── panel.jpg
│   ├── set-duo.jpg
│   ├── set-routine.jpg
│   └── turmeric.jpg
├── src/
│   ├── config/              # Centralized configuration & data catalogs
│   │   ├── constants.js     # System constants, promo codes, routes, titles
│   │   ├── catalog.js       # Product catalog, routine steps, feature rows
│   │   ├── content.js       # Reviews, articles, ingredients, store locations, quiz data
│   │   ├── translations.js  # Vietnamese dictionary and regex pattern matchers
│   │   └── images.js        # Asset mapping
│   ├── models/              # Encapsulated domain entities & business state
│   │   ├── Product.js       # Product entity with pricing & tag matchers
│   │   ├── Cart.js          # Cart items, discounts, shipping, promo code logic
│   │   ├── SkinProfile.js   # Diagnostic questionnaire state, routine calculation
│   │   ├── Article.js       # Skin tip article entity
│   │   └── StoreLocation.js # Store locations & Google Maps deep-links
│   ├── services/            # Business operations, data persistence & integrations
│   │   ├── StorageService.js      # Resilient localStorage with fallback & namespace
│   │   ├── I18nService.js         # Bidirectional translation engine & DOM MutationObserver
│   │   ├── CartService.js         # Cart operations, animations & synchronization
│   │   ├── SearchService.js       # Diacritic-insensitive multi-source search
│   │   ├── PromoService.js        # Active browsing time tracker & retention popups
│   │   ├── MapService.js          # Store locator & Google Maps consent management
│   │   └── AnalyticsService.js    # Privacy-conscious tracking & cookie consent
│   ├── controllers/         # Application control and orchestration
│   │   ├── NavigationController.js # SPA routing, view transitions, deep links, focus
│   │   ├── ShopController.js       # Shop filters, wishlist toggling, quick-view modal
│   │   ├── QuizController.js       # AI Skin Scan flow, selfie simulation, recommendations
│   │   ├── BagController.js        # Cart drawer, guest checkout submission, focus trap
│   │   ├── TipsController.js       # Tips categories, article reader modal, native sharing
│   │   ├── ContactController.js    # Store locations, map display, contact form validation
│   │   └── AppController.js        # Master coordinator, global keyboard shortcuts, observers
│   ├── views/               # Reusable UI component templates
│   │   ├── ProductCard.js   # Product card and image generator
│   │   ├── BagDrawer.js     # Cart items and checkout form template
│   │   ├── SkinReportView.js# Complete skin report with AM/PM routines & 4-week plan
│   │   └── Toast.js         # Non-blocking status notifications
│   ├── utils/               # Shared helper functions
│   │   ├── dom.js           # Query selectors and scroll-locking helpers
│   │   ├── formatters.js    # Currency and number formatting
│   │   └── string.js        # Vietnamese diacritic normalization
│   ├── styles/              # Stylesheets
│   │   └── main.css         # Responsive styling, color tokens, typography & animations
│   └── main.js              # Application entry point & runtime window bridges
├── tests/                   # Automated unit test suite
│   └── unit.test.js
├── index.html               # Semantic HTML entry point
├── package.json             # NPM package scripts & configuration
├── vercel.json              # Vercel deployment & caching headers
└── thorakao-site-v6-standalone (1).html # Preserved original standalone concept
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- (Optional) Python 3.10+ for legacy static markup checks

### Validation & Testing

Run unit tests:
```bash
npm test
```

Run static code analysis and syntax checks:
```bash
npm run lint
```

Verify build readiness:
```bash
npm run build
```

## 🌐 Deployment to Vercel

The application is pre-configured for static deployment on Vercel via `vercel.json` and standard web standards.
Deploy directly via the Vercel CLI:
```bash
vercel --prod
```

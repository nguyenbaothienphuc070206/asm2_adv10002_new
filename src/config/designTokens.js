/**
 * Unified Design System Tokens (Phase 2 — Vietnamese Botanical Beauty, Reimagined)
 * Centralizes color palette, typography, spacing (8pt grid), elevation, and motion tokens.
 */

export const DESIGN_TOKENS = {
  brand: {
    name: 'THORAKAO',
    heritageYear: 1961,
    originYear: 1957,
    company: 'Lan Hảo Cosmetics Co., Ltd.'
  },
  colors: {
    // 60% Dominant Warm Neutral Canvas
    canvasCream: '#eddfc7',
    surfacePaper: '#f8f0df',
    surfaceWarmWhite: '#fffaf0',
    surfaceSand: '#e5d3b3',
    // 30% Structural Ink & Borders
    inkNavy: '#212e46',
    inkOlive: '#444e2d',
    borderLine: '#d6c3a0',
    // 10% Botanical Accent Palette
    lacquerRed: '#a51f1e',
    lacquerRedHover: '#8e1a19',
    turmericGold: '#b9904a',
    tangerineCurcumin: '#e07a16',
    emeraldForest: '#0d753a',
    deepForest: '#0f2c1d',
    gingerAmber: '#b85d19',
    pomeloBlossomWhite: '#fdfbf7',
    roseBotanicalPink: '#d45b7a',
    soapberryEarth: '#5c3a21'
  },
  typography: {
    displayFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Be Vietnam Pro", system-ui, sans-serif',
    scale: {
      hero: 'clamp(40px, 4.7vw, 80px)',
      pageTitle: 'clamp(36px, 5vw, 68px)',
      h2: 'clamp(30px, 4vw, 52px)',
      h3: 'clamp(21px, 2.2vw, 28px)',
      body: '17px',
      small: '13px',
      eyebrow: '12px'
    }
  },
  spacing8pt: {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
    xxl: '64px',
    section: 'clamp(64px, 8vw, 112px)'
  },
  radii: {
    pill: '99px',
    card: '24px',
    panel: '28px',
    input: '14px'
  },
  elevation: {
    cardShadow: '0 14px 34px #212e4622',
    stickyHeader: '0 8px 24px #212e4620'
  },
  motion: {
    microSettlingCurve: 'cubic-bezier(0.16, 1, 0.3, 1)',
    microDurationMs: 180
  }
};

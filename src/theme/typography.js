// saflash Typography System
// Font: Nunito — rounded, highly legible, ideal for learning apps
// Principles from DESIGN.md: bold headings, generous line-heights, editorial pacing

export const FONT_FAMILY = {
  light: 'Nunito_300Light',
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
};

export const TYPOGRAPHY = {
  // ── Headings ──────────────────────────────
  hero: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 30,
    lineHeight: 36,    // 1.20
    letterSpacing: -0.75,
    color: 'deepOlive',
  },
  screenTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 26,
    lineHeight: 39,    // 1.50
  },
  sectionHeading: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 22,
    lineHeight: 33,    // 1.50
  },
  cardHeading: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
    lineHeight: 28,    // 1.40
  },

  // ── Flashcard ─────────────────────────────
  wordFront: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 38,
    lineHeight: 46,    // 1.21
  },
  translation: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 36,
    lineHeight: 44,    // 1.22
  },
  phonetic: {
    fontFamily: FONT_FAMILY.light,
    fontSize: 16,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  wordBack: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 26,
    lineHeight: 32,
  },

  // ── Body ──────────────────────────────────
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    lineHeight: 24,    // 1.50
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 21,    // 1.50
  },
  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  micro: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 11,
    lineHeight: 14,
  },

  // ── Interactive ───────────────────────────
  buttonLabel: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    lineHeight: 20,
  },
  buttonSmall: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  navLabel: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  tabLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 11,
    lineHeight: 14,
  },

  // ── Decorative ────────────────────────────
  badge: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  exampleEnglish: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 17,
    lineHeight: 26,    // 1.53
    fontStyle: 'italic',
  },
  exampleSpanish: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 15,
    lineHeight: 23,
  },
};

// Convenience: get typography style with a color override
export const withColor = (style, color) => ({ ...style, color });

// saflash Color System
// Inspired by PostHog's warm olive/sage palette (DESIGN.md)
// Adapted for flashcard-based learning app

export const COLORS = {
  // ── Primary ───────────────────────────────
  oliveInk: '#4d4f46',        // Primary body text — warm olive-gray
  deepOlive: '#23251d',       // Headings, strong emphasis — near-black with green undertone
  accentOrange: '#F54E00',    // Hidden brand accent — appears on hover/tap interactions

  // ── Secondary ─────────────────────────────
  amberGold: '#F7A501',       // Medium/warning accent — pairs with orange
  focusBlue: '#3b82f6',       // Focus rings — accessibility-only blue

  // ── Surfaces ──────────────────────────────
  warmParchment: '#fdfdf8',   // Primary page background — warm near-white with sage undertone
  sageCream: '#eeefe9',       // Input backgrounds, secondary surfaces
  lightSage: '#e5e7e0',       // Button backgrounds, tertiary surfaces
  hoverWhite: '#f4f4f4',      // Universal hover/tap feedback state
  surfaceWhite: '#FFFFFF',    // Card faces, modals

  // ── Text ──────────────────────────────────
  textPrimary: '#4d4f46',     // Alias: oliveInk — main reading text
  textSecondary: '#65675e',   // Subtitles, descriptions — muted olive
  textPlaceholder: '#9ea096', // Placeholders, disabled — warm sage-green
  textInput: '#374151',       // Input field text — slightly darker for readability

  // ── Borders ───────────────────────────────
  borderSage: '#bfc1b7',      // Primary border — olive-tinted gray
  borderLight: '#b6b7af',     // Secondary border — slightly darker sage

  // ── Semantic (rating / feedback) ──────────
  successGreen: '#0F9D58',    // "Fácil" rating, correct answers, progress
  warningAmber: '#F7A501',    // "Bien" rating, medium difficulty
  dangerOrange: '#F54E00',    // "Difícil" rating, hard cards

  // ── Flashcard ─────────────────────────────
  cardFrontBg: '#FFFFFF',     // Card front background
  cardBackBg: '#1e1f23',      // Card back background — dark near-black
  cardFrontText: '#4d4f46',   // Card front text — olive ink
  cardBackText: '#FFFFFF',    // Card back text — white on dark

  // ── Category badges ───────────────────────
  badgeBg: '#eeefe9',         // Badge background — sage cream
  badgeText: '#4d4f46',       // Badge text — olive ink

  // ── Utility ───────────────────────────────
  starYellow: '#F7A501',      // Favorites, streak indicators
  dividerColor: '#bfc1b7',    // Section dividers
};

// Semantic aliases for readability in component code
export const Rating = {
  hard: COLORS.dangerOrange,
  medium: COLORS.warningAmber,
  easy: COLORS.successGreen,
};

export const Status = {
  new: COLORS.textSecondary,
  learning: COLORS.dangerOrange,
  reviewing: COLORS.warningAmber,
  known: COLORS.successGreen,
};

export const DifficultyColors = {
  A1: '#0F9D58',
  A2: '#F7A501',
  B1: '#F54E00',
  B2: '#D32F2F',
  C1: '#7B1FA2',
};

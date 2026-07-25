// saflash Spacing System
// Base unit: 4px (compact, editorial-style spacing from DESIGN.md)

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// ── Border Radius ──────────────────────────
export const RADIUS = {
  xs: 2,      // Small inline elements, tags
  sm: 4,      // Primary UI: buttons, inputs, dropdowns
  md: 6,      // Secondary containers: cards, list items
  lg: 12,     // Images, larger cards
  xl: 20,     // Flashcards
  pill: 9999, // Pill shape: badges, status indicators
};

// ── Shadows (single elevation system from DESIGN.md) ──
export const SHADOW = {
  card: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  floating: {
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
  },
  button: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
};

// ── Layout ─────────────────────────────────
export const LAYOUT = {
  cardWidth: '90%',
  flashcardHeight: 480,
  imageSize: 180,
  thumbnailSize: 50,
  maxContentWidth: 500,
  headerHeight: 56,
  tabBarHeight: 60,
};

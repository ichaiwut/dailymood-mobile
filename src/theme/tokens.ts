/**
 * "Paper Desk" design tokens — ported from the design handoff
 * (doc/design_handoff_paper_landing, "Manila Desk" direction).
 *
 * Brand/mood hues are raw HEX. Mood COLORS for entries come from the API; these
 * brand constants are for chrome (tabs, buttons, washi, accents).
 *
 * Shadows: soft/warm for paper surfaces; the CHUNKY two-layer offset shadow is
 * for BUTTONS only (the signature). Expressed as CSS boxShadow strings — RN 0.85
 * (new arch) supports `boxShadow`.
 */

export type ColorScheme = 'light' | 'dark';

/** Brand palette (handoff tokens). */
export const brand = {
  purple: '#A673F1',
  purpleStrong: '#9747FF',
  peach: '#FCA45B',
  peachShadow: '#D97F3B', // solid offset under the peach button
  mint: '#85ECCB',
  yellow: '#FDCB56',
  blue: '#9ACDE2',
  lavender: '#D4BEE4',
  cyan: '#06B6D4',
} as const;

export interface ThemeColors {
  bg: string;
  surface: string; // paper
  surface2: string; // paper-2 (inset)
  kraft: string; // manila folder back
  ink: string;
  ink2: string;
  ink3: string;
  plum: string;
  plum2: string;
  clip: string;
  hairline: string;
  hairline2: string;
  washi: string;
  paperShadow: string;
  danger: string;
  dangerBg: string;
  success: string;
  primary: string;
  accent: string;
}

const light: ThemeColors = {
  bg: '#F1E5CF', // kraft-cream desk
  surface: '#FFFFFF',
  surface2: '#FCF7EE',
  kraft: '#E9D6B4',
  ink: '#1A1320',
  ink2: '#5A4E62',
  ink3: '#8C8497',
  plum: '#1A1320',
  plum2: '#2A1F33',
  clip: '#B7B2BC',
  hairline: 'rgba(26,19,32,0.10)',
  hairline2: 'rgba(26,19,32,0.16)',
  washi: 'rgba(252,164,91,0.45)',
  paperShadow: 'rgba(60,40,20,0.40)',
  danger: '#E2483D',
  dangerBg: '#FDECEA',
  success: '#1EA672',
  primary: brand.purple,
  accent: brand.peach,
};

// Dark is force-disabled (M6) but kept for later.
const dark: ThemeColors = {
  ...light,
  bg: '#17121C',
  surface: '#221A29',
  surface2: '#2C2233',
  ink: '#F5EFFA',
  ink2: '#C9BFD4',
  hairline: 'rgba(255,255,255,0.10)',
  hairline2: 'rgba(255,255,255,0.16)',
};

export const palettes: Record<ColorScheme, ThemeColors> = { light, dark };

/** Soft paper shadows + the chunky button shadows (CSS boxShadow strings). */
export const shadow = {
  sm: '0 6px 16px -8px rgba(60,40,20,0.30)',
  md: '0 18px 40px -18px rgba(60,40,20,0.40)',
  lg: '0 36px 70px -30px rgba(40,20,10,0.45)',
  sticker: '0 10px 22px -8px rgba(0,0,0,0.30)',
  btnPeach: '0 10px 0 -2px #D97F3B, 0 18px 30px -14px rgba(217,127,59,0.7)',
  btnInk: '0 9px 0 -2px #000, 0 18px 30px -16px rgba(0,0,0,0.6)',
  btnWhite: '0 9px 0 -2px #D9CDB8, 0 18px 30px -16px rgba(0,0,0,0.3)',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  x2: 32,
  x3: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

/** Asymmetric sheet radius (folder seam at top-left). */
export const sheetRadius = { borderTopLeftRadius: 4, borderTopRightRadius: 20, borderBottomRightRadius: 20, borderBottomLeftRadius: 20 } as const;

export const fontSize = {
  eyebrow: 14,
  body: 16,
  label: 14,
  title: 20,
  h2: 26,
  h1: 32,
  display: 44,
} as const;

export const MIN_FONT_SIZE = 14;

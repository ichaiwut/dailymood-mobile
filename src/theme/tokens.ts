/**
 * "Paper Desk" design tokens — light + dark.
 *
 * Brand/mood hues come straight from the design language; per the handover we
 * use raw HEX (no CSS-var indirection) so paper surfaces look identical across
 * platforms. Mood COLORS for entries always come from the API, not from here —
 * these brand constants are only for chrome (buttons, accents, washi tape).
 */

export type ColorScheme = 'light' | 'dark';

/** Brand palette — stable across themes (handover §5). */
export const brand = {
  purple: '#A673F1',
  peach: '#FCA45B',
  mint: '#85ECCB',
  yellow: '#FDCB56',
  blue: '#9ACDE2',
  lavender: '#D4BEE4',
} as const;

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  ink2: string;
  ink3: string;
  hairline: string;
  hairline2: string;
  // paper-specific
  washi: string;
  paperShadow: string;
  // semantic
  danger: string;
  dangerBg: string;
  success: string;
  // brand passthrough
  primary: string;
  accent: string;
}

const light: ThemeColors = {
  bg: '#FBF6EE',
  surface: '#FFFFFF',
  surface2: '#F4EEE6',
  ink: '#1A1320',
  ink2: '#4A3F55',
  ink3: '#8C8497',
  hairline: 'rgba(26,19,32,0.08)',
  hairline2: 'rgba(26,19,32,0.12)',
  washi: 'rgba(166,115,241,0.22)',
  paperShadow: 'rgba(26,19,32,0.18)',
  danger: '#E2483D',
  dangerBg: '#FDECEA',
  success: '#1EA672',
  primary: brand.purple,
  accent: brand.peach,
};

const dark: ThemeColors = {
  bg: '#17121C',
  surface: '#221A29',
  surface2: '#2C2233',
  ink: '#F5EFFA',
  ink2: '#C9BFD4',
  ink3: '#8C8497',
  hairline: 'rgba(255,255,255,0.10)',
  hairline2: 'rgba(255,255,255,0.16)',
  washi: 'rgba(166,115,241,0.30)',
  paperShadow: 'rgba(0,0,0,0.45)',
  danger: '#FF6B5E',
  dangerBg: 'rgba(226,72,61,0.18)',
  success: '#4FD6A0',
  primary: brand.purple,
  accent: brand.peach,
};

export const palettes: Record<ColorScheme, ThemeColors> = { light, dark };

/** Spacing scale (4pt grid). */
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
  lg: 22,
  pill: 999,
} as const;

/**
 * Type scale. Minimum body size is 14 — nothing smaller is allowed anywhere
 * in the app (hard rule §6.4).
 */
export const fontSize = {
  eyebrow: 14, // uppercase labels (was 11px on web; bumped to honor the ≥14 rule)
  body: 16,
  label: 14,
  title: 20,
  h2: 26,
  h1: 32,
  display: 44,
} as const;

export const MIN_FONT_SIZE = 14;

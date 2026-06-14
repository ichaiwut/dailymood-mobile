/**
 * Shared Text component. Enforces the handoff's two hard rules:
 *   - Font family: Urbanist for Latin, **Noto Sans Thai for Thai** (Urbanist has
 *     no Thai glyphs, so Thai content is auto-routed to Noto Sans Thai — both are
 *     loaded). Detected per-string by scanning for Thai codepoints.
 *   - Font size floor of 14px (§6.4) — smaller sizes are clamped up.
 *
 * Use `variant` for the type scale and `weight` for emphasis.
 */
import { Children } from 'react';
import { Text as RNText, StyleSheet, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { urbanist, notoThai, type FontWeightName } from '../theme/typography';
import { MIN_FONT_SIZE } from '../theme/tokens';

type Variant = 'eyebrow' | 'body' | 'label' | 'title' | 'h2' | 'h1' | 'display';

const VARIANT_WEIGHT: Record<Variant, FontWeightName> = {
  eyebrow: 'extrabold',
  body: 'regular',
  label: 'bold',
  title: 'bold',
  h2: 'extrabold',
  h1: 'extrabold',
  display: 'extrabold',
};

const THAI_RE = /[฀-๿]/;

/** True if any descendant string contains Thai characters. */
function hasThai(children: React.ReactNode): boolean {
  let found = false;
  Children.forEach(children, (c) => {
    if (found) return;
    if (typeof c === 'string' || typeof c === 'number') {
      if (THAI_RE.test(String(c))) found = true;
    } else if (c && typeof c === 'object' && 'props' in c) {
      if (hasThai((c as { props: { children?: React.ReactNode } }).props.children)) found = true;
    }
  });
  return found;
}

/** Pick the right family. Noto Sans Thai tops out at 700, so extrabold→bold. */
function fontFamily(weight: FontWeightName, thai: boolean): string {
  if (!thai) return urbanist[weight];
  const w = weight === 'extrabold' ? 'bold' : weight;
  return notoThai[w];
}

export interface TextProps extends RNTextProps {
  variant?: Variant;
  weight?: FontWeightName;
  color?: string;
  center?: boolean;
}

export function Text({
  variant = 'body',
  weight,
  color,
  center,
  style,
  children,
  ...rest
}: TextProps) {
  const { colors, fontSize } = useTheme();
  const resolvedWeight = weight ?? VARIANT_WEIGHT[variant];
  const thai = hasThai(children);

  const resolvedSize = Math.max(fontSize[variant], MIN_FONT_SIZE);
  // A `style` override can push fontSize past the variant size. The Thai line box
  // must grow with the *effective* size, else upper vowels/tone marks clip against
  // a too-tight box (e.g. fontSize:26 + variant-derived lineHeight:24 → "ด้วย"→"ดวย").
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const effectiveSize =
    typeof flat.fontSize === 'number' ? Math.max(flat.fontSize, MIN_FONT_SIZE) : resolvedSize;
  const base: TextStyle = {
    fontFamily: fontFamily(resolvedWeight, thai),
    fontSize: resolvedSize,
    color: color ?? colors.ink,
    textAlign: center ? 'center' : undefined,
  };
  // Give Thai a roomier line box (1.5× the effective size); an explicit lineHeight
  // in `style` still wins (style merges after base).
  if (thai && flat.lineHeight == null) base.lineHeight = Math.round(effectiveSize * 1.5);
  if (variant === 'eyebrow') {
    base.textTransform = 'uppercase';
    base.letterSpacing = 0.6;
    base.color = color ?? colors.ink3;
  }

  return (
    <RNText style={[base, style]} {...rest}>
      {children}
    </RNText>
  );
}

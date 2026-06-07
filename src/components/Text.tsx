/**
 * Shared Text component. Enforces two hard rules from the handover:
 *   - Urbanist/Noto font family (never the system default).
 *   - Font size floor of 14px (§6.4) — smaller sizes are clamped up.
 *
 * Use `variant` for the type scale and `weight` for emphasis instead of raw
 * fontSize/fontFamily so the rules can't be bypassed by accident.
 */
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { urbanist, type FontWeightName } from '../theme/typography';
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
  ...rest
}: TextProps) {
  const { colors, fontSize } = useTheme();
  const resolvedWeight = weight ?? VARIANT_WEIGHT[variant];

  const base: TextStyle = {
    fontFamily: urbanist[resolvedWeight],
    fontSize: Math.max(fontSize[variant], MIN_FONT_SIZE),
    color: color ?? colors.ink,
    textAlign: center ? 'center' : undefined,
  };
  if (variant === 'eyebrow') {
    base.textTransform = 'uppercase';
    base.letterSpacing = 0.6;
    base.color = color ?? colors.ink3;
  }

  return <RNText style={[base, style]} {...rest} />;
}

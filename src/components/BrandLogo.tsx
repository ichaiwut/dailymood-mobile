/**
 * DailyMood brand logo. `wordmark` = the horizontal icon+text lockup;
 * `mark` = the gradient smiley speech-bubble icon only. Both are transparent
 * PNGs, so they sit on any background.
 */
import { Image, type ImageStyle } from 'react-native';

const WORDMARK = require('../../assets/logo-wordmark.png');
const MARK = require('../../assets/logo-mark.png');

// Intrinsic aspect ratios of the source assets.
const WORDMARK_RATIO = 1100 / 320;
const MARK_RATIO = 1;

export interface BrandLogoProps {
  variant?: 'wordmark' | 'mark';
  /** Rendered width in px; height derives from the asset's aspect ratio. */
  width?: number;
  style?: ImageStyle;
}

export function BrandLogo({ variant = 'wordmark', width = 200, style }: BrandLogoProps) {
  const isWordmark = variant === 'wordmark';
  const ratio = isWordmark ? WORDMARK_RATIO : MARK_RATIO;
  return (
    <Image
      source={isWordmark ? WORDMARK : MARK}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="DailyMood"
      style={[{ width, height: width / ratio }, style]}
    />
  );
}

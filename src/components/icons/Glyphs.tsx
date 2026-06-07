/**
 * UI glyph icons — inline SVG ported 1:1 from the mobile handoff
 * (docs/mobile-handoff/ASSETS.md §3). viewBox 0 0 24 24, stroke = currentColor.
 * Use these instead of system emoji (chrome must match the brand, not the OS).
 */
import Svg, { Path, Circle } from 'react-native-svg';

export interface GlyphProps {
  size?: number;
  color?: string;
  /** Stroke width override (defaults to the handoff value per glyph). */
  strokeWidth?: number;
}

const INK = '#1A1320';

export function SparkleIcon({ size = 24, color = INK, strokeWidth = 2.2 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3 L13.5 9 L20 12 L13.5 15 L12 21 L10.5 15 L4 12 L10.5 9 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CalendarIcon({ size = 24, color = INK, strokeWidth = 1.8 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CameraIcon({ size = 24, color = INK, strokeWidth = 1.8 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7h4l2-3h6l2 3h4v13H3V7zM12 17a4 4 0 100-8 4 4 0 000 8z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PinIcon({ size = 24, color = INK, strokeWidth = 1.8 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={10} r={2.5} stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

/** Filled pin — used once a location is chosen. */
export function PinFilledIcon({ size = 24, color = '#A673F1' }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={color}
      />
    </Svg>
  );
}

export function CloseIcon({ size = 24, color = INK, strokeWidth = 1.8 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function MicIcon({ size = 24, color = INK, strokeWidth = 1.8 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Mood sticker — colored disc + white border + soft "peel" shadow (handoff
 * `.sticker`). Renders, in priority: an emoji glyph (badges) → the brand line-art
 * MoodFace for moods. (The R2 mood-PACK SVGs render unreliably through
 * react-native-svg's SvgUri — offset viewBoxes show as solid black — so the
 * always-clean MoodFace is the default; `pack` is kept for API compatibility.)
 */
import { View } from 'react-native';
import { Text } from '../Text';
import { MoodFace, faceForMood, type FaceType } from './MoodFace';
import { useTheme } from '../../theme/ThemeProvider';
import { DEFAULT_MOOD_PACK } from '../../config';

export interface PAStickerProps {
  color: string;
  moodId?: string | null;
  /** Mood-pack id (defaults to the user's default pack). */
  pack?: string;
  /** Force the line-art face instead of the pack icon. */
  face?: FaceType;
  /** Emoji fallback when no mood (e.g. achievement badges). */
  emoji?: string;
  size?: number;
  halo?: boolean;
  /** Explicit disc background (overrides the soft mood tint) — used by the
   *  Smart Log tiles where unselected = neutral and selected = full mood color. */
  discBg?: string;
}

export function PASticker({ color, moodId, pack = DEFAULT_MOOD_PACK, face, emoji, size = 56, halo, discBg }: PAStickerProps) {
  const { shadow } = useTheme();

  // Badges (emoji) keep a full-color disc. Mood stickers show the pack face on
  // a SOFT tint of the mood color (a gentle ring), matching the design — the
  // saturated API colors as a full ring read as neon.
  const isMood = !emoji;
  let content: React.ReactNode;
  if (emoji) {
    content = <Text style={{ fontSize: size * 0.46 }}>{emoji}</Text>;
  } else if (face) {
    content = <MoodFace face={face} size={size * 0.84} />;
  } else if (moodId != null) {
    content = <MoodFace face={faceForMood(moodId)} size={size * 0.84} />;
  } else {
    content = null;
  }

  const disc = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: discBg ?? (isMood ? color + '40' : color),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        overflow: 'hidden',
        boxShadow: shadow.sticker,
      }}
    >
      {content}
    </View>
  );

  if (!halo) return disc;
  return (
    <View
      style={{
        width: size * 1.5,
        height: size * 1.5,
        borderRadius: size * 0.75,
        backgroundColor: color + '22',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {disc}
    </View>
  );
}

/**
 * Mood sticker — colored disc + white border + soft "peel" shadow (handoff
 * `.sticker`). Renders, in priority: an emoji glyph (badges) → the user's real
 * mood-PACK icon from R2 (mood contexts) → line-art MoodFace fallback.
 * The mood-color disc shows as a thin ring behind the face (matches the design).
 */
import { View } from 'react-native';
import { Text } from '../Text';
import { MoodIcon } from './MoodIcon';
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
}

export function PASticker({ color, moodId, pack = DEFAULT_MOOD_PACK, face, emoji, size = 56, halo }: PAStickerProps) {
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
    content = <MoodIcon moodId={moodId} pack={pack} size={size * 0.88} />;
  } else {
    content = null;
  }

  const disc = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: isMood ? color + '40' : color,
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

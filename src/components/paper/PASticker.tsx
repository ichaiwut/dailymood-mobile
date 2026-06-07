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

  let content: React.ReactNode;
  if (emoji) {
    content = <Text style={{ fontSize: size * 0.46 }}>{emoji}</Text>;
  } else if (face) {
    content = <MoodFace face={face} size={size * 0.8} />;
  } else if (moodId != null) {
    content = <MoodIcon moodId={moodId} pack={pack} size={size * 0.82} />;
  } else {
    content = null;
  }

  const disc = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
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

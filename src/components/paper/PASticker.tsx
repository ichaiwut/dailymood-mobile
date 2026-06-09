/**
 * Mood sticker — colored disc + white border + soft "peel" shadow (handoff
 * `.sticker`). Render priority:
 *   • `iconKey` → the R2 custom-emoji image (custom moods)
 *   • `face`    → forced brand line-art face
 *   • moodId    → custom-mood `emoji` (on tint) else brand `MoodFace`
 *   • `emoji`   → badge glyph (full-color disc)
 * The R2 *system* pack SVGs render as solid black through react-native-svg's
 * SvgUri (offset viewBoxes), so default moods use the always-clean MoodFace;
 * custom moods carry their own iconKey/emoji and render those.
 */
import { View, Image } from 'react-native';
import { Text } from '../Text';
import { MoodFace, faceForMood, type FaceType } from './MoodFace';
import { useTheme } from '../../theme/ThemeProvider';
import { DEFAULT_MOOD_PACK, R2_PUBLIC_URL } from '../../config';

export interface PAStickerProps {
  color: string;
  moodId?: string | null;
  /** Mood-pack id (kept for API compat; pack SVGs aren't used for display). */
  pack?: string;
  /** Force the line-art face. */
  face?: FaceType;
  /** Custom-mood R2 icon (e.g. `custom-emojis/emoji_1_02.png`). */
  iconKey?: string | null;
  /** Emoji — a badge glyph (no moodId) or a custom mood's own emoji (with moodId). */
  emoji?: string | null;
  size?: number;
  halo?: boolean;
  /** Explicit disc background (overrides the soft mood tint). */
  discBg?: string;
}

export function PASticker({ color, moodId, pack = DEFAULT_MOOD_PACK, face, iconKey, emoji, size = 56, halo, discBg }: PAStickerProps) {
  const { shadow } = useTheme();

  const isMood = moodId != null || face != null || !!iconKey;
  let content: React.ReactNode;
  if (iconKey) {
    content = <Image source={{ uri: `${R2_PUBLIC_URL}/${iconKey}` }} style={{ width: size * 0.7, height: size * 0.7 }} />;
  } else if (face) {
    content = <MoodFace face={face} size={size * 0.84} />;
  } else if (moodId != null) {
    content = emoji ? <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text> : <MoodFace face={faceForMood(moodId)} size={size * 0.84} />;
  } else if (emoji) {
    content = <Text style={{ fontSize: size * 0.46 }}>{emoji}</Text>;
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

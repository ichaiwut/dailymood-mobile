/**
 * Mood sticker — colored disc + white border + soft "peel" shadow (handoff
 * `.sticker`). Render priority:
 *   • `iconKey` → the R2 custom-emoji image (custom moods)
 *   • `face`    → forced brand line-art face
 *   • moodId    → the user's mood-PACK icon from R2 (custom `emoji` if given) →
 *                 brand `MoodFace` if the image can't load
 *   • `emoji`   → badge glyph (full-color disc)
 *
 * Pack icons are rendered via expo-image's <Image> (renders SVG/PNG/WEBP on BOTH
 * web and native) rather than react-native-svg's SvgUri (which draws these packs'
 * offset-viewBox SVGs as solid black) or RN's <Image> (which can't render SVG on
 * native at all → packs fell back to the line-art face). On error → MoodFace.
 */
import { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '../Text';
import { MoodFace, faceForMood, type FaceType } from './MoodFace';
import { useTheme } from '../../theme/ThemeProvider';
import { useMoodPack } from '../../hooks/queries';
import { DEFAULT_MOOD_PACK, R2_PUBLIC_URL, moodIconUrl } from '../../config';

export interface PAStickerProps {
  color: string;
  moodId?: string | null;
  /** Mood-pack id (defaults to the user's default pack). */
  pack?: string;
  /** Pack icon format (svg/png/webp) — from the pack's `iconFormat`. */
  packFormat?: string;
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

/** Pack icon via <Image>, falling back to the line-art face if it fails to load. */
function PackOrFace({ moodId, pack, format, size }: { moodId: string; pack: string; format: string; size: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <MoodFace face={faceForMood(moodId)} size={size} />;
  return (
    <Image
      source={{ uri: moodIconUrl(moodId, pack, format) }}
      style={{ width: size, height: size }}
      contentFit="contain"
      onError={() => setFailed(true)}
    />
  );
}

export function PASticker({ color, moodId, pack, packFormat, face, iconKey, emoji, size = 56, halo, discBg }: PAStickerProps) {
  const { shadow } = useTheme();
  // Default to the user's selected mood pack (+ its format) unless a caller passes
  // one explicitly. Falls back to the default pack while the profile is loading.
  const { pack: userPack, packFormat: userFormat } = useMoodPack();
  const resolvedPack = pack ?? userPack ?? DEFAULT_MOOD_PACK;
  const resolvedFormat = packFormat ?? userFormat ?? 'svg';

  const isMood = moodId != null || face != null || !!iconKey;
  let content: React.ReactNode;
  if (iconKey) {
    content = <Image source={{ uri: `${R2_PUBLIC_URL}/${iconKey}` }} style={{ width: size * 0.7, height: size * 0.7 }} contentFit="contain" />;
  } else if (face) {
    content = <MoodFace face={face} size={size * 0.84} />;
  } else if (moodId != null) {
    content = emoji ? <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text> : <PackOrFace moodId={moodId} pack={resolvedPack} format={resolvedFormat} size={size * 0.84} />;
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

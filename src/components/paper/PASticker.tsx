/**
 * Mood sticker — a colored disc with a white border and a soft "peel" shadow
 * (handoff `.sticker`). Renders the brand MoodFace when a `face` is given
 * (mood contexts), or an emoji glyph otherwise (e.g. achievement badges).
 */
import { View } from 'react-native';
import { Text } from '../Text';
import { MoodFace, faceForMood, type FaceType } from './MoodFace';
import { useTheme } from '../../theme/ThemeProvider';

export interface PAStickerProps {
  color: string;
  /** Brand mood face. Pass `moodId` instead and it's derived. */
  face?: FaceType;
  moodId?: string | null;
  /** Emoji fallback when no face (badges etc.). */
  emoji?: string;
  size?: number;
  halo?: boolean;
}

export function PASticker({ color, face, moodId, emoji, size = 56, halo }: PAStickerProps) {
  const { shadow } = useTheme();
  const resolvedFace = face ?? (moodId !== undefined ? faceForMood(moodId) : undefined);

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
        boxShadow: shadow.sticker,
      }}
    >
      {resolvedFace ? (
        <MoodFace face={resolvedFace} size={size * 0.78} />
      ) : (
        <Text style={{ fontSize: size * 0.46 }}>{emoji ?? ''}</Text>
      )}
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

/**
 * Mood sticker — a colored disc with the mood face, the Paper Desk signature
 * for moods. Mirrors the web `PASticker`: a vivid mood-colour disc + white ring
 * + the mood emoji. (Pack/custom SVG icons via R2 are a later enhancement;
 * emoji on the mood colour is the reliable native interpretation for now.)
 */
import { View } from 'react-native';
import { Text } from '../Text';

export interface PAStickerProps {
  color: string;
  emoji: string;
  size?: number;
  /** Soft colored halo behind the disc (used in empty states / heroes). */
  halo?: boolean;
}

export function PASticker({ color, emoji, size = 56, halo }: PAStickerProps) {
  const disc = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: 'rgba(26,19,32,0.25)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
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

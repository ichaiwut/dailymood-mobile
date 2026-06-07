/** A small metal paperclip glyph for "clipping" content to paper sheets. */
import { Text } from '../Text';

export function PAClip({ size = 30 }: { size?: number }) {
  return <Text style={{ fontSize: size, transform: [{ rotate: '8deg' }] }}>📎</Text>;
}

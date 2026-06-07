/**
 * Marker-pen highlight — renders a sentence with one word highlighted on a
 * peach band (the web `PAMark`). Pieces wrap inline.
 */
import { View } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeProvider';

export function MarkSentence({
  pre,
  mark,
  post,
}: {
  pre?: string;
  mark: string;
  post?: string;
}) {
  const { brand, radius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
      {pre ? <Text variant="h1">{pre}</Text> : null}
      <View
        style={{
          backgroundColor: brand.peach,
          borderRadius: radius.sm,
          paddingHorizontal: 8,
          paddingVertical: 2,
        }}
      >
        <Text variant="h1" color="#1A1320">
          {mark}
        </Text>
      </View>
      {post ? <Text variant="h1">{post}</Text> : null}
    </View>
  );
}

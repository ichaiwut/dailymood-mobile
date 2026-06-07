/**
 * Paperclip — inline SVG (ported from the handoff `Paperclip`), rotated -8°,
 * metal color. Not an emoji.
 */
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';

export function PAClip({ width = 26 }: { width?: number }) {
  const { colors } = useTheme();
  const h = width * 1.88;
  return (
    <View style={{ transform: [{ rotate: '-8deg' }] }}>
      <Svg width={width} height={h} viewBox="0 0 34 64" fill="none">
        <Path
          d="M24 14v30a8 8 0 0 1-16 0V12a5 5 0 0 1 10 0v30a2.4 2.4 0 0 1-4.8 0V16"
          stroke={colors.clip}
          strokeWidth={3.4}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

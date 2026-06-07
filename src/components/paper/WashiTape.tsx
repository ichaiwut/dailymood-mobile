/**
 * A strip of washi tape — a tilted translucent band, used to "tape" sheets and
 * headers onto the desk. Decorative only.
 */
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface WashiTapeProps {
  color?: string;
  width?: number;
  rotate?: number;
  style?: ViewStyle;
}

export function WashiTape({ color, width = 96, rotate = -4, style }: WashiTapeProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          width,
          height: 26,
          backgroundColor: color ?? colors.washi,
          opacity: 0.9,
          transform: [{ rotate: `${rotate}deg` }],
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
}

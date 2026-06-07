/**
 * Animated loading placeholder — a softly pulsing block. Respects reduced
 * motion (stays static). Replaces bare spinners for a calmer loading feel.
 */
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useReducedMotion,
  type AnimatedStyle,
} from 'react-native-reanimated';
import type { DimensionValue, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function Skeleton({
  width = '100%',
  height = 16,
  radius,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const { colors, radius: r } = useTheme();
  const opacity = useSharedValue(0.5);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!reduceMotion) {
      opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    }
  }, [reduceMotion, opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value })) as AnimatedStyle<ViewStyle>;

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius ?? r.sm, backgroundColor: colors.surface2 },
        animated,
        style,
      ]}
    />
  );
}

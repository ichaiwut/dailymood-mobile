/**
 * Scroll-reveal wrapper — fades + slides its content up as it scrolls into view
 * (the signature motion of the Year Story page). Driven by the parent scroll
 * position (a Reanimated shared value) rather than `entering`, because Reanimated
 * `entering` animations swallow press events on web (see Appear.tsx).
 *
 * Mirrors the web spec: start opacity 0 / translateY 24, reveal once when the
 * element's top crosses `viewport - 60px`, 0.7s cubic-bezier(.16,1,.3,1).
 * Respects reduce-motion (renders shown immediately, no animation).
 */
import type { ReactNode } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

export function Reveal({
  children,
  scrollY,
  vh,
  style,
}: {
  children: ReactNode;
  scrollY: SharedValue<number>;
  vh: number;
  style?: ViewStyle;
}) {
  const reduce = useReducedMotion();
  const top = useSharedValue(Number.MAX_SAFE_INTEGER);
  const p = useSharedValue(reduce ? 1 : 0);

  useAnimatedReaction(
    () => scrollY.value + vh - 60 >= top.value,
    (inView) => {
      if (inView && p.value === 0) {
        p.value = withTiming(1, { duration: 700, easing: EASE });
      }
    },
    [vh],
  );

  const aStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 24 }],
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    top.value = e.nativeEvent.layout.y;
  };

  return (
    <Animated.View onLayout={onLayout} style={[style, aStyle]}>
      {children}
    </Animated.View>
  );
}

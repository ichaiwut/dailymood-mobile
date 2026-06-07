/**
 * Entrance wrapper — fades + slides content up on mount. Used to stagger
 * dashboard sections and cards. Reanimated handles reduced-motion internally.
 */
import type { ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';

export function Appear({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(320).delay(delay)} style={style}>
      {children}
    </Animated.View>
  );
}

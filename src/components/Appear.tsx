/**
 * Entrance wrapper — fades + slides content up on mount. Used to stagger
 * dashboard sections and cards. Reanimated handles reduced-motion internally.
 *
 * On web we skip the entering animation: Reanimated `entering` animations can
 * swallow press events on web (children Pressables stop firing), so we render a
 * plain View there. Native keeps the staggered entrance.
 */
import type { ReactNode } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function Appear({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  if (Platform.OS === 'web') {
    return <View style={style}>{children}</View>;
  }
  return (
    <Animated.View entering={FadeInDown.duration(320).delay(delay)} style={style}>
      {children}
    </Animated.View>
  );
}

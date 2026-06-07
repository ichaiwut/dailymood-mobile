/**
 * Screen wrapper: themed background + safe-area padding. `scroll` wraps content
 * in a keyboard-aware ScrollView (used by form screens).
 */
import type { ReactNode } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

export function Screen({ children, scroll, contentStyle }: ScreenProps) {
  const { colors, space } = useTheme();
  const insets = useSafeAreaInsets();

  const padding: ViewStyle = {
    paddingTop: insets.top + space.lg,
    paddingBottom: insets.bottom + space.lg,
    paddingHorizontal: space.xl,
  };

  if (scroll) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[padding, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, padding, contentStyle]}>{children}</View>
  );
}

/**
 * A sheet of paper: rounded surface with a chunky offset shadow — the core
 * Paper Desk surface. `tab` renders a folder-tab label on the top-left.
 */
import type { ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../Text';

export interface PaperSheetProps {
  children: ReactNode;
  tab?: string;
  tabColor?: string;
  style?: ViewStyle;
  /** Slight rotation in degrees for the scrapbook feel. */
  rotate?: number;
}

export function PaperSheet({ children, tab, tabColor, style, rotate = 0 }: PaperSheetProps) {
  const { colors, radius, space } = useTheme();
  return (
    <View style={[rotate ? { transform: [{ rotate: `${rotate}deg` }] } : null, style]}>
      {tab ? (
        <View
          style={[
            styles.tab,
            {
              backgroundColor: tabColor ?? colors.primary,
              borderTopLeftRadius: radius.md,
              borderTopRightRadius: radius.md,
              paddingHorizontal: space.lg,
            },
          ]}
        >
          <Text variant="eyebrow" color="#fff">
            {tab}
          </Text>
        </View>
      ) : null}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderTopLeftRadius: tab ? 0 : radius.lg,
          padding: space.xl,
          borderWidth: 1,
          borderColor: colors.hairline,
          // chunky offset shadow
          shadowColor: colors.paperShadow,
          shadowOffset: { width: 6, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 6,
        }}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
});

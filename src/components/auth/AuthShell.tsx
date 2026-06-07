/**
 * Shared auth layout: the DailyMood brand mark + a washi-taped paper "sign-in
 * slip" sheet that holds the form. Keeps all auth screens visually consistent.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Screen } from '../Screen';
import { Text } from '../Text';
import { PaperSheet } from '../paper/PaperSheet';
import { WashiTape } from '../paper/WashiTape';
import { useTheme } from '../../theme/ThemeProvider';

export interface AuthShellProps {
  tab: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthShell({ tab, title, subtitle, children }: AuthShellProps) {
  const { colors, space, brand } = useTheme();
  return (
    <Screen scroll contentStyle={{ justifyContent: 'center', flexGrow: 1, gap: space.xl }}>
      <View style={{ alignItems: 'center', gap: space.xs }}>
        <Text variant="display" color={colors.primary}>
          DailyMood
        </Text>
      </View>

      <View>
        <View style={{ alignItems: 'center', marginBottom: -13, zIndex: 1 }}>
          <WashiTape color={brand.peach + '99'} rotate={-5} />
        </View>
        <PaperSheet tab={tab}>
          <View style={{ gap: space.md }}>
            <Text variant="h2">{title}</Text>
            {subtitle ? (
              <Text variant="body" color={colors.ink2}>
                {subtitle}
              </Text>
            ) : null}
            <View style={{ gap: space.lg, marginTop: space.sm }}>{children}</View>
          </View>
        </PaperSheet>
      </View>
    </Screen>
  );
}

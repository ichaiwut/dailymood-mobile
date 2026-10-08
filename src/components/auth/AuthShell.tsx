/**
 * Shared auth layout: the DailyMood brand mark + a washi-taped paper "sign-in
 * slip" sheet that holds the form. Keeps all auth screens visually consistent.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Screen } from '../Screen';
import { Text } from '../Text';
import { BrandLogo } from '../BrandLogo';
import { PaperSheet } from '../paper/PaperSheet';
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
        <BrandLogo variant="wordmark" width={220} />
      </View>

      {/* The tape is PaperSheet's own, not a sibling above it: a sibling is laid
          out against the folder tab, which stands ~30px proud of the paper, so
          the strip floated on the desk instead of holding the slip down. */}
      <PaperSheet tab={tab} washi washiColor={brand.peach + '99'}>
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
    </Screen>
  );
}

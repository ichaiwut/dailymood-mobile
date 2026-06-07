/**
 * Placeholder for milestones not yet built (M3+). Keeps navigation complete
 * while signalling what's coming.
 */
import { View } from 'react-native';
import { Screen } from './Screen';
import { Text } from './Text';
import { PaperSheet } from './paper/PaperSheet';
import { useTheme } from '../theme/ThemeProvider';

export function ComingSoon({ title, milestone }: { title: string; milestone: string }) {
  const { colors, space } = useTheme();
  return (
    <Screen contentStyle={{ justifyContent: 'center', gap: space.lg }}>
      <PaperSheet tab={title} rotate={-1}>
        <View style={{ gap: space.sm }}>
          <Text variant="title">{title}</Text>
          <Text variant="body" color={colors.ink2}>
            {milestone}
          </Text>
        </View>
      </PaperSheet>
    </Screen>
  );
}

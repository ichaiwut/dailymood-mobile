/**
 * Inline notice banner for errors / info messages. Never shows raw API codes —
 * callers pass already-localized copy.
 */
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export function Notice({ message, tone = 'info' }: { message: string; tone?: 'info' | 'error' }) {
  const { colors, radius, space } = useTheme();
  const isError = tone === 'error';
  return (
    <View
      style={{
        backgroundColor: isError ? colors.dangerBg : colors.surface2,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: isError ? colors.danger : colors.hairline2,
        paddingVertical: space.md,
        paddingHorizontal: space.lg,
      }}
    >
      <Text variant="label" weight="medium" color={isError ? colors.danger : colors.ink2}>
        {message}
      </Text>
    </View>
  );
}

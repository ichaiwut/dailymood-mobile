/**
 * Chunky offset-shadow button (Paper Desk). Variants:
 *   - primary: peach fill (the main CTA)
 *   - ink: dark fill
 *   - paper: white/outline (used for Google/secondary)
 */
import { Pressable, ActivityIndicator, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type Variant = 'primary' | 'ink' | 'paper';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  /** Optional leading element (e.g. a Google glyph). */
  leading?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  leading,
  style,
}: ButtonProps) {
  const { colors, radius, space } = useTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary' ? colors.accent : variant === 'ink' ? colors.ink : colors.surface;
  const fg = variant === 'paper' ? colors.ink : '#fff';
  const border = variant === 'paper' ? colors.hairline2 : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: border,
          paddingVertical: 16,
          paddingHorizontal: space.xl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space.sm,
          opacity: isDisabled ? 0.55 : 1,
          shadowColor: colors.paperShadow,
          shadowOffset: { width: 0, height: pressed ? 1 : 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: pressed ? 1 : 4,
          transform: [{ translateY: pressed ? 3 : 0 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {leading ? <View>{leading}</View> : null}
          <Text variant="label" color={fg}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

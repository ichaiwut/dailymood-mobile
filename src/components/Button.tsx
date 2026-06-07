/**
 * Chunky offset-shadow button (Paper Desk signature). Variants:
 *   - primary: peach fill + peach hard-shadow (main CTA)
 *   - ink: dark fill + black hard-shadow
 *   - paper: white fill + warm hard-shadow (secondary / Google)
 *   - ghost: outline
 * Pressing settles the button down (translateY).
 */
import { Pressable, ActivityIndicator, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type Variant = 'primary' | 'ink' | 'paper' | 'ghost';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
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
  const { colors, shadow, brand } = useTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary'
      ? brand.peach
      : variant === 'ink'
        ? colors.ink
        : variant === 'paper'
          ? colors.surface
          : 'transparent';
  const fg = variant === 'primary' || variant === 'ink' ? '#fff' : colors.ink;
  const boxShadow =
    variant === 'primary'
      ? shadow.btnPeach
      : variant === 'ink'
        ? shadow.btnInk
        : variant === 'paper'
          ? shadow.btnWhite
          : undefined;
  const border = variant === 'ghost' ? colors.ink : variant === 'paper' ? colors.hairline : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: 14,
          borderWidth: variant === 'ghost' || variant === 'paper' ? 2 : 0,
          borderColor: border,
          height: 54,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          opacity: isDisabled ? 0.5 : 1,
          boxShadow: pressed ? undefined : boxShadow,
          transform: [{ translateY: pressed ? 2 : 0 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {leading ? <View>{leading}</View> : null}
          <Text variant="label" weight="extrabold" color={fg}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

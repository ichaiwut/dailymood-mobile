/**
 * Paper input field with a label and optional error line. Body text is ≥16px,
 * comfortably above the 14px floor.
 */
import { forwardRef } from 'react';
import { View, TextInput, type TextInputProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { urbanist } from '../theme/typography';
import { Text } from './Text';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, style, ...rest },
  ref,
) {
  const { colors, radius, space } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text variant="label" color={colors.ink2}>
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.ink3}
        style={[
          {
            backgroundColor: colors.surface2,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderColor: error ? colors.danger : colors.hairline2,
            paddingVertical: 14,
            paddingHorizontal: space.lg,
            fontFamily: urbanist.medium,
            fontSize: 16,
            color: colors.ink,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="label" color={colors.danger}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

/** Small square paper button holding a UI glyph (mic / camera / location). */
import type { ReactNode } from 'react';
import { Pressable, View, Text as RNText } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export function PaperIconButton({
  icon,
  onPress,
  badge,
  dim,
}: {
  icon: ReactNode;
  onPress: () => void;
  /** Small corner badge (e.g. "PRO" on the gated photo button). */
  badge?: string;
  /** Render at reduced opacity (gated feature teaser — never hidden). */
  dim?: boolean;
}) {
  const { colors, radius, brand } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        width: 46,
        height: 46,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.hairline2,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px -7px rgba(60,40,20,0.30)',
        opacity: dim ? 0.55 : 1,
      }}
    >
      {icon}
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            backgroundColor: brand.purpleStrong,
            borderRadius: 999,
            paddingHorizontal: 5,
            paddingVertical: 1,
          }}
        >
          <RNText style={{ fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.4 }}>
            {badge}
          </RNText>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Small square paper button holding an emoji glyph (mic / camera / location). */
import { Pressable, View, Text as RNText } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '../../theme/ThemeProvider';

export function PaperIconButton({
  glyph,
  onPress,
  badge,
  dim,
}: {
  glyph: string;
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
      <Text style={{ fontSize: 18 }}>{glyph}</Text>
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

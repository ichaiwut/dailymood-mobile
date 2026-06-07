/** Small square paper button holding an emoji glyph (mic / camera / location). */
import { Pressable } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '../../theme/ThemeProvider';

export function PaperIconButton({ glyph, onPress }: { glyph: string; onPress: () => void }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        width: 46,
        height: 46,
        borderRadius: radius.md,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.hairline2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 18 }}>{glyph}</Text>
    </Pressable>
  );
}

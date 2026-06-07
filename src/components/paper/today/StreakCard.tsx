/**
 * Streak card — big number + 14 day bars + 🔥, washi-taped (handover design).
 */
import { View } from 'react-native';
import { Text } from '../../Text';
import { WashiTape } from '../WashiTape';
import { useTheme } from '../../../theme/ThemeProvider';

export function StreakCard({ streak }: { streak: number }) {
  const { colors, radius, space, brand } = useTheme();
  const bars = Array.from({ length: 14 }, (_, i) => i < Math.min(streak, 14));

  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: -12, zIndex: 1 }}>
        <WashiTape color={brand.peach + '99'} rotate={-4} width={80} />
      </View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.hairline,
          padding: space.xl,
          gap: space.md,
          shadowColor: colors.paperShadow,
          shadowOffset: { width: 6, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 6,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Text style={{ fontSize: 44, fontFamily: 'Urbanist_800ExtraBold', color: colors.ink }}>
            {streak}
          </Text>
          <Text style={{ fontSize: 28 }}>🔥</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {bars.map((on, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 3,
                backgroundColor: on ? brand.peach : colors.surface2,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

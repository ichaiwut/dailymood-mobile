/**
 * 7-bar mini chart used inside pattern cards (one bar per day of the week).
 * Bar colour by value: ≥4 mint / ≥3 yellow / else soft red. Values are 1–5ish.
 */
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { useTheme } from '../../../theme/ThemeProvider';

const DAYS_TH = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
const DAYS_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const H = 56;

export function MoodBarChart({ data }: { data: number[] }) {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const labels = i18n.language === 'th' ? DAYS_TH : DAYS_EN;
  const max = Math.max(5, ...data);
  const color = (v: number) => (v >= 4 ? '#85ECCB' : v >= 3 ? '#FDCB56' : '#FEAD8D');

  return (
    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'flex-end' }}>
      {data.slice(0, 7).map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <View style={{ height: H, width: '100%', justifyContent: 'flex-end' }}>
            <View style={{ height: Math.max(4, (v / max) * H), borderRadius: 5, backgroundColor: v > 0 ? color(v) : colors.surface2 }} />
          </View>
          <Text variant="label" color={colors.ink3} style={{ fontSize: 14 }}>{labels[i] ?? ''}</Text>
        </View>
      ))}
    </View>
  );
}

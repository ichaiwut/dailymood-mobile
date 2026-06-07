/**
 * Today empty state — a washi-taped paper sheet with a floating mood sticker
 * and a soft, non-demanding CTA that opens the Smart Log sheet.
 */
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { Button } from '../../Button';
import { PASticker } from '../PASticker';
import { WashiTape } from '../WashiTape';
import { useTheme } from '../../../theme/ThemeProvider';
import { useSmartLog } from '../smartlog/SmartLogProvider';
import { useMoods } from '../../../hooks/queries';
import { findMood } from '../../../lib/mood';

export function EmptyToday() {
  const { t } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const smartLog = useSmartLog();
  const moods = useMoods();
  // a calm/happy face for the empty state
  const happy = findMood(moods.data, 'happy') ?? moods.data?.[0];

  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: -12, zIndex: 1 }}>
        <WashiTape color={brand.lavender + 'CC'} rotate={-3} />
      </View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.hairline,
          padding: space.x2,
          alignItems: 'center',
          gap: space.md,
          shadowColor: colors.paperShadow,
          shadowOffset: { width: 6, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 6,
        }}
      >
        <PASticker
          color={happy?.color ?? brand.mint}
          emoji={happy?.emoji ?? '🙂'}
          size={64}
          halo
        />
        <Text variant="title" center>
          {t('today.emptyTitle')}
        </Text>
        <Text variant="body" center color={colors.ink2}>
          {t('today.emptyBody')}
        </Text>
        <Button label={t('today.emptyAction')} onPress={() => smartLog.open()} style={{ marginTop: space.sm }} />
      </View>
    </View>
  );
}

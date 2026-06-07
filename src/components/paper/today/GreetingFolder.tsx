/**
 * Greeting folder — a date-tab paper folder with a paperclip, the time-of-day
 * greeting, the highlighted "how are you feeling?" question, and the mood grid
 * (circular sticker discs). Tapping a mood opens Smart Log preselected.
 */
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { MarkSentence } from '../../Mark';
import { MoodPicker } from '../../MoodPicker';
import { PAClip } from '../PAClip';
import { useTheme } from '../../../theme/ThemeProvider';
import { useMoods } from '../../../hooks/queries';
import { useSmartLog } from '../smartlog/SmartLogProvider';
import { greetingKey } from '../../../lib/time';
import { APP_TIMEZONE } from '../../../config';

function todayLabel(locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      timeZone: APP_TIMEZONE,
    }).format(new Date());
  } catch {
    return '';
  }
}

export function GreetingFolder() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space } = useTheme();
  const moods = useMoods();
  const smartLog = useSmartLog();

  return (
    <View>
      {/* folder tab */}
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: colors.primary,
          borderTopLeftRadius: radius.md,
          borderTopRightRadius: radius.md,
          paddingHorizontal: space.lg,
          paddingVertical: 6,
          marginBottom: -2,
        }}
      >
        <Text variant="eyebrow" color="#fff">{todayLabel(i18n.language)}</Text>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: 0,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.hairline,
          padding: space.xl,
          gap: space.lg,
          shadowColor: colors.paperShadow,
          shadowOffset: { width: 6, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 6,
        }}
      >
        {/* paperclip overhang */}
        <View style={{ position: 'absolute', right: 18, top: -14 }}>
          <PAClip />
        </View>

        <View style={{ gap: 4 }}>
          <Text variant="label" weight="bold" color={colors.primary}>
            {t(`today.${greetingKey()}`)}
          </Text>
          <MarkSentence pre={t('today.qPre')} mark={t('today.qMark')} post={t('today.qPost')} />
        </View>

        <MoodPicker
          layout="grid"
          moods={moods.data ?? []}
          onSelect={(m) => smartLog.open({ moodId: m.id })}
        />
      </View>
    </View>
  );
}

/**
 * Greeting folder — date-tab folder with a paperclip, the time-of-day greeting,
 * the highlighted "how are you feeling?" question, and the mood disc grid.
 * Tapping a mood opens Smart Log preselected.
 */
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { MarkSentence } from '../../Mark';
import { MoodPicker } from '../../MoodPicker';
import { PaperSheet } from '../PaperSheet';
import { useTheme } from '../../../theme/ThemeProvider';
import { useMoods, useProfile } from '../../../hooks/queries';
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
  const { colors, space } = useTheme();
  const moods = useMoods();
  const profile = useProfile();
  const smartLog = useSmartLog();

  return (
    <PaperSheet tab={todayLabel(i18n.language)} clip clipSide="right">
      <View style={{ gap: space.lg }}>
        <View style={{ gap: 6 }}>
          <Text variant="label" weight="bold" color={colors.primary}>
            {t(`today.${greetingKey()}`)}
          </Text>
          <MarkSentence pre={t('today.qPre')} mark={t('today.qMark')} post={t('today.qPost')} />
        </View>

        <MoodPicker
          layout="grid"
          moods={moods.data ?? []}
          pack={profile.data?.user.moodPack}
          onSelect={(m) => smartLog.open({ moodId: m.id })}
        />
      </View>
    </PaperSheet>
  );
}

/**
 * Greeting folder — a date-tab paper folder with the greeting and the mood
 * picker. Tapping a mood opens the Smart Log sheet with that mood preselected.
 */
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { MoodPicker } from '../../MoodPicker';
import { useTheme } from '../../../theme/ThemeProvider';
import { useMoods } from '../../../hooks/queries';
import { useSmartLog } from '../smartlog/SmartLogProvider';
import { APP_TIMEZONE } from '../../../config';

function todayLabel(locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: APP_TIMEZONE,
    }).format(new Date());
  } catch {
    return '';
  }
}

export function GreetingFolder({ name }: { name?: string | null }) {
  const { t, i18n } = useTranslation();
  const { colors, radius, space } = useTheme();
  const moods = useMoods();
  const smartLog = useSmartLog();

  return (
    <View>
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
        <Text variant="eyebrow" color="#fff">
          {todayLabel(i18n.language)}
        </Text>
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
        <Text variant="h2">
          {name ? `${t('today.greeting').replace(/[?？]/, '')}, ${name}?` : t('today.greeting')}
        </Text>
        <MoodPicker
          moods={moods.data ?? []}
          onSelect={(m) => smartLog.open(m.id)}
        />
      </View>
    </View>
  );
}

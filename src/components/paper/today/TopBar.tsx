/**
 * Today top bar — avatar (initials), date + time-of-day greeting with name, and
 * a menu button that opens the profile tab. Mirrors the web header.
 */
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { useTheme } from '../../../theme/ThemeProvider';
import { initials } from '../../../lib/avatar';
import { greetingKey } from '../../../lib/time';
import { APP_TIMEZONE } from '../../../config';

function dateLabel(locale: string): string {
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

export function TopBar({ name, email, accent }: { name?: string | null; email?: string; accent?: string }) {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const router = useRouter();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <Pressable
        onPress={() => router.push('/(tabs)/profile')}
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          backgroundColor: accent || brand.purple,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant="label" weight="extrabold" color="#fff">{initials(name, email)}</Text>
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text variant="label" weight="medium" color={colors.ink3} numberOfLines={1}>
          {dateLabel(i18n.language)}
        </Text>
        <Text variant="body" weight="extrabold" numberOfLines={1} ellipsizeMode="tail">
          {t(`today.${greetingKey()}`)}{name ? `, ${name}` : ''}
        </Text>
      </View>
    </View>
  );
}

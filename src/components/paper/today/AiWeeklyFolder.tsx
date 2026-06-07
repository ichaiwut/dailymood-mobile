/**
 * "✦ AI · สัปดาห์นี้" — dark plum folder on the Today screen. Always shown (never
 * hidden behind a premium check): premium sees the cached weekly summary, free
 * sees a teaser + PRO badge. Ported from web ai-weekly-folder.
 */
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Text } from '../../Text';
import { SparkleIcon } from '../../icons/Glyphs';
import { useTheme } from '../../../theme/ThemeProvider';
import { useInsights } from '../../../hooks/queries';
import { stripBold } from '../../../lib/text';

export function AiWeeklyFolder() {
  const { t } = useTranslation();
  const { colors, radius, space } = useTheme();
  const router = useRouter();
  const insights = useInsights();
  const data = insights.data;
  const premium = data?.tier === 'premium';

  const body = premium
    ? stripBold(data?.summary) || data?.headline || t('insights.weeklyTeaser')
    : data?.previewHeadline || data?.headline || t('insights.weeklyTeaser');

  return (
    <View>
      {/* folder tab */}
      <View
        style={{
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: colors.plum,
          borderTopLeftRadius: radius.md,
          borderTopRightRadius: radius.md,
          paddingHorizontal: space.lg,
          paddingTop: 8,
          paddingBottom: 11,
          marginBottom: -2,
          zIndex: 1,
        }}
      >
        <SparkleIcon size={13} color="#fff" />
        <Text variant="label" weight="bold" color="#fff">
          {t('insights.weeklyTab')}
        </Text>
      </View>

      {/* dark sheet */}
      <View
        style={{
          backgroundColor: colors.plum,
          borderTopLeftRadius: 4,
          borderTopRightRadius: radius.lg,
          borderBottomLeftRadius: radius.lg,
          borderBottomRightRadius: radius.lg,
          padding: space.xl,
          gap: space.lg,
          overflow: 'hidden',
        }}
      >
        {!premium ? (
          <View
            style={{
              position: 'absolute',
              top: 16,
              right: 18,
              backgroundColor: 'rgba(255,255,255,0.16)',
              borderRadius: 100,
              paddingHorizontal: 9,
              paddingVertical: 3,
            }}
          >
            <Text variant="label" weight="bold" color="#fff" style={{ fontSize: 14 }}>
              PRO
            </Text>
          </View>
        ) : null}

        <Text variant="body" color="rgba(255,255,255,0.92)" numberOfLines={3} style={{ maxWidth: '88%' }}>
          {body}
        </Text>

        <Pressable
          onPress={() => router.push(premium ? '/insights' : '/profile/subscription')}
          style={{
            alignSelf: 'flex-start',
            backgroundColor: colors.surface,
            borderRadius: 11,
            paddingHorizontal: 18,
            paddingVertical: 11,
            boxShadow: '0 5px 0 -1px rgba(255,255,255,0.35)',
          }}
        >
          <Text variant="label" weight="bold">
            {premium ? t('insights.weeklyOpen') : t('insights.weeklyUpgrade')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

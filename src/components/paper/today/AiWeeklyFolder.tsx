/**
 * "✦ AI · สัปดาห์นี้" — dark plum folder on the Today screen. Always shown (never
 * hidden behind a premium check): premium sees the cached weekly summary, free
 * sees a teaser + PRO badge. Ported from web ai-weekly-folder (plum gradient +
 * peach corner glow).
 */
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Text } from '../../Text';
import { SparkleIcon } from '../../icons/Glyphs';
import { useTheme } from '../../../theme/ThemeProvider';
import { useInsights, useProfile } from '../../../hooks/queries';
import { stripBold } from '../../../lib/text';

export function AiWeeklyFolder() {
  const { t } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const router = useRouter();
  const insights = useInsights();
  const profile = useProfile();
  const data = insights.data;

  // Deliberately not `data.tier`: /api/insights leaves it out whenever it has no
  // summary to hand over (no entries at all, or fewer than seven), and it is of
  // course absent while the request is still in flight. Reading the tier from
  // there made a paying user look free and offered to sell them Pro a second
  // time. The profile carries it unconditionally, and Today has already fetched
  // it, so this costs no extra request.
  const premium = profile.data?.user.isPremium === true;

  const summary = stripBold(
    premium
      ? data?.summary || data?.headline
      : data?.previewHeadline || data?.headline,
  );

  // With nothing to show, a subscriber gets the reason rather than a pitch for
  // what they already bought. Free users keep the pitch in every case: telling
  // them to log a few more days would be a lie when the days alone can't
  // unlock it.
  const body =
    summary ||
    (premium && data?.empty
      ? t('insights.emptyBody')
      : premium && data?.tooFewEntries
        ? t('insights.tooFewBody')
        : t('insights.weeklyTeaser'));

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

      {/* dark sheet — plum gradient (155°) + peach corner glow */}
      <LinearGradient
        colors={[colors.plum2, colors.plum]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{
          borderTopLeftRadius: 4,
          borderTopRightRadius: radius.lg,
          borderBottomLeftRadius: radius.lg,
          borderBottomRightRadius: radius.lg,
          padding: space.xl,
          gap: space.lg,
          overflow: 'hidden',
        }}
      >
        {/* peach glow, top-right */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: brand.peach,
            opacity: 0.22,
          }}
        />

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
      </LinearGradient>
    </View>
  );
}

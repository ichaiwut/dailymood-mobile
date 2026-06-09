/**
 * Shared shell for the two Profile article lists — Saved Articles (♥) and Article
 * Reactions (💭). ~90% identical "clipping" cards (tilted paper held by a
 * paperclip, white-framed cover or generative ArticleArt); the reactions variant
 * adds a PASticker mood stamp on the cover + a mood pill in the footer.
 * Cards open the article on the web (in-app article reader isn't built).
 */
import { View, Pressable, Image, ActivityIndicator, Linking } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGrad, Stop, Rect, Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../Screen';
import { Text } from '../../Text';
import { Notice } from '../../Notice';
import { Button } from '../../Button';
import { PAClip } from '../PAClip';
import { WashiTape } from '../WashiTape';
import { PASticker } from '../PASticker';
import { MoodFace, faceForMood } from '../MoodFace';
import { useTheme } from '../../../theme/ThemeProvider';
import { useBookmarks, useReactions, useMoods } from '../../../hooks/queries';
import { useGoBack } from '../../../hooks/useGoBack';
import { findMood, moodLabel } from '../../../lib/mood';
import { API_BASE_URL } from '../../../config';
import { errorMessageKey } from '../../../api/errors';
import type { ArticleItem, Mood } from '../../../api/types';

const TILT = [-0.6, 0.5, -0.4, 0.7, -0.5];
const TONES: Record<string, string> = {
  calm: '#85ECCB', energy: '#FCA45B', focus: '#A673F1', rest: '#9ACDE2',
  growth: '#FDCB56', joy: '#FEAD8D', love: '#D4BEE4', sad: '#9ACDE2',
};
const toneHue = (tone: string) => TONES[tone] ?? '#A673F1';
const toneBg = (tone: string) => toneHue(tone) + '22';

/** Generative cover artwork when an article has no cover image. */
function ArticleArt({ tone, size = 96 }: { tone: string; size?: number }) {
  const hue = toneHue(tone);
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Defs>
        <SvgGrad id={`art-${tone}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={hue} stopOpacity="0.9" />
          <Stop offset="1" stopColor={hue} stopOpacity="0.45" />
        </SvgGrad>
      </Defs>
      <Rect width="96" height="96" rx="12" fill={`url(#art-${tone})`} />
      <Circle cx="30" cy="34" r="22" fill="#fff" opacity="0.18" />
      <Circle cx="70" cy="66" r="30" fill="#fff" opacity="0.14" />
    </Svg>
  );
}

export function ArticleClippings({ variant }: { variant: 'saved' | 'reactions' }) {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const goBack = useGoBack('/(tabs)/profile');
  const th = i18n.language === 'th';

  const bookmarks = useBookmarks();
  const reactions = useReactions();
  const moods = useMoods();
  const q = variant === 'saved' ? bookmarks : reactions;
  const items = q.data?.articles ?? [];

  const eyebrowIcon = variant === 'saved' ? '📎' : '💭';
  const markColor = variant === 'saved' ? brand.peach : brand.lavender;
  const open = (slug: string) => Linking.openURL(`${API_BASE_URL}/articles/${slug}`).catch(() => {});

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 80, maxWidth: 720, alignSelf: 'center', width: '100%' }}>
      <Pressable onPress={goBack} hitSlop={10} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', boxShadow: shadow.sm }}>
        <Text weight="bold" style={{ fontSize: 22, lineHeight: 26, color: colors.ink2 }}>‹</Text>
      </Pressable>

      <View style={{ gap: space.xs }}>
        <Text variant="label" weight="bold" color={colors.ink3} style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {eyebrowIcon} {t(variant === 'saved' ? 'articles.savedEyebrow' : 'articles.reactEyebrow')}
        </Text>
        <Text variant="h1">
          {t(variant === 'saved' ? 'articles.savedTitlePre' : 'articles.reactTitlePre')}{' '}
          <Text variant="h1" style={{ backgroundColor: markColor + '99' }}> {t(variant === 'saved' ? 'articles.savedTitleMark' : 'articles.reactTitleMark')} </Text>
        </Text>
        <Text variant="label" color={colors.ink2}>
          {t(variant === 'saved' ? 'articles.savedSub' : 'articles.reactSub')}
          {items.length ? <Text variant="label" color={colors.ink3}> {t('articles.count', { n: items.length })}</Text> : null}
        </Text>
      </View>

      {q.isLoading ? (
        <View style={{ gap: 18 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 16, backgroundColor: colors.surface, borderRadius: 18, padding: 16, opacity: 0.6, transform: [{ rotate: `${TILT[i % TILT.length]}deg` }] }}>
              <View style={{ width: 96, height: 96, borderRadius: 12, backgroundColor: colors.surface2 }} />
              <View style={{ flex: 1, gap: 8, paddingTop: 6 }}>
                <View style={{ height: 14, borderRadius: 7, backgroundColor: colors.surface2, width: '70%' }} />
                <View style={{ height: 12, borderRadius: 6, backgroundColor: colors.surface2 }} />
                <View style={{ height: 12, borderRadius: 6, backgroundColor: colors.surface2, width: '85%' }} />
              </View>
            </View>
          ))}
        </View>
      ) : q.isError ? (
        <Notice message={t(errorMessageKey(q.error))} tone="error" />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={{ gap: 18 }}>
          {items.map((a, i) => (
            <ClippingCard key={a.slug} a={a} tilt={TILT[i % TILT.length]} />
          ))}
        </View>
      )}
    </Screen>
  );

  function ClippingCard({ a, tilt }: { a: ArticleItem; tilt: number }) {
    const title = th ? a.titleTh : a.titleEn;
    const excerpt = th ? a.excerptTh : a.excerptEn;
    const category = th ? a.categoryLabelTh : a.categoryLabelEn;
    const mood: Mood | undefined = variant === 'reactions' ? findMood(moods.data, a.moodTypeId) : undefined;
    return (
      <Pressable
        onPress={() => open(a.slug)}
        style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: 18, paddingVertical: 16, paddingLeft: 16, paddingRight: 18, boxShadow: shadow.md, overflow: 'visible', transform: [{ rotate: `${tilt}deg` }] }}
      >
        <View style={{ position: 'absolute', top: -16, left: 30, zIndex: 6 }}><PAClip width={30} /></View>

        {/* cover */}
        <View style={{ width: 96, height: 96 }}>
          <View style={{ width: 96, height: 96, borderRadius: 12, borderWidth: 3, borderColor: '#fff', overflow: 'hidden', boxShadow: shadow.sm }}>
            {a.coverImageUrl ? <Image source={{ uri: a.coverImageUrl }} style={{ width: '100%', height: '100%' }} /> : <ArticleArt tone={a.tone} />}
          </View>
          {mood ? (
            <View style={{ position: 'absolute', bottom: -10, right: -10 }}>
              <PASticker color={mood.color} moodId={mood.id} size={42} />
            </View>
          ) : null}
        </View>

        {/* body */}
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          {category ? (
            <View style={{ alignSelf: 'flex-start', backgroundColor: toneBg(a.tone), borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text variant="label" weight="bold" style={{ color: toneHue(a.tone), textTransform: 'uppercase', fontSize: 14 }}>{category}</Text>
            </View>
          ) : null}
          <Text variant="title" numberOfLines={2}>{title}</Text>
          <Text variant="label" color={colors.ink2} numberOfLines={2} style={{ lineHeight: 20 }}>{excerpt}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              {mood ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: mood.color + '2E', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <MoodFace face={faceForMood(mood.id)} size={20} />
                  <Text variant="label" weight="bold" style={{ fontSize: 14 }}>{moodLabel(mood, i18n.language)}</Text>
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface2, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ fontSize: 13 }}>⏱</Text>
                <Text variant="label" color={colors.ink3}>{t('articles.minutes', { n: a.readingTimeMinutes })}</Text>
              </View>
            </View>
            <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('articles.readMore')}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  function EmptyState() {
    return (
      <View>
        <View style={{ position: 'absolute', top: -12, alignSelf: 'center', left: 0, right: 0, alignItems: 'center', zIndex: 6 }}>
          <WashiTape color={(variant === 'saved' ? brand.lavender : brand.mint) + 'C0'} width={104} rotate={-3} />
        </View>
        <View style={{ backgroundColor: colors.surface, ...sheetRadius, padding: space.x2, alignItems: 'center', gap: space.md, boxShadow: shadow.md }}>
          {variant === 'saved' ? <Text style={{ fontSize: 48 }}>🔖</Text> : <PASticker color={brand.mint} face="good" size={68} />}
          <Text variant="h2" center>{t(variant === 'saved' ? 'articles.savedEmptyTitle' : 'articles.reactEmptyTitle')}</Text>
          <Text variant="body" color={colors.ink2} center>{t(variant === 'saved' ? 'articles.savedEmptyBody' : 'articles.reactEmptyBody')}</Text>
          <Button variant="purple" label={t('articles.goRead')} onPress={() => Linking.openURL(`${API_BASE_URL}/articles`).catch(() => {})} style={{ alignSelf: 'stretch', marginTop: space.sm }} />
        </View>
      </View>
    );
  }
}

/**
 * Weekly AI Insights (/insights). Hero summary + pattern cards + a suggestion
 * with feedback. Free tier sees the preview headline + a locked teaser (never
 * fully hidden). GET /api/insights, POST /api/insights/feedback.
 */
import { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '../src/components/Screen';
import { Text } from '../src/components/Text';
import { Notice } from '../src/components/Notice';
import { WashiTape } from '../src/components/paper/WashiTape';
import { useTheme } from '../src/theme/ThemeProvider';
import { useInsights, useInsightFeedback } from '../src/hooks/queries';
import { useToast } from '../src/components/Toast';
import { useGoBack } from '../src/hooks/useGoBack';
import { stripBold } from '../src/lib/text';
import { errorMessageKey } from '../src/api/errors';
import type { InsightPattern, InsightReaction } from '../src/api/types';

export default function InsightsScreen() {
  const { t } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const insights = useInsights();
  const feedback = useInsightFeedback();
  const toast = useToast();
  const goBack = useGoBack();
  const [reacted, setReacted] = useState<InsightReaction | null>(null);

  const d = insights.data;
  const premium = d?.tier === 'premium';

  const tagColor = (tag: string) =>
    tag === 'alert' ? colors.danger : tag === 'correlation' ? brand.purple : brand.peach;

  const react = async (r: InsightReaction) => {
    if (!d?.suggestion) return;
    setReacted(r);
    try {
      await feedback.mutateAsync({ weekKey: d.weekKey, suggestionTitle: d.suggestion.title, reaction: r });
      toast.show(t('insights.thanks'));
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 60 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable onPress={goBack} hitSlop={10}>
          <Text variant="title" color={colors.ink}>‹</Text>
        </Pressable>
        <Text variant="title">{t('insights.title')}</Text>
        <View style={{ width: 20 }} />
      </View>

      {insights.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
      ) : insights.isError ? (
        <Notice message={t(errorMessageKey(insights.error))} tone="error" />
      ) : d ? (
        <>
          {/* hero summary */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.hairline,
              padding: space.xl,
              gap: space.sm,
              shadowColor: colors.paperShadow,
              shadowOffset: { width: 6, height: 8 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 6,
            }}
          >
            <Text variant="eyebrow" color={colors.primary}>{t('insights.thisWeek')}</Text>
            <Text variant="h2">{premium ? d.headline : d.previewHeadline}</Text>
            <Text variant="body" color={colors.ink2}>
              {premium ? stripBold(d.summary) : stripBold(d.summary).split(/(?<=[.!?。])\s/)[0]}
            </Text>
          </View>

          {premium ? (
            <>
              {/* patterns */}
              {d.patterns.length > 0 ? (
                <View style={{ gap: space.md }}>
                  <Text variant="eyebrow">{t('insights.patterns')}</Text>
                  {d.patterns.map((p) => (
                    <PatternCard key={p.title} pattern={p} color={tagColor(p.tag)} />
                  ))}
                </View>
              ) : null}

              {/* suggestion + feedback */}
              {d.suggestion ? (
                <View>
                  <View style={{ marginLeft: space.lg, marginBottom: -10, zIndex: 1 }}>
                    <WashiTape color={brand.mint + 'CC'} rotate={-3} width={72} />
                  </View>
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: radius.lg,
                      borderWidth: 1,
                      borderColor: colors.hairline,
                      padding: space.lg,
                      gap: space.sm,
                    }}
                  >
                    <Text variant="eyebrow" color={colors.success}>{t('insights.suggestion')}</Text>
                    <Text variant="title">{d.suggestion.title}</Text>
                    <Text variant="body" color={colors.ink2}>{d.suggestion.description}</Text>
                    {reacted ? (
                      <Text variant="label" color={colors.success}>{t('insights.thanks')}</Text>
                    ) : (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.xs }}>
                        <Pill label={`👍 ${t('insights.helpful')}`} onPress={() => react('up')} />
                        <Pill label={`👎 ${t('insights.notHelpful')}`} onPress={() => react('down')} />
                        <Pill label={`✓ ${t('insights.addRoutine')}`} onPress={() => react('routine')} />
                      </View>
                    )}
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            /* free gate (never hidden) */
            <View
              style={{
                borderRadius: radius.lg,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: colors.hairline2,
                padding: space.xl,
                gap: space.sm,
              }}
            >
              <Text variant="label" color={colors.primary}>✦ PREMIUM</Text>
              <Text variant="title">{t('insights.lockedTitle')}</Text>
              <Text variant="body" color={colors.ink2}>{t('insights.lockedBody')}</Text>
            </View>
          )}

          <Text variant="label" color={colors.ink3} center>
            {t('insights.disclaimer')}
          </Text>
        </>
      ) : null}
    </Screen>
  );

  function PatternCard({ pattern, color }: { pattern: InsightPattern; color: string }) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.hairline,
          borderLeftWidth: 4,
          borderLeftColor: color,
          padding: space.lg,
          gap: 4,
        }}
      >
        <Text variant="label" weight="bold" color={color}>{pattern.title}</Text>
        <Text variant="body" color={colors.ink2}>{pattern.description}</Text>
      </View>
    );
  }

  function Pill({ label, onPress }: { label: string; onPress: () => void }) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: colors.surface2,
          borderRadius: radius.pill,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <Text variant="label" weight="medium" color={colors.ink2}>{label}</Text>
      </Pressable>
    );
  }
}

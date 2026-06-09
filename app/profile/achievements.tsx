/**
 * Achievements (/profile/achievements) — scrapbook sticker album. Left rail
 * (back, marker-highlight title, SVG progress ring, filter pills) + a sticker
 * grid where each badge tilts slightly (locked = flat) with washi (earned) /
 * paperclip (in-progress) / dashed border (locked). Tapping a badge opens a
 * detail sheet (share for earned). GET /api/profile/achievements auto-grants
 * completed badges, so a fresh load reflects new unlocks.
 */
import { useState } from 'react';
import { View, Pressable, ActivityIndicator, Share } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Notice } from '../../src/components/Notice';
import { BottomSheet } from '../../src/components/BottomSheet';
import { PAClip } from '../../src/components/paper/PAClip';
import { WashiTape } from '../../src/components/paper/WashiTape';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAchievements } from '../../src/hooks/queries';
import { useGoBack } from '../../src/hooks/useGoBack';
import { formatDateKey } from '../../src/lib/time';
import { errorMessageKey } from '../../src/api/errors';
import type { BadgeSummary } from '../../src/api/types';

type Filter = 'all' | 'earned' | 'in_progress' | 'locked';
const ROT = [-1.7, 1.2, -0.9, 1.6, -1.3, 0.8];
const RING = 160;
const R = 68;
const CIRC = 2 * Math.PI * R;

function washiFor(color: string, fallback: string) {
  if (color === '#A673F1') return '#D4BEE4';
  if (color === '#FDCB56') return '#FDCB56';
  if (color === '#85ECCB') return '#85ECCB';
  return fallback;
}

export default function AchievementsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const ach = useAchievements();
  const goBack = useGoBack('/(tabs)/profile');
  const [filter, setFilter] = useState<Filter>('all');
  const [sel, setSel] = useState<BadgeSummary | null>(null);

  const d = ach.data;
  const pct = d && d.total ? Math.round((d.earned / d.total) * 100) : 0;
  const arc = (pct / 100) * CIRC;
  const fmtDate = (iso: string | null) =>
    iso ? formatDateKey(iso.slice(0, 10), i18n.language, { weekday: undefined, day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const badges = (d?.badges ?? []).filter((b) => filter === 'all' || b.status === filter);
  const counts: Record<Filter, number> = {
    all: d?.total ?? 0,
    earned: d?.earned ?? 0,
    in_progress: d?.inProgress ?? 0,
    locked: d?.locked ?? 0,
  };

  const share = (b: BadgeSummary) => {
    Share.share({ message: `${t(`badges.${b.id}`)} — ${t('badges.earnedOn', { date: fmtDate(b.earnedAt) })}` }).catch(() => {});
  };

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 80 }}>
      {/* rail */}
      <Pressable onPress={goBack} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9, boxShadow: shadow.sm }}>
        <Text weight="bold" style={{ fontSize: 18, color: colors.ink2 }}>‹</Text>
        <Text variant="label" weight="bold" color={colors.ink2}>{t('tabs.profile')}</Text>
      </Pressable>

      <View style={{ gap: space.xs }}>
        <View style={{ flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: colors.surface2, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text variant="label" weight="bold" color={colors.ink2}>{t('badges.collectionChip')}</Text>
        </View>
        <Text variant="h1">
          {t('badges.h1a')}{' '}
          <Text variant="h1" style={{ backgroundColor: brand.yellow + '99' }}> {t('badges.h1mark')} </Text>
          {t('badges.h1b') ? ` ${t('badges.h1b')}` : ''}
        </Text>
        <Text variant="label" color={colors.ink2}>{t('badges.subtitle')}</Text>
      </View>

      {ach.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
      ) : ach.isError || !d ? (
        <Notice message={t(errorMessageKey(ach.error))} tone="error" />
      ) : (
        <>
          {/* progress folder */}
          <View>
            <View style={{ alignSelf: 'flex-start', zIndex: 2, marginBottom: -8 }}>
              <View style={{ backgroundColor: brand.purple, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 11 }}>
                <Text weight="extrabold" color="#fff" style={{ fontSize: 15 }}>{t('badges.progress')}</Text>
              </View>
            </View>
            <View style={{ backgroundColor: colors.surface, ...sheetRadius, borderTopLeftRadius: 0, padding: space.xl, alignItems: 'center', boxShadow: shadow.md }}>
              <View style={{ width: 160, height: 160, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={160} height={160} viewBox={`0 0 ${RING} ${RING}`} style={{ position: 'absolute' }}>
                  <Circle cx={80} cy={80} r={R} stroke={colors.surface3} strokeWidth={12} fill="none" />
                  <Circle
                    cx={80}
                    cy={80}
                    r={R}
                    stroke={brand.peach}
                    strokeWidth={12}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${arc} ${CIRC - arc}`}
                    transform="rotate(-90 80 80)"
                  />
                </Svg>
                <Text weight="extrabold" style={{ fontSize: 36, color: colors.ink }}>{pct}%</Text>
                <Text variant="label" color={colors.ink3}>{t('badges.unlocked', { n: d.earned, total: d.total })}</Text>
              </View>
            </View>
          </View>

          {/* filters */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {(['all', 'earned', 'in_progress', 'locked'] as Filter[]).map((f) => {
              const active = filter === f;
              const label = f === 'all' ? t('badges.all') : f === 'earned' ? t('badges.earned') : f === 'in_progress' ? t('badges.inProgress') : t('badges.locked');
              return (
                <Pressable key={f} onPress={() => setFilter(f)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? colors.ink : colors.surface, boxShadow: active ? '0 6px 0 -2px #000' : shadow.sm }}>
                  <Text variant="label" weight="bold" color={active ? '#fff' : colors.ink2}>{label}</Text>
                  <Text variant="label" weight="bold" color={active ? 'rgba(255,255,255,0.7)' : colors.ink3} style={{ opacity: active ? 1 : 0.55 }}>{counts[f]}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* sticker grid */}
          {badges.length === 0 ? (
            <View style={{ backgroundColor: colors.surface, borderRadius: 18, padding: space.x2, alignItems: 'center', gap: space.sm, boxShadow: shadow.sm }}>
              <Text style={{ fontSize: 40 }}>🗂️</Text>
              <Text variant="body" color={colors.ink3}>{t('badges.emptyFilter')}</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
              {badges.map((b, i) => (
                <BadgeCard key={b.id} b={b} rot={b.status === 'locked' ? 0 : ROT[i % ROT.length]} />
              ))}
            </View>
          )}
        </>
      )}

      {/* detail sheet */}
      <BottomSheet visible={!!sel} onClose={() => setSel(null)}>
        {sel ? (
          <View style={{ alignItems: 'center', gap: space.md }}>
            <View style={{ width: 132, height: 132, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ position: 'absolute', width: 132, height: 132, borderRadius: 66, backgroundColor: sel.color + '40' }} />
              <BadgeSticker b={sel} size={96} emoji={46} />
            </View>
            <Text variant="h2" center>{t(`badges.${sel.id}`)}</Text>
            <Text variant="body" color={colors.ink2} center style={{ maxWidth: 320 }}>{t(`badges.desc_${sel.id}`)}</Text>

            {sel.status === 'earned' ? (
              <>
                <View style={{ transform: [{ rotate: '-3deg' }], backgroundColor: sel.color + '1f', borderWidth: 1.5, borderColor: sel.color, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Text variant="label" weight="bold" style={{ color: sel.color, textTransform: 'uppercase' }}>{t('badges.earnedOn', { date: fmtDate(sel.earnedAt) })}</Text>
                </View>
                <Text variant="label" color={colors.ink3}>{t('badges.earnedCheer')}</Text>
                <Pressable onPress={() => share(sel)} style={{ alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: brand.purple, borderRadius: radius.md, paddingVertical: 14 }}>
                  <Text style={{ fontSize: 15 }}>📤</Text>
                  <Text variant="label" weight="bold" color="#fff">{t('badges.detailShare')}</Text>
                </Pressable>
              </>
            ) : sel.status === 'in_progress' ? (
              <View style={{ alignSelf: 'stretch', gap: 6 }}>
                <Text variant="label" weight="bold" center>{sel.current} / {sel.target}</Text>
                <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.surface2, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${sel.progress}%`, backgroundColor: sel.color, borderRadius: 5 }} />
                </View>
                <Text variant="label" color={colors.ink3} center>{t('badges.moreToUnlock', { n: Math.max(0, sel.target - sel.current) })}</Text>
              </View>
            ) : (
              <>
                <View style={{ backgroundColor: colors.surface2, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 }}>
                  <Text variant="label" weight="bold" color={colors.ink3}>{t('badges.lockedPill')}</Text>
                </View>
                <Text variant="label" color={colors.ink3} center style={{ maxWidth: 300 }}>{t('badges.lockedHint')}</Text>
              </>
            )}
          </View>
        ) : null}
      </BottomSheet>
    </Screen>
  );

  function BadgeSticker({ b, size, emoji }: { b: BadgeSummary; size: number; emoji: number }) {
    const bg = b.status === 'earned' ? b.color : b.status === 'in_progress' ? b.color + '26' : colors.surface3;
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 4, borderColor: '#fff', backgroundColor: bg, alignItems: 'center', justifyContent: 'center', boxShadow: shadow.sm, opacity: b.status === 'locked' ? 0.85 : 1 }}>
        <Text style={{ fontSize: emoji, opacity: b.status === 'locked' ? 0.55 : 1 }}>{b.icon}</Text>
      </View>
    );
  }

  function BadgeCard({ b, rot }: { b: BadgeSummary; rot: number }) {
    const earned = b.status === 'earned';
    const inProgress = b.status === 'in_progress';
    const locked = b.status === 'locked';
    return (
      <Pressable
        onPress={() => setSel(b)}
        style={{
          flexGrow: 1,
          flexBasis: '46%',
          backgroundColor: colors.surface,
          borderRadius: 18,
          paddingTop: 28,
          paddingHorizontal: 16,
          paddingBottom: 20,
          alignItems: 'center',
          gap: 8,
          boxShadow: shadow.sm,
          transform: [{ rotate: `${rot}deg` }],
          borderWidth: locked ? 2 : 0,
          borderColor: colors.hairline2,
          borderStyle: locked ? 'dashed' : undefined,
          opacity: locked ? 0.72 : 1,
        }}
      >
        {earned ? (
          <View style={{ position: 'absolute', top: -10, alignSelf: 'center', zIndex: 4 }}><WashiTape color={washiFor(b.color, colors.washi) + 'C0'} width={70} rotate={-3} /></View>
        ) : null}
        {inProgress ? (
          <View style={{ position: 'absolute', top: -16, right: 14, zIndex: 4 }}><PAClip width={30} /></View>
        ) : null}

        <BadgeSticker b={b} size={66} emoji={30} />
        <Text variant="label" weight="bold" center>{t(`badges.${b.id}`)}</Text>
        <Text variant="label" color={colors.ink2} center style={{ lineHeight: 19 }}>{t(`badges.desc_${b.id}`)}</Text>

        {earned ? (
          <View style={{ transform: [{ rotate: '-3.5deg' }], backgroundColor: b.color + '1f', borderWidth: 1.5, borderColor: b.color, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 2 }}>
            <Text variant="label" weight="bold" style={{ color: b.color, fontSize: 14 }}>✓ {fmtDate(b.earnedAt)}</Text>
          </View>
        ) : inProgress ? (
          <View style={{ alignSelf: 'stretch', gap: 4, marginTop: 2 }}>
            <Text variant="label" weight="bold" center color={colors.ink2}>{b.current} / {b.target}</Text>
            <View style={{ height: 8, borderRadius: 6, backgroundColor: colors.surface2, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${b.progress}%`, backgroundColor: b.color, borderRadius: 6 }} />
            </View>
          </View>
        ) : null}
      </Pressable>
    );
  }
}

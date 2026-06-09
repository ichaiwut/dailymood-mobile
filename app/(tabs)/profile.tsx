/**
 * Profile + settings hub ("You") — Paper Desk. Loads everything from GET
 * /api/profile in one shot. Hero (accent gradient + paperclip + avatar + stats),
 * mood signature, achievements row, then settings sections: subscription,
 * language, privacy (hidePreview), mood-icon pack picker, data (export / clear),
 * and about (feedback / terms / privacy). Three bottom sheets (sign out, clear,
 * feedback). Premium features are never hidden — Free sees a teaser/PRO badge.
 *
 * Deferred vs the web spec: the theme picker (dark mode is force-disabled), the
 * saved-articles / article-reactions cards, and the custom-mood / personal-event
 * managers (each needs a dedicated component or route that doesn't exist yet).
 */
import { useEffect, useState, type ReactNode } from 'react';
import { View, Pressable, Image, TextInput, ActivityIndicator, Share, Platform, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { BottomSheet } from '../../src/components/BottomSheet';
import { SparkleIcon } from '../../src/components/icons/Glyphs';
import { PAClip } from '../../src/components/paper/PAClip';
import { WashiTape } from '../../src/components/paper/WashiTape';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/auth/AuthContext';
import { useProfile, useUpdateProfile } from '../../src/hooks/queries';
import { useToast } from '../../src/components/Toast';
import { initials } from '../../src/lib/avatar';
import { formatDateKey } from '../../src/lib/time';
import { clearEntries, exportEntriesCsv, fetchFeedbackStatus, submitFeedback } from '../../src/api/profile';
import { R2_PUBLIC_URL, API_BASE_URL } from '../../src/config';
import { ApiError, errorMessageKey } from '../../src/api/errors';
import type { MoodPack } from '../../src/api/types';

const PREVIEW_MOODS = ['amazing', 'happy', 'neutral', 'sad'];
const GRADIENTS: Record<string, [string, string, ...string[]]> = {
  '#A673F1': ['#A673F1', '#C89BF5', '#FCA45B'],
  '#FCA45B': ['#FCA45B', '#FDB97A'],
  '#85ECCB': ['#85ECCB', '#9ACDE2', '#A673F1'],
  '#FDCB56': ['#FDCB56', '#FCA45B'],
  '#9ACDE2': ['#9ACDE2', '#A673F1'],
  '#D4BEE4': ['#D4BEE4', '#A673F1'],
};
const DANGER = '#D94444';

type SheetKind = 'signout' | 'clear' | 'feedback' | null;

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const router = useRouter();
  const qc = useQueryClient();
  const { signOut } = useAuth();
  const profile = useProfile();
  const update = useUpdateProfile();
  const toast = useToast();

  const [sheet, setSheet] = useState<SheetKind>(null);
  const [busy, setBusy] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const u = profile.data?.user;
  const stats = profile.data?.stats;
  const sig = profile.data?.moodSignature;
  const ach = profile.data?.achievements;
  const packs = profile.data?.packs ?? [];
  const premium = u?.isPremium ?? false;
  const tier = profile.data?.tier;
  const accent = u?.accentColor || brand.purple;
  const grad = GRADIENTS[accent] ?? GRADIENTS['#A673F1'];
  const version = (Constants.expoConfig?.version as string) ?? '1.0.0';

  const memberSince = u?.createdAt
    ? formatDateKey(u.createdAt.slice(0, 10), i18n.language, { weekday: undefined, day: undefined, month: 'long', year: 'numeric' })
    : '';

  useEffect(() => {
    if (sheet === 'feedback') {
      setFeedbackSent(false);
      fetchFeedbackStatus().then((s) => setCooldown(s.cooldown ? s.remainMin : 0)).catch(() => setCooldown(0));
    }
  }, [sheet]);

  const setLocale = (loc: 'en' | 'th') => {
    if (loc === u?.locale) return;
    i18n.changeLanguage(loc);
    update.mutateAsync({ locale: loc }).then(() => toast.show(t('profile.saved'))).catch((e) => toast.show(t(errorMessageKey(e)), 'error'));
  };

  const toggleHidePreview = (v: boolean) => {
    update.mutateAsync({ hidePreview: v }).then(() => toast.show(t('profile.saved'))).catch((e) => toast.show(t(errorMessageKey(e)), 'error'));
  };

  const pickPack = (pack: MoodPack) => {
    if (pack.id === u?.moodPack) return;
    if (pack.premium && tier !== 'premium') {
      router.push('/profile/subscription');
      return;
    }
    update.mutateAsync({ moodPack: pack.id }).then(() => toast.show(t('profile.packChanged'))).catch((e) => toast.show(t(errorMessageKey(e)), 'error'));
  };

  const onExport = async () => {
    if (!premium) {
      router.push('/profile/subscription');
      return;
    }
    setBusy(true);
    try {
      const csv = await exportEntriesCsv();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dailymood-entries.csv';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await Share.share({ message: csv });
      }
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    } finally {
      setBusy(false);
    }
  };

  const onClear = async () => {
    setBusy(true);
    try {
      await clearEntries();
      qc.invalidateQueries({ queryKey: ['log'], refetchType: 'all' });
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.show(t('profile.cleared'));
      setSheet(null);
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    } finally {
      setBusy(false);
    }
  };

  const onSubmitFeedback = async () => {
    const msg = feedbackText.trim();
    if (!msg || busy || cooldown > 0) return;
    setBusy(true);
    try {
      await submitFeedback(msg);
      setFeedbackSent(true);
      setFeedbackText('');
    } catch (e) {
      if (e instanceof ApiError && e.code === 'rate_limited') {
        const s = await fetchFeedbackStatus().catch(() => ({ remainMin: 5 }));
        setCooldown(s.remainMin || 5);
      } else {
        toast.show(t(errorMessageKey(e)), 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  const onSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
      setSheet(null);
    }
  };

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 120 }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="h1">{t('tabs.profile')}</Text>
        <Pressable onPress={() => router.push('/profile/edit')} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', boxShadow: shadow.sm }}>
          <Text style={{ fontSize: 17 }}>✏️</Text>
        </Pressable>
      </View>

      {profile.isLoading || !u ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
      ) : (
        <>
          {/* A. hero */}
          <View>
            <View style={{ position: 'absolute', top: -22, right: 26, zIndex: 6 }}><PAClip /></View>
            <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 18, padding: space.xl, gap: space.lg, boxShadow: '0 18px 40px -18px rgba(166,115,241,0.5)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <Pressable onPress={() => router.push('/profile/edit')} style={{ width: 76, height: 76 }}>
                  {u.imageUrl ? (
                    <Image source={{ uri: u.imageUrl }} style={{ width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' }} />
                  ) : (
                    <View style={{ width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
                      <Text weight="extrabold" style={{ fontSize: 26, color: '#fff' }}>{initials(u.name, u.email)}</Text>
                    </View>
                  )}
                  <View style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: 13, backgroundColor: '#FCA45B', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 11 }}>✏️</Text>
                  </View>
                </Pressable>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text weight="extrabold" style={{ fontSize: 22, color: '#fff' }} numberOfLines={1}>{u.name || u.email.split('@')[0]}</Text>
                  <Text variant="label" style={{ color: 'rgba(255,255,255,0.85)' }}>{t('profile.memberSince', { date: memberSince })}</Text>
                  {premium ? (
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 }}>
                      <Text variant="label" weight="bold" style={{ color: '#fff' }}>● {t('profile.pro')}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* stats row */}
              <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 18, paddingVertical: 14 }}>
                <HeroStat label={t('profile.streak')} value={`${stats?.streak ?? 0} 🔥`} onPress={() => router.push('/profile/achievements')} />
                <HeroStat label={t('profile.entries')} value={`${stats?.totalEntries ?? 0} 📓`} border onPress={() => router.push('/(tabs)/calendar')} />
                <HeroStat label={t('profile.avgMood')} value={`${(stats?.avgMood ?? 0).toFixed(1)} ${stats?.avgMoodEmoji ?? ''}`} onPress={() => router.push('/(tabs)/stats')} />
              </View>
            </LinearGradient>
          </View>

          {/* B. mood signature */}
          <View>
            <View style={{ position: 'absolute', top: -12, left: 26, zIndex: 6 }}><WashiTape color={brand.mint + 'C0'} width={82} rotate={-3} /></View>
            <View style={{ backgroundColor: colors.surface, ...sheetRadius, padding: space.xl, gap: space.md, boxShadow: shadow.md }}>
              <Text variant="eyebrow">{t('profile.moodSigEyebrow')}</Text>
              {!premium ? (
                <PremiumTeaser text={t('profile.moodSigTeaser')} />
              ) : sig?.hasSufficientData && sig.distribution.length ? (
                <>
                  <Text variant="title">
                    {sig.distribution.length >= 2 && sig.distribution[1].percent >= 25
                      ? t('profile.moodSigMix', { a: localMood(sig.distribution[0]), b: localMood(sig.distribution[1]) })
                      : t('profile.moodSigYou', { mood: localMood(sig.distribution[0]) })}
                  </Text>
                  <View style={{ flexDirection: 'row', height: 14, borderRadius: 8, overflow: 'hidden' }}>
                    {sig.distribution.map((s) => (
                      <View key={s.moodId} style={{ flex: s.percent, backgroundColor: s.color }} />
                    ))}
                  </View>
                  <Text variant="label" color={colors.ink2}>
                    {sig.distribution.slice(0, 3).map((s) => `${localMood(s)} ${s.percent}%`).join('  ·  ')}
                  </Text>
                </>
              ) : (
                <Text variant="body" color={colors.ink3}>{t('profile.notEnoughData')}</Text>
              )}
            </View>
          </View>

          {/* C. achievements */}
          {ach && ach.earned > 0 ? (
            <View style={{ gap: space.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="title">{t('profile.achievements')}</Text>
                <Pressable onPress={() => router.push('/profile/achievements')} hitSlop={6}>
                  <Text variant="label" weight="bold" color={brand.purpleStrong}>{ach.earned}/{ach.total} →</Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
                {ach.badges.filter((b) => b.status === 'earned').slice(0, 6).map((b) => (
                  <View key={b.id} style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: b.color, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', boxShadow: shadow.sm }}>
                    <Text style={{ fontSize: 26 }}>{b.icon}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* D. article links */}
          <View style={{ gap: space.md }}>
            <ArticleCard icon="♥" title={t('profile.savedArticles')} sub={t('profile.savedArticlesSub')} onPress={() => router.push('/profile/saved-articles')} />
            <ArticleCard icon="☺" title={t('profile.articleReactions')} sub={t('profile.articleReactionsSub')} onPress={() => router.push('/profile/article-reactions')} />
          </View>

          {/* E1. account / subscription */}
          <Section label={t('profile.secAccount')}>
            <SettingCard>
              <NavRow
                bg="#A673F1"
                icon="✦"
                title={t('profile.subscription')}
                value={premium ? (u.currentPeriodEnd ? t(u.cancelAtPeriodEnd ? 'profile.expires' : 'profile.renews', { date: formatDateKey(u.currentPeriodEnd.slice(0, 10), i18n.language, { weekday: undefined, day: 'numeric', month: 'short', year: 'numeric' }) }) : t('subscription.pro')) : t('profile.freeTier')}
                onPress={() => router.push('/profile/subscription')}
              />
            </SettingCard>
          </Section>

          {/* E2. language */}
          <Section label={t('profile.secLanguage')}>
            <SettingCard>
              <RadioRow label={t('settings.languageEn')} selected={u.locale === 'en'} onPress={() => setLocale('en')} />
              <Divider />
              <RadioRow label={t('settings.languageTh')} selected={u.locale === 'th'} onPress={() => setLocale('th')} />
            </SettingCard>
          </Section>

          {/* E4. privacy */}
          <Section label={t('profile.secPrivacy')}>
            <SettingCard>
              {premium ? (
                <ToggleRow bg="#9ACDE2" icon="👁️" title={t('profile.hidePreview')} value={u.hidePreview} onToggle={toggleHidePreview} />
              ) : (
                <View style={{ padding: space.lg }}><PremiumTeaser text={t('profile.hidePreviewTeaser')} /></View>
              )}
            </SettingCard>
          </Section>

          {/* E7. mood pack */}
          {packs.length > 1 ? (
            <Section label={t('profile.secMoodPack')}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
                {packs.map((p) => {
                  const selected = p.id === u.moodPack;
                  const locked = p.premium && tier !== 'premium';
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => pickPack(p)}
                      style={{ flexGrow: 1, flexBasis: '46%', backgroundColor: colors.surface, borderRadius: 16, padding: space.md, gap: 8, borderWidth: 2.5, borderColor: selected ? brand.purple : 'transparent', boxShadow: shadow.sm }}
                    >
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        {PREVIEW_MOODS.map((mid) => (
                          <PackIcon key={mid} url={`${R2_PUBLIC_URL}/${p.id}/${mid}.${p.iconFormat}`} />
                        ))}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text variant="label" weight="bold" numberOfLines={1} style={{ flex: 1 }}>{locked ? `🔒 ${p.label}` : p.label}</Text>
                        {p.premium ? <Text variant="label" weight="bold" color={brand.purpleStrong} style={{ fontSize: 14 }}>{locked ? t('profile.upgrade') : t('profile.pro')}</Text> : null}
                        {selected ? <Text style={{ fontSize: 14 }}>✓</Text> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </Section>
          ) : null}

          {/* E8. data */}
          <Section label={t('profile.secData')}>
            <SettingCard>
              <NavRow bg="#85ECCB" icon="📥" title={t('profile.exportData')} value={premium ? 'CSV' : t('profile.pro')} onPress={onExport} loading={busy} />
              <Divider />
              <Pressable onPress={() => setSheet('clear')} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg }}>
                <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: DANGER + '18', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 18 }}>🗑️</Text></View>
                <Text variant="label" weight="bold" color={DANGER} style={{ flex: 1 }}>{t('profile.clearAll')}</Text>
              </Pressable>
            </SettingCard>
          </Section>

          {/* E9. about */}
          <Section label={t('profile.secAbout')}>
            <SettingCard>
              <NavRow bg="#FCA45B" icon="💬" title={t('profile.sendFeedback')} onPress={() => setSheet('feedback')} />
              <Divider />
              <NavRow bg="#D4BEE4" icon="📄" title={t('profile.terms')} onPress={() => Linking.openURL(`${API_BASE_URL}/terms`)} />
              <Divider />
              <NavRow bg="#9ACDE2" icon="🔒" title={t('profile.privacyPolicy')} onPress={() => Linking.openURL(`${API_BASE_URL}/privacy`)} />
            </SettingCard>
          </Section>

          {/* footer */}
          <Pressable onPress={() => setSheet('signout')} style={{ borderWidth: 1.5, borderColor: '#F5DADA', borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: space.sm }}>
            <Text variant="label" weight="bold" color={DANGER}>{t('auth.signOut')}</Text>
          </Pressable>
          <Text variant="label" color={colors.ink3} center>{t('profile.version', { v: version })}</Text>
        </>
      )}

      {/* F. bottom sheets */}
      <BottomSheet visible={sheet === 'signout'} onClose={() => setSheet(null)}>
        <View style={{ gap: space.lg }}>
          <Text variant="h2" center>{t('profile.signOutTitle')}</Text>
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <View style={{ flex: 1 }}><Button variant="paper" label={t('common.cancel')} onPress={() => setSheet(null)} /></View>
            <View style={{ flex: 1 }}><DangerBtn label={t('auth.signOut')} onPress={onSignOut} loading={busy} /></View>
          </View>
        </View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'clear'} onClose={() => setSheet(null)}>
        <View style={{ gap: space.md }}>
          <Text variant="h2" center>{t('profile.clearTitle')}</Text>
          <Text variant="body" color={colors.ink2} center>{t('profile.clearBody')}</Text>
          <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.sm }}>
            <View style={{ flex: 1 }}><Button variant="paper" label={t('common.cancel')} onPress={() => setSheet(null)} /></View>
            <View style={{ flex: 1 }}><DangerBtn label={t('profile.clearConfirm')} onPress={onClear} loading={busy} /></View>
          </View>
        </View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'feedback'} onClose={() => setSheet(null)}>
        {feedbackSent ? (
          <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.lg }}>
            <Text style={{ fontSize: 40 }}>💜</Text>
            <Text variant="h2" center>{t('profile.feedbackThanks')}</Text>
            <Button variant="purple" label={t('common.back')} onPress={() => setSheet(null)} style={{ alignSelf: 'stretch' }} />
          </View>
        ) : (
          <View style={{ gap: space.md }}>
            <Text variant="h2">{t('profile.feedbackTitle')}</Text>
            <Text variant="label" color={colors.ink3}>{t('profile.feedbackHint')}</Text>
            <TextInput
              value={feedbackText}
              onChangeText={(v) => setFeedbackText(v.slice(0, 1000))}
              placeholder={t('profile.feedbackPlaceholder')}
              placeholderTextColor={colors.ink3}
              multiline
              style={{ minHeight: 110, borderWidth: 1.5, borderColor: colors.hairline2, borderRadius: radius.md, padding: space.md, fontSize: 15, color: colors.ink, textAlignVertical: 'top' }}
            />
            <Text variant="label" color={colors.ink3} style={{ textAlign: 'right' }}>{feedbackText.length}/1000</Text>
            {cooldown > 0 ? <Text variant="label" color={colors.danger} center>{t('profile.feedbackCooldown', { n: cooldown })}</Text> : null}
            <Button variant="ink" label={t('profile.feedbackSend')} onPress={onSubmitFeedback} loading={busy} disabled={!feedbackText.trim() || cooldown > 0} style={{ alignSelf: 'stretch' }} />
          </View>
        )}
      </BottomSheet>
    </Screen>
  );

  // ---- helpers ----
  function localMood(s: { label: string; labelTh: string }) {
    return i18n.language === 'th' ? s.labelTh : s.label;
  }

  function HeroStat({ label, value, onPress, border }: { label: string; value: string; onPress: () => void; border?: boolean }) {
    return (
      <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 2, borderLeftWidth: border ? 1 : 0, borderRightWidth: border ? 1 : 0, borderColor: 'rgba(255,255,255,0.25)' }}>
        <Text weight="extrabold" style={{ fontSize: 22, color: '#fff' }}>{value}</Text>
        <Text variant="label" style={{ color: 'rgba(255,255,255,0.85)' }}>{label}</Text>
      </Pressable>
    );
  }

  function PremiumTeaser({ text }: { text: string }) {
    return (
      <Pressable onPress={() => router.push('/profile/subscription')} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: '#F3ECF9', borderRadius: 16, padding: space.lg }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: brand.purple, alignItems: 'center', justifyContent: 'center' }}><SparkleIcon size={18} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('profile.pro')}</Text>
          <Text variant="label" color={colors.ink2}>{text}</Text>
        </View>
        <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('profile.upgrade')}</Text>
      </Pressable>
    );
  }

  function ArticleCard({ icon, title, sub, onPress }: { icon: string; title: string; sub: string; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.surface, borderRadius: 16, padding: space.lg, boxShadow: shadow.sm }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 18 }}>{icon}</Text></View>
        <View style={{ flex: 1 }}>
          <Text variant="label" weight="bold">{title}</Text>
          <Text variant="label" color={colors.ink3}>{sub}</Text>
        </View>
        <Text style={{ fontSize: 18, color: colors.ink3 }}>›</Text>
      </Pressable>
    );
  }

  function Section({ label, children }: { label: string; children: ReactNode }) {
    return (
      <View style={{ gap: space.sm }}>
        <Text variant="eyebrow" style={{ paddingLeft: 4 }}>{label}</Text>
        {children}
      </View>
    );
  }

  function SettingCard({ children }: { children: ReactNode }) {
    return <View style={{ backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.hairline, overflow: 'hidden', boxShadow: shadow.sm }}>{children}</View>;
  }

  function Divider() {
    return <View style={{ height: 1, backgroundColor: colors.hairline, marginLeft: 76 }} />;
  }

  function NavRow({ bg, icon, title, value, onPress, loading }: { bg: string; icon: string; title: string; value?: string; onPress: () => void; loading?: boolean }) {
    return (
      <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: bg + '22', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 18 }}>{icon}</Text></View>
        <Text variant="label" weight="bold" style={{ flex: 1 }}>{title}</Text>
        {value ? <Text variant="label" color={colors.ink3}>{value}</Text> : null}
        {loading ? <ActivityIndicator size="small" color={colors.ink3} /> : <Text style={{ fontSize: 18, color: colors.ink3 }}>›</Text>}
      </Pressable>
    );
  }

  function ToggleRow({ bg, icon, title, value, onToggle }: { bg: string; icon: string; title: string; value: boolean; onToggle: (v: boolean) => void }) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: bg + '22', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 18 }}>{icon}</Text></View>
        <Text variant="label" weight="bold" style={{ flex: 1 }}>{title}</Text>
        <Pressable onPress={() => onToggle(!value)} style={{ width: 50, height: 28, borderRadius: 14, padding: 3, backgroundColor: value ? brand.purple : colors.surface3, alignItems: value ? 'flex-end' : 'flex-start' }}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', boxShadow: shadow.sm }} />
        </Pressable>
      </View>
    );
  }

  function RadioRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: selected ? 6 : 2, borderColor: selected ? brand.purple : colors.hairline2 }} />
        <Text variant="label" weight="bold">{label}</Text>
      </Pressable>
    );
  }

  function DangerBtn({ label, onPress, loading }: { label: string; onPress: () => void; loading?: boolean }) {
    return (
      <Pressable onPress={onPress} disabled={loading} style={{ backgroundColor: DANGER, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' }}>
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text variant="label" weight="bold" color="#fff">{label}</Text>}
      </Pressable>
    );
  }

  function PackIcon({ url }: { url: string }) {
    const [failed, setFailed] = useState(false);
    if (failed) return <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.surface2 }} />;
    return <Image source={{ uri: url }} style={{ width: 22, height: 22 }} onError={() => setFailed(true)} />;
  }
}

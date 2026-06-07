/**
 * Profile overview ("You"). Hero (accent card + avatar initials + premium
 * badge), tappable hero stats, mood-signature bar, achievements preview row,
 * settings/subscription shortcut list, sign out + version. GET /api/profile.
 */
import { useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';

import { Screen } from '../../src/components/Screen';
import { Text } from '../../src/components/Text';
import { Button } from '../../src/components/Button';
import { PASticker } from '../../src/components/paper/PASticker';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/auth/AuthContext';
import { useProfile } from '../../src/hooks/queries';
import { initials } from '../../src/lib/avatar';
import { formatDateKey } from '../../src/lib/time';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const profile = useProfile();
  const [busy, setBusy] = useState(false);

  const onSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  const u = profile.data?.user;
  const accent = u?.accentColor || brand.purple;
  const memberSince = u?.createdAt
    ? formatDateKey(u.createdAt.slice(0, 10), i18n.language, { weekday: undefined, day: undefined, month: 'long', year: 'numeric' })
    : '';

  return (
    <Screen scroll contentStyle={{ gap: space.lg, paddingBottom: 120 }}>
      {profile.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: space.x3 }} />
      ) : (
        <>
          {/* hero */}
          <View
            style={{
              backgroundColor: accent,
              borderRadius: radius.lg,
              padding: space.xl,
              gap: space.lg,
              shadowColor: colors.paperShadow,
              shadowOffset: { width: 6, height: 8 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="h2" color="#fff">{initials(u?.name, u?.email)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="title" color="#fff">{u?.name || u?.email}</Text>
                <Text variant="label" color="rgba(255,255,255,0.85)">{u?.email}</Text>
                {memberSince ? (
                  <Text variant="label" color="rgba(255,255,255,0.7)">{t('profile.memberSince', { date: memberSince })}</Text>
                ) : null}
              </View>
              <Pressable onPress={() => router.push('/profile/edit')} hitSlop={10}>
                <Text style={{ fontSize: 20 }}>✏️</Text>
              </Pressable>
            </View>

            {u?.isPremium ? (
              <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text variant="eyebrow" color="#fff">✦ PRO</Text>
              </View>
            ) : null}

            {/* hero stats */}
            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.md, padding: space.md }}>
              <HeroStat label="🔥" value={profile.data?.stats.streak ?? 0} onPress={() => router.push('/(tabs)/stats')} />
              <HeroStat label="📓" value={profile.data?.stats.totalEntries ?? 0} onPress={() => router.push('/(tabs)/calendar')} />
              <HeroStat label={profile.data?.stats.avgMoodEmoji ?? '😊'} value={profile.data?.stats.avgMood ?? 0} onPress={() => router.push('/(tabs)/stats')} />
            </View>
          </View>

          {/* mood signature */}
          {profile.data?.moodSignature?.distribution?.length ? (
            <Card>
              <Text variant="label" color={colors.ink3}>{t('profile.moodSignature')}</Text>
              <View style={{ flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden', marginTop: 8 }}>
                {profile.data.moodSignature.distribution.map((d) => (
                  <View key={d.moodId} style={{ flex: d.count, backgroundColor: d.color }} />
                ))}
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.sm }}>
                {profile.data.moodSignature.distribution.slice(0, 3).map((d) => (
                  <View key={d.moodId} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color }} />
                    <Text variant="label" weight="medium" color={colors.ink2}>
                      {(i18n.language === 'th' ? d.labelTh : d.label)} {d.percent}%
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}

          {/* achievements preview */}
          {profile.data?.achievements?.badges?.length ? (
            <Pressable onPress={() => router.push('/profile/achievements')}>
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="label" color={colors.ink3}>{t('profile.achievements')}</Text>
                  <Text variant="label" color={colors.primary}>{t('profile.seeAll')} →</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', gap: space.md }}>
                    {profile.data.achievements.badges.map((b) => (
                      <View key={b.id} style={{ opacity: b.status === 'locked' ? 0.4 : 1 }}>
                        <PASticker color={b.status === 'earned' ? b.color : colors.ink3} emoji={b.icon} size={48} />
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </Card>
            </Pressable>
          ) : null}

          {/* shortcuts */}
          <Card>
            <NavRow icon="✦" label={t('profile.subscription')} onPress={() => router.push('/profile/subscription')} />
            <Divider />
            <NavRow icon="⚙️" label={t('profile.settings')} onPress={() => router.push('/profile/settings')} />
          </Card>

          {/* footer */}
          <Button label={t('auth.signOut')} variant="paper" onPress={onSignOut} loading={busy} />
          <Text variant="label" center color={colors.ink3}>
            {t('profile.version', { v: Constants.expoConfig?.version ?? '1.0.0' })}
          </Text>
        </>
      )}
    </Screen>
  );

  function HeroStat({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
        <Text style={{ fontSize: 22 }}>{label}</Text>
        <Text variant="title" color="#fff">{value}</Text>
      </Pressable>
    );
  }

  function Card({ children }: { children: React.ReactNode }) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.hairline,
          padding: space.lg,
          shadowColor: colors.paperShadow,
          shadowOffset: { width: 4, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        }}
      >
        {children}
      </View>
    );
  }

  function NavRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
        <Text variant="body" style={{ flex: 1 }}>{label}</Text>
        <Text variant="title" color={colors.ink3}>›</Text>
      </Pressable>
    );
  }

  function Divider() {
    return <View style={{ height: 1, backgroundColor: colors.hairline, marginVertical: 4 }} />;
  }
}

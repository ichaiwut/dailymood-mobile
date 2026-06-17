/**
 * Settings → Notification: per-topic (daily reminder / weekly digest / AI coach)
 * email + push toggles, plus the daily reminder's time/days — rendered as Paper
 * Desk folders (color-coded FolderTab + paperclip + warm shadow on the cream
 * desk), matching Insights/Stats/Today.
 *
 * Persists to PATCH /api/profile (optimistic — toggles feel instant, revert on
 * error). Enabling a push channel runs the OS permission flow: prompts if
 * undetermined, and if denied we keep the intent (toggle stays on) and point the
 * user to system Settings. reminderTime is bucketed to :00/:30 and reminderDays
 * is 0–6 (0=Sun) to match the backend reminders cron.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { View, Pressable, Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from './Text';
import { PaperSheet } from './paper/PaperSheet';
import { BellIcon, MailIcon, SparkleIcon } from './icons/Glyphs';
import { useTheme } from '../theme/ThemeProvider';
import { useProfile, useUpdateProfile } from '../hooks/queries';
import { useToast } from './Toast';
import { errorMessageKey } from '../api/errors';
import {
  getPermissionState,
  requestAndRegister,
  ensurePushRegistered,
  type PermissionState,
} from '../notifications/push';
import type { UpdateProfileInput } from '../api/types';

type Prefs = {
  reminderEmailEnabled: boolean;
  reminderPushEnabled: boolean;
  weeklyDigestEmailEnabled: boolean;
  weeklyDigestPushEnabled: boolean;
  aiCoachEmailEnabled: boolean;
  aiCoachPushEnabled: boolean;
  reminderTime: string;
  reminderDays: string;
};

// Each topic is a folder; tab colour-codes it (mint needs dark tab text). Icons
// are our own SVG glyphs (Glyphs.tsx), never system emoji.
const TOPICS = [
  { key: 'reminder', Icon: BellIcon, title: 'topicReminder', body: 'topicReminderBody', email: 'reminderEmailEnabled', push: 'reminderPushEnabled', schedule: true, tab: '#A673F1', fg: '#fff' },
  { key: 'digest', Icon: MailIcon, title: 'topicDigest', body: 'topicDigestBody', email: 'weeklyDigestEmailEnabled', push: 'weeklyDigestPushEnabled', schedule: false, tab: '#FCA45B', fg: '#fff' },
  { key: 'coach', Icon: SparkleIcon, title: 'topicCoach', body: 'topicCoachBody', email: 'aiCoachEmailEnabled', push: 'aiCoachPushEnabled', schedule: false, tab: '#85ECCB', fg: '#1A1320' },
] as const;

export function NotificationSection() {
  const { t } = useTranslation();
  const { colors, space, brand, shadow } = useTheme();
  const profile = useProfile();
  const update = useUpdateProfile();
  const toast = useToast();

  const user = profile.data?.user;
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [perm, setPerm] = useState<PermissionState | null>(null);

  // Seed local state from the server and re-sync when those fields change.
  useEffect(() => {
    if (!user) return;
    setPrefs({
      reminderEmailEnabled: user.reminderEmailEnabled,
      reminderPushEnabled: user.reminderPushEnabled,
      weeklyDigestEmailEnabled: user.weeklyDigestEmailEnabled,
      weeklyDigestPushEnabled: user.weeklyDigestPushEnabled,
      aiCoachEmailEnabled: user.aiCoachEmailEnabled,
      aiCoachPushEnabled: user.aiCoachPushEnabled,
      reminderTime: user.reminderTime || '09:00',
      reminderDays: user.reminderDays || '0,1,2,3,4,5,6',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user?.reminderEmailEnabled, user?.reminderPushEnabled,
    user?.weeklyDigestEmailEnabled, user?.weeklyDigestPushEnabled,
    user?.aiCoachEmailEnabled, user?.aiCoachPushEnabled,
    user?.reminderTime, user?.reminderDays,
  ]);

  useEffect(() => { getPermissionState().then(setPerm); }, []);

  if (!prefs) return null;

  const save = async (changes: Partial<UpdateProfileInput>) => {
    const prev = prefs;
    setPrefs({ ...prefs, ...changes } as Prefs);
    try {
      await update.mutateAsync(changes);
      toast.show(t('profile.saved'));
    } catch (e) {
      setPrefs(prev); // revert the optimistic toggle
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  const promptToOpenSettings = () => {
    Alert.alert(t('notifications.pushDeniedTitle'), t('notifications.pushDeniedBody'), [
      { text: t('notifications.pushCancel'), style: 'cancel' },
      { text: t('notifications.pushOpenSettings'), onPress: () => { Linking.openSettings(); } },
    ]);
  };

  // Called when a push channel is switched on. We keep the saved intent either
  // way; this just secures (or nudges toward) the OS permission + device token.
  const ensurePush = async () => {
    const state = await getPermissionState();
    if (state === 'granted') { await ensurePushRegistered(); setPerm('granted'); return; }
    if (state === 'undetermined') {
      const granted = await requestAndRegister();
      setPerm(granted ? 'granted' : 'denied');
      if (!granted) promptToOpenSettings();
      return;
    }
    setPerm('denied');
    promptToOpenSettings();
  };

  const onToggle = (field: keyof Prefs, value: boolean, isPush: boolean) => {
    save({ [field]: value } as Partial<UpdateProfileInput>);
    if (isPush && value) ensurePush();
  };

  const anyPushOn = prefs.reminderPushEnabled || prefs.weeklyDigestPushEnabled || prefs.aiCoachPushEnabled;

  return (
    <View style={{ gap: space.lg, marginTop: space.sm }}>
      {TOPICS.map((topic) => {
        const emailOn = prefs[topic.email] as boolean;
        const pushOn = prefs[topic.push] as boolean;
        const active = emailOn || pushOn;
        const Icon = topic.Icon;
        return (
          <PaperSheet
            key={topic.key}
            tab={t(`settings.${topic.title}`)}
            tabIcon={<Icon size={16} color={topic.fg} />}
            tabColor={topic.tab}
            tabTextColor={topic.fg}
            clip
            clipSide="right"
          >
            <Text variant="label" color={colors.ink3} style={{ lineHeight: 18 }}>
              {t(`settings.${topic.body}`)}
            </Text>
            <View style={{ marginTop: space.sm }}>
              <ChannelRow icon={<MailIcon size={16} color={colors.ink2} />} label={t('settings.channelEmail')} value={emailOn} onToggle={(v) => onToggle(topic.email, v, false)} />
              <View style={{ height: 1, backgroundColor: colors.hairline }} />
              <ChannelRow icon={<BellIcon size={16} color={colors.ink2} />} label={t('settings.channelPush')} value={pushOn} onToggle={(v) => onToggle(topic.push, v, true)} />
            </View>
            {topic.schedule && active ? (
              <ReminderSchedule time={prefs.reminderTime} days={prefs.reminderDays} />
            ) : null}
          </PaperSheet>
        );
      })}
      {anyPushOn && perm === 'denied' ? (
        <Text variant="label" color={colors.ink3} style={{ paddingHorizontal: 4 }}>{t('notifications.deniedHint')}</Text>
      ) : null}
    </View>
  );

  // ---- helpers (closures over theme + save) ----

  function Toggle({ value, onToggle }: { value: boolean; onToggle: (v: boolean) => void }) {
    return (
      <Pressable
        onPress={() => onToggle(!value)}
        hitSlop={8}
        style={{ width: 44, height: 24, borderRadius: 12, padding: 2, backgroundColor: value ? brand.purple : colors.surface3, justifyContent: 'center', alignItems: value ? 'flex-end' : 'flex-start' }}
      >
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', boxShadow: shadow.sm }} />
      </Pressable>
    );
  }

  function ChannelRow({ icon, label, value, onToggle }: { icon: ReactNode; label: string; value: boolean; onToggle: (v: boolean) => void }) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {icon}
          <Text variant="body" color={colors.ink2}>{label}</Text>
        </View>
        <Toggle value={value} onToggle={onToggle} />
      </View>
    );
  }

  function ReminderSchedule({ time, days }: { time: string; days: string }) {
    const [hh, mm] = time.split(':');
    const hour = parseInt(hh, 10) || 0;
    const half = mm === '30';
    const daySet = new Set(days.split(',').filter(Boolean));
    const labels = t('settings.weekdaysShort').split(',');

    const setTime = (h: number, isHalf: boolean) => {
      const hp = String((h + 24) % 24).padStart(2, '0');
      save({ reminderTime: `${hp}:${isHalf ? '30' : '00'}` });
    };
    const toggleDay = (d: number) => {
      const next = new Set(daySet);
      const key = String(d);
      if (next.has(key)) next.delete(key); else next.add(key);
      save({ reminderDays: Array.from(next).map(Number).sort((a, b) => a - b).join(',') });
    };

    return (
      <View style={{ marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.hairline, gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="label" color={colors.ink2}>{t('settings.reminderTime')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
            <Stepper label="−" onPress={() => setTime(hour - 1, half)} />
            <Text variant="body" weight="bold" style={{ minWidth: 46, textAlign: 'center' }}>{time}</Text>
            <Stepper label="+" onPress={() => setTime(hour + 1, half)} />
            <HalfBtn label=":00" active={!half} onPress={() => setTime(hour, false)} />
            <HalfBtn label=":30" active={half} onPress={() => setTime(hour, true)} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {labels.map((lab, d) => (
            <DayButton key={d} label={lab} active={daySet.has(String(d))} onPress={() => toggleDay(d)} />
          ))}
        </View>
      </View>
    );
  }

  function Stepper({ label, onPress }: { label: string; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} hitSlop={6} style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="body" weight="bold" color={colors.ink2}>{label}</Text>
      </Pressable>
    );
  }

  function HalfBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: active ? brand.purple : colors.surface2 }}>
        <Text variant="label" weight="bold" color={active ? '#fff' : colors.ink2}>{label}</Text>
      </Pressable>
    );
  }

  function DayButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: active ? brand.purple : colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="label" weight="bold" color={active ? '#fff' : colors.ink2}>{label}</Text>
      </Pressable>
    );
  }
}

/**
 * Special Days manager — inline form + list inside Profile settings. Renders for
 * BOTH tiers (Free adds up to 3, then a Pro teaser at the limit). Pick an emoji
 * (12 presets), name it, choose month + day (chip pickers), then Add.
 * GET/POST/DELETE /api/events (the no-query list shape).
 */
import { useState } from 'react';
import { View, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { SparkleIcon } from '../../icons/Glyphs';
import { useTheme } from '../../../theme/ThemeProvider';
import { usePersonalEvents, useCreateEvent, useDeleteEvent } from '../../../hooks/queries';
import { useToast } from '../../Toast';
import { APP_TIMEZONE } from '../../../config';
import { ApiError, errorMessageKey } from '../../../api/errors';
import type { PersonalEvent } from '../../../api/types';

const EMOJIS = ['🎂', '🎉', '💍', '❤️', '🎓', '✈️', '🏠', '👶', '🐶', '⭐', '🎄', '🌸'];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function PersonalEventsManager({ isPremium }: { isPremium: boolean }) {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow } = useTheme();
  const router = useRouter();
  const events = usePersonalEvents();
  const create = useCreateEvent();
  const del = useDeleteEvent();
  const toast = useToast();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎂');
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [limitHit, setLimitHit] = useState(false);

  const list = events.data?.events ?? [];
  const atLimit = !isPremium && list.length >= 3;
  const canAdd = !!name.trim() && !create.isPending && !atLimit;

  const monthShort = (m: number) =>
    new Intl.DateTimeFormat(i18n.language === 'th' ? 'th-TH' : 'en-US', { month: 'short', timeZone: APP_TIMEZONE }).format(new Date(Date.UTC(2020, m - 1, 1)));
  const daysInMonth = new Date(Date.UTC(2020, month, 0)).getUTCDate();

  const onAdd = async () => {
    if (!canAdd) return;
    try {
      await create.mutateAsync({ label: name.trim(), month, day: Math.min(day, daysInMonth), emoji });
      toast.show(t('profile.saved'));
      setName('');
      setEmoji('🎂');
      setEmojiOpen(false);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'limit_reached') setLimitHit(true);
      else toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  const onDelete = async (ev: PersonalEvent) => {
    try {
      await del.mutateAsync(ev.id);
      toast.show(t('entry.deleted'));
      setLimitHit(false);
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  return (
    <View style={{ gap: space.md }}>
      <Text variant="label" color={colors.ink2} style={{ lineHeight: 21 }}>{t('profile.specialDaysHelp')}</Text>

      {/* name + emoji */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable onPress={() => setEmojiOpen((o) => !o)} style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.hairline2 }}>
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        </Pressable>
        <TextInput
          value={name}
          onChangeText={(v) => setName(v.slice(0, 40))}
          placeholder={t('profile.eventName')}
          placeholderTextColor={colors.ink3}
          style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, borderWidth: 1.5, borderColor: colors.hairline2, backgroundColor: colors.surface2, fontSize: 15, color: colors.ink }}
        />
      </View>

      {emojiOpen ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {EMOJIS.map((e) => (
            <Pressable key={e} onPress={() => { setEmoji(e); setEmojiOpen(false); }} style={{ width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: emoji === e ? 2 : 0, borderColor: brand.purple, backgroundColor: colors.surface2 }}>
              <Text style={{ fontSize: 20 }}>{e}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* month chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {MONTHS.map((m) => {
          const sel = m === month;
          return (
            <Pressable key={m} onPress={() => setMonth(m)} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: sel ? brand.purple : colors.surface2 }}>
              <Text variant="label" weight="bold" color={sel ? '#fff' : colors.ink2}>{monthShort(m)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {/* day chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dd) => {
          const sel = dd === day;
          return (
            <Pressable key={dd} onPress={() => setDay(dd)} style={{ width: 38, paddingVertical: 7, borderRadius: 12, alignItems: 'center', backgroundColor: sel ? brand.purple : colors.surface2 }}>
              <Text variant="label" weight="bold" color={sel ? '#fff' : colors.ink2}>{dd}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* add button */}
      <Pressable onPress={onAdd} disabled={!canAdd} style={{ borderRadius: 14, paddingVertical: 12, alignItems: 'center', backgroundColor: canAdd ? brand.purple : colors.hairline }}>
        {create.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text variant="label" weight="bold" color={canAdd ? '#fff' : colors.ink3}>{t('profile.addEvent')}</Text>}
      </Pressable>

      {/* at-limit teaser (free) */}
      {atLimit || limitHit ? (
        <Pressable onPress={() => router.push('/profile/subscription')} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: '#F3ECF9', borderRadius: 16, padding: space.lg }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: brand.purple, alignItems: 'center', justifyContent: 'center' }}><SparkleIcon size={18} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('profile.eventLimitTitle')}</Text>
            <Text variant="label" color={colors.ink2}>{t('profile.eventLimitError')}</Text>
          </View>
          <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('profile.upgrade')}</Text>
        </Pressable>
      ) : null}

      {/* list */}
      {list.length === 0 ? (
        <Text variant="label" color={colors.ink3}>{t('profile.noEvents')}</Text>
      ) : (
        <View style={{ gap: space.sm }}>
          {list.map((ev) => (
            <View key={ev.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20 }}>{ev.emoji}</Text></View>
              <View style={{ flex: 1 }}>
                <Text variant="label" weight="bold">{i18n.language === 'th' ? ev.labelTh ?? ev.label : ev.label}</Text>
                <Text variant="label" color={colors.ink3}>{ev.day} {monthShort(ev.month)}</Text>
              </View>
              <Pressable onPress={() => onDelete(ev)} hitSlop={8}><Text variant="label" weight="bold" color={colors.ink3}>{t('entry.delete')}</Text></Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

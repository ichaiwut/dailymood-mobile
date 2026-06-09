/**
 * Custom Moods manager (Pro) — inline form + list inside Profile settings.
 * Pick an icon (typed emoji OR an R2 custom-emoji from the 50-icon grid, mutually
 * exclusive), name it, choose a colour from the palette, then Add. POST/DELETE
 * /api/moods. (Free tier never renders this — it shows a teaser; see profile.)
 */
import { useState } from 'react';
import { View, Pressable, TextInput, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { useTheme } from '../../../theme/ThemeProvider';
import { useMoods, useCreateMood, useDeleteMood } from '../../../hooks/queries';
import { useToast } from '../../Toast';
import { moodLabel } from '../../../lib/mood';
import { R2_PUBLIC_URL } from '../../../config';
import { errorMessageKey } from '../../../api/errors';
import type { Mood } from '../../../api/types';

const PALETTE = ['#8B5CF6', '#A673F1', '#FCA45B', '#FDCB56', '#85ECCB', '#9ACDE2', '#D4BEE4', '#F26B6B'];
// 50 R2 custom emojis: rows 1-5, cols 01-10
const ICON_KEYS = Array.from({ length: 5 }, (_, r) =>
  Array.from({ length: 10 }, (_, c) => `custom-emojis/emoji_${r + 1}_${String(c + 1).padStart(2, '0')}.png`),
).flat();

export function CustomMoodManager() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow } = useTheme();
  const moods = useMoods();
  const create = useCreateMood();
  const del = useDeleteMood();
  const toast = useToast();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [emoji, setEmoji] = useState('');
  const [iconKey, setIconKey] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const custom = (moods.data ?? []).filter((m) => !m.isDefault);
  const canAdd = !!name.trim() && (!!emoji || !!iconKey) && !create.isPending;

  const reset = () => { setName(''); setEmoji(''); setIconKey(''); setColor('#8B5CF6'); setPickerOpen(false); };

  const onAdd = async () => {
    if (!canAdd) return;
    try {
      await create.mutateAsync({ emoji: emoji || '🙂', label: name.trim(), color, iconKey: iconKey || undefined });
      toast.show(t('profile.saved'));
      reset();
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  const onDelete = async (m: Mood) => {
    try {
      await del.mutateAsync(m.id);
      toast.show(t('entry.deleted'));
    } catch (e) {
      toast.show(t(errorMessageKey(e)), 'error');
    }
  };

  return (
    <View style={{ gap: space.md }}>
      <Text variant="label" color={colors.ink2} style={{ lineHeight: 21 }}>{t('profile.customMoodsHelp')}</Text>

      {/* add form */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable onPress={() => setPickerOpen((o) => !o)} style={{ width: 52, height: 52, borderRadius: 16, borderWidth: 2, borderColor: colors.hairline2, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
          {iconKey ? (
            <Image source={{ uri: `${R2_PUBLIC_URL}/${iconKey}` }} style={{ width: 32, height: 32 }} />
          ) : emoji ? (
            <Text style={{ fontSize: 26 }}>{emoji}</Text>
          ) : (
            <Text style={{ fontSize: 24, color: colors.ink3 }}>＋</Text>
          )}
        </Pressable>
        <TextInput
          value={name}
          onChangeText={(v) => setName(v.slice(0, 32))}
          placeholder={t('profile.customMoodName')}
          placeholderTextColor={colors.ink3}
          style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, borderWidth: 1.5, borderColor: colors.hairline2, backgroundColor: colors.surface2, fontSize: 15, color: colors.ink }}
        />
        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: color }} />
        </View>
      </View>

      {/* colour palette */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PALETTE.map((c) => (
          <Pressable key={c} onPress={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: colors.ink }} />
        ))}
      </View>

      {/* icon picker */}
      {pickerOpen ? (
        <View style={{ backgroundColor: colors.surface2, borderRadius: 18, padding: space.md, gap: space.sm }}>
          <Text variant="label" weight="bold" color={colors.ink3}>{t('profile.pickIcon')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <TextInput
              value={emoji}
              onChangeText={(v) => { setEmoji(v.slice(0, 4)); if (v) setIconKey(''); }}
              placeholder="🙂"
              placeholderTextColor={colors.ink3}
              style={{ width: 52, height: 44, textAlign: 'center', borderRadius: 12, borderWidth: 2, borderColor: emoji ? brand.purple : colors.hairline2, backgroundColor: colors.surface, fontSize: 20, color: colors.ink }}
            />
            <Text variant="label" color={colors.ink3}>{t('profile.orPickBelow')}</Text>
          </View>
          <ScrollView style={{ maxHeight: 240 }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {ICON_KEYS.map((k) => {
              const sel = iconKey === k;
              return (
                <Pressable key={k} onPress={() => { setIconKey(k); setEmoji(''); setPickerOpen(false); }} style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: sel ? 2.5 : 0, borderColor: brand.purple, backgroundColor: colors.surface }}>
                  <Image source={{ uri: `${R2_PUBLIC_URL}/${k}` }} style={{ width: 28, height: 28 }} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* add button */}
      <Pressable onPress={onAdd} disabled={!canAdd} style={{ borderRadius: 14, paddingVertical: 12, alignItems: 'center', backgroundColor: canAdd ? brand.purple : colors.hairline }}>
        {create.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text variant="label" weight="bold" color={canAdd ? '#fff' : colors.ink3}>{t('profile.addBtn')}</Text>}
      </Pressable>

      {/* list */}
      {custom.length === 0 ? (
        <Text variant="label" color={colors.ink3}>{t('profile.noCustomMoods')}</Text>
      ) : (
        <View style={{ gap: space.sm }}>
          {custom.map((m) => (
            <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: m.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                {m.iconKey ? <Image source={{ uri: `${R2_PUBLIC_URL}/${m.iconKey}` }} style={{ width: 28, height: 28 }} /> : <Text style={{ fontSize: 22 }}>{m.emoji}</Text>}
              </View>
              <Text variant="label" weight="bold" style={{ flex: 1 }}>{moodLabel(m, i18n.language)}</Text>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: m.color }} />
              <Pressable onPress={() => onDelete(m)} hitSlop={8}><Text variant="label" weight="bold" color={colors.ink3}>{t('entry.delete')}</Text></Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

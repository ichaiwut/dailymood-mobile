/**
 * Inline "AI MOOD ASSISTANT" composer (matches the web home composer). Header +
 * textarea + activity chips + mic/camera/location toolbar + Analyze button +
 * disclaimer. Typing then Analyze hands the note to the Smart Log sheet and
 * auto-analyzes; the toolbar icons open the sheet with the note carried over
 * (photo attach + voice/location live there).
 */
import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { Button } from '../../Button';
import { TextField } from '../../TextField';
import { PaperIconButton } from '../PaperIconButton';
import { useTheme } from '../../../theme/ThemeProvider';
import { useActivities } from '../../../hooks/queries';
import { useSmartLog } from '../smartlog/SmartLogProvider';

export function AiComposer() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, sheetRadius, shadow } = useTheme();
  const activities = useActivities();
  const smartLog = useSmartLog();

  const [note, setNote] = useState('');
  const [activityId, setActivityId] = useState<string | null>(null);

  const openSheet = (autoAnalyze: boolean) =>
    smartLog.open({ note: note.trim() || undefined, autoAnalyze });

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        ...sheetRadius,
        padding: space.xl,
        gap: space.lg,
        boxShadow: shadow.md,
      }}
    >
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.md,
            backgroundColor: brand.purple,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18, color: '#fff' }}>✦</Text>
        </View>
        <Text variant="eyebrow" color={colors.primary}>{t('today.aiAssistant')}</Text>
      </View>

      <TextField
        placeholder={t('today.composerPlaceholder')}
        value={note}
        onChangeText={setNote}
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />

      {/* activity chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {(activities.data ?? []).map((a) => {
            const active = a.id === activityId;
            return (
              <Pressable
                key={a.id}
                onPress={() => setActivityId(active ? null : a.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: active ? colors.ink : colors.surface,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: active ? colors.ink : colors.hairline2,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}
              >
                <Text style={{ fontSize: 14 }}>{a.emoji}</Text>
                <Text variant="label" weight="medium" color={active ? '#fff' : colors.ink2}>
                  {i18n.language === 'th' ? a.labelTh : a.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* toolbar + analyze */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <PaperIconButton glyph="🎤" onPress={() => openSheet(false)} />
          <PaperIconButton glyph="📷" onPress={() => openSheet(false)} />
          <PaperIconButton glyph="📍" onPress={() => openSheet(false)} />
        </View>
        <Button label={`${t('smartlog.analyze')} ✦`} onPress={() => openSheet(true)} disabled={!note.trim()} />
      </View>

      <Text variant="label" color={colors.ink3}>{t('today.aiDisclaimer')}</Text>
    </View>
  );
}

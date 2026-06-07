/**
 * Smart Log — the core logging loop (handover §4):
 *   input → (Quick Save | AI Analyze) → analyzing → result(edit) → confirm
 *
 * Quota: premium = unlimited; free = 3/day. When a free user is out of quota,
 * tapping Analyze shows the rate-limit view (never a raw error) where they can
 * still Quick Save. Premium is server-enforced — we only adapt UX.
 */
import { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { SLShell } from './SLShell';
import { SLAnalyzing } from './SLAnalyzing';
import { Text } from '../../Text';
import { Button } from '../../Button';
import { TextField } from '../../TextField';
import { Notice } from '../../Notice';
import { MoodPicker } from '../../MoodPicker';
import { useTheme } from '../../../theme/ThemeProvider';
import { useMoods, useAiRemaining, useConfirmEntry, useJournalPrompt } from '../../../hooks/queries';
import { analyzeSmart } from '../../../api/log';
import { hasAiQuota } from '../../../api/ai';
import { ApiError, errorMessageKey } from '../../../api/errors';
import { findMood } from '../../../lib/mood';
import { stripBold } from '../../../lib/text';
import i18n from '../../../i18n';
import type { SmartSuggestion } from '../../../api/types';

type Step = 'input' | 'analyzing' | 'result' | 'rateLimit';

export interface SmartLogSheetProps {
  visible: boolean;
  onClose: () => void;
  initialMoodId?: string | null;
}

export function SmartLogSheet({ visible, onClose, initialMoodId }: SmartLogSheetProps) {
  const { t } = useTranslation();
  const { colors, space, radius } = useTheme();
  const router = useRouter();
  const moods = useMoods();
  const ai = useAiRemaining();
  const confirm = useConfirmEntry();

  const [step, setStep] = useState<Step>('input');
  const [moodId, setMoodId] = useState<string | null>(initialMoodId ?? null);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [suggestion, setSuggestion] = useState<SmartSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setStep('input');
      setMoodId(initialMoodId ?? null);
      setNote('');
      setTags([]);
      setNewTag('');
      setSuggestion(null);
      setError(null);
    }
  }, [visible, initialMoodId]);

  const moodList = moods.data ?? [];
  const effectiveMoodId = moodId ?? moodList[0]?.id ?? null;
  const premium = ai.data?.tier === 'premium';
  const quotaLeft = ai.data?.remaining;

  // Mood-adaptive placeholder (does not consume NLP quota).
  const journalPrompt = useJournalPrompt(
    effectiveMoodId,
    i18n.language,
    visible && step === 'input',
  );
  const notePlaceholder = journalPrompt.data?.prompt ?? t('smartlog.notePlaceholder');

  const close = () => {
    if (confirm.isPending) return;
    onClose();
  };

  const save = async (params: {
    aiSource: 'manual' | 'nlp';
  }) => {
    if (!effectiveMoodId) return;
    setError(null);
    try {
      await confirm.mutateAsync({
        moodTypeId: effectiveMoodId,
        note: note.trim() || undefined,
        tags: params.aiSource === 'nlp' ? tags : undefined,
        aiSummary: params.aiSource === 'nlp' ? suggestion?.aiSummary ?? undefined : undefined,
        sentiment: params.aiSource === 'nlp' ? suggestion?.sentiment ?? undefined : undefined,
        aiSource: params.aiSource,
        activityId: params.aiSource === 'nlp' ? suggestion?.suggestedActivityId ?? undefined : undefined,
      });
      onClose();
    } catch (e) {
      setError(t(errorMessageKey(e)));
    }
  };

  const analyze = async () => {
    if (!note.trim()) return;
    if (!premium && !hasAiQuota(ai.data)) {
      setStep('rateLimit');
      return;
    }
    setError(null);
    setStep('analyzing');
    try {
      const result = await analyzeSmart({ text: note.trim(), locale: i18n.language });
      setSuggestion(result);
      setMoodId(result.suggestedMoodId || effectiveMoodId);
      setTags(result.tags ?? []);
      setStep('result');
      ai.refetch();
    } catch (e) {
      if (e instanceof ApiError && e.code === 'rate_limited') {
        setStep('rateLimit');
        return;
      }
      setError(t(errorMessageKey(e)));
      setStep('input');
    }
  };

  const removeTag = (tag: string) => setTags((ts) => ts.filter((x) => x !== tag));
  const addTag = () => {
    const v = newTag.trim().replace(/^#/, '');
    if (v && !tags.includes(v)) setTags((ts) => [...ts, v]);
    setNewTag('');
  };

  return (
    <SLShell visible={visible} onClose={close}>
      {/* header */}
      <View style={{ marginBottom: space.lg, gap: 4 }}>
        <Text variant="eyebrow" color={colors.primary}>
          DailyMood
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="h2">{t('smartlog.title')}</Text>
          <QuotaPill premium={premium} left={quotaLeft} />
        </View>
      </View>

      {error ? <Notice message={error} tone="error" /> : null}

      {step === 'analyzing' ? <SLAnalyzing /> : null}

      {step === 'rateLimit' ? (
        <View style={{ gap: space.lg, paddingVertical: space.md }}>
          <Text variant="title">{t('smartlog.rateLimitTitle')}</Text>
          <Text variant="body" color={colors.ink2}>
            {t('smartlog.rateLimitBody')}
          </Text>
          <Button
            label={t('smartlog.rateLimitSave')}
            onPress={() => save({ aiSource: 'manual' })}
            loading={confirm.isPending}
          />
          <Button
            variant="paper"
            label={t('smartlog.goPro')}
            onPress={() => {
              onClose();
              router.push('/(tabs)/profile');
            }}
          />
        </View>
      ) : null}

      {step === 'input' || step === 'result' ? (
        <View style={{ gap: space.lg }}>
          {/* mood picker */}
          <View style={{ gap: space.sm }}>
            <Text variant="label" color={colors.ink2}>
              {t('smartlog.pickMood')}
            </Text>
            <MoodPicker
              moods={moodList}
              selectedId={effectiveMoodId}
              onSelect={(m) => setMoodId(m.id)}
            />
          </View>

          {/* note */}
          {step === 'input' ? (
            <TextField
              placeholder={notePlaceholder}
              value={note}
              onChangeText={setNote}
              multiline
              style={{ minHeight: 96, textAlignVertical: 'top' }}
            />
          ) : null}

          {/* AI result */}
          {step === 'result' && suggestion ? (
            <View style={{ gap: space.md }}>
              {suggestion.aiSummary ? (
                <View
                  style={{
                    backgroundColor: colors.surface2,
                    borderRadius: radius.md,
                    padding: space.lg,
                    gap: 6,
                  }}
                >
                  <Text variant="label" color={colors.primary}>
                    {t('smartlog.summary')}
                  </Text>
                  <Text variant="body">{stripBold(suggestion.aiSummary)}</Text>
                </View>
              ) : null}

              <Text variant="label" color={colors.ink2}>
                {t('smartlog.tags')}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {tags.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => removeTag(tag)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.hairline2,
                      borderRadius: radius.pill,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text variant="label" weight="medium">
                      #{tag}
                    </Text>
                    <Text variant="label" color={colors.ink3}>
                      ✕
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
                <View style={{ flex: 1 }}>
                  <TextField
                    placeholder={t('smartlog.addTag')}
                    value={newTag}
                    onChangeText={setNewTag}
                    onSubmitEditing={addTag}
                    returnKeyType="done"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>
          ) : null}

          {/* actions */}
          {step === 'input' ? (
            <View style={{ gap: space.md, marginTop: space.xs }}>
              <Button
                label={t('smartlog.analyze')}
                onPress={analyze}
                disabled={!note.trim()}
              />
              <Button
                variant="paper"
                label={t('smartlog.quickSave')}
                onPress={() => save({ aiSource: 'manual' })}
                loading={confirm.isPending}
              />
            </View>
          ) : (
            <Button
              label={t('smartlog.save')}
              onPress={() => save({ aiSource: 'nlp' })}
              loading={confirm.isPending}
            />
          )}
        </View>
      ) : null}
    </SLShell>
  );
}

function QuotaPill({ premium, left }: { premium: boolean; left?: number }) {
  const { t } = useTranslation();
  const { colors, brand, radius } = useTheme();
  const label = premium
    ? t('smartlog.quotaUnlimited')
    : t('smartlog.quotaLeft', { count: left ?? 0 });
  return (
    <View
      style={{
        backgroundColor: premium ? brand.purple : colors.surface2,
        borderRadius: radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Text variant="label" weight="medium" color={premium ? '#fff' : colors.ink2}>
        {label}
      </Text>
    </View>
  );
}

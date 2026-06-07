/**
 * Smart Log — the core logging loop (handover §4):
 *   input → (Quick Save | AI Analyze) → analyzing → result(edit) → confirm
 *
 * Quota: premium = unlimited; free = 3/day. When a free user is out of quota,
 * tapping Analyze shows the rate-limit view (never a raw error) where they can
 * still Quick Save. Premium is server-enforced — we only adapt UX.
 */
import { useEffect, useState } from 'react';
import { View, Pressable, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { BottomSheet } from '../../BottomSheet';
import { SLAnalyzing } from './SLAnalyzing';
import { Text } from '../../Text';
import { Button } from '../../Button';
import { TextField } from '../../TextField';
import { Notice } from '../../Notice';
import { MoodPicker } from '../../MoodPicker';
import { useTheme } from '../../../theme/ThemeProvider';
import {
  useMoods,
  useAiRemaining,
  useConfirmEntry,
  useJournalPrompt,
  useActivities,
} from '../../../hooks/queries';
import { analyzeSmart, uploadImage } from '../../../api/log';
import { hasAiQuota } from '../../../api/ai';
import { pickImage, optimizeImage } from '../../../lib/image';
import { ApiError, errorMessageKey } from '../../../api/errors';
import { findMood } from '../../../lib/mood';
import { stripBold } from '../../../lib/text';
import { formatDateKey, todayKey } from '../../../lib/time';
import { PaperIconButton } from '../PaperIconButton';
import {
  SparkleIcon,
  CloseIcon,
  CalendarIcon,
  CameraIcon,
  PinIcon,
  PinFilledIcon,
  MicIcon,
} from '../../icons/Glyphs';
import { LocationPill } from '../LocationPill';
import { PlaceSearchBox } from '../PlaceSearchBox';
import i18n from '../../../i18n';
import type { SmartSuggestion } from '../../../api/types';

type Step = 'input' | 'analyzing' | 'result' | 'rateLimit';

export interface SmartLogSheetProps {
  visible: boolean;
  onClose: () => void;
  initialMoodId?: string | null;
  /** Target date (ICT YYYY-MM-DD) for retroactive logging; defaults to today. */
  initialDate?: string;
  /** Prefill the note (e.g. handed off from the inline composer). */
  initialNote?: string;
  /** Run AI analyze immediately on open (when a note is prefilled). */
  autoAnalyze?: boolean;
}

export function SmartLogSheet({
  visible,
  onClose,
  initialMoodId,
  initialDate,
  initialNote,
  autoAnalyze,
}: SmartLogSheetProps) {
  const { t } = useTranslation();
  const { colors, space, radius, brand } = useTheme();
  const router = useRouter();
  const moods = useMoods();
  const ai = useAiRemaining();
  const confirm = useConfirmEntry();
  const activities = useActivities();

  const [step, setStep] = useState<Step>('input');
  const [moodId, setMoodId] = useState<string | null>(initialMoodId ?? null);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [suggestion, setSuggestion] = useState<SmartSuggestion | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [location, setLocation] = useState<{ name: string; lat?: number | null; lng?: number | null } | null>(null);
  const [locOpen, setLocOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setStep('input');
      setMoodId(initialMoodId ?? null);
      setNote(initialNote ?? '');
      setTags([]);
      setNewTag('');
      setSuggestion(null);
      setImageUri(null);
      setActivityId(null);
      setLocation(null);
      setLocOpen(false);
      setHint(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Auto-analyze a handed-off note (from the inline composer) once on open.
  useEffect(() => {
    if (visible && autoAnalyze && initialNote?.trim() && moodList.length) {
      analyze(initialNote);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const moodList = moods.data ?? [];
  const effectiveMoodId = moodId ?? moodList[0]?.id ?? null;
  const premium = ai.data?.tier === 'premium';

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
      // AI path already uploaded the photo (→ suggestion.imageKey). On a manual
      // save we must upload the picked photo here, or it would be discarded.
      let imageKey = params.aiSource === 'nlp' ? suggestion?.imageKey ?? undefined : undefined;
      if (!imageKey && imageUri) imageKey = await uploadImage(imageUri);

      await confirm.mutateAsync({
        moodTypeId: effectiveMoodId,
        note: note.trim() || undefined,
        tags: params.aiSource === 'nlp' ? tags : undefined,
        aiSummary: params.aiSource === 'nlp' ? suggestion?.aiSummary ?? undefined : undefined,
        sentiment: params.aiSource === 'nlp' ? suggestion?.sentiment ?? undefined : undefined,
        aiSource: params.aiSource,
        activityId:
          activityId ??
          (params.aiSource === 'nlp' ? suggestion?.suggestedActivityId ?? undefined : undefined),
        imageKey,
        date: initialDate,
        location: location?.name ?? undefined,
        locationLat: location?.lat ?? undefined,
        locationLng: location?.lng ?? undefined,
      });
      onClose();
    } catch (e) {
      setError(t(errorMessageKey(e)));
    }
  };

  const analyze = async (textArg?: string) => {
    const text = (textArg ?? note).trim();
    if (!text) return;
    if (!premium && !hasAiQuota(ai.data)) {
      setStep('rateLimit');
      return;
    }
    setError(null);
    setStep('analyzing');
    try {
      const result = await analyzeSmart({
        text,
        locale: i18n.language,
        imageUri: imageUri ?? undefined,
      });
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

  const addPhoto = async () => {
    if (!premium) {
      onClose();
      router.push('/profile/subscription');
      return;
    }
    const picked = await pickImage();
    if (picked) setImageUri(await optimizeImage(picked));
  };

  // Tapping the pin toggles the place search box (web parity).
  const toggleLocation = () => {
    setHint(null);
    setLocOpen((o) => !o);
  };

  const removeTag = (tag: string) => setTags((ts) => ts.filter((x) => x !== tag));
  const addTag = () => {
    const v = newTag.trim().replace(/^#/, '');
    if (v && !tags.includes(v)) setTags((ts) => [...ts, v]);
    setNewTag('');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      decoration={
        <View
          style={{
            width: 128,
            height: 26,
            borderRadius: 3,
            backgroundColor: 'rgba(212,190,228,0.75)',
            transform: [{ rotate: '-3deg' }],
          }}
        />
      }
    >
      {/* header */}
      <View style={{ marginBottom: space.lg, gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: brand.purple,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SparkleIcon size={18} color="#fff" />
            </View>
            <Text variant="h2">{t('smartlog.drawerTitle')}</Text>
          </View>
          <Pressable
            onPress={close}
            hitSlop={8}
            accessibilityLabel={t('common.cancel')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.surface3,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon size={18} color={colors.ink2} />
          </Pressable>
        </View>
        {step !== 'analyzing' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <CalendarIcon size={16} color={colors.ink3} />
            <Text variant="label" weight="bold" color={colors.ink2}>
              {formatDateKey(initialDate ?? todayKey(), i18n.language, { year: 'numeric' })}
            </Text>
          </View>
        ) : null}
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
            <>
              <TextField
                placeholder={notePlaceholder}
                value={note}
                onChangeText={setNote}
                multiline
                style={{ minHeight: 120, textAlignVertical: 'top' }}
              />
              {imageUri ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <Image source={{ uri: imageUri }} style={{ width: 64, height: 64, borderRadius: radius.md }} />
                  <Pressable onPress={() => setImageUri(null)} hitSlop={8}>
                    <Text variant="label" color={colors.danger}>✕</Text>
                  </Pressable>
                </View>
              ) : null}

              {/* toolbar: voice / photo / location  + AI quota (free) */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <PaperIconButton
                  icon={<MicIcon size={20} color={colors.ink2} />}
                  onPress={() => setHint(t('smartlog.comingSoon'))}
                />
                <PaperIconButton
                  icon={<CameraIcon size={20} color={colors.ink2} />}
                  onPress={addPhoto}
                  badge={premium ? undefined : 'PRO'}
                  dim={!premium}
                />
                <PaperIconButton
                  icon={
                    location || locOpen ? (
                      <PinFilledIcon size={20} color={brand.purple} />
                    ) : (
                      <PinIcon size={20} color={colors.ink2} />
                    )
                  }
                  onPress={toggleLocation}
                />
                {!premium ? (
                  <Text variant="label" color={colors.ink3} style={{ marginLeft: 'auto' }}>
                    {t('smartlog.quotaLeft', { count: ai.data?.remaining ?? 0 })}
                  </Text>
                ) : null}
              </View>
              {hint ? (
                <Text variant="label" color={colors.ink3}>{hint}</Text>
              ) : null}

              {/* location: search box (open) → pill (set) */}
              {locOpen ? (
                <PlaceSearchBox
                  autoFocus
                  onPick={(p) => {
                    setLocation(p);
                    setLocOpen(false);
                    setHint(null);
                  }}
                />
              ) : location ? (
                <LocationPill
                  name={location.name}
                  lat={location.lat}
                  lng={location.lng}
                  onRemove={() => setLocation(null)}
                />
              ) : null}

              {/* activity chips */}
              {activities.data?.length ? (
                <View style={{ gap: space.sm }}>
                  <Text variant="label" color={colors.ink2}>{t('smartlog.activitiesLabel')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: space.sm }}>
                    {activities.data.map((a) => {
                      const on = a.id === activityId;
                      return (
                        <Pressable
                          key={a.id}
                          onPress={() => setActivityId(on ? null : a.id)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            backgroundColor: on ? colors.ink : colors.surface,
                            borderRadius: radius.pill,
                            borderWidth: 1,
                            borderColor: on ? colors.ink : colors.hairline2,
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                          }}
                        >
                          <Text style={{ fontSize: 14 }}>{a.emoji}</Text>
                          <Text variant="label" weight="medium" color={on ? '#fff' : colors.ink2}>
                            {i18n.language === 'th' ? a.labelTh : a.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  </ScrollView>
                </View>
              ) : null}

              {/* PRO teaser — never hide premium features (handover rule). */}
              {!premium ? (
                <Pressable
                  onPress={() => {
                    onClose();
                    router.push('/profile/subscription');
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.md,
                    backgroundColor: '#ECE3F4',
                    borderRadius: radius.md,
                    paddingVertical: 14,
                    paddingHorizontal: space.lg,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      backgroundColor: brand.purple,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SparkleIcon size={16} color="#fff" />
                  </View>
                  <Text variant="label" color={colors.ink2} style={{ flex: 1 }}>
                    <Text variant="label" weight="bold" color={brand.purpleStrong}>PRO</Text>
                    {`  ${t('smartlog.proTeaser')}  `}
                    <Text variant="label" weight="bold" color={brand.purpleStrong}>
                      {t('smartlog.proUpgrade')}
                    </Text>
                  </Text>
                </Pressable>
              ) : null}
            </>
          ) : null}

          {/* AI result */}
          {step === 'result' && suggestion ? (
            <View style={{ gap: space.md }}>
              {/* the note the user wrote — read-only, kept for context */}
              {note.trim() ? (
                <View
                  style={{
                    backgroundColor: colors.surface2,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: colors.hairline,
                    padding: space.lg,
                    gap: 6,
                  }}
                >
                  <Text variant="eyebrow" color={colors.ink3}>{t('smartlog.yourNote')}</Text>
                  <Text variant="body">{note.trim()}</Text>
                </View>
              ) : null}

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
            <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.xs }}>
              <Button variant="paper" label={t('common.cancel')} onPress={close} style={{ flex: 1, paddingHorizontal: 8 }} />
              <Button
                variant="purple"
                label={`✦ ${t('smartlog.analyzeBtn')}`}
                onPress={() => analyze()}
                disabled={!note.trim()}
                style={{ flex: 1.4, paddingHorizontal: 8 }}
              />
              <Button
                label={t('common.save')}
                onPress={() => save({ aiSource: 'manual' })}
                loading={confirm.isPending}
                style={{ flex: 1, paddingHorizontal: 8 }}
              />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.xs }}>
              <Button
                variant="paper"
                label={t('smartlog.writeMyself')}
                onPress={() => setStep('input')}
                style={{ flex: 1, paddingHorizontal: 8 }}
              />
              <Button
                label={t('common.save')}
                onPress={() => save({ aiSource: 'nlp' })}
                loading={confirm.isPending}
                style={{ flex: 1.3 }}
              />
            </View>
          )}
        </View>
      ) : null}
    </BottomSheet>
  );
}

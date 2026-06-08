/**
 * Ask AI chat (/ask-ai) — Pro. Multi-turn Q&A grounded in the user's real
 * entries. Threads live in a drawer; the chat column fills the screen. Chat
 * state is kept in-memory for the session (the API's history reads currently
 * return empty — a backend gap — so we hydrate from it when it returns data but
 * never fake persistence). Non-premium → whole-page FreeGate.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { View, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../src/components/Text';
import { RichText } from '../src/components/RichText';
import { SparkleIcon } from '../src/components/icons/Glyphs';
import { PAClip } from '../src/components/paper/PAClip';
import { useTheme } from '../src/theme/ThemeProvider';
import { useToast } from '../src/components/Toast';
import { useProfile, useAskThreads, useAskSuggested } from '../src/hooks/queries';
import { sendAskMessage, sendAskFeedback, fetchAskMessages, createAskThread } from '../src/api/askai';
import { errorMessageKey } from '../src/api/errors';
import { APP_TIMEZONE } from '../src/config';
import type { AskAiThread, AskAiMessage } from '../src/api/types';

let idCounter = 0;
const genId = (p = 't') => `${p}_${Date.now()}_${idCounter++}`;

export default function AskAiScreen() {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand, shadow, sheetRadius } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const locale = i18n.language;

  const profile = useProfile();
  const premium = profile.data?.user.isPremium ?? false;
  const threadsQ = useAskThreads(premium);
  const suggestedQ = useAskSuggested(locale, premium);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [msgsByThread, setMsgsByThread] = useState<Record<string, AskAiMessage[]>>({});
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // threads are DB-backed — the server list is the source of truth
  const threads = threadsQ.data?.threads ?? [];
  const msgs = activeId ? msgsByThread[activeId] ?? [] : [];

  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(id);
  }, [msgs.length, sending]);

  const fmtTime = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit', timeZone: APP_TIMEZONE }).format(new Date(iso));

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || sending) return;
    setInput('');
    setSending(true);
    const localUserId = genId('u');
    try {
      // a thread must exist server-side before messages can be saved
      let tid = activeId;
      if (!tid) {
        const thread = await createAskThread();
        tid = thread.id;
        setActiveId(tid);
      }
      const userMsg: AskAiMessage = { id: localUserId, role: 'user', content, createdAt: new Date().toISOString() };
      setMsgsByThread((m) => ({ ...m, [tid!]: [...(m[tid!] ?? []), userMsg] }));
      const res = await sendAskMessage({ threadId: tid, content, locale });
      setMsgsByThread((m) => {
        const arr = (m[tid!] ?? []).map((x) => (x.id === localUserId ? res.userMessage : x));
        return { ...m, [tid!]: [...arr, res.aiMessage] };
      });
      threadsQ.refetch(); // server set the title / lastMessageAt
    } catch (e) {
      if (activeId) setMsgsByThread((m) => ({ ...m, [activeId]: (m[activeId] ?? []).filter((x) => x.id !== localUserId) }));
      toast.show(t(errorMessageKey(e)), 'error');
    } finally {
      setSending(false);
    }
  };

  const newThread = () => {
    setActiveId(null);
    setDrawerOpen(false);
  };

  const selectThread = (id: string) => {
    setActiveId(id);
    setDrawerOpen(false);
    if (!(msgsByThread[id]?.length)) {
      fetchAskMessages(id)
        .then((r) => {
          if (r.messages?.length) setMsgsByThread((m) => ({ ...m, [id]: r.messages }));
        })
        .catch(() => {});
    }
  };

  const react = (msg: AskAiMessage, fb: 'up' | 'down') => {
    if (msg.feedback || !activeId) return;
    setMsgsByThread((m) => ({ ...m, [activeId]: (m[activeId] ?? []).map((x) => (x.id === msg.id ? { ...x, feedback: fb } : x)) }));
    sendAskFeedback({ messageId: msg.id, feedback: fb }).catch(() => {});
    toast.show(t('insights.thanks'));
  };

  const copy = (text: string) => {
    const nav = (globalThis as { navigator?: { clipboard?: { writeText?: (s: string) => void } } }).navigator;
    if (nav?.clipboard?.writeText) {
      nav.clipboard.writeText(text);
      toast.show(t('askai.copied'));
    } else {
      Share.share({ message: text }).catch(() => {});
    }
  };

  if (!premium) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ paddingTop: insets.top + space.lg, paddingHorizontal: space.xl }}>
          <TopTabs />
        </View>
        <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.lg }}>
          <FreeGate />
        </ScrollView>
      </View>
    );
  }

  const suggestions = suggestedQ.data?.questions ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* top bar */}
      <View style={{ paddingTop: insets.top + space.md, paddingHorizontal: space.lg, paddingBottom: space.sm, flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <View style={{ flexDirection: 'row', gap: space.sm, flex: 1 }}><TopTabs /></View>
        <Pressable onPress={() => setDrawerOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8, boxShadow: shadow.sm }}>
          <Text variant="label" weight="bold" color={colors.ink2}>📋 {threads.length}</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={insets.top + 56}>
        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: space.xl, gap: space.lg, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {msgs.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.md, paddingVertical: space.x3 }}>
              <LinearGradient colors={['#FCA45B', '#A673F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 28px -10px rgba(166,115,241,0.7)' }}>
                <SparkleIcon size={30} color="#fff" />
              </LinearGradient>
              <Text variant="h2" center>{t('askai.emptyTitle')}</Text>
              <Text variant="label" color={colors.ink3} center>{t('askai.emptySub')}</Text>
              <View style={{ alignSelf: 'stretch', gap: space.sm, marginTop: space.md }}>
                <Text variant="label" weight="bold" color={colors.ink2}>{t('askai.suggestedTitle')}</Text>
                {suggestions.map((qn, i) => (
                  <Pressable key={i} onPress={() => send(qn)} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: space.lg, boxShadow: shadow.sm }}>
                    <Text variant="body" weight="medium">{qn}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <>
              {msgs.map((m) => (m.role === 'user' ? <UserBubble key={m.id} m={m} /> : <AiBubble key={m.id} m={m} />))}
              {sending ? <Thinking /> : null}
            </>
          )}
        </ScrollView>

        {/* input bar */}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.hairline, paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: insets.bottom + space.md, backgroundColor: colors.bg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.hairline2, borderRadius: 16, paddingLeft: 16, paddingRight: 6, paddingVertical: 6, boxShadow: '0 10px 28px -16px rgba(60,40,20,0.4)' }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send(input)}
              returnKeyType="send"
              placeholder={t('askai.placeholder')}
              placeholderTextColor={colors.ink3}
              editable={!sending}
              style={{ flex: 1, fontSize: 15, color: colors.ink, padding: 0 }}
            />
            <Pressable
              onPress={() => send(input)}
              disabled={!input.trim() || sending}
              style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: input.trim() && !sending ? brand.purple : colors.surface3 }}
            >
              {sending ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontSize: 17, color: input.trim() ? '#fff' : colors.ink3 }}>↑</Text>}
            </Pressable>
          </View>
          <Text variant="label" color={colors.ink3} center style={{ marginTop: 6 }}>{t('insights.disclaimer')}</Text>
        </View>
      </KeyboardAvoidingView>

      {/* threads drawer */}
      {drawerOpen ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' }}>
          <View style={{ width: 300, maxWidth: '82%', backgroundColor: colors.bg, paddingTop: insets.top + space.lg, paddingHorizontal: space.lg, borderRightWidth: 1.5, borderRightColor: colors.hairline2 }}>
            <Pressable onPress={() => setDrawerOpen(false)} hitSlop={8} style={{ marginBottom: space.md }}>
              <Text variant="label" weight="bold" color={colors.ink2}>← {t('common.back')}</Text>
            </Pressable>
            <Pressable onPress={newThread} style={{ backgroundColor: colors.ink, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center' }}>
              <Text variant="label" weight="bold" color="#fff">{t('askai.newQuestion')}</Text>
            </Pressable>
            <Text variant="label" weight="medium" color={colors.ink3} style={{ marginTop: space.lg, marginBottom: space.sm }}>{t('askai.earlier')}</Text>
            <ScrollView style={{ flex: 1 }}>
              {threads.map((th) => {
                const active = th.id === activeId;
                return (
                  <Pressable
                    key={th.id}
                    onPress={() => selectThread(th.id)}
                    style={{ padding: 14, borderRadius: 14, marginBottom: 6, backgroundColor: active ? '#F3ECF9' : 'transparent', borderLeftWidth: active ? 3 : 0, borderLeftColor: brand.purple }}
                  >
                    <Text variant="label" weight="medium" numberOfLines={1}>{th.title}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={() => setDrawerOpen(false)} />
        </View>
      ) : null}
    </View>
  );

  // ---- helpers ----
  function TopTabs() {
    const Tab = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
      <Pressable onPress={onPress} style={{ borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? colors.ink : colors.surface, boxShadow: active ? '0 6px 0 -2px #000' : shadow.sm }}>
        <Text variant="label" weight="bold" color={active ? '#fff' : colors.ink2}>{label}</Text>
      </Pressable>
    );
    return (
      <>
        <Tab label={`✨ ${t('insights.tabInsights')}`} active={false} onPress={() => router.replace('/insights')} />
        <Tab label={`💬 ${t('insights.tabAsk')}`} active onPress={() => {}} />
      </>
    );
  }

  function UserBubble({ m }: { m: AskAiMessage }) {
    return (
      <View style={{ alignSelf: 'flex-end', maxWidth: '82%', gap: 3 }}>
        <Text variant="label" color={colors.ink3} style={{ textAlign: 'right' }}>{t('askai.you')} · {fmtTime(m.createdAt)}</Text>
        <View style={{ backgroundColor: '#F3ECF9', borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 18, paddingVertical: 14 }}>
          <Text variant="body" style={{ lineHeight: 23 }}>{m.content}</Text>
        </View>
      </View>
    );
  }

  function AiBubble({ m }: { m: AskAiMessage }) {
    return (
      <View style={{ flexDirection: 'row', gap: space.sm, maxWidth: '92%' }}>
        <Avatar />
        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, borderTopLeftRadius: 4, padding: 16, gap: space.sm, boxShadow: shadow.sm }}>
          <Text variant="label" weight="bold" color={brand.purpleStrong} style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
            {t('askai.aiName')}{typeof m.entriesUsed === 'number' && m.entriesUsed > 0 ? ` · ${t('askai.entriesUsed', { n: m.entriesUsed })}` : ''}
          </Text>
          <RichText text={m.content} style={{ lineHeight: 25 }} />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <ChatPill label={`👍 ${t('insights.helpful')}`} active={m.feedback === 'up'} disabled={!!m.feedback} onPress={() => react(m, 'up')} />
            <ChatPill label={`👎 ${t('insights.notHelpful')}`} active={m.feedback === 'down'} disabled={!!m.feedback} onPress={() => react(m, 'down')} />
            <ChatPill label={`📋 ${t('askai.copy')}`} active={false} disabled={false} onPress={() => copy(m.content)} />
          </View>
        </View>
      </View>
    );
  }

  function Thinking() {
    return (
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
        <Avatar />
        <Text variant="label" color={colors.ink3}>{t('askai.thinking')}</Text>
      </View>
    );
  }

  function Avatar() {
    return (
      <LinearGradient colors={['#FCA45B', '#A673F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
        <SparkleIcon size={18} color="#fff" />
      </LinearGradient>
    );
  }

  function ChatPill({ label, active, disabled, onPress }: { label: string; active: boolean; disabled: boolean; onPress: () => void }) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled && !active}
        style={{ borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: active ? '#F3ECF9' : colors.surface, borderWidth: 1.5, borderColor: active ? brand.purple : colors.hairline2, opacity: disabled && !active ? 0.5 : 1 }}
      >
        <Text variant="label" weight="bold" color={active ? brand.purpleStrong : colors.ink2}>{label}</Text>
      </Pressable>
    );
  }

  function FreeGate(): ReactNode {
    const bullets = t('askai.freeBullets').split('|');
    return (
      <View style={{ gap: space.lg }}>
        <View style={{ gap: 4 }}>
          <Text variant="label" weight="bold" color={brand.purpleStrong} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>ASK AI</Text>
          <Text variant="h1">{t('askai.freeTitle')}</Text>
        </View>
        <View>
          <View style={{ alignSelf: 'flex-start', zIndex: 2, marginBottom: -8 }}>
            <View style={{ backgroundColor: brand.purple, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 11 }}>
              <Text weight="extrabold" color="#fff" style={{ fontSize: 15 }}>{t('askai.ctaTab')}</Text>
            </View>
          </View>
          <View>
            <View style={{ position: 'absolute', top: -20, right: 26, zIndex: 6 }}><PAClip /></View>
            <LinearGradient colors={['#2C2435', '#3D2E50', '#A673F1']} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ ...sheetRadius, borderTopLeftRadius: 0, padding: space.xl, gap: space.md, boxShadow: shadow.md }}>
              <Text style={{ fontSize: 24 }}>💬</Text>
              <Text variant="h2" color="#fff">{t('askai.freeTitle')}</Text>
              <View style={{ gap: 8 }}>
                {bullets.map((b, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 15 }}>•</Text>
                    <Text variant="label" weight="medium" color="#fff" style={{ flex: 1 }}>{b}</Text>
                  </View>
                ))}
              </View>
              <Pressable onPress={() => router.push('/profile/subscription')} style={{ backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: space.xs }}>
                <Text variant="label" weight="extrabold" color={brand.purpleStrong}>{t('insights.freeSubscribe')}</Text>
              </Pressable>
              <Text variant="label" weight="bold" color="rgba(255,255,255,0.9)" center>{t('askai.freePrice')}</Text>
            </LinearGradient>
          </View>
        </View>
        {/* blurred preview */}
        <View style={{ opacity: 0.5, gap: space.md }}>
          <View style={{ alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: '#F3ECF9', borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 18, paddingVertical: 14 }}>
            <Text variant="body">{suggestedQ.data?.questions?.[0] ?? t('askai.emptyTitle')}</Text>
          </View>
        </View>
      </View>
    );
  }
}

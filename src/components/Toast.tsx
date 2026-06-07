/**
 * Lightweight toast — a brief confirmation pill above the bottom nav. Provider
 * holds one message at a time and auto-dismisses. Use via `useToast().show(msg)`.
 * Paper Desk: white sheet, soft shadow, check glyph for success.
 */
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeProvider';

type Tone = 'success' | 'error';
interface ToastState {
  message: string;
  tone: Tone;
  id: number;
}

const ToastContext = createContext<{ show: (message: string, tone?: Tone) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((message: string, tone: Tone = 'success') => {
    clearTimeout(timer.current);
    setToast({ message, tone, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? <ToastView key={toast.id} message={toast.message} tone={toast.tone} onHide={() => setToast(null)} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ message, tone, onHide }: { message: string; tone: Tone; onHide: () => void }) {
  const { colors, radius, space, shadow, brand } = useTheme();
  const insets = useSafeAreaInsets();
  const accent = tone === 'success' ? colors.success : colors.danger;

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 104, alignItems: 'center', paddingHorizontal: 24 }}
    >
      <Pressable
        onPress={onHide}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          backgroundColor: colors.surface,
          borderRadius: radius.pill,
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderWidth: 1,
          borderColor: colors.hairline,
          boxShadow: shadow.md,
          maxWidth: '100%',
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
            {tone === 'success' ? (
              <Path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <Path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" />
            )}
          </Svg>
        </View>
        <Text variant="label" weight="bold" numberOfLines={2} style={{ flexShrink: 1 }}>
          {message}
        </Text>
      </Pressable>
    </View>
  );
}

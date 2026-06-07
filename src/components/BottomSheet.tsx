/**
 * Generic bottom sheet — backdrop + slide-up paper sheet with a drag handle,
 * rounded top, keyboard avoidance and scroll. Used by Smart Log and the
 * Calendar Day Sheet. (Gesture drag-to-dismiss is a polish item — tap the
 * backdrop to dismiss.)
 */
import type { ReactNode } from 'react';
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Decoration drawn over the sheet's top edge (e.g. washi tape). */
  decoration?: ReactNode;
}

export function BottomSheet({ visible, onClose, children, decoration }: BottomSheetProps) {
  const { colors, radius, space } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.fill}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(26,19,32,0.55)' }]}
          onPress={onClose}
          accessibilityLabel="Close"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottomAnchor}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.lg + 6,
              borderTopRightRadius: radius.lg + 6,
              maxHeight: height * 0.9,
              paddingBottom: insets.bottom + space.lg,
            }}
          >
            {decoration ? (
              <View pointerEvents="none" style={styles.decoration}>
                {decoration}
              </View>
            ) : null}
            <View style={{ alignItems: 'center', paddingVertical: space.md }}>
              <View
                style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: colors.hairline2 }}
              />
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: space.xl, paddingTop: space.xs }}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  bottomAnchor: { justifyContent: 'flex-end' },
  decoration: { position: 'absolute', top: -12, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
});

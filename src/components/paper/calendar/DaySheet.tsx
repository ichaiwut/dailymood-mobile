/**
 * Calendar Day Sheet — tap a day cell to see that day's entries in a centered
 * popup (modal). Empty days offer "+ add for this day" (opens Smart Log with the
 * date preset); future days are not loggable.
 */
import { View, ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { Button } from '../../Button';
import { EntryFolderCard } from '../EntryFolderCard';
import { CloseIcon } from '../../icons/Glyphs';
import { useTheme } from '../../../theme/ThemeProvider';
import { useEntriesByDate, useMoods } from '../../../hooks/queries';
import { useSmartLog } from '../smartlog/SmartLogProvider';
import { findMood } from '../../../lib/mood';
import { formatDateKey, isFutureKey } from '../../../lib/time';

export interface DaySheetProps {
  date: string | null;
  onClose: () => void;
  onOpenEntry: (id: string) => void;
}

export function DaySheet({ date, onClose, onOpenEntry }: DaySheetProps) {
  const { t, i18n } = useTranslation();
  const { colors, space, brand } = useTheme();
  const { height } = useWindowDimensions();
  const entries = useEntriesByDate(date);
  const moods = useMoods();
  const smartLog = useSmartLog();
  const future = date ? isFutureKey(date) : false;

  const weekday = date ? formatDateKey(date, i18n.language, { weekday: 'long', day: undefined, month: undefined, year: undefined }) : '';
  const dayMonth = date
    ? formatDateKey(date, i18n.language, { weekday: undefined, day: 'numeric', month: 'long', year: undefined })
    : '';

  return (
    <Modal visible={!!date} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close">
        {/* stop propagation: tapping the card shouldn't close */}
        <Pressable
          onPress={() => {}}
          style={{
            width: '90%',
            maxWidth: 380,
            maxHeight: height * 0.8,
            backgroundColor: colors.surface,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 26,
            borderBottomLeftRadius: 26,
            borderBottomRightRadius: 26,
            boxShadow: '0 44px 100px -24px rgba(40,20,10,0.6)',
          }}
        >
          {/* washi tape */}
          <View style={styles.washiWrap} pointerEvents="none">
            <View style={{ width: 110, height: 26, borderRadius: 2, backgroundColor: 'rgba(212,190,228,0.75)', transform: [{ rotate: '-3deg' }] }} />
          </View>

          {/* close */}
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityLabel={t('common.cancel')}
            style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center', zIndex: 6 }}
          >
            <CloseIcon size={18} color={colors.ink2} />
          </Pressable>

          <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.lg }} showsVerticalScrollIndicator={false}>
            {/* header */}
            <View style={{ gap: 2 }}>
              <Text variant="label" weight="bold" color={brand.peach}>{weekday}</Text>
              <Text variant="h1">{dayMonth}</Text>
            </View>

            {entries.isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : entries.data && entries.data.length > 0 ? (
              <View style={{ gap: space.lg }}>
                {entries.data.map((entry, i) => (
                  <EntryFolderCard
                    key={entry.id}
                    entry={entry}
                    mood={findMood(moods.data, entry.moodTypeId)}
                    rotate={i % 2 === 0 ? -0.4 : 0.4}
                    onPress={() => {
                      onClose();
                      onOpenEntry(entry.id);
                    }}
                  />
                ))}
              </View>
            ) : (
              <View style={{ gap: space.md, alignItems: 'center', paddingVertical: space.lg }}>
                <Text style={{ fontSize: 34 }}>{future ? '🔮' : '🤔'}</Text>
                <Text variant="body" color={colors.ink2} center>
                  {future ? t('calendar.futureDay') : t('calendar.emptyDay')}
                </Text>
                {!future && date ? (
                  <Button
                    label={t('calendar.addRetro')}
                    onPress={() => {
                      onClose();
                      smartLog.open({ date });
                    }}
                  />
                ) : null}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,19,32,0.46)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  washiWrap: { position: 'absolute', top: -12, left: 0, right: 0, alignItems: 'center', zIndex: 6 },
});

/**
 * Calendar Day Sheet — tap a day cell to see that day's entries in a bottom
 * sheet. Empty days offer "+ add for this day" (opens Smart Log with the date
 * preset); future days are not loggable.
 */
import { View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '../../BottomSheet';
import { Text } from '../../Text';
import { Button } from '../../Button';
import { EntryFolderCard } from '../EntryFolderCard';
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
  const { colors, space } = useTheme();
  const entries = useEntriesByDate(date);
  const moods = useMoods();
  const smartLog = useSmartLog();
  const future = date ? isFutureKey(date) : false;

  return (
    <BottomSheet visible={!!date} onClose={onClose}>
      <View style={{ gap: space.lg, paddingBottom: space.md }}>
        <Text variant="h2">{date ? formatDateKey(date, i18n.language) : ''}</Text>

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
            <Text variant="body" color={colors.ink2}>
              {future ? t('calendar.futureDay') : t('calendar.emptyDay')}
            </Text>
            {!future && date ? (
              <Button
                label={t('calendar.addRetro')}
                variant="paper"
                onPress={() => {
                  onClose();
                  smartLog.open({ date });
                }}
              />
            ) : null}
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

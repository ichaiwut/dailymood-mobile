/**
 * Location pill — pin + place name (handoff "แสดงผล"). Shown wherever an entry
 * with a location appears: Add/Edit Entry, Entry Detail, Timeline, Day Sheet.
 * When coords are present (and not removable) it opens the device map.
 */
import { View, Pressable, Linking } from 'react-native';
import { Text } from '../Text';
import { PinFilledIcon, CloseIcon } from '../icons/Glyphs';
import { useTheme } from '../../theme/ThemeProvider';

export interface LocationPillProps {
  name: string;
  lat?: number | null;
  lng?: number | null;
  /** When provided, shows a × to clear (compose surfaces). Omit for read-only. */
  onRemove?: () => void;
  maxWidth?: number;
}

export function LocationPill({ name, lat, lng, onRemove, maxWidth = 220 }: LocationPillProps) {
  const { colors, radius, brand } = useTheme();
  const hasCoords = lat != null && lng != null;

  const openMap = () => {
    if (!hasCoords) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`).catch(() => {});
  };

  const body = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        backgroundColor: colors.surface3,
        borderRadius: radius.pill,
        paddingLeft: 10,
        paddingRight: onRemove ? 6 : 12,
        paddingVertical: 6,
      }}
    >
      <PinFilledIcon size={14} color={brand.purple} />
      <Text variant="label" weight="medium" numberOfLines={1} style={{ maxWidth }}>
        {name}
      </Text>
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel="remove location">
          <CloseIcon size={14} color={colors.ink3} />
        </Pressable>
      ) : null}
    </View>
  );

  if (onRemove || !hasCoords) return body;
  return (
    <Pressable onPress={openMap} accessibilityRole="link">
      {body}
    </Pressable>
  );
}

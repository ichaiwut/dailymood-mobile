/**
 * Location editor — "เพิ่มสถานที่" chip → PlaceSearchBox (autocomplete + GPS),
 * collapsing to a LocationPill once set. Self-contained: parent holds the
 * {name, lat?, lng?} value. Used by Edit Entry (the Smart Log drawer wires the
 * PlaceSearchBox directly under its toolbar pin). Handoff: location is optional,
 * every tier, never forces a GPS prompt.
 */
import { useState } from 'react';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../Text';
import { LocationPill } from './LocationPill';
import { PlaceSearchBox } from './PlaceSearchBox';
import { PinFilledIcon } from '../icons/Glyphs';
import { useTheme } from '../../theme/ThemeProvider';

export type LocationValue = { name: string; lat?: number | null; lng?: number | null } | null;

export function LocationField({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
}) {
  const { t } = useTranslation();
  const { colors, radius, brand } = useTheme();
  const [open, setOpen] = useState(false);

  if (value && !open) {
    return <LocationPill name={value.name} lat={value.lat} lng={value.lng} onRemove={() => onChange(null)} />;
  }

  if (!open) {
    return (
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 6,
          backgroundColor: colors.surface3,
          borderRadius: radius.pill,
          paddingHorizontal: 12,
          paddingVertical: 7,
        }}
      >
        <PinFilledIcon size={14} color={brand.purple} />
        <Text variant="label" weight="medium" color={colors.ink2}>
          {t('smartlog.locationAddLabel')}
        </Text>
      </Pressable>
    );
  }

  return (
    <PlaceSearchBox
      autoFocus
      onPick={(p) => {
        onChange(p);
        setOpen(false);
      }}
    />
  );
}

/**
 * Location editor — "เพิ่มสถานที่" button → place-name search field (+ Add) with a
 * "use current location" GPS shortcut, collapsing to a LocationPill once set.
 * Self-contained: parent just holds the {name, lat?, lng?} value. Used by Edit
 * Entry (the Smart Log drawer has its own toolbar-bound variant). Handoff:
 * location is optional, every tier, never forces a GPS prompt.
 */
import { useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../Text';
import { LocationPill } from './LocationPill';
import { PinFilledIcon, SearchIcon } from '../icons/Glyphs';
import { useTheme } from '../../theme/ThemeProvider';
import { getCurrentPlace, geocodePlace } from '../../lib/location';

export type LocationValue = { name: string; lat?: number | null; lng?: number | null } | null;

export function LocationField({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
}) {
  const { t } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const addTyped = async () => {
    const name = query.trim();
    if (!name) return;
    onChange(await geocodePlace(name));
    setQuery('');
    setOpen(false);
  };

  const useCurrent = async () => {
    if (locating) return;
    setLocating(true);
    setHint(t('smartlog.locationFinding'));
    const r = await getCurrentPlace();
    setLocating(false);
    if (r.ok) {
      onChange({ name: r.name, lat: r.lat, lng: r.lng });
      setOpen(false);
      setHint(null);
    } else {
      setHint(t(r.reason === 'denied' ? 'smartlog.locationDenied' : 'smartlog.locationUnavailable'));
    }
  };

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
    <View style={{ gap: space.sm }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.hairline,
          borderRadius: radius.md,
          paddingLeft: 12,
          paddingRight: 6,
          paddingVertical: 6,
        }}
      >
        <SearchIcon size={16} color={colors.ink3} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={addTyped}
          returnKeyType="done"
          autoFocus
          placeholder={t('smartlog.locationPlaceholder')}
          placeholderTextColor={colors.ink3}
          style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.ink, padding: 0 }}
        />
        {query.trim() ? (
          <Pressable
            onPress={addTyped}
            style={{ backgroundColor: colors.ink, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 }}
          >
            <Text variant="label" weight="bold" color="#fff">
              {t('smartlog.locationAdd')}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={useCurrent}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}
      >
        <PinFilledIcon size={14} color={brand.purple} />
        <Text variant="label" weight="medium" color={colors.ink2}>
          {t('smartlog.locationCurrent')}
        </Text>
      </Pressable>
      {hint ? <Text variant="label" color={colors.ink3}>{hint}</Text> : null}
    </View>
  );
}

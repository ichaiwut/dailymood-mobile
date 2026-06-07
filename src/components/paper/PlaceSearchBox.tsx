/**
 * Place search box — text field with live autocomplete suggestions (web parity),
 * a "use current location" GPS shortcut, and a fallback "Add" for the typed text.
 * Provider-agnostic via src/lib/location (Nominatim today). Shared by the Smart
 * Log drawer and Edit Entry's LocationField.
 */
import { useEffect, useRef, useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../Text';
import { PinFilledIcon, SearchIcon } from '../icons/Glyphs';
import { useTheme } from '../../theme/ThemeProvider';
import {
  getCurrentPlace,
  geocodePlace,
  searchPlaces,
  type PlaceSuggestion,
} from '../../lib/location';

export type PickedPlace = { name: string; lat?: number | null; lng?: number | null };

export function PlaceSearchBox({
  onPick,
  autoFocus,
}: {
  onPick: (place: PickedPlace) => void;
  autoFocus?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const { colors, radius, space, brand } = useTheme();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [locating, setLocating] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounced autocomplete (Nominatim policy-friendly).
  useEffect(() => {
    clearTimeout(timer.current);
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    timer.current = setTimeout(() => {
      searchPlaces(q, i18n.language).then(setSuggestions);
    }, 400);
    return () => clearTimeout(timer.current);
  }, [query, i18n.language]);

  const addTyped = async () => {
    const name = query.trim();
    if (!name) return;
    onPick(await geocodePlace(name));
  };

  const useCurrent = async () => {
    if (locating) return;
    setLocating(true);
    setHint(t('smartlog.locationFinding'));
    const r = await getCurrentPlace();
    setLocating(false);
    if (r.ok) {
      setHint(null);
      onPick({ name: r.name, lat: r.lat, lng: r.lng });
    } else {
      setHint(t(r.reason === 'denied' ? 'smartlog.locationDenied' : 'smartlog.locationUnavailable'));
    }
  };

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
          autoFocus={autoFocus}
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

      {/* autocomplete suggestions */}
      {suggestions.map((s, i) => (
        <Pressable
          key={`${s.name}-${i}`}
          onPress={() => onPick(s)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.surface3,
            borderRadius: radius.md,
            paddingHorizontal: 12,
            paddingVertical: 9,
          }}
        >
          <PinFilledIcon size={14} color={brand.purple} />
          <Text variant="label" weight="medium" numberOfLines={1} style={{ flex: 1 }}>
            {s.name}
          </Text>
        </Pressable>
      ))}

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

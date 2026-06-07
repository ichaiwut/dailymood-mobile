/**
 * Current-place lookup for tagging a mood entry. Uses expo-location's GPS +
 * built-in reverse geocoder (no Maps API key). Web/permission-denied are handled
 * gracefully so the UI can show a gentle line — never a raw error.
 */
import { Platform } from 'react-native';
import * as Location from 'expo-location';

export type PlaceResult =
  | { ok: true; name: string; lat: number; lng: number }
  | { ok: false; reason: 'denied' | 'unavailable' };

/** Build a friendly place label from a reverse-geocode hit. */
function placeName(g: Location.LocationGeocodedAddress | undefined): string | null {
  if (!g) return null;
  // Prefer a POI/name, then narrow→wide administrative areas.
  const primary = g.name || g.district || g.city || g.subregion || g.region;
  if (!primary) return null;
  const area = g.city || g.subregion || g.region;
  // Avoid "Bangkok, Bangkok"; append the broader area only when it differs.
  return area && area !== primary ? `${primary}, ${area}` : primary;
}

export interface PlaceSuggestion {
  name: string;
  lat: number;
  lng: number;
}

/**
 * Place-name autocomplete via OpenStreetMap Nominatim (free, no API key).
 * Returns named suggestions with coords. Respects Nominatim's policy: identify
 * the client, keep volume low (the caller debounces). Swallows errors → [].
 * (Swap for Google Places New when a mobile Maps key is available.)
 */
export async function searchPlaces(query: string, locale = 'en'): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const url =
      'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5' +
      `&accept-language=${encodeURIComponent(locale)}&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'DailyMood/1.0 (https://dailymood.me)' },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{
      name?: string;
      display_name?: string;
      lat: string;
      lon: string;
    }>;
    return rows
      .map((r) => ({
        name: (r.name || r.display_name?.split(',')[0] || '').slice(0, 200),
        lat: Number(r.lat),
        lng: Number(r.lon),
      }))
      .filter((r) => r.name && Number.isFinite(r.lat) && Number.isFinite(r.lng));
  } catch {
    return [];
  }
}

/** Resolve a typed place name to coords (native only); name-only on web/failure. */
export async function geocodePlace(
  name: string,
): Promise<{ name: string; lat?: number; lng?: number }> {
  const trimmed = name.trim().slice(0, 200);
  if (!trimmed || Platform.OS === 'web') return { name: trimmed };
  try {
    const hits = await Location.geocodeAsync(trimmed);
    if (hits[0]) return { name: trimmed, lat: hits[0].latitude, lng: hits[0].longitude };
  } catch {
    // ignore — keep the name without coords.
  }
  return { name: trimmed };
}

export async function getCurrentPlace(): Promise<PlaceResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { ok: false, reason: 'denied' };

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = pos.coords;

    // Reverse geocoding is unavailable on web — fall back to coordinates.
    let name: string | null = null;
    if (Platform.OS !== 'web') {
      try {
        const hits = await Location.reverseGeocodeAsync({ latitude, longitude });
        name = placeName(hits[0]);
      } catch {
        name = null;
      }
    }

    return {
      ok: true,
      name: name ?? `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
      lat: latitude,
      lng: longitude,
    };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

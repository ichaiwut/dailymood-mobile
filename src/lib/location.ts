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

/**
 * Image helpers: pick from the library, optimize (resize ≤1600 + compress per
 * handover §3.1), and append to FormData in a platform-correct way (RN file
 * object on native, a real Blob on web).
 */
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

/** Launch the library picker. Returns the picked uri, or null if cancelled/denied. */
export async function pickImage(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: false,
  });
  if (res.canceled || !res.assets?.length) return null;
  return res.assets[0].uri;
}

/** Resize + compress to keep uploads small. Falls back to the original on error. */
export async function optimizeImage(uri: string): Promise<string> {
  try {
    const out = await manipulateAsync(uri, [{ resize: { width: MAX_DIMENSION } }], {
      compress: QUALITY,
      format: SaveFormat.JPEG,
    });
    return out.uri;
  } catch {
    return uri;
  }
}

/** Append an image to a FormData field, correctly per platform. */
export async function appendImagePart(form: FormData, field: string, uri: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    form.append(field, blob, 'photo.jpg');
  } else {
    form.append(field, { uri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
  }
}

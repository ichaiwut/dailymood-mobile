/**
 * Font families. Urbanist (Latin, 400–800) is the UI face; Noto Sans Thai
 * (400–700) covers Thai. We load both and expose weight-named families.
 *
 * Selection strategy: the shared <Text> component (src/components/Text.tsx)
 * defaults to Urbanist and lets the platform fall back for Thai glyphs; for
 * Thai-dominant copy callers can opt into the Thai family explicitly. Refining
 * per-glyph font selection is a polish-phase (M6) task.
 */
import {
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
} from '@expo-google-fonts/urbanist';
import {
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
  NotoSansThai_700Bold,
} from '@expo-google-fonts/noto-sans-thai';

/** Passed to expo-font useFonts(). */
export const fontMap = {
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
  NotoSansThai_700Bold,
};

export type FontWeightName = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export const urbanist: Record<FontWeightName, string> = {
  regular: 'Urbanist_400Regular',
  medium: 'Urbanist_500Medium',
  semibold: 'Urbanist_600SemiBold',
  bold: 'Urbanist_700Bold',
  extrabold: 'Urbanist_800ExtraBold',
};

export const notoThai: Record<Exclude<FontWeightName, 'extrabold'>, string> = {
  regular: 'NotoSansThai_400Regular',
  medium: 'NotoSansThai_500Medium',
  semibold: 'NotoSansThai_600SemiBold',
  bold: 'NotoSansThai_700Bold',
};

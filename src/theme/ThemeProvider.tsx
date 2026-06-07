/**
 * Theme context. Dark mode is force-disabled for now (M6); flip FORCE_LIGHT to
 * follow the OS scheme once the dark Paper Desk palette is tuned.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import {
  palettes,
  space,
  radius,
  sheetRadius,
  fontSize,
  brand,
  shadow,
  type ColorScheme,
  type ThemeColors,
} from './tokens';

export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
  space: typeof space;
  radius: typeof radius;
  sheetRadius: typeof sheetRadius;
  fontSize: typeof fontSize;
  brand: typeof brand;
  shadow: typeof shadow;
}

const ThemeContext = createContext<Theme | null>(null);

const FORCE_LIGHT = true;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const osScheme = useColorScheme();
  const scheme: ColorScheme = FORCE_LIGHT ? 'light' : osScheme === 'dark' ? 'dark' : 'light';
  const theme = useMemo<Theme>(
    () => ({ scheme, colors: palettes[scheme], space, radius, sheetRadius, fontSize, brand, shadow }),
    [scheme],
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

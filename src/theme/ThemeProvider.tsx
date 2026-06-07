/**
 * Theme context. Resolves the active color scheme from the OS (userInterfaceStyle
 * is "automatic") and exposes the Paper Desk palette + scales to the tree.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import {
  palettes,
  space,
  radius,
  fontSize,
  brand,
  type ColorScheme,
  type ThemeColors,
} from './tokens';

export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
  space: typeof space;
  radius: typeof radius;
  fontSize: typeof fontSize;
  brand: typeof brand;
}

const ThemeContext = createContext<Theme | null>(null);

/**
 * Dark mode is intentionally disabled for now — the Paper Desk dark palette
 * isn't tuned yet (M6 polish). Flip to false to follow the OS color scheme.
 */
const FORCE_LIGHT = true;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const osScheme = useColorScheme();
  const scheme: ColorScheme = FORCE_LIGHT ? 'light' : osScheme === 'dark' ? 'dark' : 'light';
  const theme = useMemo<Theme>(
    () => ({ scheme, colors: palettes[scheme], space, radius, fontSize, brand }),
    [scheme],
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

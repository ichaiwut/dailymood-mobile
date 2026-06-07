/**
 * Paper Desk folder = a tab (rounded top + folded corner) sitting over a sheet
 * body (asymmetric radius — the 4px top-left corner reads as a folder seam —
 * with a soft warm shadow). Ported from the handoff `.tab` / `.sheet`.
 */
import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../Text';
import { PAClip } from './PAClip';
import { WashiTape } from './WashiTape';

type SheetVariant = 'paper' | 'kraft' | 'plum' | 'peach';

/** A folder tab with a skewed folded corner. */
export function FolderTab({ label, bg, fg }: { label: string; bg: string; fg?: string }) {
  const { space } = useTheme();
  return (
    <View style={{ alignSelf: 'flex-start', zIndex: 2, marginBottom: -8 }}>
      <View
        style={{
          backgroundColor: bg,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingHorizontal: 24,
          paddingTop: 10,
          paddingBottom: 13,
        }}
      >
        <Text weight="extrabold" color={fg ?? '#fff'} style={{ fontSize: 18, letterSpacing: -0.2 }}>
          {label}
        </Text>
      </View>
      {/* folded corner */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: -11,
          width: 16,
          height: '100%',
          backgroundColor: bg,
          borderTopRightRadius: 16,
          transform: [{ skewX: '20deg' }],
          zIndex: -1,
        }}
      />
    </View>
  );
}

export interface PaperSheetProps {
  children: ReactNode;
  tab?: string;
  tabColor?: string;
  tabTextColor?: string;
  variant?: SheetVariant;
  clip?: boolean;
  washi?: boolean;
  washiColor?: string;
  style?: ViewStyle;
  rotate?: number;
}

export function PaperSheet({
  children,
  tab,
  tabColor,
  tabTextColor,
  variant = 'paper',
  clip,
  washi,
  washiColor,
  style,
  rotate = 0,
}: PaperSheetProps) {
  const { colors, sheetRadius, space, shadow, brand } = useTheme();

  const bg =
    variant === 'kraft'
      ? colors.kraft
      : variant === 'plum'
        ? colors.plum2
        : variant === 'peach'
          ? brand.peach
          : colors.surface;
  const onDark = variant === 'plum' || variant === 'peach';

  return (
    <View style={[rotate ? { transform: [{ rotate: `${rotate}deg` }] } : null, style]}>
      {tab ? <FolderTab label={tab} bg={tabColor ?? colors.primary} fg={tabTextColor} /> : null}
      <View
        style={{
          backgroundColor: bg,
          ...sheetRadius,
          // when a tab sits on top, keep the seam tight at top-left
          borderTopLeftRadius: tab ? 0 : sheetRadius.borderTopLeftRadius,
          padding: space.xl,
          boxShadow: shadow.md,
        }}
      >
        {clip ? (
          <View style={{ position: 'absolute', top: -14, left: 24, zIndex: 6 }}>
            <PAClip />
          </View>
        ) : null}
        {washi ? (
          <View style={{ position: 'absolute', top: -12, alignSelf: 'center', zIndex: 6 }}>
            <WashiTape color={washiColor ?? colors.washi} />
          </View>
        ) : null}
        <View style={onDark ? undefined : undefined}>{children}</View>
      </View>
    </View>
  );
}

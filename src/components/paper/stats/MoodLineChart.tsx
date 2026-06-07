/**
 * Mood trend line chart (SVG). Plots avgScore (1–5) per trend point with a
 * purple line + soft gradient fill + dots. Empty points (no entries) break the
 * line. Stretches to the card width via a fixed viewBox + non-uniform scaling.
 */
import { View } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import type { MoodTrendPoint } from '../../../api/types';

const W = 320;
const H = 160;
const PAD = { top: 14, right: 10, bottom: 14, left: 10 };
const Y_MIN = 1;
const Y_MAX = 5;

export function MoodLineChart({ points }: { points: MoodTrendPoint[] }) {
  const { colors, brand } = useTheme();
  const n = points.length;
  if (n === 0) return null;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (score: number) => {
    const clamped = Math.max(Y_MIN, Math.min(Y_MAX, score));
    return PAD.top + (1 - (clamped - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;
  };

  // Build line segments across consecutive scored points.
  const scored = points
    .map((p, i) => ({ i, score: typeof p.avgScore === 'number' ? p.avgScore : null }))
    .filter((p): p is { i: number; score: number } => p.score != null);

  let linePath = '';
  scored.forEach((p, idx) => {
    linePath += `${idx === 0 ? 'M' : 'L'} ${x(p.i).toFixed(1)} ${y(p.score).toFixed(1)} `;
  });
  const areaPath =
    scored.length > 1
      ? `${linePath} L ${x(scored[scored.length - 1].i).toFixed(1)} ${H - PAD.bottom} L ${x(
          scored[0].i,
        ).toFixed(1)} ${H - PAD.bottom} Z`
      : '';

  return (
    <View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="moodfill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={brand.purple} stopOpacity="0.28" />
            <Stop offset="1" stopColor={brand.purple} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* gridlines at each score */}
        {[1, 2, 3, 4, 5].map((s) => (
          <Line
            key={s}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(s)}
            y2={y(s)}
            stroke={colors.hairline}
            strokeWidth={1}
          />
        ))}

        {areaPath ? <Path d={areaPath} fill="url(#moodfill)" /> : null}
        {linePath ? (
          <Path d={linePath} stroke={brand.purple} strokeWidth={2.5} fill="none" />
        ) : null}

        {scored.map((p) => (
          <Circle key={p.i} cx={x(p.i)} cy={y(p.score)} r={3.5} fill={brand.purple} />
        ))}
      </Svg>
    </View>
  );
}

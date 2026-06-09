/**
 * Mood DNA radar — a 5-axis pentagon (calm / depth / bright / energy / social).
 * Mint fill + dark-green stroke, normalized to the largest axis.
 */
import Svg, { Polygon, Line, Circle } from 'react-native-svg';

const AXES = ['calm', 'depth', 'bright', 'energy', 'social'] as const;
const SIZE = 120;
const CX = 60;
const CY = 58;
const R = 42;

export function RadarChart({ axes }: { axes: Record<(typeof AXES)[number], number> }) {
  const max = Math.max(1, ...AXES.map((a) => axes[a] ?? 0));
  const pt = (i: number, r: number) => {
    const ang = (i / AXES.length) * 2 * Math.PI - Math.PI / 2;
    return [CX + Math.cos(ang) * r, CY + Math.sin(ang) * r] as const;
  };
  const grid = AXES.map((_, i) => pt(i, R).join(',')).join(' ');
  const shape = AXES.map((a, i) => pt(i, (axes[a] / max) * R).join(',')).join(' ');

  return (
    <Svg width={SIZE} height={SIZE - 4} viewBox={`0 0 ${SIZE} ${SIZE - 8}`}>
      {/* spokes + outer pentagon */}
      {AXES.map((_, i) => {
        const [x, yy] = pt(i, R);
        return <Line key={i} x1={CX} y1={CY} x2={x} y2={yy} stroke="rgba(27,122,90,0.18)" strokeWidth={1} />;
      })}
      <Polygon points={grid} fill="none" stroke="rgba(27,122,90,0.25)" strokeWidth={1} />
      <Polygon points={shape} fill="rgba(133,236,203,0.4)" stroke="#1B7A5A" strokeWidth={2} strokeLinejoin="round" />
      {AXES.map((a, i) => {
        const [x, yy] = pt(i, (axes[a] / max) * R);
        return <Circle key={a} cx={x} cy={yy} r={2.5} fill="#1B7A5A" />;
      })}
    </Svg>
  );
}

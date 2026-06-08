/**
 * Mood trend line chart (SVG) — the Stats signature. Plots a 1–5 valence score
 * per day (derived from each trend point's moodId via `moodScore`, since the API
 * trend carries only moodId), with a purple line + gradient area + dots, a
 * mood-face Y axis, period-aware x labels, and AI annotation "pins":
 *   • Pro  → glowing purple pins, tap to toggle a dark tooltip (with #tag refs)
 *   • Free → one blurred lavender ghost pin + an "unlock" upgrade chip
 *
 * Width is measured (onLayout) so the SVG scales uniformly and overlaid faces /
 * tooltips line up. Deferred vs the web spec: pulsing pin animation (static glow
 * here) and holiday/personal timeline markers.
 */
import { useState } from 'react';
import { View, Pressable, type LayoutChangeEvent } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Text } from '../../Text';
import { MoodFace, faceForMood } from '../MoodFace';
import { useTheme } from '../../../theme/ThemeProvider';
import { moodScore } from '../../../lib/mood';
import { APP_TIMEZONE } from '../../../config';
import type { ChartAnnotation, MoodTrendPoint, StatsPeriod } from '../../../api/types';

const VBW = 300;
const VBH = 174;
const PAD = { left: 30, right: 10, top: 14 };
const CHART_H = 116; // plot height (score band)
const AXIS_SCORES = [5, 4, 3, 2, 1];

export function MoodLineChart({
  points,
  period,
  annotations = [],
  premium,
  onUpgrade,
}: {
  points: MoodTrendPoint[];
  period: StatsPeriod;
  annotations?: ChartAnnotation[];
  premium: boolean;
  onUpgrade: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { colors, brand } = useTheme();
  const [w, setW] = useState(320);
  const [sel, setSel] = useState<number | null>(null);

  const n = points.length;
  if (n === 0) return null;

  const innerW = VBW - PAD.left - PAD.right;
  const x = (i: number) => PAD.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (score: number) => PAD.top + (1 - (Math.max(1, Math.min(5, score)) - 1) / 4) * CHART_H;

  const s = w / VBW; // uniform scale (viewBox → screen px)
  const H = VBH * s;

  // scored points (break the line on empty days)
  const scored = points
    .map((p, i) => ({ i, score: moodScore(p.moodId) }))
    .filter((p): p is { i: number; score: number } => p.score != null);

  let linePath = '';
  scored.forEach((p, idx) => {
    linePath += `${idx === 0 ? 'M' : 'L'} ${x(p.i).toFixed(1)} ${y(p.score).toFixed(1)} `;
  });
  const areaPath =
    scored.length > 1
      ? `${linePath} L ${x(scored[scored.length - 1].i).toFixed(1)} ${PAD.top + CHART_H} L ${x(scored[0].i).toFixed(1)} ${PAD.top + CHART_H} Z`
      : '';

  // x labels (week = weekday · month = every 5th date · year = month short)
  const label = (i: number): string => {
    const d = new Date(`${points[i].date}T00:00:00+07:00`);
    if (period === 'week') return new Intl.DateTimeFormat(i18n.language === 'th' ? 'th-TH' : 'en-US', { weekday: 'short', timeZone: APP_TIMEZONE }).format(d);
    if (period === 'year') return new Intl.DateTimeFormat(i18n.language === 'th' ? 'th-TH' : 'en-US', { month: 'short', timeZone: APP_TIMEZONE }).format(d);
    const day = Number(points[i].date.slice(8, 10));
    return day % 5 === 0 ? String(day) : '';
  };

  // annotation pins → map dateKey to a scored point index
  const pins = annotations
    .map((a) => {
      const i = points.findIndex((p) => p.date === a.dateKey && moodScore(p.moodId) != null);
      return i < 0 ? null : { a, i, score: moodScore(points[i].moodId)! };
    })
    .filter((p): p is { a: ChartAnnotation; i: number; score: number } => p != null)
    .sort((p, q) => q.a.importance - p.a.importance);

  const ghost = pins[0]; // free users see one blurred pin
  const selPin = sel != null ? pins[sel] : null;
  const tipX = selPin ? Math.max(70, Math.min(w - 70, x(selPin.i) * s)) : 0;

  return (
    <View>
      <View onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} style={{ height: H }}>
        {/* Y-axis mood faces */}
        {AXIS_SCORES.map((sc) => (
          <View key={sc} style={{ position: 'absolute', left: 0, top: y(sc) * s - 9 }}>
            <MoodFace face={faceForScore(sc)} size={18} />
          </View>
        ))}

        <Svg width={w} height={H} viewBox={`0 0 ${VBW} ${VBH}`}>
          <Defs>
            <LinearGradient id="moodfill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={brand.purple} stopOpacity="0.25" />
              <Stop offset="1" stopColor={brand.purple} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* gridlines */}
          {AXIS_SCORES.map((sc) => (
            <Line key={sc} x1={PAD.left} x2={VBW - PAD.right} y1={y(sc)} y2={y(sc)} stroke={colors.hairline} strokeWidth={1} strokeDasharray="4 3" />
          ))}

          {areaPath ? <Path d={areaPath} fill="url(#moodfill)" /> : null}
          {linePath ? <Path d={linePath} stroke={brand.purple} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}

          {/* dots (last one emphasized) */}
          {scored.map((p, idx) => {
            const last = idx === scored.length - 1;
            return last ? (
              <Circle key={p.i} cx={x(p.i)} cy={y(p.score)} r={6} fill={brand.purple} />
            ) : (
              <Circle key={p.i} cx={x(p.i)} cy={y(p.score)} r={4} fill="#fff" stroke={brand.purple} strokeWidth={2.5} />
            );
          })}

          {/* x labels */}
          {points.map((_, i) =>
            label(i) ? (
              <SvgText key={i} x={x(i)} y={PAD.top + CHART_H + 18} fontSize={period === 'year' ? 9 : 11} fill={colors.ink3} textAnchor="middle">
                {label(i)}
              </SvgText>
            ) : null,
          )}

          {/* AI pins (Pro) — visuals only; tap targets are RN overlays below
              (rn-svg shapes don't support the touch responder on web) */}
          {premium ? (
            pins.map((p, idx) => <Pin key={`pin-${idx}`} cx={x(p.i)} cy={y(p.score)} color={brand.purple} active={sel === idx} />)
          ) : ghost ? (
            <>
              <Circle cx={x(ghost.i)} cy={y(ghost.score)} r={9} fill="#C9B8E8" opacity={0.5} />
              <Circle cx={x(ghost.i)} cy={y(ghost.score)} r={4} fill="#C9B8E8" opacity={0.5} />
            </>
          ) : null}
        </Svg>

        {/* AI pin tap targets (RN overlay — reliable on web + native) */}
        {premium
          ? pins.map((p, idx) => (
              <Pressable
                key={`hit-${idx}`}
                onPress={() => setSel(sel === idx ? null : idx)}
                style={{ position: 'absolute', left: x(p.i) * s - 16, top: y(p.score) * s - 16, width: 32, height: 32 }}
              />
            ))
          : null}

        {/* tooltip */}
        {premium && selPin ? (
          <View style={{ position: 'absolute', top: Math.max(0, y(selPin.score) * s - 64), left: tipX - 90, width: 180, alignItems: 'center' }}>
            <View style={{ backgroundColor: '#1A1320', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 2 }}>
              <Text variant="label" weight="bold" color="#fff">{i18n.language === 'th' ? selPin.a.labelTh : selPin.a.labelEn}</Text>
              {selPin.a.tagRefs?.length ? <Text variant="label" color="#C9B8E8">{selPin.a.tagRefs.join('  ')}</Text> : null}
            </View>
          </View>
        ) : null}
      </View>

      {/* free upgrade chip */}
      {!premium && ghost ? (
        <Pressable
          onPress={onUpgrade}
          style={{ marginTop: 10, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(166,115,241,0.1)', borderWidth: 1, borderColor: 'rgba(166,115,241,0.4)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
        >
          <Text variant="label" weight="bold" color={brand.purpleStrong}>{t('stats.unlockPins')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function faceForScore(score: number) {
  return faceForMood(score >= 5 ? 'amazing' : score >= 4 ? 'happy' : score >= 3 ? 'neutral' : score >= 2 ? 'sad' : 'angry');
}

/** A glowing AI pin: soft ring + solid core + sparkle (static glow; no pulse). */
function Pin({ cx, cy, color, active }: { cx: number; cy: number; color: string; active: boolean }) {
  return (
    <>
      <Circle cx={cx} cy={cy} r={active ? 12 : 10} fill={color} opacity={active ? 0.35 : 0.22} />
      <Circle cx={cx} cy={cy} r={10} fill="none" stroke={color} strokeWidth={2} opacity={0.9} />
      <Circle cx={cx} cy={cy} r={5} fill={color} />
      <SvgText x={cx} y={cy + 3} fontSize={8} fill="#fff" textAnchor="middle">✦</SvgText>
    </>
  );
}

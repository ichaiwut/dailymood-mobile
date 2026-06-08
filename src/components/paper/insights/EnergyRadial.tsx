/**
 * Energy Clock — 24 radial spokes (one per hour), length + colour by energy
 * level (≥.7 peach / ≥.4 yellow / else faint). Centre shows the peak hour.
 */
import Svg, { Line } from 'react-native-svg';
import { View } from 'react-native';
import { Text } from '../../Text';

const SIZE = 120;
const C = 60;
const INNER = 16;
const OUTER = 52;

function color(v: number) {
  return v >= 0.7 ? '#FCA45B' : v >= 0.4 ? '#FDCB56' : 'rgba(166,115,241,0.18)';
}

export function EnergyRadial({ hourly, peakLabel }: { hourly: number[]; peakLabel: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute' }}>
        {hourly.slice(0, 24).map((v, i) => {
          const ang = (i / 24) * 2 * Math.PI - Math.PI / 2;
          const len = INNER + Math.max(0, Math.min(1, v)) * (OUTER - INNER);
          return (
            <Line
              key={i}
              x1={C + Math.cos(ang) * INNER}
              y1={C + Math.sin(ang) * INNER}
              x2={C + Math.cos(ang) * len}
              y2={C + Math.sin(ang) * len}
              stroke={color(v)}
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
      <Text weight="extrabold" style={{ fontSize: 16, color: '#E08A2B' }}>{peakLabel}</Text>
    </View>
  );
}

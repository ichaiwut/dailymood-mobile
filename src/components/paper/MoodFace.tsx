/**
 * MoodFace — the brand's line-art mood expressions (ported 1:1 from the design
 * handoff `MoodFace`). 7 faces: great / good / okay / meh / bad / awful / calm.
 * Drawn as SVG: a face circle + two dot eyes + an expression mouth.
 */
import Svg, { Circle, Path, Line } from 'react-native-svg';

export type FaceType = 'great' | 'good' | 'okay' | 'meh' | 'bad' | 'awful' | 'calm';

const INK = '#1A1320';

/** Map an API mood id to the closest brand face (by valence). */
export function faceForMood(moodId: string | null | undefined): FaceType {
  switch (moodId) {
    case 'amazing':
      return 'great';
    case 'happy':
      return 'good';
    case 'neutral':
      return 'okay';
    case 'tired':
      return 'meh';
    case 'anxious':
      return 'bad';
    case 'sad':
      return 'bad';
    case 'angry':
      return 'awful';
    case 'calm':
      return 'calm';
    default:
      return 'okay';
  }
}

export function MoodFace({ face, size = 48, bg = 'transparent' }: { face: FaceType; size?: number; bg?: string }) {
  const w = size;
  const eyeR = size * 0.06;
  const sw = size * 0.05;

  let mouth: React.ReactNode;
  switch (face) {
    case 'great':
      mouth = <Path d={`M ${w * 0.32} ${w * 0.62} Q ${w * 0.5} ${w * 0.82} ${w * 0.68} ${w * 0.62}`} stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />;
      break;
    case 'good':
      mouth = <Path d={`M ${w * 0.34} ${w * 0.62} Q ${w * 0.5} ${w * 0.74} ${w * 0.66} ${w * 0.62}`} stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />;
      break;
    case 'okay':
      mouth = <Line x1={w * 0.36} y1={w * 0.66} x2={w * 0.64} y2={w * 0.66} stroke={INK} strokeWidth={sw} strokeLinecap="round" />;
      break;
    case 'meh':
      mouth = <Path d={`M ${w * 0.34} ${w * 0.68} Q ${w * 0.5} ${w * 0.62} ${w * 0.66} ${w * 0.68}`} stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />;
      break;
    case 'bad':
      mouth = <Path d={`M ${w * 0.34} ${w * 0.72} Q ${w * 0.5} ${w * 0.58} ${w * 0.66} ${w * 0.72}`} stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />;
      break;
    case 'awful':
      mouth = <Path d={`M ${w * 0.32} ${w * 0.74} Q ${w * 0.5} ${w * 0.54} ${w * 0.68} ${w * 0.74}`} stroke={INK} strokeWidth={sw} fill="none" strokeLinecap="round" />;
      break;
    default: // calm
      mouth = <Circle cx={w * 0.5} cy={w * 0.66} r={size * 0.05} fill={INK} />;
  }

  return (
    <Svg width={w} height={w} viewBox={`0 0 ${w} ${w}`}>
      <Circle cx={w * 0.5} cy={w * 0.5} r={w * 0.48} fill={bg} />
      <Circle cx={w * 0.36} cy={w * 0.42} r={eyeR} fill={INK} />
      <Circle cx={w * 0.64} cy={w * 0.42} r={eyeR} fill={INK} />
      {mouth}
    </Svg>
  );
}

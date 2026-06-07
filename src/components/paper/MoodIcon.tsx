/**
 * Mood-pack icon — renders the user's real pack SVG from R2 (the rich brand
 * faces). Falls back to the line-art MoodFace if the remote SVG fails to load
 * (offline, unknown custom mood, etc.).
 */
import { useState } from 'react';
import { SvgUri } from 'react-native-svg';
import { MoodFace, faceForMood } from './MoodFace';
import { moodIconUrl, DEFAULT_MOOD_PACK } from '../../config';

export function MoodIcon({
  moodId,
  size = 48,
  pack = DEFAULT_MOOD_PACK,
}: {
  moodId: string;
  size?: number;
  pack?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <MoodFace face={faceForMood(moodId)} size={size} />;

  return (
    <SvgUri
      uri={moodIconUrl(moodId, pack)}
      width={size}
      height={size}
      onError={() => setFailed(true)}
    />
  );
}

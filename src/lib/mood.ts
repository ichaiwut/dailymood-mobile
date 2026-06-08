/** Mood helpers shared across screens. */
import type { Mood } from '../api/types';

export function moodLabel(mood: Mood | undefined, lang: string): string {
  if (!mood) return '';
  return lang === 'th' ? mood.labelTh : mood.label;
}

export function findMood(moods: Mood[] | undefined, id: string | null | undefined): Mood | undefined {
  if (!moods || !id) return undefined;
  return moods.find((m) => m.id === id);
}

/**
 * Approximate 1–5 valence score for a mood id, used to plot the mood-trend line
 * (the API's per-day trend points carry only a moodId, no score). Default 3.
 */
const MOOD_SCORE: Record<string, number> = {
  amazing: 5,
  happy: 4,
  calm: 4,
  neutral: 3,
  tired: 2.5,
  sad: 2,
  anxious: 2,
  angry: 1,
};
export function moodScore(moodId: string | null | undefined): number | null {
  if (!moodId) return null;
  return MOOD_SCORE[moodId] ?? 3;
}

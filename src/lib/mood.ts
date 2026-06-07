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

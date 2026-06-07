/**
 * AI helper endpoints: quota + mood-adaptive journaling prompts.
 */
import { apiFetch } from './client';
import type { AiRemaining, JournalPrompt } from './types';

/** GET /api/ai/remaining — premium = unlimited; free returns a count. */
export function fetchAiRemaining(): Promise<AiRemaining> {
  return apiFetch<AiRemaining>('/api/ai/remaining');
}

/** True when the user has AI analyses left (premium is always true). */
export function hasAiQuota(r: AiRemaining | undefined): boolean {
  if (!r) return true; // optimistic until loaded
  if (r.tier === 'premium') return true;
  return (r.remaining ?? 0) > 0;
}

/**
 * GET /api/ai/journal-prompt — mood-adaptive placeholder. Free: static,
 * Premium: Gemini-generated. Does not consume NLP quota.
 */
export function fetchJournalPrompt(
  moodId: string,
  locale: string,
  moodLabel?: string,
): Promise<JournalPrompt> {
  const qs = new URLSearchParams({ moodId, locale });
  if (moodLabel) qs.set('moodLabel', moodLabel);
  return apiFetch<JournalPrompt>(`/api/ai/journal-prompt?${qs.toString()}`);
}

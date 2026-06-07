/**
 * Mood-entry endpoints.
 *
 * Smart Log flow (handover §4): analyze (no DB write) → user edits → confirm.
 *   - analyzeSmart: multipart text/image → Gemini suggestion
 *   - confirmEntry: persist the final entry → returns { id }
 *   - listEntries: entries for a given ICT date (signed image URLs)
 */
import { apiFetch } from './client';
import type { MoodEntry, SmartSuggestion, ConfirmEntryInput } from './types';

/**
 * POST /api/log/smart — multipart. `text` and/or `image` (premium AI Vision).
 * Returns a suggestion; nothing is saved yet.
 */
export function analyzeSmart(params: {
  text?: string;
  locale?: string;
  image?: { uri: string; name: string; type: string };
}): Promise<SmartSuggestion> {
  const form = new FormData();
  if (params.text) form.append('text', params.text);
  if (params.locale) form.append('locale', params.locale);
  if (params.image) {
    // React Native FormData file part.
    form.append('image', {
      uri: params.image.uri,
      name: params.image.name,
      type: params.image.type,
    } as unknown as Blob);
  }
  return apiFetch<SmartSuggestion>('/api/log/smart', { method: 'POST', body: form });
}

/** POST /api/log/confirm — save the final entry. Returns the new id. */
export function confirmEntry(input: ConfirmEntryInput): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/api/log/confirm', { method: 'POST', body: input });
}

/** GET /api/log?date=YYYY-MM-DD — entries for one ICT day. */
export function listEntries(date?: string): Promise<MoodEntry[]> {
  const qs = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiFetch<{ entries: MoodEntry[] }>(`/api/log${qs}`).then((r) => r.entries);
}

/** DELETE /api/log/:id */
export function deleteEntry(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/log/${id}`, { method: 'DELETE' });
}

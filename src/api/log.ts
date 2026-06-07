/**
 * Mood-entry endpoints.
 *
 * Smart Log flow (handover §4): analyze (no DB write) → user edits → confirm.
 *   - analyzeSmart: multipart text/image → Gemini suggestion
 *   - confirmEntry: persist the final entry → returns { id }
 *   - listEntries: entries for a given ICT date (signed image URLs)
 */
import { apiFetch } from './client';
import { appendImagePart } from '../lib/image';
import type {
  MoodEntry,
  SmartSuggestion,
  ConfirmEntryInput,
  EntryDetail,
  UpdateEntryInput,
} from './types';

/**
 * POST /api/log/smart — multipart. `text` and/or `imageUri` (premium AI Vision).
 * Uploads + analyzes in one call; the returned suggestion carries `imageKey` to
 * pass to confirm. Nothing is saved yet.
 */
export async function analyzeSmart(params: {
  text?: string;
  locale?: string;
  imageUri?: string;
}): Promise<SmartSuggestion> {
  const form = new FormData();
  if (params.text) form.append('text', params.text);
  if (params.locale) form.append('locale', params.locale);
  if (params.imageUri) await appendImagePart(form, 'image', params.imageUri);
  return apiFetch<SmartSuggestion>('/api/log/smart', { method: 'POST', body: form });
}

/**
 * POST /api/upload — multipart image → R2, returns its imageKey. Used for a
 * manual save with a photo (the AI Analyze path uploads via /api/log/smart).
 * Premium-only (server-enforced).
 */
export async function uploadImage(imageUri: string): Promise<string> {
  const form = new FormData();
  await appendImagePart(form, 'image', imageUri);
  const res = await apiFetch<{ imageKey: string }>('/api/upload', { method: 'POST', body: form });
  return res.imageKey;
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

/** GET /api/log/:id — full entry + context (nearby, streak, flashback). */
export function getEntry(id: string): Promise<EntryDetail> {
  return apiFetch<EntryDetail>(`/api/log/${id}`);
}

/** PATCH /api/log/:id — update an entry. */
export function updateEntry(id: string, input: UpdateEntryInput): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/log/${id}`, { method: 'PATCH', body: input });
}

/** DELETE /api/log/:id */
export function deleteEntry(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/log/${id}`, { method: 'DELETE' });
}

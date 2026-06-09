/**
 * Ask AI chat endpoints (Pro). Multi-turn Q&A grounded in the user's real
 * entries. The client owns the threadId (the web mirrors localStorage); the
 * server persists to a DB mirror. POST /messages returns both the echoed user
 * message and the AI reply (with the entries it referenced).
 */
import { apiFetch } from './client';
import type { AskAiThread, AskAiMessage, AskAiSendResult } from './types';

export function fetchAskThreads(): Promise<{ threads: AskAiThread[] }> {
  return apiFetch('/api/ask-ai/threads');
}

/** POST /api/ask-ai/threads — create a server-side thread (DB-backed) and get its id.
 *  Must be called before posting messages; the server sets the title from the first message. */
export function createAskThread(title = ''): Promise<AskAiThread> {
  return apiFetch('/api/ask-ai/threads', { method: 'POST', body: { title } });
}

export function fetchAskMessages(threadId: string): Promise<{ messages: AskAiMessage[] }> {
  return apiFetch(`/api/ask-ai/messages?threadId=${encodeURIComponent(threadId)}`);
}

export function sendAskMessage(body: { threadId: string; content: string; locale: string }): Promise<AskAiSendResult> {
  return apiFetch('/api/ask-ai/messages', { method: 'POST', body });
}

/** PATCH (NOT POST — POST is for sending new questions and 400s on this body). */
export function sendAskFeedback(body: { messageId: string; feedback: 'up' | 'down' }): Promise<unknown> {
  return apiFetch('/api/ask-ai/messages', { method: 'PATCH', body });
}

export function fetchAskSuggested(locale: string): Promise<{ questions: string[] }> {
  return apiFetch(`/api/ask-ai/suggested?locale=${locale}`);
}

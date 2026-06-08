/**
 * Ask AI history mirror. The server's GET /api/ask-ai/threads + /messages return
 * empty (history isn't read back yet), and the web client treats localStorage as
 * the source of truth — keys `askai_threads` and `askai_msgs_{threadId}`. We use
 * the same keys so mobile-on-web persists across reloads and interops with the
 * web app. On native there's no localStorage, so these no-op (session-only) until
 * a persistence layer / working API lands.
 */
import type { AskAiThread, AskAiMessage } from '../api/types';

function ls(): Storage | undefined {
  try {
    return (globalThis as { localStorage?: Storage }).localStorage;
  } catch {
    return undefined;
  }
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = ls()?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    ls()?.setItem(key, JSON.stringify(value));
  } catch {
    // private mode / native — ignore
  }
}

export const askStore = {
  getThreads(): AskAiThread[] {
    return read<AskAiThread[]>('askai_threads', []);
  },
  setThreads(threads: AskAiThread[]): void {
    write('askai_threads', threads);
  },
  getMessages(threadId: string): AskAiMessage[] {
    return read<AskAiMessage[]>(`askai_msgs_${threadId}`, []);
  },
  setMessages(threadId: string, messages: AskAiMessage[]): void {
    write(`askai_msgs_${threadId}`, messages);
  },
};

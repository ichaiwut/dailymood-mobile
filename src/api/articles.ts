/**
 * Saved articles + article reactions (Profile §D). Both auth-required, sorted by
 * most-recently bookmarked / reacted. `coverImageUrl` is a signed URL (may be
 * null → render generative ArticleArt). `/reactions` adds `moodTypeId`.
 */
import { apiFetch } from './client';
import type { ArticleItem } from './types';

export function fetchBookmarks(): Promise<{ articles: ArticleItem[] }> {
  return apiFetch('/api/articles/bookmarks');
}

export function fetchReactions(): Promise<{ articles: ArticleItem[] }> {
  return apiFetch('/api/articles/reactions');
}

/** Saved articles (♥) — GET /api/articles/bookmarks. See ArticleClippings. */
import { ArticleClippings } from '../../src/components/paper/articles/ArticleClippings';

export default function SavedArticlesScreen() {
  return <ArticleClippings variant="saved" />;
}

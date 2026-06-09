/** Article reactions (💭) — GET /api/articles/reactions (mood per article). */
import { ArticleClippings } from '../../src/components/paper/articles/ArticleClippings';

export default function ArticleReactionsScreen() {
  return <ArticleClippings variant="reactions" />;
}

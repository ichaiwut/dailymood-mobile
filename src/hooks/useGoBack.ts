/**
 * Safe back navigation. `router.back()` throws "GO_BACK was not handled" when
 * there's nothing to pop (deep link / web reload / after a redirect). This falls
 * back to a route when the stack is empty.
 */
import { useRouter, type Href } from 'expo-router';

export function useGoBack(fallback: Href = '/(tabs)') {
  const router = useRouter();
  return () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
  };
}

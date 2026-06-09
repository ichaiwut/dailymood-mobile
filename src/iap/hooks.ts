/**
 * TanStack hooks over the RevenueCat wrapper. These own the *data* concerns
 * (fetching offerings, running the purchase + backend reconcile, cache
 * invalidation). `useBilling` consumes them and owns the *UX* (toasts, busy,
 * navigation) so screens never touch RevenueCat directly.
 *
 * Purchase/restore follow the "await reconcile" rule: after the store confirms,
 * we POST /api/iap/reconcile (backend pulls RC's REST API and flips isPremium),
 * then refresh the profile/subscription caches — so Pro reflects immediately
 * rather than waiting on the RC webhook. If that reconcile call fails *after*
 * the store already charged, we surface `pending` (not an error): the charge is
 * real and the RC webhook will flip isPremium shortly.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PurchasesPackage } from 'react-native-purchases';
import { queryKeys } from '../hooks/queries';
import { reconcileIap } from '../api/subscription';
import {
  getCurrentOffering,
  hasProEntitlement,
  iapPlatform,
  isIapSupported,
  isUserCancelled,
  purchase,
  restorePurchases,
} from './purchases';
import type { SubscriptionData } from '../api/types';

/** The current Offering (for live store prices). Native-only; disabled on web. */
export function useOfferings(enabled = true) {
  return useQuery({
    queryKey: queryKeys.iapOfferings,
    queryFn: getCurrentOffering,
    enabled: enabled && isIapSupported(),
    staleTime: 5 * 60_000,
  });
}

/**
 * Outcome of a purchase or restore:
 *  - `ok`        store confirmed AND backend reconciled — `sub` is fresh state.
 *  - `pending`   store confirmed but the reconcile call failed; the RC webhook
 *                will flip isPremium shortly (tell the user; don't claim failure).
 *  - `cancelled` user dismissed the purchase sheet (purchase only).
 *  - `notFound`  nothing active to restore (restore only).
 */
export type IapOutcome =
  | { status: 'ok'; sub: SubscriptionData }
  | { status: 'pending' }
  | { status: 'cancelled' }
  | { status: 'notFound' };

/** Push fresh subscription state into the caches that gate Pro. */
function refreshSubscriptionCaches(
  qc: ReturnType<typeof useQueryClient>,
  sub?: SubscriptionData,
) {
  if (sub) qc.setQueryData(queryKeys.subscription, sub);
  qc.invalidateQueries({ queryKey: queryKeys.subscription });
  qc.invalidateQueries({ queryKey: queryKeys.profile });
}

/** Reconcile after the store confirms. Never throws — failure becomes `pending`. */
async function reconcileOutcome(): Promise<IapOutcome> {
  try {
    return { status: 'ok', sub: await reconcileIap(iapPlatform()) };
  } catch {
    return { status: 'pending' };
  }
}

function applyOutcome(qc: ReturnType<typeof useQueryClient>, res: IapOutcome) {
  if (res.status === 'ok') refreshSubscriptionCaches(qc, res.sub);
  else if (res.status === 'pending') refreshSubscriptionCaches(qc);
}

/** Buy a package, reconcile with the backend, refresh caches. */
export function usePurchase() {
  const qc = useQueryClient();
  return useMutation<IapOutcome, unknown, PurchasesPackage>({
    mutationFn: async (pkg) => {
      try {
        await purchase(pkg);
      } catch (e) {
        if (isUserCancelled(e)) return { status: 'cancelled' };
        throw e; // real store failure → surfaced as an error by useBilling
      }
      return reconcileOutcome();
    },
    onSuccess: (res) => applyOutcome(qc, res),
  });
}

/** Restore prior store purchases, reconcile if an active entitlement is found. */
export function useRestore() {
  const qc = useQueryClient();
  return useMutation<IapOutcome, unknown, void>({
    mutationFn: async () => {
      const info = await restorePurchases();
      if (!hasProEntitlement(info)) return { status: 'notFound' };
      return reconcileOutcome();
    },
    onSuccess: (res) => applyOutcome(qc, res),
  });
}

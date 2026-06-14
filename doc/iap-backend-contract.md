# In-App Purchases — Backend Contract & Open Questions

**Audience:** DailyMood backend (`my.dailymood.me`)
**From:** mobile (dailymood-mobile)
**Status:** mobile side implemented against this contract; backend not yet built.

## Context

Apple and Google require digital subscriptions sold *inside* the mobile apps to go
through native in-app purchase (IAP), not Stripe. The mobile app now uses
**RevenueCat** (`react-native-purchases`) for native iOS/Android purchases. **Web is
unchanged — it keeps using Stripe Checkout/Portal.**

Gating stays **server-authoritative**: the app reads `isPremium` from
`GET /api/profile` and `GET /api/subscription` and the backend enforces every locked
feature. The app does **not** decide who is premium — RevenueCat confirms the purchase
on-device, then the backend must validate the entitlement and flip `isPremium`.

The app identifies the user to RevenueCat with `Purchases.logIn(user.id)` **before any
purchase**, so RevenueCat's `app_user_id` **is the DailyMood user id**.

What the backend needs to build:
1. `POST /api/iap/reconcile` — called by the app right after a purchase/restore.
2. `POST /api/webhooks/revenuecat` — RevenueCat lifecycle events (renewals, cancels…).
3. Two new fields on the `SubscriptionData` response (see below).

Mobile source of truth for the shapes: `src/api/subscription.ts`, `src/api/types.ts`.

---

## 1. `POST /api/iap/reconcile`

Called by the app immediately after a successful RevenueCat purchase **and** after a
"Restore Purchases" that finds an active entitlement. Its job: make `isPremium` reflect
**now** instead of waiting on the webhook.

**The backend must NOT trust the request to grant Pro.** It looks the user up by the
Bearer token, then fetches the authoritative entitlement from RevenueCat's REST API
(`GET https://api.revenuecat.com/v1/subscribers/{app_user_id}`, using the RC **secret**
key) and updates the user from that.

```
POST /api/iap/reconcile
Authorization: Bearer <access token>
Body:     { "platform": "ios" | "android" }   // hint only; RC is the truth
Response: SubscriptionData (200)               // the full, updated shape
Error:    { "error": "iap_failed" }            // JSON, NOT a 500/HTML page
```

- On RC-lookup failure → return a JSON error (e.g. `iap_failed`). The app maps it to a
  friendly "purchase received, Pro will activate shortly" message and trusts the webhook
  to catch up — **so do not 500 with HTML.**
- If the user has **no** active entitlement when called → return `SubscriptionData` with
  `isPremium: false` (a normal success, not an error).

## 2. `POST /api/webhooks/revenuecat`

Configured in the RevenueCat dashboard. Verify the `Authorization` header against the RC
webhook secret. Look the user up by `app_user_id`. **Idempotent on `event.id`.** Guard
against out-of-order / retried events using `expires_date`/timestamps so state can't
regress.

| RC event | Backend action |
|---|---|
| `INITIAL_PURCHASE`, `RENEWAL`, `UNCANCELLATION`, `PRODUCT_CHANGE`, `TRANSFER` | `isPremium=true`; set `planInterval`, `currentPeriodEnd`, `iapSource`, `hasIapSubscription=true` |
| `CANCELLATION` (auto-renew off) | `cancelAtPeriodEnd=true` — **keep `isPremium` until period end** |
| `BILLING_ISSUE` | grace period — keep `isPremium=true` until `EXPIRATION` |
| `EXPIRATION` | `isPremium=false`, `hasIapSubscription=false` |
| `REFUND` | `isPremium=false` immediately |

## 3. `SubscriptionData` — two new fields

The existing shape (returned by `GET /api/subscription` and `POST /api/iap/reconcile`)
gains two fields. The app uses them to show store-manage vs Stripe-portal and to avoid
mistaking a native subscriber for a comped account.

```ts
interface SubscriptionData {
  isPremium: boolean;
  hasStripeCustomer: boolean;
  hasIapSubscription: boolean;          // NEW — true when an active store sub grants Pro
  iapSource: 'apple' | 'google' | null; // NEW — which store, for manage/cancel deep links
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  planInterval: string | null;          // 'month' | 'year'
  subscriptionStatus: string | null;
  memberSince: string;
  trialActivatedAt: string | null;
  trialEndsAt: string | null;
  trialDaysLeft: number;
  isTrialing: boolean;
}
```

---

## Open questions

### A. Must agree — the wire contract

- [ ] **A1. Identity / alias merge.** Confirm `app_user_id` = DailyMood user id. How do
  you resolve a user across RC's anonymous→identified merge (you'll get
  `original_app_user_id` + `aliases[]` when a purchase began before login)?
- [ ] **A2. New fields.** Confirm `hasIapSubscription` + `iapSource` are added to the
  `GET /api/subscription` and `/api/iap/reconcile` responses.
- [ ] **A3. `planInterval` mapping.** How do you derive `'month'` vs `'year'` — by the
  agreed product ids, or RC's period? (This settles which package is monthly/yearly.)
- [ ] **A4. `cancelAtPeriodEnd`.** RC has no single flag — confirm you derive it from
  `auto_renew_status` / `unsubscribe_detected_at`.
- [ ] **A5. `reconcile` errors.** Confirm JSON error body (not 500/HTML) on RC-lookup
  failure, and `isPremium:false` success when there's no entitlement.
- [ ] **A6. Idempotency / ordering.** Confirm webhook is idempotent on `event.id` and
  uses timestamps to avoid regressing state (the app's reconcile call races the
  `INITIAL_PURCHASE` webhook — both must converge).

### B. Policy calls (product/BE decide)

- [ ] **B1. Trials.** There's already an in-app 14-day trial (`/api/trial/activate`, no
  card). Do you also want **store** intro/free trials? If yes, do they set
  `isTrialing`/`trialEndsAt` or just count as premium? Confirm an IAP purchase
  supersedes an active in-app trial.
- [ ] **B2. Cross-platform double sub.** A user could have active Stripe (web) **and**
  IAP. The app tie-breaks IAP-over-Stripe for management. Do you prevent double billing,
  and which source drives `planInterval`/`currentPeriodEnd` when both exist? Ideal: flag
  only the source currently granting `isPremium`.
- [ ] **B3. Grace/refund.** Confirm `EXPIRATION`/`REFUND` → drop `isPremium`;
  `BILLING_ISSUE` → keep through grace until `EXPIRATION`.
- [ ] **B4. Sandbox vs production.** RC marks sandbox events. Ignore sandbox in the prod
  DB / route to a separate RC project tied to staging? Need staging↔prod RC separation.

### C. Ownership / heads-up

- [ ] **C1. Validation owner.** The app relies on RevenueCat (default `REVENUECAT`) to
  validate receipts — backend reads entitlements from RC and does **not** do its own
  Apple/Google receipt validation. Confirm that split.
- [ ] **C2. RevenueCat provisioning.** Who creates the RC project? Server-side needs the
  RC **secret API key** (REST) and the **webhook auth secret**. The store products must
  be attached to an Offering with standard `monthly`/`annual` packages and an Entitlement
  named **`pro`** (the app keys off these). The app's public SDK keys + product ids are
  placeholders today (`TODO(iap)` in `src/config.ts`).

---

## Quick reference

- Entitlement id the app checks: **`pro`**
- App user id passed to RC: **DailyMood `user.id`** (via `Purchases.logIn`)
- Reference product ids (to create in the stores): `me.dailymood.app.pro.monthly`,
  `me.dailymood.app.pro.yearly`
- The app keys purchases off the **Offering's `monthly`/`annual` packages**, not raw
  product ids — so the RC Offering must expose those package types.

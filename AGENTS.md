# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Design system

`DESIGN.md` (repo root) is the design source of truth — read it before any visual
work. **Whenever you change or add anything visual** (tokens, a component's look, a
screen, an icon, a shadow), update `DESIGN.md` in the **same commit**. Keeping it
current is how the next session avoids re-deriving the design.

# Conventions

- **Every mutating action shows a toast.** Any POST / PUT / PATCH / DELETE (create,
  update, delete — saving an entry, editing profile, uploading/removing an avatar,
  subscription changes, feedback, etc.) must surface a result via `useToast().show()`
  — success on completion, error on failure (mapped to human copy, never a raw code).
  Use the shared `Toast` (`src/components/Toast.tsx`, top-center). Read-only GETs don't.
- **Back navigation uses `useGoBack()`** (`src/hooks/useGoBack.ts`), never raw
  `router.back()` — the latter throws "GO_BACK was not handled" on a deep link / web
  reload / after a redirect when the stack is empty. `useGoBack(fallback)` pops if it can,
  else replaces with a route (default `/(tabs)`; auth screens pass `/(auth)/login`).

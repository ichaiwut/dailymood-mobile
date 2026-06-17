# DailyMood Mobile — Design System

> **What this is.** The *system-level* design reference for the Expo / React-Native
> app: direction, foundations (type, colour, spacing, shadow), the **Paper Desk**
> visual language, and the primitives that build every screen. It mirrors the web
> repo's `dailymood.me/design.md`, adapted for mobile.
>
> **Companion docs.** `DESIGN.md` (same folder) is the **screen-by-screen** reference
> (every screen + component, what it does); this doc is the **system** behind it.
> Keep both current in the **same commit** as any visual change (per `AGENTS.md`).
> Every value below is sourced from `src/theme/tokens.ts`, `src/theme/typography.ts`,
> `src/theme/ThemeProvider.tsx`, and `src/components/paper/` — change the code and this
> doc together.

---

## 1. Design Direction

**"Paper Desk"** (handoff name: *Manila Desk*) — a warm, tactile journaling surface.
Screens sit on a **kraft-cream desk** as **white paper folders** with colour-coded
tabs, paperclips, washi tape and mood-face stickers. Soft warm shadows for paper; a
chunky two-layer offset shadow is the **button** signature. Calm, personal, analog —
never flat-material or corporate. Thai-first, fully bilingual (TH/EN).

---

## 2. Foundations

### Typography (`src/theme/typography.ts`)
- **Faces:** **Urbanist** (Latin UI, weights 400/500/600/700/800) + **Noto Sans Thai**
  (400–700). The shared `<Text>` defaults to Urbanist and lets the platform fall back
  for Thai glyphs.
- **Weights:** `regular` 400 · `medium` 500 · `semibold` 600 · `bold` 700 ·
  `extrabold` 800 (Thai caps at 700).
- **Scale (`fontSize`):** eyebrow 14 · label 14 · body 16 · title 20 · h2 26 · h1 32 · display 44.
- **Minimum font size = 14** (`MIN_FONT_SIZE`). Never ship text below this.
- **Eyebrow** = small section label, `extrabold`, `ink3`.

### Colour — light palette (`palettes.light`)
| token | value | use |
|---|---|---|
| `bg` | `#F1E5CF` | kraft-cream desk (canvas) |
| `surface` | `#FFFFFF` | paper (folders, cards) |
| `surface2` | `#FCF7EE` | paper-2 inset (controls, steppers) |
| `surface3` | `#F2F0F5` | neutral tint (toggle-off, unselected disc) |
| `kraft` | `#E9D6B4` | manila folder back |
| `ink` / `ink2` / `ink3` | `#1A1320` / `#5A4E62` / `#8C8497` | text primary / secondary / tertiary |
| `plum` / `plum2` | `#1A1320` / `#2A1F33` | dark "ink" folders (AI cards) |
| `clip` | `#B7B2BC` | paperclip metal |
| `hairline` / `hairline2` | `rgba(26,19,32,.10)` / `.16` | dividers / borders |
| `washi` | `rgba(252,164,91,.45)` | washi tape (peach tint) |
| `danger` / `dangerBg` | `#E2483D` / `#FDECEA` | error |
| `success` | `#1EA672` | success |
| `primary` / `accent` | `#A673F1` / `#FCA45B` | = brand purple / peach |

A `palettes.dark` exists but **dark mode is force-disabled** (`FORCE_LIGHT = true` in
`ThemeProvider`, M6). Design for light; don't rely on dark rendering yet.

### Brand hues (chrome only — tabs / buttons / washi / accents)
`purple #A673F1` · `purpleStrong #9747FF` · `peach #FCA45B` (offset `peachShadow #D97F3B`) ·
`mint #85ECCB` · `yellow #FDCB56` · `blue #9ACDE2` · `lavender #D4BEE4` · `cyan #06B6D4`.

### Mood colours
**Never hardcode mood colours.** The 7 default (+ custom) moods come from the **API**
(icons via `moodIconUrl`, per-pack assets in R2). Brand hues above are chrome only.

### Spacing (`space`)
`xs 4 · sm 8 · md 12 · lg 16 · xl 24 · x2 32 · x3 48`.

### Radius (`radius`)
`sm 8 · md 14 · lg 20 · pill 999`. **`sheetRadius`** is asymmetric —
`{ topLeft 4, topRight 20, bottomRight 20, bottomLeft 20 }` — the 4px top-left corner
reads as a folder seam (used by every `PaperSheet`).

### Shadow (`shadow` — CSS `boxShadow` strings; RN 0.85 new-arch supports `boxShadow`)
- **Paper (soft / warm):** `sm` `md` `lg`, plus `sticker`.
- **Buttons (the signature — chunky two-layer offset):** `btnPeach` `btnInk` `btnWhite`
  `btnPurple` (a solid colour ledge + a soft drop).
- Rule: paper surfaces use the soft shadows; only **buttons** use the chunky offset.

---

## 3. Visual Signatures — the "Paper Desk" language

- **Kraft-cream desk** (`bg`) is the canvas everything sits on.
- **Paper folder** = a colour-coded **tab** (skewed folded corner) over a white **sheet**
  (asymmetric `sheetRadius`, soft shadow). The core building block of most screens.
- **Paperclip** (`PAClip`, metal SVG, rotated ~−8°) and **washi tape** (`WashiTape`,
  tilted translucent band) are accents. **Tab + washi together clash — pick one.**
- **Mood-face stickers** (`PASticker`) — a mood-coloured disc carrying the real face icon.
- **Eyebrow** labels mark sections. Marker-pen emphasis (`PAMark`) is **web-only** — there
  is no PAMark on mobile.

---

## 4. Primitives — `src/components/paper/`

| primitive | what it is |
|---|---|
| `PaperSheet` | the folder: optional `FolderTab` + sheet body. Props: `tab`, `tabIcon` (glyph node), `tabColor`, `tabTextColor`, `variant` (`paper`/`kraft`/`plum`/`peach`), `clip`, `clipSide`, `washi`, `washiColor`, `rotate` |
| `FolderTab` | colour tab with a skewed folded corner (used by PaperSheet) |
| `PAClip` | paperclip SVG (uses the `clip` colour token) |
| `WashiTape` | tilted translucent tape band (`washi` token) |
| `PASticker` | tone→mood disc with the real mood face (`pack`/`iconFormat`/`iconKey` aware) |
| `PaperIconButton` | round paper icon button (mic / photo / location) |
| `MoodIcon`, `MoodFace` | mood icon rendering |

Screen-specific compositions live in `paper/{today,stats,insights,calendar,articles,smartlog,profile}/`.

### Shared UI — `src/components/`
`Text` · `Button` · `TextField` · `Screen` (scroll + safe-area wrapper) · `BottomSheet` ·
`Toast` (top-center) · `Skeleton` · `Notice` / `OfflineNotice` / `ComingSoon` ·
`PushPrimerSheet` · `BrandLogo` · `icons/Glyphs`.

### Toggle / switch
There is **no dedicated switch component** — the **44×24 pill** (brand-purple on /
`surface3` off, white 20×20 knob, `shadow.sm`) used in `NotificationSection` and the
old insights toggles is the de-facto switch pattern. Reuse it for new toggles.

---

## 5. Patterns & Conventions

- **Every mutating action shows a toast.** Any POST/PUT/PATCH/DELETE surfaces a result
  via `useToast().show()` — success on completion, human-mapped error on failure (never a
  raw code). Read-only GETs don't. (See `AGENTS.md`.)
- **Back navigation uses `useGoBack(fallback)`** (`src/hooks/useGoBack.ts`) — never raw
  `router.back()` (it throws on deep-link / empty stack).
- **Chrome icons are our own SVG glyphs** (`src/components/icons/Glyphs.tsx` — `viewBox 0 0 24 24`,
  `stroke = color`, props `{ size, color, strokeWidth }`) — **never system emoji** (chrome must match the
  brand, not the OS, and emoji render differently per platform). Add new glyphs there in the same style;
  `FolderTab` / `PaperSheet` accept a `tabIcon` node, channel/list rows take a glyph too.
- **Mood icons use the user's selected pack automatically** — `PASticker` resolves the user's `moodPack`
  (+ format) via `useMoodPack()` when no `pack` is passed; never hardcode `DEFAULT_MOOD_PACK` for an
  entry/mood display. (Only the pack-picker previews pass an explicit per-pack id.)
- **Theme via `useTheme()`** — never hardcode palette values. The only exceptions are the
  fixed **brand hues** and literal HEX on always-fixed-colour chrome (e.g. white text on a
  coloured tab).
- **Optimistic + invalidate** for profile prefs: keep local state, PATCH in the background,
  revert + error-toast on failure (`useUpdateProfile` invalidates the profile query).
- **i18n EN/TH** — all copy lives in `src/i18n/locales/{en,th}.ts`; add every key to both.
- **Premium features are shown, never hidden** — Free sees a teaser / PRO badge, not a gap.
- **Dark mode is disabled** (`FORCE_LIGHT`) — design light-only until the dark palette is tuned.

---

## 6. Decisions Log

| date | decision |
|---|---|
| 2026-06-17 | Authored this system doc (mirrors the web `design.md`). `DESIGN.md` stays the screen-by-screen reference; this is the system behind it. |
| 2026-06-17 | Notification settings → dedicated `/profile/notifications` screen rendered as 3 Paper Desk folders (colour tabs + paperclip), reusing `PaperSheet`; reached via a Notifications `NavRow` in the profile tab (kept that hub short). |
| 2026-06-17 | Notification icons → our own SVG glyphs (`BellIcon`/`MailIcon`/`SparkleIcon`), never system emoji. Added `MailIcon` to `Glyphs.tsx`; `FolderTab`/`PaperSheet` gained an optional `tabIcon`. |
| 2026-06-17 | Mood icons must use the user's selected pack. Added `useMoodPack()`; `PASticker` now defaults to it (explicit `pack` still wins) so add-entry, edit, today, entry cards/detail, stats, insights render the chosen pack — not the hardcoded default. |

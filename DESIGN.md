# DailyMood Mobile — Design System ("Paper Desk")

> **Living doc — keep it current.** Whenever you change or add anything visual
> (tokens, a component's look, a screen, an icon, a shadow), update this file in
> the **same commit**. This is the design source of truth for future sessions.
> Incoming references (do not edit): `handover-doc/mobile-handoff/` and
> `doc/design_handoff_paper_landing/`. **This file** records what is actually built.

The aesthetic is **"Paper Desk"**: a kraft-cream desk, white paper sheets with an
asymmetric folder-seam radius, washi tape, paperclips, mood-face stickers, soft
warm shadows on paper, and chunky offset shadows on buttons.

---

## 1. Tokens — `src/theme/tokens.ts`

Exposed via `useTheme()` (`src/theme/ThemeProvider.tsx`). Dark mode is
**force-disabled** (`FORCE_LIGHT = true`) but the palette is kept for later.

### Colors (light)
| Token | Value | Use |
|---|---|---|
| `bg` | `#F1E5CF` | kraft-cream desk background |
| `surface` | `#FFFFFF` | paper (sheets, tiles, bottom sheet, cancel button) |
| `surface2` | `#FCF7EE` | inset paper (textarea fill) |
| `surface3` | `#F2F0F5` | neutral tint (unselected mood disc, close button) |
| `kraft` | `#E9D6B4` | manila folder back |
| `ink` | `#1A1320` | primary text, selected borders |
| `ink2` | `#5A4E62` | secondary text, labels, dates |
| `ink3` | `#8C8497` | eyebrows, hints, AI-remaining counter |
| `clip` | `#B7B2BC` | paperclip stroke |
| `hairline` | `rgba(26,19,32,.10)` | tile borders (unselected) |
| `hairline2` | `rgba(26,19,32,.16)` | stronger hairline, chips |
| `danger` `#E2483D` · `success` `#1EA672` · `primary` = `brand.purple` · `accent` = `brand.peach` | | |

### Brand hues (`brand`)
purple `#A673F1` · purpleStrong `#9747FF` · peach `#FCA45B` · peachShadow `#D97F3B`
· mint `#85ECCB` · yellow `#FDCB56` · blue `#9ACDE2` · lavender `#D4BEE4`.
**Mood entry colors come from the API**, not these — brand hues are for chrome only.

### Shadows (CSS `boxShadow` strings — RN 0.85 new arch supports them)
- Paper (soft/warm): `sm` `md` `lg`, plus `sticker` `0 10px 22px -8px rgba(0,0,0,.30)`.
- **Buttons only** (chunky two-layer offset = the signature):
  `btnPeach`, `btnInk`, `btnWhite`, `btnPurple` — pattern is
  `0 9-10px 0 -2px <darker solid edge>, 0 18px 30px -14px <soft drop>`.

### Geometry
- `space`: xs4 sm8 md12 lg16 xl24 x2 32 x3 48
- `radius`: sm8 md14 lg20 pill999
- `sheetRadius`: **4 / 20 / 20 / 20** (sharp top-left = folder seam) — `PaperSheet`.
- `fontSize`: label14 body16 title20 h2 26 h1 32 display44. **`MIN_FONT_SIZE = 14`.**

---

## 2. Hard rules (product, not just visual)

- **Font floor ≥ 14px** for all content. `Text` (`src/components/Text.tsx`) enforces it.
  *Exception:* purely decorative chrome micro-labels (e.g. the "PRO" badge) may use
  raw RN `Text` below the floor — never for content/copy.
- **Thai routes to Noto Sans Thai, Latin to Urbanist** (auto-detected in `Text`).
  Noto tops out at weight 700, so extrabold Thai falls back to bold.
- **No system emoji in chrome.** Use the brand SVG glyphs (see §5). Emoji are only
  acceptable as data the API/user supplies (mood-pack fallback, activity chips).
- **Premium features are never hidden** — show a teaser / PRO badge that routes to
  subscription instead of removing the control.
- Human TH/EN copy only; map API error codes to gentle sentences (`i18n` `errors.*`).

---

## 3. Core components

- **`Text`** — font routing + ≥14px floor. Variants: label/body/title/h2/h1/display.
- **`Toast`** — `ToastProvider` (mounted in root `_layout`) + `useToast().show(msg, tone)`.
  Brief confirmation pill above the bottom nav (white sheet, soft shadow, check/✕ glyph),
  auto-dismiss ~2.6s. Fired on entry save (drawer + edit). Success/error tones.
- **`Button`** (`src/components/Button.tsx`) — variants `primary`(peach) / `ink` /
  `paper`(white) / `ghost` / `purple`, each with its chunky `boxShadow`. Height 54,
  radius 14, settles `translateY(2)` on press.
- **`PaperSheet`** — folder tab + folded corner, `sheetRadius`, soft `shadow.md`;
  optional paperclip (`PAClip`) and washi.
- **`PASticker`** — mood disc: white 4px border + `shadow.sticker`. Disc background:
  emoji badges = full color; moods = **soft tint `color+'40'`** by default, but the
  `discBg` prop overrides it (used by the Smart Log tiles, see §4).
- **`PAClip`** — real SVG paperclip (not emoji).
- **`LocationPill`** — pin (`#A673F1`) + place name, `surface3` pill. Read-only by
  default; opens the device map when `lat`/`lng` are present. Pass `onRemove` for an
  editable × (compose surfaces).
- **`PlaceSearchBox`** — shared place input: text field + **live autocomplete
  suggestions** (debounced 400ms, tap a suggestion to pick) + "Add" for the typed text
  + "ใช้ตำแหน่งปัจจุบัน" GPS shortcut. Calls `onPick({name, lat?, lng?})`. Provider is
  `searchPlaces()` in `src/lib/location.ts` — currently **OpenStreetMap Nominatim**
  (free, no key); swap for Google Places New when a mobile Maps key exists.
- **`LocationField`** — "เพิ่มสถานที่" chip → `PlaceSearchBox` → collapses to
  `LocationPill`. Parent holds the `{name, lat?, lng?}` value. Used by Edit Entry; the
  Smart Log drawer wires `PlaceSearchBox` directly under its toolbar pin.
- **`MoodFace`** — line-art fallback faces; `MoodIcon` renders the user's R2 pack SVG
  via `SvgUri`, falling back to `MoodFace`.
- **`TodayTimeline`** (`paper/today/`) — the Today screen's "วันนี้" header + 📌 count
  badge + a day-axis sheet: hour ticks 6:00–21:00, a mood dot per entry positioned by
  ICT hour (`((h-6)/15)*100`, clamped 3–92%), yellow washi strip. (No "Now" pill — removed
  as it collided with the 21:00 tick.) Shown above the entry cards when the day has entries.
- **`FloatingNav`** (`paper/`) — mobile bottom nav: white pill (76px tall, radius 38, soft
  float shadow `0 14px 40px rgba(0,0,0,.10)` + 1px hairline), 4 route tabs (Home / Calendar
  / Stats / Profile, SVG glyphs from `Glyphs`), and a raised peach **FAB** (56px, `-28`
  margin-top, peach glow) that opens the Smart Log drawer. Active tab = `brand.purple`;
  home & profile also get a soft `rgba(166,115,241,.15)` interior fill. Sits at
  `insets.bottom + 18`. (Tab labels use the 14px floor, not web's 11px.)
- **`StreakCard`** (`paper/today/`) — washi-taped white sheet: **STREAK** eyebrow, big
  number (46px) + "วันติดต่อกัน" + 🔥 (pushed right), and a 14-cell progress row (peach up
  to the streak, `surface3` beyond). Ported from web streak-card.
- **`AiWeeklyFolder`** (`paper/today/`) — "✦ AI · สัปดาห์นี้" folder, placed **after** the
  entries list on Today. Dark **plum gradient** (`plum2 → plum`, ~155°, via
  `expo-linear-gradient`) + a soft peach corner glow, matching web. Always shown (never
  hidden): premium sees the cached weekly `summary` (markdown stripped), free sees
  `previewHeadline`/teaser + a PRO badge. Button → `/insights` (premium) or
  `/profile/subscription` (free). Data from `useInsights()`.
- **`MoodPicker`** — two layouts:
  - `grid` (Today greeting): 5-col circular discs, soft tinted rings (kept soft per
    user feedback — full saturation read as neon).
  - `scroll` (Smart Log / Edit): white rounded-square tiles, **unselected disc =
    `surface3` neutral; selected = full mood color** + 2px ink border + `translateY(-1)`.
- **`BottomSheet`** — backdrop + white (`surface`) paper sheet, top radius `lg+6`,
  drag handle, keyboard avoidance, scroll. `maxHeight = 90%`. Content has bottom
  padding (`space.x2`) so chunky footer-button shadows are not clipped. Optional
  `decoration` slot renders over the top edge (used for washi tape).

---

## 4. Smart Log "Add entry" drawer — `src/components/paper/smartlog/SmartLogSheet.tsx`

Built to `docs/mobile-handoff/add-entry-drawer.md` (FE spec). Native interpretation —
not pixel-pinned.

- **Sheet:** white paper, washi tape (lavender `rgba(212,190,228,.75)`, 128×26,
  `rotate(-3deg)`) on the top edge via `BottomSheet.decoration`.
- **Header:** purple 34×34 r10 square w/ white `SparkleIcon`; title `บันทึกด้วย AI` (h2);
  close = 36 circle on `surface3` w/ `CloseIcon`. Date row = `CalendarIcon` (ink3) +
  full date incl. year (ink2, bold).
- **Mood tiles:** `MoodPicker` scroll layout (see §3).
- **Note:** `TextField` multiline, min-height **120**, fill `surface2`.
- **Toolbar:** `PaperIconButton` ×3 — Mic / Camera / Pin (SVG glyphs). Camera is gated:
  free users see a **"PRO" badge + 0.55 opacity** (still tappable → routes to
  `/profile/subscription`). Right-aligned AI-remaining counter for free tier.
  - **Photo upload:** the AI Analyze path uploads the photo via `/api/log/smart` (→
    `suggestion.imageKey`). On a **manual** save the photo is uploaded via `uploadImage()`
    → `POST /api/upload` (premium-only) before confirm — otherwise the picked image would
    be silently dropped. Edit Entry does **not** support photos yet (deferred).
  - **Photo read display:** entries with a photo show the image in **Entry Detail** (full
    220px) and as an 80px **banner in `EntryFolderCard`** (Today / Timeline / Day Sheet).
    `GET /api/log[/id]` returns a signed R2 URL (TTL 1h) — render it directly, don't cache
    across the hour.
  - **Location (Pin):** taps the pin → toggles a **place-name search field** (web parity):
    `SearchIcon` + text input ("พิมพ์ชื่อสถานที่…") + dark "Add" button, plus a
    "ใช้ตำแหน่งปัจจุบัน" GPS shortcut row beneath. Typed name → `geocodePlace()` resolves
    coords when possible; GPS → `getCurrentPlace()` (both in `src/lib/location.ts`,
    expo-location, no Maps key). Once set, the field collapses to a **location pill**
    (filled purple pin + name + × clear, `surface3` bg); the toolbar pin shows
    filled/purple while open or set. Permission-denied / failure → gentle hint, never a
    raw error. Saved as `location` / `locationLat` / `locationLng` on confirm (manual
    *and* nlp). Geocoding/reverse-geocoding are unavailable on web → name-only / coords
    text. **Native module — only runs on a dev build / device**, not web preview / Expo Go.
  - **Location read display:** a location pill / pin+name shows wherever an entry with a
    location appears — Entry Detail (hero), Edit Entry (`LocationField`), and the
    `EntryFolderCard` (Today, Timeline, Calendar Day Sheet) which renders a compact
    pin+name line. Backend stores/returns `location` + `locationLat`/`locationLng`; it
    never resolves places (all client-side).
- **PRO teaser** (free only): lavender `#ECE3F4` box, sparkle + copy + "อัปเกรด →",
  routes to subscription. Never hidden.
- **Activity chips:** horizontal scroll, single-select; selected = ink fill.
- **Footer:** `[ยกเลิก paper] [✦ วิเคราะห์ purple] [บันทึก peach]` — chunky button shadows.
- **States:** `input` → `analyzing` (`SLAnalyzing`) → `result` → `rateLimit` (free out of
  quota: offer Quick Save + Go Pro, never a raw error). The **result** view keeps the
  user's note **read-only** at the top ("สิ่งที่คุณเขียน") so their words don't vanish, then
  AI summary + editable tags; footer is **"เขียนเอง"** (back to `input`, note preserved) ·
  **บันทึก**.

---

## 5. UI glyph icons — `src/components/icons/Glyphs.tsx`

Inline SVG ported 1:1 from `docs/mobile-handoff/ASSETS.md` §3. viewBox `0 0 24 24`,
`stroke = currentColor`, color/size props. Available: `SparkleIcon`, `CalendarIcon`,
`CameraIcon`, `PinIcon`, `PinFilledIcon` (location-chosen state), `CloseIcon`, `MicIcon`.
**Use these instead of system emoji for all chrome.**

---

## 6. Known deviations / deferred

- **`expo-linear-gradient`** is installed and used by `AiWeeklyFolder`. The sparkle square
  & PRO teaser still use solid `brand.purple` (not yet upgraded to the spec's
  `135deg #A673F1→#C9A6F5` gradient) — can adopt LinearGradient there too if wanted.
- The footer **`✦` is a typographic dingbat** in the label string (not the SVG sparkle).
- Live API mood set/colors differ from the design mock (backend data, not fixable here).
- Still on the old hard-offset styling / not yet migrated to soft Paper Desk shadows:
  insights, profile, subscription screens.
- Deferred features: native Google/Apple sign-in (needs dev build), voice input (mic
  button is still a "coming soon" stub), reminder & privacy toggles, dark mode, share cards.

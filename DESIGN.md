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
  Noto tops out at weight 700, so extrabold Thai falls back to bold. Thai strings also
  get a default `lineHeight` of `round(fontSize × 1.5)` so lower vowels/tone marks
  (e.g. the `์` in ไทม์ไลน์) never clip in tight boxes; pass an explicit `lineHeight`
  via `style` to override.
- **No system emoji in chrome.** Use the brand SVG glyphs (see §5). Emoji are only
  acceptable as data the API/user supplies (mood-pack fallback, activity chips).
- **Premium features are never hidden** — show a teaser / PRO badge that routes to
  subscription instead of removing the control.
- Human TH/EN copy only; map API error codes to gentle sentences (`i18n` `errors.*`).

---

## 3. Core components

- **`Text`** — font routing + ≥14px floor. Variants: label/body/title/h2/h1/display.
- **`Toast`** — `ToastProvider` (mounted in root `_layout`) + `useToast().show(msg, tone)`.
  Brief confirmation pill at **top-center** (below the status bar; white sheet, soft
  shadow, check/✕ glyph), auto-dismiss ~2.6s. Fired on entry save (drawer + edit).
  Success/error tones.
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
- **`MoodFace` / `PASticker` mood rendering** — priority: `iconKey` (custom-mood R2 image) →
  forced `face` → moodId (custom `emoji` on tint, else **the user's mood-PACK icon** from R2) →
  badge `emoji`. Pack icons render via **`<Image>`** (`moodIconUrl(moodId, pack, iconFormat)`) —
  RN-web `<img>` renders SVG/PNG/WEBP, native renders PNG/WEBP — **not** `react-native-svg`'s
  `SvgUri`, which rendered these packs' offset-viewBox SVGs as solid black. On image error it
  falls back to the brand `MoodFace`. `MoodPicker` takes `pack` + `packFormat` (Greeting passes the
  user's pack + its `iconFormat` from `profile.packs`); custom moods pass their own `iconKey`/`emoji`.
  (Native SVG packs still fall back to MoodFace; PNG/WEBP packs render everywhere.)
- `moodLabel` falls back to `label` when `labelTh` is null (custom moods only set `label`).
- **`TodayTimeline`** (`paper/today/`) — the Today screen's "วันนี้" header + 📌 count
  badge + a day-axis sheet: hour ticks 6:00–21:00, a mood dot per entry positioned by
  ICT hour (`((h-6)/15)*100`, clamped 3–92%), yellow washi strip. (No "Now" pill — removed
  as it collided with the 21:00 tick.) **Always shown on the Today screen** (even with 0 entries —
  the axis renders empty with a "0 รายการ" count); entry cards or the `EmptyToday` prompt sit below it.
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
- **`MiniCalendarFolder`** (`paper/today/`) — mint-tab folder at the bottom of Today: current
  month (`monthLong year`), "ดูทั้งหมด →" → `/calendar`, and a 7-col grid (Sunday-first, narrow
  weekday headers) with today ringed (`surface2` + purple border) and logged days tinted by their
  mood colour. Data from `useCalendarMonth(year, month)` (`entries[].moodTypeId`).
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
  - **Toolbar (mic / camera / pin) + location + activity chips** render in *both* the input
    and result steps (via shared `tools`/`activityChips`), so they stay editable after
    Analyze. The **pin** (in the toolbar, next to camera) toggles the place search.
  - **Location (Pin):** the place-name search field (web parity):
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

## 4b. Entry Detail — `app/entry/[id].tsx`

Single-column Paper Desk stack (handoff entry-detail spec). Top bar (← back ghost +
✎ edit paper pill) → **mood hero folder** (lav tab = long date, paperclip, a **subtle
mood-color corner glow** via clipped `LinearGradient`, 64px `PASticker` rotated -6°, mood
name + day·time·period, big day number + italic month + year, "Entry #N" + activity chip;
built as a custom clipped sheet so the glow stays inside the rounded corner) → **note**
(washi peach) → **AI insight** (lavender `#F3ECF9` tint card, washi yellow, sparkle +
"AI noticed" + **bold-preserving** text via `RichText` + disclaimer) → **flashback**
(premium: washi-lav; free: dashed teaser → Pro) → **photo** (clip) → **location** pill →
**tags** → rail: **nearby days** (ink tab, sticker + date + "this entry" badge + note
preview), **last month** (mint tab), **streak** (washi peach, 🔥 + day count) → **2-step
delete** (text → red confirm). Uses `PaperSheet` tab colors lav/ink/mint + washi tints.

## 4c. Edit Entry — `app/entry/[id]/edit.tsx`

Mobile layout from the handoff (desktop sidebar skipped). Loose header (eyebrow
"กำลังแก้ไข · บันทึกที่ N" + h2 title·date) → **single peach-tab `PaperSheet` form**
(gap xl): mood tiles (`MoodPicker` scroll) · **date/time field shells** (`surface2`,
1.5px rule, calendar/clock glyph — read-only; native picker deferred) · note + "N/500"
counter + **✦ re-analyze chip** (AI re-runs on the note → updates mood/tags/summary;
quota-gated: free 3/day with counter, Pro unlimited; persists `aiSummary`/`sentiment`/
`aiSource` via PATCH) + AI-summary inset · tags (chips + add input) · location
(`LocationField`) → inline **danger zone**
(1.5px `#FCA5A5` border, `#DC2626` delete) → **fixed bottom bar** (Cancel paper + Save
peach, safe-area padded). Delete uses the confirm `BottomSheet`.

## 4d. Calendar — `app/(tabs)/calendar.tsx` (per handoff "Calendar (complete)")

Month nav (‹ month-year › paper buttons) → segmented **calendar / timeline** toggle
(selected pill soft shadow) → **calendar view**: `MoodGrid` in a `PaperSheet` (clip) +
3-up **stats row** (Avg [with ↑/↓ delta] / Streak / Logged, accent cards + `shadow.sm`) +
**mood Legend** folder card (ink tab, 14×14 rounded swatches). **Timeline view** =
`TimelineFeed`. Day → `DaySheet` (**centered popup modal** — fade, washi-lav tape, close
circle, weekday-peach + big date header, **special-day chip** (holiday/personal from
`/api/events`), entries / empty 🤔 / future 🔮); entry → detail.
- **Day cell:** radius 12; mood day = mood color + number `rgba(0,0,0,.55)`; empty = `surface2`
  + ink3; **today** = 2.5px purple ring; **selected** = 2.5px ink ring (wins over today);
  **future** = 0.4 opacity + tap → "future day" toast (not loggable).
- **`EntryFolderCard` folder tab = time of day** (morning peach · afternoon mint · evening
  lav, ink text) — *not* the mood color. Used on Home + Timeline + Day Sheet.
- **Timeline filter chips:** inactive = soft paper shadow; active = ink fill + chunky
  `0 6px 0 -2px #000` offset shadow.
- **3rd toggle "Year"** → `/year-in-pixels` (🔒 prefix for free).
- **AI cards above the grid** (`CalendarAi.tsx`): premium → monthly summary (RichText bold +
  best/hard-day & top-tag chips) + patterns feed (pastel icon discs) + **ask-AI bar**
  (`/api/calendar/ask`, 429 → toast, answer + matching-date chips open the day); free →
  upsell card → subscription (never hidden). **Sparse months:** the backend returns
  another month's AI via `fallbackMonth`; the client **suppresses it** (`tooFewEntries` ||
  `fallbackMonth` → "log more this month" prompt) so a month never shows another month's AI.
- **Day-cell indicators:** special-day dot top-left (holiday `#F43F5E` / personal `#3B82F6`,
  from `/api/events`, all tiers) · ★ best-day top-right · recurring (purple) / anomaly (lav)
  dot bottom-center (from `/api/calendar/ai`, premium).
- **Grid month folder tab** (peach, month name) + an **AI patterns legend** above the grid:
  a `✦ AI patterns · ON/OFF` toggle (ink pill) + ★ best-day + a dot+title per pattern.
  Toggle off hides the cell indicators. (Pattern titles come from the API; their language
  is a backend concern.)

## 4e. Year in Pixels — `app/year-in-pixels.tsx` (Pro, `/api/year-in-pixels`)

Pro-gated page (free → 🎨 gate card + "Upgrade to Pro" → subscription). Header (← back +
year ◀▶) + eyebrow. Premium: one tall **AI year-summary card** (lavender `#F3ECF9` + yellow
washi), mirroring the web — header row of a **gradient sparkle square** (`#A673F1→#C9A6F5`) +
"`{t(yip.yearSummary)} · {year}`" title + a white **"✦ Pro" pill**; RichText-bold summary
(16/26); a **peach theme chip** (`📑 {yearTheme}`, `rgba(252,164,91,.22)` bg, `#B5651D` text);
the AI disclaimer caption; a **2×2 stat grid inside the card** (each white card = emoji +
grey label + bold value · meta: 😊 top mood + %, 🔥 longest streak + month, 📝 entries logged,
💡 top trigger + count); a full-width **purple-gradient "เล่าให้ฟังต่อ →"** button →
**`/year-in-pixels/story?year=` (the scroll-reveal Year Story page, §4f)**; and two stacked
**white chunky buttons** — `📊 เปรียบเทียบกับ {prevYear}`
(toggles an **inline compare panel** inside the card: fetches the previous year and shows
this-year-vs-last dual bars + delta badges for entries / dominant mood / streak / best month —
current year in accent colour, previous year in lavender, deltas green ↑ / red ↓; the button
shows a purple active ring while open) and `📄 ดาวน์โหลด AI report (PDF)`
(toast "coming soon" until `expo-print`/`expo-sharing` land). Below the card: the
**pixel grid in a peach-tab "ทั้งปี" PaperSheet** — like web, **months run down the side**
(fixed left label column, `monthShort`) and **days run across (1–31) in a horizontal
ScrollView you swipe right**; 27px rounded cells, `GAP` 3, `mood.color` / `surface2` empty /
blank for invalid dates; today = yellow ring, selected = ink ring. Below a hairline: a
**mood-color legend** (swatch + label per mood) and an **"อารมณ์เด่นของปี · {mood} · {pct}%"**
footer. A **selected-cell tooltip** (sticker + date + mood) sits under the sheet.
Data from `useYearInPixels` (premium only);
no-summary fallback shows `stats.tooFew` but keeps the stat grid.
**Partial:** the PDF button is a "coming soon" toast (real export needs `expo-print`/
`expo-sharing`). The compare panel reads `useYearInPixels(year-1, …, enabled=compareOpen)`
so the previous year is only fetched when opened; if that year has no entries it shows a
"ยังไม่มีข้อมูลปี {prevYear}" note.

## 4f. Year Story — `app/year-in-pixels/story.tsx` (Pro, `/api/year-in-pixels`)

Scroll-reveal recap of the whole year, Paper Desk style; reached via the AI card's
"เล่าให้ฟังต่อ →". Own `Animated.ScrollView` (not `Screen scroll`) so the scroll offset
drives the reveal. **Signature motion:** every section is wrapped in **`<Reveal>`**
(`src/components/Reveal.tsx`) — fades up (opacity 0→1, translateY 24→0, 0.7s
`cubic-bezier(.16,1,.3,1)`) once its top crosses `scrollY + viewport − 60`. Reveal is
**scroll-position-driven via a Reanimated shared value, NOT `entering`** (which swallows web
presses, see `Appear.tsx`); respects reduce-motion (`useReducedMotion` → shown immediately).
Content is centered, `maxWidth` 960. Sections top→bottom: **1** hero (purple `★ YEAR STORY`
tab + clip, back link, big year, 52-week dominant-mood strip 10×16); **2** two stat folders
(peach/yellow washi — entries + streak); **3** dominant-mood folder (lav tab, PASticker 64
rotate −6°, name, % + a full-year **distribution bar**); **4** best/toughest month (yellow +
purple tabs, `monthLong` + avg; only the months that exist); **5** patterns (mint + lav washi
— top theme + Q4 trend); **6** **AI year summary** (ink `✦` tab + **plum-gradient sheet
`#2A1F33→#1A1320`, white text**, RichText narrative + 📑 theme); **7** pixel grid (mint tab,
same months-rows × swipeable-days layout as §4e but 22px cells + legend); **8** outro
(centered sheet, PASticker rotate −8°, "ขอบคุณสำหรับปี {year}" + back button). States: large
spinner while loading; whole-page **Pro gate** (lav washi + 🎨 + upgrade) when free.

## 4g. Stats — `app/(tabs)/stats.tsx` (`/api/stats?period=` + `/api/insights`)

Paper Desk stats. **Header**: title + a row of `📤 แชร์` pill (purple-strong, only when
`total ≥ 7`; uses RN `Share.share` with a text summary — the rich ShareCardModal is a
separate handoff) and **week/month/year filter pills** (active = purple). **Year is
Pro-gated**: the pill is `opacity .5` and tapping it doesn't switch — it reveals a
`/profile/subscription` **banner** (AI-tint). Sections: **AI insight card** (AI-tint +
yellow washi, gradient sparkle tile + "AI INSIGHT · {period}"; Pro → `insights.summary`
clamped 3 lines, Free → generic copy + a `PRO` chip; "ดูเพิ่มเติม →" → `/insights`); **4 KPI
cards** (2×2: avg mood + delta ↑/↓, entries, streak 🔥, top mood emoji + label·%); the
**mood-trend line chart** (`MoodLineChart`, §below); a **special-days card** (`วันสำคัญในช่วงนี้`)
listing `/api/events` holidays/personal days in the period window — holiday chips `#FFF0F3/#BE123C`,
personal `#EFF6FF/#1D4ED8`, each emoji + name + `d/m` (events are per-month → fetches current +
previous month, filters to the window; week/month only, skipped for year); **mood mix** (stacked bar + featured
top-mood tile `mood.color+22` + top-5 list with track bars); **activity impact** (Pro →
a plain-language hint line + diverging bars from `activityInsight`: emoji+label, centre-anchored
bar `min(|impact|/2,50)%` mint right / `#F4A8A8` left, and a readable value `↑ better / ↓ worse`
+ `|impact|%` (never a bare signed number); Free → a whole-card teaser → subscription).
States: **TooFew** (`total < 7`) replaces content — 📊 + "ต้องการอีก N วัน" + 7 progress dots
(done = purple ✓) + "+ บันทึกวันนี้"; loading shows static gray skeleton blocks.
Premium read from `useProfile().user.isPremium`.

**`MoodLineChart`** (`src/components/paper/stats/MoodLineChart.tsx`) — SVG, width measured
(`onLayout`) for uniform scaling. Y = 1–5 valence from `moodScore(moodId)` (trend points
carry only a moodId; map lives in `mood.ts`); purple line (w3) + gradient area + white dots
(last dot solid r6); **dashed gridlines + a mood-face Y axis** (`MoodFace`, scores 5→1).
X labels are period-aware (week=weekday · month=every 5th date · year=month-short). **AI
pins** from `annotations` (`ChartAnnotation`): Pro → glowing purple pin + ✦, tap toggles a
dark tooltip with `labelTh/En` + `tagRefs`; Free → one blurred lavender ghost pin + an
"✦ Unlock AI Annotations — PRO" chip → subscription. **Deferred vs web:** pulsing pin
animation (static glow here) and holiday/personal timeline markers.

## 4h. AI Insights — `app/insights.tsx` (Pro, `/api/insights/all` + `/api/insights/feedback`)

Weekly AI dashboard (`useInsightsAll(locale, week, enabled=premium)`). Top: a back chevron +
**AiSubTabs** (`✨ Insights` active ink pill w/ chunky `0 6px 0 -2px #000`, `💬 Ask AI`). **Non-premium
→ whole-page FreeGate**: eyebrow + h1 + a purple-tab **CTA folder** (gradient `#F9A870→#C89BF5→#A673F1`
+ PAClip, 5 bullets, white "✨ สมัคร Pro" → `/profile/subscription`, ฿99/mo) + a dimmed teaser.
Premium: header (eyebrow "AI INSIGHTS · Week N" from `weekKey`, h1, prev/next week pills — next
only when viewing the past, via `isoWeekKey` + `weekOffset`); a disclaimer note (AI-tint + ✨);
the **hero recap folder** (purple tab + PAClip + gradient sheet `#A673F1→#C89BF5→#FCA45B`, white
RichText headline, "อ่านเต็ม" expands `summary`, glass buttons, and a 2×2 **glass-tile** grid
avg/good-days/patterns/wellness with ↑/↓ deltas); a **4-feature grid** (2-col): 🔮 Forecast
(predicted-mood sticker + confidence% + ± factor rows), 🧬 Mood DNA (`RadarChart` 5-axis +
archetype), 🔁 Themes (color-bar list ≤5 + `N×`), ⏰ Energy Clock (`EnergyRadial` 24 spokes +
peak), each → a "✨ generating…" placeholder when its datum is null; up to 3 **pattern cards**
(tag badge 📌/↗/⚠️ + title + desc + 7-bar `MoodBarChart` when `miniVizData`); a **suggestion**
card (warm gradient + washi, 💡 SUGGESTION badge, 👍/👎 `FeedbackPill`s → `/api/insights/feedback`,
one-shot then disabled). New viz live in `src/components/paper/insights/`. **States:** loading
skeleton, error (😵 + retry), and `status.ready === false` → TooFew (📝, <7 entries) / Empty (🔮).
**Footer toggles** (`ToggleRow` + `TogglePill` 44×24): 🤖 AI Coach (gradient icon tile) + 📩 Weekly
Digest, bound to `profile.aiCoachEnabled` / `weeklyDigestEnabled` and persisted via
`PATCH /api/profile` (`useUpdateProfile`, toast on save). The Ask-AI tab routes to `/ask-ai` (§4i).

## 4i. Ask AI chat — `app/ask-ai.tsx` (Pro, `/api/ask-ai/*`)

Full-screen multi-turn chat grounded in real entries. Top bar = the shared AiSubTabs
(`✨ Insights` → `/insights`, `💬 Ask AI` active) + a `📋 {N}` history button that opens a
**threads drawer** (left panel + scrim): "+ คำถามใหม่" (ink button), "ก่อนหน้า" list (active =
`#F3ECF9` + 3px purple left border). Chat column is a `KeyboardAvoidingView` (`ScrollView`
auto-scrolls to bottom). **Empty state** = gradient ✦ tile + "ถามอะไรก็ได้เกี่ยวกับคุณ" +
suggested-question cards (`/api/ask-ai/suggested`, tap → send). **User bubble** right (`#F3ECF9`,
radius 16/4-corner, "คุณเอง · time"); **AI bubble** = gradient ✦ avatar + paper sheet with eyebrow
"DAILYMOOD AI · ดู N ENTRIES", RichText answer, and a pill row 👍/👎 (one-shot →
`POST /api/ask-ai/messages {messageId,feedback}`) + 📋 copy. **Thinking** = avatar + "กำลังคิด…".
**Input bar** pinned bottom (pill + ↑ send, Enter sends) + disclaimer. **Non-premium** → whole-page
FreeGate (plum CTA folder `#2C2435→#3D2E50→#A673F1` + PAClip + bullets + ฿99/mo).
**History is DB-backed** (cross-platform): a new chat first calls **`POST /api/ask-ai/threads`**
to get a server `threadId`, *then* `POST /messages {threadId, content, locale}` (returns
`{userMessage, aiMessage{sourcesJson, entriesUsed}}`); the server sets the title + `lastMessageAt`
from the first message. After sending we `refetch` the thread list. `GET threads` (the drawer) and
`GET messages` (on thread select) return everything on reload — no client persistence needed.
Feedback uses **PATCH** /api/ask-ai/messages (POST is for new questions). Copy uses
`navigator.clipboard` on web, Share on native.

## 4j. Profile + settings — `app/(tabs)/profile.tsx` (`GET/PATCH /api/profile`, `/api/feedback`, export, clear)

Everything from one `GET /api/profile`. Header = title + ✏️ edit button → `/profile/edit`.
**Hero**: accent **gradient** card (6-colour map keyed by `accentColor`, default purple) + **PAClip**
+ tappable avatar (imageUrl or initials, ✏️ peach badge → edit), name / "สมาชิกตั้งแต่ …" / ● PRO
pill, and a 3-cell **stats row** (streak → achievements, entries → calendar, avg+emoji → stats).
**Mood Signature** (`pa-sheet` + mint washi): premium+data → headline (`moodSigYou`/`moodSigMix`) +
`distribution`-coloured stacked bar + top-3 line; premium-no-data → "ยังมีข้อมูลไม่พอ"; free →
`PremiumTeaser`. **Achievements** row (earned badges, ≤6, `N/total →`). **Settings sections**
(`Section` eyebrow + `SettingCard` rounded card with `NavRow`/`ToggleRow`/`RadioRow`/`Divider`):
Account (subscription → `/profile/subscription`, value renews/expires/free), Language (en/th radios
→ `i18n.changeLanguage` + PATCH `locale`), Privacy (premium ToggleRow `hidePreview` PATCH / free
teaser), **Mood-icon pack** picker (when `packs.length>1`: 2-col cards, 4 R2 preview icons via
`PackIcon` with onError fallback + `iconFormat`; premium pack while `tier!=='premium'` → 🔒/upgrade →
subscription, else PATCH `moodPack` + toast), Data (export → CSV via `exportEntriesCsv` →
web download / native Share, free → upgrade; red **delete-all** → clear sheet), About (feedback sheet,
terms/privacy → `Linking` to the web pages). **Footer**: red-outline sign-out → sheet + version line.
**3 bottom sheets** (`BottomSheet`): sign out, clear-entries (`DELETE /api/profile/clear`), and
feedback (textarea + `/api/feedback`, GET cooldown → "อีก N นาที", success → 💜). Premium gating uses
`isPremium`; mood-pack uses `tier`. Between achievements and settings, two **article link cards**
(♥ saved articles → `/profile/saved-articles`, ☺ article reactions → `/profile/article-reactions`,
§4m). Settings §5 **Custom moods** (`CustomMoodManager`, Pro-only — Free sees a teaser) and §6
**Special days** (`PersonalEventsManager`, both tiers) are inline managers inside their `SettingCard`s
(`src/components/paper/profile/`): **CustomMoodManager** — icon picker (typed emoji OR an R2
`custom-emojis/` grid of 50, mutually exclusive) + name + colour palette → `POST /api/moods`, list
with delete; **PersonalEventsManager** — emoji (12 presets) + name + month/day chip pickers →
`POST /api/events`, list with delete, Free capped at 3 then a Pro teaser (`limit_reached`). Native
color picker → palette swatches; native date picker → chip rows. **Deferred vs web:** theme picker
(dark mode is `FORCE_LIGHT`).

## 4m. Saved articles + reactions — `app/profile/saved-articles.tsx`, `app/profile/article-reactions.tsx`

Two near-identical "clipping" lists sharing `ArticleClippings` (`src/components/paper/articles/`),
keyed by `variant`. `GET /api/articles/bookmarks` (♥) / `/reactions` (💭, adds `moodTypeId`).
Back button, eyebrow (📎 "คลังของคุณ" / 💭 "ความรู้สึกของคุณ"), **marker-highlight h1** (peach /
lavender), subtitle + count. **Clipping card** (`pa-sheet`, `overflow:visible`, tilted via a `TILT`
cycle, **paperclip** top-left): 96px white-framed **cover** (image or generative `ArticleArt` by
`tone` — SVG gradient + circles; `toneHue`/`toneBg`), category pill, 2-line title + excerpt, footer
⏱ reading-time pill + "อ่านต่อ →". **Reactions variant** adds a `PASticker` mood stamp on the cover
corner + a `MoodIcon` + label **mood pill** in the footer (`findMood(moods, moodTypeId)`). Cards
open the article on the web via `Linking` (`/articles/{slug}` — in-app reader not built). Loading =
3 tilted skeletons; **empty** = washi sheet (lav/mint) + 🔖 / `PASticker` + CTA → web `/articles`.
**Deferred vs web:** the in-app article reader.

## 4k. Pricing + Subscription — `app/pricing.tsx`, `app/profile/subscription.tsx`

**Payment platform rule** (`src/hooks/useBilling`): web → Stripe **Checkout/Portal** URL opened
via `Linking`; **native → in-app purchase is required for digital goods and isn't integrated yet,
so subscribe shows a "coming soon" toast** (`pricing.iapPending`) — never an external purchase URL
(App Store / Play rule). The **14-day trial is not a purchase** (`POST /api/trial/activate`) so it
works everywhere. Pro brand gradient = `#FCA45B→#A673F1`; prices ฿99/mo · ฿790/yr (save 33%).
`PRO_FEATURES` (6 cards) is shared by both pages.

**`/pricing`** (guest-viewable, maxW 720): success state (`?success` → 🎉 welcome), cancelled banner
(`?cancelled`), else hero (Pro pill + gradient headline) → optional **trial CTA** (only `!hasUsedTrial
&& tier==='free'`, lav washi → `TrialConfirmSheet`) → **plan picker** (monthly / yearly w/ "Save 33%"
badge + ฿66/mo, default yearly) → **main gradient CTA** (chunky shadow → `useBilling.subscribe`) →
features grid → **Free-vs-Pro comparison folder** (ink tab + PAClip + 9-row table) → terms/privacy
links. `useSubscription` is gated on auth so guests don't 401.

**`/profile/subscription`** (login-required, back button, maxW 880) — `GET /api/subscription` →
three states: **A Free** (trial gradient card or expired warm banner + Free card with Smart-Log
progress + Pro gradient card → `/pricing`); **B Trialing** (status gradient card — turns
`#D94444→#FCA45B` when `trialDaysLeft ≤ 3` — "เหลืออีก N วัน" + ends date + subscribe → `/pricing`,
then features grid); **C Active Pro** (plum folder `#2C2435→#3D2E50` + PAClip showing comped /
canceling / auto-renew status; when `hasStripeCustomer` → glass **Manage billing** → portal +
**Cancel** → cancel sheet; canceling warm banner → resubscribe; features grid + unlimited usage
cards). Sheets: `TrialConfirmSheet` (`/api/trial/activate`) and **Cancel** (😢 → portal / keep Pro).
Dates via `formatDateKey`. **Deferred vs web:** real IAP (RevenueCat) for native purchases.

## 4l. Achievements — `app/profile/achievements.tsx` (`GET /api/profile/achievements`)

Scrapbook sticker album (the endpoint **auto-grants** completed badges, so a fresh load shows new
unlocks). Rail: back pill → `/profile`, "🏆 สมุดสะสม" chip, h1 with a **marker-highlight** word
(nested `Text` + `brand.yellow` bg, in place of web's `PAMark`), a **SVG progress ring**
(`react-native-svg` `Circle`, r68/strokeWidth12, peach arc via `strokeDasharray` + `rotate(-90)`,
`{pct}%` + `{earned}/{total}` center), and **filter pills** (all/earned/in-progress/locked with
counts; active = ink + chunky shadow). **Sticker grid** (2-col): each `BadgeCard` tilts via a
`ROT` cycle — **locked stays flat** — with **washi tape** (earned, colour-matched), **paperclip**
(in-progress), or **dashed border + .72 opacity** (locked). `BadgeSticker` = 66px disc, white 4px
border; earned = full colour, in-progress = `color+26`, locked = `surface3` + dimmed emoji. Earned
shows a tilted "✓ {date}" stamp; in-progress a progress bar. Tapping opens a **detail
`BottomSheet`** (96px hero + colour halo, title/desc from i18n `badges.{id}`/`badges.desc_{id}`):
earned → "✓ ปลดล็อก · {date}" + share; in-progress → `current/target` + bar + "อีก N…"; locked →
"🔒" pill + hint. **Share** uses RN `Share.share` (text). **Deferred vs web:** rendering the badge
as a share-card image (`ViewShot`/canvas).

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

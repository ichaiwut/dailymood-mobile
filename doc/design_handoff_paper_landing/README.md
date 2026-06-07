# Handoff: DailyMood Landing — "Paper Desk" Redesign

## Overview
A full visual redesign of the DailyMood marketing landing page (`/`). It adapts a playful **paper / manila-folder** visual language (folder tabs, paperclips, washi tape, layered rotated paper, mood-face stickers, chunky offset shadows) to DailyMood's existing warm palette and content.

The redesign is delivered as **3 interchangeable visual directions** that share one component system, one content source, and one CSS file — they differ only by a `data-dir` attribute on `<html>` plus a few conditional branches:

| Direction | `data-dir` | Identity |
|---|---|---|
| **01 · Manila Desk** | `desk` | Cozy kraft-cream desk, **peach** primary, metal **paperclips**, rotated stacked paper, deep-plum dark folders. *(flagship / default)* |
| **02 · Highlighter Pop** | `pop` | **Peach-flood** section bands alternating with cream, white folder cards, bouncy mood-face stickers, ink tabs. Loud / high-energy. |
| **03 · Soft Scrapbook** | `scrapbook` | Soft pastel bands, **washi tape** instead of clips, purple/pastel tabs, gentler shadows, more whitespace. Calm / premium. |

**Open `Landing-Directions.html`** for a side-by-side chooser with live previews. **The client has not yet locked a single direction** — confirm which one (or which mix) to build before implementing. The system is built so any direction, or a blend, is a config change rather than a rewrite.

---

## About the Design Files
The files in this bundle are **design references built in HTML + inline-Babel React** — prototypes that show the intended look and behavior. They are **not** production code to copy verbatim.

The task is to **recreate these designs in DailyMood's existing codebase** — **Next.js App Router · TypeScript · Tailwind · next-intl** — using its established components, tokens, and i18n patterns. The HTML/JSX here uses inline styles and a hand-rolled CSS file purely so the prototype runs standalone in a browser; translate those into Tailwind classes / the app's `globals.css` tokens.

> The companion spec **`PRD-Landing.md`** (in the project root, from the earlier clean-layout version) remains the **copy + behaviour + IA source of truth** (routes, email-capture stub, SEO, acceptance checks). This redesign changes the **visual language only** — section order is lightly re-arranged (see below) and the hero email input was removed. Where the PRD and these mocks disagree on styling, trust the mocks; on copy/behaviour, trust the PRD.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, shadows, and interactions are all specified. Recreate pixel-accurately using the codebase's libraries. The only deliberately rough parts are placeholder imagery (article covers and the AI "vision" photo are CSS gradients — see **Assets**).

---

## Information Architecture (top → bottom)
Section order in all three directions (in `pp-sections.jsx`, composed in each HTML file):

1. **Nav** (sticky) — logo lockup · 4 anchor links (Features / AI / Pricing / FAQ) · TH/EN toggle · "เริ่มฟรี" CTA. Transparent → cream blur on scroll (>10px).
2. **Hero** — eyebrow chip · huge display headline (highlighter-marker swash on the last line) · sub-paragraph · **focal 14-day-trial card** · primary CTA button · 3 trust ticks · right column = app mockup inside a folder (tab "วันนี้/Today") with paperclip/tape + floating mood stickers + "Streak +7" chip.
3. **By the Numbers** — 4 **stacked paper-sheet** cards with big numbers (honest product facts: `7` moods, `≤10`s/entry, `365` days, `2` languages) + a mood-face sticker each.
4. **AI Showcase** — a **dark plum folder** (peach tab) with a paperclip; gradient-italic headline; 3 white cards (Text NLP demo / Vision demo / Weekly Insights demo).
5. **A Day with DailyMood** (re-themed "How it works") — vertical dashed **timeline** with time labels, mood-sticker rows; first row highlighted. 5 steps mapped to real features.
6. **Year in Pixels** — copy + 6-color legend (left); a folder (tab "2026") containing the 12×31 mood-pixel grid (right).
7. **Features Grid** — 3×3 white cards, each with a tinted icon tile (inline-SVG `FeatIcon`, no emoji) + title + one-line desc. Slight per-card rotation.
8. **Articles** — 3 cards, each with washi tape on top, a gradient cover + category chip, date · read-time, title, excerpt, "อ่านบทความ →".
9. **Testimonials** — 4 stacked-paper cards with a paperclip, quote, divider, gradient avatar disc + name + role. Alternating vertical offset. **No star ratings.**
10. **Pricing** — 2 folders side by side: Free (mint tab, ghost CTA) and Pro (plum tab + "ยอดนิยม" badge, dark gradient body, peach CTA).
11. **FAQ** — sticky title + mint sticker (left); accordion of 6 white sheets (right), one open at a time (`max-height` transition).
12. **CTA Banner** — a folder (tab "เริ่มเลย/Start here") with a peach→pink→purple gradient body, floating mood stickers, white pill CTA.
13. **Footer** — dark plum; mark + white "Dailymood" wordmark + tagline; Product & Legal link columns; copyright + TH/EN toggle.

**Removed from the older PRD layout:** hero email-input form (now a single CTA + a focal 14-day-trial card), TrustStrip, StatsBand/vanity metrics. **Added:** "By the Numbers" (factual), "A Day with DailyMood" timeline framing.

---

## Visual System — "Paper Desk"

### Design tokens
Base brand tokens come from the app (`tokens.css` in this bundle). Paper-specific tokens live in `paper.css` under `:root` and are overridden per direction via `html[data-dir="…"]`.

**Brand palette (unchanged from app):**
```
--peach:#FCA45B   --purple:#A673F1   --purple-strong:#9747FF
--mint:#85ECCB    --lavender:#D4BEE4  --yellow:#FDCB56
--blue:#9ACDE2    --cyan:#06B6D4
```
**Paper / surface tokens:**
```
--ink:#1A1320     --ink-2:#5A4E62    --ink-3:#8C8497
--plum:#1A1320    --plum-2:#2A1F33            (dark folders/footer)
--paper:#FFFFFF   --paper-2:#FCF7EE          (card / inset paper)
--kraft:#E9D6B4   --kraft-2:#DCC59A          (manila folder backs)
--clip:#B7B2BC                               (paperclip metal)
--line:rgba(26,19,32,.10)                    (hairline borders)
```
**Per-direction overrides** (the only differences in CSS):
```
html[data-dir="desk"]      { --desk:#F1E5CF; --desk-2:#E8DABF; --tab:var(--peach); }
html[data-dir="pop"]       { --desk:#FBF1E2; --desk-2:#FCA45B; --tab:#1A1320; }
html[data-dir="scrapbook"] { --desk:#FBF7F0; --desk-2:#F4EEE3; --tab:var(--purple);
                             --kraft:#FFFFFF; --kraft-2:#FBF5EB; }
```
- `--desk` = page background. `--desk-2` = alternating-band background (used by By-the-Numbers spacing, Day timeline, Features, Testimonials, FAQ). In `pop`, `--desk-2` is full peach → those bands flood peach with white cards on top.

**Spacing / shape:**
- Section padding: `100px 0` desktop, `64px 0` ≤720px (`.section`).
- Container: `max-width:1180px; padding:0 32px` (18px ≤720px).
- Card radius: folder bodies use an asymmetric `4px 18–26px 18–26px 18–26px` (the small top-left corner reads as a folder seam). Plain cards/sheets use `14–16px`.
- Grid gaps: 16–22px.

**Shadows (soft, warm):**
```
--shadow-sm: 0 6px 16px -8px rgba(60,40,20,.30)
--shadow-md: 0 18px 40px -18px rgba(60,40,20,.40)
--shadow-lg: 0 36px 70px -30px rgba(40,20,10,.45)
```
**Chunky "hard" button shadow** (signature): a solid offset layer + soft ambient, e.g. peach CTA: `box-shadow: 0 10px 0 -2px #d97f3b, 0 18px 30px -14px rgba(217,127,59,.7)` and translateY(-2px) on hover. Ink/white buttons use the same pattern with `#000` / `#d9cdb8`.

### Typography
- Family: **Urbanist** (400/500/600/700/800) for Latin; **Noto Sans Thai** (400/500/700) for Thai — applied via the `.thai` class on Thai text nodes. `--font: 'Urbanist','Noto Sans Thai',system-ui,sans-serif`.
- **Display** (`.display`): weight 800, `letter-spacing:-0.03em`, `line-height:.98` (Thai loosens to `-0.01em` / `1.05`). Hero h1 `clamp(40px,6.4vw,82px)`; section h2 `clamp(30px,4.6vw,56px)`.
- Body: 17px base, 1.55 line-height. Sub-paragraphs 18–19px, `--ink-2`.
- Eyebrow chip (`.eyebrow`): 11px / 800 / uppercase / `.12em` tracking / dark `--ink` pill, white text (light variant available).

### Signature components (in `paper.css` + `pp-parts.jsx`)
- **Folder** = a `.tab` (rounded-top label with a skewed folded corner via `::after`) sitting with `-8px` margin over a `.sheet` body. Tab color classes: `peach / ink / mint / lav / yellow / purple / plum / paper`.
- **Paperclip** — inline SVG (`Paperclip`), abs-positioned at a card's top edge, rotated, with a drop-shadow.
- **Washi tape** (`.washi`) — semi-transparent rotated strip with masked perforated edges; color variants `mint / lav / yellow / purple`.
- **Sticker** (`Sticker`) — a mood face (`MoodFace` SVG, 7 expressions) in a white-bordered colored disc with a peel shadow; `floaty` (gentle bob) or `bouncy` (springy) animation.
- **Stacked paper** (`.stacked`) — two rotated `::before/::after` paper layers behind a card.
- **Highlighter marker** (`.mark`) — a rotated rounded color block behind a word (peach default; `mint/lav/yellow/purple`).
- **Focal trial card** (`.trial-focal`) — white card, 2.5px ink border, hard offset shadow, gradient "14" badge; keyboard-focusable link to `#pricing`.

### Animations (CSS only)
- `floaty` (6s bob), `bouncy` (3.2s spring) for stickers/chips.
- All decorative motion is disabled under `@media (prefers-reduced-motion: reduce)`.
- FAQ accordion: `max-height` transition. No animation library.
- ⚠️ **Do not gate content visibility on entry animations** — an earlier `risein` keyframe (opacity 0→1) was removed because backgrounded tabs left the hero invisible. Keep visible state as the base style.

---

## Interactions & Behavior
- **Nav scroll state:** `scrollY > 10` → cream `rgba(247,240,228,.88)` + `backdrop-blur` + bottom hairline; else transparent.
- **TH/EN toggle:** flips `lang` in `LangProvider`, persisted to `localStorage['dm-lang']`, sets `document.documentElement.lang`. Default **th**. All copy swaps live. In the app, use **next-intl** locale routing (`/th`, `/en`) instead of localStorage.
- **FAQ:** single-open accordion (`open === i ? -1 : i`).
- **CTAs / email:** hero has no email field — primary CTA links to `#cta` (and the real app should point auth CTAs to `/login`; trial card → `/pricing` or `/profile/subscription`). Email-capture stub from the PRD is no longer in the hero.
- **Hover:** buttons translateY(-2px); article/testimonial cards lift and straighten (rotation → 0) with a larger shadow.
- **Responsive:** grids collapse via `.grid-2/3/4` + `.hero-grid` media rules — 3/4-col → 2-col ≤980px → 1-col ≤640px; hero → 1-col ≤980px; nav links hidden ≤640px (needs a mobile menu in production — not designed yet, flag to client).

## State Management
Minimal, all client-side:
- `lang` ('th' | 'en') — context provider (`LangProvider` in `i18n.jsx`), persisted.
- `nav.scrolled` (boolean) — scroll listener.
- `faq.open` (index | -1).
- Direction (`desk`/`pop`/`scrapbook`) is **build-time config**, not runtime state — pick one for production (or expose as a theme if the client wants all three).
No data fetching in the marketing page (per PRD, email lead POST is a stubbed endpoint).

---

## Assets
- **`dailymood-logo.png`** (1920×617, transparent) — full lockup (gradient speech-bubble smiley + dark "Dailymood" wordmark). Used in the **nav** and the in-mockup app top bar (light backgrounds only — the wordmark is dark ink).
- **`dailymood-mark.png`** (≈495×548, transparent) — just the gradient smiley mark, cropped from the lockup. Used on the **dark footer** paired with a white "Dailymood" text wordmark (since the lockup wordmark would vanish on plum). Use this for any dark-background placement and as a square app icon / favicon source.
- **Mood faces** — drawn as inline SVG (`MoodFace`, 7 expressions: great/good/okay/meh/bad/awful/calm). Reusable as the brand's sticker characters.
- **Feature icons** — inline SVG (`FeatIcon`, 9 icons indexed by grid position). No emoji in the grid.
- **Placeholders to replace with real imagery:** article cover images and the AI "vision" demo photo are CSS gradients with a diagonal texture. Swap for real photos in production (consider an image slot / CMS field per article).
- Fonts loaded from Google Fonts (Urbanist + Noto Sans Thai) in `tokens.css` `@import`.

---

## Files in this bundle
| File | What it is |
|---|---|
| `Landing-Directions.html` | Chooser page — live side-by-side previews of all 3 directions. Start here. |
| `Landing-Manila-Desk.html` | Direction 01 (`data-dir="desk"`). |
| `Landing-Highlighter-Pop.html` | Direction 02 (`data-dir="pop"`). |
| `Landing-Soft-Scrapbook.html` | Direction 03 (`data-dir="scrapbook"`). |
| `paper.css` | All paper-aesthetic CSS + per-direction theme overrides + buttons + responsive rules. |
| `pp-parts.jsx` | Shared primitives: `Folder, Paperclip, Sticker, MoodFace, Logo, LogoLockup, Check, FeatIcon, Arrow` + reused `AppDashboard`, AI demos (`NLPDemo/VisionDemo/InsightsDemo`), `yearCell`. Window-exported. |
| `pp-sections.jsx` | All 13 sections, themed by `window.DM_DIR`. Window-exported. |
| `i18n.jsx` | Bilingual copy (TH/EN) + `LangProvider` / `useLang` / `T`. **Copy source of truth for this redesign.** |
| `tokens.css` | App brand tokens (colors, font import). |
| `dailymood-logo.png`, `dailymood-mark.png` | Logo lockup + cropped mark. |

**Each page** sets `window.DM_DIR` + `data-dir`, then loads React 18.3.1 + Babel standalone, then `i18n.jsx` → `pp-parts.jsx` → `pp-sections.jsx`, then composes the sections. To run locally: serve the folder over HTTP (e.g. `npx serve`) and open a page — `file://` will block the Babel script loads.

### Suggested production structure
Mirror the PRD's `components/landing/*` layout. Each section → a React/Tailwind component; the paper primitives (`Folder`, `Paperclip`, `Sticker`, `WashiTape`, `MoodFace`, etc.) → a small shared `components/landing/paper/` kit. Port `paper.css` tokens into `globals.css` / the Tailwind theme; replace inline styles with utility classes. Wire copy through next-intl using the strings in `i18n.jsx`. Choose the direction with the client and implement that one (keep the others as reference).

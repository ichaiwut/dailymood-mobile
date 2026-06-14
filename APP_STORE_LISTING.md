# App Store listing — DailyMood (v1.0.0)

Copy-paste source for App Store Connect (and reusable for Google Play). Two
localizations: **English (Primary)** + **Thai**. Char limits noted per field.

---

## Metadata / config (App Store Connect)

| Field | Value |
|---|---|
| **Category (Primary)** | Health & Fitness |
| **Category (Secondary)** | Lifestyle |
| **Age rating** | 4+ (mood self-reflection, no objectionable content; app disclaims AI ≠ medical advice). If the questionnaire flags "Infrequent/Mild Medical Information" → 12+. |
| **Privacy Policy URL** | https://my.dailymood.me/privacy |
| **Terms of Use (EULA)** | https://my.dailymood.me/terms |
| **Support URL** | https://my.dailymood.me  *(must load — add /support or /help page if possible)* |
| **Marketing URL** (optional) | https://my.dailymood.me |
| **Price** | Free (with In-App Purchases) |
| **In-App Purchases** | DailyMood Pro — Monthly ฿99 · Yearly ฿790 |

✅ **DECIDED: iPhone-only.** `app.json` set to `supportsTablet: false` → no iPad
screenshots needed. Requires a fresh build (build 10) — build 9 on TestFlight still
has `supportsTablet: true` baked in, so the SUBMITTED binary must be build 10.

📸 **Screenshots required:** 6.7"/6.9" iPhone only (no iPad). Suggested 6 shots:
1) Today / log a mood  2) Smart Log AI result  3) Weekly AI Insights (forecast/DNA)
4) Calendar with mood colors  5) Year in Pixels  6) Stats / paywall.

---

## 🇬🇧 English (Primary)

**App Name** (≤30): `DailyMood: Mood Journal`

**Subtitle** (≤30): `Mood tracker with gentle AI`

**Promotional Text** (≤170):
```
Track how you feel in seconds and let gentle AI reveal the patterns behind your moods. Start a 14-day free Pro trial — no card needed.
```

**Keywords** (≤100, comma-separated, no spaces):
```
diary,mental health,wellbeing,self care,feelings,anxiety,gratitude,reflection,emotion,wellness
```

**Description** (≤4000):
```
DailyMood is a gentle place for how you feel. Log your mood in seconds, write a few words about your day, and let AI help you understand the patterns behind your emotions.

WHY DAILYMOOD
• Quick, calm mood logging — no pressure, no judgment
• AI that turns your notes into real insight
• Beautiful visualizations of your emotional year
• Private by design — your entries stay yours

LOG IN SECONDS
Tap a mood, add a note, done. Attach a photo, tag what mattered, even pin where it happened. Missed a day? Add it from the calendar.

AI THAT KNOWS YOU
• Smart Log — write freely; AI senses your mood, pulls out the themes, and writes a short recap
• AI Vision — add a photo and let AI read the moment
• Weekly Insights — your week decoded: a mood summary, the patterns behind it, and a gentle suggestion made for you
• Mood Forecast, Mood DNA, Themes & Energy Clock
• Ask AI — chat with your own data, grounded in your real entries

SEE THE BIGGER PICTURE
• Calendar with mood colors + monthly AI summaries
• Year in Pixels — your whole year, one pixel a day
• Stats: mood trends, mood mix, streaks, and which activities lift or lower your mood
• Achievements to celebrate every small step

MAKE IT YOURS
• Custom moods — your own icons, names, and colors
• Mood icon packs
• Special days — birthdays, anniversaries — on your calendar every year
• Daily check-in reminders, only on days you haven't logged

PRIVATE BY DESIGN
Your moods are personal. Everything stays tied to your account, and you can export (CSV) or delete your data anytime.

FREE & PRO
DailyMood is free — log moods, see your calendar and stats, and try AI a few times a day. Go Pro for unlimited AI, full weekly insights, Year in Pixels, custom moods, Ask AI, and CSV export.

DailyMood Pro
• Monthly — ฿99 / month
• Yearly — ฿790 / year (save 33%)
Try Pro free for 14 days — no card needed.

Payment is charged to your Apple ID at confirmation of purchase. Your subscription renews automatically unless canceled at least 24 hours before the end of the current period; your account is charged for renewal within 24 hours before the period ends. Manage or cancel anytime in your App Store settings.

Privacy Policy: https://my.dailymood.me/privacy
Terms of Use: https://my.dailymood.me/terms
```

**What's New** (release notes, 1.0.0):
```
Welcome to DailyMood 💜
Our very first release. Log your moods, let AI find the patterns, and watch your year come to life — one pixel at a time. Have an idea or found a bug? Tap "Send feedback" in the app anytime.
```

---

## 🇹🇭 ไทย (Thai)

**App Name** (≤30): `DailyMood: บันทึกอารมณ์`

**Subtitle** (≤30): `บันทึกอารมณ์ พร้อม AI ใจดี`

**Promotional Text** (≤170):
```
บันทึกความรู้สึกได้ในไม่กี่วินาที แล้วให้ AI ช่วยอ่านรูปแบบอารมณ์ของคุณ — ทดลอง Pro ฟรี 14 วัน ไม่ต้องใช้บัตร
```

**Keywords** (≤100):
```
ไดอารี่,สุขภาพจิต,อารมณ์,บันทึกอารมณ์,ความรู้สึก,ดูแลตัวเอง,ความเครียด,สมาธิ,mood,journal
```

**Description** (≤4000):
```
DailyMood คือพื้นที่อบอุ่นสำหรับความรู้สึกของคุณ บันทึกอารมณ์ได้ในไม่กี่วินาที เขียนสั้นๆ เกี่ยวกับวันของคุณ แล้วให้ AI ช่วยให้คุณเข้าใจรูปแบบเบื้องหลังอารมณ์ตัวเอง

ทำไมต้อง DAILYMOOD
• บันทึกอารมณ์ง่ายๆ สบายๆ ไม่กดดัน ไม่ตัดสิน
• AI ที่เปลี่ยนบันทึกของคุณให้เป็นความเข้าใจจริงๆ
• ภาพสรุปทั้งปีของอารมณ์ที่สวยงาม
• เป็นส่วนตัวตั้งแต่การออกแบบ — ข้อมูลเป็นของคุณคนเดียว

บันทึกได้ในไม่กี่วินาที
แตะอารมณ์ เขียนโน้ต เสร็จ แนบรูป ติดแท็กสิ่งที่สำคัญ หรือปักหมุดสถานที่ก็ได้ ลืมบันทึกวันไหน? เพิ่มย้อนหลังจากปฏิทินได้เลย

AI ที่รู้จักคุณ
• Smart Log — เขียนอิสระ แล้ว AI จะอ่านอารมณ์ ดึงประเด็นสำคัญ และสรุปสั้นๆ ให้
• AI Vision — แนบรูป แล้วให้ AI อ่านช่วงเวลานั้น
• สรุปรายสัปดาห์ด้วย AI — ถอดรหัสสัปดาห์ของคุณ: สรุปอารมณ์ รูปแบบเบื้องหลัง และคำแนะนำที่ทำมาเพื่อคุณ
• พยากรณ์อารมณ์ (Mood Forecast), Mood DNA, ธีม และ Energy Clock
• Ask AI — คุยกับข้อมูลของคุณเอง อ้างอิงจากบันทึกจริงของคุณ

มองเห็นภาพรวม
• ปฏิทินไล่สีตามอารมณ์ + สรุปรายเดือนด้วย AI
• Year in Pixels — ทั้งปีของคุณ วันละหนึ่งพิกเซล
• สถิติ: เทรนด์อารมณ์ ส่วนผสมอารมณ์ สตรีค และกิจกรรมไหนทำให้อารมณ์ดีขึ้น/แย่ลง
• ความสำเร็จ (Achievements) ฉลองทุกก้าวเล็กๆ

ปรับให้เป็นของคุณ
• สร้างอารมณ์เอง — ไอคอน ชื่อ และสีของคุณเอง
• ชุดไอคอนอารมณ์
• วันสำคัญ — วันเกิด วันครบรอบ — แสดงบนปฏิทินทุกปี
• เตือนเช็กอินรายวัน เฉพาะวันที่ยังไม่ได้บันทึก

เป็นส่วนตัวตั้งแต่ออกแบบ
อารมณ์ของคุณเป็นเรื่องส่วนตัว ทุกอย่างผูกกับบัญชีของคุณ และคุณส่งออก (CSV) หรือลบข้อมูลได้ทุกเมื่อ

ฟรี & PRO
DailyMood ใช้ฟรี — บันทึกอารมณ์ ดูปฏิทินและสถิติ และลองใช้ AI ได้วันละไม่กี่ครั้ง อัปเกรดเป็น Pro เพื่อ AI ไม่จำกัด สรุปรายสัปดาห์เต็มรูปแบบ Year in Pixels สร้างอารมณ์เอง Ask AI และส่งออก CSV

DailyMood Pro
• รายเดือน — ฿99 / เดือน
• รายปี — ฿790 / ปี (ประหยัด 33%)
ทดลอง Pro ฟรี 14 วัน — ไม่ต้องใช้บัตร

ระบบจะเรียกเก็บเงินผ่าน Apple ID ของคุณเมื่อยืนยันการซื้อ การสมัครจะต่ออายุอัตโนมัติ เว้นแต่ยกเลิกอย่างน้อย 24 ชั่วโมงก่อนสิ้นรอบ ระบบจะเรียกเก็บค่าต่ออายุภายใน 24 ชั่วโมงก่อนสิ้นรอบ คุณจัดการหรือยกเลิกได้ทุกเมื่อในการตั้งค่า App Store

นโยบายความเป็นส่วนตัว: https://my.dailymood.me/privacy
ข้อกำหนดการใช้งาน: https://my.dailymood.me/terms
```

**What's New** (1.0.0):
```
ยินดีต้อนรับสู่ DailyMood 💜
เวอร์ชันแรกของเรา บันทึกอารมณ์ ให้ AI ค้นหารูปแบบ แล้วดูทั้งปีของคุณค่อยๆ มีชีวิต — ทีละพิกเซล มีไอเดียหรือเจอบั๊ก? แตะ "ส่งความคิดเห็น" ในแอปได้ทุกเมื่อ
```

---

## App Privacy (App Store Connect → App Privacy)

**Verified: NO analytics / crash / ad / tracking SDK in the mobile app** → **Tracking = No
for every data type** (no App Tracking Transparency prompt needed). All data is collected
only to make the app work, and is tied to the user's account.

First question → "Do you or your third-party partners collect data?" → **Yes**.

For EACH data type below: **Used for tracking? → No**. **Linked to identity? → Yes**.

| Data type (Apple category) | Declare? | Purpose |
|---|---|---|
| Contact Info → **Email Address** | ✅ Yes | App Functionality |
| Contact Info → **Name** (display name) | ✅ Yes | App Functionality |
| User Content → **Photos or Videos** (AI Vision, avatar) | ✅ Yes | App Functionality |
| User Content → **Other User Content** (moods, notes, tags, custom moods, special days) | ✅ Yes | App Functionality, Product Personalization |
| Location → **Precise Location** (optional entry tagging) | ✅ Yes | App Functionality |
| Identifiers → **User ID** (account id) | ✅ Yes | App Functionality |
| Identifiers → **Device ID** (push token) | ✅ Yes | App Functionality |
| Purchases → **Purchase History** (subscription status, via RevenueCat) | ✅ Yes | App Functionality |

**RESOLVED — live Privacy Policy + backend confirmation (2026-06-14):**
- **Health & Fitness → Health: NO.** Policy does NOT frame moods as health/medical data
  → moods stay under **User Content → Other User Content**.
- **Usage Data → Product Interaction: NO — do NOT declare.** Backend CONFIRMED (from code)
  Google Analytics is **web-only**; the mobile app collects NO usage stats. Privacy page
  updated live to say so explicitly ("แอปมือถือไม่เก็บสถิติการใช้งานเลย"). iOS App Privacy =
  **no analytics** — consistent with the no-GA-SDK finding. ✅
- **Audio Data: NOT collected** — voice-to-text is local; audio files not retained.
- **Photos → Gemini (AI Vision sends images to Google Gemini, confirmed by BE):** iOS App
  Privacy has NO per-item "shared with third party" toggle (third-party processing is part
  of your declaration) → keep Photos = collected, Linked: Yes, App Functionality, Tracking:
  No. ⚠️ For **Google Play Data Safety** (Android, later): mark **Photos as SHARED with a
  third party** (Gemini).

**NOT collected:** Usage Data / Analytics (GA web-only), Payment Info (App Store handles),
Browsing/Search History, Contacts, Crash/Performance Diagnostics, Advertising Data, Audio.

**Third-party partners (none for ads/tracking):** Railway (DB), Cloudflare (images/CDN),
Google Gemini (AI on notes + AI Vision images), Resend (email), Google Maps (location
lookup), Expo (push), Stripe (web payments only), RevenueCat (mobile purchase verification).
Google Analytics = web-only (NOT a mobile data partner).

---

## Screenshot brief (for Claude design)

**Format:** iPhone 6.7"/6.9" portrait — **1290 × 2796 px** (PNG, no alpha). Apple needs this
size for the iPhone slot; reuse for the 6.5" slot too. 6 frames (Apple allows up to 10).
**Style:** marketing frames (device mockup + the app screen + a short headline above/below),
brand background **#FBF6EE** (cream), match brand (gradient smiley logo, rounded, warm, gentle —
see DESIGN.md). Keep headline short, sentence-case, friendly. Localize EN + TH.

| # | App screen to show | Headline EN | Headline TH |
|---|---|---|---|
| 1 | Today — pick a mood / log entry | A gentle place for how you feel | พื้นที่อบอุ่นสำหรับความรู้สึกของคุณ |
| 2 | Smart Log AI (note → mood/themes/recap) | Just write — AI reads your mood | แค่เขียน — AI อ่านอารมณ์ให้ |
| 3 | Weekly Insights (forecast / Mood DNA / energy) | Your week, decoded by AI | ถอดรหัสสัปดาห์ของคุณด้วย AI |
| 4 | Calendar (mood colors) | See your moods at a glance | เห็นอารมณ์ทั้งเดือนในพริบตา |
| 5 | Year in Pixels | Your whole year, one pixel a day | ทั้งปีของคุณ วันละพิกเซล |
| 6 | Stats (trends/mix) or Ask AI | Spot the patterns behind how you feel | เห็นรูปแบบเบื้องหลังความรู้สึก |

**Do NOT show the paywall** (not required by Apple; hurts conversion). Source the in-app screens
from build 10 (TestFlight). Same set reusable for Google Play (Play needs min 2, 16:9 or 9:16).

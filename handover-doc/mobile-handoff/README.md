# DailyMood — Mobile App Handover

> เอกสารส่งมอบสำหรับ **Claude ที่ทำฝั่ง Mobile (React Native + Expo)**
> เขียนโดย Claude ฝั่ง backend (repo `my.dailymood.me`) — 2026-06-07
> Snapshot ณ commit `feat/mobile-token-auth`. Source of truth คือ backend repo เสมอ

---

## 0. อ่านอะไรก่อน (TL;DR)

คุณกำลังจะสร้าง **mobile app (iOS + Android)** ของ DailyMood ซึ่งเป็นแอปบันทึกอารมณ์ (mood journaling) ที่มี AI ช่วยวิเคราะห์ ตอนนี้มี **web app + REST API พร้อมแล้ว** หน้าที่คุณคือสร้าง native client ที่ยิง API เดิม **ไม่ต้องเขียน backend ใหม่**

ไฟล์ในโฟลเดอร์นี้:
- **`README.md`** (ไฟล์นี้) — auth contract + API + กติกา + แผนงาน อ่านอันนี้ก่อน
- **`features.md`** — รายการ feature ทั้งหมด + ตาราง API endpoints + schema (สำเนาจาก backend)
- **`design.md`** — design system "Paper Desk" + สี + typography + ทุกหน้าจอ (สำเนาจาก backend)

**3 อย่างที่สำคัญที่สุดที่ต้องเข้าใจ:**
1. **Auth = Bearer token** (section 2) — ไม่ใช่ cookie. ผม build endpoint ชุด `/api/auth/mobile/*` ไว้ให้แล้ว
2. **Account ผูกด้วย email** — user เดิมที่ login Google บน web จะเป็น account เดียวกันบน mobile อัตโนมัติ ไม่ต้อง migrate
3. **กติกา UX** (section 6) — copy ต้องเป็นภาษามนุษย์ TH/EN, premium ห้ามซ่อน, font ≥14px

---

## 1. สถาปัตยกรรมโดยรวม

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│  Mobile app (repo ใหม่)  │  HTTPS  │  Backend (repo นี้)           │
│  React Native + Expo     │ ──────▶ │  Next.js API @ my.dailymood.me│
│  - ยิง REST API          │ Bearer  │  - 72 REST routes /api/*      │
│  - เก็บ token ใน         │  token  │  - PostgreSQL + Drizzle       │
│    secure storage        │         │  - Gemini AI, Stripe, R2      │
└─────────────────────────┘         └──────────────────────────────┘
```

- **Base URL (prod):** `https://my.dailymood.me`
- **API:** REST, JSON, อยู่ใต้ `/api/*` — ดูตารางเต็มใน `features.md` (section "API Endpoints")
- Backend เป็น Next.js App Router (TypeScript). คุณ **ไม่ต้องแตะ** มัน — แค่เป็น consumer
- ทุก route ที่ tier = `auth` หรือ `premium` รับ **`Authorization: Bearer <accessToken>`** ได้ (ผมทำให้ helper กลาง `getSessionInfo()` รองรับแล้ว — web cookie ยังทำงานเหมือนเดิม)

---

## 2. ⭐ Auth Contract (อ่านละเอียด — นี่คือหัวใจของ handoff)

Web ใช้ NextAuth session cookie ซึ่ง native app ใช้ไม่ได้ ผมเลยเพิ่ม **token-based auth** ขนานไว้ โครงเป็น **access token (อายุสั้น) + refresh token (อายุยาว, หมุนเวียน)**

### 2.1 Token model

| Token | อายุ | เก็บที่ | ใช้ทำอะไร |
|---|---|---|---|
| **accessToken** | **1 ชั่วโมง** | memory / secure store | แนบ `Authorization: Bearer` ทุก request. เป็น JWT (HS256) stateless — server verify เองไม่ต้อง query DB |
| **refreshToken** | **60 วัน** | **secure store เท่านั้น** (expo-secure-store / Keychain / Keystore) | ใช้ขอ accessToken ใบใหม่เมื่อหมดอายุ. เป็น opaque string, **หมุนเวียนทุกครั้งที่ refresh** |

> ⚠️ **เก็บ refreshToken ใน secure store เท่านั้น** ห้าม AsyncStorage ธรรมดา
> ⚠️ **เก็บแค่ refreshToken ใบล่าสุด** — ดู reuse detection (2.5)

### 2.2 Endpoints (request / response จริง)

ทุก endpoint อยู่ใต้ `POST /api/auth/mobile/*` รับ/คืน JSON

**`POST /api/auth/mobile/login`** — email/password
```jsonc
// request
{ "email": "a@b.com", "password": "•••", "device": "iPhone 15 (optional)" }
// 200
{ "accessToken": "eyJ...", "refreshToken": "x9...", "tokenType": "Bearer",
  "expiresIn": 3600, "user": { "id": "...", "email": "a@b.com", "name": "...", "image": null } }
// 401 { "error": "invalid_credentials" }
// 403 { "error": "email_not_verified" }   ← user ยังไม่ verify email
// 429 { "error": "rate_limited" } + header retry-after
```

**`POST /api/auth/mobile/google`** — native Google sign-in
```jsonc
// request — idToken ได้จาก native Google sign-in (ดู 2.6)
{ "idToken": "<google id_token>", "device": "..." }
// 200 → เหมือน login (tokens + user)
// 401 { "error": "invalid_token" }
```

**`POST /api/auth/mobile/apple`** — Sign in with Apple
```jsonc
// request — name ส่งมาเฉพาะ "ครั้งแรก" ที่ user authorize (Apple ส่ง name ครั้งเดียว)
{ "idToken": "<apple identity token>", "name": "ชื่อ (ครั้งแรกเท่านั้น)", "device": "..." }
// 200 → tokens + user   |   401 { "error": "invalid_token" }
```

**`POST /api/auth/mobile/refresh`** — ต่ออายุ (rotation)
```jsonc
// request
{ "refreshToken": "x9...", "device": "..." }
// 200 → ได้ accessToken + refreshToken ใบใหม่ + user (refreshToken เก่าใช้ไม่ได้แล้ว)
{ "accessToken": "eyJ...", "refreshToken": "NEW...", "tokenType": "Bearer", "expiresIn": 3600, "user": {...} }
// 401 { "error": "invalid_token" }   ← ใช้ไม่ได้/ถูก revoke → ต้อง login ใหม่
// 401 { "error": "token_expired" }   ← refresh หมดอายุ (60 วัน) → ต้อง login ใหม่
```

**`POST /api/auth/mobile/logout`** — เลิกใช้ refresh token
```jsonc
{ "refreshToken": "x9..." }   // 200 { "ok": true } เสมอ (idempotent)
```

### 2.3 การยิง API ที่ต้อง auth

แนบ header ทุก request:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```
ถ้า accessToken หมดอายุ/ผิด → server ตอบ **401** (เช่น `{ "error": "auth_required" }`)

### 2.4 Client flow ที่แนะนำ (auto-refresh interceptor)

```
1. login/google/apple → เก็บ refreshToken ลง secure store, ถือ accessToken ไว้ใน memory
2. ทุก request แนบ Bearer accessToken
3. ถ้าได้ 401:
   a. เรียก /refresh ด้วย refreshToken
   b. สำเร็จ → เก็บ refreshToken ใบใหม่ (ทับใบเก่า), retry request เดิมด้วย accessToken ใหม่
   c. ล้มเหลว (401) → ล้าง token, เด้งไปหน้า login
4. กัน refresh ซ้อน: ถ้าหลาย request เจอ 401 พร้อมกัน ให้ refresh ครั้งเดียว (single-flight) แล้วค่อย retry ทุกตัว
5. logout → เรียก /logout แล้วล้าง secure store
```

### 2.5 Reuse / theft detection (สำคัญต่อ client)

refresh token **หมุนเวียน**: ทุกครั้งที่ `/refresh` สำเร็จ ใบเก่าถูก revoke ทันที ถ้ามีคน (หรือ bug) เอา **ใบที่ถูก revoke แล้วมาใช้ซ้ำ** → server มองว่าอาจถูกขโมย แล้ว **revoke refresh token ทั้งหมดของ user คนนั้น** → ทุก device หลุด login

ผลต่อคุณ: **อย่าเก็บ refreshToken ใบเก่าค้างไว้ และอย่ายิง /refresh ซ้อนด้วยใบเดียวกัน** ใช้ single-flight ตาม 2.4 ข้อ 4

### 2.6 Native sign-in setup (Google + Apple)

**ทำไมต้องมีทั้งคู่:** user ส่วนใหญ่สมัครผ่าน **Google** บน web (เป็น account หลัก) และ Google-only user **ไม่มี password** → ต้อง login ด้วย Google. ส่วน **Apple** จำเป็นเพราะ **App Store Guideline §4.8** บังคับว่าถ้ามี Google social login ต้องมี Sign in with Apple ด้วย (email/password ไม่นับเป็นทางเลือกที่เทียบเท่า)

**Google (Expo):** ใช้ `@react-native-google-signin/google-signin` (dev build) หรือ `expo-auth-session/providers/google`
- ต้องสร้าง **OAuth client ใหม่ใน Google Cloud Console**: iOS client + Android client (แยกจาก web client เดิม)
- ส่ง **`idToken`** (ไม่ใช่ accessToken) ที่ได้กลับมา ไปที่ `/api/auth/mobile/google`
- ⚠️ Backend verify `idToken` โดยเช็ค `aud` ตรงกับ env `GOOGLE_IOS_CLIENT_ID` / `GOOGLE_ANDROID_CLIENT_ID` — **client id ที่คุณใช้ต้องตรงกับที่ตั้งใน Railway** (คุยกับเจ้าของ backend ให้ตั้ง env ให้ตรง)

**Apple (Expo):** ใช้ `expo-apple-authentication`
- ต้องตั้ง Apple Developer: App ID + enable "Sign in with Apple"
- ส่ง **`identityToken`** → `/api/auth/mobile/apple`. ครั้งแรกที่ user กดอนุญาต Apple จะให้ `fullName` มาด้วย → ส่งเป็น field `name` (ครั้งต่อไป Apple ไม่ส่งชื่อแล้ว)
- ⚠️ Backend verify `aud` ตรงกับ env `APPLE_CLIENT_ID` (bundle id ของแอป) — ต้องตรงกัน

> **Credentials ที่เจ้าของ backend ต้อง provision บน Railway (ยังไม่ได้ตั้ง):**
> `GOOGLE_IOS_CLIENT_ID`, `GOOGLE_ANDROID_CLIENT_ID`, `APPLE_CLIENT_ID`
> จนกว่าจะตั้ง → `/google` กับ `/apple` จะตอบ 401 เสมอ (email/password ใช้ได้เลย)

---

## 3. API ที่ต้องใช้ (อ้างอิง `features.md`)

ตาราง endpoints เต็มอยู่ใน **`features.md` → section "API Endpoints"** (มี method/tier/คำอธิบายครบ) ที่ต้องรู้:

- **tier `auth`** = ต้อง login (ส่ง Bearer). **tier `premium`** = ต้องเป็น Pro/trial. **tier `any`** = ใครก็เรียกได้
- **Premium คำนวณฝั่ง server** (`getSessionInfo` = Stripe active **หรือ** trial active) — client อย่า gate เอง แค่ทำ UX; server บังคับจริง. อ่าน tier ได้จาก `GET /api/profile` หรือ `GET /api/subscription`
- Endpoint สำคัญสำหรับ MVP: `/api/log/*` (บันทึก/อ่าน entries), `/api/moods` (รายการ mood), `/api/calendar`, `/api/stats`, `/api/profile`, `/api/log/smart` + `/api/log/confirm` (Smart Log AI flow)

### 3.1 Data shapes ที่ควรรู้

- **Mood:** มี **7 system moods** (Happy/Calm/Neutral/Sad/Angry/Anxious/Tired) แต่ละอันมี `id`, emoji, สี, score (1-5) — **ดึงจาก `GET /api/moods` อย่า hardcode id** (สีกับ score ดูได้ใน `design.md` → "Mood Colors"). user Pro มี custom moods เพิ่มได้
- **Mood entry:** `{ id, userId, moodTypeId, note, imageKey, tags[], sentiment, aiSummary, activityId, location, date, createdAt }` (ดู `mood_entries` ใน features.md schema)
- **รูปภาพ:** API คืน **signed R2 URL อายุ 1 ชม.** — โหลดทันที อย่า cache URL ข้ามชั่วโมง (รูปจะหมดอายุ); ถ้าต้องแสดงทีหลังให้ขอ entry ใหม่
- **อัปโหลดรูป:** ต้อง **optimize ก่อน upload** (resize ≤1600px, WebP, quality ~0.82) แล้ว POST `/api/upload` (premium) ได้ `imageKey` กลับมา

---

## 4. Smart Log flow (feature หลักของแอป)

หัวใจ UX คือการบันทึกอารมณ์ด้วย AI (ดู `design.md` → "Smart Log Flow"):
1. user เลือก mood → พิมพ์ note (หรือพูด/แนบรูป)
2. **Quick Save** (ไม่มี text) → บันทึก mood เฉยๆ
3. **AI Analyze** (มี text) → `POST /api/log/smart` (multipart text/image) → Gemini คืน mood + tags + summary (ยังไม่เขียน DB)
4. user แก้/ยืนยัน → `POST /api/log/confirm` → บันทึกจริง
5. Free: AI 3 ครั้ง/วัน (เช็คโควต้าที่ `/api/ai/remaining`), Pro: ไม่จำกัด + AI Vision (รูป)

---

## 5. Design system — "Paper Desk" (อ้างอิง `design.md`)

แอปใช้ธีม **"Paper Desk"** — กระดาษจดโน้ตบนโต๊ะทำงาน: paper sheets, washi tape, paperclip, mood stickers, เงา offset แบบหนา รายละเอียดเต็ม (ทุกหน้าจอ + component) อยู่ใน **`design.md`**

**สิ่งที่ต้อง carry มาทำ mobile (สรุป):**
- **Mood colors** (ใช้ HEX ตรง ไม่พึ่ง CSS var): Happy `#FCA45B`, Calm `#85ECCB`, Neutral `#FDCB56`, Sad `#9ACDE2`, Angry `#FEAD8D`, Anxious `#D4BEE4`, Tired `#A673F1`
- **Brand:** primary/purple `#A673F1`, accent/peach `#FCA45B`, ink `#1A1320`, cream bg `#FBF6EE`
- **Typography:** Urbanist (Latin, 400–800) + Noto Sans Thai (ไทย, 400–700). หัวข้อ 800, ปุ่ม/label 700
- **รองรับ dark mode** — design.md อธิบาย token ที่ flip ตามธีม (`--w-ink*` ฯลฯ)
- **Mobile native ไม่ต้อง copy เป๊ะ pixel** — เอา *ภาษา* ของ Paper Desk (กระดาษ/sticker/washi/เงาหนา) มาตีความใหม่ให้เป็น native ที่ลื่น ไม่ใช่ลอก DOM/CSS ของ web

---

## 6. กติกาที่ห้ามพลาด (จาก CLAUDE.md ของ backend)

1. **UX Copy เป็นภาษามนุษย์** — ทุกข้อความที่ user เห็น (placeholder, label, ปุ่ม, error, toast) ห้ามใช้ศัพท์เทคนิค (tags, sentiment, NLP, Gemini, rate_limited) ตรงๆ. error code จาก API (`invalid_credentials` ฯลฯ) ต้อง **map เป็นข้อความสุภาพ** ก่อนโชว์
2. **Tone** — แอปบันทึกอารมณ์ ไม่ใช่ chatbot. **ห้าม**ใช้ copy ที่ขอให้ user "เล่า"/"บอก". โทนเบา เปิดกว้าง ไม่กดดัน (เช่น "วันนี้เป็นยังไงบ้าง..." ดีกว่า "เล่าให้ฟังหน่อย"). ภาษาไทยใช้คำพูดธรรมดา ไม่ทางการ/การแพทย์ (เลี่ยง วินิจฉัย, คลาดเคลื่อน)
3. **Premium ห้ามซ่อน** — feature Pro ต้องโชว์เสมอพร้อม badge "PREMIUM" + คำอธิบาย + teaser ห้ามซ่อนทั้งก้อนออกจาก UI. ให้ user เห็นว่ามีของแล้วอยากอัปเกรด
4. **Font ≥ 14px** — ทุกข้อความห้ามเล็กกว่านี้
5. **i18n TH/EN** — รองรับสองภาษา. ค่า `locale` ของ user อยู่ใน `/api/profile`. ดึง copy จาก translation ไม่ hardcode
6. **เวลา = ICT (UTC+7)** — วันที่/เวลาฝั่ง server เป็น ICT. ระวัง timezone ตอนแสดง "วันนี้"/streak
7. **No PII ในที่สาธารณะ** — share card / analytics ห้ามมี note/email/ชื่อ

---

## 7. iOS / Apple checklist

- ✅ **Sign in with Apple จำเป็น** (§4.8) — เพราะมี Google sign-in. ทำตั้งแต่แรก ไม่งั้น App Store reject
- รูปภาพส่วนตัว = signed URL อายุ 1 ชม. (ไม่มีปัญหากับ iOS แค่ระวัง cache)
- ใช้ `expo-secure-store` เก็บ refreshToken (Keychain)
- ATS: API เป็น HTTPS อยู่แล้ว ✅

---

## 8. แนะนำ tech stack + ลำดับงาน (mobile repo)

**Stack ที่แนะนำ:**
- Expo (dev build — เพราะต้องใช้ native Google/Apple sign-in)
- `expo-secure-store` (token), `expo-apple-authentication`, `@react-native-google-signin/google-signin`
- API client: `fetch`/`axios` + interceptor auto-refresh (single-flight) ตาม 2.4
- State/data: React Query (TanStack Query) เหมาะกับ REST + cache + retry
- i18n: `i18next` / `expo-localization` (TH/EN) — sync กับ `locale` ของ user
- Reanimated สำหรับ motion (Paper Desk มี micro-interactions เยอะ)

**ลำดับงานที่แนะนำ (milestones):**
1. **Auth & shell** — login/register/Google/Apple + secure token + auto-refresh + เด้ง login wall. (ใช้ section 2 ทั้งดุ้น)
2. **Today / Home** — ดู entries วันนี้ + mood picker + Smart Log (text → `/api/log/smart` → `/api/log/confirm`)
3. **Calendar + Entry detail + Edit** — `/api/calendar`, `/api/log/[id]`
4. **Stats + Insights** — `/api/stats`, `/api/insights` (premium teaser)
5. **Profile + Settings + Subscription** — `/api/profile`, `/api/subscription` (Stripe ทำผ่าน web/portal — mobile อาจลิงก์ออก web หรือใช้ IAP ภายหลัง ⚠️ ดู section 9)
6. **Polish** — Paper Desk visual language, dark mode, i18n, animations

---

## 9. ข้อควรรู้ / ของที่ backend ยังไม่มี (ถามเจ้าของ backend)

- **Push notification: ยังไม่มี** — backend มี reminder ผ่าน **email** (cron `/api/cron/reminders` ตาม `reminderEnabled`/`reminderTime`/`reminderDays` ใน users) แต่ยังไม่มี push. ถ้าจะทำ push ต้องเพิ่มฝั่ง backend (เก็บ device push token + ยิงผ่าน APNs/FCM) — เป็นงานเฟสถัดไป
- **Payment บน mobile:** ปัจจุบันเป็น **Stripe Checkout/Portal (web)**. Apple/Google บังคับใช้ **IAP** สำหรับ digital goods ในแอป — เรื่องนี้ต้องตัดสินใจ (IAP integration + webhook ฝั่ง backend) ก่อนขาย Pro ในแอป iOS. MVP อาจโชว์ Pro features + ลิงก์ไปจัดการบน web ไปก่อน (ระวังกฎ Apple เรื่อง external purchase link)
- **Endpoints ที่ "อาจอยากได้เพิ่ม"** (ยังไม่มี — ถ้าต้องการให้บอก backend): logout-all-devices, delete-account ผ่าน token (web มี `DELETE` flow), push-token register
- **Account by email:** ถ้า user เคยใช้ Google (email จริง) แล้วมาใช้ Apple (ซึ่งอาจให้ private-relay email) จะกลายเป็นคนละ account — เป็นข้อจำกัดที่รู้อยู่ (key by email)

---

## 10. สรุป contract สั้นๆ (ติดไว้ข้างจอ)

```
BASE = https://my.dailymood.me
AUTH = Authorization: Bearer <accessToken>   (access 1h, refresh 60d rotating)

login    POST /api/auth/mobile/login    {email,password}        → {accessToken,refreshToken,expiresIn,user}
google   POST /api/auth/mobile/google   {idToken}               → same
apple    POST /api/auth/mobile/apple    {idToken,name?}         → same
refresh  POST /api/auth/mobile/refresh  {refreshToken}          → same (rotated)
logout   POST /api/auth/mobile/logout   {refreshToken}          → {ok:true}

401 จาก endpoint อื่น → /refresh → retry; /refresh ล้มเหลว → login ใหม่
errors: invalid_credentials | email_not_verified | invalid_token | token_expired | rate_limited
moods: GET /api/moods (อย่า hardcode id) · images: signed URL อายุ 1h · premium: server-enforced
กติกา: copy ภาษามนุษย์ TH/EN · ห้ามขอ "เล่า/บอก" · premium ห้ามซ่อน · font≥14px · ICT tz
```

อ่าน `features.md` (API + features ครบ) และ `design.md` (Paper Desk + ทุกหน้าจอ) ต่อได้เลย — ขอให้สนุกกับการ build 🚀

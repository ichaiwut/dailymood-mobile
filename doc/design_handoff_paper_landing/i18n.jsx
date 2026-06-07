// Bilingual content. TH-first, EN toggle.
// Keys are flat-ish; reuse same shape across both langs.

const COPY = {
  th: {
    banner: { badge: 'ใหม่', text: 'ลองใช้ Pro ฟรี 14 วัน — ไม่ต้องใส่บัตร ไม่ตัดเงิน', cta: 'เปิดใช้ฟรี' },
    nav: { features: 'ฟีเจอร์', ai: 'AI', pricing: 'ราคา', faq: 'คำถาม', signin: 'เข้าสู่ระบบ', cta: 'เริ่มฟรี' },
    hero: {
      eyebrow: 'AI-POWERED MOOD JOURNAL',
      h1a: 'บันทึกอารมณ์ของคุณ',
      h1b: 'ทุกวัน',
      h1c: 'ใน 10 วินาที',
      sub: 'DailyMood ใช้ AI ช่วยเข้าใจอารมณ์คุณจากข้อความ เสียง และรูปภาพ ค้นพบแพทเทิร์น แล้วเห็นภาพรวมทั้งปีในที่เดียว — ฟรี ไม่ต้องใส่บัตรเครดิต',
      emailPh: 'อีเมลของคุณ',
      ctaMain: 'เริ่มใช้ฟรี',
      ctaSub: 'ฟรี ตลอดไป · ไม่ต้องใส่บัตรเครดิต',
      trust1: 'เข้ารหัสข้อมูล',
      trust2: 'ไม่มีโฆษณา',
      trust3: 'ภาษาไทย + อังกฤษ',
    },
    stats: { e1: 'รายการอารมณ์ที่บันทึก', e2: 'ผู้ใช้งานทั่วโลก', e3: 'คะแนนรีวิวเฉลี่ย', e4: 'รองรับ' },
    trustStrip: 'ใช้งานโดยนักศึกษา นักเทรนเนอร์ นักจิตวิทยา และคนทำงานทั่วประเทศ',
    ai: {
      eyebrow: 'AI · ขับเคลื่อนทุกอย่าง',
      h2a: 'AI ที่',
      h2b: 'เข้าใจคุณ',
      h2c: 'จริง ๆ',
      sub: 'ไม่ใช่แค่กรอกตัวเลข แต่ DailyMood ใช้ AI สรุปอารมณ์ ดึงประเด็นสำคัญ ค้นพบแพทเทิร์น แล้วถามได้เป็นภาษาธรรมชาติ',
      f1: { tag: 'AI · TEXT', title: 'พิมพ์อย่างไรก็เข้าใจ', desc: 'เขียนเป็นภาษามนุษย์ AI จะดึงอารมณ์ แท็ก และสรุปประโยคสำคัญให้ทันที — ปรับ/ยืนยันก่อนบันทึก' },
      f2: { tag: 'AI · VISION', title: 'ถ่ายรูปสิ่งที่เห็น', desc: 'อัปโหลดรูปวันนี้ AI วิเคราะห์บริบทและแนะนำแท็กที่เกี่ยวกับช่วงเวลานั้น (Pro)' },
      f3: { tag: 'WEEKLY INSIGHTS', title: 'สรุปสัปดาห์ที่อ่านแล้วเข้าใจตัวเอง', desc: 'ทุกสัปดาห์: สรุป + แพทเทิร์น + คำแนะนำเฉพาะคุณ พร้อม sparkline และโหวต thumbs up/down' },
    },
    articles: {
      eyebrow: 'JOURNAL · บทความ',
      title: 'อ่านเพิ่มเติม',
      sub: 'ทำความเข้าใจอารมณ์ตัวเอง ผ่านบทความสั้น ๆ ที่ทีม DailyMood เขียนเอง',
      seeAll: 'ดูบทความทั้งหมด',
      items: [
        {
          tag: 'AI · INSIGHTS',
          date: '12 พ.ค. 2026',
          read: 'อ่าน 5 นาที',
          title: 'AI อ่านอารมณ์เราได้จริงไหม? เบื้องหลังการสรุปบันทึก',
          excerpt: 'ดู workflow ของ AI ที่ DailyMood ใช้ — ตั้งแต่ดึง entities จนถึงเลือกแท็กที่ตรงใจที่สุด',
          grad: 'linear-gradient(135deg, #A673F1 0%, #FCA45B 100%)',
        },
        {
          tag: 'HABIT',
          date: '4 พ.ค. 2026',
          read: 'อ่าน 4 นาที',
          title: 'บันทึกวันละ 10 วิ ก็พอ: วิธีสร้างนิสัย journaling ที่ไม่หลุด',
          excerpt: '3 หลักง่าย ๆ จากงานวิจัย habit loop ที่ช่วยให้คุณบันทึกได้ทุกวันโดยไม่ต้องฝืน',
          grad: 'linear-gradient(135deg, #85ECCB 0%, #9ACDE2 100%)',
        },
        {
          tag: 'YEAR IN PIXELS',
          date: '28 เม.ย. 2026',
          read: 'อ่าน 6 นาที',
          title: 'อ่านปฏิทิน year-in-pixels ของคุณ — เห็นอะไรได้บ้าง',
          excerpt: 'คู่มืออ่านสีและแพทเทิร์น ตั้งแต่ช่วง deadline ไปจนถึงจังหวะ recovery ของแต่ละสัปดาห์',
          grad: 'linear-gradient(135deg, #FDCB56 0%, #FCA45B 60%, #D4BEE4 100%)',
        },
      ],
    },
    how: {
      eyebrow: 'HOW IT WORKS',
      title: 'เริ่มต้นใน 3 ขั้นตอน',
      s1t: 'แตะอารมณ์', s1d: 'เลือก 1 ใน 7 อารมณ์ default หรือสร้างของคุณเอง (Pro)',
      s2t: 'พิมพ์ พูด หรือถ่าย', s2d: 'เพิ่ม note สั้น ๆ ใช้เสียง หรืออัปโหลดรูป AI สรุปและแท็กให้',
      s3t: 'ดูภาพรวม', s3d: 'แคเลนเดอร์ year-in-pixels และ insights รายสัปดาห์ พร้อมแพทเทิร์น',
    },
    year: {
      eyebrow: 'YEAR IN PIXELS',
      title: 'ทั้งปีของคุณ ในจอเดียว',
      sub: 'แต่ละจุดคือหนึ่งวัน สีคืออารมณ์เด่น มองเห็นช่วงดี ช่วงแย่ และจังหวะของชีวิตทันที',
    },
    features: {
      eyebrow: 'FEATURES',
      title: 'ทุกอย่างที่ต้องใช้ ไม่มีอะไรเกินจำเป็น',
      list: [
        { t: 'Quick Icons', d: '7 อารมณ์เริ่มต้น + custom moods สำหรับ Pro · บันทึกได้หลายครั้งต่อวัน', c: 'peach' },
        { t: 'Smart Log + Voice', d: 'พิมพ์ note สั้น ๆ หรือพูดเลย — Web Speech รองรับทั้งไทยและอังกฤษ', c: 'purple' },
        { t: 'Smart Calendar', d: 'มุมมองรายเดือนพร้อม day sheet แตะวันไหนก็เลื่อนขึ้นดูบันทึกทันที', c: 'mint' },
        { t: 'Calendar AI Patterns', d: '★ best day · ◌ pattern · ◌ anomaly — AI ตรวจจับและไฮไลต์บนปฏิทินให้ (Pro)', c: 'lav' },
        { t: 'Ask AI', d: 'ถามเป็นภาษาธรรมชาติ "ฉันรู้สึกแย่ตอนไหนบ้างเดือนนี้?" — AI ตอบพร้อมวันที่ (Pro)', c: 'yellow' },
        { t: 'AI Insights รายสัปดาห์', d: 'สรุป + patterns + คำแนะนำเฉพาะคุณ + sparkline · share ออกได้ทันที', c: 'peach' },
        { t: 'Mood Stats', d: 'กราฟแนวโน้ม · mood mix donut · activity impact จาก tag-mood correlation จริง', c: 'blue' },
        { t: 'Achievements + Streak', d: '12 badges อัตโนมัติ · streak ring · highlight ของแต่ละสัปดาห์', c: 'purple' },
        { t: 'Mood Icon Packs', d: 'เปลี่ยนหน้าตา 7 อารมณ์ตามใจ · เพิ่ม avatar + bio ใน Profile', c: 'mint' },
      ],
    },
    testimonials: {
      eyebrow: 'WHAT PEOPLE SAY',
      title: 'รีวิวจากผู้ใช้จริง',
      sub: 'จัดวางตามรีวิวที่ได้รับใน 3 เดือนแรก',
      items: [
        { q: 'เป็นแอปแรกที่ทำให้รู้สึกว่าจดอารมณ์แล้วเข้าใจตัวเองจริง ๆ AI insights มันจี้ใจดำมาก', n: 'ภัทรา ส.', r: 'นักศึกษาปริญญาโท · กรุงเทพ' },
        { q: 'ใช้ทุกเช้า ไม่ถึง 30 วิ ดู year-in-pixels แล้วเห็นเลยว่าช่วง deadline งานคืออะไร', n: 'Daniel C.', r: 'Product Designer · Bangkok' },
        { q: 'เริ่มเห็นแพทเทิร์นของตัวเอง วันไหนทำงานได้ดี วันไหนต้องพัก ปรับชีวิตตามนี้เลย', n: 'ปริญญา ม.', r: 'ฟรีแลนซ์ · เชียงราย' },
        { q: 'ชอบที่ไม่มีโฆษณา ไม่มี streak shame ใช้เมื่อพร้อม', n: 'Mint K.', r: 'นักเขียน · เชียงใหม่' },
      ],
    },
    pricing: {
      eyebrow: 'PRICING',
      title: 'เริ่มฟรี อัปเกรดเมื่อพร้อม',
      sub: 'ไม่มี trial หลอก — Free ใช้ได้ตลอดไป Pro เปิดใช้ AI ไม่จำกัด',
      free: {
        name: 'Free', price: '฿0', per: 'ตลอดไป',
        feats: [
          'บันทึกไม่จำกัด + Quick icons + journal',
          'Voice input (TH + EN)',
          'Mood calendar + timeline + stats',
          'AI วิเคราะห์ข้อความ 5 ครั้ง/วัน',
          'Weekly insights (preview)',
          'Achievements + 12 badges',
        ],
        cta: 'เริ่มฟรี',
      },
      pro: {
        name: 'Pro', price: '฿99', per: '/ เดือน หรือ ฿949/ปี',
        badge: 'ยอดนิยม',
        feats: [
          'ทุกอย่างใน Free',
          'AI วิเคราะห์ข้อความไม่จำกัด',
          'AI Vision สำหรับรูปภาพ',
          'Weekly insights แบบเต็ม + share',
          'Calendar AI patterns + Ask AI',
          'Custom moods + Pro icon packs',
          'Custom avatar + bio',
          'Stats รายปี + activity impact เต็ม',
        ],
        cta: 'อัปเกรด Pro',
      },
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'คำถามที่พบบ่อย',
      items: [
        { q: 'DailyMood เก็บข้อมูลปลอดภัยแค่ไหน?', a: 'ข้อมูลเก็บใน Cloudflare D1 และ R2 เข้ารหัสระหว่างส่ง รูปภาพใช้ signed URL หมดอายุใน 1 ชั่วโมง เราไม่ขายหรือแบ่งปันข้อมูลของคุณ' },
        { q: 'AI ใช้บันทึกของฉันไป train โมเดลไหม?', a: 'ไม่ DailyMood เรียกใช้ AI แบบ stateless บันทึกของคุณไม่ถูกเก็บไว้หรือถูกใช้ฝึกโมเดลใด ๆ' },
        { q: 'ใช้บนมือถือได้ไหม?', a: 'ได้ — DailyMood เป็น web app ที่ทำงานบนเบราว์เซอร์ทุกขนาดจอ เปิดได้ทันทีไม่ต้องโหลดแอป สามารถ Add to Home Screen ได้เหมือนแอปจริง' },
        { q: 'ต่างจาก mood tracker ทั่วไปยังไง?', a: 'DailyMood ออกแบบให้ใช้เวลาน้อย (≤ 10 วินาที/วัน) แต่ได้ insights ที่ลึกขึ้นด้วย AI — สรุปอัตโนมัติ ตรวจ pattern บนปฏิทิน ถามเป็นภาษาธรรมชาติ และวิเคราะห์รูปภาพได้' },
        { q: 'ยกเลิก Pro ได้ตอนไหน?', a: 'ยกเลิกได้ตลอดผ่านหน้า Subscription ใน Profile หลังยกเลิกใช้ฟีเจอร์ Pro ได้จนสิ้นรอบบิล' },
        { q: 'มีภาษาอะไรบ้าง?', a: 'ปัจจุบันรองรับภาษาไทยและอังกฤษทั้งใน UI และ AI สรุป สามารถสลับได้ทันทีในหน้า settings' },
      ],
    },
    cta: { title: 'พร้อมรู้จักตัวเองดีขึ้นไหม?', sub: '10 วินาทีต่อวัน เริ่มได้เลย ไม่ต้องใส่บัตรเครดิต', btn: 'เริ่มใช้ DailyMood ฟรี' },
    footer: {
      tag: 'บันทึกอารมณ์ ค้นพบตัวเอง',
      product: 'สินค้า', company: 'บริษัท', legal: 'กฎหมาย',
      links: {
        product: [['ฟีเจอร์', '#features'], ['AI', '#ai'], ['ราคา', '#pricing'], ['What\'s new', '#']],
        company: [['เกี่ยวกับเรา', '#'], ['Blog', '#'], ['ติดต่อ', 'mailto:hello@dailymood.me']],
        legal: [['Privacy', '#'], ['Terms', '#'], ['Cookies', '#']],
      },
      copy: '© 2026 DailyMood · ทำที่กรุงเทพฯ ด้วย ☕ + 🌿',
    },
  },
  en: {
    banner: { badge: 'New', text: 'Try Pro free for 14 days — no card, no auto-charge', cta: 'Start free' },
    nav: { features: 'Features', ai: 'AI', pricing: 'Pricing', faq: 'FAQ', signin: 'Sign in', cta: 'Get started' },
    hero: {
      eyebrow: 'AI-POWERED MOOD JOURNAL',
      h1a: 'Track how you feel,',
      h1b: 'every day,',
      h1c: 'in 10 seconds.',
      sub: 'DailyMood uses AI to understand your mood from text, voice, and photos — surface patterns and see your whole year on one screen. Free, no credit card.',
      emailPh: 'Your email',
      ctaMain: 'Get started free',
      ctaSub: 'Free forever · No credit card required',
      trust1: 'Encrypted',
      trust2: 'No ads',
      trust3: 'TH + EN',
    },
    stats: { e1: 'entries logged', e2: 'users worldwide', e3: 'avg rating', e4: 'supported' },
    trustStrip: 'Used by students, coaches, therapists, and professionals across Thailand',
    ai: {
      eyebrow: 'AI · POWERS EVERYTHING',
      h2a: 'AI that',
      h2b: 'actually understands',
      h2c: 'you.',
      sub: 'Not just numbers. DailyMood reads your entries, pulls key phrases, finds patterns, and lets you ask in plain language.',
      f1: { tag: 'AI · TEXT', title: 'Type however you want', desc: 'Write naturally. AI extracts mood, tags, and a one-sentence summary — review and confirm before saving.' },
      f2: { tag: 'AI · VISION', title: 'Snap what you see', desc: 'Upload a photo. AI reads context and suggests tags about the moment (Pro).' },
      f3: { tag: 'WEEKLY INSIGHTS', title: 'A weekly recap that actually lands', desc: 'Summary, patterns, and one tailored suggestion each week — with sparklines and thumbs up/down feedback.' },
    },
    articles: {
      eyebrow: 'JOURNAL · ARTICLES',
      title: 'Read more',
      sub: 'Short reads from the DailyMood team about understanding your own moods.',
      seeAll: 'See all articles',
      items: [
        {
          tag: 'AI · INSIGHTS',
          date: 'May 12, 2026',
          read: '5 min read',
          title: 'Can AI really read your mood? A look behind the summaries.',
          excerpt: 'A walkthrough of the workflow DailyMood\'s AI runs — from entity extraction to picking the tags that actually land.',
          grad: 'linear-gradient(135deg, #A673F1 0%, #FCA45B 100%)',
        },
        {
          tag: 'HABIT',
          date: 'May 4, 2026',
          read: '4 min read',
          title: '10 seconds a day is enough: how to build a journaling habit that sticks.',
          excerpt: 'Three simple rules from habit-loop research that help you log every day without forcing it.',
          grad: 'linear-gradient(135deg, #85ECCB 0%, #9ACDE2 100%)',
        },
        {
          tag: 'YEAR IN PIXELS',
          date: 'Apr 28, 2026',
          read: '6 min read',
          title: 'Reading your year-in-pixels: what the colours are telling you.',
          excerpt: 'A guide to colour and pattern — from deadline stretches to weekly recovery rhythms.',
          grad: 'linear-gradient(135deg, #FDCB56 0%, #FCA45B 60%, #D4BEE4 100%)',
        },
      ],
    },
    how: {
      eyebrow: 'HOW IT WORKS',
      title: 'Three steps to start',
      s1t: 'Tap a mood', s1d: 'Pick one of 7 default moods or design your own (Pro)',
      s2t: 'Type, talk, or shoot', s2d: 'Add a short note, use voice, or attach a photo. AI summarises and tags.',
      s3t: 'See the big picture', s3d: 'Year-in-pixels calendar and weekly insights — patterns included.',
    },
    year: { eyebrow: 'YEAR IN PIXELS', title: 'Your whole year, one screen', sub: 'One dot per day, coloured by your dominant mood. Spot the good stretches, the rough patches, and your rhythm — instantly.' },
    features: {
      eyebrow: 'FEATURES',
      title: 'Everything you need. Nothing you don\'t.',
      list: [
        { t: 'Quick Icons', d: '7 default moods + custom moods (Pro) · log multiple times per day', c: 'peach' },
        { t: 'Smart Log + Voice', d: 'Short notes or speak it. Web Speech supports TH + EN.', c: 'purple' },
        { t: 'Smart Calendar', d: 'Monthly grid with a swipe-up day sheet — tap any day for entries.', c: 'mint' },
        { t: 'Calendar AI Patterns', d: '★ best day · ◌ pattern · ◌ anomaly — AI surfaces patterns on the grid (Pro)', c: 'lav' },
        { t: 'Ask AI', d: 'Ask anything in plain English: "when did I feel anxious this month?" — answers with date chips (Pro)', c: 'yellow' },
        { t: 'Weekly AI Insights', d: 'Summary + patterns + one tailored suggestion + sparkline · share to clipboard or socials.', c: 'peach' },
        { t: 'Mood Stats', d: 'Trend line, mood-mix donut, real activity impact from tag-mood correlation.', c: 'blue' },
        { t: 'Achievements + Streak', d: '12 auto-earned badges, streak ring, weekly highlights — never streak shame.', c: 'purple' },
        { t: 'Mood Icon Packs', d: 'Restyle your 7 moods. Profile gets custom avatar + bio too.', c: 'mint' },
      ],
    },
    testimonials: {
      eyebrow: 'WHAT PEOPLE SAY',
      title: 'Real reviews',
      sub: 'A few from our first three months.',
      items: [
        { q: 'First mood app that made me actually understand myself. The AI insights cut deep.', n: 'Patra S.', r: 'Grad student · Bangkok' },
        { q: 'Use it every morning, under 30 seconds. Year-in-pixels showed me exactly which deadlines wreck me.', n: 'Daniel C.', r: 'Product Designer · Bangkok' },
        { q: 'Started seeing my own patterns — which days I work well, when I need to rest. I plan my week around it now.', n: 'Prinya M.', r: 'Freelancer · Chiang Rai' },
        { q: 'Love that there are no ads and no streak shame. I use it when I want to.', n: 'Mint K.', r: 'Writer · Chiang Mai' },
      ],
    },
    pricing: {
      eyebrow: 'PRICING',
      title: 'Start free. Upgrade when ready.',
      sub: 'No fake trial — Free is forever. Pro unlocks unlimited AI.',
      free: {
        name: 'Free', price: '฿0', per: 'forever',
        feats: [
          'Unlimited entries + quick icons + journal',
          'Voice input (TH + EN)',
          'Mood calendar + timeline + stats',
          'AI text analysis · 5/day',
          'Weekly insights (preview)',
          'Achievements + 12 badges',
        ],
        cta: 'Get started',
      },
      pro: {
        name: 'Pro', price: '฿99', per: '/mo or ฿949/yr',
        badge: 'Popular',
        feats: [
          'Everything in Free',
          'Unlimited AI text analysis',
          'AI Vision for photos',
          'Full weekly insights + share',
          'Calendar AI patterns + Ask AI',
          'Custom moods + Pro icon packs',
          'Custom avatar + bio',
          'Yearly stats + full activity impact',
        ],
        cta: 'Upgrade to Pro',
      },
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Frequently asked',
      items: [
        { q: 'How secure is my data?', a: 'Stored on Cloudflare D1 + R2 with TLS in transit; image URLs are signed and expire in 1 hour. We never sell or share your data.' },
        { q: 'Do you train AI on my entries?', a: 'No. DailyMood calls AI statelessly — your entries are never stored externally or used to train any model.' },
        { q: 'Does it work on mobile?', a: 'Yes — DailyMood is a web app that works on every browser size. Open instantly without installing; you can also Add to Home Screen for an app-like feel.' },
        { q: 'How is it different from other mood trackers?', a: 'DailyMood is designed for under 10 seconds a day but produces deeper insights with AI — auto summaries, calendar pattern detection, Ask AI in natural language, and photo analysis.' },
        { q: 'Can I cancel Pro any time?', a: 'Yes — cancel from your Subscription page any time. You keep Pro features until the period ends.' },
        { q: 'Which languages are supported?', a: 'Thai and English for both UI and AI summaries. Switch in settings any time.' },
      ],
    },
    cta: { title: 'Ready to know yourself better?', sub: '10 seconds a day. Start now — no credit card.', btn: 'Get DailyMood free' },
    footer: {
      tag: 'Track how you feel. Discover yourself.',
      product: 'Product', company: 'Company', legal: 'Legal',
      links: {
        product: [['Features', '#features'], ['AI', '#ai'], ['Pricing', '#pricing'], ['What\'s new', '#']],
        company: [['About', '#'], ['Blog', '#'], ['Contact', 'mailto:hello@dailymood.me']],
        legal: [['Privacy', '#'], ['Terms', '#'], ['Cookies', '#']],
      },
      copy: '© 2026 DailyMood · Made in Bangkok with ☕ + 🌿',
    },
  },
};

const LangCtx = React.createContext({ lang: 'th', setLang: () => {} });

function LangProvider({ children }) {
  const [lang, setLang] = React.useState(() => {
    try { return localStorage.getItem('dm-lang') || 'th'; } catch { return 'th'; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('dm-lang', lang); } catch {}
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: COPY[lang] }}>{children}</LangCtx.Provider>;
}
function useLang() { return React.useContext(LangCtx); }
function T({ children }) {
  // Apply .thai class automatically when lang is th
  const { lang } = useLang();
  return <span className={lang === 'th' ? 'thai' : ''}>{children}</span>;
}

window.COPY = COPY;
window.LangCtx = LangCtx;
window.LangProvider = LangProvider;
window.useLang = useLang;
window.T = T;

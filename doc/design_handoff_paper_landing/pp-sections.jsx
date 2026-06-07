// ============================================================
// DailyMood Paper Desk — sections (window-exported)
// Reads window.DM_DIR ('desk' | 'pop' | 'scrapbook') for theming
// ============================================================
const { MOODS, MoodFace, Logo, LogoLockup, Paperclip, Sticker, Folder, Check, FeatIcon, Arrow,
        AppDashboard, NLPDemo, VisionDemo, InsightsDemo, yearCell } = window;

const DIR = () => (window.DM_DIR || 'desk');

/* small helper: section heading on a folder tab */
function TabHead({ tab, tabClass, title, sub, center, dark, maxW=720 }) {
  return (
    <div style={{ maxWidth:maxW, margin: center?'0 auto 52px':'0 0 52px', textAlign: center?'center':'left' }}>
      <span className="eyebrow" style={ dark?{background:'#fff',color:'var(--ink)'}:undefined }>{tab}</span>
      <h2 className="display" style={{ fontSize:'clamp(32px,4.6vw,56px)', margin:'18px 0 0', color: dark?'#fff':'var(--ink)' }}>{title}</h2>
      {sub && <p style={{ fontSize:18, color: dark?'rgba(255,255,255,.75)':'var(--ink-2)', margin:'16px auto 0', maxWidth: center?620:560 }}>{sub}</p>}
    </div>
  );
}

/* =================== NAV =================== */
function Nav() {
  const { t, lang, setLang } = useLang();
  const [sc,setSc]=React.useState(false);
  React.useEffect(()=>{ const on=()=>setSc(window.scrollY>10); window.addEventListener('scroll',on); on(); return ()=>window.removeEventListener('scroll',on); },[]);
  return (
    <nav style={{ position:'sticky', top:0, zIndex:50, transition:'all .25s',
      background: sc?'rgba(247,240,228,.88)':'transparent', backdropFilter: sc?'saturate(160%) blur(12px)':'none',
      borderBottom: sc?'1px solid var(--line)':'1px solid transparent' }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:74 }}>
        <a href="#top" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', color:'var(--ink)' }}>
          <LogoLockup h={30}/>
        </a>
        <div className="nav-links" style={{ display:'flex', alignItems:'center', gap:28 }}>
          {[['features','#features'],['ai','#ai'],['pricing','#pricing'],['faq','#faq']].map(([k,h])=>(
            <a key={k} href={h} className="navlink"><T>{t.nav[k]}</T></a>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={()=>setLang(lang==='th'?'en':'th')} style={{ padding:'7px 12px', borderRadius:100, border:'2px solid var(--ink)', background:'transparent', fontFamily:'var(--font)', fontWeight:800, fontSize:13, cursor:'pointer', color:'var(--ink)' }}>
            <span style={{ opacity:lang==='th'?1:.4 }}>TH</span><span style={{ opacity:.3 }}> / </span><span style={{ opacity:lang==='en'?1:.4 }}>EN</span>
          </button>
          <a href="#cta" className="btn btn-ink" style={{ height:44, fontSize:14, padding:'0 18px', borderRadius:12 }}><T>{t.nav.cta}</T></a>
        </div>
      </div>
    </nav>
  );
}

/* =================== HERO =================== */
function Hero() {
  const { t, lang } = useLang();
  const dir = DIR();
  const pop = dir==='pop', scrap = dir==='scrapbook';
  const markClass = scrap ? 'mark lav' : 'mark';
  const deco = scrap ? 'tape' : 'clip';

  return (
    <section id="top" style={{ position:'relative', overflow:'hidden',
      paddingTop: 44, paddingBottom: 96,
      background: pop ? 'linear-gradient(180deg,var(--peach) 0%, var(--peach) 62%, var(--desk) 62%)' : 'transparent' }}>
      <div className="container hero-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1.04fr', gap:60, alignItems:'center' }}>
        <div>
          <span className="eyebrow" style={ pop?{background:'#fff',color:'var(--ink)'}:undefined }>{lang==='th'?'✦ ไดอารีอารมณ์ ด้วย AI':'✦ AI-powered mood journal'}</span>
          <h1 className="display" style={{ fontSize:'clamp(40px,6.4vw,82px)', margin:'22px 0 22px', color: pop?'#fff':'var(--ink)' }}>
            <T>{t.hero.h1a}</T><br/>
            <T>{t.hero.h1b}</T>{' '}
            <span className={markClass}><span style={{ position:'relative', color:'var(--ink)' }}><T>{t.hero.h1c}</T></span></span>
          </h1>
          <p style={{ fontSize:19, color: pop?'rgba(255,255,255,.92)':'var(--ink-2)', maxWidth:520, marginBottom:26, fontWeight:500 }}><T>{t.hero.sub}</T></p>

          {/* focal 14-day trial */}
          <a href="#pricing" className={`${lang==='th'?'thai ':''}trial-focal`}>
            <span className="trial-badge">14</span>
            <span className="trial-txt">
              <b>{lang==='th'?'ทดลอง Pro ฟรี 14 วัน':'Try Pro free for 14 days'}</b>
              <small>{lang==='th'?'ไม่ต้องใส่บัตร · ยกเลิกได้ทุกเมื่อ':'No card required · cancel anytime'}</small>
            </span>
            <span className="trial-arrow"><Arrow s={18}/></span>
          </a>

          {/* primary CTA */}
          <div style={{ display:'flex', gap:14, marginTop:18, flexWrap:'wrap', alignItems:'center' }}>
            <a href="#cta" className="btn btn-peach" style={{ height:56, fontSize:17 }}><T>{t.hero.ctaMain}</T> <Arrow/></a>
            <span className={lang==='th'?'thai':''} style={{ fontSize:13, fontWeight:700, color: pop?'#fff':'var(--ink-3)' }}><T>{t.hero.ctaSub}</T></span>
          </div>

          <div style={{ display:'flex', gap:18, marginTop:22, flexWrap:'wrap' }}>
            {[t.hero.trust1,t.hero.trust2,t.hero.trust3].map((tx,i)=>(
              <span key={i} style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, fontWeight:700, color: pop?'#fff':'var(--ink-2)' }}><Check/><T>{tx}</T></span>
            ))}
          </div>
        </div>

        {/* mockup folder */}
        <div style={{ position:'relative' }}>
          <Sticker face="great" color="#fff" size={56} className={pop?'bouncy':'floaty'} style={{ bottom:50, right:-22, '--r':'10deg', animationDelay:'.4s', zIndex:9 }}/>
          <div className="chip floaty" style={{ position:'absolute', top:140, left:-30, zIndex:9, '--r':'-8deg', transform:'rotate(-8deg)', animationDelay:'.9s' }}>✨ Streak +7</div>

          <Folder
            tab={<span style={{ display:'inline-flex', alignItems:'center', gap:8 }}><span style={{ width:10, height:10, borderRadius:50, background:'#fff' }}/>{lang==='th'?'วันนี้':'Today'}</span>}
            tabClass={pop?'ink':''}
            clip={deco==='clip'} tape={deco==='tape'} tapeClass="lav"
            sheetClass="" style={{ transform: scrap?'rotate(-1deg)':'rotate(1.4deg)' }}
            bodyStyle={{ overflow:'hidden', borderRadius:'4px 18px 18px 18px', boxShadow:'var(--shadow-lg)' }}>
            <AppDashboard/>
          </Folder>
        </div>
      </div>
    </section>
  );
}

/* =================== BY THE NUMBERS (stacked sheets) =================== */
function ByNumbers() {
  const { lang } = useLang();
  const items = lang==='th' ? [
    { n:'7', l:'อารมณ์เริ่มต้น', s:'+ custom moods สำหรับ Pro', c:'var(--peach)', f:'great' },
    { n:'≤10', l:'วินาทีต่อการบันทึก', s:'แตะ พิมพ์ พูด หรือถ่าย', c:'var(--mint)', f:'okay' },
    { n:'365', l:'วันใน year-in-pixels', s:'เห็นทั้งปีในจอเดียว', c:'var(--lavender)', f:'calm' },
    { n:'2', l:'ภาษา ไทย + อังกฤษ', s:'ทั้ง UI และ AI สรุป', c:'var(--yellow)', f:'good' },
  ] : [
    { n:'7', l:'starter moods', s:'+ custom moods on Pro', c:'var(--peach)', f:'great' },
    { n:'≤10', l:'seconds per entry', s:'tap, type, talk, or shoot', c:'var(--mint)', f:'okay' },
    { n:'365', l:'days in year-in-pixels', s:'your whole year on one screen', c:'var(--lavender)', f:'calm' },
    { n:'2', l:'languages · TH + EN', s:'both UI and AI summaries', c:'var(--yellow)', f:'good' },
  ];
  return (
    <section style={{ padding:'60px 0 30px', position:'relative' }}>
      <div className="container">
        <div className="grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
          {items.map((it,i)=>(
            <div key={i} className="stacked" style={{ transform:`rotate(${(i%2?1:-1)*1.3}deg)` }}>
              <div className="sheet" style={{ padding:'24px 22px', borderRadius:14, background:'#fff' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span className="display" style={{ fontSize:48, color:it.c, lineHeight:1 }}>{it.n}</span>
                  <Sticker face={it.f} color={it.c} size={40} style={{ position:'relative', top:0, transform:'rotate(-6deg)' }}/>
                </div>
                <div className={lang==='th'?'thai':''} style={{ marginTop:12 }}>
                  <div style={{ fontWeight:800, fontSize:16 }}>{it.l}</div>
                  <div style={{ fontSize:13, color:'var(--ink-3)', marginTop:3 }}>{it.s}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =================== AI SHOWCASE (dark plum folder) =================== */
function AIShowcase() {
  const { t, lang } = useLang();
  return (
    <section id="ai" className="section">
      <div className="container">
        <Folder
          tab={<T>{t.ai.eyebrow}</T>} tabClass="peach"
          sheetClass="plum"
          bodyStyle={{ padding:'56px 48px', borderRadius:'4px 26px 26px 26px', overflow:'hidden' }}>
          {/* paperclip in metal on dark */}
          <Paperclip color="#6b6275" style={{ top:-16, right:40, left:'auto', transform:'rotate(8deg)' }}/>
          <div style={{ maxWidth:720, marginBottom:44 }}>
            <h2 className="display" style={{ color:'#fff', fontSize:'clamp(32px,4.4vw,54px)', margin:0 }}>
              <T>{t.ai.h2a}</T>{' '}
              <span style={{ background:'linear-gradient(135deg,#FCA45B,#A673F1)', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent', fontStyle:'italic' }}><T>{t.ai.h2b}</T></span>{' '}
              <T>{t.ai.h2c}</T>
            </h2>
            <p style={{ fontSize:18, color:'rgba(255,255,255,.72)', maxWidth:580, marginTop:16 }}><T>{t.ai.sub}</T></p>
          </div>
          <div className="grid-3" style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr', gap:16 }}>
            <AICard f={t.ai.f1}><NLPDemo/></AICard>
            <AICard f={t.ai.f2}><VisionDemo/></AICard>
            <AICard f={t.ai.f3}><InsightsDemo/></AICard>
          </div>
        </Folder>
      </div>
    </section>
  );
}
function AICard({ f, children }) {
  return (
    <div style={{ background:'#fff', borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:16, color:'var(--ink)' }}>
      <span style={{ alignSelf:'flex-start', fontSize:11, fontWeight:800, letterSpacing:'.08em', color:'#C8742E', textTransform:'uppercase', padding:'5px 10px', borderRadius:100, background:'rgba(252,164,91,.15)' }}>{f.tag}</span>
      <div style={{ flex:1 }}>{children}</div>
      <div>
        <h3 style={{ fontSize:20, fontWeight:800, margin:0, lineHeight:1.2 }}><T>{f.title}</T></h3>
        <p style={{ fontSize:14, color:'var(--ink-2)', margin:'8px 0 0', lineHeight:1.5 }}><T>{f.desc}</T></p>
      </div>
    </div>
  );
}

/* =================== A DAY WITH DAILYMOOD (timeline) =================== */
function DayTimeline() {
  const { lang } = useLang();
  const rows = lang==='th' ? [
    { time:'08:00', t:'แตะอารมณ์เช้านี้', d:'เปิดแอป เลือก 1 ใน 7 อารมณ์ — เสร็จใน 10 วินาที', c:'var(--peach)', f:'great', hi:true },
    { time:'12:30', t:'พิมพ์ หรือพูดโน้ตสั้น ๆ', d:'AI ดึงอารมณ์ แท็ก และสรุปประโยคให้ — ปรับ/ยืนยันก่อนบันทึก', c:'var(--purple)', f:'okay' },
    { time:'15:00', t:'ถ่ายรูปช่วงเวลานั้น', d:'อัปโหลดรูป AI อ่านบริบทและแนะนำแท็กที่เกี่ยว (Pro)', c:'var(--mint)', f:'calm' },
    { time:'21:00', t:'ดูปฏิทิน year-in-pixels', d:'เห็นจังหวะของวัน สัปดาห์ และทั้งปีในจอเดียว', c:'var(--lavender)', f:'good' },
    { time:'สิ้นสัปดาห์', t:'อ่าน AI Insights', d:'สรุป + แพทเทิร์น + คำแนะนำเฉพาะคุณ พร้อม sparkline', c:'var(--yellow)', f:'great' },
  ] : [
    { time:'08:00', t:'Tap this morning\u2019s mood', d:'Open the app, pick 1 of 7 moods — done in 10 seconds.', c:'var(--peach)', f:'great', hi:true },
    { time:'12:30', t:'Type or speak a quick note', d:'AI extracts mood, tags, and a one-line summary — confirm before saving.', c:'var(--purple)', f:'okay' },
    { time:'15:00', t:'Snap the moment', d:'Upload a photo; AI reads context and suggests tags (Pro).', c:'var(--mint)', f:'calm' },
    { time:'21:00', t:'Check year-in-pixels', d:'See your day, week, and whole year on one screen.', c:'var(--lavender)', f:'good' },
    { time:'End of week', t:'Read your AI Insights', d:'Summary + patterns + one tailored suggestion, with a sparkline.', c:'var(--yellow)', f:'great' },
  ];
  const dir = DIR();
  return (
    <section className="section" style={{ background:'var(--desk-2)' }}>
      <div className="container">
        <TabHead tab={lang==='th'?'หนึ่งวันกับ DailyMood':'A day with DailyMood'} center
          title={lang==='th'?'ใช้แค่วันละไม่กี่วินาที':'Just a few seconds a day'}
          sub={lang==='th'?'จดอารมณ์ตามจังหวะชีวิต แล้วให้ AI ต่อภาพให้เห็นทั้งสัปดาห์':'Log to the rhythm of your day — AI connects the dots across your week.'}/>
        <div style={{ position:'relative', maxWidth:760, margin:'0 auto' }}>
          {/* vertical line */}
          <div style={{ position:'absolute', left:90, top:14, bottom:14, width:3, background:'repeating-linear-gradient(var(--ink) 0 7px, transparent 7px 14px)', opacity:.25 }} className="hide-sm"/>
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {rows.map((r,i)=>(
              <div key={i} style={{ display:'grid', gridTemplateColumns:'76px 28px 1fr', alignItems:'center', gap:14 }}>
                <div className={lang==='th'?'thai':''} style={{ textAlign:'right', fontWeight:800, fontSize:14, color:'var(--ink-2)' }}>{r.time}</div>
                <div style={{ display:'grid', placeItems:'center', position:'relative', zIndex:1 }}>
                  <span style={{ width:18, height:18, borderRadius:50, background:r.c, border:'3px solid var(--desk-2)', boxShadow:'0 0 0 2px '+r.c }}/>
                </div>
                <Folder tab={null} sheetClass="" style={{ transform:`rotate(${(i%2?-.5:.5)}deg)` }}
                  bodyStyle={{ background: r.hi?(dir==='pop'?'var(--ink)':r.c):'#fff', color: r.hi?((dir==='pop'||r.c==='var(--peach)'||r.c==='var(--purple)')?'#fff':'var(--ink)'):'var(--ink)', borderRadius:14, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, boxShadow:'var(--shadow-sm)' }}>
                  <Sticker face={r.f} color={r.hi?'#fff':r.c} size={42} style={{ position:'relative', top:0, transform:'rotate(-6deg)', flexShrink:0 }}/>
                  <div className={lang==='th'?'thai':''}>
                    <div style={{ fontWeight:800, fontSize:17 }}>{r.t}</div>
                    <div style={{ fontSize:14, opacity:.8, marginTop:3, lineHeight:1.45 }}>{r.d}</div>
                  </div>
                </Folder>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =================== YEAR IN PIXELS =================== */
function YearInPixels() {
  const { t, lang } = useLang();
  const months = lang==='th'
    ? ['ม.ค','ก.พ','มี.ค','เม.ย','พ.ค','มิ.ย','ก.ค','ส.ค','ก.ย','ต.ค','พ.ย','ธ.ค']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <section className="section">
      <div className="container grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:56, alignItems:'center' }}>
        <div>
          <span className="eyebrow"><T>{t.year.eyebrow}</T></span>
          <h2 className="display" style={{ fontSize:'clamp(30px,4vw,52px)', margin:'18px 0 16px' }}><T>{t.year.title}</T></h2>
          <p style={{ fontSize:18, color:'var(--ink-2)', maxWidth:440 }}><T>{t.year.sub}</T></p>
          <div style={{ display:'flex', gap:14, marginTop:26, flexWrap:'wrap' }}>
            {MOODS.slice(0,6).map(m=>(
              <div key={m.id} style={{ display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ width:14, height:14, borderRadius:4, background:m.color }}/>
                <span className={lang==='th'?'thai':''} style={{ fontSize:13, fontWeight:700, color:'var(--ink-2)' }}>{lang==='th'?m.label:m.en}</span>
              </div>
            ))}
          </div>
        </div>
        <Folder tab="2026" tabClass="ink" clip
          bodyStyle={{ padding:30, borderRadius:'4px 22px 22px 22px' }} style={{ transform:'rotate(-.6deg)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <span style={{ fontSize:13, fontWeight:800, color:'var(--ink-3)' }}>{lang==='th'?'ปฏิทินอารมณ์':'Mood calendar'}</span>
            <span className={lang==='th'?'thai':''} style={{ fontSize:12, color:'var(--ink-3)', fontWeight:700 }}>{lang==='th'?'298 วันที่บันทึก':'298 days logged'}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:7 }}>
            {months.map((m,mi)=>(
              <React.Fragment key={mi}>
                <div className={lang==='th'?'thai':''} style={{ fontSize:11, fontWeight:800, color:'var(--ink-3)', alignSelf:'center', textAlign:'right', paddingRight:4 }}>{m}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(31,1fr)', gap:3 }}>
                  {Array.from({length:31}).map((_,di)=>{ const cc=yearCell(mi,di); return <div key={di} style={{ aspectRatio:'1', borderRadius:3, background:cc||'#EFE7D8' }}/>; })}
                </div>
              </React.Fragment>
            ))}
          </div>
        </Folder>
      </div>
    </section>
  );
}

/* =================== FEATURES GRID =================== */
function FeaturesGrid() {
  const { t } = useLang();
  const cmap = {
    peach:{ bg:'rgba(252,164,91,.15)', s:'#C8742E' }, purple:{ bg:'rgba(166,115,241,.15)', s:'var(--purple)' },
    mint:{ bg:'rgba(133,236,203,.22)', s:'#2E9C76' }, yellow:{ bg:'rgba(253,203,86,.22)', s:'#C79412' },
    lav:{ bg:'rgba(212,190,228,.35)', s:'var(--purple)' }, blue:{ bg:'rgba(154,205,226,.32)', s:'#4E8DA8' },
  };
  return (
    <section id="features" className="section" style={{ background:'var(--desk-2)' }}>
      <div className="container">
        <TabHead tab={<T>{t.features.eyebrow}</T>} title={<T>{t.features.title}</T>} maxW={760}/>
        <div className="grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
          {t.features.list.map((f,i)=>(
            <div key={i} style={{ background:'#fff', borderRadius:16, padding:24, display:'flex', flexDirection:'column', gap:14, boxShadow:'var(--shadow-sm)', transform:`rotate(${(i%3-1)*.5}deg)` }}>
              <div style={{ width:50, height:50, borderRadius:14, background:cmap[f.c].bg, color:cmap[f.c].s, display:'grid', placeItems:'center' }}>
                <FeatIcon i={i} stroke={cmap[f.c].s}/>
              </div>
              <div>
                <h3 style={{ fontSize:19, fontWeight:800, margin:'0 0 7px' }}><T>{f.t}</T></h3>
                <p style={{ color:'var(--ink-2)', fontSize:15, margin:0, lineHeight:1.5 }}><T>{f.d}</T></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =================== ARTICLES =================== */
function Articles() {
  const { t, lang } = useLang();
  return (
    <section id="articles" className="section">
      <div className="container">
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24, flexWrap:'wrap', marginBottom:44 }}>
          <div style={{ maxWidth:560 }}>
            <span className="eyebrow"><T>{t.articles.eyebrow}</T></span>
            <h2 className="display" style={{ fontSize:'clamp(28px,3.6vw,44px)', margin:'18px 0 10px' }}><T>{t.articles.title}</T></h2>
            <p style={{ fontSize:17, color:'var(--ink-2)', margin:0 }}><T>{t.articles.sub}</T></p>
          </div>
          <a href="#articles" className="btn btn-ghost hide-sm" style={{ height:48 }}><T>{t.articles.seeAll}</T> <Arrow/></a>
        </div>
        <div className="grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:22 }}>
          {t.articles.items.map((a,i)=>(<ArticleCard key={i} a={a} i={i}/>))}
        </div>
      </div>
    </section>
  );
}
function ArticleCard({ a, i }) {
  const { lang } = useLang();
  const [h,setH]=React.useState(false);
  const tape=['','mint','lav'][i%3];
  return (
    <a href="#articles" onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex', flexDirection:'column', background:'#fff', borderRadius:'4px 16px 16px 16px', overflow:'hidden', textDecoration:'none', color:'var(--ink)', position:'relative',
        boxShadow: h?'var(--shadow-lg)':'var(--shadow-sm)', transform: h?'translateY(-4px) rotate(0deg)':`rotate(${(i%2?.6:-.6)}deg)`, transition:'transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .25s' }}>
      <span className={`washi ${tape}`} style={{ zIndex:6 }}/>
      <div style={{ aspectRatio:'16/10', background:a.grad, position:'relative' }}>
        <div style={{ position:'absolute', inset:0, opacity:.22, backgroundImage:'repeating-linear-gradient(45deg,rgba(255,255,255,.2) 0 8px,transparent 8px 18px)' }}/>
        <span className="chip" style={{ position:'absolute', top:16, left:14, fontSize:11, letterSpacing:'.05em', textTransform:'uppercase' }}>{a.tag}</span>
      </div>
      <div style={{ padding:'22px 20px', display:'flex', flexDirection:'column', gap:11, flex:1 }}>
        <div className={lang==='th'?'thai':''} style={{ display:'flex', alignItems:'center', gap:9, fontSize:12, color:'var(--ink-3)', fontWeight:700 }}>
          <span>{a.date}</span><span style={{ width:3, height:3, borderRadius:50, background:'var(--ink-3)' }}/><span>{a.read}</span>
        </div>
        <h3 className={lang==='th'?'thai':''} style={{ fontFamily:'var(--font)', fontSize:20, fontWeight:800, margin:0, lineHeight:1.25 }}>{a.title}</h3>
        <p className={lang==='th'?'thai':''} style={{ margin:0, color:'var(--ink-2)', fontSize:14, lineHeight:1.5, flex:1 }}>{a.excerpt}</p>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:14, fontWeight:800, color:'#C8742E', marginTop:2 }}>
          {lang==='th'?'อ่านบทความ':'Read article'} <Arrow s={14}/>
        </span>
      </div>
    </a>
  );
}

/* =================== TESTIMONIALS =================== */
function Testimonials() {
  const { t, lang } = useLang();
  const cols=['var(--peach)','var(--purple)','var(--mint)','var(--yellow)'];
  return (
    <section className="section" style={{ background:'var(--desk-2)' }}>
      <div className="container">
        <TabHead tab={<T>{t.testimonials.eyebrow}</T>} title={<T>{t.testimonials.title}</T>}/>
        <div className="grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }}>
          {t.testimonials.items.map((it,i)=>(
            <figure key={i} className="stacked" style={{ margin:0, transform:`translateY(${i%2?22:0}px) rotate(${(i%2?1:-1)*1}deg)` }}>
              <div className="sheet" style={{ background:'#fff', borderRadius:14, padding:'34px 22px 22px', position:'relative' }}>
                <Paperclip color="var(--clip)" style={{ left:'auto', right:22, top:-15, transform:`rotate(${i%2?6:-6}deg)` }}/>
                <blockquote className={lang==='th'?'thai':''} style={{ margin:0, fontSize:15, lineHeight:1.55, color:'var(--ink)', fontWeight:600 }}>"{it.q}"</blockquote>
                <figcaption style={{ display:'flex', alignItems:'center', gap:11, paddingTop:16, marginTop:16, borderTop:'1px solid var(--line)' }}>
                  <div style={{ width:40, height:40, borderRadius:50, background:`linear-gradient(135deg,${cols[i]},var(--lavender))`, display:'grid', placeItems:'center', color:'#fff', fontWeight:800, fontSize:15 }}>{it.n.charAt(0)}</div>
                  <div className={lang==='th'?'thai':''}>
                    <div style={{ fontWeight:800, fontSize:13 }}>{it.n}</div>
                    <div style={{ fontSize:11, color:'var(--ink-3)' }}>{it.r}</div>
                  </div>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =================== PRICING =================== */
function Pricing() {
  const { t, lang } = useLang();
  return (
    <section id="pricing" className="section">
      <div className="container">
        <TabHead tab={<T>{t.pricing.eyebrow}</T>} center title={<T>{t.pricing.title}</T>} sub={<T>{t.pricing.sub}</T>}/>
        <div className="grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:22, maxWidth:900, margin:'0 auto' }}>
          {/* Free */}
          <Folder tab={<T>{t.pricing.free.name}</T>} tabClass="mint" style={{ transform:'rotate(-.8deg)' }}
            bodyStyle={{ padding:34, borderRadius:'4px 20px 20px 20px', display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <span className="display" style={{ fontSize:54 }}>{t.pricing.free.price}</span>
              <span className={lang==='th'?'thai':''} style={{ color:'var(--ink-3)', fontSize:15, fontWeight:700 }}>{t.pricing.free.per}</span>
            </div>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:11, flex:1 }}>
              {t.pricing.free.feats.map((f,i)=>(<li key={i} className={lang==='th'?'thai':''} style={{ display:'flex', gap:10, fontSize:15, alignItems:'flex-start' }}><Check/><span>{f}</span></li>))}
            </ul>
            <a href="#cta" className="btn btn-ghost" style={{ width:'100%' }}><T>{t.pricing.free.cta}</T></a>
          </Folder>
          {/* Pro */}
          <Folder tab={<span style={{ display:'inline-flex', alignItems:'center', gap:7 }}><T>{t.pricing.pro.name}</T> <span style={{ fontSize:11, background:'var(--peach)', color:'#fff', padding:'2px 8px', borderRadius:100 }}><T>{t.pricing.pro.badge}</T></span></span>}
            tabClass="plum" style={{ transform:'rotate(.8deg)' }}
            bodyStyle={{ padding:34, borderRadius:'4px 20px 20px 20px', display:'flex', flexDirection:'column', gap:20, background:'linear-gradient(155deg,var(--plum-2),var(--plum))', color:'#fff' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <span className="display" style={{ fontSize:54, color:'#fff' }}>{t.pricing.pro.price}</span>
              <span className={lang==='th'?'thai':''} style={{ color:'rgba(255,255,255,.6)', fontSize:14, fontWeight:700 }}>{t.pricing.pro.per}</span>
            </div>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:11, flex:1 }}>
              {t.pricing.pro.feats.map((f,i)=>(<li key={i} className={lang==='th'?'thai':''} style={{ display:'flex', gap:10, fontSize:15, alignItems:'flex-start', color:'rgba(255,255,255,.92)' }}><Check c="var(--peach)"/><span>{f}</span></li>))}
            </ul>
            <a href="#cta" className="btn btn-peach" style={{ width:'100%' }}><T>{t.pricing.pro.cta}</T></a>
          </Folder>
        </div>
      </div>
    </section>
  );
}

/* =================== FAQ =================== */
function FAQ() {
  const { t } = useLang();
  const [open,setOpen]=React.useState(0);
  return (
    <section id="faq" className="section" style={{ background:'var(--desk-2)' }}>
      <div className="container grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:56, alignItems:'flex-start' }}>
        <div style={{ position:'sticky', top:100 }}>
          <span className="eyebrow"><T>{t.faq.eyebrow}</T></span>
          <h2 className="display" style={{ fontSize:'clamp(30px,4vw,48px)', marginTop:18 }}><T>{t.faq.title}</T></h2>
          <Sticker face="calm" color="var(--mint)" size={64} style={{ position:'relative', top:24, transform:'rotate(-8deg)' }}/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {t.faq.items.map((it,i)=>{
            const o=open===i;
            return (
              <div key={i} className="sheet" style={{ background:'#fff', borderRadius:14, boxShadow:'var(--shadow-sm)', overflow:'hidden' }}>
                <button onClick={()=>setOpen(o?-1:i)} style={{ width:'100%', padding:'20px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, background:'transparent', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'var(--font)', fontWeight:800, fontSize:17, color:'var(--ink)' }} className={useLang().lang==='th'?'thai':''}>
                  <span>{it.q}</span>
                  <span style={{ flexShrink:0, width:32, height:32, borderRadius:50, background:o?'var(--ink)':'transparent', color:o?'#fff':'var(--ink)', border:o?'none':'2px solid var(--line)', display:'grid', placeItems:'center', fontSize:20, transition:'all .2s' }}>{o?'–':'+'}</span>
                </button>
                <div style={{ maxHeight:o?320:0, overflow:'hidden', transition:'max-height .35s ease' }}>
                  <p className={useLang().lang==='th'?'thai':''} style={{ margin:0, padding:'0 22px 22px', fontSize:15, color:'var(--ink-2)', lineHeight:1.6 }}>{it.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =================== CTA BANNER =================== */
function CTABanner() {
  const { t, lang } = useLang();
  return (
    <section id="cta" className="section" style={{ paddingBottom:80 }}>
      <div className="container">
        <Folder tab={lang==='th'?'เริ่มเลย':'Start here'} tabClass="ink" style={{ transform:'rotate(-.4deg)' }}
          bodyStyle={{ borderRadius:'4px 26px 26px 26px', padding:'64px 40px', textAlign:'center', background:'linear-gradient(135deg,var(--peach) 0%,#F49EAB 48%,var(--purple) 100%)', color:'#fff', position:'relative', overflow:'hidden' }}>
          <Sticker face="great" color="#fff" size={58} className="floaty" style={{ top:28, left:'10%', '--r':'-12deg' }}/>
          <Sticker face="good" color="#fff" size={48} className="floaty" style={{ bottom:34, right:'12%', '--r':'10deg', animationDelay:'.6s' }}/>
          <Sticker face="calm" color="#fff" size={42} className="floaty" style={{ top:50, right:'18%', '--r':'6deg', animationDelay:'1s' }}/>
          <h2 className="display" style={{ fontSize:'clamp(32px,5vw,62px)', color:'#fff', maxWidth:740, margin:'0 auto 16px' }}><T>{t.cta.title}</T></h2>
          <p style={{ fontSize:19, color:'rgba(255,255,255,.92)', maxWidth:520, margin:'0 auto 30px', fontWeight:500 }}><T>{t.cta.sub}</T></p>
          <a href="#" className="btn btn-white" style={{ height:60, padding:'0 32px', fontSize:17 }}><T>{t.cta.btn}</T> <Arrow/></a>
        </Folder>
      </div>
    </section>
  );
}

/* =================== FOOTER =================== */
function Footer() {
  const { t, lang, setLang } = useLang();
  return (
    <footer style={{ background:'var(--plum)', color:'#fff', paddingTop:64, paddingBottom:30, position:'relative', zIndex:1 }}>
      <div className="container">
        <div className="grid-3" style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr', gap:40, marginBottom:48 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:14 }}><Logo size={36}/><span style={{ fontWeight:800, fontSize:22 }}>Dailymood</span></div>
            <p className={lang==='th'?'thai':''} style={{ color:'rgba(255,255,255,.6)', fontSize:15, maxWidth:300, margin:0 }}>{t.footer.tag}</p>
          </div>
          {[['product',t.footer.product],['legal',t.footer.legal]].map(([k,label])=>(
            <div key={k}>
              <div style={{ fontSize:13, fontWeight:800, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:16 }}><T>{label}</T></div>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:11 }}>
                {t.footer.links[k].map(([n,h],i)=>(<li key={i}><a href={h} className={lang==='th'?'thai':''} style={{ color:'rgba(255,255,255,.85)', textDecoration:'none', fontSize:15 }}>{n}</a></li>))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ paddingTop:26, borderTop:'1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div className={lang==='th'?'thai':''} style={{ color:'rgba(255,255,255,.5)', fontSize:13 }}>{t.footer.copy}</div>
          <button onClick={()=>setLang(lang==='th'?'en':'th')} style={{ padding:'7px 14px', borderRadius:100, border:'1px solid rgba(255,255,255,.18)', background:'transparent', color:'#fff', fontFamily:'var(--font)', fontWeight:800, fontSize:13, cursor:'pointer' }}>
            🌐 {lang==='th'?'ภาษาไทย':'English'} ↔
          </button>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, {
  Nav, Hero, ByNumbers, AIShowcase, DayTimeline, YearInPixels, FeaturesGrid,
  Articles, Testimonials, Pricing, FAQ, CTABanner, Footer,
});

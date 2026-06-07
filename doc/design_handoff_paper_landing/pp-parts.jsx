// ============================================================
// DailyMood Paper Desk — shared parts (window-exported)
// Primitives (clip/sticker/folder) + reused mockup, demos, icons
// ============================================================
const { useLang, T } = window;

const MOODS = [
  { id:'great', label:'ดีมาก', en:'Great', color:'var(--peach)',    face:'great' },
  { id:'good',  label:'ดี',    en:'Good',  color:'var(--yellow)',   face:'good'  },
  { id:'okay',  label:'เฉย ๆ', en:'Okay',  color:'var(--mint)',     face:'okay'  },
  { id:'meh',   label:'เหนื่อย',en:'Meh',   color:'var(--lavender)', face:'meh'   },
  { id:'bad',   label:'แย่',   en:'Bad',   color:'var(--blue)',     face:'bad'   },
  { id:'awful', label:'แย่มาก', en:'Awful', color:'var(--purple)',   face:'awful' },
  { id:'calm',  label:'สงบ',   en:'Calm',  color:'#B9D6F2',         face:'calm'  },
];

function MoodFace({ face, size=48, bg }) {
  const w = size;
  const eye = (cx,cy)=> <circle cx={cx} cy={cy} r={size*0.06} fill="#1A1320" />;
  let mouth;
  if (face==='great') mouth=<path d={`M ${w*0.32} ${w*0.62} Q ${w*0.5} ${w*0.82} ${w*0.68} ${w*0.62}`} stroke="#1A1320" strokeWidth={size*0.05} fill="none" strokeLinecap="round"/>;
  else if (face==='good') mouth=<path d={`M ${w*0.34} ${w*0.62} Q ${w*0.5} ${w*0.74} ${w*0.66} ${w*0.62}`} stroke="#1A1320" strokeWidth={size*0.05} fill="none" strokeLinecap="round"/>;
  else if (face==='okay') mouth=<line x1={w*0.36} y1={w*0.66} x2={w*0.64} y2={w*0.66} stroke="#1A1320" strokeWidth={size*0.05} strokeLinecap="round"/>;
  else if (face==='meh') mouth=<path d={`M ${w*0.34} ${w*0.68} Q ${w*0.5} ${w*0.62} ${w*0.66} ${w*0.68}`} stroke="#1A1320" strokeWidth={size*0.05} fill="none" strokeLinecap="round"/>;
  else if (face==='bad') mouth=<path d={`M ${w*0.34} ${w*0.72} Q ${w*0.5} ${w*0.58} ${w*0.66} ${w*0.72}`} stroke="#1A1320" strokeWidth={size*0.05} fill="none" strokeLinecap="round"/>;
  else if (face==='awful') mouth=<path d={`M ${w*0.32} ${w*0.74} Q ${w*0.5} ${w*0.54} ${w*0.68} ${w*0.74}`} stroke="#1A1320" strokeWidth={size*0.05} fill="none" strokeLinecap="round"/>;
  else mouth=<circle cx={w*0.5} cy={w*0.66} r={size*0.05} fill="#1A1320"/>;
  return (
    <svg width={w} height={w} viewBox={`0 0 ${w} ${w}`} style={{display:'block'}}>
      <circle cx={w*0.5} cy={w*0.5} r={w*0.48} fill={bg||'#fff'}/>
      {eye(w*0.36,w*0.42)}{eye(w*0.64,w*0.42)}{mouth}
    </svg>
  );
}

function Logo({ size=32 }) {
  return <img src="dailymood-mark.png" alt="DailyMood" height={size} width={Math.round(size*0.903)} style={{ display:'block' }}/>;
}
function LogoLockup({ h=30 }) {
  return <img src="dailymood-logo.png" alt="DailyMood" height={h} width={Math.round(h*3.112)} style={{ display:'block' }}/>;
}

/* paperclip svg */
function Paperclip({ w=34, color='var(--clip)', className='clip', style }) {
  return (
    <svg className={className} style={style} width={w} height={w*1.9} viewBox="0 0 34 64" fill="none">
      <path d="M24 14v30a8 8 0 0 1-16 0V12a5 5 0 0 1 10 0v30a2.4 2.4 0 0 1-4.8 0V16"
        stroke={color} strokeWidth="3.4" strokeLinecap="round"/>
    </svg>
  );
}

/* sticker = mood face peel */
function Sticker({ face, color, size=58, style, className='' }) {
  return (
    <div className={`sticker ${className}`} style={{ width:size, height:size, background:color||'#fff', ...style }}>
      <MoodFace face={face} size={size*0.78} bg="transparent"/>
    </div>
  );
}

/* folder = tab + sheet */
function Folder({ tab, tabClass='', children, sheetClass='', clip, tape, tapeClass='', style, bodyStyle }) {
  return (
    <div className="folder" style={style}>
      {tab && <div className={`tab ${tabClass}`}>{tab}</div>}
      <div className={`sheet ${sheetClass}`} style={{ position:'relative', ...bodyStyle }}>
        {clip && <Paperclip/>}
        {tape && <span className={`washi ${tapeClass}`}/>}
        {children}
      </div>
    </div>
  );
}

function Check({ c='var(--mint)' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" style={{flexShrink:0}}>
      <circle cx="8" cy="8" r="8" fill={c}/>
      <path d="M 4.5 8.5 L 7 11 L 11.5 5.5" stroke="#1A1320" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ---- feature icons (reused) ---- */
function FeatIcon({ i, stroke }) {
  const s=stroke, sw=1.9;
  const c={ stroke:s, strokeWidth:sw, fill:'none', strokeLinecap:'round', strokeLinejoin:'round' };
  return (
    <svg width="28" height="28" viewBox="0 0 26 26">
      {i===0 && <><circle cx="13" cy="13" r="8" {...c}/><circle cx="10" cy="11" r=".9" fill={s}/><circle cx="16" cy="11" r=".9" fill={s}/><path d="M 9 15 Q 13 18 17 15" {...c}/></>}
      {i===1 && <><rect x="11" y="3" width="4" height="11" rx="2" {...c}/><path d="M 7 11 V 12 A 6 6 0 0 0 19 12 V 11" {...c}/><line x1="13" y1="18" x2="13" y2="22" {...c}/><line x1="10" y1="22" x2="16" y2="22" {...c}/></>}
      {i===2 && <><rect x="5" y="6" width="16" height="15" rx="2.5" {...c}/><line x1="5" y1="11" x2="21" y2="11" {...c}/><line x1="9" y1="4" x2="9" y2="8" {...c}/><line x1="17" y1="4" x2="17" y2="8" {...c}/><circle cx="13" cy="16" r="1.7" fill={s}/></>}
      {i===3 && <><rect x="3" y="6" width="14" height="13" rx="2" {...c}/><line x1="3" y1="10" x2="17" y2="10" {...c}/><line x1="7" y1="4" x2="7" y2="7" {...c}/><line x1="13" y1="4" x2="13" y2="7" {...c}/><path d="M 19 13 L 20 16 L 23 17 L 20 18 L 19 21 L 18 18 L 15 17 L 18 16 Z" fill={s} stroke="none"/></>}
      {i===4 && <><path d="M 4 7 H 19 V 17 L 15 17 L 12 20 L 9 17 H 4 Z" {...c}/><path d="M 11.5 12 L 12 13 L 13 13.5 L 12 14 L 11.5 15 L 11 14 L 10 13.5 L 11 13 Z" fill={s} stroke="none"/><path d="M 15 9 L 15.3 10 L 16 10.3 L 15.3 10.6 L 15 11.5 L 14.7 10.6 L 14 10.3 L 14.7 10 Z" fill={s} stroke="none"/></>}
      {i===5 && <><polyline points="3,19 8,14 12,16 17,9" {...c}/><circle cx="3" cy="19" r="1.5" fill={s}/><circle cx="8" cy="14" r="1.5" fill={s}/><circle cx="12" cy="16" r="1.5" fill={s}/><circle cx="17" cy="9" r="1.5" fill={s}/><path d="M 21 5 L 21.6 6.6 L 23 7.2 L 21.6 7.8 L 21 9.4 L 20.4 7.8 L 19 7.2 L 20.4 6.6 Z" fill={s} stroke="none"/></>}
      {i===6 && <><rect x="4" y="14" width="3.5" height="8" rx="1" {...c}/><rect x="10" y="9" width="3.5" height="13" rx="1" {...c}/><rect x="16" y="5" width="3.5" height="17" rx="1" {...c}/></>}
      {i===7 && <><path d="M 8 4 H 18 V 9 A 5 5 0 0 1 8 9 Z" {...c}/><path d="M 8 6 H 5 V 8 A 3 3 0 0 0 8 11" {...c}/><path d="M 18 6 H 21 V 8 A 3 3 0 0 1 18 11" {...c}/><line x1="13" y1="14" x2="13" y2="18" {...c}/><rect x="9" y="18" width="8" height="3" rx="1" {...c}/></>}
      {i===8 && <><rect x="4" y="4" width="8" height="8" rx="2" {...c}/><rect x="14" y="4" width="8" height="8" rx="2" {...c}/><rect x="4" y="14" width="8" height="8" rx="2" {...c}/><rect x="14" y="14" width="8" height="8" rx="2" {...c}/></>}
    </svg>
  );
}

function Arrow({ s=16 }) {
  return <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

/* ---------------- app mockup (reused, lightly restyled) ---------------- */
function AppDashboard() {
  const { lang } = useLang();
  return (
    <div style={{ background:'#fff', padding:20, fontFamily:'var(--font)' }} className={lang==='th'?'thai':''}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <LogoLockup h={18}/>
        <div style={{ display:'flex', gap:16, fontSize:12, fontWeight:700, color:'var(--ink-3)' }}>
          <span style={{ color:'var(--ink)' }}>{lang==='th'?'วันนี้':'Today'}</span>
          <span>{lang==='th'?'ปฏิทิน':'Calendar'}</span>
          <span>{lang==='th'?'สถิติ':'Stats'}</span>
        </div>
        <div style={{ width:28, height:28, borderRadius:50, background:'linear-gradient(135deg,var(--peach),var(--purple))' }}/>
      </div>
      <div style={{ borderRadius:16, padding:'16px 18px', background:'linear-gradient(135deg,#F8EDEB,#E9DEF6)', marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:800, color:'var(--purple-strong)', textTransform:'uppercase', letterSpacing:'.04em' }}>
          {lang==='th'?'สวัสดีตอนเช้า · จันทร์ 12 พ.ค.':'Good morning · Mon May 12'}
        </div>
        <div style={{ fontSize:18, fontWeight:800, marginTop:6 }}>{lang==='th'?'วันนี้คุณรู้สึกยังไง?':'How are you feeling today?'}</div>
        <div style={{ display:'flex', gap:6, marginTop:12 }}>
          {MOODS.slice(0,7).map((m,i)=>(
            <div key={m.id} style={{ flex:1 }}>
              <div style={{ width:'100%', aspectRatio:'1', borderRadius:50, background:i===0?m.color:'#fff',
                border:i===0?'none':'1px solid rgba(0,0,0,.05)', display:'grid', placeItems:'center',
                boxShadow:i===0?'0 6px 14px -2px rgba(252,164,91,.55)':'none' }}>
                <MoodFace face={m.face} size={26} bg="transparent"/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:10 }}>
        <div style={{ padding:14, borderRadius:14, border:'1px solid var(--hairline,#F0F0F1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
            <span style={{ fontSize:10, fontWeight:800, color:'var(--purple-strong)', letterSpacing:'.06em' }}>✨ AI SUMMARY</span>
          </div>
          <div style={{ fontSize:12, lineHeight:1.5, color:'var(--ink-2)' }}>
            {lang==='th'
              ? <>คุณรู้สึก <b style={{color:'var(--ink)'}}>ดีขึ้น 18%</b> วันที่ออกกำลังกายมัก <b style={{color:'var(--ink)'}}>คะแนนสูงกว่า</b></>
              : <>You felt <b style={{color:'var(--ink)'}}>18% better</b>. Exercise days scored <b style={{color:'var(--ink)'}}>higher</b>.</>}
          </div>
          <svg viewBox="0 0 200 36" style={{ width:'100%', height:30, marginTop:10 }}>
            <defs><linearGradient id="sparkP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A673F1" stopOpacity=".3"/><stop offset="1" stopColor="#A673F1" stopOpacity="0"/></linearGradient></defs>
            <path d="M 0 26 L 28 22 L 56 25 L 84 18 L 112 20 L 140 14 L 168 10 L 200 6 L 200 36 L 0 36 Z" fill="url(#sparkP)"/>
            <path d="M 0 26 L 28 22 L 56 25 L 84 18 L 112 20 L 140 14 L 168 10 L 200 6" stroke="#A673F1" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ padding:12, borderRadius:14, border:'1px solid var(--hairline,#F0F0F1)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:11, fontWeight:800 }}>{lang==='th'?'พ.ค.':'May'}</span>
            <span style={{ fontSize:9, color:'var(--ink-3)' }}>12 / 31</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
            {Array.from({length:31}).map((_,i)=>{
              const filled=i<12; const cols=['var(--peach)','var(--yellow)','var(--mint)','var(--lavender)','var(--blue)','var(--purple)'];
              return <div key={i} style={{ aspectRatio:'1', borderRadius:4, background:filled?cols[(i*3)%cols.length]:'#F5F1EB', border:i===11?'1.5px solid var(--ink)':'none' }}/>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- AI demos (reused, on light paper) ---- */
function NLPDemo() {
  const { lang } = useLang();
  const text = lang==='th'
    ? 'วันนี้พรีเซนต์งานผ่านไปแล้ว เหนื่อยแต่โล่งใจ ขอกาแฟร้านโปรดเป็นรางวัล ☕'
    : 'Got through the big presentation. Tired but relieved. Treated myself to coffee ☕';
  const tags = lang==='th' ? [['งาน','var(--peach)'],['โล่งใจ','var(--mint)'],['กาแฟ','var(--lavender)']]
                           : [['work','var(--peach)'],['relieved','var(--mint)'],['coffee','var(--lavender)']];
  return (
    <div className={lang==='th'?'thai':''} style={{ background:'var(--paper-2)', padding:15, borderRadius:12, border:'1px solid var(--line)', fontSize:14, lineHeight:1.5 }}>
      <div style={{ color:'var(--ink-2)', marginBottom:12 }}>"{text}"</div>
      <div style={{ borderTop:'1px dashed var(--line)', paddingTop:11 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9 }}>
          <span style={{ fontSize:11, color:'var(--peach)', fontWeight:800 }}>✨ AI</span>
          <span style={{ fontSize:12, color:'var(--ink-3)' }}>{lang==='th'?'อารมณ์ที่ตรวจพบ':'detected mood'}</span>
          <span style={{ fontSize:12, fontWeight:800, color:'var(--peach)' }}>{lang==='th'?'· ดี':'· Good'}</span>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {tags.map(([txt,col])=>(
            <span key={txt} style={{ padding:'4px 10px', borderRadius:100, fontSize:12, fontWeight:700, background:'#fff', color:'var(--ink)', border:`1.5px solid ${col}` }}>#{txt}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisionDemo() {
  const { lang } = useLang();
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ height:108, borderRadius:12, position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#6B8FAE,#C99FB1 40%,#F1C09A)' }}>
        <div style={{ position:'absolute', inset:0, opacity:.3, backgroundImage:'repeating-linear-gradient(45deg,rgba(255,255,255,.15) 0 6px,transparent 6px 14px)' }}/>
        <div style={{ position:'absolute', top:8, right:8, padding:'4px 8px', background:'rgba(0,0,0,.4)', backdropFilter:'blur(8px)', borderRadius:100, fontSize:10, fontWeight:700, color:'#fff' }}>📷 IMG_0394</div>
      </div>
      <div style={{ background:'var(--paper-2)', padding:12, borderRadius:10, border:'1px solid var(--line)' }}>
        <div style={{ fontSize:11, color:'var(--ink-3)', marginBottom:6 }}>{lang==='th'?'AI แนะนำแท็ก':'AI suggests'}</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }} className={lang==='th'?'thai':''}>
          {(lang==='th'?['ทะเล','เย็น','พระอาทิตย์ตก']:['beach','evening','sunset']).map(t=>(
            <span key={t} style={{ padding:'3px 9px', borderRadius:100, fontSize:11, fontWeight:700, background:'rgba(252,164,91,.16)', color:'#C8742E' }}>#{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsDemo() {
  const { lang } = useLang();
  return (
    <div className={lang==='th'?'thai':''} style={{ background:'var(--paper-2)', padding:14, borderRadius:12, border:'1px solid var(--line)' }}>
      <div style={{ fontSize:10, color:'var(--peach)', fontWeight:800, marginBottom:6 }}>✨ {lang==='th'?'สรุปสัปดาห์ที่ 19':'Week 19 recap'}</div>
      <div style={{ fontSize:13, lineHeight:1.5, color:'var(--ink-2)' }}>
        {lang==='th'
          ? <>คุณรู้สึก <b style={{color:'var(--ink)'}}>ดีขึ้น 18%</b> มี <b style={{color:'var(--ink)'}}>3 วัน</b> ที่คะแนนสูงตรงกับ <b style={{color:'var(--peach)'}}>ออกกำลังกาย</b></>
          : <>You felt <b style={{color:'var(--ink)'}}>18% better</b>. <b style={{color:'var(--ink)'}}>3 days</b> matched <b style={{color:'var(--peach)'}}>exercise</b></>}
      </div>
      <div style={{ display:'flex', gap:4, marginTop:12, alignItems:'flex-end', height:38 }}>
        {[6,4,7,8,6,9,7].map((h,i)=>(<div key={i} style={{ flex:1, height:h*4, borderRadius:3, background:i>=4?'var(--peach)':'rgba(26,19,32,.14)' }}/>))}
      </div>
    </div>
  );
}

/* year-in-pixels cell color */
function yearCell(m,d){
  const pal=['var(--peach)','var(--yellow)','var(--mint)','var(--lavender)','var(--blue)','var(--purple)'];
  const k=(m*31+d*7)%100;
  if(k<8) return null; if(k<22) return pal[0]; if(k<38) return pal[1];
  if(k<58) return pal[2]; if(k<72) return pal[3]; if(k<86) return pal[4]; return pal[5];
}

Object.assign(window, {
  MOODS, MoodFace, Logo, LogoLockup, Paperclip, Sticker, Folder, Check, FeatIcon, Arrow,
  AppDashboard, NLPDemo, VisionDemo, InsightsDemo, yearCell,
});

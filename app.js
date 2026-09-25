/* לוח אימוני כדורסל – קוד משותף לכל הילדים */
(function(){
const C=window.CONFIG;
document.body.insertAdjacentHTML('afterbegin',`
<div class="wrap">
<header class="apphead">
  <div class="who"><img class="avatar" src="${C.kid}.jpg" alt="${C.name}"><h1>לוח אימוני כדורסל של ${C.name}</h1></div>
  <button class="iconbtn refresh" id="refresh" aria-label="לרענן מהיומן"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg></button>
</header>
<p class="sync" id="sync"><span class="dot"></span><span id="syncText">טוען מהיומן…</span></p>

<div id="gate" class="card gate" hidden>
  <h2>צריך לפתוח מהקישור האישי</h2>
  <p>הקישור הזה חסר את הקוד האישי. בקשו מאבא את הקישור המלא, ופתחו אותו פעם אחת מהטלפון.</p>
</div>

<div id="app">
<section id="tab-next">
  <div id="hero" class="hero"></div>
  <div class="late">לא לאחר!!!</div>
  <div class="packhead"><h2>לארוז לפני האימון</h2><button class="editbtn" id="packEdit">עריכה</button></div>
  <div class="card pack" id="pack"></div>
</section>

<section id="tab-month" hidden>
  <div class="monthbar">
    <h2 id="monthTitle"></h2>
    <div class="nav">
      <button class="iconbtn" id="prevM" aria-label="החודש הקודם"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>
      <button class="iconbtn" id="nextM" aria-label="החודש הבא"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg></button>
    </div>
  </div>
  <div id="month"></div>
  <button class="addbtn" id="addExtra">+ להוסיף אימון נוסף</button>
</section>

<section id="tab-reg" hidden>
  <h2>הלוח הקבוע</h2>
  <p style="margin:-4px 0 12px;color:var(--muted)">שינוי כאן חל על כל השבועות. שינוי של שבוע אחד עושים בלשונית "החודש". כדי להוסיף יום אימון קבוע חדש, מוסיפים אירוע חוזר ביומן גוגל.</p>
  <div class="card reg" id="reg"></div>
</section>
</div>
</div>

<nav class="tabs" role="tablist" id="tabs"><div class="in">
  <button class="tab" role="tab" data-tab="next" aria-selected="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6c3 3 3 9.8 0 12.8M18.4 5.6c-3 3-3 9.8 0 12.8"/></svg>
    האימון הבא</button>
  <button class="tab" role="tab" data-tab="month" aria-selected="false">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
    החודש</button>
  <button class="tab" role="tab" data-tab="reg" aria-selected="false">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
    הלוח הקבוע</button>
</div></nav>

<div class="scrim" id="scrim"></div>
<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="shTitle">
  <h3 id="shTitle"></h3>
  <p class="sub" id="shSub"></p>
  <label class="field" id="fDateWrap"><span>תאריך</span><input type="date" id="fDate"></label>
  <label class="field"><span>אימון</span><input type="text" id="fName"></label>
  <div class="two">
    <label class="field"><span>מתחיל</span><input type="time" id="fStart"></label>
    <label class="field"><span>נגמר</span><input type="time" id="fEnd"></label>
  </div>
  <label class="field"><span>מקום</span><input type="text" id="fPlace" placeholder="איפה האימון?"></label>
  <label class="switch" id="fCancelWrap"><span>האימון בוטל</span><input type="checkbox" id="fCancel"></label>
  <div class="actions">
    <button class="btn primary" id="shSave">לשמור</button>
    <button class="btn ghost" id="shClose">ביטול</button>
  </div>
  <button class="btn danger" id="shReset"></button>
</div>
<div class="busy-scrim" id="busy"><div>שומר ביומן…</div></div>
<div class="toast" id="toast"></div>
`);
})();
(function(){
// ===== הגדרות =====
const API_URL = window.CONFIG.api;
const KID = window.CONFIG.kid;
// ==================

const DAYS=["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
const DAYS_SHORT=["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];
const DAY_CODE={SU:0,MO:1,TU:2,WE:3,TH:4,FR:5,SA:6};
const MONTHS=["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const DEFAULT_ITEMS=["נעלי כדורסל","בקבוק מים מלא","חולצה להחלפה","מגבת","כדור טניס","דלגית"];
const items=()=>(Array.isArray(L.pack)&&L.pack.length)?L.pack:DEFAULT_ITEMS;

const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,"0");
const dkey=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const parseKey=k=>{const [y,m,d]=k.split("-").map(Number);return new Date(y,m-1,d);};
const at=(k,hm)=>{const d=parseKey(k);const [h,m]=(hm||"00:00").split(":").map(Number);d.setHours(h,m,0,0);return d;};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const range=(a,b)=>`<span class="time">${esc(a)}–${esc(b)}</span>`;
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};

// ---------- local storage (only personal ticks + offline copy) ----------
const LKEY="imunim-"+KID;
function lget(){ try{ return JSON.parse(localStorage.getItem(LKEY))||{}; }catch(e){ return {}; } }
function lset(o){ try{ localStorage.setItem(LKEY,JSON.stringify(o)); }catch(e){} }
const L=Object.assign({went:{},packed:{},events:{},series:[],syncedAt:null},lget());
const saveL=()=>lset(L);

// ---------- key ----------
const params=new URLSearchParams(location.search);
const KEY=params.get("key")||L.key||"";
if(params.get("key")){ L.key=KEY; saveL(); }

// ---------- API ----------
async

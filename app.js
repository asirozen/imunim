/* לוח אימוני כדורסל – קוד משותף לכל הילדים */
(function(){
const C=window.CONFIG;
document.head.insertAdjacentHTML('beforeend',`<style>
.teamline{margin:-4px 0 12px;color:var(--muted)}
.game{display:block;width:100%;text-align:start;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px 16px;margin-bottom:10px;cursor:pointer;color:inherit}
.game.past{opacity:.55}
.game.soon{border:2px solid var(--ball)}
.game .gtop{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}
.game .gdate{font-weight:800;font-size:17px}
.gtag{font-size:13px;font-weight:800;border-radius:999px;padding:3px 10px;white-space:nowrap}
.gtag.home{background:var(--ball);color:#fff}
.gtag.away{background:var(--court);color:#fff}
.gteams{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;font-size:16px;margin-bottom:8px}
.gteams .lbl{color:var(--muted);font-size:14px;align-self:center}
.gteams .me{font-weight:800;color:var(--ball)}
.gplace{font-size:15px;color:var(--muted)}
.gplace b{color:var(--ink);font-weight:700}
.nav-link{display:inline-block;margin-top:10px;font-weight:700;color:var(--ball);text-decoration:none;border:1px solid var(--line);border-radius:12px;padding:8px 12px}
.seg{display:flex;gap:8px;margin-bottom:12px}
.segb{flex:1;border:2px solid var(--line);background:var(--bg);border-radius:12px;padding:12px;font-weight:800;cursor:pointer}
.segb[aria-checked="true"]{border-color:var(--ball);background:var(--ball);color:#fff}
.gbanner{display:flex;align-items:center;gap:12px;background:var(--ball-soft);border:2px solid var(--ball);border-radius:18px;padding:12px 14px;margin-bottom:12px;cursor:pointer;width:100%;text-align:start;color:inherit}
.gbanner .ic{font-size:26px}
.gbanner b{display:block}
.leaguelinks{display:flex;flex-wrap:wrap;gap:8px;margin:-4px 0 14px}
.leaguelinks .nav-link{margin-top:0}
.standings{padding:12px 0 8px;margin-bottom:14px}
.sthead{padding:0 14px 8px;font-size:16px}
.stwrap{overflow-x:auto}
.sttable{width:100%;border-collapse:collapse;font-size:14px;white-space:nowrap}
.sttable th{font-size:12px;color:var(--muted);font-weight:700;padding:6px 8px;border-bottom:1px solid var(--line);text-align:center}
.sttable td{padding:8px;border-bottom:1px solid var(--line);text-align:center}
.sttable td.tname,.sttable th:nth-child(2){text-align:start}
.sttable tr.me td{background:var(--ball-soft);font-weight:800;color:var(--ball)}
.stfoot{padding:8px 14px 0;font-size:12px;color:var(--muted)}
.stfoot a{color:var(--ball)}
.stbtn{background:var(--card);cursor:pointer;font:inherit}
.pastlbl{font-size:13px;color:var(--muted);margin:18px 4px 8px}
#gsheet{overflow-y:auto;max-height:92vh}
.tabs .tab{min-width:0}
</style>`);
document.body.insertAdjacentHTML('afterbegin',`
<div class="wrap">
<header class="apphead">
  <div class="who"><img class="avatar" src="${C.avatar||(C.kid+'.jpg')}" alt="${C.name}"><h1>לוח אימוני כדורסל של ${C.name}</h1></div>
  <button class="iconbtn refresh" id="refresh" aria-label="לרענן מהיומן"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg></button>
</header>
<p class="sync" id="sync"><span class="dot"></span><span id="syncText">טוען מהיומן…</span></p>

<div id="gate" class="card gate" hidden>
  <h2>צריך לפתוח מהקישור האישי</h2>
  <p>הקישור הזה חסר את הקוד האישי. בקשו מאבא את הקישור המלא, ופתחו אותו פעם אחת מהטלפון.</p>
</div>

<div id="app">
<section id="tab-next">
  <div id="nextGame"></div>
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

<section id="tab-games" hidden>
  <h2>משחקי ליגה</h2>
  <p class="teamline" id="teamLine"></p>
  <div class="leaguelinks" id="leagueLinks"></div>
  <div class="card standings" id="standings" hidden></div>
  <div id="games"></div>
  <button class="addbtn" id="addGame">+ להוסיף משחק</button>
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
  <button class="tab" role="tab" data-tab="games" aria-selected="false" id="gamesTab" hidden>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>
    משחקים</button>
</div></nav>

<div class="sheet" id="gsheet" role="dialog" aria-modal="true" aria-labelledby="gTitle">
  <h3 id="gTitle">משחק</h3>
  <div class="two">
    <label class="field"><span>תאריך</span><input type="date" id="gDate"></label>
    <label class="field"><span>שעה</span><input type="time" id="gTime"></label>
  </div>
  <div class="seg" role="radiogroup" aria-label="בית או חוץ">
    <button type="button" class="segb" id="gHome" role="radio">משחק בית</button>
    <button type="button" class="segb" id="gAway" role="radio">משחק חוץ</button>
  </div>
  <label class="field"><span>קבוצה יריבה</span><input type="text" id="gOpp" placeholder="למשל: מכבי פ״ת עצמאות"></label>
  <label class="field"><span>אולם</span><input type="text" id="gVenue"></label>
  <label class="field"><span>כתובת האולם</span><input type="text" id="gAddr" placeholder="רחוב, מספר, עיר"></label>
  <label class="field"><span>מחזור (לא חובה)</span><input type="text" id="gRound" inputmode="numeric"></label>
  <div class="actions">
    <button class="btn primary" id="gSave">לשמור</button>
    <button class="btn ghost" id="gClose">ביטול</button>
  </div>
  <button class="btn danger" id="gDelete">למחוק את המשחק</button>
</div>

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
const KEY=window.CONFIG.key||params.get("key")||L.key||"";
if(params.get("key")){ L.key=KEY; saveL(); }

// ---------- API ----------
async function api(action,data,post){
  const body=Object.assign({action,kid:KID,key:KEY},data||{});
  if(window.CONFIG.gas && window.google && google.script){       // האתר מוגש מגוגל
    return await new Promise((res,rej)=>{
      const t=setTimeout(()=>rej(new Error("היומן לא ענה בזמן")),45000);
      google.script.run
        .withSuccessHandler(j=>{ clearTimeout(t); if(!j||!j.ok) rej(new Error((j&&j.error)||"שגיאה")); else res(j.data); })
        .withFailureHandler(e=>{ clearTimeout(t); rej(new Error((e&&e.message)||"בעיית חיבור")); })
        .apiRun(body);
    });
  }
  let res;
  const ctl=new AbortController(), timer=setTimeout(()=>ctl.abort(),45000);   // לא לחכות לנצח
  try{
    if(post){
      res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(body),signal:ctl.signal});
    }else{
      res=await fetch(API_URL+"?"+new URLSearchParams(body).toString(),{signal:ctl.signal});
    }
  }catch(e){ throw new Error(e.name==="AbortError"?"היומן לא ענה בזמן":"בעיית חיבור"); }
  finally{ clearTimeout(timer); }
  const j=await res.json();
  if(!j.ok) throw new Error(j.error||"שגיאה");
  return j.data;
}

// events stored by id; loaded ranges refresh their dates
function setSync(state,text){ const e=$("sync"); e.className="sync "+(state||""); $("syncText").textContent=text; }
function syncedLabel(){
  if(!L.syncedAt) return "";
  const d=new Date(L.syncedAt);
  return "מסונכרן עם היומן · עודכן ב־"+pad(d.getHours())+":"+pad(d.getMinutes());
}
async function load(from,to){
  const data=await api("list",{from:dkey(from),to:dkey(to)});
  const f=dkey(from), t=dkey(to);
  Object.keys(L.events).forEach(id=>{ const e=L.events[id]; if(e.date>=f && e.date<=t) delete L.events[id]; });
  data.events.forEach(e=>L.events[e.id]=e);
  L.series=data.series; if(Array.isArray(data.pack)) L.pack=data.pack; L.hasGames=!!data.hasGames; L.syncedAt=Date.now();
  // forget old data
  const old=dkey(addDays(new Date(),-70));
  Object.keys(L.events).forEach(id=>{ if(L.events[id].date<old) delete L.events[id]; });
  saveL();
}
let view=new Date(); view.setDate(1);
async function refresh(){
  if(!KEY){ return; }
  setSync("busy","טוען מהיומן…");
  try{
    const today=new Date(); today.setHours(0,0,0,0);
    const mFrom=new Date(view.getFullYear(),view.getMonth(),1), mTo=new Date(view.getFullYear(),view.getMonth()+1,0);
    const from=mFrom<today?mFrom:today, to0=addDays(today,45), to=mTo>to0?mTo:to0;
    await load(from,to);
    if(L.hasGames) await loadGames();
    setSync("",syncedLabel());
  }catch(e){
    setSync("err",(e.message&&e.message.includes("קישור"))?e.message:"אין חיבור ליומן כרגע – מוצג המידע האחרון");
  }
  renderAll();
}
let writing=false;
async function write(action,data){
  if(writing) return;                       // לא לשלוח פעמיים
  writing=true; $("shSave").disabled=true; $("shReset").disabled=true;
  $("busy").classList.add("on");
  let ok=false;
  try{ await api(action,data,true); ok=true; }
  catch(e){ toast("ייתכן שלא נשמר ("+e.message+") – בודק ביומן…"); }
  finally{ writing=false; $("shSave").disabled=false; $("shReset").disabled=false; $("busy").classList.remove("on"); }
  closeSheet();
  if(ok) toast("נשמר ביומן");
  refresh();                                // מתעדכן ברקע מהיומן
}
function newOpId(){ const c="0123456789abcdefghijklmnopqrstuv"; let s="x"; for(let i=0;i<20;i++) s+=c[Math.floor(Math.random()*32)]; return s; }

// ---------- data helpers ----------
function sessionsOn(k){ return Object.values(L.events).filter(e=>e.date===k).sort((a,b)=>a.start.localeCompare(b.start)); }
function nextSession(){
  const now=new Date(); let best=null;
  Object.values(L.events).forEach(s=>{
    if(s.cancelled) return;
    if(at(s.date,s.end)<=now) return;
    if(!best || at(s.date,s.start)<at(best.date,best.start)) best=s;
  });
  return best;
}
function dayWord(k){
  const t=new Date();t.setHours(0,0,0,0);
  const diff=Math.round((parseKey(k)-t)/864e5), d=parseKey(k);
  if(diff===0) return "היום";
  if(diff===1) return "מחר";
  return "יום "+DAYS[d.getDay()]+", "+d.getDate()+" ב"+MONTHS[d.getMonth()];
}
function timeLeft(s){
  const now=new Date(), st=at(s.date,s.start);
  if(st<=now) return "האימון עכשיו!";
  let m=Math.round((st-now)/6e4);
  const days=Math.floor(m/1440); m-=days*1440;
  const h=Math.floor(m/60); m-=h*60;
  if(days>=1) return "עוד "+(days===1?"יום":days+" ימים")+(h?" ו־"+(h===1?"שעה":h+" שעות"):"");
  if(h>=1) return "עוד "+(h===1?"שעה":h+" שעות")+(m?" ו־"+m+" דק׳":"");
  return "עוד "+m+" דקות – לצאת!";
}

// ---------- render: next ----------
function renderNext(){
  const s=nextSession(), h=$("hero");
  if(!s){ h.className="hero empty"; h.innerHTML=`<p class="when">האימון הבא</p><p class="big">${L.syncedAt?"אין אימונים בשבועות הקרובים":"טוען…"}</p>`; renderPack(null); renderGameBanner(); return; }
  const same=sessionsOn(s.date).filter(x=>!x.cancelled && x.start>=s.start);
  const first=same[0], last=same[same.length-1];
  const places=[...new Set(same.map(x=>x.place).filter(Boolean))];
  h.className="hero";
  h.innerHTML=`<p class="when">${esc(dayWord(s.date))}</p>
    <p class="big">${range(first.start,last.end)}</p>
    <p class="what">${same.map(x=>esc(x.name)).join(" ואז ")}</p>
    <p class="where">${places.length?esc(places.join(" / ")):"מקום: לבדוק עם המאמן"}</p>
    <span class="left">${esc(timeLeft(first))}</span>${same.some(x=>x.changed||x.extra)?'<span class="changed">שינוי השבוע</span>':""}`;
  renderPack(s.date);
  renderGameBanner();
}
let packEditing=false, packDraft=null, packTarget=null;
function renderPack(k){
  packTarget=k;
  const box=$("pack");
  if(packEditing){
    box.innerHTML=packDraft.map((it,i)=>`<div class="item editing"><span class="label">${esc(it)}</span>
      <button class="rm" data-rm="${i}" aria-label="להסיר ${esc(it)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>`).join("")+
      `<div class="addrow"><input id="packNew" type="text" maxlength="40" placeholder="פריט חדש, למשל: כדור"><button class="btn primary" id="packAdd">הוספה</button></div>
       <div class="packactions"><button class="btn primary" id="packSave">לשמור</button><button class="btn ghost" id="packCancel">ביטול</button></div>`;
    box.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{ packDraft.splice(+b.dataset.rm,1); renderPack(k); });
    const add=()=>{ const v=$("packNew").value.trim(); if(!v) return; if(packDraft.includes(v)){toast("כבר ברשימה");return;} if(packDraft.length>=20){toast("עד 20 פריטים");return;} packDraft.push(v); renderPack(k); setTimeout(()=>{const n=$("packNew"); if(n) n.focus();},0); };
    $("packAdd").onclick=add;
    $("packNew").onkeydown=e=>{ if(e.key==="Enter") add(); };
    $("packCancel").onclick=()=>{ packEditing=false; renderPack(k); };
    $("packSave").onclick=savePack;
    $("packEdit").style.display="none";
    return;
  }
  $("packEdit").style.display="";
  const list=items(), got=((k&&L.packed[k])||[]).filter(x=>typeof x==="string"&&list.includes(x));
  box.innerHTML=list.map(it=>`<button class="item" data-it="${esc(it)}" aria-pressed="${got.includes(it)}">
    <span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
    <span class="label">${esc(it)}</span></button>`).join("")+`<div class="packed-all ${list.length&&got.length===list.length?"show":""}">הכול בתיק. עכשיו רק לצאת בזמן.</div>`;
  box.querySelectorAll(".item").forEach(b=>b.onclick=()=>{
    if(!k) return;
    const it=b.dataset.it; let arr=(L.packed[k]||[]).filter(x=>typeof x==="string");
    arr=arr.includes(it)?arr.filter(x=>x!==it):arr.concat(it);
    L.packed[k]=arr;
    const old=dkey(addDays(new Date(),-7));
    Object.keys(L.packed).forEach(x=>{ if(x<old) delete L.packed[x]; });
    saveL(); renderPack(k);
  });
}
async function savePack(){
  if(writing) return;
  const list=packDraft.slice();
  if(!list.length){ toast("צריך לפחות פריט אחד"); return; }
  writing=true; $("busy").classList.add("on");
  try{ await api("pack",{items:JSON.stringify(list)},true); L.pack=list; saveL(); packEditing=false; toast("הרשימה נשמרה"); }
  catch(e){ toast("הרשימה לא נשמרה ("+e.message+")"); }
  finally{ writing=false; $("busy").classList.remove("on"); renderPack(packTarget); }
}
$("packEdit").onclick=()=>{ packEditing=true; packDraft=items().slice(); renderPack(packTarget); };

// ---------- render: month ----------
function renderMonth(){
  $("monthTitle").textContent=MONTHS[view.getMonth()]+" "+view.getFullYear();
  const y=view.getFullYear(), m=view.getMonth(), days=new Date(y,m+1,0).getDate();
  const todayK=dkey(new Date()), now=new Date();
  const weeks=[]; let cur=null;
  for(let d=1; d<=days; d++){
    const date=new Date(y,m,d), k=dkey(date);
    if(!cur || date.getDay()===0){ cur={start:d,rows:[]}; weeks.push(cur); }
    cur.end=d;
    sessionsOn(k).forEach(s=>cur.rows.push({s,date,k}));
  }
  const html=weeks.filter(w=>w.rows.length).map(w=>`<div class="week"><p class="weeklabel">${w.start}–${w.end} ב${MONTHS[m]}</p>`+
    w.rows.map(({s,date,k})=>{
      const past=at(k,s.end)<now, went=!!L.went[s.id];
      const cls=["row",past?"past":"",k===todayK?"today":"",s.cancelled?"cancel":""].join(" ");
      const tag=s.cancelled?'<span class="tag cx">בוטל</span>':(s.changed?'<span class="tag chg">שונה</span>':(s.extra?'<span class="tag chg">נוסף</span>':""));
      return `<div class="${cls}" data-id="${esc(s.id)}" role="button" tabindex="0">
        <div class="date"><div class="d">${date.getDate()}</div><div class="w">${DAYS_SHORT[date.getDay()]}</div></div>
        <div class="rbody"><div class="rtitle">${esc(s.name)}${tag}</div>
          <div class="rsub">${range(s.start,s.end)} · ${s.place?esc(s.place):"מקום לא ידוע"}</div></div>
        ${s.cancelled?"":`<button class="went" data-went="${esc(s.id)}" aria-pressed="${went}" aria-label="הלכתי לאימון"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>`}
      </div>`;}).join("")+`</div>`).join("");
  $("month").innerHTML=html||`<div class="card emptymonth">${L.syncedAt?"אין אימונים בחודש הזה.":"טוען…"}</div>`;
  $("month").querySelectorAll(".row").forEach(r=>{
    const open=()=>editSession(r.dataset.id);
    r.onclick=e=>{ if(e.target.closest(".went")) return; open(); };
    r.onkeydown=e=>{ if(e.key==="Enter"&&!e.target.closest(".went")) open(); };
  });
  $("month").querySelectorAll(".went").forEach(b=>b.onclick=e=>{
    e.stopPropagation(); const id=b.dataset.went;
    L.went[id]?delete L.went[id]:(L.went[id]=1); saveL(); renderMonth();
    if(L.went[id]) toast("כל הכבוד!");
  });
}
$("prevM").onclick=()=>{view.setMonth(view.getMonth()-1);renderMonth();refresh();};
$("nextM").onclick=()=>{view.setMonth(view.getMonth()+1);renderMonth();refresh();};

// ---------- render: regular ----------
function renderReg(){
  const list=[...L.series].sort((a,b)=>(DAY_CODE[a.day]??9)-(DAY_CODE[b.day]??9)||a.start.localeCompare(b.start));
  $("reg").innerHTML=list.length?list.map(r=>`
    <button class="rrow" data-reg="${esc(r.id)}"><span class="day">${DAYS[DAY_CODE[r.day]]||""}</span>
      <span class="rbody"><span class="rtitle" style="display:block">${esc(r.name)}</span>
      <span class="rsub">${range(r.start,r.end)} · ${r.place?esc(r.place):"מקום לא ידוע"}</span></span></button>`).join("")
    :`<div class="emptymonth">${L.syncedAt?"אין אימונים קבועים ביומן.":"טוען…"}</div>`;
  $("reg").querySelectorAll(".rrow").forEach(b=>b.onclick=()=>editReg(b.dataset.reg));
}

// ---------- sheet ----------
let onSave=null, onReset=null;
function openSheet(o){
  $("shTitle").textContent=o.title; $("shSub").textContent=o.sub||"";
  $("fDateWrap").style.display=o.showDate?"block":"none";
  $("fCancelWrap").style.display=o.showCancel?"flex":"none";
  $("fDate").value=o.date||""; $("fName").value=o.name||""; $("fStart").value=o.start||"";
  $("fEnd").value=o.end||""; $("fPlace").value=o.place||""; $("fCancel").checked=!!o.cancelled;
  $("shReset").style.display=o.resetLabel?"block":"none"; $("shReset").textContent=o.resetLabel||"";
  onSave=o.save; onReset=o.reset;
  $("scrim").classList.add("open"); $("sheet").classList.add("open");
}
function closeSheet(){ $("scrim").classList.remove("open"); $("sheet").classList.remove("open"); }
$("scrim").onclick=()=>{ closeSheet(); closeGame(); }; $("shClose").onclick=closeSheet;
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeSheet(); });
const vals=()=>({date:$("fDate").value,name:$("fName").value.trim(),start:$("fStart").value,end:$("fEnd").value,place:$("fPlace").value.trim(),cancelled:$("fCancel").checked});
$("shSave").onclick=()=>{ const v=vals(); if(!v.start||!v.end){toast("צריך שעת התחלה וסיום");return;} if(v.end<=v.start){toast("שעת הסיום צריכה להיות אחרי ההתחלה");return;} onSave&&onSave(v); };
$("shReset").onclick=()=>{ onReset&&onReset(); };

function editSession(id){
  const s=L.events[id]; if(!s) return; const d=parseKey(s.date);
  const sub="יום "+DAYS[d.getDay()]+", "+d.getDate()+" ב"+MONTHS[d.getMonth()]+" · השינוי רק לתאריך הזה";
  openSheet({title:s.extra?"אימון נוסף":"שינוי באימון",sub,name:s.name,start:s.start,end:s.end,place:s.place,cancelled:s.cancelled,showCancel:true,
    resetLabel:s.extra?"למחוק את האימון הזה":((s.changed||s.cancelled)?"לחזור לשעה ולמקום הקבועים":""),
    save:v=>{
      if(v.cancelled && !s.cancelled) return write("cancel",{id:s.id,series:s.series||""});
      write("update",{id:s.id,date:s.date,name:v.name||s.name,start:v.start,end:v.end,place:v.place});
    },
    reset:()=> s.extra ? write("cancel",{id:s.id,series:""}) : write("reset",{id:s.id,series:s.series,date:s.date})
  });
}
$("addExtra").onclick=()=>{
  const t=new Date(); const inView=t.getMonth()===view.getMonth()&&t.getFullYear()===view.getFullYear();
  const opId=newOpId();
  openSheet({title:"אימון נוסף",sub:"לאימון חד־פעמי, למשל משחק או אימון השלמה",showDate:true,
    date:dkey(inView?t:view),name:"כדורסל",start:"17:00",end:"18:30",place:"",
    save:v=>{ if(!v.date){toast("צריך לבחור תאריך");return;} write("add",{opId,date:v.date,name:v.name||"אימון",start:v.start,end:v.end,place:v.place}); }});
};
function editReg(sid){
  const r=L.series.find(x=>x.id===sid); if(!r) return;
  openSheet({title:"הלוח הקבוע – יום "+(DAYS[DAY_CODE[r.day]]||""),sub:"השינוי יחול על כל השבועות",name:r.name,start:r.start,end:r.end,place:r.place,
    save:v=>write("series",{series:r.id,name:v.name||r.name,start:v.start,end:v.end,place:v.place})});
}


// ---------- league table ----------
let stOpen=false;
const ST_COLS=["מיקום","קבוצה","מש׳","ניצ׳","הפ׳","הפרש","נק׳"];
async function toggleStandings(){
  stOpen=!stOpen; $("standings").hidden=!stOpen; renderGames();
  if(!stOpen) return;
  if(L.standings) renderStandings();
  else $("standings").innerHTML=`<div class="emptymonth">טוען את הטבלה מאתר האיגוד…</div>`;
  try{ L.standings=await api("standings",{}); saveL(); renderStandings(); }
  catch(e){ if(!L.standings) $("standings").innerHTML=`<div class="emptymonth">לא הצלחתי לטעון את הטבלה (${esc(e.message)})</div>`; }
}
function renderStandings(){
  const t=L.standings; if(!t) return;
  let idx=t.headers.map((h,i)=>ST_COLS.includes(h)?i:-1).filter(i=>i>=0);
  if(t.headers.length!==(t.rows[0]||[]).length || idx.length<4) idx=(t.rows[0]||[]).map((_,i)=>i);
  const heads=idx.map(i=>t.headers[i]||"");
  const teamCol=t.headers.indexOf("קבוצה");
  const body=t.rows.map(r=>{
    const me=r.some(c=>c===t.team);
    return `<tr class="${me?"me":""}">${idx.map(i=>`<td class="${i===teamCol?"tname":""}">${esc(r[i])}</td>`).join("")}</tr>`;
  }).join("");
  $("standings").innerHTML=`<div class="sthead"><b>טבלת הליגה${t.leagueName?" – "+esc(t.leagueName):""}</b></div>
    <div class="stwrap"><table class="sttable"><thead><tr>${heads.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>
    <div class="stfoot">עודכן ${esc(t.updated||"")} · <a href="${esc(t.url)}" target="_blank" rel="noopener">לאתר האיגוד</a></div>`;
}

// ---------- games (league) ----------
const HEB_DAY=d=>"יום "+DAYS[d.getDay()]+", "+d.getDate()+"."+(d.getMonth()+1);
async function loadGames(){
  const data=await api("games",{});
  L.games=data.games||[]; L.team=data.team||""; L.homeVenue=data.homeVenue||""; L.homeAddress=data.homeAddress||""; L.leagueName=data.leagueName||""; L.leagueUrl=data.leagueUrl||""; L.teamUrl=data.teamUrl||"";
  saveL();
}
function mapsUrl(g){ const q=[g.venue,g.address].filter(Boolean).join(" "); return "https://waze.com/ul?navigate=yes&q="+encodeURIComponent(q); }
function gameCard(g,cls){
  const d=parseKey(g.date);
  const me=L.team;
  return `<button class="game ${cls}" data-gid="${esc(g.id)}">
    <div class="gtop"><span class="gdate">${esc(HEB_DAY(d))} · <span class="time">${esc(g.time)}</span></span>
      <span class="gtag ${g.isHome?"home":"away"}">${g.isHome?"משחק בית":"משחק חוץ"}</span></div>
    <div class="gteams">
      <span class="lbl">מארחת</span><span class="${g.home===me?"me":""}">${esc(g.home)}</span>
      <span class="lbl">אורחת</span><span class="${g.away===me?"me":""}">${esc(g.away)}</span>
    </div>
    <div class="gplace"><b>${esc(g.venue||"אולם לא ידוע")}</b>${g.address?" · "+esc(g.address):""}${g.round?" · מחזור "+esc(g.round):""}</div>
  </button>${(g.venue||g.address)?`<a class="nav-link" href="${mapsUrl(g)}" target="_blank" rel="noopener">ניווט לאולם בוויז</a>`:""}`;
}
function renderGames(){
  $("gamesTab").hidden=!L.hasGames;
  if(!L.hasGames) return;
  $("teamLine").textContent=L.team?("הקבוצה: "+L.team+(L.leagueName?" · ליגת "+L.leagueName:"")):"";
  $("leagueLinks").innerHTML=`<button class="nav-link stbtn" id="stBtn">${stOpen?"✕ לסגור את הטבלה":"📊 טבלת הליגה"}</button>`+
    (L.teamUrl?`<a class="nav-link" href="${esc(L.teamUrl)}" target="_blank" rel="noopener">דף הקבוצה באתר האיגוד</a>`:"");
  $("stBtn").onclick=toggleStandings;
  const now=new Date(), list=L.games||[];
  const up=list.filter(g=>at(g.date,g.time)>=addDays(now,0)-90*60000);
  const past=list.filter(g=>!up.includes(g)).slice(-3).reverse();
  const soon=addDays(now,7);
  let html=up.map((g,i)=>`<div>${gameCard(g,(i===0&&at(g.date,g.time)<soon)?"soon":"")}</div>`).join("");
  if(!up.length) html=`<div class="card emptymonth">${L.games?"אין משחקים עתידיים ברשימה.":"טוען…"}</div>`;
  if(past.length) html+=`<p class="pastlbl">משחקים אחרונים</p>`+past.map(g=>`<div>${gameCard(g,"past")}</div>`).join("");
  $("games").innerHTML=html;
  $("games").querySelectorAll(".game").forEach(b=>b.onclick=()=>openGame(list.find(g=>g.id===b.dataset.gid)));
  renderGameBanner();
}
function renderGameBanner(){
  const box=$("nextGame"); if(!box) return;
  const now=new Date(), soon=addDays(now,7);
  const g=(L.hasGames&&L.games||[]).find(x=>at(x.date,x.time)>now && at(x.date,x.time)<soon);
  if(!g){ box.innerHTML=""; return; }
  const opp=g.isHome?g.away:g.home;
  box.innerHTML=`<button class="gbanner"><span class="ic">🏆</span><span><b>משחק ${esc(dayWord(g.date))} ב־<span class="time">${esc(g.time)}</span></b>
    ${g.isHome?"משחק בית":"משחק חוץ"} נגד ${esc(opp)} · ${esc(g.venue||"")}</span></button>`;
  box.querySelector("button").onclick=()=>document.querySelector('.tab[data-tab="games"]').click();
}
let gEdit=null, gIsHome=true, gOpId=null;
function setHome(v){
  gIsHome=v; $("gHome").setAttribute("aria-checked",v); $("gAway").setAttribute("aria-checked",!v);
  if(v && !$("gVenue").value){ $("gVenue").value=L.homeVenue||""; if(!$("gAddr").value) $("gAddr").value=L.homeAddress||""; }
}
$("gHome").onclick=()=>setHome(true);
$("gAway").onclick=()=>{ if(gIsHome && $("gVenue").value===(L.homeVenue||"")){ $("gVenue").value=""; $("gAddr").value=""; } setHome(false); };
function openGame(g){
  gEdit=g||null; gOpId=g?null:newOpId();
  $("gTitle").textContent=g?"עריכת משחק":"משחק חדש";
  $("gDate").value=g?g.date:dkey(new Date()); $("gTime").value=g?g.time:"19:00";
  $("gOpp").value=g?g.opponent:""; $("gVenue").value=g?g.venue:""; $("gAddr").value=g?g.address:""; $("gRound").value=g?g.round:"";
  setHome(g?g.isHome:true);
  $("gDelete").style.display=g?"block":"none";
  $("scrim").classList.add("open"); $("gsheet").classList.add("open");
}
function closeGame(){ $("gsheet").classList.remove("open"); $("scrim").classList.remove("open"); }
$("gClose").onclick=closeGame;
$("addGame").onclick=()=>openGame(null);
async function gameWrite(action,data){
  if(writing) return; writing=true; $("busy").classList.add("on");
  let ok=false;
  try{ await api(action,data,true); ok=true; }
  catch(e){ toast("ייתכן שלא נשמר ("+e.message+")"); }
  finally{ writing=false; $("busy").classList.remove("on"); }
  closeGame(); if(ok) toast("נשמר ביומן");
  try{ await loadGames(); }catch(e){} renderGames();
}
$("gSave").onclick=()=>{
  const v={date:$("gDate").value,time:$("gTime").value,isHome:gIsHome,opponent:$("gOpp").value.trim(),venue:$("gVenue").value.trim(),address:$("gAddr").value.trim(),round:$("gRound").value.trim()};
  if(!v.date||!v.time){ toast("צריך תאריך ושעה"); return; }
  if(!v.opponent){ toast("צריך את שם הקבוצה היריבה"); return; }
  if(gEdit) v.id=gEdit.id; else v.opId=gOpId;
  gameWrite("saveGame",v);
};
let delArm=null;
$("gDelete").onclick=()=>{ if(!gEdit) return;
  if(delArm!==gEdit.id){ delArm=gEdit.id; toast("לחיצה נוספת תמחק את המשחק"); setTimeout(()=>{delArm=null;},4000); return; }
  delArm=null; gameWrite("deleteGame",{id:gEdit.id}); };

// ---------- tabs ----------
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.setAttribute("aria-selected",x===t));
  ["next","month","reg","games"].forEach(n=>$("tab-"+n).hidden=n!==t.dataset.tab);
  window.scrollTo(0,0);
});
$("refresh").onclick=refresh;

let tt; function toast(m){ const e=$("toast"); e.textContent=m; e.classList.add("show"); clearTimeout(tt); tt=setTimeout(()=>e.classList.remove("show"),2200); }
function renderAll(){ renderNext(); renderMonth(); renderReg(); renderGames(); }

if(!KEY){ $("gate").hidden=false; $("app").hidden=true; $("tabs").style.display="none"; setSync("err","לא מחובר"); }
else { renderAll(); if(L.syncedAt) setSync("",syncedLabel()); refresh(); }
setInterval(renderNext,60000);
document.addEventListener("visibilitychange",()=>{ if(!document.hidden && KEY) refresh(); });
})();

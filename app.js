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
  <h2>לארוז לפני האימון</h2>
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
const ITEMS=["נעלי כדורסל","בקבוק מים מלא","חולצה להחלפה","מגבת","כדור טניס","דלגית"];

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
async function api(action,data,post){
  const body=Object.assign({action,kid:KID,key:KEY},data||{});
  let res;
  const ctl=new AbortController(), timer=setTimeout(()=>ctl.abort(),25000);   // לא לחכות לנצח
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
  L.series=data.series; L.syncedAt=Date.now();
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
  if(!s){ h.className="hero empty"; h.innerHTML=`<p class="when">האימון הבא</p><p class="big">${L.syncedAt?"אין אימונים בשבועות הקרובים":"טוען…"}</p>`; renderPack(null); return; }
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
}
function renderPack(k){
  const box=$("pack"); const got=(k&&L.packed[k])||[];
  box.innerHTML=ITEMS.map((it,i)=>`<button class="item" data-i="${i}" aria-pressed="${got.includes(i)}">
    <span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
    <span class="label">${esc(it)}</span></button>`).join("")+`<div class="packed-all ${got.length===ITEMS.length?"show":""}">הכול בתיק. עכשיו רק לצאת בזמן.</div>`;
  box.querySelectorAll(".item").forEach(b=>b.onclick=()=>{
    if(!k) return;
    const i=+b.dataset.i, arr=L.packed[k]||(L.packed[k]=[]);
    const p=arr.indexOf(i); p>=0?arr.splice(p,1):arr.push(i);
    const old=dkey(addDays(new Date(),-7));
    Object.keys(L.packed).forEach(x=>{ if(x<old) delete L.packed[x]; });
    saveL(); renderPack(k);
  });
}

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
$("scrim").onclick=closeSheet; $("shClose").onclick=closeSheet;
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

// ---------- tabs ----------
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.setAttribute("aria-selected",x===t));
  ["next","month","reg"].forEach(n=>$("tab-"+n).hidden=n!==t.dataset.tab);
  window.scrollTo(0,0);
});
$("refresh").onclick=refresh;

let tt; function toast(m){ const e=$("toast"); e.textContent=m; e.classList.add("show"); clearTimeout(tt); tt=setTimeout(()=>e.classList.remove("show"),2200); }
function renderAll(){ renderNext(); renderMonth(); renderReg(); }

if(!KEY){ $("gate").hidden=false; $("app").hidden=true; $("tabs").style.display="none"; setSync("err","לא מחובר"); }
else { renderAll(); if(L.syncedAt) setSync("",syncedLabel()); refresh(); }
setInterval(renderNext,60000);
document.addEventListener("visibilitychange",()=>{ if(!document.hidden && KEY) refresh(); });
})();

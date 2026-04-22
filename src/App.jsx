import { useState, useEffect, useRef } from "react";

// ── DESIGN TOKENS ─────────────────────────────────────────────
const T = {
  // Palette
  bg:       "#F5F0E8",   // bone white
  bg2:      "#EDE8DF",
  card:     "#FAF7F2",
  card2:    "#EEE9E0",
  moss:     "#4A7C59",   // primary CTA
  mossLight:"#4A7C5918",
  mossMid:  "#4A7C5940",
  terra:    "#C0603A",   // accent / warnings
  terraLight:"#C0603A18",
  sand:     "#D4A96A",   // secondary accent
  sandLight:"#D4A96A22",
  success:  "#3D8A5C",
  danger:   "#C0603A",
  warn:     "#D4A96A",
  text:     "#1E1A14",
  textMid:  "#6B6253",
  textDim:  "#A89880",
  border:   "#DDD7CC",
  shadow:   "rgba(100,85,65,0.12)",
  shadowSm: "rgba(100,85,65,0.07)",
  // Typography
  fontHead: "'Cabinet Grotesk', 'Syne', sans-serif",
  fontBody: "'Satoshi', 'Inter', sans-serif",
};

const NEU = {
  raised:  `4px 4px 10px ${T.shadow}, -3px -3px 8px rgba(255,255,255,0.85)`,
  inset:   `inset 3px 3px 7px ${T.shadow}, inset -2px -2px 5px rgba(255,255,255,0.75)`,
  flat:    `2px 2px 6px ${T.shadowSm}, -1px -1px 4px rgba(255,255,255,0.7)`,
};

const gStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  html,body{background:${T.bg};color:${T.text};font-family:${T.fontBody};overscroll-behavior:none;font-size:16px}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-track{background:${T.bg2}}
  ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
  input,button,select,textarea{font-family:${T.fontBody};outline:none;border:none;background:transparent}
  button{cursor:pointer}
  input[type=date]::-webkit-calendar-picker-indicator{filter:opacity(0.4)}
`;

// ── DATA ──────────────────────────────────────────────────────
const CATS = [
  {id:"food",     label:"Food & Drinks", emoji:"🍜", color:"#C0603A"},
  {id:"transport",label:"Transport",     emoji:"🚇", color:"#4A7C59"},
  {id:"shopping", label:"Shopping",      emoji:"🛍️", color:"#D4A96A"},
  {id:"health",   label:"Health",        emoji:"🌿", color:"#3D8A5C"},
  {id:"entertain",label:"Entertainment", emoji:"🎬", color:"#8B6BB1"},
  {id:"utilities",label:"Utilities",     emoji:"⚡", color:"#5B8FBF"},
  {id:"rent",     label:"Rent",          emoji:"🏠", color:"#A0785A"},
  {id:"other",    label:"Other",         emoji:"📦", color:"#888070"},
];

const initTxns = [];

const BUDGETS = {food:3000,transport:1500,shopping:4000,health:2000,entertain:1000,utilities:1500,rent:15000,other:500};

const initGoals = [
  {id:1,name:"Emergency Fund",emoji:"🛡️",target:50000,saved:0,date:"2025-12-31"},
  {id:2,name:"Goa Trip",      emoji:"🏖️",target:25000,saved:0,date:"2025-10-01"},
];

// ── PERSISTENT STORAGE HOOK ───────────────────────────────────
function useStored(key, fallback) {
  const [val, setVal] = useState(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(key);
        if (r?.value) setVal(JSON.parse(r.value));
      } catch(_) {}
      setReady(true);
    })();
  }, [key]);

  const save = async (next) => {
    const resolved = typeof next === "function" ? next(val) : next;
    setVal(resolved);
    try { await window.storage.set(key, JSON.stringify(resolved)); } catch(_) {}
  };

  return [val, save, ready];
}

const AI_INSIGHTS = [
  {icon:"🍜",title:"Food trending up",   body:"You've spent 12% more on food this month. Meal-prepping 3 days a week could save ~₹800.",  tag:"Tip"},
  {icon:"✈️",title:"Goal on track",      body:"At your current savings rate, you'll hit your Goa Trip goal 3 weeks early. Keep it up!",   tag:"🎉"},
  {icon:"⚡",title:"Utility win",        body:"Electricity bill is ₹210 lower than last month. Your lowest in 4 months.",                  tag:"Win"},
  {icon:"🛍️",title:"Shopping spike",    body:"Shopping is your biggest category this month at 33%. Consider a 48-hr wait before impulse buys.",tag:"Watch"},
];

// ── HELPERS ──────────────────────────────────────────────────
const fmt  = n => `₹${Number(n).toLocaleString("en-IN")}`;
const cat  = id => CATS.find(c=>c.id===id) || CATS[7];
const dStr = d  => new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"});

// ── ATOMS ────────────────────────────────────────────────────
const Pill = ({children,color=T.moss,bg}) => (
  <span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,background:bg||color+"22",color,fontSize:11,fontWeight:600,letterSpacing:0.3}}>
    {children}
  </span>
);

const Ring = ({pct,size=80,stroke=7,color=T.moss,bg=T.card2,children}) => {
  const r=((size-stroke)/2), circ=2*Math.PI*r, dash=circ*(Math.min(pct,100)/100);
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray .6s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {children}
      </div>
    </div>
  );
};

const Bar=({pct,color,h=6})=>(
  <div style={{width:"100%",height:h,borderRadius:h,background:T.card2,boxShadow:NEU.inset,overflow:"hidden"}}>
    <div style={{width:`${Math.min(pct,100)}%`,height:"100%",borderRadius:h,background:color,transition:"width .5s ease"}}/>
  </div>
);

const Card=({children,style={},...p})=>(
  <div style={{background:T.card,borderRadius:20,boxShadow:NEU.raised,...style}} {...p}>{children}</div>
);

// SVG ICONS
const IC={
  home:  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"/>,
  list:  <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></>,
  chart: <><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></>,
  target:<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  user:  <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  plus:  <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  x:     <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
  search:<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  spark: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>,
  chev:  <polyline points="9 18 15 12 9 6"/>,
  leaf:  <path d="M2 22c1.25-1.25 2.5-3.5 2.5-6 0-4 3.5-8 8-10 0 5-1.5 8-4 10 2-1 4.5-1.5 7-1 0 0-2 4-7 5.5C5 22 2 22 2 22z"/>,
};
const Icon=({n,size=20,color="currentColor"})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {IC[n]}
  </svg>
);

// ── LANDING ──────────────────────────────────────────────────
const Landing=({onLogin})=>(
  <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",padding:"48px 28px 40px",gap:36}}>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:32}}>
      {/* Brand */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{width:64,height:64,borderRadius:18,background:T.moss,boxShadow:`0 8px 24px ${T.mossMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>🌿</div>
        <div>
          <h1 style={{fontFamily:T.fontHead,fontSize:40,fontWeight:800,letterSpacing:-1.5,lineHeight:1,color:T.text}}>Spend<span style={{color:T.moss}}>Smart</span></h1>
          <p style={{color:T.textMid,marginTop:10,fontSize:16,lineHeight:1.6,maxWidth:280}}>The calm, clear way to track money and finally feel in control.</p>
        </div>
      </div>

      {/* Illustration card */}
      <Card style={{padding:20,display:"flex",flexDirection:"column",gap:14}}>
        {[
          {emoji:"🧾",label:"This month",val:"₹6,334",sub:"of ₹85,000",col:T.text},
          {emoji:"🌿",label:"Saved",val:"₹78,666",sub:"91% of income",col:T.success},
          {emoji:"🏖️",label:"Goa Trip",val:"32% there",sub:"₹8k / ₹25k",col:T.terra},
        ].map(r=>(
          <div key={r.label} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:22,width:32,textAlign:"center"}}>{r.emoji}</span>
            <div style={{flex:1}}>
              <p style={{color:T.textMid,fontSize:12}}>{r.label}</p>
              <p style={{fontFamily:T.fontHead,fontWeight:800,fontSize:18,color:r.col,letterSpacing:-0.5}}>{r.val}</p>
            </div>
            <span style={{color:T.textDim,fontSize:12}}>{r.sub}</span>
          </div>
        ))}
      </Card>

      {/* Features */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {["AI spending insights & weekly summaries","Budget tracking with gentle nudges","Savings goals that actually motivate"].map(f=>(
          <div key={f} style={{display:"flex",alignItems:"center",gap:10,color:T.textMid,fontSize:14}}>
            <div style={{width:6,height:6,borderRadius:3,background:T.moss,flexShrink:0}}/>
            {f}
          </div>
        ))}
      </div>
    </div>

    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <button onClick={onLogin} style={{width:"100%",padding:"17px 0",borderRadius:18,background:T.moss,color:"#fff",fontWeight:700,fontSize:16,fontFamily:T.fontHead,display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:`0 8px 28px ${T.mossMid}`,letterSpacing:-0.3}}>
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#fff" fillOpacity=".9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" fillOpacity=".9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" fillOpacity=".9" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" fillOpacity=".9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continue with Google
      </button>
      <p style={{color:T.textDim,fontSize:11,textAlign:"center"}}>No card needed · Free forever · Your data stays private</p>
    </div>
  </div>
);

// ── ONBOARDING ────────────────────────────────────────────────
const Onboarding=({onDone})=>{
  const [step,setStep]=useState(0);
  const [d,setD]=useState({currency:"INR",income:"",cats:["food","transport","shopping"],goal:""});
  const STEPS=[
    {title:"Your currency",    sub:"We'll format all amounts accordingly"},
    {title:"Monthly income",   sub:"Helps calculate your savings rate"},
    {title:"Usual categories", sub:"Pick what you spend on most"},
    {title:"Savings dream",    sub:"What are you working towards?"},
  ];
  return (
    <div style={{minHeight:"100vh",background:T.bg,padding:"32px 24px 32px",display:"flex",flexDirection:"column",gap:28}}>
      {/* Progress */}
      <div style={{display:"flex",gap:5,paddingTop:16}}>
        {STEPS.map((_,i)=>(
          <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?T.moss:T.border,transition:"background .3s",boxShadow:i<=step?`0 1px 6px ${T.mossMid}`:undefined}}/>
        ))}
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",gap:24}}>
        <div>
          <p style={{color:T.textDim,fontSize:13,marginBottom:4}}>Step {step+1} of {STEPS.length}</p>
          <h2 style={{fontFamily:T.fontHead,fontSize:30,fontWeight:800,letterSpacing:-1,color:T.text}}>{STEPS[step].title}</h2>
          <p style={{color:T.textMid,marginTop:6,fontSize:14,lineHeight:1.5}}>{STEPS[step].sub}</p>
        </div>

        {step===0&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[["INR","₹","Indian Rupee"],["USD","$","US Dollar"],["EUR","€","Euro"],["GBP","£","British Pound"]].map(([c,sym,l])=>(
              <button key={c} onClick={()=>setD({...d,currency:c})}
                style={{padding:"14px 18px",borderRadius:14,background:d.currency===c?T.moss:T.card,boxShadow:d.currency===c?`0 4px 16px ${T.mossMid}`:NEU.raised,color:d.currency===c?"#fff":T.text,textAlign:"left",fontSize:15,display:"flex",alignItems:"center",gap:14,transition:"all .2s"}}>
                <span style={{width:32,height:32,borderRadius:10,background:d.currency===c?"rgba(255,255,255,.2)":T.bg2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.fontHead,fontWeight:800,fontSize:16}}>{sym}</span>
                <div><p style={{fontWeight:600}}>{c}</p><p style={{fontSize:12,opacity:.7}}>{l}</p></div>
                {d.currency===c&&<span style={{marginLeft:"auto",fontSize:16}}>✓</span>}
              </button>
            ))}
          </div>
        )}

        {step===1&&(
          <Card style={{padding:"22px 20px"}}>
            <p style={{color:T.textDim,fontSize:12,marginBottom:8,letterSpacing:.5,textTransform:"uppercase"}}>Monthly take-home</p>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:T.fontHead,fontSize:32,color:T.moss,fontWeight:800}}>₹</span>
              <input value={d.income} onChange={e=>setD({...d,income:e.target.value})} placeholder="0" type="number"
                style={{color:T.text,fontSize:36,fontFamily:T.fontHead,fontWeight:800,width:"100%",letterSpacing:-1.5,background:"transparent"}}/>
            </div>
            <div style={{height:2,borderRadius:1,background:T.moss,marginTop:12,opacity:.5}}/>
          </Card>
        )}

        {step===2&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {CATS.map(c=>{const sel=d.cats.includes(c.id);return(
              <button key={c.id} onClick={()=>setD({...d,cats:sel?d.cats.filter(x=>x!==c.id):[...d.cats,c.id]})}
                style={{padding:"10px 14px",borderRadius:12,background:sel?T.moss:T.card,boxShadow:sel?`0 4px 12px ${T.mossMid}`:NEU.flat,color:sel?"#fff":T.textMid,fontSize:14,display:"flex",alignItems:"center",gap:7,fontWeight:sel?600:400,transition:"all .2s"}}>
                {c.emoji} {c.label.split(" ")[0]}
              </button>
            );})}
          </div>
        )}

        {step===3&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[["🛡️","Emergency Fund"],["✈️","Dream Vacation"],["💻","New Laptop"],["🏡","Down Payment"],["🎓","Education"],["✨","Other"]].map(([e,g])=>(
              <button key={g} onClick={()=>setD({...d,goal:g})}
                style={{padding:"14px 18px",borderRadius:14,background:d.goal===g?T.mossLight:T.card,border:`1.5px solid ${d.goal===g?T.moss:T.border}`,color:T.text,textAlign:"left",fontSize:15,display:"flex",alignItems:"center",gap:12,transition:"all .2s",boxShadow:NEU.flat}}>
                <span style={{fontSize:20}}>{e}</span>
                <span style={{fontWeight:d.goal===g?600:400,flex:1}}>{g}</span>
                {d.goal===g&&<span style={{color:T.moss}}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{display:"flex",gap:10}}>
        {step>0&&(
          <button onClick={()=>setStep(s=>s-1)}
            style={{flex:1,padding:16,borderRadius:16,background:T.card,boxShadow:NEU.raised,color:T.textMid,fontWeight:600,fontSize:16}}>
            Back
          </button>
        )}
        <button onClick={()=>step<3?setStep(s=>s+1):onDone(d)}
          style={{flex:2,padding:16,borderRadius:16,background:T.moss,color:"#fff",fontWeight:700,fontSize:17,fontFamily:T.fontHead,boxShadow:`0 6px 24px ${T.mossMid}`,letterSpacing:-0.3}}>
          {step<3?"Continue →":"Let's go 🌿"}
        </button>
      </div>
    </div>
  );
};

// ── ADD EXPENSE MODAL ────────────────────────────────────────
const AddModal=({onAdd,onClose})=>{
  const [amt,setAmt]=useState("");
  const [c,setC]=useState("food");
  const [note,setNote]=useState("");
  const [date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const pad=v=>{
    if(v==="⌫") return setAmt(a=>a.slice(0,-1));
    if(v==="."&&amt.includes(".")) return;
    if(amt.length<8) setAmt(a=>a===("0")?"":a+v);
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(30,26,20,.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",zIndex:200}} onClick={onClose}>
      <div style={{width:"100%",maxWidth:480,margin:"0 auto",background:T.bg,borderRadius:"28px 28px 0 0",padding:"24px 20px 44px",boxShadow:`0 -8px 48px ${T.shadow}`}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{fontFamily:T.fontHead,fontSize:22,fontWeight:800,letterSpacing:-0.5}}>Add Expense</h3>
          <button onClick={onClose} style={{background:T.card2,borderRadius:12,padding:8,display:"flex",boxShadow:NEU.flat}}><Icon n="x" size={17} color={T.textMid}/></button>
        </div>

        {/* Amount display */}
        <div style={{textAlign:"center",marginBottom:4}}>
          <span style={{fontFamily:T.fontHead,fontSize:54,fontWeight:800,color:amt?T.text:T.textDim,letterSpacing:-2,lineHeight:1}}>
            ₹{amt||"0"}
          </span>
        </div>
        <p style={{textAlign:"center",color:T.textDim,fontSize:12,marginBottom:16}}>{amt?cat(c).label+" · "+dStr(date):"Enter amount"}</p>

        {/* Numpad */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
          {["1","2","3","4","5","6","7","8","9",".","0","⌫"].map(v=>(
            <button key={v} onClick={()=>pad(v)}
              style={{padding:"14px 0",borderRadius:14,background:v==="⌫"?T.terraLight:T.card,boxShadow:NEU.raised,color:v==="⌫"?T.terra:T.text,fontSize:22,fontFamily:T.fontHead,fontWeight:700,transition:"transform .1s, box-shadow .1s",active:{transform:"scale(.96)"}}}>
              {v}
            </button>
          ))}
        </div>

        {/* Category */}
        <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:8,marginBottom:12}}>
          {CATS.map(cat_=>(
            <button key={cat_.id} onClick={()=>setC(cat_.id)}
              style={{padding:"7px 12px",borderRadius:10,background:c===cat_.id?T.moss:T.card,boxShadow:NEU.flat,color:c===cat_.id?"#fff":T.textMid,fontSize:12,whiteSpace:"nowrap",flexShrink:0,fontWeight:c===cat_.id?600:400,transition:"all .2s"}}>
              {cat_.emoji} {cat_.label.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Note + Date */}
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note…"
            style={{flex:1,background:T.card,borderRadius:12,padding:"12px 14px",color:T.text,fontSize:14,boxShadow:NEU.inset}}/>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            style={{background:T.card,borderRadius:12,padding:"12px 12px",color:T.text,fontSize:13

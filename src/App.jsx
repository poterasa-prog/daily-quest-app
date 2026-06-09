import { useState, useEffect } from "react";

const LEVELS=[0,100,250,450,700,1000,1400,1900,2500,3200,4000];
const HP_LOSS=15,MAX_HP=100;
const AFF_INTERVAL=3*60*60;
const AFF_START_HOUR=6;
const AFF_END_HOUR=24;
const PM_TEXT="Doamne, iti multumesc pentru aceasta noua zi. Da-mi putere si pace sa fac binele astazi. Amin.";
const PE_TEXT="Doamne, iti multumesc pentru ziua de azi. Iarta-mi greselile si ocroteste-ma in aceasta noapte. Amin.";

function s3x(kg){return [{type:"working",weight:kg,reps:"12"},{type:"working",weight:kg,reps:"12"},{type:"working",weight:kg,reps:"25"}];}

const getLvl=xp=>{for(let i=LEVELS.length-1;i>=0;i--)if(xp>=LEVELS[i])return i+1;return 1;};
const xpNext=l=>LEVELS[Math.min(l,LEVELS.length-1)]||LEVELS[LEVELS.length-1];
const xpCurLvl=l=>LEVELS[Math.min(l-1,LEVELS.length-1)]||0;
const getR=(v,r)=>{for(let i=r.length-1;i>=0;i--)if(v>=r[i].days)return{...r[i],index:i};return{...r[0],index:0};};
const getNR=(v,r)=>{for(let i=0;i<r.length;i++)if(r[i].days>v)return r[i];return null;};
const isWday=ds=>{const d=new Date(ds+"T12:00:00").getDay();return d>=1&&d<=5;};
const tod=()=>new Date().toISOString().split("T")[0];
const fmt=ds=>ds?new Date(ds+"T12:00:00").toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long",year:"numeric"}):"";
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);

// === NEO-TACTILE PALETTE ===
// Glass tokens: surfaces are translucent whites layered over a dark base.
const C={
  // Base dark
  bg:"#0a0a12",su:"rgba(255,255,255,0.04)",ca:"rgba(255,255,255,0.06)",bd:"rgba(255,255,255,0.10)",
  // Accents
  ac:"#3b82f6",acG:"#3b82f655",acL:"#60a5fa",
  cyan:"#22d3ee",cyanG:"#22d3ee66",
  gold:"#fbbf24",grn:"#22c55e",red:"#ef4444",ylw:"#fbbf24",
  // Text
  tx:"#f5f5fa",tx2:"rgba(245,245,250,0.65)",tx3:"rgba(245,245,250,0.40)",
  ip:"rgba(0,0,0,0.25)",
  // Per-tab accents (kept identifiable but now used as glass tint + active pill)
  dA:"#10b981",dBg:"#0a1612",dSu:"rgba(16,185,129,0.06)",dCa:"rgba(16,185,129,0.07)",dBd:"rgba(16,185,129,0.20)",
  wA:"#3b82f6",wBg:"#0a0f1a",wSu:"rgba(59,130,246,0.06)",wCa:"rgba(59,130,246,0.07)",wBd:"rgba(59,130,246,0.22)",
  gA:"#f97316",gBg:"#110a00",gSu:"rgba(249,115,22,0.06)",gCa:"rgba(249,115,22,0.07)",gBd:"rgba(249,115,22,0.22)",
  eA:"#a855f7",eSu:"rgba(168,85,247,0.06)",eCa:"rgba(168,85,247,0.07)",eBd:"rgba(168,85,247,0.22)",
  aA:"#22d3ee",aBg:"#001a16",aSu:"rgba(34,211,238,0.06)",aCa:"rgba(34,211,238,0.07)",aBd:"rgba(34,211,238,0.22)",
  pA:"#60a5fa",pBg:"#00080f",pSu:"rgba(96,165,250,0.06)",pCa:"rgba(96,165,250,0.07)",pBd:"rgba(96,165,250,0.22)",
  rA:"#eab308",rBg:"#0c0900",rSu:"rgba(234,179,8,0.06)",rCa:"rgba(234,179,8,0.07)",rBd:"rgba(234,179,8,0.22)",
  sgA:"#ec4899",sgCa:"rgba(236,72,153,0.07)",sgBd:"rgba(236,72,153,0.22)",
  alA:"#dc2626",alCa:"rgba(220,38,38,0.07)",alBd:"rgba(220,38,38,0.22)",
};

// === NEO-TACTILE STYLE HELPERS ===
const glass = (extra={}) => ({
  background:"rgba(255,255,255,0.05)",
  border:"1px solid rgba(255,255,255,0.10)",
  backdropFilter:"blur(20px) saturate(150%)",
  WebkitBackdropFilter:"blur(20px) saturate(150%)",
  boxShadow:"inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.35)",
  ...extra,
});
const glassTinted = (accent, alpha=0.07, extra={}) => ({
  background:`linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), ${accent}${Math.round(alpha*255).toString(16).padStart(2,"0")}`,
  border:`1px solid ${accent}33`,
  backdropFilter:"blur(20px) saturate(150%)",
  WebkitBackdropFilter:"blur(20px) saturate(150%)",
  boxShadow:`inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 24px rgba(0,0,0,0.35)`,
  ...extra,
});
const pillActive = (accent) => ({
  background:accent,
  color:"#fff",
  border:`1px solid ${accent}`,
  boxShadow:`0 0 0 1px rgba(255,255,255,0.15) inset, 0 4px 16px ${accent}66, 0 0 24px ${accent}44`,
});
const pillInactive = {
  background:"rgba(255,255,255,0.06)",
  color:"rgba(245,245,250,0.55)",
  border:"1px solid rgba(255,255,255,0.10)",
  boxShadow:"inset 0 1px 0 rgba(255,255,255,0.08)",
};
const neonRing = (accent) => ({
  boxShadow:`0 0 0 1px ${accent}66 inset, 0 0 20px ${accent}55, 0 0 40px ${accent}33`,
});

const DR=[{days:0,tag:"Newbie",color:"#9ca3af",glow:"#9ca3af44"},{days:5,tag:"Incepator",color:"#22c55e",glow:"#22c55e44"},{days:15,tag:"Consistent",color:"#3b82f6",glow:"#3b82f644"},{days:30,tag:"Athlete",color:"#8b5cf6",glow:"#8b5cf644"},{days:60,tag:"Warrior",color:"#f59e0b",glow:"#f59e0b44"},{days:100,tag:"Beast",color:"#ef4444",glow:"#ef444444"},{days:150,tag:"Elite",color:"#22d3ee",glow:"#22d3ee44"},{days:365,tag:"Legend",color:"#fbbf24",glow:"#fbbf2466"}];
const GR=[{days:0,tag:"Newbie",color:"#9ca3af",glow:"#9ca3af44"},{days:5,tag:"Incepator",color:"#22c55e",glow:"#22c55e44"},{days:15,tag:"Consistent",color:"#3b82f6",glow:"#3b82f644"},{days:30,tag:"Athlete",color:"#8b5cf6",glow:"#8b5cf644"},{days:60,tag:"Warrior",color:"#f59e0b",glow:"#f59e0b44"},{days:100,tag:"Beast",color:"#ef4444",glow:"#ef444444"},{days:150,tag:"Elite",color:"#22d3ee",glow:"#22d3ee44"},{days:365,tag:"Legend",color:"#fbbf24",glow:"#fbbf2466"}];

const LEGS=[
  {name:"Squat",sets:s3x("30 Kg")},
  {name:"Leg Curl",sets:s3x("23 Kg")},
  {name:"Leg Extension",sets:s3x("32 Kg")},
  {name:"Leg Press",sets:s3x("100 Kg")},
  {name:"Hip Abductor Exterior",sets:s3x("27 Kg")},
  {name:"Hip Abductor Interior",sets:s3x("36 Kg")},
  {name:"Gambe Sezut",sets:s3x("40 Kg")},
];

const MP=[
  {id:1,name:"Push Day 1",emoji:"🔴",rest:false,exercises:[
    {name:"5 MIN INCALZIRE",sets:[{type:"warmup",weight:"--",reps:"5 min"}]},
    {name:"INCLINE CHEST",sets:s3x("10 Kg")},
    {name:"SHOULDER CBUM",sets:s3x("6 Kg")},
    {name:"CHEST PRESS",sets:s3x("15 Kg")},
    {name:"SHOULDER LATERAL RAISES",sets:s3x("50 Kg")},
    {name:"CABLE CHEST FLYES",sets:s3x("18 Kg")},
    {name:"CABLE TRICEPS",sets:s3x("27 Kg")},
    {name:"SHOULDER LATERAL RAISES",sets:s3x("50 Kg")},
    {name:"TRICEPS STANDING MACHINE",sets:s3x("18 Kg")},
  ]},
  {id:2,name:"Pull Day 1",emoji:"🔵",rest:false,exercises:[
    {name:"Back Rope Pulls",sets:s3x("27 Kg")},
    {name:"Lat Pulls Wide Grip",sets:s3x("40 Kg")},
    {name:"CBum Biceps 45",sets:s3x("8 Kg")},
    {name:"Biceps Curls DB",sets:s3x("10 Kg")},
    {name:"Normal Grip Row Machine",sets:s3x("39 Kg")},
    {name:"Flexi Biceps",sets:s3x("23 Kg")},
    {name:"Close Grip Lat Pulls",sets:s3x("39 Kg")},
    {name:"Rear Delt",sets:s3x("45 Kg")},
    {name:"Trapez",sets:s3x("20 Kg")},
  ]},
  {id:3,name:"Leg Day 1",emoji:"🟢",rest:false,exercises:LEGS},
  {id:4,name:"Rest Day",emoji:"😴",rest:true,exercises:[]},
  {id:5,name:"Push Day 2",emoji:"🔴",rest:false,exercises:[
    {name:"Decline Chest Push",sets:s3x("10 Kg")},
    {name:"Shoulder Press",sets:s3x("10 Kg")},
    {name:"Chest Press Oblique Grip",sets:s3x("15 Kg")},
    {name:"Lateral Raises Machine",sets:s3x("50 Kg")},
    {name:"Normal Chest Flyes",sets:s3x("45 Kg")},
    {name:"Triceps Behind Head",sets:s3x("18 Kg")},
  ]},
  {id:6,name:"Pull Day 2",emoji:"🔵",rest:false,exercises:[
    {name:"Cable Pulls",sets:s3x("27 Kg")},
    {name:"Rack Pulls",sets:s3x("25 Kg")},
    {name:"Hammer Curls Ropes",sets:s3x("12 Kg")},
    {name:"Reverse Grip Row",sets:s3x("39 Kg")},
    {name:"Biceps Rope Bar",sets:s3x("29 Kg")},
    {name:"Rear Delt Machine",sets:s3x("45 Kg")},
    {name:"Traps",sets:s3x("20 Kg")},
  ]},
  {id:7,name:"Leg Day 2",emoji:"🟢",rest:false,exercises:LEGS},
];

const EVE=[
  {name:"Kettlebell Swing",sets:s3x("--")},
  {name:"Kettlebell Goblet Squat",sets:s3x("--")},
  {name:"Plank",sets:[{type:"working",weight:"--",reps:"30s"},{type:"working",weight:"--",reps:"30s"},{type:"working",weight:"--",reps:"30s"}]},
  {name:"Crunch / Abdomen",sets:s3x("--")},
];

const DEFAULT_RULES=[
  {id:"r1",text:"Respecta-ti programul zilnic fara exceptii"},
  {id:"r2",text:"Nu amana ce poti face astazi"},
  {id:"r3",text:"Fii prezent si constient in fiecare moment"},
  {id:"r4",text:"Grija de sanatatea ta este prioritara"},
  {id:"r5",text:"Vorbeste frumos cu tine insuti"},
];
const DEFAULT_AFF=[
  {id:"a1",text:"Sunt suficient exact asa cum sunt in acest moment"},
  {id:"a2",text:"Aleg pacea in locul ingrijorarii"},
  {id:"a3",text:"Fiecare zi imi aduce oportunitati noi de crestere"},
  {id:"a4",text:"Mintea si corpul meu sunt in armonie"},
  {id:"a5",text:"Merit tot binele care vine spre mine"},
  {id:"a6",text:"Am incredere in procesul vietii mele"},
  {id:"a7",text:"Sunt plin de energie si motivatie"},
  {id:"a8",text:"Aleg sa fiu recunoscator pentru tot ceea ce am"},
  {id:"a9",text:"Ma iubesc si ma accept asa cum sunt"},
  {id:"a10",text:"In fiecare zi devin o versiune mai buna a mea"},
];

const INIT={
  heroName:"",xp:0,hp:MAX_HP,streak:0,lastDate:"",setupDone:false,log:[],
  daily:{tasks:[],daysDone:0,lastDate:"",rankUnlocks:[]},
  work:{tasks:[],daysDone:0,lastDate:"",rankUnlocks:[]},
  gym:{sessionsDone:0,lastDate:"",rankUnlocks:[],history:[],mp:null,eve:null,completed:{}},
  aff:{list:null,timerStart:null,sessionsDone:0,lastSession:""},
  prayer:{morning:false,evening:false,lastDate:"",daysDone:0,prayerTexts:null},
  rules:{list:null},
  sugar:{lastDate:"",done:false,daysDone:0},
  alcohol:{lastDate:"",done:false,daysDone:0},
};

function Bar({label,value,max,color,glow}){
  const p=Math.min(100,Math.round((value/max)*100));
  return <div style={{flex:1}}>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.tx2,marginBottom:5,fontWeight:600,letterSpacing:0.5}}><span>{label}</span><span style={{color}}>{value}/{max}</span></div>
    <div style={{height:8,background:"rgba(0,0,0,0.35)",borderRadius:99,overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)",boxShadow:"inset 0 1px 2px rgba(0,0,0,0.4)"}}>
      <div style={{height:"100%",width:p+"%",background:`linear-gradient(90deg, ${color}, ${color}dd)`,borderRadius:99,transition:"width 0.4s",boxShadow:glow?`0 0 12px ${glow}, 0 0 20px ${glow}`:`0 0 8px ${color}66`}}/>
    </div>
  </div>;
}

function RCard({r,nr,count,label,track}){
  const p=nr?Math.min(100,Math.round(((count-r.days)/(nr.days-r.days))*100)):100;
  return(
    <div style={{...glassTinted(r.color,0.05),borderRadius:18,padding:18,marginBottom:14,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg, transparent, ${r.color}, transparent)`}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:10,color:C.tx3,letterSpacing:2,textTransform:"uppercase",marginBottom:6,fontWeight:600}}>{label}</div>
          <div style={{fontSize:22,fontWeight:800,color:r.color,letterSpacing:-0.3}}>{r.tag}</div>
          <div style={{fontSize:12,color:C.tx2,marginTop:3}}>{count} zile</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:C.tx3,marginBottom:5,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Urmeaza</div>
          {nr?<><div style={{fontSize:14,fontWeight:700,color:nr.color}}>{nr.tag}</div><div style={{fontSize:11,color:C.tx2,marginTop:2}}>{nr.days-count} ramase</div></>:<div style={{fontSize:13,color:C.gold,fontWeight:700}}>MAX</div>}
        </div>
      </div>
      {nr&&<div style={{marginTop:14}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.tx3,marginBottom:5,letterSpacing:0.5}}><span>{r.tag}</span><span>{nr.tag}</span></div>
        <div style={{height:6,background:"rgba(0,0,0,0.4)",borderRadius:99,overflow:"hidden",border:"1px solid rgba(255,255,255,0.04)"}}>
          <div style={{height:"100%",width:p+"%",background:`linear-gradient(90deg, ${r.color}, ${r.color}cc)`,borderRadius:99,transition:"width 0.4s",boxShadow:`0 0 10px ${r.color}88`}}/>
        </div>
        <div style={{fontSize:10,color:C.tx3,marginTop:4,textAlign:"right",fontWeight:600}}>{p}%</div>
      </div>}
    </div>
  );
}

function Strip({ranks,count,cbg}){
  const r=getR(count,ranks);
  return <div style={{display:"flex",gap:4,marginBottom:14,width:"100%"}}>
    {ranks.map((x,i)=>{
      const u=count>=x.days,cur=r.index===i;
      return <div key={x.tag} style={{
        flex:1,minWidth:0,
        fontSize:"clamp(7px,1.7vw,9px)",fontWeight:700,padding:"5px 2px",borderRadius:99,
        background:cur?x.color:u?`${x.color}1a`:"rgba(255,255,255,0.03)",
        color:cur?"#fff":u?x.color:C.tx3,
        border:cur?`1px solid ${x.color}`:u?`1px solid ${x.color}44`:"1px solid rgba(255,255,255,0.06)",
        opacity:u?1:0.5,
        boxShadow:cur?`0 0 16px ${x.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`:"none",
        textAlign:"center",
        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
      }}>{x.tag}</div>;
    })}
  </div>;
}

function TRow({task,ac,onToggle,onDelete,onUp,onDown,onRename}){
  const [editing,setEditing]=useState(false);
  const [val,setVal]=useState(task.text);
  function save(){const t=val.trim();if(t&&onRename)onRename(t);setEditing(false);}
  return(
    <div style={{
      display:"flex",alignItems:"center",gap:10,
      ...(task.done?{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)"}:glass()),
      borderRadius:14,padding:"12px 14px",marginBottom:8,opacity:task.done?0.5:1,transition:"all 0.2s"
    }}>
      {onUp!==undefined&&<div style={{display:"flex",flexDirection:"column",gap:2}}>
        <button onClick={onUp} disabled={!onUp} style={{background:"none",border:"none",cursor:onUp?"pointer":"default",color:onUp?C.tx2:"rgba(255,255,255,0.15)",fontSize:11,lineHeight:1,padding:"1px 3px"}}>▲</button>
        <button onClick={onDown} disabled={!onDown} style={{background:"none",border:"none",cursor:onDown?"pointer":"default",color:onDown?C.tx2:"rgba(255,255,255,0.15)",fontSize:11,lineHeight:1,padding:"1px 3px"}}>▼</button>
      </div>}
      <button onClick={onToggle} style={{
        width:26,height:26,minWidth:26,borderRadius:"50%",
        border:task.done?"none":`2px solid ${ac}`,
        background:task.done?ac:"transparent",
        cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",
        boxShadow:task.done?`0 0 12px ${ac}88`:`0 0 0 4px ${ac}11`,
        transition:"all 0.2s",
      }}>{task.done?"✓":""}</button>
      {editing
        ?<input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")save();if(e.key==="Escape")setEditing(false);}} autoFocus style={{flex:1,padding:"6px 10px",borderRadius:10,border:`1px solid ${ac}`,background:C.ip,color:C.tx,fontSize:14,outline:"none"}}/>
        :<span style={{flex:1,fontSize:14,fontWeight:task.done?400:500,textDecoration:task.done?"line-through":"none",color:task.done?C.tx3:C.tx}}>{task.text}</span>}
      {editing
        ?<><button onClick={save} style={{background:"none",border:"none",cursor:"pointer",color:C.grn,fontSize:15,padding:"0 3px",fontWeight:700}}>✓</button><button onClick={()=>setEditing(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.tx3,fontSize:15,padding:"0 3px"}}>x</button></>
        :<>{onRename&&<button onClick={()=>{setVal(task.text);setEditing(true);}} style={{background:"none",border:"none",cursor:"pointer",color:C.tx3,fontSize:12,padding:"0 2px"}}>✎</button>}<button onClick={onDelete} style={{background:"none",border:"none",cursor:"pointer",color:C.tx3,fontSize:19,padding:"0 2px",lineHeight:1}}>×</button></>}
    </div>
  );
}

function DBadge({date,color,bg}){
  return <div style={{textAlign:"center",marginBottom:16}}>
    <div style={{display:"inline-block",...glassTinted(color,0.06),borderRadius:99,padding:"7px 20px"}}>
      <span style={{fontSize:12,color,fontWeight:700,letterSpacing:0.5}}>{fmt(date)}</span>
    </div>
  </div>;
}

function OKBadge({color,text}){
  return <div style={{textAlign:"center",padding:14,...glassTinted(color,0.08),borderRadius:14,color,fontSize:13,fontWeight:700,letterSpacing:0.3}}>✓ {text}</div>;
}

function LogBtn({can,done,tot,color,bdr,cbg,onClick}){
  return <button onClick={onClick} disabled={!can} style={{
    width:"100%",padding:14,
    ...(can?pillActive(color):pillInactive),
    borderRadius:14,fontSize:14,fontWeight:700,cursor:can?"pointer":"default",transition:"all 0.2s",
    letterSpacing:0.3,
  }}>{can?"✓ Marcheaza ziua ca finalizata":"Completeaza toate taskurile ("+done+"/"+tot+")"}</button>;
}

function Empty({emoji,text}){
  return <div style={{textAlign:"center",padding:"32px 16px",color:C.tx3,fontSize:14,...glass({}),borderRadius:14}}>
    <div style={{fontSize:32,marginBottom:8}}>{emoji}</div>{text}
  </div>;
}

function SetRow({s,si,ei,dk,iw,ac,isEve,onToggle,onEdit}){
  const [editing,setEditing]=useState(false);
  const [kg,setKg]=useState(s.weight);
  const [reps,setReps]=useState(s.reps);
  function saveEdit(){onEdit("weight",kg);onEdit("reps",reps);setEditing(false);}
  return(
    <div style={{marginBottom:5}}>
      <div style={{
        display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,
        background:dk?"rgba(34,197,94,0.10)":iw?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.05)",
        border:dk?"1px solid rgba(34,197,94,0.35)":`1px solid rgba(255,255,255,0.10)`,
        opacity:dk?0.75:1,
        boxShadow:dk?`0 0 12px ${C.grn}33, inset 0 1px 0 rgba(255,255,255,0.08)`:"inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>
        <button onClick={onToggle} style={{
          width:22,height:22,minWidth:22,borderRadius:"50%",
          border:dk?"none":`2px solid ${iw?"rgba(255,255,255,0.3)":ac}`,
          background:dk?C.grn:"transparent",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",flexShrink:0,
          boxShadow:dk?`0 0 10px ${C.grn}aa`:"none",
        }}>{dk?"✓":""}</button>
        <div style={{flex:1}}>
          <span style={{fontSize:10,fontWeight:700,color:iw?C.tx3:ac,marginRight:8,letterSpacing:0.8}}>{iw?"INCALZIRE":"SET"} {si+1}</span>
          <span style={{fontSize:13,color:dk?C.tx3:C.tx,textDecoration:dk?"line-through":"none"}}>{s.weight} x {s.reps} rep</span>
        </div>
        {!dk&&<button onClick={()=>{setKg(s.weight);setReps(s.reps);setEditing(v=>!v);}} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${editing?ac:"rgba(255,255,255,0.10)"}`,borderRadius:8,padding:"4px 9px",color:editing?ac:C.tx3,fontSize:11,cursor:"pointer",flexShrink:0}}>✎</button>}
      </div>
      {editing&&!dk&&(
        <div style={{display:"flex",gap:6,padding:"8px 10px",...glass({}),borderRadius:10,marginTop:4,alignItems:"center"}}>
          <div style={{flex:1}}><div style={{fontSize:10,color:C.tx3,marginBottom:3,fontWeight:600}}>Kg</div><input value={kg} onChange={e=>setKg(e.target.value)} style={{width:"100%",padding:"6px 10px",borderRadius:8,border:`1px solid ${ac}44`,background:C.ip,color:C.tx,fontSize:13,outline:"none",boxSizing:"border-box"}}/></div>
          <div style={{flex:1}}><div style={{fontSize:10,color:C.tx3,marginBottom:3,fontWeight:600}}>Rep</div><input value={reps} onChange={e=>setReps(e.target.value)} style={{width:"100%",padding:"6px 10px",borderRadius:8,border:`1px solid ${ac}44`,background:C.ip,color:C.tx,fontSize:13,outline:"none",boxSizing:"border-box"}}/></div>
          <button onClick={saveEdit} style={{...pillActive(ac),borderRadius:10,padding:"8px 14px",fontWeight:700,fontSize:13,cursor:"pointer",marginTop:14}}>✓</button>
        </div>
      )}
    </div>
  );
}

export default function App(){
  const [st,setSt]=useState(()=>{
    try{
      const s=localStorage.getItem("dq_v13");
      if(!s)return INIT;
      const p=JSON.parse(s);
      if(!p.daily)p.daily=INIT.daily;
      if(!p.work)p.work=INIT.work;
      if(!p.gym)p.gym=INIT.gym;
      if(!p.aff)p.aff=INIT.aff;
      if(!p.prayer)p.prayer=INIT.prayer;
      if(!p.rules)p.rules=INIT.rules;
      if(!p.sugar)p.sugar=INIT.sugar;
      if(!p.alcohol)p.alcohol=INIT.alcohol;
      if(!p.gym.completed)p.gym.completed={};
      return p;
    }catch{return INIT;}
  });
  const [tab,setTab]=useState("home");
  const [toast,setToast]=useState(null);

  useEffect(()=>{try{localStorage.setItem("dq_v13",JSON.stringify(st));}catch{}},[st]);
  useEffect(()=>{
    const t=tod();if(!st.setupDone)return;
    if(st.lastDate&&st.lastDate!==t){
      setSt(s=>{
        const ld=s.lastDate;
        const dailyOk=s.daily.lastDate===ld&&s.daily.tasks.length>0;
        const comp=s.gym.completed||{};
        const mp2=s.gym.mp||MP;
        const gymOk=mp2.filter(d=>!d.rest).every(d=>comp[d.id+"-morning"]&&comp[d.id+"-evening"]);
        const allOk=dailyOk&&gymOk;
        const hpLoss=allOk?0:HP_LOSS*2;
        const entries=[];
        if(!allOk){const m=[];if(!dailyOk)m.push("Daily");if(!gymOk)m.push("Gym");entries.push("-"+hpLoss+" HP -- "+m.join(", ")+" incomplete");}
        else entries.push("Zi completa! Streak "+(s.streak+1));
        return{...s,hp:Math.max(0,s.hp-hpLoss),streak:allOk?s.streak+1:0,lastDate:t,
          daily:{...s.daily,tasks:s.daily.tasks.map(x=>({...x,done:false}))},
          work:{...s.work,tasks:s.work.tasks.filter(x=>!x.done)},
          log:[...entries.map(e=>({text:e,date:t})),...s.log].slice(0,20)};
      });
    }else if(!st.lastDate){setSt(s=>({...s,lastDate:t}));}
  },[]);

  function showToast(msg,color){setToast({msg,color});setTimeout(()=>setToast(null),2200);}
  const getMp=()=>st.gym.mp||MP;
  const getEve=()=>st.gym.eve||EVE;
  const saveMp=p=>setSt(s=>({...s,gym:{...s.gym,mp:p}}));
  const saveEve=e=>setSt(s=>({...s,gym:{...s.gym,eve:e}}));
  const getAff=()=>st.aff.list||DEFAULT_AFF;
  const saveAff=l=>setSt(s=>({...s,aff:{...s.aff,list:l}}));

  if(!st.setupDone)return <Setup onSetup={n=>{if(!n.trim())return;setSt(s=>({...s,heroName:n.trim(),setupDone:true,lastDate:"2026-06-10"}));}}/>;

  const lv=getLvl(st.xp),xpC=st.xp-xpCurLvl(lv),xpN=xpNext(lv)-xpCurLvl(lv);
  const tabAcc=tab==="daily"?C.dA:tab==="work"?C.wA:tab==="gym"?C.gA:tab==="aff"?C.aA:tab==="prayer"?C.pA:tab==="rules"?C.rA:tab==="sugar"?C.sgA:tab==="alcohol"?C.alA:C.acL;

  // Atmospheric background — dark with soft radial glow tinted by active tab accent
  const bgStyle={
    background:`radial-gradient(ellipse 80% 50% at 50% 0%, ${tabAcc}22, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, ${tabAcc}11, transparent 60%), ${C.bg}`,
    minHeight:"100vh",
    transition:"background 0.4s",
  };

  const tabs=[["home","🏠",C.acL,"Home"],["daily","📅",C.dA,"Daily"],["work","💼",C.wA,"Work"],["gym","🏋",C.gA,"Gym"],["aff","🌟",C.aA,"Afirmatii"],["prayer","🙏",C.pA,"Rugaciune"],["rules","📜",C.rA,"Reguli"],["sugar","🍭",C.sgA,"Zahar"],["alcohol","🍷",C.alA,"Alcool"]];

  return(
    <div style={{fontFamily:"system-ui,-apple-system,sans-serif",color:C.tx,width:"100%",minHeight:"100vh",paddingBottom:80,...bgStyle}}>
      {toast&&<div style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",...pillActive(toast.color),padding:"10px 24px",borderRadius:99,fontWeight:700,fontSize:14,zIndex:999,pointerEvents:"none",letterSpacing:0.3}}>{toast.msg}</div>}

      {/* HEADER — glass card */}
      <div style={{padding:"18px 16px 14px"}}>
        <div style={{...glass(),borderRadius:20,padding:"16px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{fontSize:11,color:C.tx3,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600,marginBottom:2}}>Aventurier</div>
              <div style={{fontSize:20,fontWeight:800,letterSpacing:-0.3}}>{st.heroName}</div>
              <div style={{fontSize:12,color:tabAcc,fontWeight:600,marginTop:2}}>Nivel {lv}</div>
            </div>
            <div style={{textAlign:"right",...glassTinted(C.gold,0.08),borderRadius:14,padding:"6px 14px"}}>
              <div style={{fontSize:10,color:C.tx3,letterSpacing:1,fontWeight:600}}>STREAK</div>
              <div style={{fontSize:26,fontWeight:800,color:C.gold,lineHeight:1.1,textShadow:`0 0 18px ${C.gold}66`}}>{st.streak}</div>
              <div style={{fontSize:10,color:C.tx3}}>zile</div>
            </div>
          </div>
          <div style={{display:"flex",gap:12}}>
            <Bar label="HP" value={st.hp} max={MAX_HP} color={st.hp>50?C.grn:st.hp>25?C.ylw:C.red}/>
            <Bar label="XP" value={xpC} max={xpN} color={C.acL} glow={C.acG}/>
          </div>
          <div style={{fontSize:10,color:C.tx3,marginTop:6,textAlign:"right",letterSpacing:0.5}}>{st.xp} XP total</div>
        </div>
      </div>

      {/* TAB BAR — Neo-Tactile equal-width pills */}
      <div style={{padding:"0 16px 14px"}}>
        <div style={{display:"flex",gap:6,width:"100%"}}>
          {tabs.map(([k,l,c,name])=>{
            const active=tab===k;
            return <button key={k} onClick={()=>setTab(k)} style={{
              ...(active?pillActive(c):pillInactive),
              borderRadius:"50%",aspectRatio:"1 / 1",padding:0,
              cursor:"pointer",fontSize:18,fontWeight:700,
              display:"flex",alignItems:"center",justifyContent:"center",
              transition:"all 0.25s cubic-bezier(0.4,0,0.2,1)",
              flex:1,minWidth:0,
            }}>
              <span style={{fontSize:"clamp(14px,3.5vw,20px)",lineHeight:1}}>{l}</span>
            </button>;
          })}
        </div>
      </div>

      {tab==="home"&&<HomeTab st={st} setTab={setTab}/>}
      {tab==="daily"&&<DailyTab st={st} setSt={setSt} toast={showToast}/>}
      {tab==="work"&&<WorkTab st={st} setSt={setSt} toast={showToast}/>}
      {tab==="gym"&&<GymTab st={st} setSt={setSt} toast={showToast} getMp={getMp} getEve={getEve} saveMp={saveMp} saveEve={saveEve}/>}
      {tab==="aff"&&<AffTab st={st} setSt={setSt} toast={showToast} getAff={getAff} saveAff={saveAff}/>}
      {tab==="prayer"&&<PrayerTab st={st} setSt={setSt} toast={showToast}/>}
      {tab==="rules"&&<RulesTab st={st} setSt={setSt} toast={showToast}/>}
      {tab==="sugar"&&<HabitTab st={st} setSt={setSt} toast={showToast} habitKey="sugar" accent={C.sgA} tinted={C.sgCa} title="Fara zahar adaugat" subtitle="Zile fara zahar adaugat in alimentatie" emoji="🍭" tagline="O zi fara zahar adaugat"/>}
      {tab==="alcohol"&&<HabitTab st={st} setSt={setSt} toast={showToast} habitKey="alcohol" accent={C.alA} tinted={C.alCa} title="Fara alcool" subtitle="Zile fara consum de alcool" emoji="🍷" tagline="O zi fara alcool"/>}
      <div style={{padding:"16px 16px 0",textAlign:"center"}}>
        <button onClick={()=>{if(confirm("Resetezi tot progresul?"))setSt(INIT);}} style={{fontSize:11,color:C.tx3,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Reseteaza progresul</button>
      </div>
    </div>
  );
}

function DailyTab({st,setSt,toast}){
  const [nw,setNw]=useState("");const [sa,setSa]=useState(false);
  const d=st.daily,t=tod(),r=getR(d.daysDone,DR),nr=getNR(d.daysDone,DR);
  const dc=d.tasks.filter(x=>x.done).length,ad=d.tasks.length>0&&d.tasks.every(x=>x.done),al=d.lastDate===t,can=ad&&!al;
  const add=()=>{const tx=nw.trim();if(!tx)return;setSt(s=>({...s,daily:{...s.daily,tasks:[...s.daily.tasks,{id:uid(),text:tx,done:false}]}}));setNw("");setSa(false);toast("Task adaugat!",C.dA);};
  const tog=id=>setSt(s=>({...s,daily:{...s.daily,tasks:s.daily.tasks.map(x=>x.id===id?{...x,done:!x.done}:x)}}));
  const del=id=>setSt(s=>({...s,daily:{...s.daily,tasks:s.daily.tasks.filter(x=>x.id!==id)}}));
  const rename=(id,text)=>setSt(s=>({...s,daily:{...s.daily,tasks:s.daily.tasks.map(x=>x.id===id?{...x,text}:x)}}));
  const move=(idx,dir)=>setSt(s=>{const arr=[...s.daily.tasks];const ni=idx+dir;if(ni<0||ni>=arr.length)return s;[arr[idx],arr[ni]]=[arr[ni],arr[idx]];return{...s,daily:{...s.daily,tasks:arr}};});
  const log=()=>{if(!can)return;setSt(s=>{const nd=s.daily.daysDone+1,nr2=getR(nd,DR),or=getR(s.daily.daysDone,DR),ul=nr2.tag!==or.tag?[...(s.daily.rankUnlocks||[]),{tag:nr2.tag,date:t,color:nr2.color}]:(s.daily.rankUnlocks||[]);return{...s,daily:{...s.daily,daysDone:nd,lastDate:t,tasks:s.daily.tasks.map(x=>({...x,done:false})),rankUnlocks:ul}};});const nr2=getR(d.daysDone+1,DR);if(nr2.tag!==r.tag)toast("Rank nou: "+nr2.tag+"!",nr2.color);else toast("Zi bifata!",C.dA);};
  return(
    <div style={{padding:"4px 16px 4px"}}>
      <DBadge date={t} color={C.dA} bg={C.dCa}/>
      <RCard r={r} nr={nr} count={d.daysDone} label="Rank zilnic" track="#0a1612"/>
      <Strip ranks={DR} count={d.daysDone} cbg={C.dCa}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,marginTop:4}}>
        <div><div style={{fontWeight:700,fontSize:15}}>Taskuri de azi</div><div style={{fontSize:12,color:C.tx2,marginTop:2}}>{dc}/{d.tasks.length} bifate</div></div>
        <button onClick={()=>setSa(v=>!v)} style={{...(sa?pillInactive:pillActive(C.dA)),borderRadius:99,padding:"8px 16px",fontWeight:700,fontSize:13,cursor:"pointer",letterSpacing:0.3}}>{sa?"Anuleaza":"+ Task"}</button>
      </div>
      {sa&&<div style={{display:"flex",gap:8,marginBottom:12}}>
        <input value={nw} onChange={e=>setNw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Task zilnic..." autoFocus style={{flex:1,padding:"11px 14px",borderRadius:12,border:`1px solid ${C.dA}55`,background:C.ip,color:C.tx,fontSize:14,outline:"none"}}/>
        <button onClick={add} style={{...pillActive(C.dA),borderRadius:12,padding:"11px 18px",fontWeight:700,fontSize:14,cursor:"pointer"}}>Add</button>
      </div>}
      {d.tasks.length===0&&<Empty emoji="📅" text="Niciun task!"/>}
      {d.tasks.map((x,i)=><TRow key={x.id} task={x} ac={C.dA} onToggle={()=>tog(x.id)} onDelete={()=>del(x.id)} onUp={i>0?()=>move(i,-1):null} onDown={i<d.tasks.length-1?()=>move(i,1):null} onRename={t=>rename(x.id,t)}/>)}
      <div style={{marginTop:16}}>{al?<OKBadge color={C.dA} text="Zi inregistrata azi"/>:<LogBtn can={can} done={dc} tot={d.tasks.length} color={C.dA} bdr={C.dBd} cbg={C.dCa} onClick={log}/>}</div>
    </div>
  );
}

function WorkTab({st,setSt,toast}){
  const [nw,setNw]=useState("");const [sa,setSa]=useState(false);
  const w=st.work,t=tod();
  const dc=w.tasks.filter(x=>x.done).length;
  const add=()=>{const tx=nw.trim();if(!tx)return;setSt(s=>({...s,work:{...s.work,tasks:[...s.work.tasks,{id:uid(),text:tx,done:false}]}}));setNw("");setSa(false);toast("Task adaugat!",C.wA);};
  const tog=id=>setSt(s=>({...s,work:{...s.work,tasks:s.work.tasks.map(x=>x.id===id?{...x,done:!x.done}:x)}}));
  const del=id=>setSt(s=>({...s,work:{...s.work,tasks:s.work.tasks.filter(x=>x.id!==id)}}));
  return(
    <div style={{padding:"4px 16px 4px"}}>
      <DBadge date={t} color={C.wA} bg={C.wCa}/>
      <div style={{...glassTinted(C.wA,0.06),borderRadius:14,padding:14,marginBottom:14}}>
        <div style={{fontSize:12,color:C.tx2,lineHeight:1.6}}>Taskurile bifate se sterg automat la miezul noptii. Cele nebifate raman pentru ziua urmatoare.</div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><div style={{fontWeight:700,fontSize:15}}>Taskuri munca</div><div style={{fontSize:12,color:C.tx2,marginTop:2}}>{dc}/{w.tasks.length} bifate</div></div>
        <button onClick={()=>setSa(v=>!v)} style={{...(sa?pillInactive:pillActive(C.wA)),borderRadius:99,padding:"8px 16px",fontWeight:700,fontSize:13,cursor:"pointer",letterSpacing:0.3}}>{sa?"Anuleaza":"+ Task"}</button>
      </div>
      {sa&&<div style={{display:"flex",gap:8,marginBottom:12}}>
        <input value={nw} onChange={e=>setNw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Task de munca..." autoFocus style={{flex:1,padding:"11px 14px",borderRadius:12,border:`1px solid ${C.wA}55`,background:C.ip,color:C.tx,fontSize:14,outline:"none"}}/>
        <button onClick={add} style={{...pillActive(C.wA),borderRadius:12,padding:"11px 18px",fontWeight:700,fontSize:14,cursor:"pointer"}}>Add</button>
      </div>}
      {w.tasks.length===0&&<Empty emoji="💼" text="Niciun task!"/>}
      {w.tasks.map(x=><TRow key={x.id} task={x} ac={C.wA} onToggle={()=>tog(x.id)} onDelete={()=>del(x.id)}/>)}
    </div>
  );
}

function GymTab({st,setSt,toast,getMp,getEve,saveMp,saveEve}){
  const [view,setView]=useState("list");
  const [aDay,setADay]=useState(null);
  const [aSess,setASess]=useState(null);
  const [dn,setDn]=useState({});
  const [logged,setLogged]=useState(false);
  const [eData,setEData]=useState(null);
  const [eMode,setEMode]=useState(null);
  const g=st.gym,t=tod(),mp=getMp(),eve=getEve();
  const r=getR(g.sessionsDone,GR),nr=getNR(g.sessionsDone,GR);
  const compKey=(id,type)=>id+"-"+type;
  const isComp=(id,type)=>!!(g.completed&&g.completed[compKey(id,type)]);
  const resetComp=(id,type)=>setSt(s=>{const c={...(s.gym.completed||{})};delete c[compKey(id,type)];return{...s,gym:{...s.gym,completed:c}};});
  const startW=(day,type)=>{if(day.rest&&type==="morning"){toast("Ziua de odihna!",C.gA);return;}setADay(day);setASess(type==="morning"?day.exercises:eve);setDn({});setLogged(false);setView(type==="morning"?"mw":"ew");};
  const startE=(day,type)=>{setEData(type==="morning"?JSON.parse(JSON.stringify(day)):JSON.parse(JSON.stringify(eve)));setEMode(type);setView(type==="morning"?"me":"ee");};
  const saveE=()=>{if(eMode==="morning")saveMp(mp.map(d=>d.id===eData.id?eData:d));else saveEve(eData);setView("list");toast("Salvat!",C.gA);};
  const togS=(ei,si)=>{const k=ei+"-"+si;setDn(p=>({...p,[k]:!p[k]}));};
  const cDone=()=>Object.values(dn).filter(Boolean).length;
  const cTot=exs=>exs.reduce((a,e)=>a+e.sets.length,0);
  const finish=()=>{
    const type=view==="mw"?"morning":"evening";
    const ck=compKey(aDay.id,type);
    setSt(s=>{const ns=s.gym.sessionsDone+1,nr2=getR(ns,GR),or=getR(s.gym.sessionsDone,GR),ul=nr2.tag!==or.tag?[...(s.gym.rankUnlocks||[]),{tag:nr2.tag,date:t,color:nr2.color}]:(s.gym.rankUnlocks||[]),lbl=view==="mw"?"Dimineata "+aDay.name:"Antrenament Kettlebell CORE";return{...s,gym:{...s.gym,sessionsDone:ns,lastDate:t,rankUnlocks:ul,history:[{date:t,day:lbl},...(s.gym.history||[])].slice(0,50),completed:{...(s.gym.completed||{}),[ck]:true}}};});
    const nr2=getR(g.sessionsDone+1,GR);if(nr2.tag!==r.tag)toast("Gym Rank: "+nr2.tag+"!",nr2.color);else toast("Sesiune finalizata!",C.gA);setLogged(true);
  };
  const isEve=view==="ee"||view==="ew";
  const ac=isEve?C.eA:C.gA;

  if(view==="me"||view==="ee"){
    const exs=eMode==="evening"?eData:(eData&&eData.exercises)||[];
    const updEx=(ei,f,v)=>{if(eMode==="evening"){setEData(a=>{const b=[...a];b[ei]={...b[ei],[f]:v};return b;});}else{setEData(d=>{const e=[...d.exercises];e[ei]={...e[ei],[f]:v};return{...d,exercises:e};});}};
    const updS=(ei,si,f,v)=>{if(eMode==="evening"){setEData(a=>{const b=[...a];const s=[...b[ei].sets];s[si]={...s[si],[f]:v};b[ei]={...b[ei],sets:s};return b;});}else{setEData(d=>{const e=[...d.exercises];const s=[...e[ei].sets];s[si]={...s[si],[f]:v};e[ei]={...e[ei],sets:s};return{...d,exercises:e};});}};
    const addS=(ei)=>{const ns={type:"working",weight:"",reps:""};if(eMode==="evening"){setEData(a=>{const b=[...a];b[ei]={...b[ei],sets:[...b[ei].sets,ns]};return b;});}else{setEData(d=>{const e=[...d.exercises];e[ei]={...e[ei],sets:[...e[ei].sets,ns]};return{...d,exercises:e};});}};
    const rmS=(ei,si)=>{if(eMode==="evening"){setEData(a=>{const b=[...a];b[ei]={...b[ei],sets:b[ei].sets.filter((_,i)=>i!==si)};return b;});}else{setEData(d=>{const e=[...d.exercises];e[ei]={...e[ei],sets:e[ei].sets.filter((_,i)=>i!==si)};return{...d,exercises:e};});}};
    const addEx=()=>{const nx={name:"Exercitiu nou",sets:s3x("--")};if(eMode==="evening")setEData(a=>[...a,nx]);else setEData(d=>({...d,exercises:[...d.exercises,nx]}));};
    const rmEx=(ei)=>{if(eMode==="evening")setEData(a=>a.filter((_,i)=>i!==ei));else setEData(d=>({...d,exercises:d.exercises.filter((_,i)=>i!==ei)}));};
    const ip2={padding:"7px 10px",borderRadius:9,border:`1px solid ${ac}33`,background:C.ip,color:C.tx,fontSize:13,outline:"none"};
    return(
      <div style={{paddingBottom:16}}>
        <div style={{...glass(),borderRadius:0,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <button onClick={()=>setView("list")} style={{...pillInactive,borderRadius:99,padding:"7px 14px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Anuleaza</button>
          <span style={{fontSize:14,fontWeight:800,color:ac,letterSpacing:0.5}}>{isEve?"Seara":"Dimineata"}</span>
          <button onClick={saveE} style={{...pillActive(ac),borderRadius:99,padding:"7px 16px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Salveaza</button>
        </div>
        <div style={{padding:"4px 16px"}}>
          {eMode!=="evening"&&<div style={{marginBottom:12}}><div style={{fontSize:10,color:C.tx3,letterSpacing:1.5,textTransform:"uppercase",marginBottom:5,fontWeight:600}}>Numele zilei</div><input value={eData.name} onChange={e=>setEData(d=>({...d,name:e.target.value}))} style={{...ip2,width:"100%",boxSizing:"border-box",fontSize:15,fontWeight:700}}/></div>}
          {exs.map((ex,ei)=>(
            <div key={ei} style={{...glassTinted(ac,0.06),borderRadius:14,padding:"12px 14px",marginBottom:10}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}><input value={ex.name} onChange={e=>updEx(ei,"name",e.target.value)} style={{...ip2,flex:1,fontWeight:700,color:ac}}/><button onClick={()=>rmEx(ei)} style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:18,padding:"0 4px"}}>x</button></div>
              {ex.sets.map((s,si)=>(
                <div key={si} style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
                  <select value={s.type} onChange={e=>updS(ei,si,"type",e.target.value)} style={{...ip2,padding:"6px 4px",fontSize:11}}><option value="working">SET</option><option value="warmup">INCALZIRE</option></select>
                  <input value={s.weight} onChange={e=>updS(ei,si,"weight",e.target.value)} placeholder="Kg" style={{...ip2,flex:1}}/>
                  <input value={s.reps} onChange={e=>updS(ei,si,"reps",e.target.value)} placeholder="Rep" style={{...ip2,width:44,textAlign:"center"}}/>
                  <button onClick={()=>rmS(ei,si)} style={{background:"none",border:"none",cursor:"pointer",color:C.tx3,fontSize:16,lineHeight:1}}>x</button>
                </div>
              ))}
              <button onClick={()=>addS(ei)} style={{marginTop:6,background:"rgba(255,255,255,0.04)",border:`1px dashed ${ac}55`,color:C.tx2,borderRadius:10,padding:"6px 12px",fontSize:12,cursor:"pointer",width:"100%"}}>+ Set</button>
            </div>
          ))}
          <button onClick={addEx} style={{width:"100%",padding:13,background:"rgba(255,255,255,0.04)",border:`1px dashed ${ac}66`,color:ac,borderRadius:14,fontSize:14,fontWeight:700,cursor:"pointer",marginTop:6}}>+ Exercitiu nou</button>
        </div>
      </div>
    );
  }

  if(view==="mw"||view==="ew"){
    const title=view==="ew"?"Antrenament Kettlebell CORE":"Dimineata -- "+aDay.name;
    const tot=cTot(aSess),done=cDone(),pct=tot>0?Math.round((done/tot)*100):0,all=done===tot&&tot>0;
    return(
      <div style={{paddingBottom:16}}>
        <div style={{...glass(),borderRadius:0,padding:"14px 16px",marginBottom:14}}>
          <button onClick={()=>setView("list")} style={{...pillInactive,borderRadius:99,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:10,color:ac}}>← Inapoi</button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:10,color:C.tx3,letterSpacing:2,textTransform:"uppercase",fontWeight:600}}>ANTRENAMENT ACTIV</div><div style={{fontSize:16,fontWeight:800,color:ac,marginTop:2}}>{title}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:800,color:all?C.grn:ac,textShadow:`0 0 14px ${all?C.grn:ac}66`}}>{pct}%</div><div style={{fontSize:11,color:C.tx2}}>{done}/{tot}</div></div>
          </div>
          <div style={{marginTop:12,height:6,background:"rgba(0,0,0,0.4)",borderRadius:99,overflow:"hidden",border:"1px solid rgba(255,255,255,0.05)"}}><div style={{height:"100%",width:pct+"%",background:`linear-gradient(90deg, ${all?C.grn:ac}, ${all?C.grn:ac}cc)`,borderRadius:99,transition:"width 0.3s",boxShadow:`0 0 10px ${all?C.grn:ac}88`}}/></div>
          <div style={{textAlign:"center",marginTop:8,fontSize:12,color:C.tx2}}>{fmt(t)}</div>
        </div>
        <div style={{padding:"0 16px"}}>
          {aSess.map((ex,ei)=>(
            <div key={ei} style={{...glassTinted(ac,0.06),borderRadius:14,padding:"12px 14px",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:800,color:ac,marginBottom:10,textTransform:"uppercase",letterSpacing:0.8}}>{ex.name}</div>
              {ex.sets.map((s,si)=>(
                <SetRow key={si} s={s} si={si} ei={ei} dk={!!dn[ei+"-"+si]} iw={s.type==="warmup"} ac={ac} isEve={isEve}
                  onToggle={()=>togS(ei,si)}
                  onEdit={(f,v)=>setASess(prev=>prev.map((e,i)=>i===ei?{...e,sets:e.sets.map((st,j)=>j===si?{...st,[f]:v}:st)}:e))}
                />
              ))}
            </div>
          ))}
          <div style={{marginTop:10}}>{logged?<OKBadge color={C.grn} text="Sesiune inregistrata!"/>:<button onClick={finish} disabled={!all} style={{width:"100%",padding:14,...(all?pillActive(ac):pillInactive),borderRadius:14,fontSize:14,fontWeight:700,cursor:all?"pointer":"default",transition:"all 0.2s",letterSpacing:0.3}}>{all?"Finalizeaza":"Completeaza toate seturile ("+done+"/"+tot+")"}</button>}</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:"4px 16px 4px"}}>
      <DBadge date={t} color={C.gA} bg={C.gCa}/>
      <RCard r={r} nr={nr} count={g.sessionsDone} label="Gym Rank" track="#110a00"/>
      <Strip ranks={GR} count={g.sessionsDone} cbg={C.gCa}/>
      <div style={{fontWeight:700,fontSize:15,marginBottom:12,marginTop:4}}>Program Saptamanal</div>
      {mp.map(day=>(
        <div key={day.id} style={{...glassTinted(C.gA,0.05),borderRadius:14,padding:"12px 14px",marginBottom:10,opacity:day.rest?0.6:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:day.rest?0:12}}>
            <div style={{fontSize:22,lineHeight:1}}>{day.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:800,color:day.rest?C.tx3:C.tx,letterSpacing:-0.2}}>Ziua {day.id} -- {day.name}</div>
              {!day.rest&&<div style={{fontSize:11,color:C.tx2,marginTop:2}}>{day.exercises.length} exercitii</div>}
            </div>
          </div>
          {!day.rest&&(
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:C.gA,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Dimineata</div>
                {isComp(day.id,"morning")
                  ?<div style={{display:"flex",gap:6}}>
                    <div style={{flex:1,padding:"9px 0",...glassTinted(C.grn,0.10),borderRadius:99,color:C.grn,fontSize:12,fontWeight:700,textAlign:"center"}}>✓ Complet</div>
                    <button onClick={()=>resetComp(day.id,"morning")} style={{padding:"9px 12px",...pillInactive,borderRadius:99,fontSize:12,cursor:"pointer"}}>↺</button>
                  </div>
                  :<div style={{display:"flex",gap:6}}>
                    <button onClick={()=>startW(day,"morning")} style={{flex:1,padding:"9px 0",...pillActive(C.gA),borderRadius:99,fontSize:12,fontWeight:700,cursor:"pointer"}}>Start</button>
                    <button onClick={()=>startE(day,"morning")} style={{padding:"9px 12px",...pillInactive,borderRadius:99,fontSize:12,cursor:"pointer"}}>✎</button>
                  </div>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:C.eA,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Seara</div>
                {isComp(day.id,"evening")
                  ?<div style={{display:"flex",gap:6}}>
                    <div style={{flex:1,padding:"9px 0",...glassTinted(C.grn,0.10),borderRadius:99,color:C.grn,fontSize:12,fontWeight:700,textAlign:"center"}}>✓ Complet</div>
                    <button onClick={()=>resetComp(day.id,"evening")} style={{padding:"9px 12px",...pillInactive,borderRadius:99,fontSize:12,cursor:"pointer"}}>↺</button>
                  </div>
                  :<div style={{display:"flex",gap:6}}>
                    <button onClick={()=>startW(day,"evening")} style={{flex:1,padding:"9px 0",...pillActive(C.eA),borderRadius:99,fontSize:12,fontWeight:700,cursor:"pointer"}}>Start</button>
                    <button onClick={()=>startE(day,"evening")} style={{padding:"9px 12px",...pillInactive,borderRadius:99,fontSize:12,cursor:"pointer"}}>✎</button>
                  </div>}
              </div>
            </div>
          )}
        </div>
      ))}
      {g.history?.length>0&&<div style={{marginTop:18}}>
        <div style={{fontSize:10,color:C.tx3,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10,fontWeight:600}}>Istoric</div>
        <div style={{...glass(),borderRadius:14,padding:"4px 14px"}}>
          {g.history.slice(0,5).map((h,i)=><div key={i} style={{fontSize:12,color:C.tx2,padding:"8px 0",borderBottom:i<4?"1px solid rgba(255,255,255,0.06)":"none"}}>{h.day} -- {h.date}</div>)}
        </div>
      </div>}
    </div>
  );
}

function AffTab({st,setSt,toast,getAff,saveAff}){
  const aff=getAff();
  const a=st.aff||{};
  const [refs,setRefs]=useState(()=>{const m={};aff.forEach(x=>{m[x.id]="";});return m;});
  const [checks,setChecks]=useState(()=>{const m={};aff.forEach(x=>{m[x.id]=false;});return m;});
  const [editId,setEditId]=useState(null);
  const [editVal,setEditVal]=useState("");
  const [timeLeft,setTimeLeft]=useState(null);
  const [vibrated,setVibrated]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [newText,setNewText]=useState("");

  useEffect(()=>{
    const tick=()=>{
      const ts=a.timerStart;
      const hour=new Date().getHours();
      const inWindow=hour>=AFF_START_HOUR&&hour<AFF_END_HOUR;
      if(!ts){setTimeLeft(null);return;}
      if(!inWindow){setTimeLeft(-1);return;}
      const left=AFF_INTERVAL-Math.floor((Date.now()-ts)/1000);
      if(left<=0){setTimeLeft(0);if(!vibrated){setVibrated(true);if(navigator.vibrate)navigator.vibrate([300,100,300,100,500]);toast("Timp pentru afirmatii!",C.aA);}}
      else{setVibrated(false);setTimeLeft(left);}
    };
    tick();const iv=setInterval(tick,1000);return()=>clearInterval(iv);
  },[a.timerStart]);

  const fmtT=s=>{if(s===null)return"--:--:--";const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;return[h,m,ss].map(x=>String(x).padStart(2,"0")).join(":");};
  const ready=timeLeft===0;
  const paused=timeLeft===-1;
  const tc=ready?C.aA:timeLeft!==null&&timeLeft<600?C.ylw:C.tx2;
  const allChecked=aff.every(x=>checks[x.id]);

  useEffect(()=>{
    if(allChecked&&aff.length>0){
      setSt(s=>({...s,aff:{...s.aff,sessionsDone:(s.aff?.sessionsDone||0)+1,lastSession:tod(),timerStart:Date.now()}}));
      setVibrated(false);toast("Sesiune completa! Timer pornit.",C.aA);
      setTimeout(()=>{setRefs(()=>{const m={};aff.forEach(x=>{m[x.id]="";});return m;});setChecks(()=>{const m={};aff.forEach(x=>{m[x.id]=false;});return m;});},1500);
    }
  },[allChecked]);

  function saveEdit(id){const v=editVal.trim();if(!v)return;saveAff(aff.map(x=>x.id===id?{...x,text:v}:x));setEditId(null);toast("Actualizat!",C.aA);}

  function addAff(){
    const v=newText.trim();if(!v)return;
    const newId="a"+Date.now();
    saveAff([...aff,{id:newId,text:v}]);
    setRefs(p=>({...p,[newId]:""}));
    setChecks(p=>({...p,[newId]:false}));
    setNewText("");setShowAdd(false);
    toast("Afirmatie adaugata!",C.aA);
  }

  function deleteAff(id){
    saveAff(aff.filter(x=>x.id!==id));
    setRefs(p=>{const n={...p};delete n[id];return n;});
    setChecks(p=>{const n={...p};delete n[id];return n;});
    toast("Afirmatie stearsa!",C.aA);
  }

  const doneCount=aff.filter(x=>checks[x.id]).length;

  return(
    <div style={{padding:"4px 16px 4px"}}>
      <DBadge date={tod()} color={C.aA} bg={C.aCa}/>
      <div style={{...glassTinted(C.aA,ready?0.10:0.06),borderRadius:18,padding:18,marginBottom:16,position:"relative",overflow:"hidden",...(ready?neonRing(C.aA):{})}}>
        {ready&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg, transparent, ${C.aA}, transparent)`}}/>}
        <div style={{textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:10,color:C.tx3,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Urmatoarea sesiune in</div>
          <div style={{fontSize:38,fontWeight:800,color:tc,letterSpacing:3,textShadow:ready?`0 0 24px ${C.aA}aa, 0 0 40px ${C.aA}66`:"none"}}>{ready?"ACUM!":paused?"ZZZ":fmtT(timeLeft)}</div>
          {ready&&<div style={{fontSize:13,color:C.aA,marginTop:8,fontWeight:600}}>E timpul sa iti spui afirmatiile!</div>}
          {paused&&<div style={{fontSize:12,color:C.tx3,marginTop:8}}>In afara intervalului 06:00 - 00:00</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6}}>
          <div style={{fontSize:11,color:C.tx3,fontWeight:600}}>Sesiuni totale: {a.sessionsDone||0}</div>
          <div style={{fontSize:11,color:C.aA,fontWeight:700}}>{doneCount}/{aff.length} bifate</div>
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:15,color:C.tx}}>Afirmatiile mele ({aff.length})</div>
        <button onClick={()=>setShowAdd(v=>!v)} style={{...(showAdd?pillInactive:pillActive(C.aA)),borderRadius:99,padding:"7px 14px",fontWeight:700,fontSize:12,cursor:"pointer",letterSpacing:0.3,color:showAdd?C.tx3:"#001a16"}}>{showAdd?"Anuleaza":"+ Adauga"}</button>
      </div>

      {showAdd&&(
        <div style={{...glassTinted(C.aA,0.07),borderRadius:14,padding:14,marginBottom:14}}>
          <textarea value={newText} onChange={e=>setNewText(e.target.value)} placeholder="Scrie noua afirmatie..." rows={2} autoFocus style={{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:10,border:`1px solid ${C.aA}55`,background:C.ip,color:C.tx,fontSize:13,outline:"none",resize:"none",lineHeight:1.5,fontFamily:"system-ui,sans-serif",marginBottom:10}}/>
          <button onClick={addAff} style={{width:"100%",padding:"10px 0",...pillActive(C.aA),borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",color:"#001a16"}}>Adauga afirmatia</button>
        </div>
      )}

      {aff.map((item,i)=>{
        const checked=checks[item.id]||false;const hasText=(refs[item.id]||"").trim().length>0;
        return(
          <div key={item.id} style={{...glassTinted(C.aA,checked?0.04:0.06),borderRadius:14,padding:14,marginBottom:12,opacity:checked?0.7:1,...(checked?{border:`1px solid ${C.aA}55`}:{})}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
              <div style={{width:26,height:26,minWidth:26,borderRadius:"50%",background:`${C.aA}22`,border:`1px solid ${C.aA}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:C.aA,flexShrink:0,boxShadow:`0 0 8px ${C.aA}33`}}>{i+1}</div>
              {editId===item.id
                ?<div style={{flex:1,display:"flex",gap:6,alignItems:"flex-start"}}>
                  <textarea value={editVal} onChange={e=>setEditVal(e.target.value)} autoFocus rows={2} style={{flex:1,padding:"7px 10px",borderRadius:10,border:`1px solid ${C.aA}`,background:C.ip,color:C.tx,fontSize:14,outline:"none",resize:"none",lineHeight:1.5,fontFamily:"system-ui,sans-serif"}}/>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <button onClick={()=>saveEdit(item.id)} style={{...pillActive(C.grn),borderRadius:8,padding:"5px 8px",fontSize:12,cursor:"pointer",fontWeight:700}}>✓</button>
                    <button onClick={()=>setEditId(null)} style={{...pillInactive,borderRadius:8,padding:"5px 8px",fontSize:12,cursor:"pointer"}}>x</button>
                  </div>
                </div>
                :<div style={{flex:1,display:"flex",alignItems:"flex-start",gap:6}}>
                  <span style={{flex:1,fontSize:14,fontWeight:600,color:checked?C.tx3:C.aA,lineHeight:1.6,fontStyle:"italic",textDecoration:checked?"line-through":"none"}}>"{item.text}"</span>
                  {!checked&&<button onClick={()=>{setEditId(item.id);setEditVal(item.text);}} style={{background:"none",border:"none",cursor:"pointer",color:C.tx3,fontSize:13,padding:"0 2px",flexShrink:0}}>✎</button>}
                  {!checked&&<button onClick={()=>deleteAff(item.id)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(239,68,68,0.6)",fontSize:15,padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>}
                </div>}
            </div>
            <div style={{marginLeft:36}}>
              <div style={{fontSize:10,color:C.tx3,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6,fontWeight:600}}>Rescrie cu propriile cuvinte</div>
              <textarea value={refs[item.id]||""} onChange={e=>setRefs(p=>({...p,[item.id]:e.target.value}))} placeholder="Scrie afirmatia ta..." rows={2} disabled={checked} style={{width:"100%",boxSizing:"border-box",padding:"9px 12px",borderRadius:10,border:`1px solid ${hasText?C.aA+"66":"rgba(255,255,255,0.10)"}`,background:C.ip,color:C.tx,fontSize:13,outline:"none",resize:"none",lineHeight:1.5,fontFamily:"system-ui,sans-serif",opacity:checked?0.6:1}}/>
              <button onClick={()=>setChecks(p=>({...p,[item.id]:!p[item.id]}))} disabled={!hasText&&!checked} style={{marginTop:10,width:"100%",padding:"9px 0",...(checked?pillActive(C.aA):hasText?pillActive(C.aA):pillInactive),borderRadius:10,fontSize:13,fontWeight:700,cursor:(hasText||checked)?"pointer":"default",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:(checked||hasText)?"#001a16":C.tx3}}>
                <div style={{width:18,height:18,borderRadius:"50%",border:checked?"none":`2px solid ${hasText?"#001a16":C.tx3}`,background:checked?"#001a16":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.aA}}>{checked?"✓":""}</div>
                {checked?"Bifata":"Bifeaza afirmatia"}
              </button>
            </div>
          </div>
        );
      })}
      <div style={{marginBottom:20,textAlign:"center",fontSize:12,color:C.tx3,padding:"10px"}}>{allChecked?"Timer pornit automat!":"Bifeaza toate afirmatiile pentru a porni timer-ul"}</div>
    </div>
  );
}

function PrayerTab({st,setSt,toast}){
  const p=st.prayer||INIT.prayer;
  const t=tod();
  const pTexts=p.prayerTexts||{morning:PM_TEXT,evening:PE_TEXT};
  const [editId,setEditId]=useState(null);
  const [editVal,setEditVal]=useState("");
  const [openId,setOpenId]=useState(null);
  const isToday=p.lastDate===t;
  const mDone=isToday&&p.morning;
  const eDone=isToday&&p.evening;
  const bothDone=mDone&&eDone;

  function toggle(type){
    setSt(s=>{
      const pr=s.prayer||INIT.prayer;
      const wasToday=pr.lastDate===t;
      const newM=type==="morning"?(wasToday?!pr.morning:true):(wasToday?pr.morning:false);
      const newE=type==="evening"?(wasToday?!pr.evening:true):(wasToday?pr.evening:false);
      const wasBoth=wasToday&&pr.morning&&pr.evening;
      const isBoth=newM&&newE;
      const nd=isBoth&&!wasBoth?pr.daysDone+1:pr.daysDone;
      if(isBoth&&!wasBoth)toast("Zi de rugaciune completa! ("+nd+")",C.pA);
      return{...s,prayer:{...pr,morning:newM,evening:newE,lastDate:t,daysDone:nd}};
    });
  }

  function saveEdit(id){
    const v=editVal.trim();if(!v)return;
    const updated={...pTexts,[id]:v};
    setSt(s=>({...s,prayer:{...s.prayer,prayerTexts:updated}}));
    setEditId(null);toast("Rugaciune actualizata!",C.pA);
  }

  const items=[
    {key:"morning",label:"Rugaciune de Dimineata",emoji:"🌅",done:mDone},
    {key:"evening",label:"Rugaciune de Seara",emoji:"🌙",done:eDone},
  ];

  const openItem=openId?items.find(x=>x.key===openId):null;

  return(
    <div style={{padding:"4px 16px 4px"}}>
      <DBadge date={t} color={C.pA} bg={C.pCa}/>

      {openItem&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setOpenId(null)}>
          <div style={{...glassTinted(C.pA,0.08),borderRadius:22,padding:26,maxWidth:400,width:"100%",maxHeight:"80vh",overflowY:"auto",position:"relative",...neonRing(C.pA)}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <span style={{fontSize:26}}>{openItem.emoji}</span>
              <div style={{flex:1,fontSize:16,fontWeight:800,color:C.pA,letterSpacing:-0.2}}>{openItem.label}</div>
              <button onClick={()=>setOpenId(null)} style={{...pillInactive,borderRadius:"50%",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,padding:0}}>×</button>
            </div>
            {editId===openItem.key
              ?<div>
                <textarea value={editVal} onChange={e=>setEditVal(e.target.value)} rows={8} autoFocus style={{width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:12,border:`1px solid ${C.pA}66`,background:C.ip,color:C.tx,fontSize:14,outline:"none",resize:"none",lineHeight:1.7,fontFamily:"system-ui,sans-serif",marginBottom:12}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>saveEdit(openItem.key)} style={{flex:1,padding:"11px 0",...pillActive(C.pA),borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>Salveaza</button>
                  <button onClick={()=>setEditId(null)} style={{padding:"11px 18px",...pillInactive,borderRadius:10,fontSize:14,cursor:"pointer"}}>Anuleaza</button>
                </div>
              </div>
              :<div>
                <p style={{margin:"0 0 22px",fontSize:15,color:C.tx,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{pTexts[openItem.key]}</p>
                <div style={{display:"flex",gap:8,flexDirection:"column"}}>
                  {!openItem.done&&<button onClick={()=>{setEditId(openItem.key);setEditVal(pTexts[openItem.key]);}} style={{width:"100%",padding:"10px 0",...pillInactive,borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer"}}>✎ Editeaza rugaciunea</button>}
                  <button onClick={()=>{toggle(openItem.key);setOpenId(null);}} style={{width:"100%",padding:"13px 0",...(openItem.done?glassTinted(C.pA,0.10):pillActive(C.pA)),borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,color:openItem.done?C.pA:"#fff",border:`1px solid ${C.pA}`}}>
                    <div style={{width:22,height:22,borderRadius:"50%",border:openItem.done?"none":"2px solid #fff",background:openItem.done?C.pA:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",flexShrink:0,boxShadow:openItem.done?`0 0 10px ${C.pA}aa`:"none"}}>{openItem.done?"✓":""}</div>
                    {openItem.done?"Am spus rugaciunea ✓":"Am spus rugaciunea"}
                  </button>
                </div>
              </div>}
          </div>
        </div>
      )}

      <div style={{...glassTinted(C.pA,bothDone?0.10:0.06),borderRadius:18,padding:18,marginBottom:16,position:"relative",overflow:"hidden",...(bothDone?neonRing(C.pA):{})}}>
        {bothDone&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg, transparent, ${C.pA}, transparent)`}}/>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,color:C.tx3,letterSpacing:2,textTransform:"uppercase",marginBottom:5,fontWeight:600}}>Zile de rugaciune</div>
            <div style={{fontSize:32,fontWeight:800,color:C.pA,letterSpacing:-0.5,textShadow:bothDone?`0 0 16px ${C.pA}66`:"none"}}>{p.daysDone||0}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:13,color:bothDone?C.pA:C.tx3,fontWeight:700}}>{bothDone?"Zi completa":""}</div>
            <div style={{fontSize:12,color:C.tx2,marginTop:4}}>{(mDone?1:0)+(eDone?1:0)}/2 bifate</div>
          </div>
        </div>
      </div>

      <div style={{fontWeight:700,fontSize:15,marginBottom:12,color:C.tx}}>Rugaciunile mele</div>
      {items.map(item=>(
        <div key={item.key} onClick={()=>setOpenId(item.key)} style={{...glassTinted(C.pA,item.done?0.08:0.05),borderRadius:14,padding:"16px",marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:14,transition:"all 0.2s",...(item.done?{border:`1px solid ${C.pA}66`}:{})}}>
          <span style={{fontSize:28,lineHeight:1}}>{item.emoji}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:item.done?C.pA:C.tx,marginBottom:4,letterSpacing:-0.2}}>{item.label}</div>
            <div style={{fontSize:12,color:C.tx3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:220}}>{pTexts[item.key]}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            {item.done
              ?<div style={{width:30,height:30,borderRadius:"50%",background:C.pA,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:"#fff",boxShadow:`0 0 14px ${C.pA}aa`}}>✓</div>
              :<div style={{width:30,height:30,borderRadius:"50%",border:`2px solid ${C.pA}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.pA,boxShadow:`0 0 0 4px ${C.pA}11`}}>›</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function CircleProg({pct,color,label,emoji,onClick}){
  const r=28;
  const circ=2*3.14159*r;
  const filled=(pct/100)*circ;
  return(
    <div onClick={onClick} style={{textAlign:"center",cursor:"pointer",padding:"8px 4px",borderRadius:14,transition:"all 0.2s"}}>
      <div style={{position:"relative",width:70,height:70,margin:"0 auto"}}>
        <svg width={70} height={70} viewBox="0 0 70 70" style={{filter:pct>0?`drop-shadow(0 0 8px ${color}88)`:"none"}}>
          <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5"/>
          <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={filled+" "+(circ-filled)}
            strokeLinecap="round"
            transform="rotate(-90 35 35)"/>
          <text x="35" y="40" textAnchor="middle" fill={color} fontSize="13" fontWeight="800">{pct}%</text>
        </svg>
      </div>
      <div style={{fontSize:18,marginTop:4}}>{emoji}</div>
      <div style={{fontSize:11,color:C.tx2,marginTop:2,fontWeight:600,letterSpacing:0.3}}>{label}</div>
    </div>
  );
}

function HomeTab({st,setTab}){
  const t=tod();
  const d=st.daily;
  const w=st.work;
  const g=st.gym;
  const pr=st.prayer;
  const aff=st.aff;
  const dPct=d.tasks.length>0?Math.round((d.tasks.filter(x=>x.done).length/d.tasks.length)*100):0;
  const wPct=w.tasks.length>0?Math.round((w.tasks.filter(x=>x.done).length/w.tasks.length)*100):0;
  const mp=g.mp||MP;
  const nonRest=mp.filter(x=>!x.rest);
  const comp=g.completed||{};
  const gymDone=nonRest.filter(x=>comp[x.id+"-morning"]&&comp[x.id+"-evening"]).length;
  const gPct=nonRest.length>0?Math.round((gymDone/nonRest.length)*100):0;
  const isToday=pr.lastDate===t;
  const prPct=Math.round(((isToday&&pr.morning?1:0)+(isToday&&pr.evening?1:0))/2*100);
  const affPct=aff.lastSession===t?100:0;
  const rules=st.rules?.list||DEFAULT_RULES;
  const rPct=rules.length>0?100:0;
  const sg=st.sugar||INIT.sugar;
  const al=st.alcohol||INIT.alcohol;
  const sgPct=sg.lastDate===t&&sg.done?100:0;
  const alPct=al.lastDate===t&&al.done?100:0;
  const lv=getLvl(st.xp);
  const xpC=st.xp-xpCurLvl(lv);
  const xpN=xpNext(lv)-xpCurLvl(lv);
  const cats=[
    {key:"daily",emoji:"📅",label:"Daily",pct:dPct,color:C.dA},
    {key:"work",emoji:"💼",label:"Work",pct:wPct,color:C.wA},
    {key:"gym",emoji:"🏋",label:"Gym",pct:gPct,color:C.gA},
    {key:"aff",emoji:"🌟",label:"Afirmatii",pct:affPct,color:C.aA},
    {key:"prayer",emoji:"🙏",label:"Rugaciune",pct:prPct,color:C.pA},
    {key:"rules",emoji:"📜",label:"Reguli",pct:rPct,color:C.rA},
    {key:"sugar",emoji:"🍭",label:"Fara zahar",pct:sgPct,color:C.sgA},
    {key:"alcohol",emoji:"🍷",label:"Fara alcool",pct:alPct,color:C.alA},
  ];
  const totalPct=Math.round(cats.reduce((a,c)=>a+c.pct,0)/cats.length);
  return(
    <div style={{padding:"4px 16px 4px"}}>
      <DBadge date={t} color={C.acL} bg={C.ca}/>
      <div style={{...glass(),borderRadius:18,padding:18,marginBottom:18,display:"flex",alignItems:"center",gap:16}}>
        <CircleProg pct={totalPct} color={C.acL} label="Total" emoji="⚔️" onClick={()=>{}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:800,color:C.tx,marginBottom:4,letterSpacing:-0.3}}>{st.heroName}</div>
          <div style={{fontSize:12,color:C.acL,marginBottom:10,fontWeight:600}}>Nivel {lv} Aventurier</div>
          <div style={{fontSize:11,color:C.tx3,marginBottom:4,letterSpacing:0.5,fontWeight:600}}>XP {xpC}/{xpN}</div>
          <div style={{height:6,background:"rgba(0,0,0,0.4)",borderRadius:99,overflow:"hidden",border:"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{height:"100%",width:Math.round((xpC/xpN)*100)+"%",background:`linear-gradient(90deg, ${C.acL}, ${C.acL}dd)`,borderRadius:99,boxShadow:`0 0 10px ${C.acL}88`}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
            <div style={{fontSize:12,color:C.tx2}}>Streak <span style={{color:C.gold,fontWeight:800}}>{st.streak}</span> zile</div>
            <div style={{fontSize:12,color:st.hp>50?C.grn:st.hp>25?C.ylw:C.red,fontWeight:700}}>HP {st.hp}/{MAX_HP}</div>
          </div>
        </div>
      </div>
      <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.tx,letterSpacing:-0.2}}>Progres de azi</div>
      <div style={{...glass(),borderRadius:18,padding:"18px 10px",marginBottom:20,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,placeItems:"center"}}>
        <CircleProg pct={cats[0].pct} color={cats[0].color} label={cats[0].label} emoji={cats[0].emoji} onClick={()=>setTab(cats[0].key)}/>
        <CircleProg pct={cats[1].pct} color={cats[1].color} label={cats[1].label} emoji={cats[1].emoji} onClick={()=>setTab(cats[1].key)}/>
        <CircleProg pct={cats[2].pct} color={cats[2].color} label={cats[2].label} emoji={cats[2].emoji} onClick={()=>setTab(cats[2].key)}/>
        <CircleProg pct={cats[3].pct} color={cats[3].color} label={cats[3].label} emoji={cats[3].emoji} onClick={()=>setTab(cats[3].key)}/>
        <div style={{textAlign:"center",padding:"8px 4px"}}>
          <div style={{width:70,height:70,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{
              width:65,height:65,borderRadius:"50%",
              background:`radial-gradient(circle, ${C.acL}33, ${C.acL}11)`,
              border:`1px solid ${C.acL}55`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:34,
              boxShadow:`0 0 18px ${C.acL}44, inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}>🥷</div>
          </div>
          <div style={{height:22,marginTop:4}}/>
          <div style={{fontSize:11,color:C.acL,marginTop:2,fontWeight:700,letterSpacing:0.3}}>{st.heroName}</div>
        </div>
        <CircleProg pct={cats[4].pct} color={cats[4].color} label={cats[4].label} emoji={cats[4].emoji} onClick={()=>setTab(cats[4].key)}/>
        <CircleProg pct={cats[5].pct} color={cats[5].color} label={cats[5].label} emoji={cats[5].emoji} onClick={()=>setTab(cats[5].key)}/>
        <CircleProg pct={cats[6].pct} color={cats[6].color} label={cats[6].label} emoji={cats[6].emoji} onClick={()=>setTab(cats[6].key)}/>
        <CircleProg pct={cats[7].pct} color={cats[7].color} label={cats[7].label} emoji={cats[7].emoji} onClick={()=>setTab(cats[7].key)}/>
      </div>
    </div>
  );
}

function RulesTab({st,setSt,toast}){
  const rules=st.rules?.list||DEFAULT_RULES;
  const [editId,setEditId]=useState(null);
  const [editVal,setEditVal]=useState("");
  const [showAdd,setShowAdd]=useState(false);
  const [newText,setNewText]=useState("");
  function saveRules(l){setSt(s=>({...s,rules:{...s.rules,list:l}}));}
  function saveEdit(id){const v=editVal.trim();if(!v)return;saveRules(rules.map(x=>x.id===id?{...x,text:v}:x));setEditId(null);toast("Regula actualizata!",C.rA);}
  function addRule(){const v=newText.trim();if(!v)return;saveRules([...rules,{id:"r"+Date.now(),text:v}]);setNewText("");setShowAdd(false);toast("Regula adaugata!",C.rA);}
  function deleteRule(id){saveRules(rules.filter(x=>x.id!==id));}
  return(
    <div style={{padding:"4px 16px 4px"}}>
      <DBadge date={tod()} color={C.rA} bg={C.rCa}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontWeight:700,fontSize:15,color:C.tx}}>Regulile mele ({rules.length})</div>
        <button onClick={()=>setShowAdd(v=>!v)} style={{...(showAdd?pillInactive:pillActive(C.rA)),borderRadius:99,padding:"7px 14px",fontWeight:700,fontSize:12,cursor:"pointer",letterSpacing:0.3,color:showAdd?C.tx3:"#1a1400"}}>{showAdd?"Anuleaza":"+ Adauga"}</button>
      </div>
      {showAdd&&(
        <div style={{...glassTinted(C.rA,0.07),borderRadius:14,padding:14,marginBottom:14}}>
          <textarea value={newText} onChange={e=>setNewText(e.target.value)} placeholder="Scrie noua regula..." rows={2} autoFocus style={{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:10,border:`1px solid ${C.rA}55`,background:C.ip,color:C.tx,fontSize:13,outline:"none",resize:"none",lineHeight:1.5,fontFamily:"system-ui,sans-serif",marginBottom:10}}/>
          <button onClick={addRule} style={{width:"100%",padding:"10px 0",...pillActive(C.rA),borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",color:"#1a1400"}}>Adauga regula</button>
        </div>
      )}
      {rules.length===0&&<Empty emoji="📜" text="Nicio regula. Adauga prima ta regula!"/>}
      {rules.map((rule,i)=>(
        <div key={rule.id} style={{...glassTinted(C.rA,0.05),borderRadius:14,padding:14,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{width:26,height:26,minWidth:26,borderRadius:"50%",background:`${C.rA}22`,border:`1px solid ${C.rA}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:C.rA,flexShrink:0,boxShadow:`0 0 8px ${C.rA}33`}}>{i+1}</div>
            {editId===rule.id?(
              <div style={{flex:1}}>
                <textarea value={editVal} onChange={e=>setEditVal(e.target.value)} rows={2} autoFocus style={{width:"100%",boxSizing:"border-box",padding:"7px 10px",borderRadius:10,border:`1px solid ${C.rA}`,background:C.ip,color:C.tx,fontSize:14,outline:"none",resize:"none",lineHeight:1.5,fontFamily:"system-ui,sans-serif",marginBottom:10}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>saveEdit(rule.id)} style={{flex:1,padding:"8px 0",...pillActive(C.grn),borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>Salveaza</button>
                  <button onClick={()=>setEditId(null)} style={{padding:"8px 14px",...pillInactive,borderRadius:10,fontSize:13,cursor:"pointer"}}>Anuleaza</button>
                </div>
              </div>
            ):(
              <div style={{flex:1,display:"flex",alignItems:"flex-start",gap:6}}>
                <span style={{flex:1,fontSize:14,color:C.tx,lineHeight:1.6}}>{rule.text}</span>
                <button onClick={()=>{setEditId(rule.id);setEditVal(rule.text);}} style={{background:"none",border:"none",cursor:"pointer",color:C.tx3,fontSize:13,padding:"0 2px",flexShrink:0}}>✎</button>
                <button onClick={()=>deleteRule(rule.id)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(239,68,68,0.6)",fontSize:16,padding:"0 2px",flexShrink:0,lineHeight:1}}>x</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function HabitTab({st,setSt,toast,habitKey,accent,tinted,title,subtitle,emoji,tagline}){
  const t=tod();
  const h=st[habitKey]||{lastDate:"",done:false,daysDone:0};
  const isToday=h.lastDate===t;
  const done=isToday&&h.done;

  function toggle(){
    setSt(s=>{
      const cur=s[habitKey]||{lastDate:"",done:false,daysDone:0};
      const wasToday=cur.lastDate===t;
      const newDone=wasToday?!cur.done:true;
      let nd=cur.daysDone||0;
      if(newDone&&!(wasToday&&cur.done))nd=nd+1;
      else if(!newDone&&wasToday&&cur.done)nd=Math.max(0,nd-1);
      if(newDone&&!(wasToday&&cur.done))toast(tagline+"! ("+nd+")",accent);
      return{...s,[habitKey]:{lastDate:t,done:newDone,daysDone:nd}};
    });
  }

  return(
    <div style={{padding:"4px 16px 4px"}}>
      <DBadge date={t} color={accent} bg={tinted}/>

      <div style={{...glassTinted(accent,done?0.10:0.06),borderRadius:18,padding:18,marginBottom:16,position:"relative",overflow:"hidden",...(done?neonRing(accent):{})}}>
        {done&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg, transparent, ${accent}, transparent)`}}/>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,color:C.tx3,letterSpacing:2,textTransform:"uppercase",marginBottom:5,fontWeight:600}}>{subtitle}</div>
            <div style={{fontSize:32,fontWeight:800,color:accent,letterSpacing:-0.5,textShadow:done?`0 0 16px ${accent}66`:"none"}}>{h.daysDone||0}</div>
            <div style={{fontSize:11,color:C.tx2,marginTop:4}}>zile totale</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:46,lineHeight:1,filter:done?`drop-shadow(0 0 12px ${accent}aa)`:"none"}}>{emoji}</div>
          </div>
        </div>
      </div>

      <div style={{fontWeight:700,fontSize:15,marginBottom:12,color:C.tx}}>{title}</div>

      <div style={{...glassTinted(accent,done?0.10:0.05),borderRadius:14,padding:"18px",marginBottom:14,...(done?{border:`1px solid ${accent}66`}:{})}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:32,lineHeight:1}}>{emoji}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:done?accent:C.tx,marginBottom:4,letterSpacing:-0.2}}>{tagline}</div>
            <div style={{fontSize:12,color:C.tx3}}>{done?"Bifat astazi":"Apasa pentru a bifa ziua"}</div>
          </div>
        </div>
        <button onClick={toggle} style={{
          marginTop:14,width:"100%",padding:"13px 0",
          ...(done?glassTinted(accent,0.12):pillActive(accent)),
          borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:10,
          color:done?accent:"#fff",border:`1px solid ${accent}`,letterSpacing:0.3,
        }}>
          <div style={{
            width:22,height:22,borderRadius:"50%",
            border:done?"none":"2px solid #fff",
            background:done?accent:"transparent",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",flexShrink:0,
            boxShadow:done?`0 0 12px ${accent}aa`:"none",
          }}>{done?"✓":""}</div>
          {done?"Bifat ✓":"Bifeaza ziua"}
        </button>
      </div>
    </div>
  );
}

function Setup({onSetup}){
  const [n,setN]=useState("");
  return(
    <div style={{
      background:`radial-gradient(ellipse 80% 50% at 50% 0%, ${C.acL}33, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, ${C.cyan}22, transparent 60%), ${C.bg}`,
      minHeight:"100vh",width:"100%",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"40px 24px",textAlign:"center",color:C.tx,
      fontFamily:"system-ui,-apple-system,sans-serif"
    }}>
      <div style={{...glass(),borderRadius:24,padding:"36px 28px",width:"100%",maxWidth:420,boxSizing:"border-box",...neonRing(C.acL)}}>
        <div style={{fontSize:56,marginBottom:18,filter:`drop-shadow(0 0 20px ${C.acL}88)`}}>⚔️</div>
        <div style={{fontSize:28,fontWeight:800,marginBottom:8,letterSpacing:-0.5}}>Daily Quest</div>
        <div style={{fontSize:14,color:C.tx2,marginBottom:32,lineHeight:1.6,maxWidth:300,margin:"0 auto 32px"}}>Transforma-ti obiectivele zilnice in misiuni epice.</div>
        <input value={n} onChange={e=>setN(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onSetup(n)} placeholder="Numele tau..." autoFocus style={{width:"100%",padding:"14px 18px",borderRadius:14,border:"1px solid rgba(255,255,255,0.12)",background:"rgba(0,0,0,0.25)",color:C.tx,fontSize:16,marginBottom:14,boxSizing:"border-box",outline:"none"}}/>
        <button onClick={()=>onSetup(n)} style={{width:"100%",padding:14,...pillActive(C.ac),borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",letterSpacing:0.3}}>Incepe aventura</button>
      </div>
    </div>
  );
}

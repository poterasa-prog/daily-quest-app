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

const C={
  bg:"#0f0f13",su:"#1a1a24",ca:"#1e1e2e",bd:"#2e2e45",ac:"#7c5cfc",acG:"#7c5cfc55",acL:"#a78bfa",
  gold:"#f59e0b",grn:"#22c55e",red:"#ef4444",ylw:"#fbbf24",tx:"#e2e2f0",tx2:"#8888aa",tx3:"#55557a",ip:"#13131c",
  dA:"#10b981",dBg:"#0a1612",dSu:"#0f1f18",dCa:"#122018",dBd:"#1a3028",
  wA:"#3b82f6",wBg:"#0a0f1a",wSu:"#0f1525",wCa:"#121c2e",wBd:"#1a2540",
  gA:"#f97316",gBg:"#110a00",gSu:"#1a1000",gCa:"#1e1400",gBd:"#2e2000",
  eA:"#a855f7",eSu:"#160e20",eCa:"#1c1228",eBd:"#2a1a40",
  aA:"#76E7CD",aBg:"#001a16",aSu:"#002920",aCa:"#003828",aBd:"#005040",
  pA:"#4a9eca",pBg:"#00080f",pSu:"#001525",pCa:"#001e35",pBd:"#003055",
};

const DR=[{days:0,tag:"Incepator",color:"#6b7280",glow:"#6b728044"},{days:7,tag:"Consecvent",color:"#22c55e",glow:"#22c55e44"},{days:21,tag:"Disciplinat",color:"#3b82f6",glow:"#3b82f644"},{days:50,tag:"Focusat",color:"#8b5cf6",glow:"#8b5cf644"},{days:100,tag:"Rezistent",color:"#f59e0b",glow:"#f59e0b44"},{days:150,tag:"Stapan",color:"#ef4444",glow:"#ef444444"},{days:200,tag:"Maestru",color:"#06b6d4",glow:"#06b6d444"},{days:300,tag:"Elite",color:"#ec4899",glow:"#ec489944"},{days:500,tag:"Legendar",color:"#fbbf24",glow:"#fbbf2466"}];
const GR=[{days:0,tag:"Newbie",color:"#6b7280",glow:"#6b728044"},{days:5,tag:"Incepator",color:"#22c55e",glow:"#22c55e44"},{days:15,tag:"Consistent",color:"#3b82f6",glow:"#3b82f644"},{days:30,tag:"Athlete",color:"#8b5cf6",glow:"#8b5cf644"},{days:60,tag:"Warrior",color:"#f59e0b",glow:"#f59e0b44"},{days:100,tag:"Beast",color:"#ef4444",glow:"#ef444444"},{days:150,tag:"Elite",color:"#06b6d4",glow:"#06b6d444"},{days:200,tag:"Champion",color:"#ec4899",glow:"#ec489944"},{days:365,tag:"Legend",color:"#fbbf24",glow:"#fbbf2466"}];

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
    {name:"Incline Chest Barbell",sets:s3x("10 Kg")},
    {name:"Military Press",sets:s3x("5 Kg")},
    {name:"Chest Press Oblique Grip",sets:s3x("15 Kg")},
    {name:"Shoulder Lateral Raises",sets:s3x("50 Kg")},
    {name:"Cable Chest Flyes",sets:s3x("18 Kg")},
    {name:"Superset Triceps",sets:s3x("27 Kg")},
    {name:"CBum Shoulder Raises",sets:s3x("6 Kg")},
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
};

function Bar({label,value,max,color,glow}){
  const p=Math.min(100,Math.round((value/max)*100));
  return <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.tx2,marginBottom:4}}><span>{label}</span><span style={{color}}>{value}/{max}</span></div><div style={{height:8,background:"#2a2a3e",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:p+"%",background:color,borderRadius:4,transition:"width 0.4s",boxShadow:glow?"0 0 8px "+glow:"none"}}/></div></div>;
}
function RCard({r,nr,count,label,track}){
  const p=nr?Math.min(100,Math.round(((count-r.days)/(nr.days-r.days))*100)):100;
  return(
    <div style={{border:"1px solid "+r.color+"44",borderRadius:14,padding:16,marginBottom:14,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:r.color}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{fontSize:10,color:C.tx3,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{label}</div><div style={{fontSize:22,fontWeight:800,color:r.color}}>{r.tag}</div><div style={{fontSize:12,color:C.tx2,marginTop:2}}>{count} zile</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:10,color:C.tx3,marginBottom:4}}>Urmeaza</div>{nr?<><div style={{fontSize:14,fontWeight:700,color:nr.color}}>{nr.tag}</div><div style={{fontSize:11,color:C.tx2}}>{nr.days-count} ramase</div></>:<div style={{fontSize:13,color:C.gold}}>MAX</div>}</div>
      </div>
      {nr&&<div style={{marginTop:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.tx3,marginBottom:4}}><span>{r.tag}</span><span>{nr.tag}</span></div><div style={{height:6,background:track,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:p+"%",background:r.color,borderRadius:3,transition:"width 0.4s"}}/></div><div style={{fontSize:10,color:C.tx3,marginTop:3,textAlign:"right"}}>{p}%</div></div>}
    </div>
  );
}
function Strip({ranks,count,cbg}){
  const r=getR(count,ranks);
  return <div style={{display:"flex",gap:4,marginBottom:14,flexWrap:"wrap"}}>{ranks.map((x,i)=>{const u=count>=x.days,cur=r.index===i;return <div key={x.tag} style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:10,background:u?x.color+"22":cbg,color:u?x.color:C.tx3,border:cur?"1px solid "+x.color:"1px solid "+(u?x.color+"33":"#2e2e45"),opacity:u?1:0.45,boxShadow:cur?"0 0 8px "+x.glow:"none"}}>{x.tag}</div>})}</div>;
}
function TRow({task,ac,onToggle,onDelete,onUp,onDown,onRename}){
  const [editing,setEditing]=useState(false);
  const [val,setVal]=useState(task.text);
  function save(){const t=val.trim();if(t&&onRename)onRename(t);setEditing(false);}
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,background:task.done?"#13131c":"transparent",border:"1px solid "+(task.done?"#1e1e2e":"#2e2e45"),borderRadius:12,padding:"10px 12px",marginBottom:8,opacity:task.done?0.5:1,transition:"all 0.2s"}}>
      {onUp!==undefined&&<div style={{display:"flex",flexDirection:"column",gap:2}}>
        <button onClick={onUp} disabled={!onUp} style={{background:"none",border:"none",cursor:onUp?"pointer":"default",color:onUp?C.tx2:C.tx3+"44",fontSize:11,lineHeight:1,padding:"1px 3px"}}>▲</button>
        <button onClick={onDown} disabled={!onDown} style={{background:"none",border:"none",cursor:onDown?"pointer":"default",color:onDown?C.tx2:C.tx3+"44",fontSize:11,lineHeight:1,padding:"1px 3px"}}>▼</button>
      </div>}
      <button onClick={onToggle} style={{width:26,height:26,minWidth:26,borderRadius:"50%",border:task.done?"none":"2px solid "+ac,background:task.done?ac:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff"}}>{task.done?"✓":""}</button>
      {editing
        ?<input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")save();if(e.key==="Escape")setEditing(false);}} autoFocus style={{flex:1,padding:"4px 8px",borderRadius:8,border:"1px solid "+ac,background:C.ip,color:C.tx,fontSize:14,outline:"none"}}/>
        :<span style={{flex:1,fontSize:14,fontWeight:task.done?400:500,textDecoration:task.done?"line-through":"none",color:task.done?C.tx3:C.tx}}>{task.text}</span>}
      {editing
        ?<><button onClick={save} style={{background:"none",border:"none",cursor:"pointer",color:C.grn,fontSize:15,padding:"0 3px",fontWeight:700}}>✓</button><button onClick={()=>setEditing(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.tx3,fontSize:15,padding:"0 3px"}}>x</button></>
        :<>{onRename&&<button onClick={()=>{setVal(task.text);setEditing(true);}} style={{background:"none",border:"none",cursor:"pointer",color:C.tx3,fontSize:12,padding:"0 2px"}}>✎</button>}<button onClick={onDelete} style={{background:"none",border:"none",cursor:"pointer",color:C.tx3,fontSize:19,padding:"0 2px",lineHeight:1}}>×</button></>}
    </div>
  );
}
function DBadge({date,color,bg}){return <div style={{textAlign:"center",marginBottom:14}}><div style={{display:"inline-block",background:bg,border:"1px solid "+color+"44",borderRadius:10,padding:"6px 18px"}}><span style={{fontSize:13,color,fontWeight:600}}>{fmt(date)}</span></div></div>;}
function OKBadge({color,text}){return <div style={{textAlign:"center",padding:12,background:color+"11",border:"1px solid "+color+"33",borderRadius:12,color,fontSize:13,fontWeight:600}}>✓ {text}</div>;}
function LogBtn({can,done,tot,color,bdr,cbg,onClick}){return <button onClick={onClick} disabled={!can} style={{width:"100%",padding:13,background:can?color:cbg,color:can?"#fff":C.tx3,border:"1px solid "+(can?color:bdr),borderRadius:12,fontSize:14,fontWeight:700,cursor:can?"pointer":"default",transition:"all 0.2s"}}>{can?"✓ Marcheaza ziua ca finalizata":"Completeaza toate taskurile ("+done+"/"+tot+")"}</button>;}
function Empty({emoji,text}){return <div style={{textAlign:"center",padding:"28px 16px",color:C.tx3,fontSize:14}}><div style={{fontSize:32,marginBottom:8}}>{emoji}</div>{text}</div>;}

function SetRow({s,si,ei,dk,iw,ac,isEve,onToggle,onEdit}){
  const [editing,setEditing]=useState(false);
  const [kg,setKg]=useState(s.weight);
  const [reps,setReps]=useState(s.reps);
  function saveEdit(){onEdit("weight",kg);onEdit("reps",reps);setEditing(false);}
  return(
    <div style={{marginBottom:4}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,background:dk?"#1a2e00":iw?"#1a1400":"#1e1e2e",border:"1px solid "+(dk?"#22c55e33":iw?(isEve?C.eBd:C.gBd)+"88":(isEve?C.eBd:C.gBd)),opacity:dk?0.7:1}}>
        <button onClick={onToggle} style={{width:22,height:22,minWidth:22,borderRadius:"50%",border:dk?"none":"2px solid "+(iw?"#888":ac),background:dk?C.grn:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",flexShrink:0}}>{dk?"✓":""}</button>
        <div style={{flex:1}}>
          <span style={{fontSize:11,fontWeight:700,color:iw?C.tx3:ac,marginRight:6}}>{iw?"INCALZIRE":"SET"} {si+1}</span>
          <span style={{fontSize:13,color:dk?C.tx3:C.tx,textDecoration:dk?"line-through":"none"}}>{s.weight} x {s.reps} rep</span>
        </div>
        {!dk&&<button onClick={()=>{setKg(s.weight);setReps(s.reps);setEditing(v=>!v);}} style={{background:"none",border:"1px solid "+(editing?ac:C.tx3+"55"),borderRadius:6,padding:"3px 8px",color:editing?ac:C.tx3,fontSize:11,cursor:"pointer",flexShrink:0}}>✎</button>}
      </div>
      {editing&&!dk&&(
        <div style={{display:"flex",gap:6,padding:"8px 10px",background:"#0f0f13",borderRadius:8,marginTop:3,alignItems:"center"}}>
          <div style={{flex:1}}><div style={{fontSize:10,color:C.tx3,marginBottom:3}}>Kg</div><input value={kg} onChange={e=>setKg(e.target.value)} style={{width:"100%",padding:"5px 8px",borderRadius:7,border:"1px solid "+ac+"55",background:C.ip,color:C.tx,fontSize:13,outline:"none",boxSizing:"border-box"}}/></div>
          <div style={{flex:1}}><div style={{fontSize:10,color:C.tx3,marginBottom:3}}>Rep</div><input value={reps} onChange={e=>setReps(e.target.value)} style={{width:"100%",padding:"5px 8px",borderRadius:7,border:"1px solid "+ac+"55",background:C.ip,color:C.tx,fontSize:13,outline:"none",boxSizing:"border-box"}}/></div>
          <button onClick={saveEdit} style={{background:ac,color:"#fff",border:"none",borderRadius:8,padding:"8px 12px",fontWeight:700,fontSize:13,cursor:"pointer",marginTop:14}}>✓</button>
        </div>
      )}
    </div>
  );
}

export default function App(){
  const [st,setSt]=useState(()=>{
    try{
      const s=localStorage.getItem("dq_v12");
      if(!s)return INIT;
      const p=JSON.parse(s);
      if(!p.daily)p.daily=INIT.daily;
      if(!p.work)p.work=INIT.work;
      if(!p.gym)p.gym=INIT.gym;
      if(!p.aff)p.aff=INIT.aff;
      if(!p.prayer)p.prayer=INIT.prayer;
      if(!p.gym.completed)p.gym.completed={};
      return p;
    }catch{return INIT;}
  });
  const [tab,setTab]=useState("daily");
  const [toast,setToast]=useState(null);

  useEffect(()=>{try{localStorage.setItem("dq_v12",JSON.stringify(st));}catch{}},[st]);
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

  if(!st.setupDone)return <Setup onSetup={n=>{if(!n.trim())return;setSt(s=>({...s,heroName:n.trim(),setupDone:true,lastDate:tod()}));}}/>;

  const lv=getLvl(st.xp),xpC=st.xp-xpCurLvl(lv),xpN=xpNext(lv)-xpCurLvl(lv);
  const bg=tab==="daily"?C.dBg:tab==="work"?C.wBg:tab==="gym"?C.gBg:tab==="aff"?C.aBg:tab==="prayer"?C.pBg:C.bg;
  const su=tab==="daily"?C.dSu:tab==="work"?C.wSu:tab==="gym"?C.gSu:tab==="aff"?C.aSu:tab==="prayer"?C.pSu:C.su;
  const bd=tab==="daily"?C.dBd:tab==="work"?C.wBd:tab==="gym"?C.gBd:tab==="aff"?C.aBd:tab==="prayer"?C.pBd:C.bd;

  return(
    <div style={{fontFamily:"system-ui,sans-serif",background:bg,minHeight:"100vh",color:C.tx,maxWidth:420,margin:"0 auto",paddingBottom:80,transition:"background 0.3s"}}>
      {toast&&<div style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"#000",padding:"8px 22px",borderRadius:20,fontWeight:700,fontSize:15,zIndex:999,pointerEvents:"none"}}>{toast.msg}</div>}
      <div style={{background:su,borderBottom:"1px solid "+bd,padding:"18px 16px 14px",transition:"background 0.3s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div><div style={{fontSize:20,fontWeight:700,marginBottom:2}}>{st.heroName}</div><div style={{fontSize:12,color:C.acL}}>Nivel {lv}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:10,color:C.tx3}}>Streak</div><div style={{fontSize:28,fontWeight:800,color:C.gold,lineHeight:1}}>{st.streak}</div><div style={{fontSize:10,color:C.tx3}}>zile</div></div>
        </div>
        <div style={{display:"flex",gap:12}}><Bar label="HP" value={st.hp} max={MAX_HP} color={st.hp>50?C.grn:st.hp>25?C.ylw:C.red}/><Bar label="XP" value={xpC} max={xpN} color={C.acL} glow={C.acG}/></div>
        <div style={{fontSize:10,color:C.tx3,marginTop:5,textAlign:"right"}}>{st.xp} XP total</div>
      </div>
      <div style={{display:"flex",background:su,borderBottom:"1px solid "+bd,transition:"background 0.3s"}}>
        {[["daily","📅",C.dA],["work","💼",C.wA],["gym","🏋️",C.gA],["aff","🌟",C.aA],["prayer","🙏",C.pA]].map(([k,l,c])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"11px 0",background:"none",border:"none",cursor:"pointer",fontSize:18,color:tab===k?c:C.tx3,borderBottom:tab===k?"2px solid "+c:"2px solid transparent",transition:"all 0.2s"}}>{l}</button>
        ))}
      </div>
      {tab==="daily"&&<DailyTab st={st} setSt={setSt} toast={showToast}/>}
      {tab==="work"&&<WorkTab st={st} setSt={setSt} toast={showToast}/>}
      {tab==="gym"&&<GymTab st={st} setSt={setSt} toast={showToast} getMp={getMp} getEve={getEve} saveMp={saveMp} saveEve={saveEve}/>}
      {tab==="aff"&&<AffTab st={st} setSt={setSt} toast={showToast} getAff={getAff} saveAff={saveAff}/>}
      {tab==="prayer"&&<PrayerTab st={st} setSt={setSt} toast={showToast}/>}
      <div style={{padding:"16px 16px 0",textAlign:"center"}}><button onClick={()=>{if(confirm("Resetezi tot progresul?"))setSt(INIT);}} style={{fontSize:11,color:C.tx3,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Reseteaza progresul</button></div>
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
    <div style={{padding:"16px 16px 4px"}}>
      <DBadge date={t} color={C.dA} bg={C.dCa}/>
      <RCard r={r} nr={nr} count={d.daysDone} label="Rank zilnic" track="#0a1612"/>
      <Strip ranks={DR} count={d.daysDone} cbg={C.dCa}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div><div style={{fontWeight:700,fontSize:15}}>Taskuri de azi</div><div style={{fontSize:12,color:C.tx2}}>{dc}/{d.tasks.length} bifate</div></div><button onClick={()=>setSa(v=>!v)} style={{background:sa?C.dCa:C.dA,color:sa?C.tx2:"#fff",border:"none",borderRadius:20,padding:"7px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}>{sa?"Anuleaza":"+ Task"}</button></div>
      {sa&&<div style={{display:"flex",gap:8,marginBottom:12}}><input value={nw} onChange={e=>setNw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Task zilnic..." autoFocus style={{flex:1,padding:"10px 12px",borderRadius:10,border:"1px solid "+C.dA+"55",background:C.ip,color:C.tx,fontSize:14,outline:"none"}}/><button onClick={add} style={{background:C.dA,color:"#fff",border:"none",borderRadius:10,padding:"10px 14px",fontWeight:700,fontSize:14,cursor:"pointer"}}>Add</button></div>}
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
    <div style={{padding:"16px 16px 4px"}}>
      <DBadge date={t} color={C.wA} bg={C.wCa}/>
      <div style={{background:C.wCa,border:"1px solid "+C.wBd,borderRadius:14,padding:14,marginBottom:14}}><div style={{fontSize:12,color:C.tx2,lineHeight:1.6}}>Taskurile bifate se sterg automat la miezul noptii. Cele nebifate raman pentru ziua urmatoare.</div></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div><div style={{fontWeight:700,fontSize:15}}>Taskuri munca</div><div style={{fontSize:12,color:C.tx2}}>{dc}/{w.tasks.length} bifate</div></div><button onClick={()=>setSa(v=>!v)} style={{background:sa?C.wCa:C.wA,color:sa?C.tx2:"#fff",border:"none",borderRadius:20,padding:"7px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}>{sa?"Anuleaza":"+ Task"}</button></div>
      {sa&&<div style={{display:"flex",gap:8,marginBottom:12}}><input value={nw} onChange={e=>setNw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Task de munca..." autoFocus style={{flex:1,padding:"10px 12px",borderRadius:10,border:"1px solid "+C.wA+"55",background:C.ip,color:C.tx,fontSize:14,outline:"none"}}/><button onClick={add} style={{background:C.wA,color:"#fff",border:"none",borderRadius:10,padding:"10px 14px",fontWeight:700,fontSize:14,cursor:"pointer"}}>Add</button></div>}
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
    setSt(s=>{const ns=s.gym.sessionsDone+1,nr2=getR(ns,GR),or=getR(s.gym.sessionsDone,GR),ul=nr2.tag!==or.tag?[...(s.gym.rankUnlocks||[]),{tag:nr2.tag,date:t,color:nr2.color}]:(s.gym.rankUnlocks||[]),lbl=view==="mw"?"Dimineata "+aDay.name:"Seara Kettlebell";return{...s,gym:{...s.gym,sessionsDone:ns,lastDate:t,rankUnlocks:ul,history:[{date:t,day:lbl},...(s.gym.history||[])].slice(0,50),completed:{...(s.gym.completed||{}),[ck]:true}}};});
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
    const ip2={padding:"6px 8px",borderRadius:7,border:"1px solid "+(isEve?C.eBd:C.gBd),background:C.ip,color:C.tx,fontSize:13,outline:"none"};
    return(
      <div style={{paddingBottom:16}}>
        <div style={{background:isEve?C.eSu:C.gSu,borderBottom:"1px solid "+(isEve?C.eBd:C.gBd),padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>setView("list")} style={{background:"none",border:"none",color:C.tx3,fontSize:13,fontWeight:700,cursor:"pointer"}}>Anuleaza</button>
          <span style={{fontSize:14,fontWeight:800,color:ac}}>{isEve?"Seara":"Dimineata"}</span>
          <button onClick={saveE} style={{background:ac,color:"#fff",border:"none",borderRadius:10,padding:"6px 14px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Salveaza</button>
        </div>
        <div style={{padding:"12px 16px"}}>
          {eMode!=="evening"&&<div style={{marginBottom:12}}><div style={{fontSize:10,color:C.tx3,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Numele zilei</div><input value={eData.name} onChange={e=>setEData(d=>({...d,name:e.target.value}))} style={{...ip2,width:"100%",boxSizing:"border-box",fontSize:15,fontWeight:700}}/></div>}
          {exs.map((ex,ei)=>(
            <div key={ei} style={{background:isEve?C.eCa:C.gCa,border:"1px solid "+(isEve?C.eBd:C.gBd),borderRadius:12,padding:"12px 14px",marginBottom:10}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}><input value={ex.name} onChange={e=>updEx(ei,"name",e.target.value)} style={{...ip2,flex:1,fontWeight:700,color:ac}}/><button onClick={()=>rmEx(ei)} style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:18,padding:"0 4px"}}>x</button></div>
              {ex.sets.map((s,si)=>(
                <div key={si} style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
                  <select value={s.type} onChange={e=>updS(ei,si,"type",e.target.value)} style={{...ip2,padding:"5px 4px",fontSize:11}}><option value="working">SET</option><option value="warmup">INCALZIRE</option></select>
                  <input value={s.weight} onChange={e=>updS(ei,si,"weight",e.target.value)} placeholder="Kg" style={{...ip2,flex:1}}/>
                  <input value={s.reps} onChange={e=>updS(ei,si,"reps",e.target.value)} placeholder="Rep" style={{...ip2,width:44,textAlign:"center"}}/>
                  <button onClick={()=>rmS(ei,si)} style={{background:"none",border:"none",cursor:"pointer",color:C.tx3,fontSize:16,lineHeight:1}}>x</button>
                </div>
              ))}
              <button onClick={()=>addS(ei)} style={{marginTop:4,background:"none",border:"1px dashed "+(isEve?C.eBd:C.gBd),color:C.tx3,borderRadius:8,padding:"5px 12px",fontSize:12,cursor:"pointer",width:"100%"}}>+ Set</button>
            </div>
          ))}
          <button onClick={addEx} style={{width:"100%",padding:12,background:"none",border:"1px dashed "+ac+"55",color:ac,borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",marginTop:4}}>+ Exercitiu nou</button>
        </div>
      </div>
    );
  }

  if(view==="mw"||view==="ew"){
    const title=view==="ew"?"Seara -- Kettlebell & Core":"Dimineata -- "+aDay.name;
    const tot=cTot(aSess),done=cDone(),pct=tot>0?Math.round((done/tot)*100):0,all=done===tot&&tot>0;
    return(
      <div style={{paddingBottom:16}}>
        <div style={{background:isEve?C.eSu:C.gSu,borderBottom:"1px solid "+(isEve?C.eBd:C.gBd),padding:"14px 16px"}}>
          <button onClick={()=>setView("list")} style={{background:"none",border:"none",color:ac,fontSize:13,fontWeight:700,cursor:"pointer",paddingBottom:8}}>Inapoi</button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:10,color:C.tx3,letterSpacing:2,textTransform:"uppercase"}}>ANTRENAMENT ACTIV</div><div style={{fontSize:16,fontWeight:800,color:ac}}>{title}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:800,color:all?C.grn:ac}}>{pct}%</div><div style={{fontSize:11,color:C.tx2}}>{done}/{tot}</div></div>
          </div>
          <div style={{marginTop:10,height:6,background:isEve?"#0e0814":"#2e2000",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:all?C.grn:ac,borderRadius:3,transition:"width 0.3s"}}/></div>
          <div style={{textAlign:"center",marginTop:8,fontSize:12,color:C.tx2}}>{fmt(t)}</div>
        </div>
        <div style={{padding:"12px 16px"}}>
          {aSess.map((ex,ei)=>(
            <div key={ei} style={{background:isEve?C.eCa:C.gCa,border:"1px solid "+(isEve?C.eBd:C.gBd),borderRadius:12,padding:"12px 14px",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:800,color:ac,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>{ex.name}</div>
              {ex.sets.map((s,si)=>(
                <SetRow key={si} s={s} si={si} ei={ei} dk={!!dn[ei+"-"+si]} iw={s.type==="warmup"} ac={ac} isEve={isEve}
                  onToggle={()=>togS(ei,si)}
                  onEdit={(f,v)=>setASess(prev=>prev.map((e,i)=>i===ei?{...e,sets:e.sets.map((st,j)=>j===si?{...st,[f]:v}:st)}:e))}
                />
              ))}
            </div>
          ))}
          <div style={{marginTop:8}}>{logged?<OKBadge color={C.grn} text="Sesiune inregistrata!"/>:<button onClick={finish} disabled={!all} style={{width:"100%",padding:13,background:all?ac:(isEve?C.eCa:C.gCa),color:all?"#fff":C.tx3,border:"1px solid "+(all?ac:(isEve?C.eBd:C.gBd)),borderRadius:12,fontSize:14,fontWeight:700,cursor:all?"pointer":"default",transition:"all 0.2s"}}>{all?"Finalizeaza":"Completeaza toate seturile ("+done+"/"+tot+")"}</button>}</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:"16px 16px 4px"}}>
      <DBadge date={t} color={C.gA} bg={C.gCa}/>
      <RCard r={r} nr={nr} count={g.sessionsDone} label="Gym Rank" track="#110a00"/>
      <Strip ranks={GR} count={g.sessionsDone} cbg={C.gCa}/>
      <div style={{fontWeight:700,fontSize:15,marginBottom:10}}>Program Saptamanal</div>
      {mp.map(day=>(
        <div key={day.id} style={{background:C.gCa,border:"1px solid "+C.gBd,borderRadius:14,padding:"12px 14px",marginBottom:10,opacity:day.rest?0.6:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:day.rest?0:10}}>
            <div style={{fontSize:22,lineHeight:1}}>{day.emoji}</div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:day.rest?C.tx3:C.tx}}>Ziua {day.id} -- {day.name}</div>{!day.rest&&<div style={{fontSize:11,color:C.tx2,marginTop:1}}>{day.exercises.length} exercitii</div>}</div>
          </div>
          {!day.rest&&(
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:C.gA,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Dimineata</div>
                {isComp(day.id,"morning")
                  ?<div style={{display:"flex",gap:6}}><div style={{flex:1,padding:"8px 0",background:C.grn+"22",border:"1px solid "+C.grn+"55",borderRadius:9,color:C.grn,fontSize:12,fontWeight:700,textAlign:"center"}}>Completat</div><button onClick={()=>resetComp(day.id,"morning")} style={{padding:"8px 10px",background:"none",border:"1px solid "+C.gBd,borderRadius:9,color:C.tx3,fontSize:12,cursor:"pointer"}}>↺</button></div>
                  :<div style={{display:"flex",gap:6}}><button onClick={()=>startW(day,"morning")} style={{flex:1,padding:"8px 0",background:C.gA+"22",border:"1px solid "+C.gA+"55",borderRadius:9,color:C.gA,fontSize:12,fontWeight:700,cursor:"pointer"}}>Start</button><button onClick={()=>startE(day,"morning")} style={{padding:"8px 10px",background:"none",border:"1px solid "+C.gBd,borderRadius:9,color:C.tx3,fontSize:12,cursor:"pointer"}}>✎</button></div>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:C.eA,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Seara</div>
                {isComp(day.id,"evening")
                  ?<div style={{display:"flex",gap:6}}><div style={{flex:1,padding:"8px 0",background:C.grn+"22",border:"1px solid "+C.grn+"55",borderRadius:9,color:C.grn,fontSize:12,fontWeight:700,textAlign:"center"}}>Completat</div><button onClick={()=>resetComp(day.id,"evening")} style={{padding:"8px 10px",background:"none",border:"1px solid "+C.eBd,borderRadius:9,color:C.tx3,fontSize:12,cursor:"pointer"}}>↺</button></div>
                  :<div style={{display:"flex",gap:6}}><button onClick={()=>startW(day,"evening")} style={{flex:1,padding:"8px 0",background:C.eA+"22",border:"1px solid "+C.eA+"55",borderRadius:9,color:C.eA,fontSize:12,fontWeight:700,cursor:"pointer"}}>Start</button><button onClick={()=>startE(day,"evening")} style={{padding:"8px 10px",background:"none",border:"1px solid "+C.eBd,borderRadius:9,color:C.tx3,fontSize:12,cursor:"pointer"}}>✎</button></div>}
              </div>
            </div>
          )}
        </div>
      ))}
      {g.history?.length>0&&<div style={{marginTop:16}}><div style={{fontSize:10,color:C.tx3,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Istoric</div>{g.history.slice(0,5).map((h,i)=><div key={i} style={{fontSize:12,color:C.tx2,padding:"5px 0",borderBottom:"0.5px solid "+C.gBd}}>{h.day} -- {h.date}</div>)}</div>}
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
    <div style={{padding:"16px 16px 4px"}}>
      <DBadge date={tod()} color={C.aA} bg={C.aCa}/>
      <div style={{background:C.aCa,border:"1px solid "+(ready?C.aA+"88":C.aBd),borderRadius:14,padding:16,marginBottom:16,position:"relative",overflow:"hidden"}}>
        {ready&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:C.aA}}/>}
        <div style={{textAlign:"center",marginBottom:10}}>
          <div style={{fontSize:10,color:C.tx3,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Urmatoarea sesiune in</div>
          <div style={{fontSize:38,fontWeight:800,color:tc,letterSpacing:3}}>{ready?"ACUM!":paused?"ZZZ":fmtT(timeLeft)}</div>
          {ready&&<div style={{fontSize:13,color:C.aA,marginTop:6,fontWeight:600}}>E timpul sa iti spui afirmatiile!</div>}
          {paused&&<div style={{fontSize:12,color:C.tx3,marginTop:6}}>In afara intervalului 06:00 - 00:00</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
          <div style={{fontSize:11,color:C.tx3}}>Sesiuni totale: {a.sessionsDone||0}</div>
          <div style={{fontSize:11,color:C.aA,fontWeight:600}}>{doneCount}/{aff.length} bifate</div>
        </div>
      </div>

      {/* HEADER + ADD */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:15,color:C.tx}}>Afirmatiile mele ({aff.length})</div>
        <button onClick={()=>setShowAdd(v=>!v)} style={{background:showAdd?C.aCa:C.aA,color:showAdd?C.tx3:"#003828",border:"none",borderRadius:20,padding:"6px 14px",fontWeight:700,fontSize:12,cursor:"pointer"}}>{showAdd?"Anuleaza":"+ Adauga"}</button>
      </div>

      {showAdd&&(
        <div style={{background:C.aCa,border:"1px solid "+C.aA+"55",borderRadius:12,padding:12,marginBottom:14}}>
          <textarea value={newText} onChange={e=>setNewText(e.target.value)} placeholder="Scrie noua afirmatie..." rows={2} autoFocus style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:10,border:"1px solid "+C.aA+"55",background:C.aBg,color:C.tx,fontSize:13,outline:"none",resize:"none",lineHeight:1.5,fontFamily:"system-ui,sans-serif",marginBottom:8}}/>
          <button onClick={addAff} style={{width:"100%",padding:"8px 0",background:C.aA,color:"#003828",border:"none",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer"}}>Adauga afirmatia</button>
        </div>
      )}

      {aff.map((item,i)=>{
        const checked=checks[item.id]||false;const hasText=(refs[item.id]||"").trim().length>0;
        return(
          <div key={item.id} style={{background:C.aCa,border:"1px solid "+(checked?C.aA+"66":C.aBd),borderRadius:14,padding:14,marginBottom:12,opacity:checked?0.7:1}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:10}}>
              <div style={{width:24,height:24,minWidth:24,borderRadius:"50%",background:C.aA+"33",border:"1px solid "+C.aA+"55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:C.aA,flexShrink:0}}>{i+1}</div>
              {editId===item.id
                ?<div style={{flex:1,display:"flex",gap:6,alignItems:"flex-start"}}>
                  <textarea value={editVal} onChange={e=>setEditVal(e.target.value)} autoFocus rows={2} style={{flex:1,padding:"6px 8px",borderRadius:8,border:"1px solid "+C.aA,background:C.ip,color:C.tx,fontSize:14,outline:"none",resize:"none",lineHeight:1.5,fontFamily:"system-ui,sans-serif"}}/>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <button onClick={()=>saveEdit(item.id)} style={{background:C.grn,color:"#fff",border:"none",borderRadius:6,padding:"5px 8px",fontSize:12,cursor:"pointer",fontWeight:700}}>✓</button>
                    <button onClick={()=>setEditId(null)} style={{background:"none",border:"1px solid "+C.aBd,borderRadius:6,padding:"5px 8px",fontSize:12,cursor:"pointer",color:C.tx3}}>x</button>
                  </div>
                </div>
                :<div style={{flex:1,display:"flex",alignItems:"flex-start",gap:6}}>
                  <span style={{flex:1,fontSize:14,fontWeight:600,color:checked?C.tx3:C.aA,lineHeight:1.6,fontStyle:"italic",textDecoration:checked?"line-through":"none"}}>"{item.text}"</span>
                  {!checked&&<button onClick={()=>{setEditId(item.id);setEditVal(item.text);}} style={{background:"none",border:"none",cursor:"pointer",color:C.tx3,fontSize:13,padding:"0 2px",flexShrink:0}}>✎</button>}
                  {!checked&&<button onClick={()=>deleteAff(item.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.red+"99",fontSize:15,padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>}
                </div>}
            </div>
            <div style={{marginLeft:32}}>
              <div style={{fontSize:10,color:C.tx3,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Rescrie cu propriile cuvinte</div>
              <textarea value={refs[item.id]||""} onChange={e=>setRefs(p=>({...p,[item.id]:e.target.value}))} placeholder="Scrie afirmatia ta..." rows={2} disabled={checked} style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:10,border:"1px solid "+(hasText?C.aA+"66":C.aBd),background:checked?"#001a13":C.aBg,color:C.tx,fontSize:13,outline:"none",resize:"none",lineHeight:1.5,fontFamily:"system-ui,sans-serif",opacity:checked?0.6:1}}/>
              <button onClick={()=>setChecks(p=>({...p,[item.id]:!p[item.id]}))} disabled={!hasText&&!checked} style={{marginTop:8,width:"100%",padding:"8px 0",background:checked?C.aA:"none",color:checked?"#001a13":hasText?C.aA:C.tx3,border:"1px solid "+(checked?C.aA:hasText?C.aA+"55":C.aBd),borderRadius:9,fontSize:13,fontWeight:700,cursor:(hasText||checked)?"pointer":"default",transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <div style={{width:18,height:18,borderRadius:"50%",border:checked?"none":"2px solid "+C.aA,background:checked?C.aA+"33":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.aA}}>{checked?"✓":""}</div>
                {checked?"Bifata":"Bifeaza afirmatia"}
              </button>
            </div>
          </div>
        );
      })}
      <div style={{marginBottom:20,textAlign:"center",fontSize:12,color:C.tx3}}>{allChecked?"Timer pornit automat!":"Bifeaza toate afirmatiile pentru a porni timer-ul"}</div>
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
    <div style={{padding:"16px 16px 4px"}}>
      <DBadge date={t} color={C.pA} bg={C.pCa}/>

      {/* POPUP */}
      {openItem&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setOpenId(null)}>
          <div style={{background:C.pSu,border:"1px solid "+C.pA+"66",borderRadius:18,padding:24,maxWidth:400,width:"100%",maxHeight:"80vh",overflowY:"auto",position:"relative"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
              <span style={{fontSize:24}}>{openItem.emoji}</span>
              <div style={{flex:1,fontSize:16,fontWeight:700,color:C.pA}}>{openItem.label}</div>
              <button onClick={()=>setOpenId(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.tx3,fontSize:22,lineHeight:1,padding:"0 4px"}}>×</button>
            </div>
            {editId===openItem.key
              ?<div>
                <textarea value={editVal} onChange={e=>setEditVal(e.target.value)} rows={8} autoFocus style={{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:10,border:"1px solid "+C.pA,background:C.ip,color:C.tx,fontSize:14,outline:"none",resize:"none",lineHeight:1.7,fontFamily:"system-ui,sans-serif",marginBottom:10}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>saveEdit(openItem.key)} style={{flex:1,padding:"10px 0",background:C.pA,color:"#fff",border:"none",borderRadius:9,fontWeight:700,fontSize:14,cursor:"pointer"}}>Salveaza</button>
                  <button onClick={()=>setEditId(null)} style={{padding:"10px 16px",background:"none",border:"1px solid "+C.pBd,borderRadius:9,color:C.tx3,fontSize:14,cursor:"pointer"}}>Anuleaza</button>
                </div>
              </div>
              :<div>
                <p style={{margin:"0 0 20px",fontSize:15,color:C.tx,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{pTexts[openItem.key]}</p>
                <div style={{display:"flex",gap:8,flexDirection:"column"}}>
                  {!openItem.done&&<button onClick={()=>{setEditId(openItem.key);setEditVal(pTexts[openItem.key]);}} style={{width:"100%",padding:"10px 0",background:"none",color:C.tx3,border:"1px solid "+C.pBd,borderRadius:9,fontWeight:600,fontSize:13,cursor:"pointer"}}>✎ Editeaza rugaciunea</button>}
                  <button onClick={()=>{toggle(openItem.key);setOpenId(null);}} style={{width:"100%",padding:"12px 0",background:openItem.done?C.pA+"22":C.pA,color:openItem.done?C.pA:"#fff",border:"1px solid "+C.pA,borderRadius:9,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    <div style={{width:22,height:22,borderRadius:"50%",border:openItem.done?"none":"2px solid #fff",background:openItem.done?C.pA:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",flexShrink:0}}>{openItem.done?"✓":""}</div>
                    {openItem.done?"Am spus rugaciunea ✓":"Am spus rugaciunea"}
                  </button>
                </div>
              </div>}
          </div>
        </div>
      )}

      {/* STATS */}
      <div style={{background:C.pCa,border:"1px solid "+(bothDone?C.pA+"88":C.pBd),borderRadius:14,padding:16,marginBottom:16,position:"relative",overflow:"hidden"}}>
        {bothDone&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:C.pA}}/>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:10,color:C.tx3,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Zile de rugaciune</div><div style={{fontSize:28,fontWeight:800,color:C.pA}}>{p.daysDone||0}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:13,color:bothDone?C.pA:C.tx3,fontWeight:600}}>{bothDone?"Zi completa":""}</div><div style={{fontSize:12,color:C.tx2,marginTop:4}}>{(mDone?1:0)+(eDone?1:0)}/2 bifate</div></div>
        </div>
      </div>

      <div style={{fontWeight:700,fontSize:15,marginBottom:12,color:C.tx}}>Rugaciunile mele</div>
      {items.map(item=>(
        <div key={item.key} onClick={()=>setOpenId(item.key)} style={{background:C.pCa,border:"1px solid "+(item.done?C.pA+"66":C.pBd),borderRadius:14,padding:"16px",marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",gap:14,transition:"all 0.2s"}}>
          <span style={{fontSize:28,lineHeight:1}}>{item.emoji}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:700,color:item.done?C.pA:C.tx,marginBottom:4}}>{item.label}</div>
            <div style={{fontSize:12,color:C.tx3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:220}}>{pTexts[item.key]}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            {item.done
              ?<div style={{width:28,height:28,borderRadius:"50%",background:C.pA,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff"}}>✓</div>
              :<div style={{width:28,height:28,borderRadius:"50%",border:"2px solid "+C.pA,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.pA}}>›</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Setup({onSetup}){
  const [n,setN]=useState("");
  return(
    <div style={{background:C.bg,minHeight:"100vh",maxWidth:420,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",textAlign:"center",color:C.tx,fontFamily:"system-ui,sans-serif"}}>
      <div style={{fontSize:52,marginBottom:16}}>⚔️</div>
      <div style={{fontSize:26,fontWeight:800,marginBottom:8}}>Daily Quest</div>
      <div style={{fontSize:14,color:C.tx2,marginBottom:36,lineHeight:1.6,maxWidth:300}}>Transforma-ti obiectivele zilnice in misiuni epice.</div>
      <input value={n} onChange={e=>setN(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onSetup(n)} placeholder="Numele tau..." autoFocus style={{width:"100%",padding:"13px 16px",borderRadius:12,border:"1px solid "+C.bd,background:C.ca,color:C.tx,fontSize:16,marginBottom:14,boxSizing:"border-box",outline:"none"}}/>
      <button onClick={()=>onSetup(n)} style={{width:"100%",padding:14,background:C.ac,color:"#fff",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer"}}>Incepe aventura</button>
    </div>
  );
}
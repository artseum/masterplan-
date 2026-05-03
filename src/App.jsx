import { useState, useEffect } from "react";

const ZAR=16.5,MUR=46.8,CAD=1.37;
const toUSD=(n,r)=>n/r;
const fmtN=(n,d=0)=>Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
const $$=(n)=>"$"+fmtN(Math.round(n));
const R=(n)=>"R "+fmtN(Math.round(n));

const TAX={saCorpRate:0.27,saEffective:1-(1-0.27)*(1-0.20),tradingRate:0.02,canadianRate:0.31};

const C={
  bg:"#05080b",surface:"#0a0f14",card:"#0e1520",border:"#162030",dim:"#1a2535",
  gold:"#d4a853",blue:"#4a9eff",green:"#4ecb8a",red:"#e05555",
  purple:"#a07be8",teal:"#3dc4b8",amber:"#f0a030",text:"#ddd8cc",muted:"#5a6878",
};

const commercial=[
  {id:"c1",order:1,name:"Auckland Park — 34 Rooms",location:"Auckland Park, JHB",
   zarPrice:10_500_000,depositPct:0.20,status:"operational",type:"Student Acc",
   incomeMonthly:187_000,incomeAnnual:2_244_000,expenses:0,bondRate:0.115,bondYears:20,
   note:"34 rooms. NSFAS + Thuthuka + private. AAA grade. Solar + inverter. 5min to UJ APK. CONFIRMED income.",
   url:"https://www.property24.com/for-sale/auckland-park/johannesburg/gauteng/4130/117111334",
   img:"https://i.imgur.com/njigPoS.png",
   highlight:"ANCHOR ASSET — Buy First",hColor:"#4ecb8a"},
  {id:"c2",order:2,name:"Auckland Park — 22 Students",location:"Auckland Park, JHB",
   zarPrice:8_500_000,depositPct:0.20,status:"operational",type:"Student Acc",
   incomeMonthly:100_000,incomeAnnual:1_200_000,expenses:10_000,bondRate:0.115,bondYears:20,
   note:"22 students. 10 units. NSFAS-backed. AAA grade. 24hr backup power + water. Same corridor as C1.",
   url:"https://www.property24.com/for-sale/auckland-park/johannesburg/gauteng/4130/117107185",
   img:"https://i.imgur.com/RBI3672.png",
   highlight:"Buy Second — Same Agent & Corridor",hColor:"#4a9eff"},
  {id:"c3",order:3,name:"Braamfontein — 33 Units + Shops",location:"Braamfontein, JHB",
   zarPrice:9_200_000,depositPct:0.20,status:"operational",type:"Residential + Retail",
   incomeMonthly:110_000,incomeAnnual:1_320_000,expenses:15_000,renoZAR:1_200_000,bondRate:0.115,bondYears:20,
   note:"33 × 2-bed apts + 3 top-floor rooms + 2 retail shops. Fully occupied. Renovate to raise rents 20–30%.",
   url:"https://www.property24.com/for-sale/braamfontein/johannesburg/gauteng/3857/115592977",
   img:"https://i.imgur.com/AYBoMtO.png",
   highlight:"Diversified Income — Apts + Retail",hColor:"#d4a853"},
  {id:"c4",order:4,name:"Braamfontein — 53 Units",location:"Braamfontein, JHB",
   zarPrice:18_465_000,depositPct:0.20,status:"operational",type:"Apartment Complex",
   incomeMonthly:185_000,incomeAnnual:2_220_000,expenses:25_000,bondRate:0.115,bondYears:20,
   note:"53 units. 52/53 let. NO TRANSFER DUTY (saves ~R1.5M). Biometric + 24hr security. 3min to Gautrain.",
   url:"https://www.property24.com/for-sale/braamfontein/johannesburg/gauteng/3857/113517026",
   img:"https://i.imgur.com/sant18L.png",
   highlight:"No Transfer Duty — Saves R1.5M",hColor:"#3dc4b8"},
  {id:"c5",order:5,name:"Braamfontein — 68 Apts + 6 Retail",location:"Braamfontein, JHB",
   zarPrice:28_000_000,depositPct:0.20,status:"operational",type:"Mixed Use",
   incomeMonthly:500_000,incomeAnnual:6_000_000,expenses:80_000,bondRate:0.115,bondYears:20,
   note:"68 × 2-bed apts + 17 rooms + 6 retail stores. 20 covered bays. Lift. 21.4% gross ROI. Near Wits + CBD.",
   url:"https://www.property24.com/for-sale/braamfontein/johannesburg/gauteng/3857/113214633",
   img:"https://i.imgur.com/QgeTXyR.png",
   highlight:"21.4% Gross ROI — Biggest Income Asset",hColor:"#a07be8"},
  {id:"c6",order:6,name:"Parktown — Office Conversion",location:"Parktown, JHB",
   zarPrice:16_000_000,depositPct:0.25,status:"conversion",type:"Office → Student Acc",
   img:"https://i.imgur.com/K9UAddk.png",
   incomeMonthly:0,incomeAnnual:0,expenses:30_000,
   postConvMonthly:50*6500,postConvAnnual:50*6500*12,
   renoZAR:6_200_000,bondRate:0.115,bondYears:20,
   note:"2,345m² + 750m² common + canteen. 47 parking bays. Est. 50 rooms post-conversion.",
   url:"https://www.property24.com/for-sale/parktown/johannesburg/gauteng/4390/116684304",
   highlight:"Highest Upside Post-Conversion",hColor:"#f0a030"},
];

const moms={name:"Family Building — 40 Units",monthlyZAR:40*8000,annualZAR:40*8000*12,rehabZAR:4_000_000,
  note:"Title in mom's name. Family agreement needed. 40 units @ R8K/mo after R4M rehab. Zero acquisition cost."};

function bond(price,dep,rate,yrs){
  const loan=price*(1-dep),r=rate/12,n=yrs*12;
  return (loan*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
}
function cf(prop){
  const inc=prop.incomeMonthly||0;
  const b=prop.zarPrice>0?bond(prop.zarPrice,prop.depositPct,prop.bondRate,prop.bondYears):0;
  return inc-(prop.expenses||0)-b;
}
function compound(monthly,rate,years){
  const r=rate/12;
  return monthly*((Math.pow(1+r,years*12)-1)/r);
}

// Income calcs
const grossTrading=15_000, netTrading=grossTrading*(1-TAX.tradingRate);
const grossSalaryUSD=toUSD(100_000,CAD), netSalaryMonthly=(grossSalaryUSD/12)*(1-TAX.canadianRate);
const totalCommAnnualZAR=commercial.reduce((a,c)=>a+(c.incomeAnnual||c.postConvAnnual||0),0)+moms.annualZAR;
const grossCommMonthlyUSD=toUSD(totalCommAnnualZAR,ZAR)/12;
const netCommRetained=grossCommMonthlyUSD*(1-TAX.saCorpRate);
const netCommExtracted=grossCommMonthlyUSD*(1-TAX.saEffective);
const grossAirbnb=(55_000+50_000)/12, netAirbnb=grossAirbnb*(1-TAX.saCorpRate);
const grossFarm=(toUSD(430*4500,ZAR)+15_000)/12, netFarm=grossFarm*(1-TAX.saCorpRate);
const totalGross=grossTrading+grossSalaryUSD/12+grossCommMonthlyUSD+grossAirbnb+grossFarm;
const totalNet=netTrading+netSalaryMonthly+netCommRetained+netAirbnb+netFarm;
const totalDeposits=commercial.reduce((a,c)=>a+c.zarPrice*c.depositPct,0);
const totalReno=commercial.reduce((a,c)=>a+(c.renoZAR||0),0)+moms.rehabZAR;

const Tag=({c,children})=>(
  <span style={{background:c+"18",color:c,border:`1px solid ${c}30`,borderRadius:3,fontSize:9,
    padding:"2px 8px",letterSpacing:"0.12em",textTransform:"uppercase",whiteSpace:"nowrap"}}>
    {children}
  </span>
);

const KPI=({label,value,sub,color,big})=>(
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`2px solid ${color}`,borderRadius:6,padding:"15px 13px"}}>
    <div style={{fontSize:9,letterSpacing:"0.2em",color:C.muted,textTransform:"uppercase",marginBottom:5}}>{label}</div>
    <div style={{fontSize:big?23:17,fontWeight:700,color,marginBottom:3,letterSpacing:"-0.02em"}}>{value}</div>
    {sub&&<div style={{fontSize:10,color:C.muted,lineHeight:1.4}}>{sub}</div>}
  </div>
);

const ImgPlaceholder=({prop})=>{
  const [err,setErr]=useState(false);
  return(
    <div style={{width:"100%",height:160,background:C.dim,borderRadius:"6px 6px 0 0",
      overflow:"hidden",position:"relative"}}>
      {prop.img&&!err
        ?<img src={prop.img} alt={prop.name} onError={()=>setErr(true)}
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
        :<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:6,border:`2px dashed ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase"}}>📷 Add Photo Here</div>
          <div style={{fontSize:9,color:C.muted,opacity:0.6}}>{prop.location}</div>
        </div>
      }
      <a href={prop.url} target="_blank" rel="noreferrer"
        style={{fontSize:9,color:"#fff",textDecoration:"none",letterSpacing:"0.1em",
          position:"absolute",bottom:8,right:10,background:"#00000088",padding:"3px 8px",borderRadius:3}}>
        VIEW LISTING →
      </a>
    </div>
  );
};

const TABS=["Overview","Commercial","Cash Flow","Tax","Investments","Roadmap"];

export default function App(){
  const [tab,setTab]=useState("Overview");
  const [ready,setReady]=useState(false);
  useEffect(()=>{setTimeout(()=>setReady(true),100);},[]);

  return(
    <div style={{fontFamily:"'Courier New',monospace",background:C.bg,color:C.text,minHeight:"100vh"}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(160deg,#060e1a,#08060f 60%,#060e1a)",
        borderBottom:`1px solid ${C.border}`,padding:"30px 20px 22px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:
          "radial-gradient(circle at 15% 50%,#4a9eff07,transparent 55%),radial-gradient(circle at 85% 20%,#d4a85307,transparent 50%)",
          pointerEvents:"none"}}/>
        <div style={{maxWidth:980,margin:"0 auto",position:"relative"}}>
          <div style={{fontSize:9,letterSpacing:"0.5em",color:C.gold,textTransform:"uppercase",marginBottom:8,
            opacity:ready?1:0,transition:"opacity 0.8s"}}>
            LEGACY WEALTH PLAN · FINAL VERSION · APRIL 2026 · POST-TAX
          </div>
          <h1 style={{fontSize:26,fontWeight:700,margin:"0 0 6px",color:"#f0ece0",letterSpacing:"-0.02em",
            opacity:ready?1:0,transition:"opacity 0.8s 0.2s"}}>
            TONY'S MASTER PORTFOLIO PLAN
          </h1>
          <div style={{fontSize:11,color:C.muted,marginBottom:14,opacity:ready?1:0,transition:"opacity 0.8s 0.3s"}}>
            Bonded commercial strategy · SA Pty Ltd · Mauritius tax base · Progressive DCA · Real listing prices
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",opacity:ready?1:0,transition:"opacity 0.8s 0.5s"}}>
            {[["USD/ZAR",ZAR],["USD/MUR",MUR],["USD/CAD",CAD],["Corp Tax","27%"],["Trading Tax","~2%"],["CA Tax","~31%"]].map(([k,v])=>(
              <div key={k} style={{background:C.dim,border:`1px solid ${C.border}`,borderRadius:3,padding:"4px 10px",fontSize:10}}>
                <span style={{color:C.muted}}>{k}: </span><span style={{color:C.gold}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,overflowX:"auto"}}>
        <div style={{maxWidth:980,margin:"0 auto",display:"flex",padding:"0 20px"}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              background:"none",border:"none",cursor:"pointer",padding:"13px 15px 11px",
              fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",whiteSpace:"nowrap",
              fontFamily:"inherit",color:tab===t?C.gold:C.muted,
              borderBottom:tab===t?`2px solid ${C.gold}`:"2px solid transparent",
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:980,margin:"0 auto",padding:"24px 20px"}}>

        {/* ══ OVERVIEW ══ */}
        {tab==="Overview"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:20}}>
              <KPI label="Comm. Acquisition" value={R(commercial.reduce((a,c)=>a+c.zarPrice,0))} sub="6 properties bonded" color={C.gold}/>
              <KPI label="Total Upfront" value={R(Math.round(totalDeposits+totalReno))} sub="Deposits + reno/rehab" color={C.blue}/>
              <KPI label="Gross Monthly (Full)" value={$$(Math.round(totalGross))} sub="All streams, full portfolio" color={C.green} big/>
              <KPI label="Net Retained (Full)" value={$$(Math.round(totalNet))} sub="Post-tax, in company" color={C.teal}/>
              <KPI label="Net If Extracted" value={$$(Math.round(netCommExtracted+netTrading+netSalaryMonthly))} sub="Dividends + salary + trading" color={C.purple}/>
              <KPI label="Invest Portfolio 15yr" value={$$(Math.round(compound(6900,0.09,15)))} sub="Progressive DCA @ 9% avg" color={C.amber}/>
            </div>

            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:18,marginBottom:14}}>
              <div style={{fontSize:9,letterSpacing:"0.25em",color:C.green,textTransform:"uppercase",marginBottom:14}}>
                Monthly Income — Full Portfolio (Gross → Net)
              </div>
              {[
                {label:"Commercial Rentals — Pty Ltd (27% corp)",gross:grossCommMonthlyUSD,net:netCommRetained,color:C.gold},
                {label:"Trading Income — Mauritius (~2%)",gross:grossTrading,net:netTrading,color:C.blue},
                {label:"Canadian Salary (31% effective)",gross:grossSalaryUSD/12,net:netSalaryMonthly,color:C.teal},
                {label:"Airbnb — Mauritius + Sandton (27% corp)",gross:grossAirbnb,net:netAirbnb,color:C.purple},
                {label:"Farm Lease + Farmhouse Airbnb (27% corp)",gross:grossFarm,net:netFarm,color:C.amber},
              ].map(r=>(
                <div key={r.label} style={{marginBottom:13}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:11,flexWrap:"wrap",gap:4}}>
                    <span style={{color:"#bbb"}}>{r.label}</span>
                    <div>
                      <span style={{color:C.muted,fontSize:10}}>{$$(Math.round(r.gross))} → </span>
                      <span style={{color:r.color,fontWeight:700}}>{$$(Math.round(r.net))}/mo</span>
                    </div>
                  </div>
                  <div style={{background:C.dim,height:4,borderRadius:2}}>
                    <div style={{width:`${Math.min(100,(r.net/totalNet)*100)}%`,height:"100%",background:r.color,borderRadius:2}}/>
                  </div>
                </div>
              ))}
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,fontSize:12}}>
                <span><span style={{color:C.muted}}>Gross: </span><span style={{color:C.muted}}>{$$(Math.round(totalGross))}/mo</span></span>
                <span><span style={{color:C.muted}}>Net retained: </span><span style={{color:C.green,fontWeight:700}}>{$$(Math.round(totalNet))}/mo · {$$(Math.round(totalNet*12))}/yr</span></span>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
              {[
                {icon:"🏢",title:"Commercial First",body:"Income assets before lifestyle. Every rand of rental income funds the next acquisition via Pty Ltd.",color:C.gold},
                {icon:"🇿🇦",title:"SA Pty Ltd",body:"27% corp tax vs 45% personal. Reinvest inside entity. Extract dividends only when needed.",color:C.blue},
                {icon:"🇲🇺",title:"Mauritius Base",body:"Trading income ~$180K/yr effectively tax-free. Penthouse = genuine substance for residency.",color:C.teal},
                {icon:"📈",title:"Progressive DCA",body:"% of surplus into VOO/SCHD/VWO from day one. Becomes 6th income stream in 10–15 years.",color:C.green},
              ].map(p=>(
                <div key={p.title} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${p.color}`,borderRadius:6,padding:"14px 16px"}}>
                  <div style={{fontSize:18,marginBottom:6}}>{p.icon}</div>
                  <div style={{fontSize:12,color:p.color,fontWeight:700,marginBottom:5}}>{p.title}</div>
                  <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>{p.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ COMMERCIAL ══ */}
        {tab==="Commercial"&&(
          <div>
            <div style={{fontSize:9,letterSpacing:"0.25em",color:C.gold,textTransform:"uppercase",marginBottom:18}}>
              Commercial Portfolio — {R(commercial.reduce((a,c)=>a+c.zarPrice,0))} total · Bonded strategy
            </div>

            {/* Mom's building */}
            <div style={{background:"#080f0a",border:`1px solid ${C.green}44`,borderLeft:`3px solid ${C.green}`,borderRadius:6,padding:16,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{fontSize:13,color:C.text,marginBottom:6}}>🏠 {moms.name}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                    <Tag c={C.green}>Already Owned</Tag><Tag c={C.amber}>Family Agreement Needed</Tag>
                  </div>
                  <div style={{fontSize:11,color:C.muted}}>{moms.note}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,color:C.green,fontWeight:700}}>{R(moms.monthlyZAR)}<span style={{fontSize:10,color:C.muted}}>/mo gross</span></div>
                  <div style={{fontSize:10,color:C.teal}}>Retained (27%): {R(Math.round(moms.monthlyZAR*0.73))}/mo</div>
                  <div style={{fontSize:10,color:C.amber}}>Rehab: {R(moms.rehabZAR)}</div>
                </div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>
              {commercial.map(prop=>{
                const b=bond(prop.zarPrice,prop.depositPct,prop.bondRate,prop.bondYears);
                const netCF=cf(prop);
                const dep=prop.zarPrice*prop.depositPct;
                const yld=prop.incomeAnnual>0?(prop.incomeAnnual/prop.zarPrice*100).toFixed(1):null;
                const cfColor=netCF>10000?C.green:netCF>0?C.teal:C.amber;
                return(
                  <div key={prop.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,overflow:"hidden"}}>
                    <ImgPlaceholder prop={prop}/>
                    <div style={{padding:"12px 14px 14px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,flexWrap:"wrap",gap:4}}>
                        <div>
                          <div style={{fontSize:9,color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase"}}>#{prop.order} · {prop.type}</div>
                          <div style={{fontSize:13,color:C.text,fontWeight:700}}>{prop.name}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:14,color:C.gold,fontWeight:700}}>{R(prop.zarPrice)}</div>
                          {yld&&<div style={{fontSize:10,color:C.teal}}>{yld}% yield</div>}
                        </div>
                      </div>

                      <div style={{background:prop.hColor+"15",border:`1px solid ${prop.hColor}33`,borderRadius:3,
                        padding:"3px 8px",fontSize:9,color:prop.hColor,letterSpacing:"0.1em",marginBottom:8}}>
                        ★ {prop.highlight}
                      </div>

                      <div style={{fontSize:10,color:C.muted,lineHeight:1.6,marginBottom:10}}>{prop.note}</div>

                      <div style={{background:C.dim,borderRadius:4,padding:"10px 12px",fontSize:10}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px 10px"}}>
                          <div><span style={{color:C.muted}}>Deposit: </span><span style={{color:C.blue}}>{R(Math.round(dep))}</span></div>
                          <div><span style={{color:C.muted}}>Bond/mo: </span><span style={{color:C.red}}>{R(Math.round(b))}</span></div>
                          {prop.incomeMonthly>0&&<>
                            <div><span style={{color:C.muted}}>Income/mo: </span><span style={{color:C.green}}>{R(prop.incomeMonthly)}</span></div>
                            <div><span style={{color:C.muted}}>Net CF: </span><span style={{color:cfColor}}>{netCF>0?"+":""}{R(Math.round(netCF))}</span></div>
                          </>}
                          {prop.renoZAR&&<div style={{gridColumn:"1/-1"}}><span style={{color:C.muted}}>Reno: </span><span style={{color:C.amber}}>{R(prop.renoZAR)}</span></div>}
                        </div>
                        {prop.incomeMonthly>0&&(
                          <div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}`,color:C.teal}}>
                            Retained (27% corp): {R(Math.round(prop.incomeMonthly*0.73))}/mo
                          </div>
                        )}
                        {prop.status==="conversion"&&(
                          <div style={{marginTop:6,color:C.amber}}>Post-conv est: {R(prop.postConvMonthly)}/mo</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{background:C.card,border:`1px solid ${C.gold}`,borderRadius:6,padding:"14px 18px",marginTop:16,
              display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
              {[
                {label:"Total Deposits",val:R(Math.round(totalDeposits)),color:C.blue},
                {label:"Reno + Rehab",val:R(Math.round(totalReno)),color:C.amber},
                {label:"Total Upfront",val:R(Math.round(totalDeposits+totalReno)),color:C.gold},
                {label:"Gross Annual Income",val:R(Math.round(totalCommAnnualZAR)),color:C.green},
              ].map(r=>(
                <div key={r.label}>
                  <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:4}}>{r.label}</div>
                  <div style={{fontSize:14,color:r.color,fontWeight:700}}>{r.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ CASH FLOW ══ */}
        {tab==="Cash Flow"&&(
          <div>
            <div style={{fontSize:9,letterSpacing:"0.25em",color:C.teal,textTransform:"uppercase",marginBottom:8}}>
              Property Cash Flow — Income vs Bond vs Net
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:18}}>
              Bond: 20% deposit · 11.5% · 20yr. Self-funding = income covers bond without your personal money.
            </div>

            {[...commercial,
              {id:"mom",name:moms.name,incomeMonthly:moms.monthlyZAR,expenses:15_000,zarPrice:0,depositPct:0,bondRate:0,bondYears:0,status:"owned"}
            ].map(prop=>{
              const income=prop.incomeMonthly||prop.postConvMonthly||0;
              const b=prop.zarPrice>0?bond(prop.zarPrice,prop.depositPct,prop.bondRate,prop.bondYears):0;
              const netCF=income-(prop.expenses||0)-b;
              const cfColor=netCF>20000?C.green:netCF>0?C.teal:netCF>-20000?C.amber:C.red;
              const cover=b>0?Math.min(150,(income/b)*100):100;
              return(
                <div key={prop.id} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`3px solid ${cfColor}`,borderRadius:6,padding:"14px 16px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:10}}>
                    <div>
                      <div style={{fontSize:13,color:C.text,marginBottom:4}}>{prop.name}</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {b>0&&<Tag c={C.blue}>Bond {R(Math.round(b))}/mo</Tag>}
                        {income>0&&<Tag c={C.green}>Income {R(income)}/mo</Tag>}
                        {prop.status==="owned"&&<Tag c={C.green}>No Acquisition Cost</Tag>}
                        {prop.status==="conversion"&&<Tag c={C.amber}>Income post-conversion only</Tag>}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:22,color:cfColor,fontWeight:700}}>{netCF>0?"+":""}{R(Math.round(netCF))}</div>
                      <div style={{fontSize:10,color:C.muted}}>net/month</div>
                    </div>
                  </div>
                  {b>0&&income>0&&(
                    <div style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginBottom:4}}>
                        <span>Income covers {cover.toFixed(0)}% of bond</span>
                        <span style={{color:cover>=100?C.green:C.amber}}>{cover>=100?"✓ SELF-FUNDING":"⚠ NEEDS TOP-UP"}</span>
                      </div>
                      <div style={{background:C.dim,height:5,borderRadius:3}}>
                        <div style={{width:`${Math.min(100,cover)}%`,height:"100%",background:cover>=100?C.green:C.amber,borderRadius:3}}/>
                      </div>
                    </div>
                  )}
                  <div style={{display:"flex",gap:16,fontSize:10,flexWrap:"wrap"}}>
                    <span><span style={{color:C.muted}}>Retained (27%): </span><span style={{color:C.teal}}>{R(Math.round(Math.max(0,netCF)*0.73))}/mo</span></span>
                    <span><span style={{color:C.muted}}>Annual: </span><span style={{color:cfColor}}>{netCF>0?"+":""}{R(Math.round(netCF*12))}/yr</span></span>
                  </div>
                </div>
              );
            })}

            <div style={{background:C.card,border:`1px solid ${C.teal}`,borderRadius:6,padding:16}}>
              <div style={{fontSize:9,color:C.teal,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:12}}>Portfolio Totals</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
                {[
                  {label:"Gross Income",val:R(Math.round(commercial.reduce((a,c)=>a+(c.incomeMonthly||0),0)+moms.monthlyZAR)),color:C.green},
                  {label:"Total Bond Pmts",val:R(Math.round(commercial.reduce((a,c)=>a+bond(c.zarPrice,c.depositPct,c.bondRate,c.bondYears),0))),color:C.red},
                  {label:"Net CF (all props)",val:R(Math.round(commercial.reduce((a,c)=>a+cf(c),0)+moms.monthlyZAR-15_000)),color:C.teal},
                  {label:"Retained (27%)",val:R(Math.round(commercial.reduce((a,c)=>a+Math.max(0,cf(c)),0)*0.73)),color:C.gold},
                ].map(r=>(
                  <div key={r.label}>
                    <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:4}}>{r.label}</div>
                    <div style={{fontSize:16,color:r.color,fontWeight:700}}>{r.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAX ══ */}
        {tab==="Tax"&&(
          <div>
            <div style={{fontSize:9,letterSpacing:"0.25em",color:C.amber,textTransform:"uppercase",marginBottom:18}}>
              Tax Structure — Entity Design
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,marginBottom:16}}>
              {[
                {entity:"SA Pty Ltd",flag:"🇿🇦",color:C.gold,tax:"27% corporate",
                  holds:["All 6 commercial properties","Mom's building","Airbnb income","Farm lease"],
                  note:"Reinvest inside company = defer personal tax indefinitely"},
                {entity:"Mauritius (Primary Base)",flag:"🇲🇺",color:C.teal,tax:"~0–3% on foreign income",
                  holds:["Trading accounts","ETF portfolio","Mauritius villa (substance)"],
                  note:"183+ days/yr. Penthouse is proof of genuine residence."},
                {entity:"Canada (Work Phase)",flag:"🇨🇦",color:C.blue,tax:"~31% effective",
                  holds:["Employment salary","Canadian banking"],
                  note:"Temporary. Cease residency cleanly when leaving."},
                {entity:"Personal (SA Citizen)",flag:"🇿🇦",color:C.purple,tax:"41.6% on extracted dividends",
                  holds:["Private properties","SA ID + footprint","Pty Ltd dividends"],
                  note:"Only extract what you need to live on."},
              ].map(e=>(
                <div key={e.entity} style={{background:C.card,border:`1px solid ${e.color}33`,borderRadius:6,padding:"14px 12px"}}>
                  <div style={{fontSize:12,color:e.color,fontWeight:700,marginBottom:8}}>{e.flag} {e.entity}</div>
                  <div style={{marginBottom:10}}>
                    {e.holds.map((h,i)=>(
                      <div key={i} style={{display:"flex",gap:6,fontSize:10,color:C.muted,marginBottom:3}}>
                        <span style={{color:e.color}}>—</span><span>{h}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:10,color:e.color,background:e.color+"12",padding:"4px 8px",borderRadius:3,marginBottom:6}}>{e.tax}</div>
                  <div style={{fontSize:9,color:C.muted,fontStyle:"italic"}}>{e.note}</div>
                </div>
              ))}
            </div>

            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:18,marginBottom:14}}>
              <div style={{fontSize:9,color:C.amber,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:14}}>
                Stream-by-Stream Tax Treatment
              </div>
              {[
                {stream:"Trading Profits",gross:$$(grossTrading)+"/mo",rate:"~2% Mauritius",net:$$(Math.round(netTrading))+"/mo",note:"Saves ~$81K/yr vs SA 45% personal rate",color:C.blue},
                {stream:"CA Salary (CAD 100K/yr)",gross:$$(Math.round(grossSalaryUSD/12))+"/mo",rate:"31% Canada",net:$$(Math.round(netSalaryMonthly))+"/mo",note:"Temporary phase only",color:C.teal},
                {stream:"Commercial — retained in Pty Ltd",gross:$$(Math.round(grossCommMonthlyUSD))+"/mo",rate:"27% SA corp",net:$$(Math.round(netCommRetained))+"/mo",note:"18% saved vs 45% personal. Reinvest = deferred.",color:C.gold},
                {stream:"Commercial — extracted as dividend",gross:$$(Math.round(grossCommMonthlyUSD))+"/mo",rate:"41.6% effective",net:$$(Math.round(netCommExtracted))+"/mo",note:"Extract only what lifestyle needs",color:C.amber},
                {stream:"ETF Capital Gains",gross:"Variable",rate:"~0% Mauritius",net:"~100% retained",note:"No CGT drag. Full compound effect.",color:C.green},
              ].map(r=>(
                <div key={r.stream} style={{padding:"12px 0",borderBottom:`1px solid ${C.border}`,
                  display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8,fontSize:11,alignItems:"center"}}>
                  <div>
                    <div style={{color:r.color,marginBottom:3}}>{r.stream}</div>
                    <div style={{fontSize:9,color:C.muted}}>{r.note}</div>
                  </div>
                  <div><Tag c={C.amber}>{r.rate}</Tag></div>
                  <div style={{textAlign:"right",color:r.color,fontWeight:700}}>{r.net}</div>
                </div>
              ))}
            </div>

            <div style={{background:"#0f0a08",border:`1px solid ${C.red}44`,borderRadius:6,padding:16}}>
              <div style={{fontSize:9,color:C.red,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:12}}>⚠ SARS Risk Flags</div>
              {[
                "183-day rule: >183 days in SA in any 12-month period (incl. 60 consecutive) = SA tax resident regardless of Mauritius address.",
                "Ordinarily resident test: If your family, assets, and 'home' is SA, SARS can argue you're still SA tax resident.",
                "SA-sourced income is always SA-taxable: Commercial rental income cannot be sheltered by Mauritius residency.",
                "Keep a travel log: SARS can request it. Poor records have collapsed legitimate structures.",
                "Use a cross-border specialist: SA-Mauritius tax attorney specifically — not a general accountant.",
              ].map((w,i)=>(
                <div key={i} style={{display:"flex",gap:10,marginBottom:8,fontSize:11,color:C.muted}}>
                  <span style={{color:C.red,flexShrink:0}}>!</span><span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ INVESTMENTS ══ */}
        {tab==="Investments"&&(
          <div>
            <div style={{fontSize:9,letterSpacing:"0.25em",color:C.green,textTransform:"uppercase",marginBottom:18}}>
              Investment Portfolio — Parallel Wealth Engine
            </div>

            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:18,marginBottom:14}}>
              <div style={{fontSize:9,color:C.green,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:14}}>
                Allocation (Mauritius-domiciled · ~0% CGT)
              </div>
              {[
                {label:"VOO / VTI — US Market ETF",pct:60,color:C.blue,note:"Core compounder. S&P 500 / Total US Market. ~9–10% avg annual return."},
                {label:"SCHD / VYM — Dividend ETF",pct:20,color:C.green,note:"Quarterly dividends. At full portfolio eventually = $2–3K/mo passive."},
                {label:"VWO — Emerging Markets ETF",pct:15,color:C.gold,note:"Africa + EM growth. Aligned with your geographic footprint."},
                {label:"High-Conviction Stocks",pct:5,color:C.purple,note:"Autodesk, Nvidia, Epic (if IPO). Industries you understand."},
              ].map(a=>(
                <div key={a.label} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:11}}>
                    <span style={{color:"#bbb"}}>{a.label}</span>
                    <span style={{color:a.color,fontWeight:700}}>{a.pct}%</span>
                  </div>
                  <div style={{background:C.dim,height:5,borderRadius:3,marginBottom:4}}>
                    <div style={{width:`${a.pct}%`,height:"100%",background:a.color,borderRadius:3}}/>
                  </div>
                  <div style={{fontSize:10,color:C.muted}}>{a.note}</div>
                </div>
              ))}
            </div>

            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:18,marginBottom:14}}>
              <div style={{fontSize:9,color:C.purple,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:6}}>
                Phased Surplus Allocation
              </div>
              <div style={{fontSize:10,color:C.muted,marginBottom:14}}>Applied to surplus after all obligations paid. Not gross income.</div>
              {[
                {phase:"Phase 1",income:"$10–25K surplus",invest:15,save:45,life:40,color:C.green},
                {phase:"Phase 2",income:"$25–50K surplus",invest:20,save:30,life:50,color:C.blue},
                {phase:"Phase 3",income:"$50–80K surplus",invest:25,save:25,life:50,color:C.gold},
                {phase:"Full Portfolio",income:"$80K+ surplus",invest:30,save:20,life:50,color:C.purple},
              ].map(ph=>(
                <div key={ph.phase} style={{background:C.dim,border:`1px solid ${ph.color}22`,borderRadius:4,padding:"12px 14px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:6}}>
                    <span style={{fontSize:12,color:ph.color,fontWeight:700}}>{ph.phase}</span>
                    <Tag c={C.muted}>{ph.income}</Tag>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {[{l:"Invest",v:ph.invest,c:C.green},{l:"Save",v:ph.save,c:C.blue},{l:"Life",v:ph.life,c:ph.color}].map(s=>(
                      <div key={s.l}>
                        <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3}}>{s.l}</div>
                        <div style={{fontSize:20,color:s.c,fontWeight:700}}>{s.v}%</div>
                        <div style={{background:C.border,height:3,borderRadius:2,marginTop:4}}>
                          <div style={{width:`${s.v}%`,height:"100%",background:s.c,borderRadius:2}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:18}}>
              <div style={{fontSize:9,color:C.amber,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:14}}>
                Growth Projections (9% avg annual · progressive contributions)
              </div>
              {[
                {yr:1,monthly:500,label:"Pre-Phase — salary only"},
                {yr:3,monthly:2000,label:"After M1+M2 — AKP running"},
                {yr:5,monthly:5000,label:"After M3 — portfolio self-funding"},
                {yr:8,monthly:10000,label:"After M4 — full commercial"},
                {yr:12,monthly:20000,label:"Full Portfolio — surplus deployment"},
              ].map((p,i)=>{
                const val=compound(p.monthly,0.09,p.yr);
                const max=compound(20000,0.09,15);
                return(
                  <div key={i} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:11,flexWrap:"wrap",gap:4}}>
                      <div>
                        <span style={{color:"#bbb"}}>Year {p.yr} </span>
                        <span style={{color:C.muted,fontSize:10}}>· {p.label} · ${p.monthly.toLocaleString()}/mo</span>
                      </div>
                      <span style={{color:C.amber,fontWeight:700}}>{$$(Math.round(val))}</span>
                    </div>
                    <div style={{background:C.dim,height:4,borderRadius:2}}>
                      <div style={{width:`${Math.min(100,(val/max)*100)}%`,height:"100%",background:C.amber,borderRadius:2}}/>
                    </div>
                  </div>
                );
              })}
              <div style={{marginTop:12,padding:12,background:C.dim,borderRadius:4}}>
                <div style={{fontSize:12,color:C.amber,fontWeight:700,marginBottom:4}}>
                  Year 15 est: {$$(Math.round(compound(6900,0.09,15)))}+
                </div>
                <div style={{fontSize:11,color:C.muted}}>
                  Becomes collateral for Phase 4 bank financing. $500K+ unlocks significantly better commercial bond terms.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ ROADMAP ══ */}
        {tab==="Roadmap"&&(
          <div>
            <div style={{fontSize:9,letterSpacing:"0.25em",color:C.gold,textTransform:"uppercase",marginBottom:18}}>
              Acquisition Roadmap — Commercial First Strategy
            </div>

            {[
              {phase:"PRE-PHASE",timing:"Now → Yr 1–2",color:C.teal,
               goal:"Build the launch pad",income:"$8–12K/mo net savings rate",
               actions:[
                 "Graduate → environment artist job in Canada (Vancouver / Toronto VFX hub)",
                 "Build Canadian credit history day 1 — secured card, paid in full monthly",
                 "Live minimal: furnished rental, zero lifestyle inflation until M1 acquired",
                 "Trade consistently — save 100% of net profits, emergency fund first ($30–40K)",
                 "Set up SA Pty Ltd BEFORE any commercial acquisition",
                 "Family conversation about mom's building — written informal agreement",
                 "Consult Mauritius tax attorney — structure before income gets large",
                 "DCA: $500/mo into VOO from day one. Non-negotiable.",
               ]},
              {phase:"MILESTONE 1",timing:"Yr 1–3",color:C.green,
               goal:"Auckland Park 34-Room — ZAR 10.5M · Bond it",income:"+ZAR 2.244M/yr confirmed from day one",
               actions:[
                 "Deposit: ZAR 2.1M (20%) · Bond: ~ZAR 92K/mo · Income: ZAR 187K/mo",
                 "Net cash flow: +ZAR 95K/mo — property PAYS FOR ITSELF from day one",
                 "Tenants service your bond. You just manage the asset.",
                 "100% of surplus cash flow → M2 deposit fund. Touch nothing.",
                 "Rehab mom's building if family agreement resolved (ZAR 4M)",
                 "Scale DCA to $1,000–2,000/mo from rental surplus",
               ]},
              {phase:"MILESTONE 2",timing:"Yr 2–4",color:C.blue,
               goal:"Auckland Park 22-Student — ZAR 8.5M · Bond it",income:"Combined AKP: ZAR 3.44M/yr",
               actions:[
                 "Deposit: ZAR 1.7M — funded from M1 surplus + savings",
                 "Bond: ~ZAR 75K/mo · Income: ZAR 100K/mo · Net CF: +ZAR 15K/mo",
                 "Same agent, same corridor — negotiate bundle pricing",
                 "Commercial income approaching your Canadian salary in USD terms",
                 "Allocation shifts to Phase 2: 20% invest / 30% save / 50% life",
               ]},
              {phase:"MILESTONE 3",timing:"Yr 3–5",color:C.amber,
               goal:"BFN 33-Unit (ZAR 9.2M) + Western Cape Farm (ZAR 15M)",income:"Commercial ~ZAR 6M/yr · Farm ZAR 1.5M+ lease",
               actions:[
                 "33-unit: ZAR 1.84M deposit + ZAR 1.2M reno = ZAR 3M total outlay",
                 "Post-reno 20–30% rent increase adds meaningful upside",
                 "Farm: Swellendam 430ha (ZAR 15M). Bond at 20%.",
                 "Lease land to commercial wine/fynbos operator from day one — passive",
                 "Build farmhouse on plot — family retreat + Airbnb when not in use",
                 "Mom's building operational: ZAR 320K/mo from 40 units",
                 "DCA scales to $5,000/mo. Portfolio approaching $100K.",
               ]},
              {phase:"MILESTONE 4",timing:"Yr 5–8",color:C.purple,
               goal:"BFN 53-Unit (ZAR 18.465M) + 68-Unit Monster (ZAR 28M)",income:"Commercial ZAR 15M+/yr · ~$900K gross",
               actions:[
                 "53-unit: NO transfer duty saves R1.5M. Deposit ZAR 3.69M.",
                 "68-unit: Deposit ZAR 5.6M. 21.4% gross ROI. Site due diligence first.",
                 "Walk the 68-unit at different times. Review 12mo actual bank statements.",
                 "Use existing portfolio as collateral — better bond terms from bank.",
                 "Parktown conversion (ZAR 16M) — acquire if capital allows.",
                 "Hire SA property manager — you'll be operating from Mauritius.",
                 "Commercial income now covers ALL personal obligations independently.",
                 "Allocation shifts to Phase 3: 25% invest / 25% save / 50% life.",
               ]},
              {phase:"MILESTONE 5",timing:"Yr 8–12",color:C.gold,
               goal:"Private Properties + Lifestyle — The Payoff",income:"Full portfolio: $70–90K+ gross · ~$50–60K net",
               actions:[
                 "Val de Vie Estate — primary SA residence. Mortgage covered by portfolio.",
                 "Mauritius villa — genuine tax residency base. Airbnb when away.",
                 "Sandton residence — Airbnb income asset when not in use.",
                 "Norway cabin — pure lifestyle, acquired from surplus.",
                 "Vehicle fleet: SA (Huracán + GT3 + Maybach + X7) · Mauritius (AM Vantage + RR) · Canada (Taycan + M8).",
                 "Leave Canada — cease residency cleanly. Departure tax assessment.",
                 "Establish Mauritius as genuine primary base: 183+ days/yr.",
                 "Trading moved to personal funded account. No more prop firm splits.",
                 "Investment portfolio $500K–$1M+. 6th passive income stream.",
                 "Full 30/20/50 allocation on surplus. The machine runs itself.",
               ]},
            ].map((ph,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderLeft:`4px solid ${ph.color}`,borderRadius:6,padding:"18px 20px",marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:10}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontSize:13,color:ph.color,fontWeight:700}}>{ph.phase}</span>
                    <Tag c={C.muted}>{ph.timing}</Tag>
                  </div>
                  <Tag c={ph.color}>{ph.income}</Tag>
                </div>
                <div style={{fontSize:12,color:C.text,fontWeight:600,marginBottom:12}}>{ph.goal}</div>
                <div style={{display:"grid",gap:5}}>
                  {ph.actions.map((a,j)=>(
                    <div key={j} style={{display:"flex",gap:8,fontSize:11,color:C.muted}}>
                      <span style={{color:ph.color,flexShrink:0}}>→</span><span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:18}}>
              <div style={{fontSize:9,color:C.gold,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:14}}>
                Income Milestones — Post-Tax Net
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${C.border}`}}>
                      {["Stage","Gross/mo","Net Post-Tax/mo","What Unlocked It"].map(h=>(
                        <th key={h} style={{padding:"8px 10px",textAlign:"left",color:C.muted,
                          fontWeight:400,fontSize:9,letterSpacing:"0.1em",fontFamily:"inherit"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Pre-Phase","~$21K","~$14K","Salary + trading only"],
                      ["After M1","~$28K","~$18K","AKP 34-room self-funding"],
                      ["After M2","~$34K","~$22K","+ AKP 22-student running"],
                      ["After M3","~$50K","~$32K","+ BFN 33-unit + farm"],
                      ["After M4","~$80K","~$50K","+ BFN 53 + 68-unit monster"],
                      ["Full Portfolio","~$90K+","~$58K+","All assets + investments"],
                    ].map(([s,g,n,w],idx)=>(
                      <tr key={idx} style={{borderBottom:`1px solid ${C.border}22`}}>
                        <td style={{padding:"10px",color:C.gold}}>{s}</td>
                        <td style={{padding:"10px",color:C.muted}}>{g}</td>
                        <td style={{padding:"10px",color:C.green,fontWeight:700}}>{n}</td>
                        <td style={{padding:"10px",color:C.muted}}>{w}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{marginTop:12,fontSize:10,color:C.muted,fontStyle:"italic",borderTop:`1px solid ${C.border}`,paddingTop:10}}>
                Net figures assume: trading at ~2% (MU), salary at 31% (CA), commercial retained in Pty Ltd at 27%, personal extraction minimised. Actual results depend on professional tax structuring. Consult a qualified SA/Mauritius cross-border tax attorney before executing.
              </div>
            </div>
          </div>
        )}

      </div>

      <div style={{borderTop:`1px solid ${C.border}`,padding:"14px 20px",textAlign:"center"}}>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.2em"}}>
          TONY'S LEGACY PLAN · FINAL VERSION · APRIL 2026 · FOR PLANNING PURPOSES ONLY · CONSULT A QUALIFIED PROFESSIONAL BEFORE EXECUTING
        </div>
      </div>
    </div>
  );
}
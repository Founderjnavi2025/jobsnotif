import { Suspense } from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
function getJobs(){const p=path.join(process.cwd(),"data","job_description_dataset.json");try{const r=JSON.parse(fs.readFileSync(p,"utf-8"));return Array.isArray(r)?r:r.positions||r.jobs||r.data||[]}catch{return[]}}
function slugify(t:string){return t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
const NAVY="#0A2540"; const BLUE="#0066FF"; const ORANGE="#FF7A00"; const GREY="#64748B";
const PER_PAGE=20;
async function JobsContent({searchParams}:{searchParams?:Promise<{q?:string;dept?:string;page?:string}>}){
  const jobs=getJobs(); const sp=await searchParams; const q=(sp?.q||"").toLowerCase(); const dept=sp?.dept||"Semua"; const page=Math.max(1,parseInt(sp?.page||"1")||1);
  const depts=["Semua",...Array.from(new Set(jobs.map((j:any)=>j.department).filter(Boolean)))] as string[];
  const filtered=jobs.filter((j:any)=>{ const mq=!q||j.job_title.toLowerCase().includes(q)||(j.job_description||"").toLowerCase().includes(q); const md=dept==="Semua"||j.department===dept; return mq&&md; });
  const totalPages=Math.max(1,Math.ceil(filtered.length/PER_PAGE));
  const safePage=Math.min(page,totalPages);
  const start=(safePage-1)*PER_PAGE;
  const paged=filtered.slice(start,start+PER_PAGE);
  const mk=(p:number)=>`/jobs?q=${encodeURIComponent(sp?.q||"")}&dept=${encodeURIComponent(dept)}&page=${p}`;
  return(<div style={{background:"white",minHeight:"100vh",fontFamily:"DM Sans, sans-serif",color:NAVY,paddingBottom:48}}>
    <div style={{maxWidth:1000,margin:"0 auto",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <Link href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}>
        <span style={{width:42,height:42,background:"linear-gradient(180deg,#38BDF8,#0066FF)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:900,fontSize:22,boxShadow:"0 6px 0 #0A2540"}}>J</span>
        <span style={{fontSize:24,fontWeight:900,color:NAVY}}>jobs<span style={{color:ORANGE}}>notif</span></span>
      </Link>
      <Link href="/jobs" style={{background:NAVY,color:"white",padding:"9px 16px",borderRadius:10,fontSize:13,fontWeight:800,textDecoration:"none"}}>Register</Link>
    </div>
    <div style={{maxWidth:1000,margin:"0 auto",padding:"6px 16px",display:"flex",gap:6,overflowX:"auto"}}>
      <Link href="/" style={{background:"#EEF5FF",color:BLUE,padding:"8px 14px",borderRadius:999,fontSize:13,fontWeight:800,textDecoration:"none",whiteSpace:"nowrap"}}>Home</Link>
      <Link href="/jobs" style={{background:BLUE,color:"white",padding:"8px 14px",borderRadius:999,fontSize:13,fontWeight:800,textDecoration:"none",whiteSpace:"nowrap"}}>Auto Find Jobs</Link>
      <span style={{color:NAVY,padding:"8px 10px",fontSize:13,fontWeight:600,whiteSpace:"nowrap"}}>Candidates</span>
      <span style={{color:NAVY,padding:"8px 10px",fontSize:13,fontWeight:600,whiteSpace:"nowrap"}}>See All PT</span>
    </div>
    <div style={{maxWidth:1000,margin:"0 auto",padding:"28px 16px 0"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:9,height:9,background:"#22C55E",borderRadius:999}}></span><span style={{color:BLUE,fontWeight:900,fontSize:12,letterSpacing:2}}>SMART JOB NOTIFICATIONS</span></div>
      <h1 style={{fontSize:42,fontWeight:900,lineHeight:1.05,margin:"14px 0 10px",color:NAVY,letterSpacing:-1}}>Opportunities<br/>find <span style={{color:BLUE}}>their way</span><br/>to you.</h1>
      <p style={{color:GREY,fontSize:15,lineHeight:1.6,margin:0,maxWidth:520}}>Discover jobs, connect with companies, and get notified when opportunities match your interests.</p>
      <form style={{marginTop:18,display:"flex",gap:8,background:"white",padding:6,borderRadius:16,border:"1px solid #E2E8F0",boxShadow:"0 4px 20px rgba(10,37,64,0.08)"}}>
        <input name="q" defaultValue={sp?.q||""} placeholder={`Cari dari ${jobs.length} loker...`} style={{flex:1,border:"none",outline:"none",padding:"12px 12px",fontSize:14,color:NAVY,background:"white"}} />
        <button style={{background:BLUE,color:"white",border:"none",padding:"12px 20px",borderRadius:12,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>Find My Job</button>
      </form>
      <div style={{display:"flex",gap:8,overflowX:"auto",marginTop:14,paddingBottom:4}}>
        {depts.map((d:string)=>(<Link key={d} href={`/jobs?dept=${encodeURIComponent(d)}&page=1`} style={{whiteSpace:"nowrap",background:d===dept?NAVY:"#F1F5F9",color:d===dept?"white":NAVY,padding:"8px 14px",borderRadius:999,fontSize:12,fontWeight:700,textDecoration:"none",border:"1px solid #E2E8F0"}}>{d}</Link>))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:18}}><span style={{width:9,height:9,background:"#22C55E",borderRadius:999}}></span><span style={{color:GREY,fontSize:13}}>Menampilkan {start+1}-{Math.min(start+PER_PAGE,filtered.length)} dari {filtered.length} loker - Halaman {safePage}/{totalPages}</span></div>
    </div>
    <div style={{maxWidth:1000,margin:"0 auto",padding:"24px 16px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {paged.map((job:any,i:number)=>{ const slug=slugify(job.job_title); const min=job.salary_estimate?.minimum||0; const max=job.salary_estimate?.maximum||0; return(
          <Link key={i} href={`/jobs/${slug}`} style={{textDecoration:"none",color:NAVY,background:"white",borderRadius:20,padding:18,border:"1px solid #E2E8F0",display:"block",boxShadow:"0 2px 12px rgba(10,37,64,0.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{width:44,height:44,background:"#EEF5FF",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:20,color:BLUE}}>{job.job_title[0]}</div><span style={{fontSize:11,background:"#F1F5F9",padding:"5px 10px",borderRadius:20,fontWeight:700,color:NAVY}}>{job.employment_type}</span></div>
            <div style={{fontSize:11,color:BLUE,fontWeight:800,marginTop:12}}>{job.department} - {job.job_level}</div>
            <h3 style={{margin:"6px 0",fontSize:17,lineHeight:1.3,color:NAVY}}>{job.job_title}</h3>
            <p style={{fontSize:13,color:GREY,lineHeight:1.5,height:60,overflow:"hidden",margin:0}}>{job.job_description}</p>
            <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>{(job.technical_skills||[]).slice(0,3).map((s:string)=>(<span key={s} style={{fontSize:11,background:"#F8FAFC",border:"1px solid #E2E8F0",padding:"4px 8px",borderRadius:999,color:NAVY}}>{s}</span>))}</div>
            <div style={{fontWeight:900,marginTop:14,fontSize:14,color:NAVY}}>Rp {(min/1000000).toFixed(1)} Jt - Rp {(max/1000000).toFixed(1)} Jt <span style={{fontWeight:400,fontSize:11,color:GREY}}>/ bulan</span></div>
            <div style={{background:BLUE,color:"white",textAlign:"center",padding:11,borderRadius:12,marginTop:12,fontWeight:800,fontSize:13}}>Lihat Detail</div>
          </Link>)})}
      </div>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:24,flexWrap:"wrap"}}>
        {safePage>1&&<Link href={mk(safePage-1)} style={{background:"#F1F5F9",color:NAVY,padding:"10px 18px",borderRadius:12,fontWeight:800,textDecoration:"none",fontSize:13,border:"1px solid #E2E8F0"}}>Sebelumnya</Link>}
        {[safePage-1,safePage,safePage+1].filter(p=>p>=1&&p<=totalPages).map(p=>(<Link key={p} href={mk(p)} style={{background:p===safePage?BLUE:"#F1F5F9",color:p===safePage?"white":NAVY,padding:"10px 16px",borderRadius:12,fontWeight:800,textDecoration:"none",fontSize:13,border:"1px solid #E2E8F0"}}>{p}</Link>))}
        {safePage<totalPages&&<Link href={mk(safePage+1)} style={{background:BLUE,color:"white",padding:"10px 18px",borderRadius:12,fontWeight:800,textDecoration:"none",fontSize:13}}>Berikutnya</Link>}
      </div>
      <div style={{textAlign:"center",color:GREY,fontSize:12,marginTop:10}}>Total {totalPages} halaman - Hemat kuota, load 20 loker doang per halaman.</div>
    </div>
  </div>)
}

export default function Page({searchParams}: {
  searchParams: Promise<{q?:string;dept?:string;page?:string}>
}) {
  return (
    <Suspense fallback={
      <div style={{padding:40,textAlign:"center"}}>
        Loading jobs...
      </div>
    }>
      <JobsContent searchParams={searchParams} />
    </Suspense>
  );
}

import fs from "fs";
import path from "path";
import Link from "next/link";
function getJobs(){const p=path.join(process.cwd(),"data","job_description_dataset.json");try{const r=JSON.parse(fs.readFileSync(p,"utf-8"));return Array.isArray(r)?r:r.positions||r.jobs||r.data||[]}catch{return[]}}
function slugify(t:string){return t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
const NAVY="#0A2540"; const BLUE="#0066FF"; const ORANGE="#FF7A00"; const GREY="#64748B";
export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const jobs=getJobs(); const job=jobs.find((j:any)=>slugify(j.job_title)===slug)||jobs[0];
  if(!job) return <div style={{padding:20}}>Loker tidak ditemukan. <Link href="/jobs">Kembali</Link></div>;
  const min=job.salary_estimate?.minimum||0; const max=job.salary_estimate?.maximum||0;
  const related=jobs.filter((j:any)=>j.department===job.department&&slugify(j.job_title)!==slug).slice(0,3);
  return(<div style={{background:"white",minHeight:"100vh",fontFamily:"DM Sans, sans-serif",color:NAVY,paddingBottom:48}}>
    <div style={{maxWidth:900,margin:"0 auto",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <Link href="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none"}}><span style={{width:42,height:42,background:"linear-gradient(180deg,#38BDF8,#0066FF)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:900,fontSize:22,boxShadow:"0 6px 0 #0A2540"}}>J</span><span style={{fontSize:24,fontWeight:900,color:NAVY}}>jobs<span style={{color:ORANGE}}>notif</span></span></Link>
      <Link href="/jobs" style={{background:NAVY,color:"white",padding:"9px 16px",borderRadius:10,fontSize:13,fontWeight:800,textDecoration:"none"}}>Register</Link>
    </div>
    <div style={{maxWidth:900,margin:"0 auto",padding:"10px 16px"}}><Link href="/jobs" style={{color:BLUE,textDecoration:"none",fontWeight:800,fontSize:13}}>Kembali ke Semua Loker</Link></div>
    <div style={{maxWidth:900,margin:"0 auto",padding:"10px 16px"}}>
      <div style={{display:"flex",gap:12,alignItems:"center"}}><div style={{width:56,height:56,background:"#EEF5FF",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:26,color:BLUE,flexShrink:0}}>{job.job_title[0]}</div><div><div style={{fontSize:11,color:BLUE,fontWeight:800}}>{job.department} - {job.job_level} - {job.employment_type}</div><h1 style={{margin:"4px 0 0",fontSize:26,lineHeight:1.2,color:NAVY}}>{job.job_title}</h1></div></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16}}>
        <span style={{background:NAVY,color:"white",padding:"8px 14px",borderRadius:999,fontSize:13,fontWeight:800}}>Rp {(min/1000000).toFixed(1)} Jt - Rp {(max/1000000).toFixed(1)} Jt / bulan</span>
        <span style={{background:"#F1F5F9",padding:"8px 14px",borderRadius:999,fontSize:13,color:NAVY}}>{job.experience_level||"Semua Level"}</span>
        <span style={{background:"#F1F5F9",padding:"8px 14px",borderRadius:999,fontSize:13,color:NAVY}}>{job.location||"Remote / Hybrid"}</span>
      </div>
      <div style={{background:"white",borderRadius:20,padding:20,border:"1px solid #E2E8F0",marginTop:20,boxShadow:"0 2px 12px rgba(10,37,64,0.04)"}}>
        <h2 style={{margin:"0 0 10px",fontSize:17,color:NAVY}}>Deskripsi Loker</h2>
        <p style={{color:GREY,fontSize:14,lineHeight:1.7,margin:0}}>{job.job_description}</p>
        <h3 style={{fontSize:15,margin:"20px 0 10px",color:NAVY}}>Tanggung Jawab</h3>
        <ul style={{paddingLeft:18,color:GREY,fontSize:14,lineHeight:1.7,margin:0}}>{(job.key_responsibilities||job.responsibilities||["Menjalankan operasional harian","Koordinasi dan laporan ke atasan","Menjaga kualitas kerja sesuai SOP"]).map((x:string,i:number)=><li key={i} style={{marginBottom:6}}>{x}</li>)}</ul>
        <h3 style={{fontSize:15,margin:"20px 0 10px",color:NAVY}}>Syarat</h3>
        <ul style={{paddingLeft:18,color:GREY,fontSize:14,lineHeight:1.7,margin:0}}>{(job.required_qualifications||job.requirements||[`Pengalaman ${job.experience_level||"sesuai level"}`,"Mampu berkomunikasi dan bekerja dalam tim","Disiplin dan mau belajar"]).map((x:string,i:number)=><li key={i} style={{marginBottom:6}}>{x}</li>)}</ul>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14}}>
        <div style={{background:"white",borderRadius:20,padding:18,border:"1px solid #E2E8F0"}}><div style={{fontWeight:800,fontSize:14,marginBottom:10,color:NAVY}}>Technical Skills</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{(job.technical_skills||[]).map((s:string)=><span key={s} style={{fontSize:12,background:"#EEF5FF",color:BLUE,padding:"6px 10px",borderRadius:999,fontWeight:700}}>{s}</span>)}</div></div>
        <div style={{background:"white",borderRadius:20,padding:18,border:"1px solid #E2E8F0"}}><div style={{fontWeight:800,fontSize:14,marginBottom:10,color:NAVY}}>Soft Skills</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{(job.soft_skills||[]).map((s:string)=><span key={s} style={{fontSize:12,background:"#FFF4E5",color:ORANGE,padding:"6px 10px",borderRadius:999,fontWeight:700}}>{s}</span>)}</div></div>
      </div>
      <div style={{marginTop:20}}>
        <Link
          href="https://jobs-notif.vercel.app/auto-find-jobs"
          style={{
            display:"block",
            width:"100%",
            boxSizing:"border-box",
            background:BLUE,
            color:"white",
            padding:"15px 20px",
            borderRadius:14,
            fontSize:15,
            fontWeight:900,
            textAlign:"center",
            textDecoration:"none",
            boxShadow:"0 5px 0 #0A2540"
          }}
        >
          Dapatkan Loker Seperti Ini di Telegram →
        </Link>
        <div style={{textAlign:"center",fontSize:12,color:"#64748B",marginTop:10}}>
          Gratis. Tanpa spam. Berhenti kapan saja.
        </div>
      </div>
      {related.length>0&&(<div style={{marginTop:20}}><div style={{fontWeight:900,fontSize:16,margin:"6px 0 12px",color:NAVY}}>Loker Se-departemen Lainnya</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>{related.map((r:any,i:number)=>(<Link key={i} href={`/jobs/${slugify(r.job_title)}`} style={{background:"white",border:"1px solid #E2E8F0",borderRadius:16,padding:14,textDecoration:"none",color:NAVY,display:"block"}}><div style={{fontSize:11,color:BLUE,fontWeight:800}}>{r.department}</div><div style={{fontWeight:800,margin:"6px 0",fontSize:15}}>{r.job_title}</div><div style={{fontSize:13,fontWeight:700}}>Rp {((r.salary_estimate?.minimum||0)/1000000).toFixed(1)} Jt - Rp {((r.salary_estimate?.maximum||0)/1000000).toFixed(1)} Jt</div></Link>))}</div></div>)}
    </div>
  </div>)
}
export async function generateStaticParams(){try{const jobs=getJobs();if(!jobs.length)return[{slug:"travel-consultant"}];return jobs.map((j:any)=>({slug:slugify(j.job_title)}))}catch{return[{slug:"travel-consultant"}]}}

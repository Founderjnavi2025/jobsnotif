export default function Page(){
  return(
    <div style={{background:"#fff",minHeight:"100vh",fontFamily:"system-ui, -apple-system, sans-serif",color:"#0A2540"}}>
      {/* HEADER - SAMA KAYAK SS */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(180deg,#2EA5FF,#0066FF)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:24,fontWeight:900,boxShadow:"0 4px 0 #0052CC"}}>J</div>
          <div style={{fontSize:28,fontWeight:900,letterSpacing:-0.5}}>jobs<span style={{color:"#FF7A00"}}>notif</span></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <span style={{color:"#64748B",fontWeight:600}}>Login</span>
          <span style={{background:"#0A2540",color:"#fff",padding:"10px 18px",borderRadius:10,fontWeight:700}}>Admin</span>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"20px"}}>
        {/* TITLE - ALA SS */}
        <div style={{display:"flex",alignItems:"center",gap:8,color:"#10B981",fontWeight:800,fontSize:12,letterSpacing:2}}><span style={{width:8,height:8,borderRadius:99,background:"#10B981",display:"inline-block"}}></span> SYSTEM OVERVIEW</div>
        <h1 style={{fontSize:48,lineHeight:1.05,letterSpacing:-1.5,margin:"14px 0 8px",fontWeight:900}}>Sistem lagi<br/>jalan <span style={{color:"#0066FF"}}>normal.</span></h1>
        <p style={{color:"#64748B",fontSize:17,margin:"0 0 28px"}}>Cuma angka doang. Ga ada detail. Lu tinggal liat sistem lagi apa.</p>

        {/* ID TELE + BOT TELE - 2 KARTU GEDE */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{border:"1px solid #E2E8F0",borderRadius:20,padding:20,boxShadow:"0 4px 0 #E2E8F0"}}>
            <div style={{color:"#64748B",fontSize:13,fontWeight:600}}>ID TELE</div>
            <div style={{fontSize:44,fontWeight:900,margin:"6px 0"}}>10</div>
            <div style={{color:"#10B981",fontSize:13,fontWeight:700}}>● Semua kebuku</div>
          </div>
          <div style={{border:"1px solid #E2E8F0",borderRadius:20,padding:20,boxShadow:"0 4px 0 #E2E8F0"}}>
            <div style={{color:"#64748B",fontSize:13,fontWeight:600}}>BOT TELE</div>
            <div style={{fontSize:44,fontWeight:900,margin:"6px 0"}}>ON</div>
            <div style={{color:"#10B981",fontSize:13,fontWeight:700}}>● Bot nyala</div>
          </div>
        </div>

        {/* TERKIRIM / TERIMA / TOLAK / MENUNGGU - 4 KARTU */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:16}}>
          {[
            ["TERKIRIM","1","#0066FF"],
            ["TERIMA","1","#10B981"],
            ["TOLAK","1","#EF4444"],
            ["MENUNGGU","1","#FF7A00"],
          ].map(([label,val,color]:any)=>(
            <div key={label} style={{border:"1px solid #E2E8F0",borderRadius:16,padding:16,textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:900,color}}>{val}</div>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:1,color:"#64748B"}}>{label}</div>
            </div>
          ))}
        </div>

        {/* TOKEN - ALA SS, TOMBOL GEDE */}
        <div style={{border:"1px solid #E2E8F0",borderRadius:20,padding:20,marginTop:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{color:"#64748B",fontSize:13,fontWeight:600}}>TOKEN</div>
            <div style={{fontSize:32,fontWeight:900}}>20 <span style={{fontSize:14,fontWeight:600,color:"#64748B"}}>total</span></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <div style={{background:"#0A2540",color:"#fff",padding:"12px 18px",borderRadius:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:900}}>10</div><div style={{fontSize:11,opacity:0.8}}>CEO</div></div>
            <div style={{background:"#FF7A00",color:"#fff",padding:"12px 18px",borderRadius:12,textAlign:"center"}}><div style={{fontSize:20,fontWeight:900}}>10</div><div style={{fontSize:11,opacity:0.9}}>STAF</div></div>
          </div>
        </div>

        <div style={{display:"flex",gap:12,marginTop:20,flexWrap:"wrap"}}>
          <div style={{background:"#0066FF",color:"#fff",padding:"14px 22px",borderRadius:12,fontWeight:800,boxShadow:"0 4px 0 #0052CC"}}>Cek Bot Tele →</div>
          <div style={{border:"1px solid #E2E8F0",padding:"14px 22px",borderRadius:12,fontWeight:700,boxShadow:"0 4px 0 #E2E8F0"}}>Buat Token →</div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,color:"#94A3B8",fontSize:13,marginTop:20}}><span style={{width:8,height:8,borderRadius:99,background:"#10B981",display:"inline-block"}}></span> One platform. Better connections.</div>
      </div>
    </div>
  )
}

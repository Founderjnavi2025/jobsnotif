"use client";
import { useState } from "react";
export default function SubscribeForm({ jobsAvailable, currentJob }: any) {
  const [teleId, setTeleId] = useState("");
  const [wa, setWa] = useState("");
  const [selected, setSelected] = useState<string[]>([currentJob].filter(Boolean));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Kelompokin per group biar ga jadi lapangan
  const groups: any = {};
  (jobsAvailable||[]).forEach((j:any)=>{
    const g = j.group || "Jabatan";
    if(!groups[g]) groups[g]=[];
    groups[g].push(j);
  });

  const toggle = (id: string) => {
    if (selected.includes(id)) setSelected(selected.filter(s => s !== id));
    else {
      if (selected.length >= 2) return setStatus("Max 2 aja bre!");
      setSelected([...selected, id]);
    }
  };

  async function submit(e: any) {
    e.preventDefault();
    if (!teleId.trim()) return setStatus("Isi Telegram ID lu dulu bre! Contoh: @budi / 123456789");
    if (selected.length === 0) return setStatus("Pilih minat dulu!");
    setSaving(true);
    const res = await fetch("/api/candidates/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tele_id: teleId.trim(), telegram_id: teleId.trim(), telegram_username: teleId.trim(), teleId: teleId.trim(), whatsapp: wa.trim(), interests: selected }),
    });
    const result = await res.json();
    if (!res.ok || !result.telegramUrl) { setStatus(result.error || "Gagal"); setSaving(false); return; }
    window.location.assign(result.telegramUrl);
  }

  const q = search.toLowerCase();

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: 20, marginTop: 14, boxShadow: "0 2px 12px rgba(10,37,64,0.04)" }}>
      <div style={{ fontWeight: 900, color: "#0A2540" }}>Ambil Kunci di Telegram - Gratis</div>
      <form onSubmit={submit}>
        <input value={teleId} onChange={e => setTeleId(e.target.value)} placeholder="Your Telegram ID *  Contoh: @username / 123456789" style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #E2E8F0", margin: "10px 0 4px" }} />
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>Bot ngirim notif pake ID ini, bukan nama. Cek ID lu di @userinfobot</div>
        <input value={wa} onChange={e => setWa(e.target.value)} placeholder="WA (boleh kosong)" style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #E2E8F0", marginBottom: 10 }} />
        <div style={{ fontWeight: 700, color: "#0A2540" }}>Minat - max 2 ({selected.length}/2)</div>

        {/* YANG UDAH DIPILIH, SELALU KELIATAN */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "8px 0" }}>
          {selected.map((id:string)=>(
            <span key={id} style={{ padding: "8px 12px", borderRadius: 999, background: "#0066FF", color: "#fff", fontSize: 13 }}>{id} <b onClick={()=>toggle(id)} style={{cursor:"pointer"}}>×</b></span>
          ))}
        </div>

        {/* TOMBOL HIDE / SHOW - INI KUNCINYA */}
        <button type="button" onClick={()=>setOpen(!open)} style={{ width: "100%", padding: 12, borderRadius: 12, background: "#fff", border: "1px solid #E2E8F0", fontWeight: 800, cursor: "pointer" }}>
          {open ? "▲ Sembunyikan Pilihan Minat" : "▼ Pilih Minat Lainnya - Klik untuk Buka"}
        </button>

        {open && (
          <div style={{ marginTop: 10 }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari jabatan... misal: Driver" style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #E2E8F0", marginBottom: 10 }} />
            {Object.keys(groups).map((g)=>(
              <details key={g} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", marginBottom: 8, padding: "8px 10px" }}>
                <summary style={{ cursor: "pointer", fontWeight: 800, fontSize: 13 }}>{g} ({groups[g].length})</summary>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {groups[g].filter((j:any)=>!q || j.title.toLowerCase().includes(q)).slice(0, 30).map((j:any)=>(
                    <button type="button" key={j.id} onClick={()=>toggle(j.id)} style={{ padding: "7px 10px", borderRadius: 999, fontSize: 12, background: selected.includes(j.id) ? "#0066FF" : "#FFFFFF", color: selected.includes(j.id) ? "#fff" : "#0A2540", border: "1px solid #E2E8F0" }}>{j.title}</button>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}

        {status && <div style={{ fontSize: 13, color: "#DC2626", margin: "8px 0" }}>{status}</div>}
        <button type="submit" disabled={saving} style={{ width: "100%", background: "#0066FF", color: "#fff", padding: 14, borderRadius: 12, fontWeight: 800, border: "none", marginTop: 10 }}>{saving ? "Menyimpan..." : "Continue to Telegram →"}</button>
      </form>
    </div>
  );
}

// app/jobs/[slug]/PublicJobClient.tsx
"use client";
import { useState } from "react";

export default function PublicJobClient({ job, slug }: any) {
  const [teleId, setTeleId] = useState("");
  const [wa, setWa] = useState("");
  const [minat, setMinat] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const toggleMinat = (val: string) => {
    if (minat.includes(val)) {
      setMinat(minat.filter((m) => m !== val));
    } else {
      if (minat.length >= 2) return; // MAX 0/2 sesuai maunya lu
      setMinat([...minat, val]);
    }
  };

  const handleKunci = async () => {
    if (!teleId.trim()) {
      alert("Isi Tele ID dulu, bre!");
      return;
    }
    // Kirim ke API lu yang udah ada: /api/candidates/register
    await fetch("/api/candidates/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tele_id: teleId,
        wa: wa || null, // WA optional
        minat: minat,
        job_slug_dilihat: slug,
        status: "kandidat_aktif",
        sumber: "halaman_public",
      }),
    });
    setDone(true);
  };

  const gaji = job.salary_estimate
    ? `Rp ${job.salary_estimate.minimum?.toLocaleString("id-ID")} - Rp ${job.salary_estimate.maximum?.toLocaleString("id-ID")} / ${job.salary_estimate.period}`
    : "Nego";

  const pilihanMinat = [job.job_title, "Admin", "Kasir", "Supir", "Marketing"];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 20, fontFamily: "sans-serif" }}>
      {/* HEADER LOKER - TAMPIL SEMUA */}
      <div style={{ background: "#111", color: "#fff", padding: 20, borderRadius: 12 }}>
        <h1>{job.job_title}</h1>
        <p>{job.department} • {job.job_level} • {job.employment_type}</p>
        <p style={{ fontSize: 20, fontWeight: "bold" }}>💰 {gaji}</p>
        <p>{job.experience_level}</p>
      </div>

      <p style={{ marginTop: 20 }}>{job.job_description}</p>

      <h3>Responsibilities</h3>
      <ul>{job.responsibilities?.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>

      <h3>Qualifications</h3>
      <ul>{job.qualifications?.map((q: string, i: number) => <li key={i}>{q}</li>)}</ul>

      <h3>Skills</h3>
      <p>Technical: {job.technical_skills?.join(", ")}</p>
      <p>Soft: {job.soft_skills?.join(", ")}</p>

      {/* TOMBOL UPLOAD CV - KUNCI */}
      <div style={{ marginTop: 30, border: "2px dashed #000", padding: 20, borderRadius: 12, textAlign: "center" }}>
        <button
          disabled
          style={{ width: "100%", padding: 14, fontSize: 18, fontWeight: "bold", background: "#ccc", border: "none", borderRadius: 8, cursor: "not-allowed" }}
        >
          [ UPLOAD CV ] 🔒 KUNCI
        </button>
        <p style={{ fontWeight: "bold", marginTop: 12 }}>Terima Kunci Disini 👇</p>

        {!done ? (
          <>
            <input
              value={teleId}
              onChange={(e) => setTeleId(e.target.value)}
              placeholder="Tele ID @kamu (wajib)"
              style={{ width: "100%", padding: 12, marginTop: 8, borderRadius: 8, border: "1px solid #ccc" }}
            />
            <input
              value={wa}
              onChange={(e) => setWa(e.target.value)}
              placeholder="WA (optional, boleh kosong)"
              style={{ width: "100%", padding: 12, marginTop: 8, borderRadius: 8, border: "1px solid #ccc" }}
            />

            <p style={{ textAlign: "left", marginTop: 12 }}>Minat pilih {minat.length}/2</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {pilihanMinat.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleMinat(m)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 20,
                    border: minat.includes(m) ? "2px solid #000" : "1px solid #ccc",
                    background: minat.includes(m) ? "#000" : "#fff",
                    color: minat.includes(m) ? "#fff" : "#000",
                    cursor: "pointer",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={handleKunci}
              style={{ width: "100%", padding: 14, marginTop: 16, background: "#0088cc", color: "#fff", fontWeight: "bold", border: "none", borderRadius: 8, cursor: "pointer" }}
            >
              MENUJU BOT TELE →
            </button>
            <p style={{ fontSize: 12, color: "#666" }}>Klik ini, terus klik START di bot. Data lu langsung ke-save ke candidates.</p>
          </>
        ) : (
          <div style={{ background: "#e6ffed", padding: 16, borderRadius: 8, marginTop: 12 }}>
            <b>✅ Udah! Lu sekarang Kandidat Aktif.</b>
            <p>Tinggal nunggu notif ya. Kalo ada yang cocok, token asli bakal dikirim ke Tele ID lu.</p>
            <a
              href={`https://t.me/JobsNotifBot?start=${slug}`}
              target="_blank"
              style={{ display: "block", marginTop: 10, padding: 12, background: "#0088cc", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: "bold" }}
            >
              BUKA BOT TELE SEKARANG →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

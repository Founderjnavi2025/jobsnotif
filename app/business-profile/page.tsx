"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Company = { company_name: string; industry: string; contact_person: string; email: string; phone: string; website: string; location: string; };

type JobArchive = {
  id: string;
  token: string;
  company_name: string;
  job_title: string;
  status: string;
  created_at: string;
};
const emptyCompany: Company = { company_name: "", industry: "", contact_person: "", email: "", phone: "", website: "", location: "" };

export default function BusinessProfilePage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company>(emptyCompany);
  const [originalCompany, setOriginalCompany] = useState<Company>(emptyCompany);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [jobs, setJobs] = useState<JobArchive[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setNotice(`Logout failed: ${error.message}`);
      return;
    }

    router.replace("/login");
    router.refresh();
  }


  useEffect(() => {
    async function loadBusiness() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) { router.replace("/login"); return; }
      if (data.user.user_metadata?.account_type !== "business") {
        await supabase.auth.signOut(); router.replace("/login"); return;
      }
      const m = data.user.user_metadata || {};
      const profile: Company = {
        company_name: m.company_name || "",
        industry: m.industry || "",
        contact_person: m.contact_person || "",
        email: m.recruitment_email || data.user.email || "",
        phone: m.phone || "",
        website: m.website || "",
        location: m.company_location || "",
      };
      setCompany(profile);
      setOriginalCompany(profile);

      const { data: jobRows, error: jobsError } = await supabase
        .from("jobs")
        .select("id, token, company_name, job_title, status, created_at")
        .eq("company_id", data.user.id)
        .order("created_at", { ascending: false });

      if (jobsError) {
        setNotice(`Could not load Inventory Token: ${jobsError.message}`);
      } else {
        setJobs((jobRows || []) as JobArchive[]);
      }

      setJobsLoading(false);
      setLoading(false);
    }
    loadBusiness();
  }, [router]);

  function updateField(f: keyof Company, v: string) { setCompany((c) => ({ ...c, [f]: v })); }
  function openEditor() { setCompany(originalCompany); setNotice(""); setEditing(true); }
  function cancelEditor() { setCompany(originalCompany); setEditing(false); setNotice(""); }

  async function saveProfile() {
    setSaving(true); setNotice("");
    const { data, error: ue } = await supabase.auth.getUser();
    if (ue || !data.user) { setNotice("Session expired. Please login again."); setSaving(false); router.replace("/login"); return; }
    const up: Company = {
      company_name: company.company_name.trim(),
      industry: company.industry.trim(),
      contact_person: company.contact_person.trim(),
      email: company.email.trim(),
      phone: company.phone.trim(),
      website: company.website.trim(),
      location: company.location.trim(),
    };
    const { error } = await supabase.auth.updateUser({
      data: { ...data.user.user_metadata, company_name: up.company_name, industry: up.industry, contact_person: up.contact_person, recruitment_email: up.email, phone: up.phone, website: up.website, company_location: up.location },
    });
    if (error) { setNotice(`Failed to save: ${error.message}`); setSaving(false); return; }
    setCompany(up); setOriginalCompany(up); setEditing(false); setNotice("Business profile successfully updated."); setSaving(false);
  }

  if (loading) return <main style={{ padding: 40 }}>Loading business workspace...</main>;

  const inputStyle = { display: "block", width: "100%", padding: 12, marginTop: 6, border: "1px solid #ccc", borderRadius: 10, fontSize: 14, background: "#fff", color: "#111" } as const;
  const labelStyle = { display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600 } as const;

  return (
    <main className="bp-clean" style={{ maxWidth: 900, margin: "0 auto", padding: 20, fontFamily: "sans-serif" }}>
      <header className="bp-clean-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 20, textDecoration: "none", color: "#111" }}>jobsnotif <small style={{ fontWeight: 400, fontSize: 12 }}>AI Job Alerts</small></Link>
        <span style={{ background: "#111", color: "#fff", padding: "6px 12px", borderRadius: 999, fontSize: 12 }}>Business Account</span>
      </header>

      {/* BANNER ATAS - TETEP ADA BRE */}
      <section className="bp-clean-hero" style={{ background: "#111", color: "#fff", borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <span style={{ fontSize: 12, letterSpacing: 1 }}>RECRUITMENT WORKSPACE</span>
        <h1 className="bp-clean-title" style={{ fontSize: 32, lineHeight: 1.2, margin: "10px 0" }}>Your next hire starts right here.</h1>
        <p style={{ opacity: 0.8 }}>Have an open position? Put your vacancy in front of potential candidates.</p>
        <Link className="bp-clean-cta" href="/create-job" style={{ display: "inline-block", marginTop: 16, background: "#fff", color: "#111", padding: "12px 20px", borderRadius: 12, fontWeight: 700, textDecoration: "none" }}>+ POST A JOB - Create your job vacancy now</Link>
      </section>

      {/* ===== PROFIL DIBENTANGIN DI HALAMAN, BRE. BUKAN POP-UP BRE ===== */}
      <section className="bp-clean-profile" style={{ border: "1px solid #ddd", borderRadius: 16, padding: 24, background: "#fff" }}>
        <div className="bp-clean-profile-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: 1, color: "#888" }}>COMPANY INFORMATION</span>
            <h2 style={{ fontSize: 24, margin: "6px 0" }}>Your Business Profile</h2>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                marginTop: 12,
                padding: "9px 16px",
                borderRadius: 10,
                border: "1px solid #fecaca",
                background: "#fff",
                color: "#dc2626",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
            <p style={{ color: "#666", margin: 0 }}>Manage the identity candidates see about your company.</p>
          </div>
          <button type="button" onClick={editing ? cancelEditor : openEditor} style={{ padding: "10px 18px", borderRadius: 999, background: "#111", color: "#fff", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
            {editing ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>

        {notice && <div style={{ background: "#eaffea", border: "1px solid #b8e6b8", padding: 12, borderRadius: 10, marginTop: 16 }}>{notice}</div>}

        {/* INFO PROFIL - SELALU KELIATAN BRE */}
        <div className="bp-clean-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
          <div className="bp-clean-info-card" style={{ background: "#f7f7f7", padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#888" }}>COMPANY NAME</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 4 }}>{company.company_name || "Your Company"}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>REGISTERED BUSINESS</div>
          </div>
          <div style={{ background: "#f7f7f7", padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#888" }}>CONTACT PERSON</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.contact_person || "Not set yet"}</div>
          </div>
          <div style={{ background: "#f7f7f7", padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#888" }}>RECRUITMENT EMAIL</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.email || "Not set yet"}</div>
          </div>
          <div style={{ background: "#f7f7f7", padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#888" }}>PHONE NUMBER</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.phone || "Not set yet"}</div>
          </div>
          <div className="bp-clean-info-card" style={{ background: "#f7f7f7", padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#888" }}>INDUSTRY</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.industry || "Not set yet"}</div>
          </div>
          <div className="bp-clean-info-card bp-clean-full" style={{ background: "#f7f7f7", padding: 16, borderRadius: 12, gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 11, color: "#888" }}>COMPANY WEBSITE</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.website || "Not set yet"}</div>
          </div>
          <div className="bp-clean-info-card bp-clean-full" style={{ background: "#f7f7f7", padding: 16, borderRadius: 12, gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 11, color: "#888" }}>COMPANY LOCATION</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.location || "Not set yet"}</div>
          </div>
        </div>

        {/* FORM EDIT - DIBENTANGIN DI BAWAHNYA, BRE. BUKAN POP-UP BRE */}
        {editing && (
          <div className="bp-clean-editor" style={{ marginTop: 24, borderTop: "2px dashed #111", paddingTop: 20 }}>
            <strong style={{ fontSize: 18 }}>Edit Company Information</strong>
            <p style={{ color: "#666", margin: "4px 0 16px" }}>Update your business identity</p>
            <div className="bp-clean-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <label style={labelStyle}>Company Name<input style={inputStyle} value={company.company_name} onChange={(e) => updateField("company_name", e.target.value)} placeholder="Company name" /></label>
              <label style={labelStyle}>Industry<input style={inputStyle} value={company.industry} onChange={(e) => updateField("industry", e.target.value)} placeholder="e.g. Technology, Manufacturing, Retail" /></label>
              <label style={labelStyle}>Contact Person<input style={inputStyle} value={company.contact_person} onChange={(e) => updateField("contact_person", e.target.value)} placeholder="Full name" /></label>
              <label style={labelStyle}>Recruitment Email<input style={inputStyle} type="email" value={company.email} onChange={(e) => updateField("email", e.target.value)} placeholder="recruitment@company.com" /></label>
              <label style={labelStyle}>Phone Number<input style={inputStyle} value={company.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+62 ..." /></label>
              <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>Company Website<input style={inputStyle} value={company.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://..." /></label>
              <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>Company Location<input style={inputStyle} value={company.location} onChange={(e) => updateField("location", e.target.value)} placeholder="e.g. Jakarta, Indonesia / Remote" /></label>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 18 }}>
              <button type="button" onClick={cancelEditor} disabled={saving} style={{ padding: "12px 20px", borderRadius: 10, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={saveProfile} disabled={saving} style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: "#111", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        )}
      </section>

      <section style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 16, padding: 24, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: 1, color: "#888" }}>JOB MANAGEMENT</span>
            <h2 style={{ fontSize: 24, margin: "6px 0" }}>Inventory Token</h2>
            <p style={{ color: "#666", margin: 0 }}>Your published vacancies and their unique access tokens.</p>
          </div>
          <div style={{ background: "#111", color: "#fff", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 700 }}>
            {jobs.length} {jobs.length === 1 ? "VACANCY" : "VACANCIES"}
          </div>
        </div>

        {jobsLoading ? (
          <p style={{ color: "#777", marginTop: 24 }}>Loading your job archive...</p>
        ) : jobs.length === 0 ? (
          <div style={{ marginTop: 20, padding: 24, borderRadius: 12, background: "#f7f7f7", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>▤</div>
            <strong>No job vacancies yet</strong>
            <p style={{ color: "#777", fontSize: 13 }}>Your published job tokens will appear here automatically.</p>
            <Link href="/create-job" style={{ display: "inline-block", marginTop: 8, padding: "10px 16px", borderRadius: 9, background: "#111", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
              + Create First Job
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 22 }}>
            {jobs.map((job) => (
              <article
                key={job.id}
                onClick={() => router.push(`/manager/${encodeURIComponent(job.token)}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/manager/${encodeURIComponent(job.token)}`);
                  }
                }}
                role="link"
                tabIndex={0}
                aria-label={`Open manager for ${job.job_title}`}
                style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 16, display: "grid", gap: 12, cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17 }}>{job.job_title}</h3>
                    <p style={{ margin: "5px 0 0", fontSize: 12, color: "#888" }}>{job.company_name}</p>
                  </div>
                  <span style={{
                    padding: "5px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    background: job.status === "published" ? "#e8f7ed" : job.status === "closed" ? "#f1f1f1" : "#fff4dc",
                    color: job.status === "published" ? "#18743b" : job.status === "closed" ? "#666" : "#946200"
                  }}>
                    {job.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ background: "#f7f7f7", padding: 12, borderRadius: 9 }}>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, marginBottom: 6 }}>ACCESS TOKEN</div>
                  <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, overflowWrap: "anywhere" }}>{job.token}</div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "#888" }}>
                    Created {new Date(job.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(job.token)
                        .then(() => setNotice(`Token for ${job.job_title} copied.`))
                        .catch(() => setNotice("Clipboard unavailable. Please copy the token manually."));
                    }}
                    style={{ padding: "9px 15px", border: "1px solid #111", borderRadius: 9, background: "#111", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}
                  >
                    Copy Token
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="bp-clean-footer" style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 12, color: "#888" }}>
        <span>© 2026 JobsNotif</span><span>AI Job Alerts · Smarter connections.</span>
      </footer>
    </main>
  );
}

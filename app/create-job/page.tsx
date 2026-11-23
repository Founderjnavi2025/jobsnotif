"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import dataset from "../../data/job_available.json";
import { supabase } from "../../lib/supabase";

type JobGroup = { id: string; label: string; options: string[]; };
const allGroups = (dataset as { groups: JobGroup[] }).groups;
const excluded = ["departments", "skills"];
const groups = allGroups.filter((g) => !excluded.includes(g.id));
const totalOptions = allGroups.reduce((t, g) => t + g.options.length, 0);

export default function CreateJobPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  // INI YANG KURANG TADI BRE - LOAD PROFIL DARI SUPABASE
  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.auth.getUser();
      const m = data.user?.user_metadata || {};
      setCompanyName(m.company_name || "");
      setContactPerson(m.contact_person || "");
    }
    loadProfile();
  }, []);

  const activeGroup = groups.find((g) => g.id === selected);
  const filteredOptions = activeGroup?.options.filter((o) => o.toLowerCase().includes(search.toLowerCase())) ?? [];

  return (
    <main className="jt-page">
      <header className="jt-header">
        <Link href="/business-profile" className="jt-brand">
          <span className="jt-logo">J</span> JobsNotif
        </Link>
        {/* PROFIL DIBENTANGIN DI SINI BRE */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right", lineHeight: 1.2 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{companyName || "Loading company..."}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{contactPerson || "Business Account"}</div>
          </div>
          <Link href="/business-profile" className="jt-back">← Business Profile</Link>
        </div>
      </header>

      <section className="jt-container">
        <div className="jt-intro">
          <span className="jt-eyebrow">RECRUITMENT WORKSPACE</span>
          <h1>What position are <span>you hiring?</span></h1>
          <p>Select an industry or job category first. Then choose the exact position for your vacancy.</p>
          {/* TUNJUKIN JUGA DI SINI BRE BIAR JELAS */}
          {companyName && <p style={{ marginTop: 8 }}><strong>Hiring as:</strong> {companyName} {contactPerson ? `(${contactPerson})` : ""}</p>}
        </div>

        <div className="jt-count">
          <div><span>AVAILABLE JOB CATEGORIES</span><strong>{groups.length} Categories</strong></div>
          <div><span>JSON DATA OPTIONS</span><strong>{totalOptions} Options</strong></div>
        </div>

        {!activeGroup ? (
          <>
            <div className="jt-section-title"><span>01</span><div><h2>Choose a job category</h2><p>Which type of worker does your company need?</p></div></div>
            <div className="jt-grid">
              {groups.map((group, index) => (
                <button type="button" className="jt-card jt-category-card" key={group.id} onClick={() => { setSelected(group.id); setSearch(""); }}>
                  <div className="jt-card-top"><span className="jt-number">{String(index + 1).padStart(2, "0")}</span><span className="jt-arrow">↗</span></div>
                  <h2>{group.label}</h2><p>{group.options.length} available choices</p>
                  <div className="jt-select">VIEW POSITIONS <span>→</span></div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button className="jt-back-category" type="button" onClick={() => { setSelected(null); setSearch(""); }}>← All categories</button>
            <div className="jt-section-title"><span>02</span><div><h2>{activeGroup.label}</h2><p>Select the exact position you want to recruit. {` ${activeGroup.options.length} choices available.`}</p></div></div>
            <input className="jt-position-search" placeholder="Search position..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="jt-position-grid">
              {filteredOptions.map((position, index) => (
                <Link key={`${activeGroup.id}-${position}-${index}`} href={`/create-job/form?template=${encodeURIComponent(position)}&group=${encodeURIComponent(activeGroup.id)}`} className="jt-position-option"><span>{position}</span><b>↗</b></Link>
              ))}
            </div>
            {filteredOptions.length === 0 && <div className="jt-empty"><h2>No position found</h2><p>Try another search keyword.</p></div>}
          </>
        )}
      </section>
    </main>
  );
}

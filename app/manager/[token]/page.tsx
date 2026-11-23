"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "../../../lib/supabase";

type Job = {
  id: string;
  token: string;
  company_name: string;
  job_title: string;
  status: string;
  created_at: string;
};

function ManagerTokenPageContent() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = decodeURIComponent(params.token || "");

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadJob() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const user = authData.user;

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      if (user.user_metadata?.account_type !== "business") {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      const { data, error: jobError } = await supabase
        .from("jobs")
        .select("id, token, company_name, job_title, status, created_at")
        .eq("token", token)
        .eq("company_id", user.id)
        .maybeSingle();

      if (!active) return;

      if (jobError) {
        setError(`Failed to load vacancy: ${jobError.message}`);
      } else if (!data) {
        setError("Vacancy not found or you do not have permission to access it.");
      } else {
        setJob(data as Job);
      }

      setLoading(false);
    }

    loadJob();

    return () => {
      active = false;
    };
  }, [token, router]);

  if (loading) {
    return <main style={{ padding: 40 }}>Loading vacancy manager...</main>;
  }

  if (error || !job) {
    return (
      <main style={{ maxWidth: 760, margin: "50px auto", padding: 24, fontFamily: "sans-serif" }}>
        <h1>Manager unavailable</h1>
        <p>{error || "Vacancy not found."}</p>
        <Link href="/business-profile">← Back to Business Profile</Link>
      </main>
    );
  }

  return (
    <main className="mgr-page">
      <header className="mgr-header">
        <Link href="/" className="mgr-brand">
          <span className="mgr-logo">J</span>
          JobsNotif
        </Link>
        <span className="mgr-label">MANAGER</span>
      </header>

      <div className="mgr-container">
        <Link href="/business-profile" className="mgr-back">
          ← Business Profile
        </Link>

        <section className="mgr-intro">
          <span className="mgr-eyebrow">RECRUITMENT CENTER</span>
          <h1>Vacancy Manager</h1>
          <p>Manage applications for this specific job vacancy.</p>
        </section>

        <section className="mgr-vacancy">
          <div className="mgr-vacancy-top">
            <div>
              <span className="mgr-muted">VACANCY STATUS</span>
              <h2>{job.job_title}</h2>
            </div>
            <span className="mgr-sent">
              <span />
              {job.status}
            </span>
          </div>
          <div className="mgr-vacancy-bottom">
            <span>{job.company_name}</span>
            <strong>{job.token}</strong>
          </div>
        </section>

        <section className="mgr-progress">
          <div className="mgr-progress-head">
            <div>
              <span className="mgr-muted">APPLICATION OVERVIEW</span>
              <h2>Candidate Applications</h2>
            </div>
            <strong className="mgr-count">0<span>/—</span></strong>
          </div>
          <div className="mgr-track">
            <div className="mgr-fill" style={{ width: "0%" }} />
          </div>
          <p>No applications loaded yet.</p>
        </section>

        <div className="mgr-list-heading">
          <div>
            <h2>Candidate Applications</h2>
            <p>Applications submitted for this vacancy only.</p>
          </div>
          <span className="mgr-total">0 Candidates</span>
        </div>

        <div className="mgr-table-wrap">
          <div style={{ padding: 30, textAlign: "center" }}>
            <h3>No applications received yet</h3>
            <p>Candidate applications and PDF CV documents will appear here after the application system is connected.</p>
          </div>
        </div>

        <p className="mgr-note">
          Vacancy-specific manager. Only applications linked to this job will be displayed.
        </p>
      </div>
    </main>
  );
}

export default function ManagerTokenPage() {
  return (
    <Suspense fallback={<main><p>Loading...</p></main>}>
      <ManagerTokenPageContent />
    </Suspense>
  );
}

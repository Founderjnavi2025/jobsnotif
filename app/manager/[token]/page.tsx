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

type Application = {
  id: string;
  applicant_name: string | null;
  applicant_whatsapp: string | null;
  cv_filename: string | null;
  cv_extraction_status: string | null;
  created_at: string;
  cv_url: string | null;
};

function ManagerTokenPageContent() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = decodeURIComponent(params.token || "");

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [error, setError] = useState("");
  const [applicationsError, setApplicationsError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadJob() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

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
        setError(
          "Vacancy not found or you do not have permission to access it."
        );
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

  useEffect(() => {
    if (!job) return;

    let active = true;

    async function loadApplications() {
      setApplicationsLoading(true);
      setApplicationsError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        if (active) {
          setApplicationsError("Session expired. Please log in again.");
          setApplicationsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `/api/manager/${encodeURIComponent(token)}/applications`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load applications");
        }

        if (active) {
          setApplications(result.applications || []);
        }
      } catch (err) {
        if (active) {
          setApplicationsError(
            err instanceof Error
              ? err.message
              : "Failed to load applications"
          );
        }
      } finally {
        if (active) setApplicationsLoading(false);
      }
    }

    loadApplications();

    return () => {
      active = false;
    };
  }, [job, token]);

  if (loading) {
    return <main style={{ padding: 40 }}>Loading vacancy manager...</main>;
  }

  if (error || !job) {
    return (
      <main
        style={{
          maxWidth: 760,
          margin: "50px auto",
          padding: 24,
          fontFamily: "sans-serif",
        }}
      >
        <h1>Manager unavailable</h1>
        <p>{error || "Vacancy not found."}</p>
        <Link href="/business-profile">← Back to Business Profile</Link>
      </main>
    );
  }

  const total = applications.length;
  const progress = Math.min(total, 100);

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
            <strong className="mgr-count">
              {applicationsLoading ? "…" : total}
              <span>/—</span>
            </strong>
          </div>
          <div className="mgr-track">
            <div
              className="mgr-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>
            {applicationsLoading
              ? "Loading applications..."
              : `${total} applications received for this vacancy.`}
          </p>
        </section>

        <div className="mgr-list-heading">
          <div>
            <h2>Candidate Applications</h2>
            <p>Applications submitted for this vacancy only.</p>
          </div>
          <span className="mgr-total">
            {applicationsLoading ? "Loading..." : `${total} Candidates`}
          </span>
        </div>

        <div className="mgr-table-wrap">
          {applicationsError ? (
            <div style={{ padding: 30, textAlign: "center" }}>
              <h3>Could not load applications</h3>
              <p>{applicationsError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Reload Manager
              </button>
            </div>
          ) : applicationsLoading ? (
            <div style={{ padding: 30, textAlign: "center" }}>
              Loading candidate data...
            </div>
          ) : total === 0 ? (
            <div style={{ padding: 30, textAlign: "center" }}>
              <h3>No applications received yet</h3>
              <p>
                Candidate applications and PDF CV documents will appear
                here after candidates submit their applications.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                className="mgr-table"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 850,
                }}
              >
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Candidate Name</th>
                    <th>WhatsApp</th>
                    <th>Applied</th>
                    <th>CV Document</th>
                    <th>Extraction</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application, index) => {
                    const phone = (
                      application.applicant_whatsapp || ""
                    ).replace(/\D/g, "");

                    return (
                      <tr key={application.id}>
                        <td>{index + 1}</td>
                        <td>
                          {application.applicant_name || "Not extracted"}
                        </td>
                        <td>
                          {phone ? (
                            <a
                              href={`https://wa.me/${phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {application.applicant_whatsapp}
                            </a>
                          ) : (
                            "Not found"
                          )}
                        </td>
                        <td>
                          {application.created_at
                            ? new Date(
                                application.created_at
                              ).toLocaleDateString("id-ID")
                            : "—"}
                        </td>
                        <td>
                          {application.cv_url ? (
                            <a
                              href={application.cv_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open PDF
                            </a>
                          ) : (
                            "CV unavailable"
                          )}
                        </td>
                        <td>
                          {application.cv_extraction_status || "pending"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mgr-note">
          Vacancy-specific manager. Only applications linked to this job
          will be displayed.
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

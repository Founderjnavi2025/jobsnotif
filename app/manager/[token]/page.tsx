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

type HashKey = {
  id: string;
  hash_key: string;
  tier: "normal" | "premium";
  status: string;
  created_at: string;
};

type Application = {
  id: string;
  applicant_name: string | null;
  applicant_whatsapp: string | null;
  cv_filename: string | null;
  cv_parsed_data: {
    name?: string;
    whatsapp?: string;
    education?: string;
    interest?: string;
    skills?: string;
    full_text?: string;
  } | null;
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
  const [hashkeys, setHashkeys] = useState<HashKey[]>([]);
  const [hashkeysLoading, setHashkeysLoading] = useState(false);
  const [hashkeysError, setHashkeysError] = useState("");

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
          "Vacancy not found or you do not have permission to access it.",
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
          },
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
            err instanceof Error ? err.message : "Failed to load applications",
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


  useEffect(() => {
    if (!job) return;

    const jobId = job.id;
    let active = true;

    async function loadHashkeys() {
      setHashkeysLoading(true);
      setHashkeysError("");

      try {
        const {
          data: sessionData,
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        const accessToken = sessionData.session?.access_token;

        if (!accessToken) {
          throw new Error("Session login tidak ditemukan.");
        }

        const response = await fetch(
          `/api/manager/${encodeURIComponent(token)}/hashkeys`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Gagal memuat HashKeys.");
        }

        if (!active) return;

        setHashkeys((result.hashkeys || []) as HashKey[]);
      } catch (error) {
        if (!active) return;

        setHashkeysError(
          error instanceof Error ? error.message : "Gagal memuat HashKeys.",
        );
        setHashkeys([]);
      } finally {
        if (active) {
          setHashkeysLoading(false);
        }
      }
    }

    loadHashkeys();

    return () => {
      active = false;
    };
  }, [job]);

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
        <Link href="/business-profile" className="mgr-brand">
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

        <section
          style={{
            marginTop: 24,
            padding: 24,
            border: "1px solid #dbe3ee",
            borderRadius: 16,
            background: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span className="mgr-muted">INVITATION ACCESS</span>
              <h2 style={{ margin: "8px 0" }}>Vacancy HashKeys</h2>
              <p style={{ margin: 0, color: "#64748b" }}>
                Active invitation keys available for this vacancy.
              </p>
            </div>

            <strong
              style={{
                fontSize: 24,
                padding: "8px 16px",
                borderRadius: 12,
                background: "#eef2ff",
                color: "#3730a3",
              }}
            >
              {hashkeysLoading ? "…" : hashkeys.length}
              <span style={{ fontSize: 13, fontWeight: 400 }}>
                {" "}available
              </span>
            </strong>
          </div>

          {hashkeysError ? (
            <p style={{ color: "#b91c1c", marginTop: 18 }}>
              Could not load HashKeys: {hashkeysError}
            </p>
          ) : hashkeysLoading ? (
            <p style={{ marginTop: 18 }}>Loading HashKeys...</p>
          ) : hashkeys.length === 0 ? (
            <p style={{ marginTop: 18, color: "#64748b" }}>
              No active unassigned HashKeys are available for this vacancy.
            </p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 20 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 480,
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 10 }}>HashKey</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Tier</th>
                    <th style={{ textAlign: "left", padding: 10 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hashkeys.map((key) => (
                    <tr key={key.id}>
                      <td
                        style={{
                          padding: 10,
                          borderTop: "1px solid #e2e8f0",
                          fontFamily: "monospace",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {key.hash_key}
                      </td>
                      <td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
                        <span
                          style={{
                            padding: "4px 9px",
                            borderRadius: 20,
                            background:
                              key.tier === "premium" ? "#fef3c7" : "#e0f2fe",
                            color:
                              key.tier === "premium" ? "#92400e" : "#075985",
                            fontSize: 12,
                          }}
                        >
                          {key.tier === "premium" ? "Premium" : "Normal"}
                        </span>
                      </td>
                      <td style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
                        Active
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            <div className="mgr-fill" style={{ width: `${progress}%` }} />
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
              <button type="button" onClick={() => window.location.reload()}>
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
                Candidate applications and PDF CV documents will appear here
                after candidates submit their applications.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                className="mgr-table"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 950,
                }}
              >
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Candidate Name</th>
                    <th>WhatsApp</th>
                    <th>Job Interest</th>
                    <th>Education</th>
                    <th>Skills</th>
                    <th>Applied</th>
                    <th>CV</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application, index) => {
                    const cv = application.cv_parsed_data || {};
                    const name = cv.name || application.applicant_name;
                    const whatsapp =
                      cv.whatsapp || application.applicant_whatsapp;
                    const phone = (whatsapp || "").replace(/\D/g, "");

                    return (
                      <tr key={application.id}>
                        <td>{index + 1}</td>
                        <td>{name || "—"}</td>
                        <td>
                          {phone ? (
                            <a
                              href={`https://wa.me/${phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {whatsapp}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{cv.interest || "—"}</td>
                        <td>{cv.education || "—"}</td>
                        <td>{cv.skills || "—"}</td>
                        <td>
                          {application.created_at
                            ? new Date(
                                application.created_at,
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
                              📄 PDF
                            </a>
                          ) : (
                            "—"
                          )}
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
          Vacancy-specific manager. Only applications linked to this job will be
          displayed.
        </p>
      </div>
    </main>
  );
}

export default function ManagerTokenPage() {
  return (
    <Suspense
      fallback={
        <main>
          <p>Loading...</p>
        </main>
      }
    >
      <ManagerTokenPageContent />
    </Suspense>
  );
}

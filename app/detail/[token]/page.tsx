"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

function JobDetailContent() {
  const params = useParams<{ token: string }>();
  const token = decodeURIComponent(params.token || "");

  const applyRef = useRef<HTMLDivElement>(null);
  const [welcome, setWelcome] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function goToApply() {
    setWelcome(false);
    setTimeout(() => {
      applyRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }

  function chooseFile(selected?: File) {
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setError("Please upload a PDF document.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selected);
  }

  async function submitApplication(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      setError("Please upload your CV before submitting.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const storageKey = "jobsnotif_browser_upload_key";
      let browserKey = localStorage.getItem(storageKey);

      if (!browserKey) {
        browserKey = crypto.randomUUID().replace(/-/g, "");
        localStorage.setItem(storageKey, browserKey);
      }

      const formData = new FormData();
      formData.append("token", token);
      formData.append("browser_key", browserKey);
      formData.append("cv", file);

      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to submit application.");
        return;
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submit application error:", err);
      setError("Connection failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (submitted) {
    return (
      <main className="job-detail-page">
        <div className="job-success">
          <div className="job-success-icon">✓</div>
          <span className="job-detail-eyebrow">APPLICATION COMPLETED</span>
          <h1>Congratulations!</h1>
          <p>Your application has been submitted successfully.</p>
          <div className="job-success-card">
            <strong>What happens next?</strong>
            <p>Your application is now waiting for the company to review.</p>
            <span>Vacancy token: {token}</span>
            <span>Document: {file?.name}</span>
          </div>
          <Link href="/auto-find-jobs" className="job-detail-back">
            Back to JobsNotif
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="job-detail-page">
      <header className="job-detail-header">
        <Link href="/" className="job-detail-brand">
          <span>J</span> JobsNotif
        </Link>
        <span className="job-detail-header-label">JOB OPPORTUNITY</span>
      </header>

      <div className="job-detail-container">
        <Link href="/auto-find-jobs" className="job-detail-back">
          ← Back to Search
        </Link>

        <div className="job-detail-token">
          <span>VACANCY TOKEN</span>
          <strong>{token}</strong>
        </div>

        <section className="job-detail-card">
          <span className="job-detail-eyebrow">JOB OPPORTUNITY</span>
          <h1>Frontend Developer</h1>
          <p className="job-detail-company">Company Name · Technology</p>

          <div className="job-detail-tags">
            <span>Full-time</span>
            <span>Remote</span>
            <span>Entry - Mid Level</span>
          </div>

          <div className="job-detail-section">
            <h2>Job Description</h2>
            <p>
              We are looking for a Frontend Developer to build and maintain
              modern, responsive web applications and deliver excellent
              user experiences.
            </p>
          </div>

          <div className="job-detail-section">
            <h2>Responsibilities</h2>
            <ul>
              <li>Develop and maintain responsive web interfaces.</li>
              <li>Work with designers and backend developers.</li>
              <li>Improve application performance and usability.</li>
            </ul>
          </div>

          <div className="job-detail-section">
            <h2>Qualifications</h2>
            <ul>
              <li>Experience with JavaScript and modern web technologies.</li>
              <li>Knowledge of React or Next.js.</li>
              <li>Good communication and problem-solving skills.</li>
            </ul>
          </div>

          <div className="job-detail-section">
            <h2>Technical Skills</h2>
            <div className="job-detail-tags">
              <span>JavaScript</span>
              <span>React</span>
              <span>Next.js</span>
              <span>CSS</span>
            </div>
          </div>

          <div className="job-detail-section">
            <h2>Salary & Compensation</h2>
            <p>Salary information provided by the company.</p>
          </div>

          <button
            type="button"
            className="job-detail-bottom-apply"
            onClick={goToApply}
          >
            Apply for This Job <span>→</span>
          </button>
        </section>

        <section className="job-apply-section" ref={applyRef}>
          <span className="job-detail-eyebrow">APPLICATION FORM</span>
          <h2>Apply for This Job</h2>
          <p>Upload your CV in PDF format to submit your application.</p>

          <form onSubmit={submitApplication}>
            <label className="job-upload-box">
              <span className="job-upload-icon">↑</span>
              <strong>Upload Your CV</strong>
              <span>Choose a PDF file from your device</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => chooseFile(e.target.files?.[0])}
              />
              {file && (
                <span className="job-upload-selected">
                  ✓ {file.name}
                </span>
              )}
            </label>

            {error && <p className="job-detail-error">{error}</p>}

            <button
              type="submit"
              className="job-detail-submit"
              disabled={uploading}
            >
              {uploading ? "Uploading CV..." : "Submit Application"}
              {!uploading && <span> →</span>}
            </button>
          </form>

          <p className="job-detail-privacy">
            Your CV will be provided to the recruiting company.
          </p>
        </section>

        <footer className="job-detail-footer">
          JobsNotif · AI Job Alerts
        </footer>
      </div>

      {!welcome && !submitted && (
        <button
          type="button"
          className="job-floating-apply"
          onClick={goToApply}
        >
          Apply Now →
        </button>
      )}

      {welcome && (
        <div className="job-welcome-overlay">
          <div className="job-welcome-box">
            <span className="job-welcome-icon">✦</span>
            <span className="job-detail-eyebrow">YOUR NEXT OPPORTUNITY</span>
            <h2>Ready to Apply?</h2>
            <p>
              This opportunity could be your next career move.
              Submit your CV and let the company discover you.
            </p>
            <button type="button" onClick={goToApply}>
              APPLY NOW <span>→</span>
            </button>
            <span className="job-welcome-caption">
              Tap to continue
            </span>
          </div>
        </div>
      )}
    </main>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="job-detail-page">
          <div className="job-detail-container">
            Loading job details...
          </div>
        </main>
      }
    >
      <JobDetailContent />
    </Suspense>
  );
}

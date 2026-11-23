"use client";

import Link from "next/link";
import dataset from "../../data/old-fasthire-cloud-meta/data/job_description_dataset.json";

type JobTemplate = {
  job_title: string;
  department?: string;
  job_level?: string;
  employment_type?: string;
  experience_level?: string;
  job_description?: string;
};

const templates = (dataset as { positions?: JobTemplate[] }).positions ?? [];

export default function CreateJobPage() {
  return (
    <main className="jt-page">
      <header className="jt-header">
        <Link href="/business-profile" className="jt-brand">
          <span className="jt-logo">J</span>
          JobsNotif
        </Link>
        <Link href="/business-profile" className="jt-back">
          ← Business Profile
        </Link>
      </header>

      <section className="jt-container">
        <div className="jt-intro">
          <span className="jt-eyebrow">RECRUITMENT WORKSPACE</span>
          <h1>Choose a <span>Job Template.</span></h1>
          <p>
            Start with a professional job structure.
            Select a position to create your vacancy.
          </p>
        </div>

        <div className="jt-count">
          <span>AVAILABLE JOB STRUCTURES</span>
          <strong>{templates.length} Positions</strong>
        </div>

        {templates.length > 0 ? (
          <div className="jt-grid">
            {templates.map((item, index) => (
              <Link
                href={`/create-job/form?template=${encodeURIComponent(item.job_title)}`}
                className="jt-card"
                key={`${item.job_title}-${index}`}
              >
                <div className="jt-card-top">
                  <span className="jt-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="jt-arrow">↗</span>
                </div>

                <h2>{item.job_title}</h2>
                <p>{item.department || "General Department"}</p>

                <div className="jt-tags">
                  {item.job_level && <span>{item.job_level}</span>}
                  {item.employment_type && <span>{item.employment_type}</span>}
                </div>

                <div className="jt-select">
                  Select this position <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="jt-empty">
            <h2>No templates found</h2>
            <p>Check the job description JSON dataset.</p>
          </div>
        )}
      </section>
    </main>
  );
}

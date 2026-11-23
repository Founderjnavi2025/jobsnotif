"use client";

import Link from "next/link";
import { useState } from "react";

const candidates = [
  { id: 1, name: "Candidate Name 1", source: "Telegram", cv: "cv.pdf" },
  { id: 2, name: "Candidate Name 2", source: "Telegram", cv: "cv.pdf" },
  { id: 3, name: "Candidate Name 3", source: "Telegram", cv: "cv.pdf" },
];

export default function ManagerPage() {
  const [hidden, setHidden] = useState<number[]>([]);
  const [files, setFiles] = useState<Record<number, string>>({});
  const [pdfUrls, setPdfUrls] = useState<Record<number, string>>({});

  function toggleHide(id: number) {
    setHidden((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function choosePDF(id: number, file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please choose a PDF file.");
      return;
    }

    setPdfUrls((current) => {
      if (current[id]) URL.revokeObjectURL(current[id]);
      return { ...current, [id]: URL.createObjectURL(file) };
    });
    setFiles((current) => ({ ...current, [id]: file.name }));
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
          <h1>Your Review Vacancy</h1>
          <p>Track your vacancy distribution and review candidate applications in one place.</p>
        </section>

        <section className="mgr-vacancy">
          <div className="mgr-vacancy-top">
            <div>
              <span className="mgr-muted">VACANCY STATUS</span>
              <h2>Your vacancy has been sent</h2>
            </div>
            <span className="mgr-sent"><span /> Sent</span>
          </div>
          <div className="mgr-vacancy-bottom">
            <span>Job Vacancy</span>
            <strong>Recently published vacancy</strong>
          </div>
        </section>

        <section className="mgr-progress">
          <div className="mgr-progress-head">
            <div>
              <span className="mgr-muted">APPLICATION OVERVIEW</span>
              <h2>Your Candidate Applications</h2>
            </div>
            <strong className="mgr-count">1<span>/100</span></strong>
          </div>
          <div className="mgr-track"><div className="mgr-fill" /></div>
          <p>1 candidate application received</p>
        </section>

        <div className="mgr-list-heading">
          <div>
            <h2>Candidate Applications</h2>
            <p>Candidate information extracted from submitted CV documents.</p>
          </div>
          <span className="mgr-total">03 Candidates</span>
        </div>

        <div className="mgr-table-wrap">
          <table className="mgr-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Candidate Name</th>
                <th>Source</th>
                <th>Education</th>
                <th>Experience</th>
                <th>Skills</th>
                <th>CV Document</th>
                <th>Privacy</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => {
                const isHidden = hidden.includes(candidate.id);

                return (
                  <tr key={candidate.id}>
                    <td>{candidate.id}</td>
                    <td>
                      <strong>{isHidden ? "Information Hidden" : candidate.name}</strong>
                    </td>
                    <td><span className="mgr-telegram">{candidate.source}</span></td>
                    <td>{isHidden ? "••••••" : "Not provided"}</td>
                    <td>{isHidden ? "••••••" : "Not provided"}</td>
                    <td>{isHidden ? "••••••" : "Not provided"}</td>
                    <td>
                      <div className="mgr-pdf-cell">
                        <label className="mgr-choose">
                          Choose PDF
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => choosePDF(candidate.id, e.target.files?.[0])}
                          />
                        </label>
                        {pdfUrls[candidate.id] ? (
                          <a
                            className="mgr-pdf-link"
                            href={pdfUrls[candidate.id]}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {files[candidate.id]} ↗
                          </a>
                        ) : (
                          <span className="mgr-pdf-empty">{candidate.cv}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={isHidden ? "mgr-show" : "mgr-hide"}
                        onClick={() => toggleHide(candidate.id)}
                      >
                        {isHidden ? "Show Info" : "Hide Info"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mgr-note">
          Sample candidate data. PDF links currently use locally selected files.
          Candidate information extraction will be connected later.
        </p>
      </div>
    </main>
  );
}

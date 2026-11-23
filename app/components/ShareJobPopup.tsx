"use client";

import { useEffect, useState } from "react";

type ShareJobPopupProps = {
  open: boolean;
  onClose: () => void;
  onPurchase?: (candidateCount: number) => void;
};

const candidateOptions = [
  10, 20, 30, 40, 50, 60, 70, 80, 90,
  100, 200, 300, 500, 1000,
];

export default function ShareJobPopup({
  open,
  onClose,
  onPurchase,
}: ShareJobPopupProps) {
  const [selected, setSelected] = useState(100);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sjp-overlay" onClick={onClose}>
      <section
        className="sjp-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sjp-title"
      >
        <button
          className="sjp-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="sjp-brand">
          <span className="sjp-brand-icon">J</span>
          <span>JobsNotif</span>
        </div>

        <div className="sjp-heading">
          <span className="sjp-eyebrow">RECRUITMENT SERVICES</span>
          <h2 id="sjp-title">Share Your Job.</h2>
          <p>
            Create a notification and reach candidates
            who are interested in your job opportunity.
          </p>
        </div>

        <div className="sjp-section-title">
          <strong>Choose Candidate Reach</strong>
          <span>Select your audience</span>
        </div>

        <div className="sjp-options">
          {candidateOptions.map((count) => (
            <button
              key={count}
              type="button"
              className={`sjp-option ${
                selected === count ? "active" : ""
              }`}
              onClick={() => setSelected(count)}
            >
              <strong>{count.toLocaleString("en-US")}</strong>
              <span>Candidates</span>
            </button>
          ))}
        </div>

        <div className="sjp-summary">
          <div>
            <span>YOUR SELECTED REACH</span>
            <strong>
              {selected.toLocaleString("en-US")} Candidates
            </strong>
          </div>
          <div className="sjp-summary-icon">↗</div>
        </div>

        <button
          className="sjp-purchase"
          type="button"
          onClick={() => onPurchase?.(selected)}
        >
          Purchase Notification <span>→</span>
        </button>

        <p className="sjp-footer">
          Reach the right candidates with JobsNotif.
        </p>
      </section>
    </div>
  );
}

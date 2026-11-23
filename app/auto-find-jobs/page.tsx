"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const interestGroups = [
  {
    id: "technology",
    label: "Technology & IT",
    options: ["Software Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer", "UI/UX Designer", "Data Analyst", "AI Engineer", "Cyber Security", "IT Support"]
  },
  {
    id: "business",
    label: "Business & Management",
    options: ["Business Development", "Project Manager", "Product Manager", "Business Analyst", "Operations Manager", "Admin", "Secretary"]
  },
  {
    id: "marketing",
    label: "Marketing & Creative",
    options: ["Digital Marketing", "Social Media Specialist", "SEO Specialist", "Graphic Designer", "Content Creator", "Video Editor", "Copywriter"]
  },
  {
    id: "finance",
    label: "Finance & Accounting",
    options: ["Accountant", "Finance Staff", "Tax Specialist", "Auditor", "Financial Analyst"]
  },
  {
    id: "sales",
    label: "Sales & Customer Service",
    options: ["Sales Executive", "Sales Manager", "Customer Service", "Call Center", "Account Executive"]
  },
  {
    id: "engineering",
    label: "Engineering & Manufacturing",
    options: ["Mechanical Engineer", "Electrical Engineer", "Quality Control", "Production Staff", "Machine Operator", "Technician"]
  },
  {
    id: "general",
    label: "General & Other",
    options: ["Human Resources", "Recruitment", "Warehouse Staff", "Logistics", "Driver", "Security", "Internship"]
  }
];

export default function AutoFindJobsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [telegramId, setTelegramId] = useState("");
  const [token, setToken] = useState("");
  const [mode, setMode] = useState<"daftar" | "hapus">("daftar");
  const [status, setStatus] = useState("");

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();

    return interestGroups.map(group => ({
      ...group,
      options: group.options.filter(option =>
        !q ||
        option.toLowerCase().includes(q) ||
        group.label.toLowerCase().includes(q)
      )
    })).filter(group => group.options.length > 0);
  }, [search]);

  function toggleInterest(id: string) {
    setSelected(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id]
    );
  }

  function handleToken(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token.trim()) return;
    router.push(`/detail/${encodeURIComponent(token.trim())}`);
  }

  function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (mode === "daftar" && selected.length === 0) {
      setStatus("Pilih minimal satu minat pekerjaan.");
      return;
    }

    setStatus(
      mode === "daftar"
        ? "Preferensi pekerjaan berhasil disiapkan. Sistem notifikasi akan dihubungkan nanti."
        : "Permintaan berhenti notifikasi berhasil disiapkan."
    );
  }

  return (
    <main className="afj-page">
      <header className="afj-header">
        <Link href="/" className="afj-logo">
          jobs<strong>notif</strong>
          <span>AI Job Alerts</span>
        </Link>

        <div className="afj-header-label">
          CANDIDATE PORTAL
        </div>
      </header>

      <section className="afj-hero">
        <div className="afj-hero-content">
          <span className="afj-eyebrow">
            <span className="afj-live-dot" />
            JOB ALERTS FOR EVERY OPPORTUNITY
          </span>

          <h1>
            Your next opportunity,
            <span> delivered directly to you.</span>
          </h1>

          <p>
            Choose the jobs you are interested in. JobsNotif helps
            you discover opportunities and receive job alerts
            through Telegram.
          </p>

          <div className="afj-hero-points">
            <span>✓ Personalized job alerts</span>
            <span>✓ Choose your interests</span>
            <span>✓ Simple Telegram notifications</span>
          </div>
        </div>

        <div className="afj-token-card">
          <div className="afj-token-icon">🎫</div>
          <div>
            <span className="afj-token-label">HAVE A JOB TOKEN?</span>
            <h2>Already received a job token?</h2>
            <p>Enter the token provided by the recruiter to view your job details.</p>
          </div>

          <form onSubmit={handleToken} className="afj-token-form">
            <input
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Example: JN-8K2J9"
              required
            />
            <button type="submit">Search <span>→</span></button>
          </form>

          <div className="afj-token-note">
            <span>🔒</span> Use the token provided by the company.
          </div>
        </div>
      </section>

      <section className="afj-workspace">
        <div className="afj-section-heading">
          <div>
            <span className="afj-section-kicker">PERSONALIZE YOUR EXPERIENCE</span>
            <h2>Find jobs that match your interests.</h2>
            <p>Set your Telegram ID and select the job categories you want to follow.</p>
          </div>
          <div className="afj-free-label">FREE FOR CANDIDATES</div>
        </div>

        <div className="afj-form-card">
          <div className="afj-form-top">
            <div>
              <span className="afj-step">01 — TELEGRAM</span>
              <h3>Connect your Telegram</h3>
              <p>Enter your numeric Telegram ID to receive job notifications.</p>
            </div>
            <div className="afj-telegram-icon">✈</div>
          </div>

          <form onSubmit={handleSubscribe}>
            <label className="afj-label" htmlFor="telegramId">Telegram ID</label>
            <input
              id="telegramId"
              className="afj-input"
              value={telegramId}
              onChange={e => setTelegramId(e.target.value)}
              placeholder="Example: 123456789"
              required
            />
            <p className="afj-help">Use your numeric Telegram ID, not your username.</p>

            <label className="afj-label afj-whatsapp-label" htmlFor="whatsapp">
              WhatsApp Number <span>(Optional)</span>
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              className="afj-input"
              placeholder="Example: +62 812..."
            />
            <p className="afj-help">Optional. Add your WhatsApp number if you want to provide an additional contact channel.</p>

            <div className="afj-divider" />

            <div className="afj-interest-heading">
              <div>
                <span className="afj-step">02 — JOB PREFERENCES</span>
                <h3>What kind of job are you looking for?</h3>
                <p>Select one or more positions that interest you.</p>
              </div>
              <span className="afj-selected-count">{selected.length} selected</span>
            </div>

            <div className="afj-search-wrap">
              <span>⌕</span>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search job title, skill, or category..."
              />
            </div>

            <div className="afj-groups">
              {filteredGroups.map(group => (
                <details key={group.id} className="afj-group">
                  <summary>
                    <span className="afj-group-plus">+</span>
                    <span>{group.label}</span>
                    <span className="afj-group-count">{group.options.length}</span>
                    <span className="afj-chevron">⌄</span>
                  </summary>

                  <div className="afj-options">
                    {group.options.map(option => {
                      const id = `${group.id}::${option}`;
                      const checked = selected.includes(id);

                      return (
                        <label
                          key={id}
                          className={`afj-option ${checked ? "is-selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleInterest(id)}
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </details>
              ))}

              {filteredGroups.length === 0 && (
                <div className="afj-empty">
                  No matching job interests found.
                </div>
              )}
            </div>

            {selected.length > 0 && (
              <div className="afj-selected-box">
                <div className="afj-selected-top">
                  <strong>YOUR SELECTED INTERESTS</strong>
                  <button type="button" onClick={() => setSelected([])}>
                    Clear all
                  </button>
                </div>
                <div className="afj-chips">
                  {selected.map(id => {
                    const option = id.split("::").slice(1).join("::");
                    return (
                      <button type="button" key={id} onClick={() => toggleInterest(id)}>
                        {option} <span>×</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="afj-divider" />

            <div className="afj-subscription">
              <div>
                <span className="afj-step">03 — NOTIFICATION SETTINGS</span>
                <h3>Manage your notifications</h3>
              </div>

              <div className="afj-mode-switch">
                <button
                  type="button"
                  className={mode === "daftar" ? "active" : ""}
                  onClick={() => { setMode("daftar"); setStatus(""); }}
                >
                  Subscribe
                </button>
                <button
                  type="button"
                  className={mode === "hapus" ? "active danger" : ""}
                  onClick={() => { setMode("hapus"); setStatus(""); }}
                >
                  Unsubscribe
                </button>
              </div>
            </div>

            {status && <div className="afj-status">{status}</div>}

            <button
              type="submit"
              className="afj-submit"
              disabled={mode === "daftar" && selected.length === 0}
            >
              {mode === "daftar" ? "Activate Job Notifications" : "Stop My Notifications"}
              <span>→</span>
            </button>

            <p className="afj-privacy">
              Your information is used only to manage your job notification preferences.
            </p>
          </form>
        </div>
      </section>

      <footer className="afj-footer">
        <Link href="/">jobs<strong>notif</strong></Link>
        <span>AI Job Alerts · © 2026 JobsNotif</span>
      </footer>
    </main>
  );
}

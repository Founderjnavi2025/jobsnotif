"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const menus = [
  { id: "home", label: "Home" },
  { id: "jobs", label: "Auto Find Jobs" },
  { id: "candidates", label: "Candidates" },
  { id: "companies", label: "See All PT" },
];

const actions = [
  { id: "jobs", icon: "⌕", title: "Find Jobs", desc: "Discover opportunities that match your interests." },
  { id: "candidates", icon: "♙", title: "Candidates", desc: "Explore candidate profiles and skills." },
  { id: "companies", icon: "▦", title: "Companies", desc: "Discover registered companies." },
  { id: "employer", icon: "＋", title: "For Employers", desc: "Manage recruitment and find talent." },
];

export default function Home() {
  const router = useRouter();
  const [active, setActive] = useState("home");
  const [message, setMessage] = useState("Welcome to JobsNotif. What would you like to explore?");
  const [selected, setSelected] = useState("");

  function navigate(id: string) {
    // Real destinations
    if (id === "jobs") {
      router.push("/auto-find-jobs");
      return;
    }

    if (id === "employer") {
      router.push("/login");
      return;
    }

    setActive(id);
    setSelected(id);

    const responses: Record<string, string> = {
      home: "Welcome to JobsNotif. What would you like to explore?",
      jobs: "Auto Find Jobs selected. Find opportunities based on your interests.",
      candidates: "Candidate directory selected. Explore available talent.",
      companies: "Company directory selected. Discover registered companies.",
      employer: "Employer Workspace selected. Recruitment tools are coming soon.",
    };

    setMessage(responses[id] || responses.home);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main>
      <header className="header">
        <a className="brand" href="/">
          <span className="brand-icon">J</span>
          <span>jobs<span className="orange">notif</span></span>
        </a>

        <nav className="nav">
          {menus.map((item) => (
            <button
              key={item.id}
              className={active === item.id ? "nav-link active" : "nav-link"}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="account">
          <button className="login" onClick={() => router.push("/login")}>Login</button>
          <button className="register" onClick={() => router.push("/register")}>Register</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow"><span /> SMART JOB NOTIFICATIONS</div>
          <h1>Opportunities<br />find <span>their way</span><br />to you.</h1>
          <p>
            Discover jobs, connect with companies, and get notified
            when opportunities match your interests.
          </p>

          <div className="hero-buttons">
            <button className="brick blue" onClick={() => navigate("jobs")}>
              Find My Job <span>↗</span>
            </button>
            <button className="brick white" onClick={() => navigate("employer")}>
              I'm Hiring <span>→</span>
            </button>
          </div>

          <div className="hero-note">
            <span className="note-dot" />
            One platform. Better connections.
          </div>
        </div>

        <div className="hero-art">
          <div className="art-card">
            <div className="art-top">
              <span className="art-logo">J</span>
              <div>
                <strong>JobsNotif</strong>
                <small>Opportunity center</small>
              </div>
              <span className="online">●</span>
            </div>

            <div className="notification">
              <span className="bell">♧</span>
              <div>
                <small>NEW OPPORTUNITY</small>
                <strong>A job matched your interests!</strong>
              </div>
            </div>

            <div className="art-label">RECENT OPPORTUNITIES</div>
            <div className="job-item">
              <span className="job-symbol">IT</span>
              <div><strong>Frontend Developer</strong><small>Technology · Full time</small></div>
              <span className="job-arrow">↗</span>
            </div>
            <div className="job-item">
              <span className="job-symbol orange-bg">UI</span>
              <div><strong>UI/UX Designer</strong><small>Creative · Full time</small></div>
              <span className="job-arrow">↗</span>
            </div>
            <div className="art-footer">Your next opportunity starts here.</div>
          </div>
          <div className="floating brick-float">✦ Smart matching</div>
        </div>
      </section>

      <section className="explore">
        <div className="section-heading">
          <span className="eyebrow">EXPLORE JOBSNOTIF</span>
          <h2>What are you looking for?</h2>
          <p>Choose a destination and let the system guide you.</p>
        </div>

        <div className="brick-grid">
          {actions.map((item) => (
            <button
              key={item.id}
              className={selected === item.id ? "feature brick-selected" : "feature"}
              onClick={() => navigate(item.id)}
            >
              <span className="feature-icon">{item.icon}</span>
              <strong>{item.title}</strong>
              <small>{item.desc}</small>
              <span className="feature-arrow">EXPLORE <b>↗</b></span>
            </button>
          ))}
        </div>
      </section>

      <section className="workspace">
        <div className="workspace-copy">
          <span className="eyebrow">INTERACTIVE WORKSPACE</span>
          <h2>Just choose.<br /><span>We'll guide the way.</span></h2>
          <p>
            A simple conversational experience. No complicated commands.
            Select an action and continue through clear options.
          </p>
        </div>

        <div className="chat-panel">
          <div className="chat-header">
            <span className="chat-logo">J</span>
            <div><strong>JobsNotif System</strong><small>Interactive menu</small></div>
            <span className="chat-status">READY</span>
          </div>

          <div className="chat-message">
            <small>SYSTEM MESSAGE</small>
            <p>{message}</p>
          </div>

          <div className="chat-options">
            <button onClick={() => navigate("jobs")}>⌕ Find jobs</button>
            <button onClick={() => navigate("candidates")}>♙ Candidates</button>
            <button onClick={() => navigate("companies")}>▦ Companies</button>
            <button onClick={() => navigate("employer")}>＋ Employer tools</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <a className="brand" href="/">
          <span className="brand-icon">J</span>
          <span>jobs<span className="orange">notif</span></span>
        </a>
        <span>AI Job Alerts · Smarter connections.</span>
        <span>© 2026 JobsNotif</span>
      </footer>
    </main>
  );
}

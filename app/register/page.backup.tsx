"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [role, setRole] = useState("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [notice, setNotice] = useState("");

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password || !confirm) {
      setNotice("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setNotice("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setNotice("Passwords do not match.");
      return;
    }

    if (!agree) {
      setNotice("Please accept the Terms of Service.");
      return;
    }

    setNotice("Registration interface ready. Account creation will be connected later.");
  }

  return (
    <main className="register-page">
      <header className="login-header">
        <Link href="/" className="brand">
          <span className="brand-icon">J</span>
          <span>jobs<span className="orange">notif</span></span>
        </Link>
        <Link href="/" className="back-home">← Back to home</Link>
      </header>

      <section className="register-layout">
        <div className="register-intro">
          <span className="eyebrow">JOIN JOBSNOTIF</span>
          <h1>Build your<br />next <span>opportunity.</span></h1>
          <p>
            Join a growing recruitment network.
            Find opportunities or connect with the right talent.
          </p>

          <div className="register-benefits">
            <div><span>✓</span><p><strong>Smart job discovery</strong><small>Explore opportunities based on your interests.</small></p></div>
            <div><span>✓</span><p><strong>Better connections</strong><small>Connect candidates with registered companies.</small></p></div>
            <div><span>✓</span><p><strong>Simple workspace</strong><small>Manage your recruitment journey in one place.</small></p></div>
          </div>
        </div>

        <div className="register-card">
          <div className="register-heading">
            <h2>Create your account</h2>
            <p>Choose your account type to get started.</p>
          </div>

          <div className="role-selector">
            <button
              type="button"
              className={role === "candidate" ? "role-option selected" : "role-option"}
              onClick={() => setRole("candidate")}
            >
              <span className="role-icon">♙</span>
              <span><strong>Job Seeker</strong><small>I'm looking for a job</small></span>
              <span className="role-check">{role === "candidate" ? "●" : "○"}</span>
            </button>

            <button
              type="button"
              className={role === "employer" ? "role-option selected" : "role-option"}
              onClick={() => setRole("employer")}
            >
              <span className="role-icon company-icon">▦</span>
              <span><strong>Employer</strong><small>I'm hiring candidates</small></span>
              <span className="role-check">{role === "employer" ? "●" : "○"}</span>
            </button>
          </div>

          <form onSubmit={handleRegister}>
            <label htmlFor="fullname">
              {role === "employer" ? "Contact person" : "Full name"}
            </label>
            <input
              id="fullname"
              className="register-input"
              type="text"
              placeholder={role === "employer" ? "Your contact name" : "Enter your full name"}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {role === "employer" && (
              <>
                <label htmlFor="company">Company name</label>
                <input
                  id="company"
                  className="register-input"
                  type="text"
                  placeholder="Enter your company name"
                />
              </>
            )}

            <label htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              className="register-input"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="reg-password">Password</label>
            <div className="register-password">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              className="register-input"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <label className="register-agree">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>I agree to the Terms of Service and Privacy Policy.</span>
            </label>

            {notice && <div className="register-notice">{notice}</div>}

            <button type="submit" className="register-submit">
              Create Account <span>→</span>
            </button>
          </form>

          <div className="register-login">
            Already have an account? <Link href="/login">Sign in</Link>
          </div>
        </div>
      </section>

      <footer className="login-footer">
        <span>© 2026 JobsNotif</span>
        <span>Smarter connections. Better opportunities.</span>
      </footer>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");

    if (!email.trim() || !password) {
      setNotice("Please enter your email and password.");
      return;
    }

    setNotice("Signing in...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setNotice(error.message);
      return;
    }

    if (data.user?.user_metadata?.account_type !== "business") {
      await supabase.auth.signOut();
      setNotice("This login is for registered business accounts only.");
      return;
    }

    router.push("/business-profile");
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <Link href="/" className="brand">
          <span className="brand-icon">J</span>
          <span>jobs<span className="orange">notif</span></span>
        </Link>
        <Link href="/" className="back-home">← Back to home</Link>
      </header>

      <section className="login-layout">
        <div className="login-visual">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Your next<br />opportunity<br /><span>starts here.</span></h1>
          <p>
            Sign in to your JobsNotif account and continue
            discovering better opportunities.
          </p>

          <div className="login-visual-card">
            <div className="visual-symbol">J</div>
            <div>
              <strong>JobsNotif</strong>
              <small>AI Job Alerts</small>
            </div>
            <span className="visual-spark">✦</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-heading">
            <span className="login-mini-icon">↗</span>
            <h2>Welcome back</h2>
            <p>Enter your details to access your account.</p>
          </div>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email address</label>
            <div className="login-input-wrap">
              <span>✉</span>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="password-label">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="forgot-button"
                onClick={() => setNotice("Password recovery will be available when authentication is connected.")}
              >
                Forgot password?
              </button>
            </div>

            <div className="login-input-wrap">
              <span>♙</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label className="remember-row">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            {notice && <div className="login-notice">{notice}</div>}

            <button type="submit" className="login-submit">
              Sign in <span>→</span>
            </button>
          </form>

          <div className="login-divider"><span>NEW TO JOBSNOTIF?</span></div>

          <Link href="/register" className="create-account">
            Create an account <span>↗</span>
          </Link>

          <p className="login-terms">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>

      <footer className="login-footer">
        <span>© 2026 JobsNotif</span>
        <span>Smarter connections. Better opportunities.</span>
      </footer>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      setSent(true);
      setMessage(
        "If an account exists with this email, a password recovery link will be sent."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to send recovery email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <Link href="/" className="brand">
          <span className="brand-icon">J</span>
          <span>jobs<span className="orange">notif</span></span>
        </Link>
        <Link href="/login" className="back-home">← Back to login</Link>
      </header>

      <section className="login-layout">
        <div className="login-visual">
          <span className="eyebrow">ACCOUNT RECOVERY</span>
          <h1>Let's get<br />you back<br /><span>on track.</span></h1>
          <p>
            Enter your registered email address and we'll help you
            recover access to your JobsNotif account.
          </p>
        </div>

        <div className="login-card">
          <div className="login-card-heading">
            <span className="login-mini-icon">↗</span>
            <h2>Forgot password?</h2>
            <p>We'll send you a link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="recovery-email">Email address</label>
            <div className="login-input-wrap">
              <span>✉</span>
              <input
                id="recovery-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={sent}
              />
            </div>

            {message && <div className="login-notice">{message}</div>}

            {!sent && (
              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? "Sending..." : "Send recovery link"}
                <span>→</span>
              </button>
            )}
          </form>

          <div className="login-divider"><span>REMEMBERED YOUR PASSWORD?</span></div>

          <Link href="/login" className="create-account">
            Back to sign in <span>↗</span>
          </Link>
        </div>
      </section>

      <footer className="login-footer">
        <span>© 2026 JobsNotif</span>
        <span>Smarter connections. Better opportunities.</span>
      </footer>
    </main>
  );
}

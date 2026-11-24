"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Verifying recovery link...");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function verifyRecovery() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const errorDescription = params.get("error_description");

      if (errorDescription) {
        if (mounted) {
          setMessage(errorDescription.replace(/\+/g, " "));
        }
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          if (mounted) setMessage(error.message);
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        setMessage(
          "This recovery link is invalid or expired. Please request a new one."
        );
        return;
      }

      setReady(true);
      setMessage("");
    }

    verifyRecovery();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setCompleted(true);
      setMessage("Your password has been successfully updated.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update password."
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
          <span className="eyebrow">SECURE YOUR ACCOUNT</span>
          <h1>A fresh<br />start for<br /><span>your account.</span></h1>
          <p>
            Choose a new password to regain access to your JobsNotif
            business account.
          </p>
        </div>

        <div className="login-card">
          <div className="login-card-heading">
            <span className="login-mini-icon">↗</span>
            <h2>Reset password</h2>
            <p>Create a new password for your account.</p>
          </div>

          {ready && !completed && (
            <form onSubmit={handleSubmit}>
              <label htmlFor="new-password">New password</label>
              <div className="login-input-wrap">
                <span>♙</span>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <label htmlFor="confirm-password">Confirm new password</label>
              <div className="login-input-wrap">
                <span>♙</span>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {message && <div className="login-notice">{message}</div>}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? "Updating..." : "Update password"}
                <span>→</span>
              </button>
            </form>
          )}

          {message && (!ready || completed) && (
            <div className="login-notice">{message}</div>
          )}

          {completed && (
            <Link href="/login" className="create-account">
              Continue to sign in <span>↗</span>
            </Link>
          )}

          {!ready && !completed && (
            <Link href="/forgot-password" className="create-account">
              Request a new recovery link <span>↗</span>
            </Link>
          )}
        </div>
      </section>

      <footer className="login-footer">
        <span>© 2026 JobsNotif</span>
        <span>Smarter connections. Better opportunities.</span>
      </footer>
    </main>
  );
}

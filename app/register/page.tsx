"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirmPassword") || "");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!form.get("terms")) {
      setMessage("Please accept the Terms & Conditions.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage("Registration form completed. Account creation will be connected later.");
    }, 500);
  }

  return (
    <main className="business-register-page">
      <div className="business-register-container">

        <Link href="/" className="business-register-logo">
          <span>jobs</span><strong>notif</strong>
        </Link>

        <div className="business-register-layout">
          <section className="business-register-intro">
            <span className="business-register-tag">FOR BUSINESS</span>
            <h1>Build your team with smarter recruitment.</h1>
            <p>
              Create your company account and discover a simpler way
              to manage recruitment with JobsNotif.
            </p>

            <div className="business-register-benefits">
              <div>✓ Manage your recruitment activity</div>
              <div>✓ Discover potential candidates</div>
              <div>✓ Get smarter job notifications</div>
            </div>
          </section>

          <section className="business-register-card">
            <div className="business-register-heading">
              <h2>Create Business Account</h2>
              <p>Register your company to get started.</p>
            </div>

            <form onSubmit={handleRegister}>
              <label>Company Name</label>
              <input
                name="companyName"
                placeholder="Your company name"
                required
              />

              <label>Contact Person</label>
              <input
                name="contactPerson"
                placeholder="Full name"
                required
              />

              <label>Recruitment Email</label>
              <input
                name="email"
                type="email"
                placeholder="recruitment@company.com"
                required
              />

              <label>Phone Number</label>
              <input
                name="phone"
                type="tel"
                placeholder="+62 812..."
                required
              />

              <label>Company Website <span>(Optional)</span></label>
              <input
                name="website"
                type="url"
                placeholder="https://company.com"
              />

              <label>Password</label>
              <div className="business-register-password">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <label>Confirm Password</label>
              <div className="business-register-password">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>

              <label className="business-register-terms">
                <input type="checkbox" name="terms" />
                <span>I agree to the Terms & Conditions and Privacy Policy.</span>
              </label>

              {message && (
                <div className="business-register-message">{message}</div>
              )}

              <button
                type="submit"
                className="business-register-submit"
                disabled={loading}
              >
                {loading ? "Processing..." : "Create Business Account"}
              </button>
            </form>

            <div className="business-register-footer">
              Already have a business account? <Link href="/login">Sign in</Link>
            </div>
          </section>
        </div>

        <Link href="/" className="business-register-back">← Back to Home</Link>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";

export default function BusinessProfilePage() {
  return (
    <main className="bp-screen">

      <header className="bp-header">
        <Link href="/" className="bp-logo">
          jobs<span>notif</span>
          <small>AI Job Alerts</small>
        </Link>

        <div className="bp-account">
          <div className="bp-account-avatar">B</div>
          <div className="bp-account-info">
            <strong>Business Account</strong>
            <span>Company Workspace</span>
          </div>
        </div>
      </header>

      <section className="bp-main">

        <div className="bp-welcome">
          <span className="bp-eyebrow">
            <span className="bp-status-dot" />
            BUSINESS WORKSPACE
          </span>

          <h1>
            Welcome to <span>JobsNotif.</span>
          </h1>

          <p>
            Your company is ready. Let's find the right people
            to grow your business.
          </p>
        </div>

        <div className="bp-content">

          <section className="bp-company-card">
            <div className="bp-company-top">
              <div className="bp-company-logo">B</div>
              <div className="bp-company-heading">
                <span>YOUR BUSINESS PROFILE</span>
                <h2>Your Company</h2>
                <p>Company account information</p>
              </div>
              <button className="bp-edit" type="button">
                Edit Profile <span>↗</span>
              </button>
            </div>

            <div className="bp-company-details">
              <div className="bp-detail">
                <span>CONTACT PERSON</span>
                <strong>Not set yet</strong>
              </div>
              <div className="bp-detail">
                <span>RECRUITMENT EMAIL</span>
                <strong>Not set yet</strong>
              </div>
              <div className="bp-detail">
                <span>PHONE NUMBER</span>
                <strong>Not set yet</strong>
              </div>
              <div className="bp-detail">
                <span>COMPANY WEBSITE</span>
                <strong>Not set yet</strong>
              </div>
            </div>

            <div className="bp-profile-note">
              <span>ⓘ</span>
              Complete your company information to build trust with candidates.
            </div>
          </section>

          <section className="bp-action-card">
            <div className="bp-action-decoration">
              <div className="bp-decoration-circle bp-circle-one" />
              <div className="bp-decoration-circle bp-circle-two" />
              <div className="bp-document-icon">
                <span>＋</span>
              </div>
            </div>

            <div className="bp-action-content">
              <span className="bp-action-label">YOUR NEXT STEP</span>
              <h2>Ready to find your next talent?</h2>
              <p>
                Create a job vacancy and let JobsNotif connect
                your company with potential candidates.
              </p>

              <Link href="/create-job" className="bp-create-button">
                <span>＋</span>
                Create Job Vacancy
                <span className="bp-button-arrow">→</span>
              </Link>

              <small>Start your recruitment journey here.</small>
            </div>
          </section>

        </div>

        <footer className="bp-footer">
          <span>© 2026 JobsNotif</span>
          <span>AI Job Alerts</span>
        </footer>

      </section>
    </main>
  );
}

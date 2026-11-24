import { Suspense } from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";

function getJobs() {
  const p = path.join(process.cwd(), "data", "job_description_dataset.json");
  try {
    const r = JSON.parse(fs.readFileSync(p, "utf-8"));
    return Array.isArray(r) ? r : r.positions || r.jobs || r.data || [];
  } catch {
    return [];
  }
}

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const PER_PAGE = 20;

async function JobsContent({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; dept?: string; page?: string }>;
}) {
  const jobs = getJobs();
  const sp = await searchParams;
  const q = (sp?.q || "").toLowerCase();
  const dept = sp?.dept || "Semua";
  const page = Math.max(1, parseInt(sp?.page || "1") || 1);

  const depts = [
    "Semua",
    ...Array.from(new Set(jobs.map((j: any) => j.department).filter(Boolean))),
  ] as string[];

  const filtered = jobs.filter((j: any) => {
    const mq =
      !q ||
      j.job_title.toLowerCase().includes(q) ||
      (j.job_description || "").toLowerCase().includes(q);
    const md = dept === "Semua" || j.department === dept;
    return mq && md;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const paged = filtered.slice(start, start + PER_PAGE);
  const mk = (p: number) =>
    `/jobs?q=${encodeURIComponent(sp?.q || "")}&dept=${encodeURIComponent(dept)}&page=${p}`;

  return (
    <main className="jobs-page">
      <header className="header jobs-header">
        <Link href="/" className="brand">
          <span className="brand-icon jobs-brand-icon">J</span>
          <span>
            jobs<span className="orange">notif</span>
          </span>
        </Link>
        <Link href="/jobs" className="register">
          Register
        </Link>
      </header>

      <nav className="jobs-nav">
        <Link href="/" className="nav-link">Home</Link>
        <Link href="/jobs" className="nav-link active">Auto Find Jobs</Link>
        <span className="nav-link">Candidates</span>
        <span className="nav-link">See All PT</span>
      </nav>

      <section className="jobs-intro">
        <div className="eyebrow">
          <span />
          SMART JOB NOTIFICATIONS
        </div>

        <h1 className="jobs-title">
          Opportunities
          <br />
          find <span>their way</span>
          <br />
          to you.
        </h1>

        <p className="jobs-description">
          Discover jobs, connect with companies, and get notified when
          opportunities match your interests.
        </p>

        <form className="jobs-search">
          <input
            name="q"
            defaultValue={sp?.q || ""}
            placeholder={`Cari dari ${jobs.length} loker...`}
          />
          <button className="register">Find My Job</button>
        </form>

        <div className="jobs-departments">
          {depts.map((d: string) => (
            <Link
              key={d}
              href={`/jobs?dept=${encodeURIComponent(d)}&page=1`}
              className={`jobs-dept${d === dept ? " selected" : ""}`}
            >
              {d}
            </Link>
          ))}
        </div>

        <div className="jobs-result-count">
          <span />
          Menampilkan {start + 1}-{Math.min(start + PER_PAGE, filtered.length)} dari{" "}
          {filtered.length} loker - Halaman {safePage}/{totalPages}
        </div>
      </section>

      <section className="jobs-results">
        <div className="jobs-grid">
          {paged.map((job: any, i: number) => {
            const slug = slugify(job.job_title);
            const min = job.salary_estimate?.minimum || 0;
            const max = job.salary_estimate?.maximum || 0;

            return (
              <Link key={i} href={`/jobs/${slug}`} className="jobs-card">
                <div className="jobs-card-top">
                  <div className="jobs-symbol">{job.job_title[0]}</div>
                  <span className="jobs-employment">{job.employment_type}</span>
                </div>

                <div className="jobs-meta">
                  {job.department} - {job.job_level}
                </div>

                <h3>{job.job_title}</h3>
                <p className="jobs-card-description">{job.job_description}</p>

                <div className="jobs-skills">
                  {(job.technical_skills || []).slice(0, 3).map((s: string) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>

                <div className="jobs-salary">
                  Rp {(min / 1000000).toFixed(1)} Jt - Rp{" "}
                  {(max / 1000000).toFixed(1)} Jt
                  <span>/ bulan</span>
                </div>

                <div className="jobs-detail-button">Lihat Detail</div>
              </Link>
            );
          })}
        </div>

        <div className="jobs-pagination">
          {safePage > 1 && (
            <Link href={mk(safePage - 1)} className="jobs-page-link">
              Sebelumnya
            </Link>
          )}

          {[safePage - 1, safePage, safePage + 1]
            .filter((p) => p >= 1 && p <= totalPages)
            .map((p) => (
              <Link
                key={p}
                href={mk(p)}
                className={`jobs-page-link${p === safePage ? " current" : ""}`}
              >
                {p}
              </Link>
            ))}

          {safePage < totalPages && (
            <Link href={mk(safePage + 1)} className="jobs-page-link next">
              Berikutnya
            </Link>
          )}
        </div>

        <div className="jobs-page-info">
          Total {totalPages} halaman - Hemat kuota, load 20 loker doang per halaman.
        </div>
      </section>
    </main>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string; page?: string }>;
}) {
  return (
    <Suspense fallback={<div className="jobs-loading">Loading jobs...</div>}>
      <JobsContent searchParams={searchParams} />
    </Suspense>
  );
}

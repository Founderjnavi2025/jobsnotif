"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import dataset from "../../../data/job_description_dataset.json";
import { supabase } from "../../../lib/supabase";

type JobTemplate = {
  job_title: string; department: string; job_level: string; job_description: string;
  responsibilities: string[]; qualifications: string[]; technical_skills: string[]; soft_skills: string[];
  employment_type: string; experience_level: string;
  salary_estimate?: { minimum: number; maximum: number; period: string; };
};
const templates = dataset.positions as JobTemplate[];
function normalize(v: string) { return v.trim().toLowerCase().replace(/\s+/g, " "); }

function generateJobToken() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const value = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `jobanotif-${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`;
}

export default function CreateJobPage() {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishedToken, setPublishedToken] = useState("");
  const [templateLoaded, setTemplateLoaded] = useState(false);

  // COMPANY - INI YANG DITAMBAH BRE, DARI SUPABASE
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [recruitmentEmail, setRecruitmentEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [jobLevel, setJobLevel] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [vacancies, setVacancies] = useState("1");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState([""]);
  const [qualifications, setQualifications] = useState([""]);
  const [technicalSkills, setTechnicalSkills] = useState([""]);
  const [softSkills, setSoftSkills] = useState([""]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryPeriod, setSalaryPeriod] = useState("Monthly");

  useEffect(() => {
    // 1. LOAD PROFIL BRE
    async function loadProfile() {
      const { data } = await supabase.auth.getUser();
      const m = data.user?.user_metadata || {};
      setCompanyName(m.company_name || "");
      setIndustry(m.industry || "");
      setContactPerson(m.contact_person || "");
      setRecruitmentEmail(m.recruitment_email || data.user?.email || "");
      setPhone(m.phone || "");
      setWebsite(m.website || "");
      setLocation(m.company_location || "");
    }
    loadProfile();

    // 2. LOAD TEMPLATE JOB BRE
    const params = new URLSearchParams(window.location.search);
    const selectedTitle = params.get("template") || "";
    const selectedGroup = params.get("group") || "";
    if (!selectedTitle) return;
    setJobTitle(selectedTitle);
    const match = templates.find((i) => normalize(i.job_title) === normalize(selectedTitle));
    if (!match) { setNotice(`Jabatan "${selectedTitle}" belum memiliki template deskripsi. Silakan isi secara manual.`); return; }
    setDepartment(match.department || "");
    setJobLevel(match.job_level || "");
    setEmploymentType(match.employment_type || "");
    setExperienceLevel(match.experience_level || "");
    setDescription(match.job_description || "");
    setResponsibilities(match.responsibilities?.length ? match.responsibilities : [""]);
    setQualifications(match.qualifications?.length ? match.qualifications : [""]);
    setTechnicalSkills(match.technical_skills?.length ? match.technical_skills : [""]);
    setSoftSkills(match.soft_skills?.length ? match.soft_skills : [""]);
    if (match.salary_estimate) { setSalaryMin(String(match.salary_estimate.minimum || "")); setSalaryMax(String(match.salary_estimate.maximum || "")); setSalaryPeriod(match.salary_estimate.period || "Monthly"); }
    setTemplateLoaded(true);
    setNotice(`Job Description berhasil dimuat: ${match.job_title} · ${selectedGroup || "Template"}`);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setNotice("");
    setPublishedToken("");

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const user = authData.user;

      if (authError || !user) {
        throw new Error("Session expired. Please login again.");
      }

      if (user.user_metadata?.account_type !== "business") {
        throw new Error("Only business accounts can publish job vacancies.");
      }

      if (!companyName.trim()) {
        throw new Error("Company name is required. Please complete your Business Profile.");
      }

      const jobData = {
        industry: industry.trim(),
        department: department.trim(),
        job_level: jobLevel,
        employment_type: employmentType,
        experience_level: experienceLevel.trim(),
        vacancies: Math.max(1, Number(vacancies) || 1),
        location: location.trim(),
        description: description.trim(),
        responsibilities: responsibilities.map((v) => v.trim()).filter(Boolean),
        qualifications: qualifications.map((v) => v.trim()).filter(Boolean),
        technical_skills: technicalSkills.map((v) => v.trim()).filter(Boolean),
        soft_skills: softSkills.map((v) => v.trim()).filter(Boolean),
        salary: {
          minimum: salaryMin ? Number(salaryMin) : null,
          maximum: salaryMax ? Number(salaryMax) : null,
          period: salaryPeriod,
        },
      };

      let savedToken = "";
      let saved = false;

      for (let attempt = 0; attempt < 3; attempt++) {
        const token = generateJobToken();

        const { error } = await supabase.from("jobs").insert({
          company_id: user.id,
          token,
          company_name: companyName.trim(),
          job_title: jobTitle.trim(),
          status: "published",
          job_data: jobData,
        });

        if (!error) {
          savedToken = token;
          saved = true;
          break;
        }

        if (error.code === "23505") continue;
        throw error;
      }

      if (!saved) {
        throw new Error("Could not generate a unique token. Please try again.");
      }

      setPublishedToken(savedToken);
      setNotice("Your job vacancy has been successfully published. Opening Manager...");
      router.push(`/manager/${encodeURIComponent(savedToken)}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to publish job vacancy.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="cj-page">
      <header className="cj-header">
        <Link href="/business-profile" className="cj-brand"><span className="cj-logo">J</span><span>JobsNotif</span></Link>
        <Link href="/business-profile" className="cj-exit">← Business Profile</Link>
      </header>
      <div className="cj-container">
        <div className="cj-intro"><span className="cj-eyebrow">RECRUITMENT</span><h1>Create Job Vacancy</h1><p>Create a job opportunity and find the right candidates for your company.</p></div>
        {notice && <div className="cj-notice" role="status">{notice}</div>}
        {publishedToken && (
          <div style={{ padding: 20, marginBottom: 24, border: "1px solid #b8e6b8", borderRadius: 14, background: "#eaffea" }}>
            <strong>YOUR JOB TOKEN</strong>
            <p style={{ fontSize: 20, fontWeight: 800, wordBreak: "break-word", margin: "10px 0" }}>{publishedToken}</p>
            <button type="button" onClick={() => navigator.clipboard.writeText(publishedToken)} style={{ padding: "9px 16px", border: 0, borderRadius: 8, background: "#111", color: "#fff", cursor: "pointer" }}>Copy Token</button>
            <p style={{ fontSize: 13, marginBottom: 0 }}>Save this token. Candidates will use it to find this exact vacancy.</p>
          </div>
        )}
        {templateLoaded && <div style={{ padding: "12px 16px", marginBottom: 20, borderRadius: 12, background: "#eaf8ef", color: "#176b3a", fontSize: 13, fontWeight: 600 }}>✓ JOB TEMPLATE LOADED — All fields are editable.</div>}

        <form onSubmit={handleSubmit}>
          <section className="cj-section">
            <div className="cj-section-heading"><span className="cj-step">01</span><div><h2>Company Information</h2><p>Tell candidates about your company.</p></div></div>
            <div className="cj-company-preview">
              <div className="cj-company-logo">{(companyName || "B").charAt(0).toUpperCase()}</div>
              <div><strong>{companyName || "Your Company"}</strong><span>{contactPerson || "Business Profile"} {recruitmentEmail ? `· ${recruitmentEmail}` : ""}</span></div>
              <Link href="/business-profile">Edit Profile ↗</Link>
            </div>
            {/* INI YANG DIBENERIN BRE - SEKARANG ADA VALUE + ONCHANGE */}
            <div className="cj-grid">
              <Field label="Company Name" placeholder="Company name" value={companyName} onChange={setCompanyName} />
              <Field label="Industry" placeholder="e.g. Technology" value={industry} onChange={setIndustry} />
              <Field label="Contact Person" placeholder="Full name" value={contactPerson} onChange={setContactPerson} />
              <Field label="Recruitment Email" placeholder="recruitment@company.com" type="email" value={recruitmentEmail} onChange={setRecruitmentEmail} />
              <Field label="Phone Number" placeholder="+62 ..." value={phone} onChange={setPhone} />
              <Field label="Company Website" placeholder="https://..." value={website} onChange={setWebsite} />
            </div>
          </section>

          <section className="cj-section">
            <div className="cj-section-heading"><span className="cj-step">02</span><div><h2>Position Information</h2><p>Define the position you are recruiting for.</p></div></div>
            <div className="cj-grid">
              <Field label="Job Title" placeholder="e.g. Software Engineer" value={jobTitle} onChange={setJobTitle} required />
              <Field label="Department" placeholder="e.g. Engineering" value={department} onChange={setDepartment} />
              <SelectField label="Job Level" value={jobLevel} onChange={setJobLevel} options={["Internship", "Entry Level", "Junior", "Mid Level", "Senior", "Manager", "Director", "Executive"]} />
              <SelectField label="Employment Type" value={employmentType} onChange={setEmploymentType} options={["Full-time", "Part-time", "Contract", "Freelance", "Internship"]} />
              <Field label="Experience Level" placeholder="e.g. 2 years experience" value={experienceLevel} onChange={setExperienceLevel} />
              <Field label="Number of Vacancies" placeholder="e.g. 3" type="number" value={vacancies} onChange={setVacancies} />
            </div>
            <div className="cj-grid cj-grid-single"><Field label="Work Location" placeholder="City, province, or remote" value={location} onChange={setLocation} /></div>
          </section>

          <section className="cj-section">
            <div className="cj-section-heading"><span className="cj-step">03</span><div><h2>Job Description</h2><p>Describe the role and what the candidate will do.</p></div></div>
            <div className="cj-field"><label>Job Description <b>*</b></label><textarea required rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the position..." /></div>
            <ListEditor title="Responsibilities" description="Main duties and responsibilities of this position." items={responsibilities} setter={setResponsibilities} placeholder="Describe a responsibility..." />
          </section>

          <section className="cj-section">
            <div className="cj-section-heading"><span className="cj-step">04</span><div><h2>Candidate Requirements</h2><p>What qualifications should candidates have?</p></div></div>
            <ListEditor title="Qualifications" description="Education, experience, and other requirements." items={qualifications} setter={setQualifications} placeholder="Add a qualification..." />
          </section>

          <section className="cj-section">
            <div className="cj-section-heading"><span className="cj-step">05</span><div><h2>Required Skills</h2><p>Specify the skills needed for this role.</p></div></div>
            <ListEditor title="Technical Skills" description="Tools, technologies, and professional abilities." items={technicalSkills} setter={setTechnicalSkills} placeholder="e.g. Python, Excel, Project Management" />
            <div className="cj-sub-divider" />
            <ListEditor title="Soft Skills" description="Personal and interpersonal abilities." items={softSkills} setter={setSoftSkills} placeholder="e.g. Communication, Leadership" />
          </section>

          <section className="cj-section">
            <div className="cj-section-heading"><span className="cj-step">06</span><div><h2>Salary & Compensation</h2><p>Provide a salary range for this opportunity.</p></div></div>
            <div className="cj-grid cj-grid-three">
              <Field label="Minimum Salary (IDR)" placeholder="e.g. 5000000" type="number" value={salaryMin} onChange={setSalaryMin} />
              <Field label="Maximum Salary (IDR)" placeholder="e.g. 8000000" type="number" value={salaryMax} onChange={setSalaryMax} />
              <SelectField label="Salary Period" value={salaryPeriod} onChange={setSalaryPeriod} options={["Monthly", "Yearly", "Daily", "Hourly"]} />
            </div>
            <p className="cj-hint">You can leave salary information empty if it is confidential.</p>
          </section>

          <div className="cj-submit-area"><p>Review your information before continuing.</p><button type="submit" className="cj-submit" disabled={saving}>{saving ? "Publishing..." : "Publish Job Vacancy"} <span>→</span></button><Link href="/business-profile" className="cj-cancel">Cancel and return to profile</Link></div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, placeholder, type = "text", required = false, value, onChange }: { label: string; placeholder: string; type?: string; required?: boolean; value?: string; onChange?: (v: string) => void; }) {
  return (<div className="cj-field"><label>{label}{required && <b> *</b>}</label><input type={type} placeholder={placeholder} required={required} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} /></div>);
}
function SelectField({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void; }) {
  return (<div className="cj-field"><label>{label}</label><select value={value} onChange={(e) => onChange(e.target.value)}><option value="">Select {label}</option>{value && !options.includes(value) && <option value={value}>{value}</option>}{options.map((o) => (<option key={o} value={o}>{o}</option>))}</select></div>);
}
function ListEditor({ title, description, items, setter, placeholder }: { title: string; description: string; items: string[]; setter: (v: string[]) => void; placeholder: string; }) {
  function update(i: number, v: string) { const u = [...items]; u[i] = v; setter(u); }
  function remove(i: number) { if (items.length <= 1) return; setter(items.filter((_, x) => x !== i)); }
  return (<div className="cj-list-editor"><div className="cj-list-heading"><div><h4>{title}</h4><p>{description}</p></div><button type="button" className="cj-add" onClick={() => setter([...items, ""])}>+ Add</button></div>{items.map((item, idx) => (<div className="cj-list-row" key={idx}><span className="cj-list-number">{idx + 1}</span><input value={item} onChange={(e) => update(idx, e.target.value)} placeholder={placeholder} /><button type="button" className="cj-remove" onClick={() => remove(idx)}>×</button></div>))}</div>);
}

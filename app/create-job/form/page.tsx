"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function CreateJobPage() {
  const [notice, setNotice] = useState("");

  const [responsibilities, setResponsibilities] = useState([""]);
  const [qualifications, setQualifications] = useState([""]);
  const [technicalSkills, setTechnicalSkills] = useState([""]);
  const [softSkills, setSoftSkills] = useState([""]);

  function updateList(
    setter: (value: string[]) => void,
    list: string[],
    index: number,
    value: string
  ) {
    const updated = [...list];
    updated[index] = value;
    setter(updated);
  }

  function addList(
    setter: (value: string[]) => void,
    list: string[]
  ) {
    setter([...list, ""]);
  }

  function removeList(
    setter: (value: string[]) => void,
    list: string[],
    index: number
  ) {
    if (list.length <= 1) return;
    setter(list.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Form preview completed. Publishing will be connected later.");
  }

  function ListEditor({
    title,
    description,
    items,
    setter,
    placeholder,
  }: {
    title: string;
    description: string;
    items: string[];
    setter: (value: string[]) => void;
    placeholder: string;
  }) {
    return (
      <div className="cj-list-editor">
        <div className="cj-list-heading">
          <div>
            <h4>{title}</h4>
            <p>{description}</p>
          </div>
          <button
            type="button"
            className="cj-add"
            onClick={() => addList(setter, items)}
          >
            + Add
          </button>
        </div>

        {items.map((item, index) => (
          <div className="cj-list-row" key={index}>
            <span className="cj-list-number">{index + 1}</span>
            <input
              value={item}
              onChange={(e) =>
                updateList(setter, items, index, e.target.value)
              }
              placeholder={placeholder}
            />
            <button
              type="button"
              className="cj-remove"
              onClick={() => removeList(setter, items, index)}
              aria-label="Remove item"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="cj-page">
      <header className="cj-header">
        <Link href="/business-profile" className="cj-brand">
          <span className="cj-logo">J</span>
          <span>JobsNotif</span>
        </Link>
        <Link href="/business-profile" className="cj-exit">
          ← Business Profile
        </Link>
      </header>

      <div className="cj-container">
        <div className="cj-intro">
          <span className="cj-eyebrow">RECRUITMENT</span>
          <h1>Create Job Vacancy</h1>
          <p>
            Create a job opportunity and find the right
            candidates for your company.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <section className="cj-section">
            <div className="cj-section-heading">
              <span className="cj-step">01</span>
              <div>
                <h2>Company Information</h2>
                <p>Tell candidates about your company.</p>
              </div>
            </div>

            <div className="cj-company-preview">
              <div className="cj-company-logo">B</div>
              <div>
                <strong>Your Company</strong>
                <span>Business Profile</span>
              </div>
              <Link href="/business-profile">Edit Profile ↗</Link>
            </div>

            <div className="cj-grid">
              <Field label="Company Name" placeholder="Company name" />
              <Field label="Industry" placeholder="e.g. Technology" />
              <Field label="Contact Person" placeholder="Full name" />
              <Field label="Recruitment Email" placeholder="recruitment@company.com" type="email" />
              <Field label="Phone Number" placeholder="+62 ..." />
              <Field label="Company Website" placeholder="https://..." />
            </div>
          </section>

          <section className="cj-section">
            <div className="cj-section-heading">
              <span className="cj-step">02</span>
              <div>
                <h2>Position Information</h2>
                <p>Define the position you are recruiting for.</p>
              </div>
            </div>

            <div className="cj-grid">
              <Field label="Job Title" placeholder="e.g. Software Engineer" required />
              <Field label="Department" placeholder="e.g. Engineering" />
              <SelectField
                label="Job Level"
                options={["Internship", "Entry Level", "Junior", "Mid Level", "Senior", "Manager", "Executive"]}
              />
              <SelectField
                label="Employment Type"
                options={["Full-time", "Part-time", "Contract", "Freelance", "Internship"]}
              />
              <Field label="Experience Level" placeholder="e.g. 2 years experience" />
              <Field label="Number of Vacancies" placeholder="e.g. 3" type="number" />
            </div>

            <div className="cj-grid cj-grid-single">
              <Field label="Work Location" placeholder="City, province, or remote" />
            </div>
          </section>

          <section className="cj-section">
            <div className="cj-section-heading">
              <span className="cj-step">03</span>
              <div>
                <h2>Job Description</h2>
                <p>Describe the role and what the candidate will do.</p>
              </div>
            </div>

            <div className="cj-field">
              <label>Job Description <b>*</b></label>
              <textarea
                required
                rows={6}
                placeholder="Describe the position, its purpose, and what makes this opportunity interesting..."
              />
            </div>

            <ListEditor
              title="Responsibilities"
              description="Main duties and responsibilities of this position."
              items={responsibilities}
              setter={setResponsibilities}
              placeholder="Describe a responsibility..."
            />
          </section>

          <section className="cj-section">
            <div className="cj-section-heading">
              <span className="cj-step">04</span>
              <div>
                <h2>Candidate Requirements</h2>
                <p>What qualifications should candidates have?</p>
              </div>
            </div>

            <ListEditor
              title="Qualifications"
              description="Education, experience, and other requirements."
              items={qualifications}
              setter={setQualifications}
              placeholder="Add a qualification..."
            />
          </section>

          <section className="cj-section">
            <div className="cj-section-heading">
              <span className="cj-step">05</span>
              <div>
                <h2>Required Skills</h2>
                <p>Specify the skills needed for this role.</p>
              </div>
            </div>

            <ListEditor
              title="Technical Skills"
              description="Tools, technologies, and professional abilities."
              items={technicalSkills}
              setter={setTechnicalSkills}
              placeholder="e.g. Python, Excel, Project Management"
            />

            <div className="cj-sub-divider" />

            <ListEditor
              title="Soft Skills"
              description="Personal and interpersonal abilities."
              items={softSkills}
              setter={setSoftSkills}
              placeholder="e.g. Communication, Leadership"
            />
          </section>

          <section className="cj-section">
            <div className="cj-section-heading">
              <span className="cj-step">06</span>
              <div>
                <h2>Salary & Compensation</h2>
                <p>Provide a salary range for this opportunity.</p>
              </div>
            </div>

            <div className="cj-grid cj-grid-three">
              <Field label="Minimum Salary (IDR)" placeholder="e.g. 5000000" type="number" />
              <Field label="Maximum Salary (IDR)" placeholder="e.g. 8000000" type="number" />
              <SelectField
                label="Salary Period"
                options={["Monthly", "Yearly", "Daily", "Hourly"]}
              />
            </div>
            <p className="cj-hint">
              You can leave salary information empty if it is confidential.
            </p>
          </section>

          <div className="cj-submit-area">
            {notice && <div className="cj-notice">{notice}</div>}
            <p>Review your information before continuing.</p>
            <button type="submit" className="cj-submit">
              Preview Job Vacancy <span>→</span>
            </button>
            <Link href="/business-profile" className="cj-cancel">
              Cancel and return to profile
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="cj-field">
      <label>{label}{required && <b> *</b>}</label>
      <input type={type} placeholder={placeholder} required={required} />
    </div>
  );
}

function SelectField({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <div className="cj-field">
      <label>{label}</label>
      <select defaultValue="">
        <option value="" disabled>Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

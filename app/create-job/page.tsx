
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dataset from "../../data/job_available.json";
import { supabase } from "../../lib/supabase";

type JobGroup = {
  id: string;
  label: string;
  options: string[];
};

const groups = (dataset as { groups: JobGroup[] }).groups;

const totalOptions = groups.reduce(
  (total, group) => total + group.options.length,
  0
);

export default function CreateJobPage() {
  const [search, setSearch] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.auth.getUser();
      const metadata = data.user?.user_metadata || {};

      setCompanyName(metadata.company_name || "");
      setContactPerson(metadata.contact_person || "");
    }

    loadProfile();
  }, []);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return groups.map((group) => ({
      ...group,
      filteredOptions: group.options,
    }));

    return groups
      .map((group) => {
        const groupMatches =
          group.label.toLowerCase().includes(q) ||
          group.id.toLowerCase().includes(q);

        const filteredOptions = groupMatches
          ? group.options
          : group.options.filter((option) =>
              option.toLowerCase().includes(q)
            );

        return {
          ...group,
          filteredOptions,
        };
      })
      .filter((group) => group.filteredOptions.length > 0);
  }, [search]);

  const visibleOptions = filteredGroups.reduce(
    (total, group) => total + group.filteredOptions.length,
    0
  );

  return (
    <main className="jt-page">
      <header className="jt-header">
        <Link href="/business-profile" className="jt-brand">
          <span className="jt-logo">J</span> JobsNotif
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ textAlign: "right", lineHeight: 1.2 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {companyName || "Loading company..."}
            </div>

            <div style={{ fontSize: 12, color: "#666" }}>
              {contactPerson || "Business Account"}
            </div>
          </div>

          <Link href="/business-profile" className="jt-back">
            ← Business Profile
          </Link>
        </div>
      </header>

      <section className="jt-container">
        <div className="jt-intro">
          <span className="jt-eyebrow">
            RECRUITMENT WORKSPACE
          </span>

          <h1>
            What position are <span>you hiring?</span>
          </h1>

          <p>
            Explore all available job positions, departments,
            skills, and professional categories.
          </p>

          {companyName && (
            <p style={{ marginTop: 8 }}>
              <strong>Hiring as:</strong> {companyName}
              {contactPerson ? ` (${contactPerson})` : ""}
            </p>
          )}
        </div>

        <div
          className="jt-count"
          style={{
            gap: 10,
            margin: "14px 0",
          }}
        >
          <div style={{ padding: "9px 12px", minWidth: 0 }}>
            <span style={{ fontSize: 10 }}>AVAILABLE CATEGORIES</span>
            <strong style={{ fontSize: 15 }}>{groups.length} Categories</strong>
          </div>

          <div style={{ padding: "9px 12px", minWidth: 0 }}>
            <span style={{ fontSize: 10 }}>JSON DATA OPTIONS</span>
            <strong style={{ fontSize: 15 }}>{totalOptions} Options</strong>
          </div>
        </div>

        {/* GLOBAL SEARCH */}
        <div style={{ margin: "24px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 14 }}>
              SEARCH ALL AVAILABLE OPTIONS
            </span>
          </div>

          <input
            className="jt-position-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search from ${totalOptions} options...`}
            style={{
              width: "100%",
              boxSizing: "border-box",
            }}
          />

          <p style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>
            Showing {visibleOptions} of {totalOptions} options
            across {filteredGroups.length} categories.
          </p>
        </div>

        {/* ALL JSON GROUPS */}
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, index) => (
            <section
              key={group.id}
              style={{ marginBottom: 32 }}
            >
              <div className="jt-section-title">
                <span>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <h2>{group.label}</h2>
                  <p>
                    {group.filteredOptions.length} available choices
                  </p>
                </div>
              </div>

              <div className="jt-position-grid">
                {group.filteredOptions.map((option, optionIndex) => (
                  <Link
                    key={`${group.id}-${option}-${optionIndex}`}
                    href={`/create-job/form?template=${encodeURIComponent(option)}&group=${encodeURIComponent(group.id)}`}
                    className="jt-position-option"
                  >
                    <span>{option}</span>
                    <b>↗</b>
                  </Link>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="jt-empty">
            <h2>No matching options found</h2>
            <p>
              Try another keyword or clear your search.
            </p>

            <button
              type="button"
              onClick={() => setSearch("")}
              style={{
                marginTop: 12,
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
              }}
            >
              Clear Search
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

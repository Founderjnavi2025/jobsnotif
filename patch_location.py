from pathlib import Path
import shutil

def patch_file(path, replacements):
    p = Path(path)
    s = p.read_text()
    original = s

    for old, new, label in replacements:
        count = s.count(old)
        if count != 1:
            raise SystemExit(
                f"STOP: {path} — anchor '{label}' ditemukan {count} kali. "
                "Tidak ada perubahan disimpan."
            )
        s = s.replace(old, new, 1)

    if s != original:
        shutil.copy2(p, str(p) + ".bak")
        p.write_text(s)
        print(f"PATCHED: {path}")
    else:
        print(f"UNCHANGED: {path}")

# ==========================================
# 1. BUSINESS PROFILE
# ==========================================
patch_file("app/business-profile/page.tsx", [
    (
        'type Company = { company_name: string; contact_person: string; email: string; phone: string; website: string; };',
        'type Company = { company_name: string; contact_person: string; email: string; phone: string; website: string; location: string; };',
        "Company type"
    ),
    (
        'const emptyCompany: Company = { company_name: "", contact_person: "", email: "", phone: "", website: "" };',
        'const emptyCompany: Company = { company_name: "", contact_person: "", email: "", phone: "", website: "", location: "" };',
        "emptyCompany"
    ),
    (
        '        website: m.website || "",\n      };',
        '        website: m.website || "",\n        location: m.company_location || "",\n      };',
        "profile load location"
    ),
    (
        '      website: company.website.trim(),\n    };',
        '      website: company.website.trim(),\n      location: company.location.trim(),\n    };',
        "save location"
    ),
    (
        'website: up.website },',
        'website: up.website, company_location: up.location },',
        "metadata save location"
    ),
    (
        '            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.website || "Not set yet"}</div>\n          </div>\n        </div>',
        '            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.website || "Not set yet"}</div>\n          </div>\n          <div className="bp-clean-info-card bp-clean-full" style={{ background: "#f7f7f7", padding: 16, borderRadius: 12, gridColumn: "1 / -1" }}>\n            <div style={{ fontSize: 11, color: "#888" }}>COMPANY LOCATION</div>\n            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.location || "Not set yet"}</div>\n          </div>\n        </div>',
        "profile display location"
    ),
    (
        '<label style={{ ...labelStyle, gridColumn: "1 / -1" }}>Company Website<input style={inputStyle} value={company.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://..." /></label>',
        '<label style={{ ...labelStyle, gridColumn: "1 / -1" }}>Company Website<input style={inputStyle} value={company.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://..." /></label>\n              <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>Company Location<input style={inputStyle} value={company.location} onChange={(e) => updateField("location", e.target.value)} placeholder="e.g. Jakarta, Indonesia / Remote" /></label>',
        "profile edit location"
    ),
])

# ==========================================
# 2. CREATE JOB FORM
# ==========================================
patch_file("app/create-job/form/page.tsx", [
    (
        '  const [website, setWebsite] = useState("");',
        '  const [website, setWebsite] = useState("");\n  const [location, setLocation] = useState("");',
        "company location state"
    ),
    (
        '  const [vacancies, setVacancies] = useState("");\n  const [location, setLocation] = useState("");',
        '  const [vacancies, setVacancies] = useState("1");\n  const [location, setLocation] = useState("");',
        "vacancies default"
    ),
    (
        '      setWebsite(m.website || "");\n    }',
        '      setWebsite(m.website || "");\n      setLocation(m.company_location || "");\n    }',
        "load company location"
    ),
])

print("\nPATCH COMPLETE")

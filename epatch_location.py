import pathlib

# === 1. BUSINESS PROFILE ===
  p = pathlib.Path("app/business-profile/page.tsx")
t = p.read_text()
t = t.replace(
  'type Company = { company_name: string; contact_person: string; email: string; phone: string; website: string; };',
  'type Company = { company_name: string; contact_person: string; email: string; phone: string; website: string; location: string; };'
)
t = t.replace(
  'const emptyCompany: Company = { company_name: "", contact_person: "", email: "", phone: "", website: "" };',
  'const emptyCompany: Company = { company_name: "", contact_person: "", email: "", phone: "", website: "", location: "" };'
)
t = t.replace(
  '        website: m.website || "",\n      };',
  '        website: m.website || "",\n        location: m.company_location || "",\n      };'
)
t = t.replace(
  '      website: company.website.trim(),\n    };',
  '      website: company.website.trim(),\n      location: company.location.trim(),\n    };'
)
t = t.replace(
  'website: up.website }',
  'website: up.website, company_location: up.location }'
)
# display - setelah website card
t = t.replace(
  '            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.website || "Not set yet"}</div>\n          </div>\n        </div>',
  '            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.website || "Not set yet"}</div>\n          </div>\n          <div style={{ background: "#f7f7f7", padding: 16, borderRadius: 12, gridColumn: "1 / -1" }}>\n            <div style={{ fontSize: 11, color: "#888" }}>COMPANY LOCATION</div>\n            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.location || "Not set yet"}</div>\n          </div>\n        </div>'
)
# edit form - setelah website input
t = t.replace(
  '<label style={{ ...labelStyle, gridColumn: "1 / -1" }}>Company Website<input style={inputStyle} value={company.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://..." /></label>',
  '<label style={{ ...labelStyle, gridColumn: "1 / -1" }}>Company Website<input style={inputStyle} value={company.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://..." /></label>\n              <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>Company Location<input style={inputStyle} value={company.location} onChange={(e) => updateField("location", e.target.value)} placeholder="e.g. Jakarta, Indonesia / Remote" /></label>'
)
p.write_text(t)
print("business-profile patched:", "company_location" in p.read_text())

# === 2. CREATE JOB FORM ===
  p2 = pathlib.Path("app/create-job/form/page.tsx")
t2 = p2.read_text()
t2 = t2.replace(
  'const [vacancies, setVacancies] = useState("");',
  'const [vacancies, setVacancies] = useState("1");'
)
t2 = t2.replace(
  '      setWebsite(m.website || "");\n    }',
  '      setWebsite(m.website || "");\n      setLocation(m.company_location || "");\n    }'
)
p2.write_text(t2)
print("create-job/form patched:", 'setLocation(m.company_location' in p2.read_text(), 'useState("1")' in p2.read_text())

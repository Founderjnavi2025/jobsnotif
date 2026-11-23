from pathlib import Path
import shutil

p = Path("app/business-profile/page.tsx")
s = p.read_text()
original = s

patches = [
    (
        'type Company = { company_name: string; contact_person: string; email: string; phone: string; website: string; location: string; };',
        'type Company = { company_name: string; industry: string; contact_person: string; email: string; phone: string; website: string; location: string; };',
        "Company type"
    ),
    (
        'const emptyCompany: Company = { company_name: "", contact_person: "", email: "", phone: "", website: "", location: "" };',
        'const emptyCompany: Company = { company_name: "", industry: "", contact_person: "", email: "", phone: "", website: "", location: "" };',
        "emptyCompany"
    ),
    (
        '        company_name: m.company_name || "",\n        contact_person:',
        '        company_name: m.company_name || "",\n        industry: m.industry || "",\n        contact_person:',
        "load industry"
    ),
    (
        '      company_name: company.company_name.trim(),\n      contact_person:',
        '      company_name: company.company_name.trim(),\n      industry: company.industry.trim(),\n      contact_person:',
        "save industry"
    ),
    (
        'company_name: up.company_name, contact_person:',
        'company_name: up.company_name, industry: up.industry, contact_person:',
        "metadata industry"
    ),
    (
        '          <div className="bp-clean-info-card bp-clean-full" style={{ background: "#f7f7f7", padding: 16, borderRadius: 12, gridColumn: "1 / -1" }}>\n            <div style={{ fontSize: 11, color: "#888" }}>COMPANY WEBSITE</div>',
        '          <div className="bp-clean-info-card" style={{ background: "#f7f7f7", padding: 16, borderRadius: 12 }}>\n            <div style={{ fontSize: 11, color: "#888" }}>INDUSTRY</div>\n            <div style={{ fontWeight: 700, marginTop: 4 }}>{company.industry || "Not set yet"}</div>\n          </div>\n          <div className="bp-clean-info-card bp-clean-full" style={{ background: "#f7f7f7", padding: 16, borderRadius: 12, gridColumn: "1 / -1" }}>\n            <div style={{ fontSize: 11, color: "#888" }}>COMPANY WEBSITE</div>',
        "display industry"
    ),
    (
        '<label style={labelStyle}>Company Name<input style={inputStyle} value={company.company_name} onChange={(e) => updateField("company_name", e.target.value)} placeholder="Company name" /></label>',
        '<label style={labelStyle}>Company Name<input style={inputStyle} value={company.company_name} onChange={(e) => updateField("company_name", e.target.value)} placeholder="Company name" /></label>\n              <label style={labelStyle}>Industry<input style={inputStyle} value={company.industry} onChange={(e) => updateField("industry", e.target.value)} placeholder="e.g. Technology, Manufacturing, Retail" /></label>',
        "edit industry"
    ),
]

for old, new, label in patches:
    count = s.count(old)
    if count != 1:
        raise SystemExit(
            f"STOP: {label} ditemukan {count} kali. "
            "File tidak diubah."
        )
    s = s.replace(old, new, 1)

if s != original:
    shutil.copy2(p, str(p) + ".bak")
    p.write_text(s)

print("Industry added to Business Profile.")
print("Create Job already loads m.industry from Supabase.")

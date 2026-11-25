"use client";

import { useState } from "react";

type NavId = "overview" | "bot" | "candidates" | "webhook" | "social" | "finance" | "errors" | "system";
type Level = "INFO" | "OK" | "WARN" | "ERROR" | "MONEY";

type Log = { time: string; level: Level; msg: string; detail: string };

const NAV: { id: NavId; icon: string; label: string }[] = [
  { id: "overview", icon: "◫", label: "Overview" },
  { id: "bot", icon: "✈", label: "Bot Control" },
  { id: "candidates", icon: "♙", label: "Candidates" },
  { id: "webhook", icon: "⌘", label: "Webhook Monitor" },
  { id: "social", icon: "◎", label: "Social Media" },
  { id: "finance", icon: "＄", label: "Keuangan" },
  { id: "errors", icon: "⚠", label: "Error Center" },
  { id: "system", icon: "◈", label: "System Health" },
];

const LOGS: Record<NavId, Log[]> = {
  overview: [
    { time: "10:42:15", level: "OK", msg: "Telegram Bot aktif", detail: "jobsnotif_job1_bot · Demo" },
    { time: "10:41:02", level: "OK", msg: "42 kandidat baru terdaftar", detail: "Melalui Telegram · Demo" },
    { time: "10:30:11", level: "WARN", msg: "Webhook timeout 1x", detail: "/api/telegram/webhook · Demo" },
    { time: "10:12:44", level: "INFO", msg: "System check selesai", detail: "Semua layanan normal · Demo" },
    { time: "09:58:20", level: "INFO", msg: "8.412 pesan terkirim", detail: "30 hari terakhir · Demo" },
  ],
  bot: [
    { time: "10:42:15", level: "OK", msg: "Bot Telegram ON", detail: "jobsnotif_job1_bot · Demo" },
    { time: "10:40:01", level: "INFO", msg: "Notifikasi lowongan ON", detail: "Kirim sesuai minat · Demo" },
    { time: "10:35:22", level: "INFO", msg: "Auto Reply OFF", detail: "Balasan /start · Demo" },
    { time: "10:10:05", level: "OK", msg: "214 pesan hari ini", detail: "2 gagal kirim · Demo" },
  ],
  candidates: [
    { time: "10:41:02", level: "OK", msg: "Andi Pratama terdaftar", detail: "System Administrator · Telegram · Demo" },
    { time: "10:22:18", level: "OK", msg: "Sari Dewi terdaftar", detail: "Frontend Developer · Telegram · Demo" },
    { time: "10:05:33", level: "WARN", msg: "Budi Santoso menunggu verifikasi", detail: "Staff Administrasi · Demo" },
    { time: "09:47:11", level: "OK", msg: "Rina Lestari terdaftar", detail: "UI Designer · Telegram · Demo" },
  ],
  webhook: [
    { time: "10:42:00", level: "OK", msg: "POST /api/telegram/webhook 200", detail: "182ms · Demo" },
    { time: "10:30:11", level: "WARN", msg: "POST /api/telegram/webhook timeout", detail: "Retry 1x berhasil · Demo" },
    { time: "10:12:44", level: "OK", msg: "POST /api/candidates/register 200", detail: "96ms · Demo" },
    { time: "09:55:02", level: "INFO", msg: "GET /api/telegram/webhook health check", detail: "OK · Demo" },
  ],
  social: [
    { time: "10:15:00", level: "INFO", msg: "Content Planner: 12 draf siap", detail: "Instagram + TikTok · Demo" },
    { time: "09:40:12", level: "WARN", msg: "n8n Workflow belum terhubung", detail: "Menunggu setup n8n · Demo" },
    { time: "09:12:30", level: "OK", msg: "86 post sudah tayang", detail: "Published Posts · Demo" },
    { time: "08:58:44", level: "INFO", msg: "Publishing Queue: 6 antrian", detail: "Menunggu jadwal · Demo" },
  ],
  finance: [
    { time: "10:20:10", level: "MONEY", msg: "+ Rp 1.500.000 Company Subscription", detail: "INV-2026-001 · Demo" },
    { time: "09:44:02", level: "MONEY", msg: "+ Rp 750.000 Job Posting", detail: "INV-2026-002 · Demo" },
    { time: "09:10:55", level: "WARN", msg: "- Rp 500.000 Infrastructure", detail: "EXP-2026-001 · Demo" },
    { time: "08:30:12", level: "INFO", msg: "Net Profit Rp 16.400.000", detail: "66% margin · Demo" },
  ],
  errors: [
    { time: "10:30:11", level: "ERROR", msg: "Webhook timeout", detail: "Telegram / Webhook · Demo" },
    { time: "09:12:40", level: "WARN", msg: "Candidate link expired", detail: "Candidates / Register · Demo" },
    { time: "08:05:11", level: "ERROR", msg: "Failed to send message", detail: "Telegram / Bot · Demo" },
  ],
  system: [
    { time: "10:42:15", level: "OK", msg: "Next.js App sehat", detail: "Uptime 99,9% · Demo" },
    { time: "10:41:50", level: "OK", msg: "Supabase Database terhubung", detail: "96% health · Demo" },
    { time: "10:41:10", level: "INFO", msg: "Telegram API stabil", detail: "86% health · Demo" },
    { time: "10:00:00", level: "INFO", msg: "CPU 32% · Memory 58%", detail: "Demo" },
  ],
};

const levelColor: Record<Level, string> = {
  INFO: "#0066FF",
  OK: "#10B981",
  WARN: "#F59E0B",
  ERROR: "#EF4444",
  MONEY: "#FF7A00",
};

const financeSummary = [
  { label: "TOTAL REVENUE", value: "Rp 24.850.000", note: "+12,8% · Demo" },
  { label: "TOTAL EXPENSES", value: "Rp 8.450.000", note: "Operasional · Demo" },
  { label: "NET PROFIT", value: "Rp 16.400.000", note: "66% margin · Demo" },
  { label: "CASH BALANCE", value: "Rp 32.500.000", note: "Saldo · Demo" },
];

const financeModules = ["Revenue", "Expenses", "Transactions", "Subscriptions & Invoices", "Refunds", "Payroll", "Budget & Assets", "Tax & Reports"];
const socialModules = ["Content Planner", "Content Library", "Publishing Queue", "Published Posts", "Analytics & Engagement", "n8n Workflow Monitor", "Automation History"];

export default function AdminPage() {
  const [active, setActive] = useState<NavId>("overview");
  const [filter, setFilter] = useState<"ALL" | Level>("ALL");
  const [financeTab, setFinanceTab] = useState("");
  const [socialTab, setSocialTab] = useState("");
  const [botOn, setBotOn] = useState(true);
  const current = NAV.find((n) => n.id === active)!;
  const logs = LOGS[active].filter((l) => filter === "ALL" || l.level === filter);

  function go(id: NavId) { setActive(id); setFilter("ALL"); setFinanceTab(""); setSocialTab(""); }

  return (
    <main className="shell">
      <style>{`
        *{box-sizing:border-box} body{margin:0;background:#fff}
        .shell{min-height:100vh;background:#fff;color:#0A2540;font-family:Inter,system-ui,-apple-system,Arial,sans-serif;display:flex}
        .side{width:248px;flex:0 0 248px;background:#fff;border-right:1px solid #E2E8F0;padding:20px 14px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh}
        .brand{display:flex;gap:11px;align-items:center;padding:2px 10px 22px}
        .logo{width:40px;height:40px;border-radius:12px;background:linear-gradient(180deg,#2EA5FF,#0066FF);display:grid;place-items:center;font-weight:900;font-size:22px;color:#fff;box-shadow:0 4px 0 #0052CC}
        .brand b{font-size:22px;letter-spacing:-.7px}.brand b span{color:#FF7A00}.brand small{display:block;color:#64748B;font-size:9px;letter-spacing:1.6px;margin-top:3px;font-weight:800}
        .navlabel{color:#94A3B8;font-size:10px;letter-spacing:1.6px;font-weight:800;padding:14px 10px 8px}
        .nav{display:flex;flex-direction:column;gap:3px}
        .nav button{border:0;background:transparent;color:#475569;display:flex;gap:12px;align-items:center;padding:11px 12px;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;text-align:left;width:100%}
        .nav button:hover{background:#EFF6FF;color:#0A2540}.nav button.on{background:#0066FF;color:#fff;box-shadow:0 4px 0 #0052CC}
        .nav i{width:20px;text-align:center;font-style:normal;font-size:16px}
        .sidefoot{margin-top:auto;border-top:1px solid #E2E8F0;padding:16px 10px 2px;color:#64748B;font-size:11px;line-height:1.6}.sidefoot b{color:#0A2540}
        .main{flex:1;min-width:0;background:#F8FAFC}
        .top{height:64px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 28px;background:#fff;position:sticky;top:0;z-index:2}
        .crumb{font-size:12px;color:#64748B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.crumb b{color:#0A2540}
        .topright{display:flex;gap:10px;align-items:center}.pill{font-size:10px;font-weight:800;letter-spacing:.6px;color:#92400E;background:#FFFBEB;border:1px solid #FDE68A;padding:6px 10px;border-radius:99px;white-space:nowrap}.avatar{width:32px;height:32px;border-radius:50%;background:#0A2540;display:grid;place-items:center;font-size:12px;font-weight:800;color:#fff}
        .content{max-width:1080px;margin:auto;padding:28px 28px 40px}
        .eyebrow{color:#10B981;font-size:11px;letter-spacing:2px;font-weight:800;display:flex;gap:8px;align-items:center}.eyebrow:before{content:"";width:8px;height:8px;border-radius:99px;background:#10B981;display:inline-block;animation:pulse 1.6s infinite}
        @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(16,185,129,.5)}100%{box-shadow:0 0 0 8px rgba(16,185,129,0)}}
        .head h1{font-size:clamp(28px,4vw,38px);letter-spacing:-1.2px;line-height:1.05;margin:12px 0 8px;font-weight:900}.head h1 span{color:#0066FF}.head p{color:#64748B;font-size:14px;line-height:1.6;margin:0;max-width:640px}
        .headrow{display:flex;justify-content:space-between;align-items:flex-end;gap:16px}.date{color:#64748B;font-size:11px;white-space:nowrap;border:1px solid #E2E8F0;background:#fff;padding:9px 12px;border-radius:10px}
        .summary{display:flex;gap:24px;flex-wrap:wrap;margin:20px 0 22px;padding-bottom:18px;border-bottom:1px solid #E2E8F0}
        .summary div{flex:1;min-width:120px}.summary small{color:#64748B;font-size:10px;font-weight:800;letter-spacing:.8px}.summary b{display:block;font-size:20px;letter-spacing:-.5px;margin:6px 0 2px}.summary span{font-size:11px;color:#64748B}
        .toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
        .toolbar button{border:1px solid #E2E8F0;background:#fff;color:#475569;padding:7px 12px;border-radius:99px;font-size:11px;font-weight:700;cursor:pointer}.toolbar button.on{background:#0A2540;color:#fff;border-color:#0A2540}
        .logbox{background:#fff;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden}
        .loghead{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #E2E8F0}.loghead b{font-size:13px}.loghead span{font-size:10px;font-weight:800;color:#92400E;background:#FFFBEB;border:1px solid #FDE68A;padding:4px 8px;border-radius:99px}
        .logrow{display:flex;gap:14px;padding:13px 18px;border-bottom:1px solid #F1F5F9;align-items:flex-start}.logrow:last-child{border-bottom:0}
        .time{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#94A3B8;white-space:nowrap;padding-top:2px;min-width:68px}
        .badge{font-size:9px;font-weight:900;letter-spacing:.6px;padding:4px 7px;border-radius:6px;color:#fff;min-width:56px;text-align:center;flex:0 0 56px}
        .logmsg{flex:1;min-width:0}.logmsg b{font-size:13px}.logmsg div{font-size:11px;color:#64748B;margin-top:3px}
        .chiprow{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
        .chip{border:1px solid #E2E8F0;background:#fff;color:#0A2540;padding:8px 12px;border-radius:99px;font-size:11px;font-weight:700;cursor:pointer}.chip.on{background:#0066FF;color:#fff;border-color:#0066FF}
        .botbar{display:flex;gap:12px;align-items:center;background:#0A2540;color:#fff;border-radius:14px;padding:14px 16px;margin-bottom:16px}.botbar b{font-size:13px}.botbar span{font-size:11px;color:#CBD5E1}.toggle{margin-left:auto;width:42px;height:24px;border-radius:99px;background:#334155;position:relative;cursor:pointer;flex:0 0 42px;border:0}.toggle:after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.2s}.toggle.on{background:#10B981}.toggle.on:after{left:20px}
        .empty{padding:22px 16px;text-align:center;color:#64748B;font-size:12px;line-height:1.7}.empty b{color:#0A2540}
        .back{border:0;background:#0A2540;color:#fff;border-radius:12px;padding:10px 14px;font-size:11px;font-weight:700;cursor:pointer;margin-bottom:14px}
        .foot{color:#94A3B8;font-size:10px;text-align:center;padding:18px 0 4px}
        @media(max-width:920px){.shell{display:block}.side{width:100%;height:auto;position:relative;padding:14px}.brand{padding:0 6px 10px}.navlabel,.sidefoot{display:none}.nav{flex-direction:row;overflow-x:auto;padding-bottom:4px}.nav button{white-space:nowrap;width:auto;padding:9px 11px;font-size:12px}.top{padding:0 16px}.content{padding:22px 14px}}
        @media(max-width:640px){.headrow{align-items:flex-start;flex-direction:column}.time{min-width:58px}.logrow{padding:12px 12px}.summary{gap:16px}}
      `}</style>

      <aside className="side">
        <div className="brand"><div className="logo">J</div><div><b>jobs<span>notif</span></b><small>SUPER ADMIN CONSOLE</small></div></div>
        <div className="navlabel">CONTROL CENTER</div>
        <nav className="nav">{NAV.map((n) => (<button key={n.id} className={active === n.id ? "on" : ""} onClick={() => go(n.id)}><i>{n.icon}</i>{n.label}</button>))}</nav>
        <div className="sidefoot"><b>◈ JobsNotif Control</b><div>Semua log di halaman ini adalah data demonstrasi. Bukan log asli.</div></div>
      </aside>

      <div className="main">
        <header className="top"><div className="crumb">JobsNotif / <b>{current.label}</b>{financeTab ? ` / ${financeTab}` : ""}{socialTab ? ` / ${socialTab}` : ""}</div><div className="topright"><span className="pill">● DEMO LOG</span><div className="avatar">A</div></div></header>

        <div className="content">
          <div className="head"><div className="headrow"><div><div className="eyebrow">LIVE LOG · DEMO</div><h1>{active === "finance" ? (financeTab || <>Keuangan <span>perusahaan.</span></>) : active === "social" ? (socialTab || <>Social Media <span>Center.</span></>) : <>Sistem lagi <br />jalan <span>normal.</span></>}</h1><p>{active === "finance" ? "Semua aktivitas uang JobsNotif tercatat di sini. Data demonstrasi." : active === "social" ? "Semua aktivitas konten & n8n tercatat di sini. n8n belum terhubung." : "Cuma log doang. Ga ada kotak-kotak. Lu tinggal liat sistem lagi ngapain."}</p></div><div className="date">◷ 25 Nov 2026 · 10:42</div></div></div>

          {active === "finance" && (
            <div className="summary">{financeSummary.map((s) => (<div key={s.label}><small>{s.label}</small><b>{s.value}</b><span>{s.note}</span></div>))}</div>
          )}

          {active === "finance" && !financeTab && (
            <div className="chiprow">{financeModules.map((m) => (<button key={m} className="chip" onClick={() => setFinanceTab(m)}>{m} ›</button>))}</div>
          )}
          {active === "finance" && financeTab && (
            <><button className="back" onClick={() => setFinanceTab("")}>← Semua Log Keuangan</button><div className="empty"><b>Detail {financeTab}</b><br />Log detail modul ini akan tampil di sini. Saat ini masih data demonstrasi.</div></>
          )}

          {active === "social" && !socialTab && (
            <div className="chiprow">{socialModules.map((m) => (<button key={m} className="chip" onClick={() => setSocialTab(m)}>{m} ›</button>))}</div>
          )}
          {active === "social" && socialTab && (
            <><button className="back" onClick={() => setSocialTab("")}>← Semua Log Social</button><div className="empty"><b>{socialTab}</b><br />{socialTab === "n8n Workflow Monitor" ? "n8n belum terhubung. Workflow akan muncul di sini setelah n8n aktif." : "Log modul ini akan tampil di sini. Saat ini masih data demonstrasi."}</div></>
          )}

          {active === "bot" && (
            <div className="botbar"><div><b>✈ Bot Telegram — {botOn ? "ON" : "OFF"}</b><br /><span>jobsnotif_job1_bot · Toggle ini hanya tampilan demo</span></div><button className={`toggle ${botOn ? "on" : ""}`} onClick={() => setBotOn(!botOn)} aria-label="Toggle bot" /></div>
          )}

          <div className="toolbar">
            {(["ALL", "INFO", "OK", "WARN", "ERROR", "MONEY"] as const).map((f) => (
              <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{f === "ALL" ? "Semua" : f}</button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#64748B", alignSelf: "center" }}>{logs.length} log · Demo</span>
          </div>

          <div className="logbox">
            <div className="loghead"><b>📋 {current.label} — System Log</b><span>DEMO DATA</span></div>
            {logs.map((l, i) => (
              <div className="logrow" key={i}><span className="time">{l.time}</span><span className="badge" style={{ background: levelColor[l.level] }}>{l.level}</span><div className="logmsg"><b>{l.msg}</b><div>{l.detail}</div></div></div>
            ))}
            {logs.length === 0 && <div className="empty"><b>Ga ada log {filter}.</b><br />Coba ganti filter ke Semua.</div>}
          </div>

          <div className="foot">JOBSNOTIF SUPER ADMIN · SYSTEM LOG · SEMUA LOG ADALAH DATA DEMONSTRASI</div>
        </div>
      </div>
    </main>
  );
}

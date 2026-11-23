"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "Auto Find Jobs", href: "/auto-find-jobs" },
  { label: "Candidates", href: "/manager" },
  { label: "Business Profile", href: "/business-profile" },
  { label: "Create Vacancy", href: "/create-job" },
];

export default function GlobalMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="global-menu">
      <div className="global-menu-inner">
        <Link href="/" className="global-menu-brand">
          <span className="global-menu-logo">J</span>
          <span>JobsNotif</span>
        </Link>

        <nav className={`global-menu-links ${open ? "is-open" : ""}`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={
                pathname === link.href
                  ? "global-menu-link active"
                  : "global-menu-link"
              }
            >
              {link.label}
            </Link>
          ))}

          <div className="global-menu-account">
            <Link href="/login" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link
              href="/register"
              className="global-menu-register"
              onClick={() => setOpen(false)}
            >
              Business Register
            </Link>
          </div>
        </nav>

        <button
          type="button"
          className="global-menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}

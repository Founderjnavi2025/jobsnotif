"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const publicLinks = [
  { label: "Home", href: "/" },
  { label: "Auto Find Jobs", href: "/auto-find-jobs" },
  { label: "Candidates", href: "/manager" },
  { label: "Business Profile", href: "/business-profile" },
  { label: "Create Vacancy", href: "/create-job" },
];

export default function GlobalMenu() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setAccountType(data.user?.user_metadata?.account_type ?? null);
      setCheckingAuth(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccountType(
        session?.user?.user_metadata?.account_type ?? null
      );
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isBusiness = accountType === "business";
  const brandHref = isBusiness ? "/business-profile" : "/";

  async function handleLogout() {
    await supabase.auth.signOut();
    setAccountType(null);
    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="global-menu">
      <div className="global-menu-inner">
        <Link href={brandHref} className="global-menu-brand">
          <span className="global-menu-logo">J</span>
          <span>JobsNotif</span>
        </Link>

        <nav className={`global-menu-links ${open ? "is-open" : ""}`}>
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={isBusiness && link.href === "/"
                ? "/business-profile"
                : link.href}
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
            {!checkingAuth && isBusiness ? (
              <>
                <Link
                  href="/business-profile"
                  onClick={() => setOpen(false)}
                >
                  My Workspace
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="global-menu-register"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
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

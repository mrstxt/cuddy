"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/components/useLanguage";
import { getCurrentUser } from "@/lib/auth";

export function SiteHeader() {
  const { t } = useLanguage();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(Boolean(getCurrentUser()));
    function syncAuth() {
      setSignedIn(Boolean(getCurrentUser()));
    }
    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-white/92 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo size="sm" />
        <div className="flex items-center gap-1 text-sm font-medium text-ink/75 sm:gap-2">
          <LanguageSwitcher />
          <Link className="hidden rounded-full px-3 py-2 hover:bg-panel sm:inline-flex" href="/about">
            {t("about")}
          </Link>
          <Link className="rounded-full bg-ink px-3 py-2 font-black text-white hover:bg-black sm:px-4" href={signedIn ? "/profile" : "/login"}>
            <span className="sm:hidden">{signedIn ? "Profil" : t("login")}</span>
            <span className="hidden sm:inline">{signedIn ? "Profil" : t("register")}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

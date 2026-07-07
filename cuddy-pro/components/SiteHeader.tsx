import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-white/92 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo size="sm" />
        <div className="flex items-center gap-1 text-sm font-medium text-ink/75 sm:gap-2">
          <LanguageSwitcher />
          <Link className="hidden rounded-full px-3 py-2 hover:bg-panel sm:inline-flex" href="/about">
            About
          </Link>
          <Link className="rounded-full bg-ink px-3 py-2 font-black text-white hover:bg-black sm:px-4" href="/login">
            <span className="sm:hidden">Kirish</span>
            <span className="hidden sm:inline">Ro'yxatdan o'tish</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

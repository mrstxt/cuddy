"use client";

import { useEffect, useState } from "react";
import { LogOut, UserRound, X } from "lucide-react";
import { AuthDialog } from "@/components/AuthDialog";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/components/useLanguage";
import { getCurrentUser, logoutUser, type UserAccount } from "@/lib/auth";

export function SiteHeader() {
  const { t } = useLanguage();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    function syncAuth() {
      setUser(getCurrentUser());
    }
    function openAuth() {
      setAuthOpen(true);
    }
    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);
    window.addEventListener("cuddy-auth-change", syncAuth);
    window.addEventListener("cuddy-auth-open", openAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
      window.removeEventListener("cuddy-auth-change", syncAuth);
      window.removeEventListener("cuddy-auth-open", openAuth);
    };
  }, []);

  function signOut() {
    logoutUser();
    setUser(null);
    setProfileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line/80 bg-white/92 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Logo size="sm" />
          <div className="flex items-center gap-1 text-sm font-medium text-ink/75 sm:gap-2">
            <LanguageSwitcher />
            <a className="hidden rounded-full px-3 py-2 hover:bg-panel sm:inline-flex" href="/about">
              {t("about")}
            </a>
            {user ? (
              <button
                className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-2 font-black text-white hover:bg-black sm:px-4"
                type="button"
                onClick={() => setProfileOpen(true)}
              >
                <UserRound size={16} />
                <span>Profil</span>
              </button>
            ) : (
              <button className="rounded-full bg-ink px-3 py-2 font-black text-white hover:bg-black sm:px-4" type="button" onClick={() => setAuthOpen(true)}>
                <span className="sm:hidden">{t("login")}</span>
                <span className="hidden sm:inline">{t("register")}</span>
              </button>
            )}
          </div>
        </nav>
      </header>

      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setUser(getCurrentUser());
          setProfileOpen(false);
        }}
      />

      {profileOpen && user ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/86 px-4 py-8 text-ink backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[34px] border border-white/70 bg-white shadow-soft">
            <div className="bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_55%,#eef5ff_100%)] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-4 grid h-16 w-16 place-items-center rounded-[24px] bg-ink text-mint">
                    <UserRound size={28} />
                  </div>
                <span className="text-xs font-black uppercase text-ink/45">Cuddy Pro Profile</span>
                  <h2 className="mt-2 text-3xl font-black text-ink">{user.name}</h2>
                  <p className="mt-2 text-sm font-bold text-ink/60">@{user.username} | {user.email}</p>
                </div>
                <button
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/70 text-ink hover:bg-mint"
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  aria-label="Profil oynasini yopish"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="grid gap-3 p-6 sm:p-8">
              <div className="rounded-[24px] bg-panel p-4">
                <span className="text-xs font-black uppercase text-ink/45">Ro'yxatdan o'tgan sana</span>
                <p className="mt-1 text-sm font-bold text-ink">
                  {new Date(user.createdAt).toLocaleString("uz-UZ")}
                </p>
              </div>
              <div className="rounded-[24px] bg-panel p-4">
                <span className="text-xs font-black uppercase text-ink/45">Ism familiya</span>
                <p className="mt-1 text-sm font-bold text-ink">{user.firstName} {user.lastName}</p>
              </div>
              <button
                className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-mint hover:bg-black"
                type="button"
                onClick={signOut}
              >
                <LogOut size={16} /> Chiqish
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

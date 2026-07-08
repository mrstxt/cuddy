"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { getCurrentUser, logoutUser, type UserAccount } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
  }, [router]);

  function signOut() {
    logoutUser();
    router.push("/login");
  }

  if (!user) {
    return (
      <main className="mx-auto grid min-h-[60vh] place-items-center px-4">
        <p className="rounded-[24px] bg-white p-5 text-sm font-bold text-ink shadow-sm">Profil yuklanmoqda...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full overflow-hidden rounded-[38px] border border-black/10 bg-white/88 shadow-soft backdrop-blur">
        <div className="bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_55%,#eef5ff_100%)] p-6 sm:p-8">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-[24px] bg-ink text-mint">
            <UserRound size={28} />
          </div>
          <span className="text-xs font-black uppercase text-ink/45">Cuddy Pro Profile</span>
          <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">{user.name}</h1>
          <p className="mt-2 text-sm font-bold text-ink/60">{user.email}</p>
        </div>
        <div className="grid gap-3 p-6 sm:p-8">
          <div className="rounded-[24px] bg-panel p-4">
            <span className="text-xs font-black uppercase text-ink/45">Username</span>
            <p className="mt-1 text-sm font-bold text-ink">{user.username}</p>
          </div>
          <div className="rounded-[24px] bg-panel p-4">
            <span className="text-xs font-black uppercase text-ink/45">Ism familiya</span>
            <p className="mt-1 text-sm font-bold text-ink">{user.firstName} {user.lastName}</p>
          </div>
          <div className="rounded-[24px] bg-panel p-4">
            <span className="text-xs font-black uppercase text-ink/45">Ro'yxatdan o'tgan sana</span>
            <p className="mt-1 text-sm font-bold text-ink">{new Date(user.createdAt).toLocaleString("uz-UZ")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-full bg-panel px-5 py-3 text-sm font-black text-ink hover:bg-mint" href="/">
              Bosh sahifa
            </Link>
            <button className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-mint hover:bg-black" type="button" onClick={signOut}>
              <LogOut size={16} /> Chiqish
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

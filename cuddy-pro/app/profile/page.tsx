"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { getCurrentUser, getUsageRows, logoutUser, type DemoUser } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
  }, [router, refreshKey]);

  const rows = useMemo(() => (user ? getUsageRows(user.id) : []), [user]);
  const totalUsed = rows.reduce((sum, row) => sum + row.record.used, 0);
  const totalLimit = rows.reduce((sum, row) => sum + row.record.limit, 0);
  const activeTools = rows.filter((row) => row.record.used > 0).length;

  function logout() {
    logoutUser();
    setRefreshKey((key) => key + 1);
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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[38px] border border-black/10 bg-white/88 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-5 bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_52%,#eef5ff_100%)] p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-[24px] bg-ink text-mint">
              <UserRound size={28} />
            </div>
            <span className="text-xs font-black uppercase text-ink/45">Cuddy Pro Profile</span>
            <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">{user.name}</h1>
            <p className="mt-2 text-sm font-bold text-ink/60">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-full bg-white/80 px-4 py-3 text-sm font-black text-ink shadow-sm hover:bg-mint" href="/#tools">
              Tool'larga qaytish
            </Link>
            <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-black text-mint shadow-sm hover:bg-black" type="button" onClick={logout}>
              <LogOut size={16} /> Chiqish
            </button>
          </div>
        </div>

        <div className="grid gap-4 border-y border-black/10 bg-ink p-4 sm:grid-cols-3">
          <Stat label="Jami ishlatildi" value={totalUsed} />
          <Stat label="Jami limit" value={totalLimit} />
          <Stat label="Faol tool" value={activeTools} />
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-black text-ink">Limit analitikasi</h2>
            <p className="mt-1 text-sm leading-6 text-ink/65">Har bir funksiya bo'yicha ishlatilgan limit va qolgan urinishlar.</p>
          </div>
          <div className="grid gap-3">
            {rows.map(({ tool, record, remaining }) => {
              const percent = record.limit ? Math.min(100, (record.used / record.limit) * 100) : 0;
              return (
                <article key={tool.slug} className="rounded-[26px] border border-black/10 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <strong className="text-ink">{tool.name}</strong>
                      <p className="text-sm text-ink/55">{tool.category}</p>
                    </div>
                    <span className="w-fit rounded-full bg-panel px-3 py-1 text-xs font-black text-ink">
                      {record.used}/{record.limit} ishlatildi
                    </span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-panel">
                    <div className="h-full rounded-full bg-mint" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold text-ink/55">
                    <span>Qolgan: {remaining}</span>
                    <span>Oxirgi foydalanish: {record.updatedAt ? new Date(record.updatedAt).toLocaleString("uz-UZ") : "hali yo'q"}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/8 p-5 text-white">
      <strong className="block text-3xl font-black text-mint">{value}</strong>
      <span className="mt-1 block text-sm text-white/70">{label}</span>
    </div>
  );
}

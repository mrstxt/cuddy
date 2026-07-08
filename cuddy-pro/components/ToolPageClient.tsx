"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import ToolRenderer from "@/components/ToolRenderer";
import { applyAdminToolOverride, getAdminState, isToolEnabled, syncAdminStateFromBackend } from "@/lib/admin-state";
import { getTool } from "@/lib/tools";

export function ToolPageClient({ slug }: { slug: string }) {
  const [adminVersion, setAdminVersion] = useState(0);
  const tool = getTool(slug);

  useEffect(() => {
    function sync() {
      setAdminVersion((version) => version + 1);
    }
    void syncAdminStateFromBackend();
    window.addEventListener("cuddy-admin-state-change", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("cuddy-admin-state-change", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  void adminVersion;

  if (!tool) return null;

  const adminState = getAdminState();
  const displayTool = applyAdminToolOverride(tool, adminState);
  const enabled = isToolEnabled(tool.slug, adminState);
  const Icon = tool.icon;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="min-w-0">
        <div className={`mb-5 overflow-hidden rounded-[38px] border border-white/80 shadow-soft ${tool.accent.card}`}>
          <div className="flex flex-col gap-5 bg-white/20 p-5 backdrop-blur sm:p-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className={`grid h-14 w-14 place-items-center rounded-[22px] shadow-sm ${tool.accent.icon}`}>
                  <Icon size={24} />
                </span>
                <span className={`rounded-full px-4 py-2 text-xs font-black uppercase shadow-sm ${tool.accent.pill}`}>
                  {displayTool.action}
                </span>
                {!enabled ? <span className="rounded-full bg-[#fff1ed] px-4 py-2 text-xs font-black uppercase text-tomato">Vaqtincha yopiq</span> : null}
              </div>
              <h1 className="text-3xl font-black leading-tight text-ink sm:text-4xl">{displayTool.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70">{displayTool.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-black text-mint shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-soft"
                href="/"
              >
                <ArrowLeft size={16} /> Bosh sahifa
              </Link>
              <Link
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white/78 px-4 py-3 text-sm font-black text-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-mint hover:shadow-soft"
                href="/#tools"
              >
                <LayoutGrid size={16} /> Barcha tool'lar
              </Link>
            </div>
          </div>
          <div className="grid gap-3 border-t border-white/60 bg-white/45 p-4 text-sm text-ink/70 sm:grid-cols-3">
            <span className="rounded-full bg-white/65 px-4 py-2 font-bold">3 marta bepul sinov</span>
            <span className="rounded-full bg-white/65 px-4 py-2 font-bold">Responsive panel</span>
            <span className="rounded-full bg-white/65 px-4 py-2 font-bold">Tezkor natija</span>
          </div>
        </div>
        {enabled ? (
          <ToolRenderer slug={tool.slug} />
        ) : (
          <div className="rounded-[34px] border border-black/10 bg-white/85 p-6 text-center shadow-soft">
            <h2 className="text-2xl font-black text-ink">Tool vaqtincha yopilgan</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">Admin panelda yangilanish ishlari ketayotgani uchun bu funksiya hozircha ishlamaydi.</p>
          </div>
        )}
      </section>
    </main>
  );
}

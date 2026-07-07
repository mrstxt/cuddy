"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { TrustCards } from "@/components/TrustCards";
import { useLanguage } from "@/components/useLanguage";
import { categoryText, localizeTool } from "@/lib/i18n";
import { getCurrentUser, getToolUsage, type DemoUser } from "@/lib/auth";
import { getToolsByCategory, orderedCategories, tools } from "@/lib/tools";

export default function Home() {
  const { language, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    function syncProfile() {
      setCurrentUser(getCurrentUser());
    }
    syncProfile();
    window.addEventListener("cuddy-auth-change", syncProfile);
    window.addEventListener("focus", syncProfile);
    return () => {
      window.removeEventListener("cuddy-auth-change", syncProfile);
      window.removeEventListener("focus", syncProfile);
    };
  }, []);

  const usageByTool = currentUser
    ? Object.fromEntries(tools.map((tool) => [tool.slug, getToolUsage(currentUser.id, tool.slug)]))
    : {};

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-ink/10 bg-mint px-4 py-2 text-xs font-black uppercase text-ink shadow-glow">
              <Sparkles size={15} /> {t("heroBadge")}
            </span>
            <h1 className="max-w-3xl text-3xl font-black leading-tight text-ink sm:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/72">
              {t("heroBody")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="#tools"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black uppercase text-white shadow-soft hover:bg-black"
              >
                {t("viewTools")} <ArrowRight size={17} />
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-black uppercase text-ink shadow-sm hover:bg-mint"
              >
                {t("login")}
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-black/10 bg-white/75 p-3 shadow-soft backdrop-blur">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3">
              {tools.slice(0, 5).map((tool, index) => {
                const displayTool = localizeTool(tool, language);
                const usage = usageByTool[tool.slug];
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className={`group rounded-[26px] border border-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft ${
                      index === 0 ? `${tool.accent.card} sm:col-span-2` : tool.accent.card
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[18px] ${tool.accent.icon}`}>
                        <Icon size={21} />
                      </span>
                      <ArrowRight size={18} className="text-ink/40 transition group-hover:translate-x-1 group-hover:text-ink" />
                    </div>
                    <strong className="mt-4 block text-xl font-black text-ink">{displayTool.name}</strong>
                    <span className="mt-2 block text-sm leading-6 text-ink/68">{displayTool.outcome}</span>
                    <span className={`mt-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm font-black ${tool.accent.pill}`}>
                      {displayTool.action}
                    </span>
                    {usage ? <LimitBadge used={usage.used} limit={usage.limit} /> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10">
        <TrustCards />
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="min-w-0 rounded-[32px] border border-black/10 bg-white/80 p-3 shadow-soft backdrop-blur sm:p-5">
            <div className="mb-5 flex flex-col gap-2 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-black uppercase text-ink/45">{t("allFunctions")}</span>
                <h2 className="mt-1 text-2xl font-black text-ink sm:text-3xl">{t("toolboxPanel")}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
                  {t("toolboxBody")}
                </p>
              </div>
              <span className="w-fit rounded-full bg-mint px-3 py-2 text-xs font-black uppercase text-ink shadow-glow">
                {tools.length} functions
              </span>
            </div>

            {orderedCategories
              .filter((category) => getToolsByCategory(category).length > 0)
              .map((category) => (
                <div key={category} id={category.toLowerCase()} className="scroll-mt-24 py-6 first:pt-0">
                  <div className="mb-4">
                    <span className="text-xs font-black uppercase text-ink/45">{categoryText[language][category].shortLabel}</span>
                    <h3 className="mt-1 text-xl font-black text-ink sm:text-2xl">{categoryText[language][category].label}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink/65">{categoryText[language][category].description}</p>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
                    {getToolsByCategory(category).map((tool) => {
                      const displayTool = localizeTool(tool, language);
                      const usage = usageByTool[tool.slug];
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          className={`group flex min-h-60 flex-col rounded-[28px] border border-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft ${tool.accent.card}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[18px] ${tool.accent.icon}`}>
                              <Icon size={22} />
                            </span>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${tool.accent.pill}`}>
                              {displayTool.action}
                            </span>
                          </div>
                          <strong className="mt-5 block text-lg text-ink">{displayTool.name}</strong>
                          <span className="mt-2 block text-sm leading-6 text-ink/68">{displayTool.description}</span>
                          <span className={`mt-4 flex items-start gap-2 rounded-[18px] p-3 text-sm leading-5 ${tool.accent.outcome}`}>
                            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-ink" />
                            {displayTool.outcome}
                          </span>
                          <span className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-xs font-black uppercase text-ink">
                            {displayTool.action} <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                          </span>
                          {usage ? <LimitBadge used={usage.used} limit={usage.limit} /> : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
        </div>
      </section>
    </main>
  );
}

function LimitBadge({ used, limit }: { used: number; limit: number }) {
  const percent = limit ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <div className="mt-4 rounded-[18px] bg-white/70 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-black uppercase text-ink/60">
        <span>Limit</span>
        <span>
          {used}/{limit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

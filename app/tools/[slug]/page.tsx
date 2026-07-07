import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import ToolRenderer from "@/components/ToolRenderer";
import { getTool, tools } from "@/lib/tools";

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    return {};
  }

  return {
    title: `${tool.name} | Cuddy Pro`,
    description: tool.description
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    notFound();
  }

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
                  {tool.action}
                </span>
              </div>
              <h1 className="text-3xl font-black leading-tight text-ink sm:text-4xl">{tool.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70">{tool.description}</p>
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
        <ToolRenderer slug={tool.slug} />
      </section>
    </main>
  );
}

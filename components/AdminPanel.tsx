"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, KeyRound, RotateCcw, Save, Settings2 } from "lucide-react";
import { tools } from "@/lib/tools";

type AdminTab = "tools" | "site" | "privacy";

type EditableTool = {
  slug: string;
  name: string;
  description: string;
  outcome: string;
  action: string;
  category: string;
  enabled: boolean;
};

type SiteContent = {
  heroTitle: string;
  heroBody: string;
  primaryButton: string;
  secondaryButton: string;
  freeLimit: string;
};

type PrivacyContent = {
  localTitle: string;
  localBody: string;
  serverTitle: string;
  serverBody: string;
  limitTitle: string;
  limitBody: string;
};

type AdminState = {
  tools: EditableTool[];
  site: SiteContent;
  privacy: PrivacyContent;
};

const ADMIN_STORAGE_KEY = "cuddy-admin-state";
const ADMIN_AUTH_KEY = "cuddy-admin-auth";
const ADMIN_CODE = "cuddy-pro";

const defaultState: AdminState = {
  tools: tools.map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    outcome: tool.outcome,
    action: tool.action,
    category: tool.category,
    enabled: true
  })),
  site: {
    heroTitle: "Dizayner va dasturchilar uchun tartibli ishchi panel.",
    heroBody:
      "Kod, data, rasm va aqlli qayta ishlash vazifalari yo'nalishlar bo'yicha ajratilgan. Tez ishlatiladigan tool'lar lokal ishlaydi, og'ir vazifalar xavfsiz server orqali bajariladi.",
    primaryButton: "Tool'larni ko'rish",
    secondaryButton: "Kirish",
    freeLimit: "Har bir funksiya 3 martagacha bepul"
  },
  privacy: {
    localTitle: "Lokal ishlaydigan vositalar",
    localBody:
      "QR, JSON, Base64, hash, kod skrinshoti va rasm siqish kabi tezkor funksiyalar brauzer ichida bajariladi.",
    serverTitle: "Serverda bajariladigan vazifalar",
    serverBody:
      "Og'ir rasm qayta ishlash va kod tekshirish kabi vazifalar xavfsiz server qatlami orqali bajarilishi mumkin. Maxfiy kalitlar frontendga chiqarilmaydi.",
    limitTitle: "Bepul limit",
    limitBody:
      "Har bir funksiya 3 martagacha bepul ishlatiladi. Davom ettirish uchun Google orqali yoki email bilan ro'yxatdan o'tish mumkin."
  }
};

export function AdminPanel() {
  const [authorized, setAuthorized] = useState(false);
  const [code, setCode] = useState("");
  const [tab, setTab] = useState<AdminTab>("tools");
  const [state, setState] = useState<AdminState>(defaultState);
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    setAuthorized(localStorage.getItem(ADMIN_AUTH_KEY) === "true");

    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!saved) return;

    try {
      setState(JSON.parse(saved) as AdminState);
    } catch {
      setState(defaultState);
    }
  }, []);

  const stats = useMemo(
    () => [
      { label: "Tool", value: state.tools.length },
      { label: "Faol", value: state.tools.filter((tool) => tool.enabled).length },
      { label: "Kategoriya", value: new Set(state.tools.map((tool) => tool.category)).size }
    ],
    [state.tools]
  );

  function login() {
    if (code.trim() !== ADMIN_CODE) return;
    localStorage.setItem(ADMIN_AUTH_KEY, "true");
    setAuthorized(true);
    setCode("");
  }

  function save() {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state));
    setSavedAt(new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }));
  }

  function reset() {
    setState(defaultState);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setSavedAt("reset");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cuddy-admin-content.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function updateTool(index: number, patch: Partial<EditableTool>) {
    setState((current) => ({
      ...current,
      tools: current.tools.map((tool, toolIndex) => (toolIndex === index ? { ...tool, ...patch } : tool))
    }));
  }

  if (!authorized) {
    return (
      <main className="mx-auto grid min-h-[70vh] max-w-4xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full overflow-hidden rounded-[38px] border border-black/10 bg-white/88 shadow-soft backdrop-blur">
          <div className="bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_55%,#eef5ff_100%)] p-6 text-center sm:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] bg-ink text-mint">
              <KeyRound size={28} />
            </div>
            <span className="mt-6 block text-xs font-black uppercase text-ink/45">Admin panel</span>
            <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">Boshqaruvga kirish</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink/65">
              Tool'lar, sayt matnlari va maxfiylik bloklarini boshqarish uchun admin kodni kiriting.
            </p>
          </div>
          <div className="mx-auto grid max-w-md gap-3 p-6 sm:p-8">
            <input
              className="w-full rounded-[22px] border border-black/10 bg-white px-4 py-3 text-center font-black text-ink shadow-inner outline-none focus:border-mint"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") login();
              }}
              placeholder="Admin kod"
              type="password"
            />
            <button className="rounded-full bg-ink px-5 py-3 text-sm font-black uppercase text-mint shadow-sm hover:bg-black" type="button" onClick={login}>
              Kirish
            </button>
            <p className="text-center text-xs font-bold text-ink/45">Demo kod: cuddy-pro</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[38px] border border-black/10 bg-white/88 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-5 bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_52%,#eef5ff_100%)] p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-black uppercase text-ink/45">Cuddy Pro Admin</span>
            <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">Sayt boshqaruvi</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">
              Tool nomlari, tavsiflar, asosiy matnlar va maxfiylik shartlarini bir joydan tahrirlang.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-black text-mint shadow-sm hover:bg-black" type="button" onClick={save}>
              <Save size={16} /> Saqlash
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-3 text-sm font-black text-ink shadow-sm hover:bg-mint" type="button" onClick={exportJson}>
              <Download size={16} /> Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-3 text-sm font-black text-ink shadow-sm hover:bg-[#fff1ed]" type="button" onClick={reset}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        <div className="grid gap-4 border-y border-black/10 bg-ink p-4 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[26px] border border-white/10 bg-white/8 p-5 text-white">
              <strong className="block text-3xl font-black text-mint">{item.value}</strong>
              <span className="mt-1 block text-sm text-white/70">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[28px] bg-panel p-2">
            {[
              { id: "tools" as const, label: "Tool'lar" },
              { id: "site" as const, label: "Sayt matnlari" },
              { id: "privacy" as const, label: "Maxfiylik" }
            ].map((item) => (
              <button
                key={item.id}
                className={`flex w-full items-center gap-2 rounded-[22px] px-4 py-3 text-left text-sm font-black transition ${
                  tab === item.id ? "bg-ink text-mint shadow-sm" : "text-ink/65 hover:bg-white hover:text-ink"
                }`}
                type="button"
                onClick={() => setTab(item.id)}
              >
                <Settings2 size={16} /> {item.label}
              </button>
            ))}
            {savedAt ? <p className="px-4 py-3 text-xs font-bold text-ink/45">Oxirgi holat: {savedAt}</p> : null}
          </aside>

          <section className="min-w-0">
            {tab === "tools" ? <ToolsEditor tools={state.tools} updateTool={updateTool} /> : null}
            {tab === "site" ? (
              <SiteEditor site={state.site} setSite={(site) => setState((current) => ({ ...current, site }))} />
            ) : null}
            {tab === "privacy" ? (
              <PrivacyEditor privacy={state.privacy} setPrivacy={(privacy) => setState((current) => ({ ...current, privacy }))} />
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}

function ToolsEditor({
  tools: editableTools,
  updateTool
}: {
  tools: EditableTool[];
  updateTool: (index: number, patch: Partial<EditableTool>) => void;
}) {
  return (
    <div className="grid gap-4">
      {editableTools.map((tool, index) => (
        <article key={tool.slug} className="rounded-[30px] border border-black/10 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-black uppercase text-ink/40">{tool.slug}</span>
              <h2 className="text-xl font-black text-ink">{tool.name}</h2>
            </div>
            <label className="flex w-fit items-center gap-2 rounded-full bg-panel px-4 py-2 text-sm font-black text-ink">
              <input checked={tool.enabled} type="checkbox" onChange={(event) => updateTool(index, { enabled: event.target.checked })} />
              Faol
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <AdminInput label="Nomi" value={tool.name} onChange={(value) => updateTool(index, { name: value })} />
            <AdminInput label="Action" value={tool.action} onChange={(value) => updateTool(index, { action: value })} />
            <AdminTextarea label="Tavsif" value={tool.description} onChange={(value) => updateTool(index, { description: value })} />
            <AdminTextarea label="Natija matni" value={tool.outcome} onChange={(value) => updateTool(index, { outcome: value })} />
          </div>
        </article>
      ))}
    </div>
  );
}

function SiteEditor({ site, setSite }: { site: SiteContent; setSite: (site: SiteContent) => void }) {
  return (
    <div className="rounded-[30px] border border-black/10 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <AdminTextarea label="Hero sarlavha" value={site.heroTitle} onChange={(heroTitle) => setSite({ ...site, heroTitle })} />
        <AdminTextarea label="Hero tavsif" value={site.heroBody} onChange={(heroBody) => setSite({ ...site, heroBody })} />
        <AdminInput label="Primary button" value={site.primaryButton} onChange={(primaryButton) => setSite({ ...site, primaryButton })} />
        <AdminInput label="Secondary button" value={site.secondaryButton} onChange={(secondaryButton) => setSite({ ...site, secondaryButton })} />
        <AdminInput label="Free limit matni" value={site.freeLimit} onChange={(freeLimit) => setSite({ ...site, freeLimit })} />
      </div>
    </div>
  );
}

function PrivacyEditor({ privacy, setPrivacy }: { privacy: PrivacyContent; setPrivacy: (privacy: PrivacyContent) => void }) {
  return (
    <div className="rounded-[30px] border border-black/10 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <AdminInput label="1-bo'lim sarlavha" value={privacy.localTitle} onChange={(localTitle) => setPrivacy({ ...privacy, localTitle })} />
        <AdminTextarea label="1-bo'lim matn" value={privacy.localBody} onChange={(localBody) => setPrivacy({ ...privacy, localBody })} />
        <AdminInput label="2-bo'lim sarlavha" value={privacy.serverTitle} onChange={(serverTitle) => setPrivacy({ ...privacy, serverTitle })} />
        <AdminTextarea label="2-bo'lim matn" value={privacy.serverBody} onChange={(serverBody) => setPrivacy({ ...privacy, serverBody })} />
        <AdminInput label="3-bo'lim sarlavha" value={privacy.limitTitle} onChange={(limitTitle) => setPrivacy({ ...privacy, limitTitle })} />
        <AdminTextarea label="3-bo'lim matn" value={privacy.limitBody} onChange={(limitBody) => setPrivacy({ ...privacy, limitBody })} />
      </div>
    </div>
  );
}

function AdminInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-ink">{label}</span>
      <input
        className="w-full rounded-[20px] border border-black/10 bg-panel px-4 py-3 text-sm text-ink shadow-inner outline-none focus:border-mint focus:bg-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function AdminTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-ink">{label}</span>
      <textarea
        className="min-h-28 w-full rounded-[20px] border border-black/10 bg-panel px-4 py-3 text-sm leading-6 text-ink shadow-inner outline-none focus:border-mint focus:bg-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

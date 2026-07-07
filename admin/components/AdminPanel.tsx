"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, KeyRound, MessageCircle, RotateCcw, Save, Settings2, SlidersHorizontal } from "lucide-react";

type AdminTab = "analytics" | "limits" | "tools" | "site" | "privacy" | "support";

type EditableTool = {
  slug: string;
  name: string;
  description: string;
  outcome: string;
  action: string;
  category: string;
  enabled: boolean;
};

type ToolLimit = {
  slug: string;
  period: "daily" | "weekly";
  limit: number;
  registeredLimit: number;
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
  limits: ToolLimit[];
  site: SiteContent;
  privacy: PrivacyContent;
};

type SupportMessage = {
  id: string;
  from: "user" | "admin";
  text: string;
  createdAt: string;
};

const ADMIN_STORAGE_KEY = "cuddy-admin-state";
const ADMIN_AUTH_KEY = "cuddy-admin-auth";
const ADMIN_CODE = "cuddy-pro";
const SUPPORT_MESSAGES_KEY = "cuddy-support-messages";
const SUPPORT_UNREAD_KEY = "cuddy-support-unread";

const starterSupportMessages: SupportMessage[] = [
  {
    id: "welcome",
    from: "admin",
    text: "Salom! Cuddy Pro support. Savolingizni yozing, admin javobini shu chatda ko'rasiz.",
    createdAt: new Date().toISOString()
  }
];

const defaultTools: EditableTool[] = [
  {
    slug: "code-screenshot",
    name: "Code Screenshot Generator",
    description: "Kod bloklarini chiroyli fon, tema va eksport bilan rasmga aylantiring.",
    outcome: "Koddan tayyor PNG skrinshot olasiz.",
    action: "Kod joylash",
    category: "Developer",
    enabled: true
  },
  {
    slug: "qr-generator",
    name: "QR-kod Generator",
    description: "Link yoki matndan tezkor QR-kod yarating va PNG qilib yuklab oling.",
    outcome: "Link yoki matn bir zumda QR-kodga aylanadi.",
    action: "QR yaratish",
    category: "Developer",
    enabled: true
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    description: "JSON xatolarini toping, formatlang va minify qiling.",
    outcome: "JSON xatosi, validligi va chiroyli formati ko'rinadi.",
    action: "JSON tekshirish",
    category: "Developer",
    enabled: true
  },
  {
    slug: "base64-tool",
    name: "Base64 / URL Encoder",
    description: "Base64 va URL encode/decode ishlarini brauzerning o'zida bajaring.",
    outcome: "Matnni encode yoki decode qilib darhol natija olasiz.",
    action: "Encode/Decode",
    category: "Developer",
    enabled: true
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "MD5, SHA-1 va SHA-256 hash qiymatlarini yarating.",
    outcome: "Matndan MD5, SHA-1 va SHA-256 hashlar chiqadi.",
    action: "Hash olish",
    category: "Developer",
    enabled: true
  },
  {
    slug: "code-translator",
    name: "Code Translator",
    description: "Kod bo'lagini boshqa tilga o'tkazing, xatolarini tekshiring va qisqa tushuntirish oling.",
    outcome: "150 qatorgacha kod tarjima qilinadi yoki xatosi tekshiriladi.",
    action: "Kod tarjima qilish",
    category: "Developer",
    enabled: true
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Rasmlarni siqing va JPG, PNG yoki WebP formatiga eksport qiling.",
    outcome: "Rasm hajmi kamayadi va kerakli formatga o'tadi.",
    action: "Rasm siqish",
    category: "Image",
    enabled: true
  },
  {
    slug: "bg-remover",
    name: "Background Remover",
    description: "Rasm fonini tez va sifatli olib tashlang.",
    outcome: "Rasm foni olib tashlanadi, transparent natija olinadi.",
    action: "Fonni olib tashlash",
    category: "Image",
    enabled: true
  },
  {
    slug: "photo-enhancer",
    name: "Photo Enhancer",
    description: "Rasm sifatini oshiring, tiniqlashtiring va kattalashtiring.",
    outcome: "Past sifatli rasm upscale/enhance qilinadi.",
    action: "Sifat oshirish",
    category: "Image",
    enabled: true
  },
  {
    slug: "text-to-pdf",
    name: "Text / Word to PDF",
    description: "Oddiy matn yoki Word'dan ko'chirilgan kontentni PDF ko'rinishida tayyorlang.",
    outcome: "Matn PDF qilib saqlashga tayyorlanadi.",
    action: "PDF qilish",
    category: "Office",
    enabled: true
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    description: "Rasmni to'liq sahifaga moslab PDF qilib chiqarish uchun tayyorlang.",
    outcome: "Rasm PDF sahifasiga moslab joylanadi.",
    action: "Rasmni PDF",
    category: "Office",
    enabled: true
  },
  {
    slug: "csv-excel-tool",
    name: "CSV / Excel Helper",
    description: "Excel'dan ko'chirilgan jadvalni tozalang, preview qiling va CSV qilib yuklab oling.",
    outcome: "Jadval CSV fayl sifatida eksport qilinadi.",
    action: "Jadval ishlash",
    category: "Office",
    enabled: true
  },
  {
    slug: "pdf-merge",
    name: "PDF Merge",
    description: "Bir nechta PDF faylni kerakli tartibda bitta PDF qilib birlashtiring.",
    outcome: "PDFlar ketma-ket tartiblanadi va bitta yakuniy PDF faylga aylanadi.",
    action: "PDF birlashtirish",
    category: "Office",
    enabled: true
  },
  {
    slug: "pdf-compressor",
    name: "PDF Compressor",
    description: "PDF faylni qayta optimallashtirib, hajmini kamaytirishga urinib ko'ring.",
    outcome: "PDF qayta saqlanadi, object stream optimizatsiyasi orqali hajm qisqarishi mumkin.",
    action: "PDF siqish",
    category: "Office",
    enabled: true
  }
];

const defaultState: AdminState = {
  tools: defaultTools,
  limits: defaultTools.map((tool) => ({
    slug: tool.slug,
    period: "daily",
    limit: 3,
    registeredLimit: 25
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
  const [tab, setTab] = useState<AdminTab>("analytics");
  const [state, setState] = useState<AdminState>(defaultState);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(starterSupportMessages);
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

  useEffect(() => {
    function syncSupport() {
      try {
        const saved = JSON.parse(localStorage.getItem(SUPPORT_MESSAGES_KEY) ?? "null") as SupportMessage[] | null;
        setSupportMessages(saved?.length ? saved : starterSupportMessages);
      } catch {
        setSupportMessages(starterSupportMessages);
      }
    }

    syncSupport();
    window.addEventListener("storage", syncSupport);
    window.addEventListener("cuddy-support-change", syncSupport);

    return () => {
      window.removeEventListener("storage", syncSupport);
      window.removeEventListener("cuddy-support-change", syncSupport);
    };
  }, []);

  const stats = useMemo(
    () => [
      { label: "Tool", value: state.tools.length },
      { label: "Faol", value: state.tools.filter((tool) => tool.enabled).length },
      { label: "Support", value: supportMessages.filter((message) => message.from === "user").length }
    ],
    [state.tools, supportMessages]
  );

  function login() {
    if (code.trim() !== ADMIN_CODE) return;
    localStorage.setItem(ADMIN_AUTH_KEY, "true");
    setAuthorized(true);
    setCode("");
  }

  function save() {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("cuddy-admin-state-change"));
    setSavedAt(new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }));
  }

  function reset() {
    setState(defaultState);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("cuddy-admin-state-change"));
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

  function updateLimit(index: number, patch: Partial<ToolLimit>) {
    setState((current) => ({
      ...current,
      limits: current.limits.map((limit, limitIndex) => (limitIndex === index ? { ...limit, ...patch } : limit))
    }));
  }

  function saveSupportMessages(nextMessages: SupportMessage[]) {
    setSupportMessages(nextMessages);
    localStorage.setItem(SUPPORT_MESSAGES_KEY, JSON.stringify(nextMessages));
    window.dispatchEvent(new CustomEvent("cuddy-support-change"));
  }

  function sendSupportReply(text: string) {
    const reply: SupportMessage = {
      id: `admin-${Date.now()}`,
      from: "admin",
      text,
      createdAt: new Date().toISOString()
    };
    saveSupportMessages([...supportMessages, reply]);
    const unread = Number(localStorage.getItem(SUPPORT_UNREAD_KEY) ?? "0") + 1;
    localStorage.setItem(SUPPORT_UNREAD_KEY, String(unread));
    window.dispatchEvent(new CustomEvent("cuddy-support-change"));
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
              { id: "analytics" as const, label: "Analitika", icon: BarChart3 },
              { id: "limits" as const, label: "Limitlar", icon: SlidersHorizontal },
              { id: "tools" as const, label: "Tool'lar" },
              { id: "site" as const, label: "Sayt matnlari" },
              { id: "privacy" as const, label: "Maxfiylik" },
              { id: "support" as const, label: "Support", icon: MessageCircle }
            ].map((item) => (
              <button
                key={item.id}
                className={`flex w-full items-center gap-2 rounded-[22px] px-4 py-3 text-left text-sm font-black transition ${
                  tab === item.id ? "bg-ink text-mint shadow-sm" : "text-ink/65 hover:bg-white hover:text-ink"
                }`}
                type="button"
                onClick={() => setTab(item.id)}
              >
                {item.icon ? <item.icon size={16} /> : <Settings2 size={16} />} {item.label}
              </button>
            ))}
            {savedAt ? <p className="px-4 py-3 text-xs font-bold text-ink/45">Oxirgi holat: {savedAt}</p> : null}
          </aside>

          <section className="min-w-0">
            {tab === "analytics" ? <AnalyticsPanel tools={state.tools} limits={state.limits} /> : null}
            {tab === "limits" ? <LimitEditor tools={state.tools} limits={state.limits} updateLimit={updateLimit} /> : null}
            {tab === "tools" ? <ToolsEditor tools={state.tools} updateTool={updateTool} /> : null}
            {tab === "site" ? (
              <SiteEditor site={state.site} setSite={(site) => setState((current) => ({ ...current, site }))} />
            ) : null}
            {tab === "privacy" ? (
              <PrivacyEditor privacy={state.privacy} setPrivacy={(privacy) => setState((current) => ({ ...current, privacy }))} />
            ) : null}
            {tab === "support" ? <SupportInbox messages={supportMessages} sendReply={sendSupportReply} clearMessages={() => saveSupportMessages(starterSupportMessages)} /> : null}
          </section>
        </div>
      </section>
    </main>
  );
}

function getAnalyticsRows(tools: EditableTool[]) {
  return tools.map((tool, index) => ({
    slug: tool.slug,
    name: tool.name,
    enabled: tool.enabled,
    registeredUsers: 18 + index * 3,
    demoUsers: 42 + index * 5,
    usage: 120 + index * 37,
    blocked: index % 3 === 0 ? 8 + index : 2 + index,
    trend: index % 2 === 0 ? "yuqori" : "barqaror"
  }));
}

function AnalyticsPanel({ tools, limits }: { tools: EditableTool[]; limits: ToolLimit[] }) {
  const rows = getAnalyticsRows(tools);
  const registeredTotal = rows.reduce((sum, row) => sum + row.registeredUsers, 0);
  const demoTotal = rows.reduce((sum, row) => sum + row.demoUsers, 0);
  const blockedTotal = rows.reduce((sum, row) => sum + row.blocked, 0);
  const topTool = [...rows].sort((a, b) => b.usage - a.usage)[0];

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <AnalyticsStat label="Ro'yxatdan o'tganlar" value={registeredTotal} />
        <AnalyticsStat label="Demo mehmonlar" value={demoTotal} />
        <AnalyticsStat label="Limit to'siqlari" value={blockedTotal} />
        <AnalyticsStat label="Eng talabgir" value={topTool?.name ?? "-"} />
      </div>
      <div className="rounded-[30px] border border-black/10 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-black text-ink">Tool talab va limit analitikasi</h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">
          Demo panel: production’da bu qiymatlar backend eventlari va database orqali real vaqtda to'planadi.
        </p>
        <div className="mt-4 grid gap-3">
          {rows.map((row) => {
            const limit = limits.find((item) => item.slug === row.slug);
            const demandPercent = Math.min(100, row.usage / 4);
            return (
              <article key={row.slug} className="rounded-[24px] bg-panel p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <strong className="text-ink">{row.name}</strong>
                    <p className="text-sm text-ink/55">
                      Registered: {row.registeredUsers} | Demo: {row.demoUsers} | Blocked: {row.blocked}
                    </p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${row.enabled ? "bg-mint text-ink" : "bg-[#fff1ed] text-tomato"}`}>
                    {row.enabled ? "Faol" : "Yopiq"}
                  </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${demandPercent}%` }} />
                </div>
                <p className="mt-2 text-xs font-bold text-ink/55">
                  Limit: {limit?.limit ?? 3}/{limit?.period ?? "daily"} guest, {limit?.registeredLimit ?? 25} registered.
                  {row.blocked > 8 ? " Limitni oshirish tavsiya qilinadi." : " Limit normal."}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AnalyticsStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[26px] bg-ink p-5 text-white">
      <strong className="block text-2xl font-black text-mint">{value}</strong>
      <span className="mt-1 block text-sm text-white/70">{label}</span>
    </div>
  );
}

function LimitEditor({
  tools,
  limits,
  updateLimit
}: {
  tools: EditableTool[];
  limits: ToolLimit[];
  updateLimit: (index: number, patch: Partial<ToolLimit>) => void;
}) {
  return (
    <div className="grid gap-4">
      {limits.map((limit, index) => {
        const tool = tools.find((item) => item.slug === limit.slug);
        return (
          <article key={limit.slug} className="rounded-[30px] border border-black/10 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <span className="text-xs font-black uppercase text-ink/40">{limit.slug}</span>
              <h2 className="text-xl font-black text-ink">{tool?.name ?? limit.slug}</h2>
              <p className="mt-1 text-sm text-ink/60">Kunlik yoki haftalik limitlarni boshqarish.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-ink">Davr</span>
                <select
                  className="w-full rounded-[20px] border border-black/10 bg-panel px-4 py-3 text-sm text-ink shadow-inner outline-none focus:border-mint focus:bg-white"
                  value={limit.period}
                  onChange={(event) => updateLimit(index, { period: event.target.value as "daily" | "weekly" })}
                >
                  <option value="daily">Kunlik</option>
                  <option value="weekly">Haftalik</option>
                </select>
              </label>
              <AdminInput label="Guest limit" value={String(limit.limit)} onChange={(value) => updateLimit(index, { limit: Number(value) || 0 })} />
              <AdminInput label="Registered limit" value={String(limit.registeredLimit)} onChange={(value) => updateLimit(index, { registeredLimit: Number(value) || 0 })} />
            </div>
          </article>
        );
      })}
    </div>
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
              {tool.enabled ? "Faol" : "Vaqtincha yopiq"}
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

function SupportInbox({
  messages,
  sendReply,
  clearMessages
}: {
  messages: SupportMessage[];
  sendReply: (text: string) => void;
  clearMessages: () => void;
}) {
  const [reply, setReply] = useState("");
  const userMessages = messages.filter((message) => message.from === "user");
  const lastUserMessage = userMessages[userMessages.length - 1];

  function submitReply() {
    if (!reply.trim()) return;
    sendReply(reply.trim());
    setReply("");
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsStat label="User xabarlari" value={userMessages.length} />
        <AnalyticsStat label="Admin javoblari" value={messages.filter((message) => message.from === "admin").length} />
        <AnalyticsStat label="Oxirgi murojaat" value={lastUserMessage ? new Date(lastUserMessage.createdAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }) : "-"} />
      </div>

      <div className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-sm">
        <div className="flex flex-col gap-3 bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_55%,#eef5ff_100%)] p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-black uppercase text-ink/45">Support inbox</span>
            <h2 className="mt-1 text-2xl font-black text-ink">Admin bilan chat xabarlari</h2>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              User support iconkasidan yozgan xabarlar shu yerda ko'rinadi. Javob yozsangiz user tomonda bildirishnoma badge chiqadi.
            </p>
          </div>
          <button className="w-fit rounded-full bg-white/80 px-4 py-3 text-sm font-black text-ink shadow-sm hover:bg-[#fff1ed]" type="button" onClick={clearMessages}>
            Chatni tozalash
          </button>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="max-h-[520px] space-y-3 overflow-auto rounded-[26px] bg-panel p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.from === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[84%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${message.from === "admin" ? "bg-ink text-white" : "bg-white text-ink"}`}>
                  <span className={`mb-1 block text-[10px] font-black uppercase ${message.from === "admin" ? "text-mint" : "text-ink/40"}`}>
                    {message.from === "admin" ? "Admin" : "User"}
                  </span>
                  <p>{message.text}</p>
                  <span className={`mt-2 block text-[10px] font-bold ${message.from === "admin" ? "text-white/50" : "text-ink/40"}`}>
                    {new Date(message.createdAt).toLocaleString("uz-UZ", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-[26px] border border-black/10 bg-panel p-4">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-ink">Admin javobi</span>
              <textarea
                className="min-h-40 w-full rounded-[22px] border border-black/10 bg-white px-4 py-3 text-sm leading-6 text-ink shadow-inner outline-none focus:border-mint"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Javob matnini yozing..."
              />
            </label>
            <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-black text-mint shadow-sm hover:bg-black" type="button" onClick={submitReply}>
              <MessageCircle size={16} /> Javob yuborish
            </button>
            <p className="mt-3 text-xs font-bold leading-5 text-ink/45">
              Demo rejimda xabarlar browser localStorage'da saqlanadi. Production uchun backend support jadvali ulanadi.
            </p>
          </div>
        </div>
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

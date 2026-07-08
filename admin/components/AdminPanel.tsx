"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Bell, Check, CheckCheck, Download, KeyRound, Lock, MessageCircle, RotateCcw, Save, Settings2, SlidersHorizontal, UserRound } from "lucide-react";

type AdminTab = "analytics" | "limits" | "tools" | "site" | "privacy" | "chats" | "profiles" | "admins";

type EditableTool = {
  slug: string;
  name: string;
  description: string;
  outcome: string;
  action: string;
  category: string;
  enabled: boolean;
  disabledReason?: string;
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
  conversationId?: string;
  from: "user" | "admin";
  kind?: "chat" | "notification";
  text: string;
  createdAt: string;
  status?: "sent" | "read";
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

type DemoUser = {
  id: string;
  name: string;
  email: string;
  password?: string;
  provider?: "email" | "google";
  createdAt: string;
};

type UserUsage = Record<string, { used: number; limit: number; updatedAt: string }>;

type AdminAccount = {
  id: string;
  name: string;
  login: string;
  password: string;
  role: "owner" | "admin";
  createdAt: string;
};

const ADMIN_STORAGE_KEY = "cuddy-admin-state";
const ADMIN_CODE = "cuddy-pro";
const ADMIN_ACCOUNTS_KEY = "cuddy-admin-accounts";
const ADMIN_SESSION_KEY = "cuddy-admin-session";
const SUPPORT_MESSAGES_KEY = "cuddy-support-messages";
const SUPPORT_UNREAD_KEY = "cuddy-support-unread";
const USERS_KEY = "cuddy-users";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const editorCardClass = "rounded-[30px] border border-white/75 bg-white/88 p-4 shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:shadow-soft sm:p-5";
const dashboardFrameClass = "overflow-hidden rounded-[36px] border border-white/75 bg-white/88 shadow-sm ring-1 ring-black/[0.03]";
const inputClass =
  "w-full rounded-[20px] border border-black/10 bg-white/82 px-4 py-3 text-sm text-ink shadow-inner outline-none transition focus:border-mint focus:bg-white focus:shadow-sm";
const textareaClass =
  "min-h-28 w-full rounded-[20px] border border-black/10 bg-white/82 px-4 py-3 text-sm leading-6 text-ink shadow-inner outline-none transition focus:border-mint focus:bg-white focus:shadow-sm";

const starterSupportMessages: SupportMessage[] = [];

const defaultAdminAccounts: AdminAccount[] = [
  {
    id: "admin-owner",
    name: "Cuddy Admin",
    login: "admin",
    password: ADMIN_CODE,
    role: "owner",
    createdAt: "2026-01-01T00:00:00.000Z"
  }
];

function readAdminAccounts(): AdminAccount[] {
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_ACCOUNTS_KEY) ?? "null") as AdminAccount[] | null;
    if (saved?.length) return saved;
  } catch {
    return defaultAdminAccounts;
  }
  localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(defaultAdminAccounts));
  return defaultAdminAccounts;
}

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
  const [adminLogin, setAdminLogin] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("cuddy-pro");
  const [authError, setAuthError] = useState("");
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(defaultAdminAccounts);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);
  const [tab, setTab] = useState<AdminTab>("analytics");
  const [state, setState] = useState<AdminState>(defaultState);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(starterSupportMessages);
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    const accounts = readAdminAccounts();
    setAdminAccounts(accounts);
    const sessionId = localStorage.getItem(ADMIN_SESSION_KEY);
    const sessionAdmin = accounts.find((account) => account.id === sessionId) ?? null;
    setCurrentAdmin(sessionAdmin);
    setAuthorized(Boolean(sessionAdmin));

    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved) as AdminState);
      } catch {
        setState(defaultState);
      }
    }

    fetch(`${API_BASE_URL}/api/admin-state`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: AdminState | null) => {
        if (!payload || !payload.tools) return;
        setState(payload);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(payload));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    function syncUsers() {
      try {
        setUsers(JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as DemoUser[]);
      } catch {
        setUsers([]);
      }
    }

    syncUsers();
    window.addEventListener("storage", syncUsers);
    window.addEventListener("cuddy-auth-change", syncUsers);
    return () => {
      window.removeEventListener("storage", syncUsers);
      window.removeEventListener("cuddy-auth-change", syncUsers);
    };
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

    function syncBackendSupport() {
      fetch(`${API_BASE_URL}/api/support-messages`, { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload: SupportMessage[] | null) => {
          if (!payload?.length) return;
          setSupportMessages(payload);
          localStorage.setItem(SUPPORT_MESSAGES_KEY, JSON.stringify(payload));
        })
        .catch(() => undefined);
    }

    syncSupport();
    syncBackendSupport();
    const interval = window.setInterval(syncBackendSupport, 6000);
    window.addEventListener("storage", syncSupport);
    window.addEventListener("cuddy-support-change", syncSupport);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", syncSupport);
      window.removeEventListener("cuddy-support-change", syncSupport);
    };
  }, []);

  const stats = useMemo(
    () => [
      { label: "Tool", value: state.tools.length },
      { label: "Faol", value: state.tools.filter((tool) => tool.enabled).length },
      { label: "Chatlar", value: getConversationRows(supportMessages).length }
    ],
    [state.tools, supportMessages]
  );

  function login() {
    const account = adminAccounts.find(
      (item) => item.login.trim().toLowerCase() === adminLogin.trim().toLowerCase() && item.password === adminPassword
    );
    if (!account) {
      setAuthError("Login yoki parol noto'g'ri.");
      return;
    }
    localStorage.setItem(ADMIN_SESSION_KEY, account.id);
    setCurrentAdmin(account);
    setAuthorized(true);
    setAuthError("");
    setAdminPassword("");
  }

  function logoutAdmin() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setCurrentAdmin(null);
    setAuthorized(false);
    setTab("analytics");
  }

  function saveAdminAccounts(nextAccounts: AdminAccount[]) {
    setAdminAccounts(nextAccounts);
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(nextAccounts));
    const updatedCurrent = nextAccounts.find((account) => account.id === currentAdmin?.id) ?? null;
    setCurrentAdmin(updatedCurrent);
  }

  function save() {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state));
    void fetch(`${API_BASE_URL}/api/admin-state`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    }).catch(() => undefined);
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

  function confirmToolStatusChange(index: number, enabled: boolean) {
    if (enabled) {
      updateTool(index, { enabled: true, disabledReason: "" });
      return;
    }

    const reason = window.prompt("Tool nima sababdan vaqtincha o'chirilyapti? Bu sabab saytda userlarga ko'rinadi.");
    if (!reason?.trim()) return;

    const password = window.prompt("Tasdiqlash uchun admin parolni kiriting.");
    if (!currentAdmin || password !== currentAdmin.password) {
      window.alert("Admin parol noto'g'ri. Tool o'chirilmadi.");
      return;
    }

    updateTool(index, { enabled: false, disabledReason: reason.trim() });
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
    void fetch(`${API_BASE_URL}/api/support-messages`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextMessages)
    }).catch(() => undefined);
    window.dispatchEvent(new CustomEvent("cuddy-support-change"));
  }

  function saveUsers(nextUsers: DemoUser[]) {
    setUsers(nextUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
    window.dispatchEvent(new CustomEvent("cuddy-auth-change"));
  }

  function sendSupportReply(text: string, conversationId: string) {
    const lastUserMessage = [...supportMessages].reverse().find((message) => (message.conversationId ?? "global") === conversationId && message.from === "user");
    const reply: SupportMessage = {
      id: `admin-${Date.now()}`,
      conversationId,
      from: "admin",
      kind: "chat",
      text,
      createdAt: new Date().toISOString(),
      status: "sent",
      user: lastUserMessage?.user
    };
    saveSupportMessages([...supportMessages, reply]);
    const unread = Number(localStorage.getItem(SUPPORT_UNREAD_KEY) ?? "0") + 1;
    localStorage.setItem(SUPPORT_UNREAD_KEY, String(unread));
    window.dispatchEvent(new CustomEvent("cuddy-support-change"));
  }

  function sendNotification(user: DemoUser, text: string) {
    const notification: SupportMessage = {
      id: `notification-${Date.now()}`,
      conversationId: user.id,
      from: "admin",
      kind: "notification",
      text,
      createdAt: new Date().toISOString(),
      user: { id: user.id, name: user.name, email: user.email }
    };
    saveSupportMessages([...supportMessages, notification]);
    const unread = Number(localStorage.getItem(SUPPORT_UNREAD_KEY) ?? "0") + 1;
    localStorage.setItem(SUPPORT_UNREAD_KEY, String(unread));
    window.dispatchEvent(new CustomEvent("cuddy-support-change"));
  }

  if (!authorized) {
    return (
      <main className="mx-auto grid min-h-[82vh] max-w-5xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid w-full overflow-hidden rounded-[42px] border border-white/80 bg-white/88 shadow-soft backdrop-blur lg:grid-cols-[0.85fr_1fr]">
          <div className="relative overflow-hidden bg-ink p-7 text-white sm:p-10">
            <div className="absolute right-[-80px] top-[-90px] h-56 w-56 rounded-full bg-mint/25 blur-3xl" />
            <div className="absolute bottom-[-90px] left-[-80px] h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <span className="inline-flex rounded-full bg-mint px-4 py-2 text-xs font-black uppercase text-ink shadow-glow">Cuddy Pro</span>
              <h1 className="mt-8 max-w-sm text-4xl font-black leading-tight sm:text-5xl">Admin control center</h1>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/68">
                Tool, limit, chat va sayt matnlarini bitta paneldan boshqarish uchun demo admin kirishi.
              </p>
            </div>
          </div>
          <div className="p-6 text-center sm:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] bg-ink text-mint shadow-glow">
              <KeyRound size={28} />
            </div>
            <span className="mt-6 block text-xs font-black uppercase text-ink/45">Admin panel</span>
            <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">Boshqaruvga kirish</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink/65">
              Tool'lar, sayt matnlari va maxfiylik bloklarini boshqarish uchun admin login-parolini kiriting.
            </p>
            <div className="mx-auto mt-7 grid max-w-md gap-3">
              <input
                className="w-full rounded-[24px] border border-black/10 bg-panel px-4 py-4 text-center font-black text-ink shadow-inner outline-none transition focus:border-mint focus:bg-white"
                value={adminLogin}
                onChange={(event) => setAdminLogin(event.target.value)}
                placeholder="Login"
              />
              <input
                className="w-full rounded-[24px] border border-black/10 bg-panel px-4 py-4 text-center font-black text-ink shadow-inner outline-none transition focus:border-mint focus:bg-white"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") login();
                }}
                placeholder="Parol"
                type="password"
              />
              <button className="rounded-full bg-ink px-5 py-3 text-sm font-black uppercase text-mint shadow-sm hover:bg-black" type="button" onClick={login}>
                Kirish
              </button>
              {authError ? <p className="rounded-[18px] bg-[#fff1ed] px-4 py-3 text-center text-xs font-black text-tomato">{authError}</p> : null}
              <p className="text-center text-xs font-bold text-ink/45">Demo login: admin | parol: cuddy-pro</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[42px] border border-white/80 bg-white/78 shadow-soft backdrop-blur">
        <div className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_20%,rgba(182,255,0,0.55),transparent_26%),linear-gradient(135deg,#ffffff_0%,#f7ffdb_48%,#eef5ff_100%)] p-5 sm:p-7">
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-ink px-4 py-2 text-xs font-black uppercase text-mint shadow-sm">Cuddy Pro Admin</span>
              <h1 className="mt-4 text-3xl font-black leading-tight text-ink sm:text-5xl">Sayt boshqaruvi</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/65">
                Tool nomlari, tavsiflar, asosiy matnlar va maxfiylik shartlarini bir joydan tahrirlang.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-3 text-sm font-black text-ink shadow-sm hover:bg-mint" type="button" onClick={() => setTab("admins")}>
                <UserRound size={16} /> {currentAdmin?.name ?? "Admin profil"}
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-black text-mint shadow-sm hover:bg-black" type="button" onClick={save}>
                <Save size={16} /> Saqlash
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-3 text-sm font-black text-ink shadow-sm hover:bg-mint" type="button" onClick={exportJson}>
                <Download size={16} /> Export
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-3 text-sm font-black text-ink shadow-sm hover:bg-[#fff1ed]" type="button" onClick={reset}>
                <RotateCcw size={16} /> Reset
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-3 text-sm font-black text-ink shadow-sm hover:bg-[#fff1ed]" type="button" onClick={logoutAdmin}>
                Chiqish
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4 bg-ink p-4 lg:p-5">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[28px] border border-white/10 bg-white/[0.08] p-5 text-white shadow-sm backdrop-blur">
              <strong className="block text-3xl font-black text-mint">{item.value}</strong>
              <span className="mt-1 block text-sm text-white/70">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="grid items-start gap-5 p-4 sm:p-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[32px] border border-white/75 bg-panel/90 p-2 shadow-sm lg:sticky lg:top-6">
            {[
              { id: "analytics" as const, label: "Analitika", icon: BarChart3 },
              { id: "limits" as const, label: "Limitlar", icon: SlidersHorizontal },
              { id: "tools" as const, label: "Tool'lar" },
              { id: "site" as const, label: "Sayt matnlari" },
              { id: "privacy" as const, label: "Maxfiylik" },
              { id: "chats" as const, label: "Chatlar", icon: MessageCircle },
              { id: "profiles" as const, label: "Userlar", icon: UserRound },
              { id: "admins" as const, label: "Adminlar", icon: KeyRound }
            ].map((item) => (
              <button
                key={item.id}
                className={`flex w-full items-center gap-3 rounded-[24px] px-4 py-3 text-left text-sm font-black transition ${
                  tab === item.id ? "bg-ink text-mint shadow-sm" : "text-ink/65 hover:bg-white hover:text-ink hover:shadow-sm"
                }`}
                type="button"
                onClick={() => setTab(item.id)}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-[15px] ${tab === item.id ? "bg-white/10" : "bg-white"}`}>
                  {item.icon ? <item.icon size={16} /> : <Settings2 size={16} />}
                </span>
                {item.label}
              </button>
            ))}
            {savedAt ? <p className="px-4 py-3 text-xs font-bold text-ink/45">Oxirgi holat: {savedAt}</p> : null}
          </aside>

          <section className="min-w-0">
            {tab === "analytics" ? <AnalyticsPanel tools={state.tools} limits={state.limits} /> : null}
            {tab === "limits" ? <LimitEditor tools={state.tools} limits={state.limits} updateLimit={updateLimit} /> : null}
            {tab === "tools" ? <ToolsEditor tools={state.tools} updateTool={updateTool} confirmToolStatusChange={confirmToolStatusChange} /> : null}
            {tab === "site" ? (
              <SiteEditor site={state.site} setSite={(site) => setState((current) => ({ ...current, site }))} />
            ) : null}
            {tab === "privacy" ? (
              <PrivacyEditor privacy={state.privacy} setPrivacy={(privacy) => setState((current) => ({ ...current, privacy }))} />
            ) : null}
            {tab === "chats" ? (
              <SupportInbox
                messages={supportMessages}
                users={users}
                saveMessages={saveSupportMessages}
                sendReply={sendSupportReply}
                clearMessages={() => saveSupportMessages(starterSupportMessages)}
              />
            ) : null}
            {tab === "profiles" ? (
              <ProfilesPanel users={users} saveUsers={saveUsers} sendNotification={sendNotification} />
            ) : null}
            {tab === "admins" ? (
              <AdminAccountsPanel
                accounts={adminAccounts}
                currentAdmin={currentAdmin}
                saveAccounts={saveAdminAccounts}
                logoutAdmin={logoutAdmin}
              />
            ) : null}
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
      <div className={dashboardFrameClass}>
        <div className="border-b border-black/10 bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_100%)] p-5">
          <h2 className="text-xl font-black text-ink">Tool talab va limit analitikasi</h2>
          <p className="mt-1 text-sm leading-6 text-ink/60">
            Demo panel: production’da bu qiymatlar backend eventlari va database orqali real vaqtda to'planadi.
          </p>
        </div>
        <div className="grid gap-3 p-4">
          {rows.map((row) => {
            const limit = limits.find((item) => item.slug === row.slug);
            const demandPercent = Math.min(100, row.usage / 4);
            return (
              <article key={row.slug} className="rounded-[26px] border border-white/80 bg-panel p-4 shadow-sm">
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
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white shadow-inner">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#313131_0%,#B6FF00_100%)]" style={{ width: `${demandPercent}%` }} />
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
    <div className="rounded-[28px] border border-white/10 bg-ink p-5 text-white shadow-sm">
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
          <article key={limit.slug} className={editorCardClass}>
            <div className="mb-4">
              <span className="text-xs font-black uppercase text-ink/40">{limit.slug}</span>
              <h2 className="text-xl font-black text-ink">{tool?.name ?? limit.slug}</h2>
              <p className="mt-1 text-sm text-ink/60">Kunlik yoki haftalik limitlarni boshqarish.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-ink">Davr</span>
                <select
                  className={inputClass}
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
  updateTool,
  confirmToolStatusChange
}: {
  tools: EditableTool[];
  updateTool: (index: number, patch: Partial<EditableTool>) => void;
  confirmToolStatusChange: (index: number, enabled: boolean) => void;
}) {
  return (
    <div className="grid gap-4">
      {editableTools.map((tool, index) => (
        <article key={tool.slug} className={editorCardClass}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="text-xs font-black uppercase text-ink/40">{tool.slug}</span>
              <h2 className="text-xl font-black text-ink">{tool.name}</h2>
            </div>
            <label className={`flex w-fit shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-black shadow-sm ${tool.enabled ? "bg-mint text-ink" : "bg-[#fff1ed] text-tomato"}`}>
              <input checked={tool.enabled} type="checkbox" onChange={(event) => confirmToolStatusChange(index, event.target.checked)} />
              {tool.enabled ? "Faol" : "Vaqtincha yopiq"}
            </label>
          </div>
          {!tool.enabled ? (
            <div className="mb-4 flex items-start gap-3 rounded-[22px] bg-[#fff1ed] p-4 text-sm font-bold leading-6 text-tomato">
              <Lock size={18} className="mt-0.5 shrink-0" />
              <span>{tool.disabledReason || "Sabab kiritilmagan."}</span>
            </div>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <AdminInput label="Nomi" value={tool.name} onChange={(value) => updateTool(index, { name: value })} />
            <AdminInput label="Action" value={tool.action} onChange={(value) => updateTool(index, { action: value })} />
            <AdminTextarea label="Tavsif" value={tool.description} onChange={(value) => updateTool(index, { description: value })} />
            <AdminTextarea label="Natija matni" value={tool.outcome} onChange={(value) => updateTool(index, { outcome: value })} />
            <AdminTextarea label="Yopilgan holat sababi" value={tool.disabledReason ?? ""} onChange={(value) => updateTool(index, { disabledReason: value })} />
          </div>
        </article>
      ))}
    </div>
  );
}

function SiteEditor({ site, setSite }: { site: SiteContent; setSite: (site: SiteContent) => void }) {
  return (
    <div className={editorCardClass}>
      <EditorHeader title="Sayt matnlari" body="Asosiy sahifadagi hero, tugmalar va limit matnlarini shu yerdan boshqaring." />
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
    <div className={editorCardClass}>
      <EditorHeader title="Maxfiylik matnlari" body="Public privacy modal ichidagi uchta asosiy blokni tahrirlang." />
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

function getConversationRows(messages: SupportMessage[]) {
  const map = new Map<
    string,
    {
      id: string;
      user?: SupportMessage["user"];
      lastText: string;
      lastAt: string;
      unread: number;
    }
  >();

  messages.forEach((message) => {
    const id = message.conversationId ?? "global";
    if (id === "global") return;
    const current = map.get(id);
    map.set(id, {
      id,
      user: message.user ?? current?.user,
      lastText: message.text,
      lastAt: message.createdAt,
      unread: (current?.unread ?? 0) + (message.from === "user" && message.status !== "read" ? 1 : 0)
    });
  });

  return [...map.values()].sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
}

function getUserUsageRows(userId: string) {
  try {
    const usage = JSON.parse(localStorage.getItem(`cuddy-user-usage-${userId}`) ?? "{}") as UserUsage;
    return Object.entries(usage).map(([slug, record]) => ({ slug, ...record }));
  } catch {
    return [];
  }
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[20px] bg-white p-3">
      <span className="text-[10px] font-black uppercase text-ink/40">{label}</span>
      <p className="mt-1 break-all text-sm font-black text-ink">{value}</p>
    </div>
  );
}

function EditorHeader({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-5 border-b border-black/10 pb-4">
      <span className="text-xs font-black uppercase text-ink/40">Cuddy Pro Admin</span>
      <h2 className="mt-1 text-2xl font-black text-ink">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">{body}</p>
    </div>
  );
}

function SupportInbox({
  messages,
  users,
  saveMessages,
  sendReply,
  clearMessages
}: {
  messages: SupportMessage[];
  users: DemoUser[];
  saveMessages: (messages: SupportMessage[]) => void;
  sendReply: (text: string, conversationId: string) => void;
  clearMessages: () => void;
}) {
  const [reply, setReply] = useState("");
  const conversations = getConversationRows(messages);
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "global");
  const activeConversation = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];
  const activeMessages = activeConversation ? messages.filter((message) => (message.conversationId ?? "global") === activeConversation.id) : messages;
  const activeUser = users.find((user) => user.id === activeConversation?.user?.id);
  const usageRows = activeConversation?.user?.id ? getUserUsageRows(activeConversation.user.id) : [];

  function selectConversation(conversationId: string) {
    setActiveId(conversationId);
    const nextMessages = messages.map((message) =>
      (message.conversationId ?? "global") === conversationId && message.from === "user" ? { ...message, status: "read" as const } : message
    );
    saveMessages(nextMessages);
  }

  function submitReply() {
    if (!reply.trim() || !activeConversation) return;
    sendReply(reply.trim(), activeConversation.id);
    setReply("");
  }

  useEffect(() => {
    if (!activeConversation && conversations[0]) {
      setActiveId(conversations[0].id);
    }
  }, [activeConversation, conversations]);

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsStat label="Chatlar" value={conversations.length} />
        <AnalyticsStat label="O'qilmagan" value={messages.filter((message) => message.from === "user" && message.status !== "read").length} />
        <AnalyticsStat label="Admin javoblari" value={messages.filter((message) => message.from === "admin").length} />
      </div>

      <div className={dashboardFrameClass}>
        <div className="flex flex-col gap-3 border-b border-black/10 bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_55%,#eef5ff_100%)] p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-black uppercase text-ink/45">Chatlar</span>
            <h2 className="mt-1 text-2xl font-black text-ink">User support suhbatlari</h2>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              Har bir user yoki mehmon alohida chat sifatida ko'rinadi. Chat ochilganda user xabari o'qilgan holatiga o'tadi.
            </p>
          </div>
          <button className="w-fit rounded-full bg-white/85 px-4 py-3 text-sm font-black text-ink shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fff1ed]" type="button" onClick={clearMessages}>
            Chatni tozalash
          </button>
        </div>

        <div className="grid items-start gap-4 p-4 lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_330px]">
          <div className="order-1 max-h-[420px] space-y-2 overflow-auto rounded-[28px] border border-white/80 bg-panel p-2 shadow-inner lg:max-h-[min(68vh,650px)]">
            {conversations.length ? conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`w-full rounded-[24px] p-4 text-left transition ${activeConversation?.id === conversation.id ? "bg-ink text-white shadow-sm" : "bg-white/88 text-ink shadow-sm hover:-translate-y-0.5 hover:bg-mint"}`}
                type="button"
                onClick={() => selectConversation(conversation.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="block text-sm">{conversation.user?.name ?? "Demo mehmon"}</strong>
                    <span className={`mt-1 block truncate text-xs ${activeConversation?.id === conversation.id ? "text-white/55" : "text-ink/45"}`}>{conversation.user?.email ?? conversation.id}</span>
                  </div>
                  {conversation.unread ? <span className="grid h-6 min-w-6 place-items-center rounded-full bg-tomato px-2 text-xs font-black text-white">{conversation.unread}</span> : null}
                </div>
                <p className={`mt-3 line-clamp-2 text-xs leading-5 ${activeConversation?.id === conversation.id ? "text-white/65" : "text-ink/55"}`}>{conversation.lastText}</p>
              </button>
            )) : (
              <div className="rounded-[24px] bg-white/85 p-5 text-sm font-bold leading-6 text-ink/55">
                Hali userlardan chat kelmagan.
              </div>
            )}
          </div>

          <div className="order-2 grid h-[min(72vh,650px)] min-h-[460px] grid-rows-[1fr_auto] overflow-hidden rounded-[28px] border border-white/80 bg-panel shadow-inner">
            <div className="space-y-3 overflow-auto p-4">
              {activeMessages.length ? activeMessages.map((message) => (
                <div key={message.id} className={`flex ${message.from === "admin" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[84%] rounded-[24px] px-4 py-3 text-sm leading-6 shadow-sm ${message.from === "admin" ? "bg-ink text-white" : "bg-white text-ink"}`}>
                    <span className={`mb-1 block text-[10px] font-black uppercase ${message.from === "admin" ? "text-mint" : "text-ink/40"}`}>
                      {message.from === "admin" ? "Admin" : "User"}
                    </span>
                    <p>{message.text}</p>
                    <span className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${message.from === "admin" ? "justify-end text-white/50" : "text-ink/40"}`}>
                      {new Date(message.createdAt).toLocaleString("uz-UZ", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                      {message.from === "admin" ? message.status === "read" ? <CheckCheck size={13} /> : <Check size={13} /> : null}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="grid h-full place-items-center rounded-[24px] bg-white/70 p-6 text-center">
                  <div>
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] bg-ink text-mint">
                      <MessageCircle size={22} />
                    </div>
                    <h3 className="mt-4 text-lg font-black text-ink">Chat tanlanmagan</h3>
                    <p className="mt-1 max-w-sm text-sm leading-6 text-ink/55">User supportdan yozganda suhbat shu panelda ko'rinadi.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-black/10 bg-white/95 p-3">
              <div className="flex gap-2 rounded-[24px] bg-panel p-2 shadow-inner">
                <input
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-ink outline-none"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submitReply();
                  }}
                  placeholder="Javob yozing..."
                />
                <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-mint hover:bg-black" type="button" onClick={submitReply} aria-label="Javob yuborish">
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="order-3 h-fit rounded-[28px] border border-white/80 bg-panel p-4 shadow-sm lg:col-span-2 2xl:col-span-1">
            <div className="grid h-14 w-14 place-items-center rounded-[20px] bg-ink text-mint shadow-glow">
              <UserRound size={24} />
            </div>
            <h3 className="mt-4 break-words text-xl font-black text-ink">{activeConversation?.user?.name ?? activeUser?.name ?? "Demo mehmon"}</h3>
            <p className="mt-1 break-all text-sm font-bold text-ink/55">{activeConversation?.user?.email ?? activeUser?.email ?? "guest@cuddy.pro"}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
              <ProfileStat label="Account" value={activeUser ? "Registered" : "Guest/Demo"} />
              <ProfileStat label="User ID" value={activeConversation?.user?.id ?? activeConversation?.id ?? "-"} />
              <ProfileStat label="Chat xabarlari" value={String(activeMessages.length)} />
            </div>
            {usageRows.length ? (
              <div className="mt-4 rounded-[22px] bg-white/88 p-3 shadow-sm">
                <span className="text-xs font-black uppercase text-ink/45">Tool statistikasi</span>
                <div className="mt-3 grid gap-2">
                  {usageRows.slice(0, 5).map((row) => (
                    <div key={row.slug} className="flex items-center justify-between gap-2 text-xs font-bold text-ink/65">
                      <span>{row.slug}</span>
                      <span>{row.used}/{row.limit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilesPanel({
  users,
  saveUsers,
  sendNotification
}: {
  users: DemoUser[];
  saveUsers: (users: DemoUser[]) => void;
  sendNotification: (user: DemoUser, text: string) => void;
}) {
  const [activeUserId, setActiveUserId] = useState(users[0]?.id ?? "");
  const [notification, setNotification] = useState("Platformada siz uchun yangi bildirishnoma bor.");
  const activeUser = users.find((user) => user.id === activeUserId) ?? users[0];
  const usageRows = activeUser ? getUserUsageRows(activeUser.id) : [];

  useEffect(() => {
    if (!activeUserId && users[0]) {
      setActiveUserId(users[0].id);
    }
  }, [activeUserId, users]);

  function updateUser(patch: Partial<DemoUser>) {
    if (!activeUser) return;
    saveUsers(users.map((user) => (user.id === activeUser.id ? { ...user, ...patch } : user)));
  }

  function submitNotification() {
    if (!activeUser || !notification.trim()) return;
    sendNotification(activeUser, notification.trim());
    setNotification("");
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsStat label="Userlar" value={users.length} />
        <AnalyticsStat label="Faol profil" value={activeUser?.name ?? "-"} />
        <AnalyticsStat label="Tool usage" value={usageRows.reduce((sum, row) => sum + row.used, 0)} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className={editorCardClass}>
          <EditorHeader title="Userlar" body="Ro'yxatdan o'tgan profillar ro'yxati." />
          <div className="grid max-h-[560px] gap-2 overflow-auto">
            {users.length ? users.map((user) => (
              <button
                key={user.id}
                className={`min-w-0 rounded-[24px] p-4 text-left text-sm shadow-sm transition ${activeUser?.id === user.id ? "bg-ink text-white" : "bg-panel text-ink hover:bg-mint"}`}
                type="button"
                onClick={() => setActiveUserId(user.id)}
              >
                <strong className="block truncate">{user.name}</strong>
                <span className={`mt-1 block truncate text-xs ${activeUser?.id === user.id ? "text-white/55" : "text-ink/50"}`}>{user.email}</span>
              </button>
            )) : (
              <div className="rounded-[24px] bg-panel p-5 text-sm font-bold text-ink/55">Hali user ro'yxatdan o'tmagan.</div>
            )}
          </div>
        </div>

        <div className={editorCardClass}>
          <EditorHeader title="Profil va parol boshqaruvi" body="Demo profillarni tahrirlash va userga bildirishnoma yuborish." />
          {activeUser ? (
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <AdminInput label="Ism" value={activeUser.name} onChange={(name) => updateUser({ name })} />
                <AdminInput label="Email" value={activeUser.email} onChange={(email) => updateUser({ email })} />
                <AdminInput label="Parol" value={activeUser.password ?? ""} onChange={(password) => updateUser({ password })} />
                <ProfileStat label="User ID" value={activeUser.id} />
              </div>

              <div className="rounded-[26px] bg-panel p-4">
                <span className="text-xs font-black uppercase text-ink/45">Bildirishnoma yuborish</span>
                <textarea
                  className={`${textareaClass} mt-3`}
                  value={notification}
                  onChange={(event) => setNotification(event.target.value)}
                  placeholder="Userga yuboriladigan xabar..."
                />
                <button className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-mint hover:bg-black" type="button" onClick={submitNotification}>
                  <Bell size={16} /> Bildirishnoma yuborish
                </button>
              </div>

              <div className="rounded-[26px] bg-panel p-4">
                <span className="text-xs font-black uppercase text-ink/45">Tool statistikasi</span>
                <div className="mt-3 grid gap-2">
                  {usageRows.length ? usageRows.map((row) => (
                    <div key={row.slug} className="flex items-center justify-between gap-3 rounded-[18px] bg-white/85 px-4 py-3 text-sm font-bold text-ink">
                      <span>{row.slug}</span>
                      <span>{row.used}/{row.limit}</span>
                    </div>
                  )) : <p className="text-sm font-bold text-ink/55">Bu user hali tool ishlatmagan.</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] bg-panel p-5 text-sm font-bold text-ink/55">Profil tanlanmagan.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminAccountsPanel({
  accounts,
  currentAdmin,
  saveAccounts,
  logoutAdmin
}: {
  accounts: AdminAccount[];
  currentAdmin: AdminAccount | null;
  saveAccounts: (accounts: AdminAccount[]) => void;
  logoutAdmin: () => void;
}) {
  const [newName, setNewName] = useState("Yangi admin");
  const [newLogin, setNewLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  function updateCurrentAdmin(patch: Partial<AdminAccount>) {
    if (!currentAdmin) return;
    const nextAccounts = accounts.map((account) => (account.id === currentAdmin.id ? { ...account, ...patch } : account));
    saveAccounts(nextAccounts);
    if (patch.password) {
      setMessage("Parol yangilandi. Keyingi kirishda yangi paroldan foydalaning.");
    } else {
      setMessage("Admin profil yangilandi.");
    }
  }

  function addAdmin() {
    const normalizedLogin = newLogin.trim().toLowerCase();
    if (!normalizedLogin || !newPassword.trim()) {
      setMessage("Yangi admin uchun login va parol kiriting.");
      return;
    }
    if (accounts.some((account) => account.login.toLowerCase() === normalizedLogin)) {
      setMessage("Bu login allaqachon mavjud.");
      return;
    }

    const nextAdmin: AdminAccount = {
      id: `admin-${Date.now()}`,
      name: newName.trim() || normalizedLogin,
      login: normalizedLogin,
      password: newPassword,
      role: "admin",
      createdAt: new Date().toISOString()
    };
    saveAccounts([...accounts, nextAdmin]);
    setNewName("Yangi admin");
    setNewLogin("");
    setNewPassword("");
    setMessage("Yangi admin qo'shildi.");
  }

  function removeAdmin(adminId: string) {
    if (adminId === currentAdmin?.id) {
      setMessage("O'zingizni shu paneldan o'chira olmaysiz.");
      return;
    }
    const nextAccounts = accounts.filter((account) => account.id !== adminId);
    saveAccounts(nextAccounts.length ? nextAccounts : defaultAdminAccounts);
    setMessage("Admin ro'yxatdan olib tashlandi.");
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsStat label="Adminlar" value={accounts.length} />
        <AnalyticsStat label="Joriy admin" value={currentAdmin?.login ?? "-"} />
        <AnalyticsStat label="Rol" value={currentAdmin?.role ?? "-"} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className={editorCardClass}>
          <EditorHeader title="Admin profili" body="Kirgan admin o'z login, parol va profil nomini shu yerdan boshqaradi." />
          {currentAdmin ? (
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <AdminInput label="Admin nomi" value={currentAdmin.name} onChange={(name) => updateCurrentAdmin({ name })} />
                <AdminInput label="Login" value={currentAdmin.login} onChange={(login) => updateCurrentAdmin({ login: login.trim().toLowerCase() })} />
                <AdminInput label="Yangi parol" value={currentAdmin.password} onChange={(password) => updateCurrentAdmin({ password })} />
                <ProfileStat label="Admin ID" value={currentAdmin.id} />
              </div>
              <button className="w-fit rounded-full bg-ink px-5 py-3 text-sm font-black text-mint hover:bg-black" type="button" onClick={logoutAdmin}>
                Profildan chiqish
              </button>
            </div>
          ) : (
            <div className="rounded-[24px] bg-panel p-5 text-sm font-bold text-ink/55">Admin sessiya topilmadi.</div>
          )}
        </div>

        <div className={editorCardClass}>
          <EditorHeader title="Yangi admin" body="Demo boshqaruv uchun qo'shimcha admin login-parol yarating." />
          <div className="grid gap-3">
            <AdminInput label="Ism" value={newName} onChange={setNewName} />
            <AdminInput label="Login" value={newLogin} onChange={setNewLogin} />
            <AdminInput label="Parol" value={newPassword} onChange={setNewPassword} />
            <button className="rounded-full bg-ink px-5 py-3 text-sm font-black text-mint hover:bg-black" type="button" onClick={addAdmin}>
              Admin qo'shish
            </button>
          </div>
        </div>
      </div>

      <div className={dashboardFrameClass}>
        <div className="border-b border-black/10 bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_55%,#eef5ff_100%)] p-5">
          <h2 className="text-xl font-black text-ink">Adminlar ro'yxati</h2>
          <p className="mt-1 text-sm leading-6 text-ink/60">Default kirish: login admin, parol cuddy-pro. Production'da bular backend/database orqali himoyalanadi.</p>
        </div>
        <div className="grid gap-3 p-4">
          {accounts.map((account) => (
            <article key={account.id} className="grid gap-3 rounded-[26px] border border-white/80 bg-panel p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                <strong className="block truncate text-ink">{account.name}</strong>
                <p className="mt-1 break-all text-sm font-bold text-ink/55">
                  {account.login} | {account.role} | {new Date(account.createdAt).toLocaleDateString("uz-UZ")}
                </p>
              </div>
              <button
                className="w-fit rounded-full bg-white px-4 py-2 text-xs font-black text-ink shadow-sm transition hover:bg-[#fff1ed] hover:text-tomato"
                type="button"
                onClick={() => removeAdmin(account.id)}
              >
                O'chirish
              </button>
            </article>
          ))}
        </div>
      </div>

      {message ? <div className="rounded-[22px] bg-mint p-4 text-sm font-black text-ink">{message}</div> : null}
    </div>
  );
}

function AdminInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-black text-ink">{label}</span>
      <input
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function AdminTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-black text-ink">{label}</span>
      <textarea
        className={textareaClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

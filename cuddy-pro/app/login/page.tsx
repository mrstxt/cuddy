"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getCurrentUser, loginUser, registerUser, USER_TOOL_LIMIT } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (getCurrentUser()) {
      router.replace("/profile");
    }
  }, [router]);

  async function submit() {
    try {
      if (!username.trim() || !password.trim()) {
        setMessage("Username va parol kiriting.");
        return;
      }

      if (mode === "register") {
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
          setMessage("Ism, familiya va email kiritilishi kerak.");
          return;
        }
        await registerUser(firstName, lastName, username, email, password);
        setMessage("Ro'yxatdan o'tildi. Profil panelga yo'naltirilyapti...");
      } else {
        await loginUser(username, password);
        setMessage("Kirish muvaffaqiyatli. Profil panelga yo'naltirilyapti...");
      }

      window.setTimeout(() => router.push("/profile"), 450);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kirishda xatolik bo'ldi.");
    }
  }

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-6xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid w-full overflow-hidden rounded-[36px] border border-black/10 bg-white/85 shadow-soft backdrop-blur lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-ink p-8 text-white sm:p-10">
          <Logo size="md" href="" tone="inverse" />
          <h1 className="mt-10 text-4xl font-black leading-tight">Profil bilan tool limitlaringizni boshqaring.</h1>
          <p className="mt-4 text-sm leading-7 text-white/70">
            Har bir funksiya mehmonlar uchun 3 marta. Ro'yxatdan o'tgan user uchun limit:
            <strong className="text-mint"> {USER_TOOL_LIMIT} marta</strong>.
          </p>
        </div>
        <div className="p-6 sm:p-10">
          <span className="text-xs font-black uppercase text-ink/45">Cuddy profile</span>
          <h2 className="mt-2 text-3xl font-black text-ink">{mode === "register" ? "Ro'yxatdan o'tish" : "Login qilish"}</h2>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-full bg-panel p-1">
            <button className={`rounded-full px-4 py-2 text-sm font-black ${mode === "register" ? "bg-ink text-white" : "text-ink/60"}`} type="button" onClick={() => setMode("register")}>
              Register
            </button>
            <button className={`rounded-full px-4 py-2 text-sm font-black ${mode === "login" ? "bg-ink text-white" : "text-ink/60"}`} type="button" onClick={() => setMode("login")}>
              Login
            </button>
          </div>

          <div className="mt-6 grid gap-3">
            {mode === "register" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="rounded-[18px] border border-line bg-panel px-4 py-3 outline-none focus:border-ink" placeholder="Ism" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
                  <input className="rounded-[18px] border border-line bg-panel px-4 py-3 outline-none focus:border-ink" placeholder="Familiya" value={lastName} onChange={(event) => setLastName(event.target.value)} />
                </div>
                <input className="rounded-[18px] border border-line bg-panel px-4 py-3 outline-none focus:border-ink" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </>
            ) : null}
            <input className="rounded-[18px] border border-line bg-panel px-4 py-3 outline-none focus:border-ink" placeholder="Username (minimum 6 belgi)" value={username} onChange={(event) => setUsername(event.target.value)} />
            <input className="rounded-[18px] border border-line bg-panel px-4 py-3 outline-none focus:border-ink" placeholder="Parol" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <button type="button" onClick={submit} className="rounded-full bg-ink px-5 py-3 text-sm font-black uppercase text-white hover:bg-black">
              {mode === "register" ? "Ro'yxatdan o'tish" : "Login qilish"}
            </button>
          </div>

          {message ? (
            <div className="mt-5 rounded-[20px] bg-mint p-4 text-sm font-bold text-ink">{message}</div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/profile" className="text-sm font-bold text-ink hover:underline">
              Profil panel
            </Link>
            <Link href="/" className="text-sm font-bold text-ink/70 hover:text-ink">
              Bosh sahifaga qaytish
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

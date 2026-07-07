"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [signedIn, setSignedIn] = useState(false);

  function signIn() {
    localStorage.setItem("cuddy-auth", "true");
    setSignedIn(true);
  }

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-6xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid w-full overflow-hidden rounded-[36px] border border-black/10 bg-white/85 shadow-soft backdrop-blur lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-ink p-8 text-white sm:p-10">
          <Logo size="md" href="" tone="inverse" />
          <h1 className="mt-10 text-4xl font-black leading-tight">Tool'lardan cheksizroq foydalanish uchun kiring.</h1>
          <p className="mt-4 text-sm leading-7 text-white/70">
            Har bir funksiya 3 marta bepul. Ro'yxatdan o'tgach limitlar profilingizga bog'lanadi.
          </p>
        </div>
        <div className="p-6 sm:p-10">
          <span className="text-xs font-black uppercase text-ink/45">Kirish</span>
          <h2 className="mt-2 text-3xl font-black text-ink">Hisob yaratish yoki kirish</h2>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={signIn}
              className="rounded-full border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-sm hover:bg-mint"
            >
              Google orqali davom etish
            </button>
            <input className="rounded-[18px] border border-line bg-panel px-4 py-3 outline-none focus:border-ink" placeholder="Email" />
            <input className="rounded-[18px] border border-line bg-panel px-4 py-3 outline-none focus:border-ink" placeholder="Parol" type="password" />
            <button type="button" onClick={signIn} className="rounded-full bg-ink px-5 py-3 text-sm font-black uppercase text-white hover:bg-black">
              Kirish / ro'yxatdan o'tish
            </button>
          </div>

          {signedIn ? (
            <div className="mt-5 rounded-[20px] bg-mint p-4 text-sm font-bold text-ink">
              Demo kirish yoqildi. Endi tool sahifalarida local limit ochiladi.
            </div>
          ) : null}

          <Link href="/" className="mt-6 inline-flex text-sm font-bold text-ink/70 hover:text-ink">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </section>
    </main>
  );
}

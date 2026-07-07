"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { trustItems } from "@/lib/tools";

const trustStyles = [
  {
    card: "bg-[linear-gradient(145deg,#f7ffdb_0%,#d9f99d_100%)]",
    icon: "bg-ink text-mint",
    title: "text-[#24310a]",
    body: "text-[#24310a]/80",
    modal: "bg-[#f7ffdb]"
  },
  {
    card: "bg-[linear-gradient(145deg,#eef5ff_0%,#bfdbfe_100%)]",
    icon: "bg-[#1f6feb] text-white",
    title: "text-[#143d79]",
    body: "text-[#143d79]/80",
    modal: "bg-[#eef5ff]"
  },
  {
    card: "bg-[linear-gradient(145deg,#fff7ed_0%,#fed7aa_100%)]",
    icon: "bg-[#ea580c] text-white",
    title: "text-[#7c2d12]",
    body: "text-[#7c2d12]/80",
    modal: "bg-[#fff7ed]"
  }
];

const trustDetails = [
  "Oddiy vazifalar imkon qadar brauzer ichida bajariladi. Bu tezlikni oshiradi va foydalanuvchi ish jarayonini ortiqcha kutishsiz davom ettiradi.",
  "Tool'lar bitta panelda tartiblangan: kod, data, rasm va tekshiruv ishlari uchun alohida sayt qidirish shart emas.",
  "Loyiha asosiy funksiyalar bilan ishga tayyor: keyingi bosqichlarda login, limit, admin boshqaruv va server qayta ishlovlari yanada kuchaytiriladi."
];

export function TrustCards() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex === null ? null : trustItems[activeIndex];
  const activeStyle = activeIndex === null ? null : trustStyles[activeIndex] ?? trustStyles[0];
  const activeDetail = activeIndex === null ? "" : trustDetails[activeIndex] ?? "";

  return (
    <>
      <div className="trust-card-row mx-auto grid max-w-7xl gap-4 px-4 py-9 sm:px-6 md:grid-cols-3 lg:px-8">
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          const style = trustStyles[index] ?? trustStyles[0];

          return (
            <div
              key={item.title}
              className={`trust-card group flex gap-4 rounded-[30px] border border-white/80 p-5 shadow-sm ${style.card}`}
            >
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[18px] ${style.icon}`}>
                <Icon size={20} />
              </span>
              <span>
                <strong className={`block text-lg font-black ${style.title}`}>{item.title}</strong>
                <span className={`text-sm leading-6 ${style.body}`}>{item.body}</span>
                <button
                  className={`mt-3 block text-left text-xs font-black uppercase underline-offset-4 hover:underline ${style.title}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                >
                  To'liq o'qish
                </button>
              </span>
            </div>
          );
        })}
      </div>

      {activeItem && activeStyle ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/86 px-4 py-8 text-ink backdrop-blur-sm">
          <div className="max-h-[86vh] w-full max-w-2xl overflow-auto rounded-[32px] border border-white/70 bg-white p-5 text-ink shadow-soft sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase text-ink/45">Cuddy Pro</span>
                <h2 className="mt-1 text-2xl font-black text-ink">{activeItem.title}</h2>
              </div>
              <button
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-panel text-ink hover:bg-mint"
                type="button"
                onClick={() => setActiveIndex(null)}
                aria-label="Oynani yopish"
              >
                <X size={18} />
              </button>
            </div>

            <section className={`rounded-[24px] border border-black/5 p-5 ${activeStyle.modal}`}>
              <p className="text-base leading-8 text-ink/76">{activeDetail}</p>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}

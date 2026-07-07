"use client";

import { useState } from "react";
import { X } from "lucide-react";

type PrivacyDialogProps = {
  className?: string;
};

export function PrivacyDialog({ className }: PrivacyDialogProps) {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <button className={className} type="button" onClick={() => setPrivacyOpen(true)}>
        Maxfiylik
      </button>

      {privacyOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/86 px-4 py-8 text-ink backdrop-blur-sm">
          <div className="max-h-[86vh] w-full max-w-2xl overflow-auto rounded-[32px] border border-white/70 bg-white p-5 text-ink shadow-soft sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase text-ink/45">Cuddy Pro</span>
                <h2 className="mt-1 text-2xl font-black text-ink">Maxfiylik shartlari</h2>
              </div>
              <button
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-panel text-ink hover:bg-mint"
                type="button"
                onClick={() => setPrivacyOpen(false)}
                aria-label="Maxfiylik oynasini yopish"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 text-sm leading-7 text-ink">
              <section className="rounded-[22px] border border-black/5 bg-[#f3f5ef] p-4 text-ink">
                <h3 className="font-black text-ink">Lokal ishlaydigan vositalar</h3>
                <p className="mt-1 text-ink/72">
                  QR, JSON, Base64, hash, kod skrinshoti va rasm siqish kabi tezkor funksiyalar
                  brauzer ichida bajariladi.
                </p>
              </section>
              <section className="rounded-[22px] border border-black/5 bg-[#eef6ff] p-4 text-ink">
                <h3 className="font-black text-ink">Serverda bajariladigan vazifalar</h3>
                <p className="mt-1 text-ink/72">
                  Og'ir rasm qayta ishlash va kod tekshirish kabi vazifalar xavfsiz server qatlami
                  orqali bajarilishi mumkin. Maxfiy kalitlar frontendga chiqarilmaydi.
                </p>
              </section>
              <section className="rounded-[22px] border border-black/5 bg-[#f7ffdb] p-4 text-ink">
                <h3 className="font-black text-ink">Bepul limit</h3>
                <p className="mt-1 text-ink/72">
                  Har bir funksiya 3 martagacha bepul ishlatiladi. Davom ettirish uchun Google orqali
                  yoki email bilan ro'yxatdan o'tish mumkin.
                </p>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

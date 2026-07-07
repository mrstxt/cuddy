import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Admin | Cuddy Pro",
  description: "Cuddy Pro admin paneli alohida deploy qilinadi."
};

export default function AdminPage() {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.cuddy.uz";

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-4xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full overflow-hidden rounded-[38px] border border-black/10 bg-white/88 text-center shadow-soft backdrop-blur">
        <div className="bg-[linear-gradient(135deg,#ffffff_0%,#f7ffdb_55%,#eef5ff_100%)] p-6 sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] bg-ink text-mint">
            <ShieldCheck size={28} />
          </div>
          <span className="mt-6 block text-xs font-black uppercase text-ink/45">Admin panel</span>
          <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">Admin alohida ishlaydi</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink/65">
            Public sayt ichida boshqaruv paneli ochilmaydi. Deploy paytida admin alohida subdomain
            sifatida yuradi va shu sayt kontentini boshqaradi.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 p-6 sm:flex-row sm:p-8">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-mint shadow-sm hover:bg-black"
            href={adminUrl}
          >
            Admin panelga o'tish <ExternalLink size={16} />
          </Link>
          <Link className="rounded-full bg-panel px-5 py-3 text-sm font-black text-ink hover:bg-mint" href="/">
            Asosiy sahifa
          </Link>
        </div>
      </section>
    </main>
  );
}

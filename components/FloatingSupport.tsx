import Link from "next/link";
import { Headphones } from "lucide-react";

export function FloatingSupport() {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "/admin";

  return (
    <Link
      href={adminUrl}
      className="support-float fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-[22px] bg-ink text-mint shadow-soft ring-4 ring-white/70 transition hover:-translate-y-1 hover:bg-black sm:bottom-7 sm:right-7"
      aria-label="Support bilan bog'lanish"
      title="Support"
    >
      <Headphones size={24} />
    </Link>
  );
}

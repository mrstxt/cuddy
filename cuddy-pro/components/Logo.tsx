import Link from "next/link";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  href?: string;
  tone?: "default" | "inverse";
};

export function Logo({ size = "md", href = "/", tone = "default" }: LogoProps) {
  const scale = {
    sm: "text-lg sm:text-xl",
    md: "text-2xl sm:text-3xl",
    lg: "text-5xl sm:text-6xl lg:text-7xl"
  };

  const color = tone === "inverse" ? "text-white" : "text-ink";

  const logo = (
    <span
      className={`font-brand inline-flex max-w-full items-center font-black uppercase leading-none tracking-wide ${color} ${scale[size]}`}
      aria-label="Cuddy Pro"
    >
      Cuddy <span className="ml-2 rounded-[0.32em] bg-mint px-[0.28em] py-[0.12em] text-ink shadow-glow">Pro</span>
    </span>
  );

  if (!href) {
    return logo;
  }

  return (
    <Link href={href} className="inline-flex items-center" aria-label="Cuddy Pro home">
      {logo}
    </Link>
  );
}

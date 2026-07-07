import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-ink text-mint shadow-sm hover:-translate-y-0.5 hover:bg-black hover:shadow-soft",
    secondary: "border border-black/10 bg-white/85 text-ink shadow-sm hover:-translate-y-0.5 hover:bg-mint hover:shadow-soft",
    danger: "bg-tomato text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#b94831] hover:shadow-soft"
  };

  return (
    <button
      className={`rounded-full px-5 py-3 text-sm font-black uppercase transition disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

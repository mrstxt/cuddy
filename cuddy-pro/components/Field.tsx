import type { TextareaHTMLAttributes } from "react";

type FieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function Field({ label, className = "", ...props }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-ink">{label}</span>
      <textarea
        className={`min-h-44 w-full rounded-[24px] border border-black/10 bg-white/88 p-4 font-mono text-sm leading-6 text-ink shadow-inner outline-none transition focus:border-mint focus:bg-white focus:shadow-sm ${className}`}
        {...props}
      />
    </label>
  );
}

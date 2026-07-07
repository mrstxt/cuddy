"use client";

import { languages } from "@/lib/i18n";
import { useLanguage } from "@/components/useLanguage";

export function LanguageSwitcher() {
  const { language: activeLanguage, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full border border-ink/10 bg-panel p-1" aria-label="Tilni tanlash">
      {languages.map((language) => (
        <button
          key={language.code}
          className={`h-8 rounded-full px-2.5 text-xs font-black transition ${
            activeLanguage === language.code ? "bg-ink text-white" : "text-ink/55 hover:bg-white hover:text-ink"
          }`}
          type="button"
          onClick={() => setLanguage(language.code)}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}

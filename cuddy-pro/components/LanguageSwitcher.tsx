"use client";

import { useEffect, useState } from "react";

const languages = [
  { code: "uz", label: "UZ" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" }
] as const;

type LanguageCode = (typeof languages)[number]["code"];

export function LanguageSwitcher() {
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("uz");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("cuddy-language") as LanguageCode | null;
    const nextLanguage: LanguageCode = languages.some((language) => language.code === savedLanguage)
      ? (savedLanguage as LanguageCode)
      : "uz";

    setActiveLanguage(nextLanguage);
    document.documentElement.lang = nextLanguage;
  }, []);

  function updateLanguage(language: LanguageCode) {
    setActiveLanguage(language);
    localStorage.setItem("cuddy-language", language);
    document.documentElement.lang = language;
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-ink/10 bg-panel p-1" aria-label="Tilni tanlash">
      {languages.map((language) => (
        <button
          key={language.code}
          className={`h-8 rounded-full px-2.5 text-xs font-black transition ${
            activeLanguage === language.code ? "bg-ink text-white" : "text-ink/55 hover:bg-white hover:text-ink"
          }`}
          type="button"
          onClick={() => updateLanguage(language.code)}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}

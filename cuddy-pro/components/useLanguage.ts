"use client";

import { useEffect, useState } from "react";
import { getSavedLanguage, type LanguageCode, uiText } from "@/lib/i18n";

export function useLanguage() {
  const [language, setLanguageState] = useState<LanguageCode>("uz");

  useEffect(() => {
    const savedLanguage = getSavedLanguage(localStorage.getItem("cuddy-language"));
    setLanguageState(savedLanguage);
    document.documentElement.lang = savedLanguage;

    function syncLanguage(event: Event) {
      const customEvent = event as CustomEvent<LanguageCode>;
      setLanguageState(customEvent.detail);
      document.documentElement.lang = customEvent.detail;
    }

    window.addEventListener("cuddy-language-change", syncLanguage);
    return () => window.removeEventListener("cuddy-language-change", syncLanguage);
  }, []);

  function setLanguage(nextLanguage: LanguageCode) {
    localStorage.setItem("cuddy-language", nextLanguage);
    document.documentElement.lang = nextLanguage;
    setLanguageState(nextLanguage);
    window.dispatchEvent(new CustomEvent("cuddy-language-change", { detail: nextLanguage }));
  }

  function t(key: keyof (typeof uiText)["uz"]) {
    return uiText[language][key] ?? uiText.uz[key];
  }

  return { language, setLanguage, t };
}

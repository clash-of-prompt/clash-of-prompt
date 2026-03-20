"use client";

import { useI18n } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-dim">{t.language}:</span>
      <button
        onClick={() => setLocale("en")}
        className={`px-2 py-0.5 ${
          locale === "en"
            ? "text-green glow-green border border-[var(--green)]"
            : "text-dim border border-[var(--dim)] hover:text-green hover:border-[var(--green-dim)]"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("id")}
        className={`px-2 py-0.5 ${
          locale === "id"
            ? "text-green glow-green border border-[var(--green)]"
            : "text-dim border border-[var(--dim)] hover:text-green hover:border-[var(--green-dim)]"
        }`}
      >
        ID
      </button>
    </div>
  );
}

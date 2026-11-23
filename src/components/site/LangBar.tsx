"use client";

import { Languages } from "lucide-react";
import { LANGS } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

/** All five languages, always visible: English, Pidgin, Yorùbá, Hausa, Igbo. */
export function LangBar() {
  const [lang, setLang] = useLang();
  return (
    <div className="border-b border-emerald-900/80 bg-[#04130e]">
      <div role="group" aria-label="Language" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center gap-1.5 overflow-x-auto">
        <Languages className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden />
        {LANGS.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => setLang(l.key)}
            aria-pressed={lang === l.key}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition ${lang === l.key ? "bg-amber-400 text-stone-950 border-amber-400" : "border-emerald-800 text-emerald-100 hover:border-amber-400"}`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Lang } from "@/lib/i18n";

type Props = {
  lang: Lang;
  onChange: (lang: Lang) => void;
};

export default function LangToggle({ lang, onChange }: Props) {
  return (
    <div className="flex rounded-full p-0.5 border border-white/15 bg-black/30 text-[0.7rem] font-bold">
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`px-2.5 py-1 rounded-full transition ${
          lang === "en"
            ? "bg-gradient-to-br from-[#E22227] to-[#C7080C] text-white"
            : "text-[#B9C3C9]"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange("sw")}
        className={`px-2.5 py-1 rounded-full transition ${
          lang === "sw"
            ? "bg-gradient-to-br from-[#E22227] to-[#C7080C] text-white"
            : "text-[#B9C3C9]"
        }`}
      >
        SW
      </button>
    </div>
  );
}

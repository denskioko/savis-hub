"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import LangToggle from "@/components/LangToggle";
import { t, getLang, setLang, type Lang } from "@/lib/i18n";

type Profile = {
  full_name: string | null;
  role: string | null;
  email: string | null;
};

export default function ProfessionalPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(getLang());
  }, []);

  function switchLang(l: Lang) {
    setLang(l);
    setLangState(l);
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, role, email")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(
        data || {
          full_name: user.user_metadata?.full_name || "Friend",
          role: user.user_metadata?.role || "professional",
          email: user.email || null,
        }
      );
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[#B9C3C9]">{t("loading", lang)}</p>
      </main>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Friend";

  return (
    <main className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[rgba(34,43,49,0.8)] backdrop-blur-md">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <LangToggle lang={lang} onChange={switchLang} />
          <span className="text-xs font-bold px-3 py-1.5 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.35)]">
            Professional
          </span>
          <button
            onClick={handleLogout}
            className="text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 text-[#B9C3C9] hover:text-white"
          >
            {t("log.out", lang)}
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5">
        <p className="text-[#B9C3C9] text-sm">{t("welcome.back", lang)}</p>
        <h1 className="text-3xl font-extrabold mb-1 tracking-tight">
          {firstName}
        </h1>
        <p className="text-[#B9C3C9] text-sm mb-5">
          {lang === "sw"
            ? "Simamia ushauri na wateja wako"
            : "Manage consultations and clients"}
        </p>

        {/* Verification banner */}
        <div className="p-4 rounded-[18px] border border-[rgba(245,196,81,0.45)] bg-[rgba(245,196,81,0.12)] mb-5">
          <p className="text-sm font-semibold text-[#F5C451]">
            {lang === "sw"
              ? "🔒 Leseni yako inakaguliwa. Utaonekana kwa wateja baada ya kuidhinishwa."
              : "🔒 Your licence is being verified. You appear to clients only after approval."}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { value: "0", label: lang === "sw" ? "Wateja" : "Clients" },
            { value: "KSh 0", label: lang === "sw" ? "Mapato" : "Earned" },
            { value: "—", label: lang === "sw" ? "Rating" : "Rating" },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center p-3.5 rounded-[18px] border border-white/10 bg-[rgba(34,43,49,0.72)]"
            >
              <b className="block text-lg text-[#F5C451]">{s.value}</b>
              <span className="text-[0.7rem] text-[#B9C3C9] font-semibold">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Consultation requests */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-4">
          <h2 className="font-bold mb-3">
            {lang === "sw" ? "Maombi ya ushauri" : "Consultation requests"}
          </h2>
          <p className="text-sm text-[#B9C3C9]">
            {lang === "sw"
              ? "Hakuna maombi bado. Wateja watakuona baada ya leseni yako kuidhinishwa."
              : "No requests yet. Clients will see you after your licence is approved."}
          </p>
        </div>

        {/* Verification checklist */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-6">
          <h2 className="font-bold mb-3">
            {lang === "sw" ? "Orodha ya uthibitisho" : "Verification checklist"}
          </h2>
          {[
            lang === "sw" ? "Nambari ya leseni" : "Licence number",
            lang === "sw" ? "ID na selfie" : "ID and selfie",
            lang === "sw" ? "Cheti cha kitaaluma" : "Professional certificate",
          ].map((item) => (
            <div
              key={item}
              className="flex justify-between items-center py-2.5 border-t border-white/10 first:border-0"
            >
              <span className="text-sm">{item}</span>
              <span className="text-[0.7rem] font-bold px-2.5 py-1 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.4)]">
                {lang === "sw" ? "Inasubiri" : "Pending"}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#55666E] mb-4">
          {lang === "sw"
            ? "Prototype · Uthibitisho wa leseni utakuja baadaye"
            : "Prototype · Full licence verification comes later"}
        </p>

        <Link href="/">
          <Button variant="outline" full>
            {t("switch.role", lang)}
          </Button>
        </Link>
      </div>
    </main>
  );
}

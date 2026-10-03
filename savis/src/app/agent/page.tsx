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

export default function AgentPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLangState] = useState<Lang>("en");
  const [copied, setCopied] = useState(false);

  // Simple referral code from name/email for prototype
  const [refCode, setRefCode] = useState("SAVIS-AGENT");

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

      const p =
        data || {
          full_name: user.user_metadata?.full_name || "Friend",
          role: user.user_metadata?.role || "agent",
          email: user.email || null,
        };
      setProfile(p);

      const base = (p.full_name || "AGENT")
        .split(" ")[0]
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 6);
      setRefCode(`SAVIS-${base || "AGENT"}`);

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

  function copyCode() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(refCode).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            Agent
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
            ? "Pata kamisheni kwa kurejelea wateja na watoa huduma"
            : "Earn commissions by referring clients and providers"}
        </p>

        {/* Referral code card */}
        <div
          className="p-5 rounded-[20px] border border-[rgba(245,196,81,0.35)] mb-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(108,1,2,0.85), rgba(34,43,49,0.9))",
          }}
        >
          <p className="text-xs font-bold text-[#F5C451] mb-1">
            {lang === "sw" ? "Nambari yako ya referral" : "Your referral code"}
          </p>
          <div className="flex items-center justify-between gap-3">
            <code className="text-xl font-extrabold tracking-wider">
              {refCode}
            </code>
            <button
              onClick={copyCode}
              className="text-xs font-bold px-4 py-2 rounded-full text-white shrink-0"
              style={{
                background: "linear-gradient(135deg, #E22227, #C7080C)",
              }}
            >
              {copied
                ? lang === "sw"
                  ? "Imenakiliwa!"
                  : "Copied!"
                : lang === "sw"
                  ? "Nakili"
                  : "Copy"}
            </button>
          </div>
          <p className="text-xs text-[#e6d9da] mt-3">
            {lang === "sw"
              ? "Shiriki nambari hii. Unapata kamisheni wateja wanapojisajili na kukamilisha kazi."
              : "Share this code. You earn when people sign up and complete jobs."}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            {
              value: "0",
              label: lang === "sw" ? "Waliojisajili" : "Sign-ups",
            },
            {
              value: "0",
              label: lang === "sw" ? "Kazi" : "Jobs",
            },
            {
              value: "KSh 0",
              label: lang === "sw" ? "Kamisheni" : "Commission",
            },
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

        {/* How agents earn */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-4">
          <h2 className="font-bold mb-3">
            {lang === "sw" ? "Jinsi unavyopata" : "How you earn"}
          </h2>
          <div className="space-y-3">
            {[
              {
                n: "1",
                t:
                  lang === "sw"
                    ? "Shiriki nambari yako"
                    : "Share your code",
                d:
                  lang === "sw"
                    ? "Tuma kwa marafiki, WhatsApp, au mitandao"
                    : "Send via WhatsApp, social media, or in person",
              },
              {
                n: "2",
                t:
                  lang === "sw"
                    ? "Wao wajisajili na SAVIS"
                    : "They join SAVIS",
                d:
                  lang === "sw"
                    ? "Kama Consumer, Provider, au Seller"
                    : "As Consumer, Provider, or Seller",
              },
              {
                n: "3",
                t:
                  lang === "sw"
                    ? "Pata kamisheni"
                    : "Earn commission",
                d:
                  lang === "sw"
                    ? "Unapata sehemu ndogo wakati kazi inakamilika"
                    : "You get a small share when jobs complete",
              },
            ].map((s) => (
              <div key={s.n} className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #E22227, #C7080C)",
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <strong className="text-sm">{s.t}</strong>
                  <p className="text-xs text-[#B9C3C9]">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent referrals */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-6">
          <h2 className="font-bold mb-3">
            {lang === "sw" ? "Marejeleo ya hivi karibuni" : "Recent referrals"}
          </h2>
          <p className="text-sm text-[#B9C3C9]">
            {lang === "sw"
              ? "Hakuna bado. Anza kushiriki nambari yako."
              : "None yet. Start sharing your code."}
          </p>
        </div>

        <p className="text-center text-xs text-[#55666E] mb-4">
          {lang === "sw"
            ? "Prototype · Kamisheni halisi itakuja baadaye"
            : "Prototype · Real commissions come later"}
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

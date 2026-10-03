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

const SAMPLE_PRODUCTS = [
  { id: 1, name: "Cement (50kg)", price: 850, stock: 120, unit: "bag" },
  { id: 2, name: "Iron sheets (gauge 28)", price: 1200, stock: 45, unit: "sheet" },
  { id: 3, name: "Paint (20L white)", price: 4500, stock: 18, unit: "tin" },
];

export default function SellerPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const [lang, setLangState] = useState<Lang>("en");
  const [toast, setToast] = useState<string | null>(null);

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
          role: user.user_metadata?.role || "seller",
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

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
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
            Seller
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
            ? "Simamia duka na oda zako"
            : "Manage your shop and orders"}
        </p>

        {/* Shop open toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-full border border-white/10 bg-[rgba(34,43,49,0.72)] mb-5"
        >
          <strong className="text-sm">
            {open
              ? lang === "sw"
                ? "Duka limefunguliwa"
                : "Shop is open"
              : lang === "sw"
                ? "Duka limefungwa"
                : "Shop is closed"}
          </strong>
          <span
            className={`w-11 h-6 rounded-full relative transition ${
              open ? "bg-[#E22227]" : "bg-[#55666E]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
                open ? "left-5" : "left-0.5"
              }`}
            />
          </span>
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            {
              value: String(SAMPLE_PRODUCTS.length),
              label: lang === "sw" ? "Bidhaa" : "Products",
            },
            {
              value: "0",
              label: lang === "sw" ? "Oda mpya" : "New orders",
            },
            {
              value: "KSh 0",
              label: lang === "sw" ? "Mauzo" : "Sales",
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

        {/* Sample products */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold">
              {lang === "sw" ? "Bidhaa zako" : "Your products"}
            </h2>
            <button
              onClick={() =>
                showToast(
                  lang === "sw"
                    ? "Kuongeza bidhaa kunakuja"
                    : "Add product coming soon"
                )
              }
              className="text-xs font-bold text-[#F5C451]"
            >
              + {lang === "sw" ? "Ongeza" : "Add"}
            </button>
          </div>
          <div className="space-y-2">
            {SAMPLE_PRODUCTS.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-2.5 border-t border-white/10 first:border-0"
              >
                <div>
                  <strong className="text-sm">{p.name}</strong>
                  <small className="block text-xs text-[#B9C3C9]">
                    {p.stock} {p.unit}s in stock
                  </small>
                </div>
                <span className="text-sm font-bold text-[#F5C451]">
                  KSh {p.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-4">
          <h2 className="font-bold mb-3">
            {lang === "sw" ? "Oda mpya" : "New orders"}
          </h2>
          <p className="text-sm text-[#B9C3C9]">
            {lang === "sw"
              ? "Hakuna oda bado. Wanunuzi wataonekana hapa."
              : "No orders yet. Buyers will appear here."}
          </p>
        </div>

        {/* Shop verification */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-6">
          <h2 className="font-bold mb-3">
            {lang === "sw" ? "Uthibitisho wa duka" : "Shop verification"}
          </h2>
          {[
            lang === "sw" ? "Jina la biashara" : "Business name",
            lang === "sw" ? "Mahali / eneo" : "Location",
            lang === "sw" ? "M-Pesa / bank" : "M-Pesa / bank details",
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
            ? "Prototype · Oda halisi na malipo yanakuja"
            : "Prototype · Real orders and payments come later"}
        </p>

        <Link href="/">
          <Button variant="outline" full>
            {t("switch.role", lang)}
          </Button>
        </Link>
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 px-4 py-2.5 rounded-xl bg-[#222B31] border border-white/15 text-sm shadow-xl">
          {toast}
        </div>
      )}
    </main>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
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

const CATEGORIES = [
  { id: "all", name: "All", icon: "✨" },
  { id: "Plumbing", name: "Plumbing", icon: "🔧" },
  { id: "Masonry", name: "Mason", icon: "🧱" },
  { id: "Electrical", name: "Electrical", icon: "⚡" },
  { id: "Tailoring", name: "Tailor", icon: "🧵" },
  { id: "Cleaning", name: "Cleaning", icon: "🧹" },
  { id: "Carpentry", name: "Carpentry", icon: "🪚" },
  { id: "Painting", name: "Painting", icon: "🎨" },
  { id: "Photography", name: "Photo", icon: "📷" },
];

const SAMPLE_PROVIDERS = [
  {
    id: 1,
    name: "James Otieno",
    skill: "Plumbing",
    area: "Westlands",
    km: 1.2,
    rate: 1500,
    rating: 4.9,
    reviews: 87,
    icon: "🔧",
    available: "Available today",
    tags: ["M-Pesa"],
  },
  {
    id: 2,
    name: "Peter Kamau",
    skill: "Masonry",
    area: "Kilimani",
    km: 2.4,
    rate: 2000,
    rating: 4.7,
    reviews: 42,
    icon: "🧱",
    available: "This week",
    tags: ["Cash", "M-Pesa"],
  },
  {
    id: 3,
    name: "Grace Wanjiku",
    skill: "Tailoring",
    area: "Parklands",
    km: 0.8,
    rate: 800,
    rating: 5.0,
    reviews: 63,
    icon: "✂️",
    available: "Available now",
    tags: ["M-Pesa"],
  },
  {
    id: 4,
    name: "Brian Mutua",
    skill: "Electrical",
    area: "Ruaka",
    km: 3.1,
    rate: 1800,
    rating: 4.8,
    reviews: 54,
    icon: "⚡",
    available: "Available today",
    tags: ["M-Pesa"],
  },
  {
    id: 5,
    name: "Amina Hassan",
    skill: "Cleaning",
    area: "Eastleigh",
    km: 1.9,
    rate: 1200,
    rating: 4.6,
    reviews: 31,
    icon: "🧹",
    available: "Available now",
    tags: ["M-Pesa"],
  },
  {
    id: 6,
    name: "Samuel Kiptoo",
    skill: "Carpentry",
    area: "Kasarani",
    km: 4.2,
    rate: 2500,
    rating: 4.5,
    reviews: 28,
    icon: "🪚",
    available: "This week",
    tags: ["Cash", "M-Pesa"],
  },
  {
    id: 7,
    name: "Lucy Njeri",
    skill: "Painting",
    area: "Westlands",
    km: 1.5,
    rate: 1600,
    rating: 4.9,
    reviews: 39,
    icon: "🎨",
    available: "Available today",
    tags: ["M-Pesa"],
  },
  {
    id: 8,
    name: "David Ochieng",
    skill: "Photography",
    area: "Kilimani",
    km: 2.0,
    rate: 3000,
    rating: 4.8,
    reviews: 71,
    icon: "📷",
    available: "This week",
    tags: ["M-Pesa"],
  },
];

export default function ConsumerPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
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
          role: user.user_metadata?.role || "consumer",
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

  // Filter providers by category + search text
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SAMPLE_PROVIDERS.filter((p) => {
      const matchCategory =
        activeCategory === "all" || p.skill === activeCategory;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.skill.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    }).sort((a, b) => a.km - b.km);
  }, [search, activeCategory]);

  function handleContact(id: number) {
    router.push(`/consumer/provider/${id}`);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[#B9C3C9]">Loading…</p>
      </main>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Friend";

  return (
    <main className="min-h-screen pb-28">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[rgba(34,43,49,0.8)] backdrop-blur-md">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <LangToggle lang={lang} onChange={switchLang} />
          <span className="text-xs font-bold px-3 py-1.5 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.35)]">
            Consumer
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
        {/* Welcome */}
        <p className="text-[#B9C3C9] text-sm">{t("welcome.back", lang)}</p>
        <h1 className="text-3xl font-extrabold mb-1 tracking-tight">
          {firstName}
        </h1>
        <p className="text-[#B9C3C9] text-sm mb-5">
          {t("find.help", lang)}
        </p>

        {/* Search box */}
        <div className="flex gap-2 p-1.5 rounded-full bg-white shadow-xl mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 px-4 py-3 text-[#222B31] outline-none rounded-full text-[0.95rem]"
            placeholder={t("search.placeholder", lang)}
          />
          <button
            className="px-5 py-3 rounded-full font-bold text-white text-sm whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #E22227, #C7080C)",
              boxShadow: "0 8px 24px rgba(226, 34, 39, 0.45)",
            }}
          >
            🔍 {t("search", lang)}
          </button>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-[#B9C3C9] mb-5 px-1">
          <span>📍</span>
          <span>{t("nairobi.sample", lang)}</span>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-1 px-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl border text-xs font-bold transition ${
                activeCategory === cat.id
                  ? "border-[#E22227] bg-[rgba(226,34,39,0.2)] text-white"
                  : "border-white/10 bg-[rgba(34,43,49,0.72)] text-[#B9C3C9]"
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-extrabold text-lg">
            {search || activeCategory !== "all"
              ? `${t("results", lang)} (${filtered.length})`
              : t("near.you", lang)}
          </h2>
          {(search || activeCategory !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="text-xs font-bold text-[#F5C451]"
            >
              {t("clear", lang)}
            </button>
          )}
        </div>

        {/* Provider list */}
        <div className="space-y-3.5">
          {filtered.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-[20px] border border-dashed border-white/15 bg-[rgba(34,43,49,0.5)]">
              <p className="text-[#B9C3C9] text-sm">
                {t("nothing.found", lang)}
              </p>
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="flex gap-3.5 p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)]"
              >
                <div
                  className="w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl shrink-0 relative"
                  style={{
                    background: "linear-gradient(135deg, #6C0102, #C7080C)",
                  }}
                >
                  {p.icon}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#34D399] text-[#06281c] text-[10px] font-extrabold flex items-center justify-center border-2 border-[#222B31]">
                    ✓
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{p.name}</div>
                  <div className="text-xs text-[#B9C3C9] mb-2">
                    {p.skill} · {p.km} km · {p.area}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    <span className="text-[0.7rem] font-semibold px-2.5 py-1 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.35)]">
                      {t("from.ksh", lang)} {p.rate.toLocaleString()}
                    </span>
                    <span className="text-[0.7rem] font-semibold px-2.5 py-1 rounded-full text-[#B9C3C9] bg-white/5 border border-white/10">
                      {p.available}
                    </span>
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[0.7rem] font-semibold px-2.5 py-1 rounded-full text-[#B9C3C9] bg-white/5 border border-white/10"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">
                      ★ {p.rating}{" "}
                      <span className="text-[#B9C3C9] font-normal">
                        ({p.reviews})
                      </span>
                    </span>
                    <button
                      onClick={() => handleContact(p.id)}
                      className="text-xs font-bold px-4 py-2 rounded-full text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #E22227, #C7080C)",
                      }}
                    >
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>


        {/* How SAVIS Works */}
        <div className="mt-8 mb-4">
          <h2 className="font-extrabold text-lg mb-4">
            {lang === "sw" ? "Jinsi SAVIS Inavyofanya Kazi" : "How SAVIS Works"}
          </h2>
          <div className="space-y-3">
            {[
              {
                n: "1",
                title: lang === "sw" ? "Tuambie unachohitaji" : "Tell us what you need",
                desc: lang === "sw"
                  ? "Tafuta au chagua kategoria. Tunaonyesha watoa huduma karibu nawe."
                  : "Search or choose a category. We show providers near you.",
              },
              {
                n: "2",
                title: lang === "sw" ? "Linganisha na uchague" : "Compare & choose",
                desc: lang === "sw"
                  ? "Angalia bei, rating, upatikanaji na umbali. Wasiliana au book."
                  : "See rates, ratings, availability and distance. Contact or book.",
              },
              {
                n: "3",
                title: lang === "sw" ? "Lipa salama kupitia SAVIS Wallet" : "Pay safely via SAVIS Wallet",
                desc: lang === "sw"
                  ? "Pesa zinashikiliwa salama. Mtoa huduma analipwa baada ya kazi kukamilika."
                  : "Money is held securely. Provider gets paid after the job is done.",
              },
              {
                n: "4",
                title: lang === "sw" ? "Toa rating na maoni" : "Rate & review",
                desc: lang === "sw"
                  ? "Saidia jamii kwa kushiriki uzoefu wako."
                  : "Help the community by sharing your experience.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="flex gap-3.5 p-3.5 rounded-[18px] border border-white/10 bg-[rgba(34,43,49,0.72)]"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold text-white shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #E22227, #C7080C)",
                    boxShadow: "0 4px 14px rgba(226, 34, 39, 0.4)",
                  }}
                >
                  {step.n}
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-0.5">{step.title}</h3>
                  <p className="text-xs text-[#B9C3C9] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* SAVIS Wallet banner */}
        <div
          className="mt-5 mb-2 p-5 rounded-[20px] border border-[rgba(245,196,81,0.35)]"
          style={{
            background: "linear-gradient(135deg, rgba(108,1,2,0.9), rgba(34,43,49,0.9))",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <h3 className="font-extrabold text-base mb-1">
            {lang === "sw" ? "💰 SAVIS Wallet" : "💰 SAVIS Wallet"}
          </h3>
          <p className="text-sm text-[#e6d9da] mb-3 leading-relaxed">
            {lang === "sw"
              ? "Pesa zinashikiliwa salama hadi kazi ikamilike. Platform inachukua kamisheni ndogo. Kila mtu analindwa."
              : "Money is held safely until the job is completed. Platform takes a small fair commission. Everyone is protected."}
          </p>
          <div className="flex flex-wrap gap-2">
            {(lang === "sw"
              ? ["M-Pesa tayari", "Escrow salama", "Kamisheni ya haki"]
              : ["M-Pesa ready", "Secure escrow", "Fair commission"]
            ).map((f) => (
              <span
                key={f}
                className="text-[0.72rem] font-bold px-3 py-1.5 rounded-full text-[#F5C451] bg-black/30 border border-[rgba(245,196,81,0.4)]"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-[#55666E] mt-6 mb-2">
          {t("sample.note", lang)}
        </p>
      </div>

      

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
        <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-1 rounded-full border border-white/10 bg-[rgba(34,43,49,0.9)] backdrop-blur-lg shadow-2xl">
          <button className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-white bg-gradient-to-br from-[#E22227] to-[#C7080C] text-[0.65rem] font-bold">
            <span className="text-base">🏠</span>
            Home
          </button>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              document.querySelector<HTMLInputElement>("input")?.focus();
            }}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-[#B9C3C9] text-[0.65rem] font-bold"
          >
            <span className="text-base">🔍</span>
            Search
          </button>
          <Link
            href="/bookings"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-[#B9C3C9] text-[0.65rem] font-bold"
          >
            <span className="text-base">📋</span>
            Bookings
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-[#B9C3C9] text-[0.65rem] font-bold"
          >
            <span className="text-base">👤</span>
            Profile
          </Link>
        </div>
      </nav>
    </main>
  );
}

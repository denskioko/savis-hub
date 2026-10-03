"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AccountMenu from "@/components/AccountMenu";
import LangToggle from "@/components/LangToggle";
import { t, getLang, setLang, type Lang } from "@/lib/i18n";

type Profile = { full_name: string | null; role: string | null; email: string | null };

const CATEGORIES = [
  ["all", "All", "✨"], ["Plumbing", "Plumbing", "🔧"], ["Masonry", "Mason", "🧱"],
  ["Electrical", "Electrical", "⚡"], ["Tailoring", "Tailor", "🧵"], ["Cleaning", "Cleaning", "🧹"],
  ["Carpentry", "Carpentry", "🪚"], ["Painting", "Painting", "🎨"], ["Photography", "Photo", "📷"],
];

const PROVIDERS = [
  { id: 1, name: "James Otieno", skill: "Plumbing", area: "Westlands", km: 1.2, rate: 1500, rating: 4.9, reviews: 87, icon: "🔧", available: "Available today", tags: ["M-Pesa"] },
  { id: 2, name: "Peter Kamau", skill: "Masonry", area: "Kilimani", km: 2.4, rate: 2000, rating: 4.7, reviews: 42, icon: "🧱", available: "This week", tags: ["Cash", "M-Pesa"] },
  { id: 3, name: "Grace Wanjiku", skill: "Tailoring", area: "Parklands", km: 0.8, rate: 800, rating: 5.0, reviews: 63, icon: "✂️", available: "Available now", tags: ["M-Pesa"] },
  { id: 4, name: "Brian Mutua", skill: "Electrical", area: "Ruaka", km: 3.1, rate: 1800, rating: 4.8, reviews: 54, icon: "⚡", available: "Available today", tags: ["M-Pesa"] },
  { id: 5, name: "Amina Hassan", skill: "Cleaning", area: "Eastleigh", km: 1.9, rate: 1200, rating: 4.6, reviews: 31, icon: "🧹", available: "Available now", tags: ["M-Pesa"] },
  { id: 6, name: "Samuel Kiptoo", skill: "Carpentry", area: "Kasarani", km: 4.2, rate: 2500, rating: 4.5, reviews: 28, icon: "🪚", available: "This week", tags: ["Cash", "M-Pesa"] },
  { id: 7, name: "Lucy Njeri", skill: "Painting", area: "Westlands", km: 1.5, rate: 1600, rating: 4.9, reviews: 39, icon: "🎨", available: "Available today", tags: ["M-Pesa"] },
  { id: 8, name: "David Ochieng", skill: "Photography", area: "Kilimani", km: 2.0, rate: 3000, rating: 4.8, reviews: 71, icon: "📷", available: "This week", tags: ["M-Pesa"] },
];

export default function ConsumerPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => setLangState(getLang()), []);

  function switchLang(next: Lang) {
    setLang(next);
    setLangState(next);
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data } = await supabase.from("profiles").select("full_name, role, email").eq("id", user.id).maybeSingle();
      setProfile(data || {
        full_name: user.user_metadata?.full_name || "Friend",
        role: user.user_metadata?.role || "consumer",
        email: user.email || null,
      });
      setLoading(false);
    }
    load();
  }, [router]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PROVIDERS.filter((p) => {
      const categoryMatch = activeCategory === "all" || p.skill === activeCategory;
      const searchMatch = !q || [p.name, p.skill, p.area].some((value) => value.toLowerCase().includes(q));
      return categoryMatch && searchMatch;
    }).sort((a, b) => a.km - b.km);
  }, [search, activeCategory]);

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><p className="text-[#B9C3C9]">Loading…</p></main>;
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Friend";

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(34,43,49,0.86)] px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <Link href="/consumer" aria-label="SAVIS home" className="font-extrabold tracking-tight text-xl">SAVIS</Link>
          <div className="flex items-center gap-2">
            <LangToggle lang={lang} onChange={switchLang} />
            <AccountMenu name={profile?.full_name || "Account"} role={profile?.role || "consumer"} homeHref="/consumer" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-5">
        <section className="mb-5 rounded-[22px] border border-white/10 bg-[rgba(34,43,49,0.72)] p-4">
          <p className="text-sm text-[#B9C3C9]">{t("welcome.back", lang)}</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Hi, {firstName} 👋</h1>
              <p className="mt-1 text-sm text-[#B9C3C9]">{t("find.help", lang)}</p>
            </div>
            <Link href="/profile" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E22227] to-[#C7080C] text-sm font-extrabold">
              {firstName.charAt(0).toUpperCase()}
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Link href="/bookings" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 font-bold">📋 Bookings</Link>
            <Link href="/messages" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 font-bold">💬 Messages</Link>
            <Link href="/profile" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 font-bold">💰 Wallet</Link>
          </div>
        </section>

        <section className="mb-5">
          <div className="flex gap-2 rounded-full bg-white p-1.5 shadow-xl">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 flex-1 rounded-full px-4 py-3 text-[0.95rem] text-[#222B31] outline-none"
              placeholder={t("search.placeholder", lang)}
            />
            <button type="button" onClick={() => document.getElementById("nearby-results")?.scrollIntoView({ behavior: "smooth" })} className="whitespace-nowrap rounded-full bg-gradient-to-br from-[#E22227] to-[#C7080C] px-5 py-3 text-sm font-bold text-white">
              🔍 {t("search", lang)}
            </button>
          </div>
          <button type="button" className="mt-3 flex items-center gap-2 px-1 text-sm text-[#B9C3C9]">
            <span>📍</span><span>Nairobi</span><span className="text-[#F5C451]">·</span><span className="text-[#F5C451]">Change location</span>
          </button>
        </section>

        <section className="mb-5 overflow-hidden rounded-[20px] border border-[rgba(245,196,81,0.28)] bg-gradient-to-br from-[rgba(108,1,2,0.92)] to-[rgba(34,43,49,0.92)] p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-[#F5C451]">Sponsored</span>
            <span className="text-xs text-[#B9C3C9]">Local business</span>
          </div>
          <h2 className="text-lg font-extrabold">Reach more customers with SAVIS</h2>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#e6d9da]">Promote a trusted local service or shop to people searching nearby.</p>
          <button type="button" className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#6C0102]">View ad</button>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-lg">Categories</h2>
            <span className="text-xs text-[#B9C3C9]">Popular near you</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(([id, name, icon]) => (
              <button key={id} type="button" onClick={() => setActiveCategory(id)} className={\`flex min-w-[76px] shrink-0 flex-col items-center gap-1 rounded-2xl border px-3 py-2.5 text-xs font-bold transition \${activeCategory === id ? "border-[#E22227] bg-[rgba(226,34,39,0.2)] text-white" : "border-white/10 bg-[rgba(34,43,49,0.72)] text-[#B9C3C9]"}\`}>
                <span className="text-lg">{icon}</span><span>{name}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="nearby-results" className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-lg">{search || activeCategory !== "all" ? \`Results (\${filtered.length})\` : "People near you"}</h2>
              <p className="mt-0.5 text-xs text-[#B9C3C9]">Trusted local providers</p>
            </div>
            {(search || activeCategory !== "all") && <button type="button" onClick={() => { setSearch(""); setActiveCategory("all"); }} className="text-xs font-bold text-[#F5C451]">{t("clear", lang)}</button>}
          </div>

          <div className="space-y-3.5">
            {filtered.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-white/15 bg-[rgba(34,43,49,0.5)] px-4 py-10 text-center">
                <p className="text-sm text-[#B9C3C9]">{t("nothing.found", lang)}</p>
              </div>
            ) : filtered.map((p) => (
              <div key={p.id} className="rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] p-4">
                <div className="flex gap-3.5">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#6C0102] to-[#C7080C] text-2xl">
                    {p.icon}
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#222B31] bg-[#34D399] text-[10px] font-extrabold text-[#06281c]">✓</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold">{p.name}</div>
                        <div className="mb-2 text-xs text-[#B9C3C9]">{p.skill} · {p.km} km · {p.area}</div>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-[#34D399]">Verified</span>
                    </div>
                    <div className="mb-2.5 flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-[rgba(245,196,81,0.35)] bg-[rgba(245,196,81,0.12)] px-2.5 py-1 text-[0.7rem] font-semibold text-[#F5C451]">{t("from.ksh", lang)} {p.rate.toLocaleString()}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.7rem] font-semibold text-[#B9C3C9]">{p.available}</span>
                      {p.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.7rem] font-semibold text-[#B9C3C9]">{tag}</span>)}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">★ {p.rating} <span className="font-normal text-[#B9C3C9]">({p.reviews})</span></span>
                      <Link href={\`/consumer/provider/\${p.id}\`} className="rounded-full bg-gradient-to-br from-[#E22227] to-[#C7080C] px-4 py-2 text-xs font-bold text-white">View profile</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-lg">Recommended for you</h2>
            <span className="text-xs text-[#B9C3C9]">Based on activity</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-[rgba(34,43,49,0.72)] p-4">
              <span className="text-xl">⚡</span><h3 className="mt-2 text-sm font-extrabold">Electrical help nearby</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#B9C3C9]">Providers available around Nairobi.</p>
              <button type="button" onClick={() => setActiveCategory("Electrical")} className="mt-3 text-xs font-extrabold text-[#F5C451]">Explore →</button>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-[rgba(34,43,49,0.72)] p-4">
              <span className="text-xl">🧹</span><h3 className="mt-2 text-sm font-extrabold">Home cleaning</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#B9C3C9]">Find available cleaners near you.</p>
              <button type="button" onClick={() => setActiveCategory("Cleaning")} className="mt-3 text-xs font-extrabold text-[#F5C451]">Explore →</button>
            </div>
          </div>
        </section>

        <p className="text-center text-xs leading-relaxed text-[#55666E]">Sample listings for the Alpha prototype · Real provider discovery comes next.</p>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto flex max-w-lg justify-around items-center rounded-full border border-white/10 bg-[rgba(34,43,49,0.9)] px-1 py-2 shadow-2xl backdrop-blur-lg">
          <Link href="/consumer" className="flex flex-col items-center gap-0.5 rounded-full bg-gradient-to-br from-[#E22227] to-[#C7080C] px-4 py-1.5 text-[0.65rem] font-bold text-white"><span className="text-base">🏠</span>Home</Link>
          <button type="button" onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); document.querySelector<HTMLInputElement>("input")?.focus(); }} className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-[0.65rem] font-bold text-[#B9C3C9]"><span className="text-base">🔍</span>Search</button>
          <Link href="/bookings" className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-[0.65rem] font-bold text-[#B9C3C9]"><span className="text-base">📋</span>Bookings</Link>
          <Link href="/messages" className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-[0.65rem] font-bold text-[#B9C3C9]"><span className="text-base">💬</span>Messages</Link>
          <Link href="/profile" className="hidden flex-col items-center gap-0.5 px-4 py-1.5 text-[0.65rem] font-bold text-[#B9C3C9] sm:flex"><span className="text-base">👤</span>Profile</Link>
        </div>
      </nav>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import Button from "@/components/Button";

type Profile = {
  full_name: string | null;
  role: string | null;
  email: string | null;
};

const sampleProviders = [
  {
    name: "James Otieno",
    skill: "Plumber",
    area: "Westlands",
    km: "1.2 km",
    rate: "From KSh 1,500",
    rating: "4.9 (87)",
    icon: "🔧",
  },
  {
    name: "Peter Kamau",
    skill: "Mason",
    area: "Kilimani",
    km: "2.4 km",
    rate: "From KSh 2,000",
    rating: "4.7 (42)",
    icon: "🧱",
  },
  {
    name: "Grace Wanjiku",
    skill: "Tailor",
    area: "Parklands",
    km: "0.8 km",
    rate: "From KSh 800",
    rating: "5.0 (63)",
    icon: "✂️",
  },
];

export default function ConsumerPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[#B9C3C9]">Loading…</p>
      </main>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Friend";

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[rgba(34,43,49,0.75)] backdrop-blur-md">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.35)]">
            Consumer
          </span>
          <button
            onClick={handleLogout}
            className="text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 text-[#B9C3C9] hover:text-white"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <p className="text-[#B9C3C9] text-sm">Welcome back,</p>
        <h1 className="text-3xl font-extrabold mb-2 tracking-tight">{firstName}</h1>
        <p className="text-[#B9C3C9] text-sm mb-6">
          Find help, goods & experts near you
        </p>

        {/* Search (visual for now) */}
        <div className="flex gap-2 p-1.5 rounded-full bg-white shadow-xl mb-6">
          <input
            className="flex-1 min-w-0 px-4 py-3 text-[#222B31] outline-none rounded-full"
            placeholder="Try: plumber, tailor, lawyer…"
          />
          <button
            className="px-5 py-3 rounded-full font-bold text-white text-sm whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #E22227, #C7080C)",
              boxShadow: "0 8px 24px rgba(226, 34, 39, 0.45)",
            }}
          >
            🔍 Search
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#B9C3C9] mb-8 px-1">
          <span>📍</span>
          <span>Nairobi · Sample listings</span>
        </div>

        <h2 className="font-extrabold text-lg mb-4">Near You</h2>

        <div className="space-y-4">
          {sampleProviders.map((p) => (
            <div
              key={p.name}
              className="flex gap-3.5 p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)]"
            >
              <div
                className="w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl shrink-0"
                style={{
                  background: "linear-gradient(135deg, #6C0102, #C7080C)",
                }}
              >
                {p.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold">{p.name}</div>
                <div className="text-xs text-[#B9C3C9] mb-2">
                  {p.skill} · {p.km} · {p.area}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="text-[0.7rem] font-semibold px-2.5 py-1 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.35)]">
                    {p.rate}
                  </span>
                  <span className="text-[0.7rem] font-semibold px-2.5 py-1 rounded-full text-[#B9C3C9] bg-white/5 border border-white/10">
                    Available today
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">★ {p.rating}</span>
                  <button
                    className="text-xs font-bold px-4 py-2 rounded-full text-white"
                    style={{
                      background: "linear-gradient(135deg, #E22227, #C7080C)",
                    }}
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#55666E] mt-6 mb-4">
          Sample listings for the prototype · Real providers come next
        </p>

        <Link href="/">
          <Button variant="outline" full>
            Switch role / Home
          </Button>
        </Link>
      </div>
    </main>
  );
}

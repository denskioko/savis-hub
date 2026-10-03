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

export default function ProfilePage() {
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

  const role = profile?.role || "consumer";
  const homeMap: Record<string, string> = {
      provider: "/provider",
      professional: "/professional",
      seller: "/seller",
      agent: "/agent",
      consumer: "/consumer",
    };
  const homeHref = homeMap[role] || "/consumer";

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[rgba(34,43,49,0.8)] backdrop-blur-md">
        <Logo size="sm" />
        <span className="text-xs font-bold px-3 py-1.5 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.35)]">
          Profile
        </span>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold text-white"
            style={{
              background: "linear-gradient(135deg, #E22227, #C7080C)",
            }}
          >
            {(profile?.full_name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-extrabold">
              {profile?.full_name || "User"}
            </h1>
            <p className="text-sm text-[#B9C3C9]">{profile?.email}</p>
            <span className="inline-block mt-1 text-[0.7rem] font-bold px-2.5 py-1 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.35)] capitalize">
              {role}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <Link
            href={homeHref}
            className="flex items-center justify-between p-4 rounded-[18px] border border-white/10 bg-[rgba(34,43,49,0.72)]"
          >
            <span className="font-bold text-sm">Go to my home</span>
            <span className="text-[#B9C3C9]">→</span>
          </Link>

          <Link
            href="/bookings"
            className="flex items-center justify-between p-4 rounded-[18px] border border-white/10 bg-[rgba(34,43,49,0.72)]"
          >
            <span className="font-bold text-sm">My bookings</span>
            <span className="text-[#B9C3C9]">→</span>
          </Link>

          <Link
            href="/"
            className="flex items-center justify-between p-4 rounded-[18px] border border-white/10 bg-[rgba(34,43,49,0.72)]"
          >
            <span className="font-bold text-sm">Switch role</span>
            <span className="text-[#B9C3C9]">→</span>
          </Link>
        </div>

        <Button variant="outline" full onClick={handleLogout}>
          Log out
        </Button>

        <p className="text-center text-xs text-[#55666E] mt-8">
          SAVIS prototype · No real payments yet
        </p>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
        <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-1 rounded-full border border-white/10 bg-[rgba(34,43,49,0.9)] backdrop-blur-lg shadow-2xl">
          <Link
            href={homeHref}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-[#B9C3C9] text-[0.65rem] font-bold"
          >
            <span className="text-base">🏠</span>
            Home
          </Link>
          <Link
            href={homeHref}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-[#B9C3C9] text-[0.65rem] font-bold"
          >
            <span className="text-base">🔍</span>
            Search
          </Link>
          <Link
            href="/bookings"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-[#B9C3C9] text-[0.65rem] font-bold"
          >
            <span className="text-base">📋</span>
            Bookings
          </Link>
          <button className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-white bg-gradient-to-br from-[#E22227] to-[#C7080C] text-[0.65rem] font-bold">
            <span className="text-base">👤</span>
            Profile
          </button>
        </div>
      </nav>
    </main>
  );
}

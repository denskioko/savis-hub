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
};

export default function ProviderPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);

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
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(
        data || {
          full_name: user.user_metadata?.full_name || "Friend",
          role: user.user_metadata?.role || "provider",
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
    <main className="min-h-screen pb-16">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[rgba(34,43,49,0.75)] backdrop-blur-md">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.35)]">
            Provider
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
        <h1 className="text-3xl font-extrabold mb-1 tracking-tight">{firstName}</h1>
        <p className="text-[#B9C3C9] text-sm mb-6">
          Manage your jobs and earnings
        </p>

        {/* Availability toggle */}
        <button
          type="button"
          onClick={() => setAvailable((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-full border border-white/10 bg-[rgba(34,43,49,0.72)] mb-6"
        >
          <strong className="text-sm">
            {available ? "I'm available for jobs" : "Not available right now"}
          </strong>
          <span
            className={`w-11 h-6 rounded-full relative transition ${
              available ? "bg-[#E22227]" : "bg-[#55666E]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
                available ? "left-5" : "left-0.5"
              }`}
            />
          </span>
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {[
            { value: "0", label: "KSh this week" },
            { value: "0", label: "Jobs done" },
            { value: "—", label: "Rating" },
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

        {/* Job requests panel */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-4">
          <h2 className="font-bold mb-3">New job requests</h2>
          <p className="text-sm text-[#B9C3C9]">
            No requests yet. When customers near you need help, they will appear
            here.
          </p>
        </div>

        {/* Payouts panel */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-6">
          <h2 className="font-bold mb-3">Payouts</h2>
          <div className="flex justify-between items-center py-3 border-t border-white/10">
            <div>
              <strong className="text-sm">KSh 0</strong>
              <small className="block text-xs text-[#B9C3C9]">
                Available to withdraw
              </small>
            </div>
            <span className="text-[0.7rem] font-bold px-2.5 py-1 rounded-full text-[#34D399] bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.4)]">
              M-Pesa
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-t border-white/10">
            <div>
              <strong className="text-sm">KSh 0</strong>
              <small className="block text-xs text-[#B9C3C9]">
                Held in escrow until job completion
              </small>
            </div>
            <span className="text-[0.7rem] font-bold px-2.5 py-1 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.4)]">
              Escrow
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-[#55666E] mb-4">
          Prototype · Real job matching and payouts come next
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

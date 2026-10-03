"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import { getBookings, type Booking } from "@/lib/bookings";

const URGENCY_LABEL: Record<string, string> = {
  now: "Right now",
  today: "Today",
  week: "This week",
};

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  requested: {
    label: "Requested",
    className:
      "text-[#F5C451] bg-[rgba(245,196,81,0.12)] border-[rgba(245,196,81,0.4)]",
  },
  accepted: {
    label: "Accepted",
    className:
      "text-[#34D399] bg-[rgba(52,211,153,0.12)] border-[rgba(52,211,153,0.4)]",
  },
  declined: {
    label: "Declined",
    className:
      "text-[#ff8a8d] bg-[rgba(255,138,141,0.12)] border-[rgba(255,138,141,0.4)]",
  },
  completed: {
    label: "Completed",
    className: "text-[#B9C3C9] bg-white/5 border-white/15",
  },
};

export default function BookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setBookings(getBookings());
      setLoading(false);
    }
    check();

    function onUpdate() {
      setBookings(getBookings());
    }
    window.addEventListener("savis-bookings-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("savis-bookings-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[#B9C3C9]">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[rgba(34,43,49,0.8)] backdrop-blur-md">
        <Logo size="sm" />
        <span className="text-xs font-bold px-3 py-1.5 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.35)]">
          Bookings
        </span>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-2xl font-extrabold mb-1">My bookings</h1>
        <p className="text-[#B9C3C9] text-sm mb-6">
          Jobs you have requested or booked
        </p>

        {bookings.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-[20px] border border-dashed border-white/15 bg-[rgba(34,43,49,0.5)] mb-6">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-[#B9C3C9] text-sm mb-1">No bookings yet</p>
            <p className="text-xs text-[#55666E]">
              When you request a quote or book a provider, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {bookings.map((b) => {
              const st = STATUS_STYLE[b.status] || STATUS_STYLE.requested;
              return (
                <div
                  key={b.id}
                  className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)]"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div className="font-bold">{b.providerName}</div>
                    <span
                      className={`text-[0.7rem] font-bold px-2.5 py-1 rounded-full border shrink-0 ${st.className}`}
                    >
                      {st.label}
                    </span>
                  </div>
                  <div className="text-xs text-[#B9C3C9] mb-2">
                    {b.skill} · {b.location} ·{" "}
                    {URGENCY_LABEL[b.urgency] || b.urgency}
                  </div>
                  <p className="text-sm text-[#B9C3C9] mb-2">{b.description}</p>
                  <div className="text-sm font-bold text-[#F5C451]">
                    From KSh {b.rate.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Link href="/consumer">
          <Button full>Find a provider</Button>
        </Link>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
        <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-1 rounded-full border border-white/10 bg-[rgba(34,43,49,0.9)] backdrop-blur-lg shadow-2xl">
          <Link
            href="/consumer"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-[#B9C3C9] text-[0.65rem] font-bold"
          >
            <span className="text-base">🏠</span>
            Home
          </Link>
          <Link
            href="/consumer"
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-[#B9C3C9] text-[0.65rem] font-bold"
          >
            <span className="text-base">🔍</span>
            Search
          </Link>
          <button className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-white bg-gradient-to-br from-[#E22227] to-[#C7080C] text-[0.65rem] font-bold">
            <span className="text-base">📋</span>
            Bookings
          </button>
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

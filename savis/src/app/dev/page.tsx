"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import { createClient } from "@/lib/supabase/client";
import { getBookings, syncBookings, type Booking } from "@/lib/bookings";
import { getBalance, getTransactions, topUp, type WalletTx } from "@/lib/wallet";

const DEV_PIN = "savis2026"; // Change this anytime in code

export default function DevPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<WalletTx[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [remoteCount, setRemoteCount] = useState<number | null>(null);

  function refreshLocal() {
    setJobs(getBookings());
    setBalance(getBalance());
    setTxs(getTransactions());
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("savis_dev") === "1") setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    refreshLocal();
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
      try {
        await syncBookings();
        refreshLocal();
        const { count } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true });
        setRemoteCount(count);
      } catch {
        setRemoteCount(null);
      }
    })();
  }, [unlocked]);

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (pin.trim() === DEV_PIN) {
      sessionStorage.setItem("savis_dev", "1");
      setUnlocked(true);
      setError("");
    } else {
      setError("Wrong PIN");
    }
  }

  function flash(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(null), 2500);
  }

  function clearLocalBookings() {
    localStorage.removeItem("savis_bookings");
    window.dispatchEvent(new Event("savis-bookings-updated"));
    refreshLocal();
    flash("Local bookings cleared");
  }

  function clearWallet() {
    localStorage.removeItem("savis_wallet_balance");
    localStorage.removeItem("savis_wallet_tx");
    localStorage.removeItem("savis_reviews");
    refreshLocal();
    flash("Wallet & reviews reset (balance back to default on next load)");
  }

  function clearAllLocal() {
    [
      "savis_bookings",
      "savis_wallet_balance",
      "savis_wallet_tx",
      "savis_reviews",
      "savis_lang",
    ].forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event("savis-bookings-updated"));
    refreshLocal();
    flash("All local SAVIS data cleared");
  }

  async function signOutEverywhere() {
    const supabase = createClient();
    await supabase.auth.signOut();
    flash("Signed out on this device");
    setUserEmail(null);
  }

  async function deleteRemoteJobs() {
    if (
      !confirm(
        "Delete ALL jobs in Supabase? This cannot be undone."
      )
    )
      return;
    const supabase = createClient();
    const { error } = await supabase.from("jobs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      flash("Could not delete remote jobs: " + error.message);
      return;
    }
    localStorage.removeItem("savis_bookings");
    refreshLocal();
    setRemoteCount(0);
    flash("All remote jobs deleted");
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <Logo />
        <h1 className="text-xl font-extrabold mt-6 mb-2">Developer access</h1>
        <p className="text-sm text-[#B9C3C9] mb-6 text-center max-w-sm">
          Private tools to inspect and reset your SAVIS network data.
        </p>
        <form onSubmit={tryUnlock} className="w-full max-w-xs space-y-3">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Developer PIN"
            className="w-full px-4 py-3.5 rounded-2xl bg-black/35 border border-white/15 text-white outline-none focus:border-[#E22227]"
          />
          {error && (
            <p className="text-[#ff8a8d] text-sm font-semibold">{error}</p>
          )}
          <Button type="submit" full>
            Unlock
          </Button>
        </form>
        <Link href="/" className="mt-6 text-sm text-[#B9C3C9]">
          ← Back to app
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[rgba(34,43,49,0.9)] backdrop-blur-md">
        <Logo size="sm" />
        <span className="text-xs font-bold px-3 py-1.5 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.35)]">
          DEV
        </span>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        <h1 className="text-2xl font-extrabold">Developer panel</h1>
        <p className="text-sm text-[#B9C3C9]">
          Inspect and reset data on this device and Supabase.
        </p>

        {/* Session */}
        <section className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)]">
          <h2 className="font-bold mb-2">Session</h2>
          <p className="text-sm text-[#B9C3C9] mb-3">
            Logged in:{" "}
            <strong className="text-white">
              {userEmail || "Nobody on this device"}
            </strong>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={signOutEverywhere}
              className="text-xs font-bold px-3 py-2 rounded-full border border-white/20 text-[#B9C3C9]"
            >
              Sign out this device
            </button>
            <Link
              href="/login"
              className="text-xs font-bold px-3 py-2 rounded-full text-white"
              style={{
                background: "linear-gradient(135deg, #E22227, #C7080C)",
              }}
            >
              Go to login
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)]">
          <h2 className="font-bold mb-3">Network snapshot</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-3 rounded-xl bg-black/25">
              <b className="text-[#F5C451]">{jobs.length}</b>
              <span className="block text-xs text-[#B9C3C9]">
                Jobs (this browser)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/25">
              <b className="text-[#F5C451]">
                {remoteCount === null ? "—" : remoteCount}
              </b>
              <span className="block text-xs text-[#B9C3C9]">
                Jobs (Supabase)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/25">
              <b className="text-[#F5C451]">KSh {balance.toLocaleString()}</b>
              <span className="block text-xs text-[#B9C3C9]">Wallet</span>
            </div>
            <div className="p-3 rounded-xl bg-black/25">
              <b className="text-[#F5C451]">{txs.length}</b>
              <span className="block text-xs text-[#B9C3C9]">
                Wallet transactions
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              topUp(0);
              refreshLocal();
              flash("Refreshed");
            }}
            className="mt-3 text-xs font-bold text-[#F5C451]"
          >
            Refresh numbers
          </button>
        </section>

        {/* Jobs list */}
        <section className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)]">
          <h2 className="font-bold mb-3">Jobs (local cache)</h2>
          {jobs.length === 0 ? (
            <p className="text-sm text-[#B9C3C9]">No jobs in this browser.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {jobs.map((j) => (
                <div
                  key={j.id}
                  className="p-2.5 rounded-xl bg-black/25 text-xs border border-white/5"
                >
                  <div className="flex justify-between gap-2">
                    <strong>{j.providerName}</strong>
                    <span className="text-[#F5C451]">{j.status}</span>
                  </div>
                  <p className="text-[#B9C3C9] mt-0.5">{j.description}</p>
                  <p className="text-[#55666E] mt-0.5">
                    {j.location} · KSh {j.rate} · {j.id.slice(0, 8)}…
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Danger zone */}
        <section className="p-4 rounded-[20px] border border-[rgba(255,138,141,0.35)] bg-[rgba(255,50,50,0.08)]">
          <h2 className="font-bold mb-2 text-[#ff8a8d]">Reset tools</h2>
          <p className="text-xs text-[#B9C3C9] mb-3">
            Use these to start fresh while testing.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={clearLocalBookings}
              className="text-left text-sm font-bold px-3 py-2.5 rounded-xl border border-white/15"
            >
              Clear local bookings only
            </button>
            <button
              onClick={clearWallet}
              className="text-left text-sm font-bold px-3 py-2.5 rounded-xl border border-white/15"
            >
              Reset wallet & reviews
            </button>
            <button
              onClick={clearAllLocal}
              className="text-left text-sm font-bold px-3 py-2.5 rounded-xl border border-white/15"
            >
              Clear all local SAVIS data
            </button>
            <button
              onClick={deleteRemoteJobs}
              className="text-left text-sm font-bold px-3 py-2.5 rounded-xl border border-[#ff8a8d]/40 text-[#ff8a8d]"
            >
              Delete ALL jobs in Supabase
            </button>
          </div>
        </section>

        <p className="text-xs text-[#55666E]">
          PIN is set in code (currently <code className="text-[#B9C3C9]">savis2026</code>).
          Change it before sharing the site widely.
        </p>

        <Link href="/">
          <Button variant="outline" full>
            Back to app
          </Button>
        </Link>
      </div>

      {msg && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 px-4 py-2.5 rounded-xl bg-[#222B31] border border-white/15 text-sm shadow-xl">
          {msg}
        </div>
      )}
    </main>
  );
}

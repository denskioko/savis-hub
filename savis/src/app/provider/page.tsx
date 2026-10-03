"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import LangToggle from "@/components/LangToggle";
import { t, getLang, setLang, type Lang } from "@/lib/i18n";
import {
  getBookings,
  getOpenRequests,
  getAcceptedJobs,
  updateBookingStatus,
  syncBookings,
  type Booking,
} from "@/lib/bookings";
import { releaseForJob, refundForJob } from "@/lib/wallet";

type Profile = {
  full_name: string | null;
  role: string | null;
};

const URGENCY: Record<string, { en: string; sw: string }> = {
  now: { en: "Right now", sw: "Sasa hivi" },
  today: { en: "Today", sw: "Leo" },
  week: { en: "This week", sw: "Wiki hii" },
};

export default function ProviderPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [openJobs, setOpenJobs] = useState<Booking[]>([]);
  const [activeJobs, setActiveJobs] = useState<Booking[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(getLang());
  }, []);

  function switchLang(l: Lang) {
    setLang(l);
    setLangState(l);
  }

  const refreshJobs = useCallback(() => {
    setOpenJobs(getOpenRequests());
    setActiveJobs(getAcceptedJobs());
  }, []);

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
      await syncBookings();
      refreshJobs();
      setLoading(false);
    }
    load();

    function onUpdate() {
      refreshJobs();
    }
    window.addEventListener("savis-bookings-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("savis-bookings-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [router, refreshJobs]);

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

  async function acceptJob(id: string) {
    await updateBookingStatus(id, "accepted");
    refreshJobs();
    showToast(lang === "sw" ? "Kazi imekubaliwa" : "Job accepted");
  }

  async function declineJob(id: string) {
    const job = getBookings().find((b) => b.id === id);
    await updateBookingStatus(id, "declined");
    if (job) {
      refundForJob(job.rate, id, `Refund: ${job.description.slice(0, 40)}`);
    }
    refreshJobs();
    showToast(lang === "sw" ? "Kazi imekataliwa · Pesa imerejeshwa" : "Declined · Funds refunded to wallet");
  }

  async function completeJob(id: string) {
    const job = getBookings().find((b) => b.id === id);
    await updateBookingStatus(id, "completed");
    if (job) {
      releaseForJob(job.rate, id, `Paid: ${job.description.slice(0, 40)}`);
    }
    refreshJobs();
    showToast(
      lang === "sw" ? "Kazi imekamilika · Malipo yametolewa" : "Completed · Escrow released"
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[#B9C3C9]">{t("loading", lang)}</p>
      </main>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Friend";
  const completedCount = getBookings().filter(
    (b) => b.status === "completed"
  ).length;

  return (
    <main className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[rgba(34,43,49,0.8)] backdrop-blur-md">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <LangToggle lang={lang} onChange={switchLang} />
          <span className="text-xs font-bold px-3 py-1.5 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.35)]">
            Provider
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
          {t("manage.jobs", lang)}
        </p>

        {/* Availability */}
        <button
          type="button"
          onClick={() => setAvailable((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-full border border-white/10 bg-[rgba(34,43,49,0.72)] mb-5"
        >
          <strong className="text-sm">
            {available
              ? t("available.jobs", lang)
              : t("not.available", lang)}
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
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            {
              value: String(openJobs.length),
              label: lang === "sw" ? "Maombi mapya" : "New requests",
            },
            {
              value: String(activeJobs.length),
              label: t("jobs.accepted", lang),
            },
            {
              value: String(completedCount),
              label: lang === "sw" ? "Zimekamilika" : "Completed",
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

        {/* New requests from consumers */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-4">
          <h2 className="font-bold mb-3">
            {t("new.requests", lang)}{" "}
            {openJobs.length > 0 && (
              <span className="text-[#F5C451]">({openJobs.length})</span>
            )}
          </h2>

          {openJobs.length === 0 ? (
            <p className="text-sm text-[#B9C3C9]">{t("no.requests", lang)}</p>
          ) : (
            <div className="space-y-3">
              {openJobs.map((j) => (
                <div
                  key={j.id}
                  className="p-3 rounded-2xl bg-black/25 border border-white/8"
                >
                  <div className="font-bold text-sm mb-0.5">
                    {j.description}
                  </div>
                  <div className="text-xs text-[#B9C3C9] mb-1">
                    {j.providerName} · {j.skill}
                  </div>
                  <div className="text-xs text-[#B9C3C9] mb-2.5">
                    {j.location} ·{" "}
                    {URGENCY[j.urgency]?.[lang] || j.urgency} · KSh{" "}
                    {j.rate.toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptJob(j.id)}
                      className="flex-1 py-2 rounded-full text-xs font-bold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #E22227, #C7080C)",
                      }}
                    >
                      {t("accept", lang)}
                    </button>
                    <button
                      onClick={() => declineJob(j.id)}
                      className="px-4 py-2 rounded-full text-xs font-bold border border-white/20 text-[#B9C3C9]"
                    >
                      {t("decline", lang)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active jobs */}
        {activeJobs.length > 0 && (
          <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-4">
            <h2 className="font-bold mb-3">{t("active.jobs", lang)}</h2>
            <div className="space-y-3">
              {activeJobs.map((j) => (
                <div
                  key={j.id}
                  className="p-3 rounded-2xl bg-black/25 border border-white/8"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <strong className="text-sm">{j.description}</strong>
                    <span className="text-[0.7rem] font-bold px-2.5 py-1 rounded-full text-[#34D399] bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.4)] shrink-0">
                      {t("in.progress", lang)}
                    </span>
                  </div>
                  <div className="text-xs text-[#B9C3C9] mb-2">
                    {j.location} · KSh {j.rate.toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => completeJob(j.id)}
                      className="flex-1 py-2 rounded-full text-xs font-bold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #E22227, #C7080C)",
                      }}
                    >
                      {t("mark.complete", lang)}
                    </button>
                    <button
                      onClick={() =>
                        showToast(
                          lang === "sw"
                            ? "Ujumbe unakuja baadaye"
                            : "Messaging coming soon"
                        )
                      }
                      className="px-4 py-2 rounded-full text-xs font-bold border border-white/20 text-[#B9C3C9]"
                    >
                      {t("message", lang)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payouts */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-6">
          <h2 className="font-bold mb-3">{t("payouts", lang)}</h2>
          <div className="flex justify-between items-center py-3 border-t border-white/10">
            <div>
              <strong className="text-sm">KSh 0</strong>
              <small className="block text-xs text-[#B9C3C9]">
                {t("available.withdraw", lang)}
              </small>
            </div>
            <span className="text-[0.7rem] font-bold px-2.5 py-1 rounded-full text-[#34D399] bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.4)]">
              M-Pesa
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-t border-white/10">
            <div>
              <strong className="text-sm">
                KSh{" "}
                {activeJobs
                  .reduce((s, j) => s + j.rate, 0)
                  .toLocaleString()}
              </strong>
              <small className="block text-xs text-[#B9C3C9]">
                {t("held.escrow", lang)}
              </small>
            </div>
            <span className="text-[0.7rem] font-bold px-2.5 py-1 rounded-full text-[#F5C451] bg-[rgba(245,196,81,0.12)] border border-[rgba(245,196,81,0.4)]">
              Escrow
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-[#55666E] mb-4">
          {lang === "sw"
            ? "Prototype · Maombi yanashirikiwa kwenye kivinjari hiki"
            : "Prototype · Requests are shared in this browser"}
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

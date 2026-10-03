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
};

type JobRequest = {
  id: number;
  title: string;
  area: string;
  km: number;
  budget: number;
  urgency: string;
  status: "new" | "accepted" | "declined";
};

const SAMPLE_JOBS: JobRequest[] = [
  {
    id: 1,
    title: "Fix leaking kitchen sink",
    area: "Westlands",
    km: 1.2,
    budget: 1500,
    urgency: "Today",
    status: "new",
  },
  {
    id: 2,
    title: "Install water tank on roof",
    area: "Parklands",
    km: 2.8,
    budget: 4200,
    urgency: "This week",
    status: "new",
  },
  {
    id: 3,
    title: "Unblock bathroom drain",
    area: "Kilimani",
    km: 1.9,
    budget: 1200,
    urgency: "Right now",
    status: "new",
  },
];

export default function ProviderPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [jobs, setJobs] = useState<JobRequest[]>(SAMPLE_JOBS);
  const [toast, setToast] = useState<string | null>(null);
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

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function acceptJob(id: number) {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: "accepted" } : j))
    );
    showToast("Job accepted (sample)");
  }

  function declineJob(id: number) {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: "declined" } : j))
    );
    showToast("Job declined");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[#B9C3C9]">Loading…</p>
      </main>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Friend";
  const newJobs = jobs.filter((j) => j.status === "new");
  const acceptedJobs = jobs.filter((j) => j.status === "accepted");

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

        {/* Availability toggle */}
        <button
          type="button"
          onClick={() => setAvailable((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-full border border-white/10 bg-[rgba(34,43,49,0.72)] mb-5"
        >
          <strong className="text-sm">
            {available ? "{t("available.jobs", lang)}" : "{t("not.available", lang)}"}
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
            { value: "0", label: "KSh this week" },
            { value: String(acceptedJobs.length), label: "Jobs accepted" },
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

        {/* {t("new.requests", lang)} */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-4">
          <h2 className="font-bold mb-3">
            {t("new.requests", lang)}{" "}
            {newJobs.length > 0 && (
              <span className="text-[#F5C451]">({newJobs.length})</span>
            )}
          </h2>

          {newJobs.length === 0 ? (
            <p className="text-sm text-[#B9C3C9]">
              No new requests right now. Customers near you will appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {newJobs.map((j) => (
                <div
                  key={j.id}
                  className="p-3 rounded-2xl bg-black/25 border border-white/8"
                >
                  <div className="font-bold text-sm mb-0.5">{j.title}</div>
                  <div className="text-xs text-[#B9C3C9] mb-2.5">
                    {j.area} · {j.km} km · {j.urgency} · KSh{" "}
                    {j.budget.toLocaleString()}
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

        {/* {t("accept", lang)}ed jobs */}
        {acceptedJobs.length > 0 && (
          <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-4">
            <h2 className="font-bold mb-3">{t("active.jobs", lang)}</h2>
            <div className="space-y-3">
              {acceptedJobs.map((j) => (
                <div
                  key={j.id}
                  className="p-3 rounded-2xl bg-black/25 border border-white/8"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <strong className="text-sm">{j.title}</strong>
                    <span className="text-[0.7rem] font-bold px-2.5 py-1 rounded-full text-[#34D399] bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.4)] shrink-0">
                      {t("in.progress", lang)}
                    </span>
                  </div>
                  <div className="text-xs text-[#B9C3C9] mb-2">
                    {j.area} · {j.km} km · KSh {j.budget.toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => showToast("Customer will be notified (sample)")}
                      className="flex-1 py-2 rounded-full text-xs font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, #E22227, #C7080C)",
                      }}
                    >
                      {t("mark.complete", lang)}
                    </button>
                    <button
                      onClick={() => showToast("Message feature coming soon")}
                      className="px-4 py-2 rounded-full text-xs font-bold border border-white/20 text-[#B9C3C9]"
                    >
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* {t("payouts", lang)} */}
        <div className="p-4 rounded-[20px] border border-white/10 bg-[rgba(34,43,49,0.72)] mb-6">
          <h2 className="font-bold mb-3">{t("payouts", lang)}</h2>
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

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 px-4 py-2.5 rounded-xl bg-[#222B31] border border-white/15 text-sm shadow-xl">
          {toast}
        </div>
      )}
    </main>
  );
}

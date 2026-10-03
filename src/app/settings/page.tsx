"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLang, setLang, type Lang } from "@/lib/i18n";

type SettingsState = {
  darkMode: boolean;
  notifications: boolean;
  location: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: true,
    notifications: true,
    location: true,
  });
  const [lang, setLangState] = useState<Lang>("en");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLangState(getLang());
    const stored = localStorage.getItem("savis_settings");
    if (stored) {
      try {
        setSettings((current) => ({ ...current, ...JSON.parse(stored) }));
      } catch {}
    }
  }, []);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem("savis_settings", JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function changeLanguage(next: Lang) {
    setLang(next);
    setLangState(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[rgba(34,43,49,0.86)] px-4 py-3 backdrop-blur-md">
        <Link href="/profile" className="text-sm font-bold text-[#B9C3C9]">← Profile</Link>
        <h1 className="font-extrabold">Settings</h1>
        <span className="w-12" />
      </header>

      <div className="mx-auto max-w-lg px-4 pt-6">
        {saved && (
          <div className="mb-4 rounded-xl border border-[#34D399]/20 bg-[#34D399]/10 px-4 py-3 text-xs font-bold text-[#86efac]">
            Settings saved
          </div>
        )}

        <section className="mb-5">
          <h2 className="mb-2 px-1 text-xs font-extrabold uppercase tracking-wider text-[#B9C3C9]">Appearance</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[rgba(34,43,49,0.72)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <p className="text-sm font-bold">Dark mode</p>
                <p className="mt-1 text-xs text-[#B9C3C9]">Use SAVIS dark appearance</p>
              </div>
              <button
                type="button"
                onClick={() => update("darkMode", !settings.darkMode)}
                className={`h-7 w-12 rounded-full p-1 transition ${settings.darkMode ? "bg-[#E22227]" : "bg-white/20"}`}
                aria-label="Toggle dark mode"
              >
                <span className={`block h-5 w-5 rounded-full bg-white transition ${settings.darkMode ? "translate-x-5" : ""}`} />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-sm font-bold">Language</p>
                <p className="mt-1 text-xs text-[#B9C3C9]">Choose your preferred language</p>
              </div>
              <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
                {(["en", "sw"] as Lang[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => changeLanguage(item)}
                    className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${lang === item ? "bg-[#E22227] text-white" : "text-[#B9C3C9]"}`}
                  >
                    {item === "en" ? "EN" : "SW"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-2 px-1 text-xs font-extrabold uppercase tracking-wider text-[#B9C3C9]">Notifications & privacy</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[rgba(34,43,49,0.72)]">
            {[
              ["notifications", "Notifications", "Booking updates and important account alerts"],
              ["location", "Location", "Use your area to improve nearby results"],
            ].map(([key, title, desc], index) => (
              <div key={key} className={`flex items-center justify-between px-4 py-4 ${index === 0 ? "border-b border-white/10" : ""}`}>
                <div className="pr-4">
                  <p className="text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs text-[#B9C3C9]">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => update(key as keyof SettingsState, !settings[key as keyof SettingsState])}
                  className={`h-7 w-12 shrink-0 rounded-full p-1 transition ${settings[key as keyof SettingsState] ? "bg-[#E22227]" : "bg-white/20"}`}
                >
                  <span className={`block h-5 w-5 rounded-full bg-white transition ${settings[key as keyof SettingsState] ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-2 px-1 text-xs font-extrabold uppercase tracking-wider text-[#B9C3C9]">Account</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[rgba(34,43,49,0.72)]">
            <Link href="/profile" className="flex items-center justify-between border-b border-white/10 px-4 py-4 text-sm font-bold">
              <span>Personal information</span><span className="text-[#B9C3C9]">→</span>
            </Link>
            <Link href="/bookings" className="flex items-center justify-between border-b border-white/10 px-4 py-4 text-sm font-bold">
              <span>Bookings</span><span className="text-[#B9C3C9]">→</span>
            </Link>
            <Link href="/agent" className="flex items-center justify-between px-4 py-4 text-sm font-bold">
              <span>Become an Agent</span><span className="text-[#B9C3C9]">→</span>
            </Link>
          </div>
        </section>

        <p className="text-center text-xs leading-relaxed text-[#55666E]">
          SAVIS settings are stored locally in this prototype. Account security, notification delivery, and location permissions will be connected to the backend as those services are implemented.
        </p>
      </div>
    </main>
  );
}

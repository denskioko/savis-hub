"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AccountMenuProps = {
  name: string;
  role: string;
  homeHref: string;
};

export default function AccountMenu({ name, role, homeHref }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function close(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 hover:bg-white/10"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#E22227] to-[#C7080C] text-xs font-extrabold">
          {(name || "U").charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-24 truncate text-xs font-bold sm:block">{name || "Account"}</span>
        <span className="text-xs text-[#B9C3C9]">⌄</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#222B31] shadow-2xl"
        >
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-extrabold truncate">{name || "Account"}</p>
            <p className="mt-0.5 text-xs text-[#B9C3C9] capitalize">{role}</p>
          </div>
          <div className="p-2">
            {[
              ["Profile", "/profile", "👤"],
              ["Bookings", "/bookings", "📋"],
              ["Messages", "/messages", "💬"],
              ["Wallet", "/profile", "💰"],
              ["Settings", "/settings", "⚙️"],
            ].map(([label, href, icon]) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-white/5"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
            {(role === "consumer" || role === "provider") && (
              <Link
                href="/agent"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-white/5"
              >
                <span>🤝</span>
                <span>Agent dashboard</span>
              </Link>
            )}
            <Link
              href={homeHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-white/5"
            >
              <span>🏠</span>
              <span>My home</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#F5C451] hover:bg-white/5"
            >
              <span>↪</span>
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

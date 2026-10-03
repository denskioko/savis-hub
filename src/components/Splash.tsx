"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

export default function Splash() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 900);
    const t2 = setTimeout(() => setShow(false), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-400 ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #6C0102 0%, #1a1012 55%, #0d0a0b 100%)",
      }}
    >
      <div className="animate-pulse">
        <Logo />
      </div>
      <p className="mt-6 text-sm font-semibold text-[#F5C451] tracking-wide">
        Connect needs to the nearest helpers
      </p>
      <div className="mt-8 w-10 h-10 border-2 border-[#E22227] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

"use client";

import Splash from "@/components/Splash";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Splash />
      {children}
    </>
  );
}

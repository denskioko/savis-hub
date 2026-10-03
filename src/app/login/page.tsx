"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import Button from "@/components/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    let role = data.user?.user_metadata?.role || "consumer";

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user!.id)
      .maybeSingle();

    if (profile?.role) role = profile.role;

    setLoading(false);
    const dest =
      role === "provider"
        ? "/provider"
        : role === "professional"
          ? "/professional"
          : "/consumer";
    router.push(dest);
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <Logo size="sm" />
          <Link href="/" className="text-sm text-[#B9C3C9] hover:text-white">
            ← Back
          </Link>
        </div>

        <h1 className="text-2xl font-extrabold mb-1">Log in</h1>
        <p className="text-[#B9C3C9] text-sm mb-6">Welcome back to SAVIS</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#B9C3C9] mb-1.5">
              EMAIL
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-black/35 border border-white/15 text-white outline-none focus:border-[#E22227] focus:ring-2 focus:ring-[#E22227]/30"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#B9C3C9] mb-1.5">
              PASSWORD
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-black/35 border border-white/15 text-white outline-none focus:border-[#E22227] focus:ring-2 focus:ring-[#E22227]/30"
              placeholder="Your password"
            />
          </div>

          {error && (
            <p className="text-[#ff8a8d] text-sm font-semibold">{error}</p>
          )}

          <Button type="submit" full disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="text-center text-sm text-[#B9C3C9] mt-6">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="text-[#F5C451] font-bold">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

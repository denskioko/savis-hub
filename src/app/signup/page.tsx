"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";
import Button from "@/components/Button";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || "consumer";

  const initialRole =
    ["provider", "professional", "seller", "agent"].includes(roleParam || "")
      ? roleParam!
      : "consumer";
  const [role, setRole] = useState(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8 || !/\d/.test(password)) {
      setError("Password needs at least 8 characters and one number.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error: signError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
        },
      },
    });

    if (signError) {
      setError(signError.message);
      setLoading(false);
      return;
    }

    // Try to create profile row (table may not exist yet — that is ok for first deploy)
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
      });
    }

    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md text-center">
          <Logo />
          <div className="mt-8 p-6 rounded-3xl bg-white/10 border border-white/15">
            <div className="text-4xl mb-3">📬</div>
            <h1 className="text-xl font-extrabold mb-2">Check your email</h1>
            <p className="text-[#B9C3C9] text-sm mb-6">
              We sent a confirmation link to <strong className="text-white">{email}</strong>.
              Click it, then log in.
            </p>
            <Link href="/login">
              <Button full>Go to Log in</Button>
            </Link>
          </div>
        </div>
      </main>
    );
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

        <h1 className="text-2xl font-extrabold mb-1">Create your account</h1>
        <p className="text-[#B9C3C9] text-sm mb-6">
          Join as a {
            (
              {
                consumer: "Consumer",
                provider: "Provider",
                professional: "Professional",
                seller: "Seller",
                agent: "Agent",
              } as Record<string, string>
            )[role] || "User"
          }
        </p>

        {/* Role toggle */}
        <div className="flex gap-1.5 p-1 rounded-full bg-black/35 border border-white/10 mb-6">
          {(
            [
              { id: "consumer", label: "🙋" },
              { id: "provider", label: "🛠️" },
              { id: "professional", label: "⚖️" },
              { id: "seller", label: "🏪" },
              { id: "agent", label: "🤝" },
            ] as const
          ).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold transition ${
                role === r.id
                  ? "text-white"
                  : "text-[#B9C3C9] hover:text-white"
              }`}
              style={
                role === r.id
                  ? {
                      background: "linear-gradient(135deg, #E22227, #C7080C)",
                      boxShadow: "0 4px 14px rgba(226, 34, 39, 0.5)",
                    }
                  : undefined
              }
            >
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#B9C3C9] mb-1.5">
              FULL NAME
            </label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-black/35 border border-white/15 text-white outline-none focus:border-[#E22227] focus:ring-2 focus:ring-[#E22227]/30"
              placeholder="e.g. James Otieno"
            />
          </div>

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
              placeholder="8+ characters with a number"
            />
          </div>

          {error && (
            <p className="text-[#ff8a8d] text-sm font-semibold">{error}</p>
          )}

          <Button type="submit" full disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-[#B9C3C9] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#F5C451] font-bold">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-[#B9C3C9]">Loading…</p>
        </main>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

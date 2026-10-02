import Link from "next/link";
import Logo from "@/components/Logo";
import Button from "@/components/Button";

const roles = [
  {
    href: "/signup?role=consumer",
    icon: "🙋",
    title: "Consumer",
    desc: "Find, book and pay trusted help nearby",
  },
  {
    href: "/signup?role=provider",
    icon: "🛠️",
    title: "Provider",
    desc: "Skilled trades: plumbers, masons, tailors, cleaners",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 pb-16">
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-10">
          <Logo />
          <Link
            href="/login"
            className="text-sm font-bold px-4 py-2 rounded-full border border-white/20 bg-black/30 text-[#B9C3C9] hover:text-white hover:border-[#F5C451] transition"
          >
            Log in
          </Link>
        </div>

        {/* Hero */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center leading-tight tracking-tight mb-3">
          How will you use SAVIS?
        </h1>
        <p className="text-[#B9C3C9] text-center mb-8 text-[0.95rem]">
          Pick one to get started. You can switch later.
        </p>

        {/* Role cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {roles.map((r) => (
            <Link
              key={r.title}
              href={r.href}
              className="block text-center p-6 rounded-[26px] border border-white/10 bg-[rgba(34,43,49,0.72)] backdrop-blur-md hover:border-[#E22227] hover:-translate-y-1 transition shadow-lg"
            >
              <div
                className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
                style={{
                  background: "linear-gradient(135deg, #E22227, #C7080C)",
                  boxShadow: "0 8px 24px rgba(226, 34, 39, 0.45)",
                }}
              >
                {r.icon}
              </div>
              <h2 className="font-bold text-lg mb-1">{r.title}</h2>
              <p className="text-xs text-[#B9C3C9] leading-snug">{r.desc}</p>
            </Link>
          ))}
        </div>

        {/* More roles note */}
        <p className="text-center text-sm text-[#55666E] mb-8 px-4">
          Professional, Wholesale & Retail, and Agent roles will be added after
          this first version is live.
        </p>

        {/* Login CTA */}
        <Link href="/login" className="w-full max-w-lg">
          <Button variant="outline" full type="button">
            Already have an account? <span className="text-[#F5C451]">Log in</span>
          </Button>
        </Link>

        <p className="mt-10 text-center text-xs text-[#55666E]">
          Prototype web app · No real payments yet
        </p>
      </div>
    </main>
  );
}

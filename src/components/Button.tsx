import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "gold";
  full?: boolean;
};

export default function Button({
  variant = "primary",
  full,
  className = "",
  children,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-bold transition active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3.5 text-[0.95rem]";

  const variants = {
    primary:
      "text-white border-0 shadow-[0_8px_24px_rgba(226,34,39,0.45)] hover:brightness-110",
    outline:
      "text-white bg-white/10 border border-white/40 hover:bg-white/20 hover:border-[#F5C451]",
    gold: "text-[#1a0a0c] border-0 shadow-[0_8px_24px_rgba(245,196,81,0.35)] hover:brightness-105",
  };

  const bg =
    variant === "primary"
      ? { background: "linear-gradient(135deg, #E22227, #C7080C)" }
      : variant === "gold"
        ? { background: "linear-gradient(135deg, #F5C451, #e0a42a)" }
        : undefined;

  return (
    <button
      className={`${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`}
      style={bg}
      {...props}
    >
      {children}
    </button>
  );
}

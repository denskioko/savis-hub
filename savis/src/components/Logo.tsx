export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box =
    size === "lg" ? "w-16 h-16 text-3xl" : size === "sm" ? "w-9 h-9 text-lg" : "w-11 h-11 text-xl";
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${box} rounded-xl flex items-center justify-center font-extrabold text-white`}
        style={{
          background: "linear-gradient(135deg, #E22227, #C7080C)",
          boxShadow: "0 8px 24px rgba(226, 34, 39, 0.45)",
        }}
      >
        S
      </div>
      <span className={`${text} font-extrabold tracking-wide`}>SAVIS</span>
    </div>
  );
}

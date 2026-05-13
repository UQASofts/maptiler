export type PillTone = "primary" | "primarySoft" | "neutral" | "neutralSoft" | "outline" | "muted";

export type PillProps = {
  label: string;
  active?: boolean;
  tone: PillTone;
  onClick?: () => void;
};

const toneClasses: Record<PillTone, string> = {
  primary:
    "bg-[#be185d] text-white shadow-sm hover:bg-[#9d174d] ring-1 ring-transparent",
  primarySoft:
    "bg-[#db2777]/10 text-[#be185d] hover:bg-[#db2777]/20 ring-1 ring-[#db2777]/10",
  neutral:
    "bg-zinc-900 text-white hover:bg-zinc-800 ring-1 ring-transparent",
  neutralSoft:
    "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 ring-1 ring-zinc-200",
  outline:
    "bg-white text-zinc-700 hover:bg-zinc-50 ring-1 ring-zinc-200",
  muted:
    "bg-zinc-100 text-zinc-400 ring-1 ring-zinc-200 cursor-not-allowed",
};

export function Pill({ label, tone, onClick }: PillProps) {
  const disabled = tone === "muted";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={[
        "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        toneClasses[tone],
      ].join(" ")}
    >
      {label}
    </button>
  );
}


export type ToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
};

export function Toggle({ checked, onCheckedChange, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={ariaLabel}
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors",
        checked ? "bg-[#be185d]" : "bg-zinc-200",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}


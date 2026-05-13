import { Icon } from "@/components/ui/Icon";

export type RightPanelProps = {
  activeTab?: "variants" | "legend";
  onToggleVariants?: () => void;
  onToggleLegend?: () => void;
};

export function RightPanel({
  activeTab,
  onToggleVariants,
  onToggleLegend,
}: RightPanelProps) {
  return (
    <div className="pointer-events-none absolute right-2 top-2 sm:right-5 sm:top-5 z-10 flex flex-wrap justify-end gap-2 px-2">
      <button
        type="button"
        onClick={onToggleVariants}
        className={[
          "pointer-events-auto rounded-full px-4 py-2 text-sm font-semibold shadow-sm ring-1 transition-all",
          activeTab === "variants"
            ? "bg-[#db2777] text-white ring-[#db2777] hover:bg-[#be185d]"
            : "bg-white text-zinc-800 ring-zinc-200 hover:bg-zinc-50",
        ].join(" ")}
      >
        Route Variants
      </button>
      <button
        type="button"
        onClick={onToggleLegend}
        className={[
          "pointer-events-auto rounded-full px-4 py-2 text-sm font-semibold shadow-sm ring-1 transition-all",
          activeTab === "legend"
            ? "bg-[#db2777] text-white ring-[#db2777] hover:bg-[#be185d]"
            : "bg-white text-zinc-800 ring-zinc-200 hover:bg-zinc-50",
        ].join(" ")}
      >
        Map Legend
      </button>
    </div>
  );
}

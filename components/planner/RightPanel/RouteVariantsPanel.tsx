"use client";

import type { RouteVariantDef } from "@/lib/planner/types";

export type RouteVariantsPanelProps = {
  variants: RouteVariantDef[];
  selectedVariantId: string | null;
  onSelectVariant: (id: string) => void;
};

export function RouteVariantsPanel({
  variants,
  selectedVariantId,
  onSelectVariant,
}: RouteVariantsPanelProps) {
  return (
    <div className="pointer-events-auto w-72 max-w-[calc(100vw-1rem)] rounded-2xl bg-white shadow-xl ring-1 ring-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-900">Route Variants</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Select a saved route to display on the map</p>
      </div>

      {/* List */}
      <div className="max-h-[56vh] overflow-y-auto p-2 space-y-0.5">
        {variants.length === 0 && (
          <p className="px-3 py-4 text-center text-xs text-zinc-400">
            No saved routes yet. Create a route from a location to see it here.
          </p>
        )}
        {variants.map((v) => {
          const isSelected = v.id === selectedVariantId;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVariant(v.id)}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                isSelected
                  ? "bg-zinc-900 text-white"
                  : "hover:bg-zinc-50 text-zinc-700",
              ].join(" ")}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white/30"
                style={{ backgroundColor: v.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{v.title}</div>
                <div className={`truncate text-[11px] ${isSelected ? "text-zinc-300" : "text-zinc-400"}`}>
                  {v.shortLabel}
                </div>
              </div>
              {isSelected && (
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

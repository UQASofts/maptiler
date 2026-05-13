"use client";

import type { ResistanceLayerDef } from "@/lib/planner/types";

const RESISTANCE_LAYERS: ResistanceLayerDef[] = [
  { id: "protected_forests", label: "Protected Forests", iconGlyph: "🌲", color: "#166534", fillOpacity: 0.25, geojson: { type: "FeatureCollection", features: [] } },
  { id: "flood_zones", label: "Flood Zones", iconGlyph: "🌊", color: "#2563eb", fillOpacity: 0.25, geojson: { type: "FeatureCollection", features: [] } },
  { id: "residential_buffers", label: "Residential Buffers", iconGlyph: "🏠", color: "#eab308", fillOpacity: 0.25, geojson: { type: "FeatureCollection", features: [] } },
  { id: "industrial_utilities", label: "Industrial Utilities", iconGlyph: "🏭", color: "#7c3aed", fillOpacity: 0.25, geojson: { type: "FeatureCollection", features: [] } },
  { id: "topographical_constraints", label: "Topographical Constraints", iconGlyph: "⛰️", color: "#78716c", fillOpacity: 0.25, geojson: { type: "FeatureCollection", features: [] } },
  { id: "cultural_heritage", label: "Cultural Heritage", iconGlyph: "🏛️", color: "#db2777", fillOpacity: 0.25, geojson: { type: "FeatureCollection", features: [] } },
];

export type MapLegendPanelProps = {
  visibility: Record<string, boolean>;
  onToggleLayer: (id: string) => void;
};

export function MapLegendPanel({ visibility, onToggleLayer }: MapLegendPanelProps) {
  return (
    <div className="pointer-events-auto w-72 rounded-2xl bg-white shadow-xl ring-1 ring-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-900">Map Legend</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Toggle resistance analysis overlays</p>
      </div>

      {/* Layer toggles */}
      <div className="p-2 space-y-0.5">
        {RESISTANCE_LAYERS.map((layer) => {
          const isVisible = visibility[layer.id] ?? false;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onToggleLayer(layer.id)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-50"
            >
              {/* Color swatch */}
              <span
                className="h-3.5 w-3.5 shrink-0 rounded"
                style={{ backgroundColor: layer.color, opacity: 0.7 }}
              />
              {/* Emoji */}
              <span className="text-sm leading-none">{layer.iconGlyph}</span>
              {/* Label */}
              <span className="flex-1 text-xs text-zinc-700">{layer.label}</span>
              {/* Toggle pill */}
              <span
                className={[
                  "flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
                  isVisible ? "bg-[#db2777]" : "bg-zinc-200",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                    isVisible ? "translate-x-4" : "translate-x-0.5",
                  ].join(" ")}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export type MapControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  isSatellite: boolean;
  onToggleSatellite: () => void;
};

export function MapControls({
  onZoomIn,
  onZoomOut,
  isSatellite,
  onToggleSatellite,
}: MapControlsProps) {
  return (
    <div className="pointer-events-none absolute left-5 top-5 z-10 flex items-start gap-3">
      {/* Zoom Controls */}
      <div className="pointer-events-auto">
        <Card className="overflow-hidden rounded-xl p-0">
          <div className="flex flex-col">
            <button
              type="button"
              onClick={onZoomIn}
              className="flex h-10 w-10 items-center justify-center bg-white text-zinc-800 hover:bg-zinc-50"
              aria-label="Zoom in"
            >
              <span className="text-xl font-medium">+</span>
            </button>
            <div className="h-px bg-zinc-200" />
            <button
              type="button"
              onClick={onZoomOut}
              className="flex h-10 w-10 items-center justify-center bg-white text-zinc-800 hover:bg-zinc-50"
              aria-label="Zoom out"
            >
              <span className="text-xl font-medium">−</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Satellite Toggle */}
      <button
        type="button"
        onClick={onToggleSatellite}
        className="pointer-events-auto flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-50 ring-1 ring-zinc-200">
          <Icon name="map" className="h-4 w-4" />
        </span>
        {isSatellite ? "Streets" : "Satellite"}
      </button>
    </div>
  );
}

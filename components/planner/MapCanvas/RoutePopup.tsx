import { Icon } from "@/components/ui/Icon";

export type RoutePopupProps = {
  title: string;
  description?: string;
  color?: string;
};

export function RoutePopup({
  title,
  description,
  color = "#db2777",
}: RoutePopupProps) {
  return (
    <div className="w-64 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-zinc-200 pointer-events-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 p-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-3 w-3 items-center justify-center rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="text-sm font-semibold text-zinc-900 truncate">
            {title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {description ? (
          <p className="text-xs leading-relaxed text-zinc-600 line-clamp-3">
            {description}
          </p>
        ) : (
          <p className="text-xs italic text-zinc-400">
            No description provided.
          </p>
        )}
      </div>
    </div>
  );
}

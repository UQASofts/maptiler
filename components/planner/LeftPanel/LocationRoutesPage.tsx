"use client";

import { Icon } from "@/components/ui/Icon";
import type { Location, Route } from "@/lib/planner/locations";
import { STATUS_COLORS } from "@/lib/planner/locations";

export type LocationRoutesPageProps = {
  location: Location;
  onBack: () => void;
  onCreateRoute: () => void;
  onToggleRouteVisibility: (routeId: string) => void;
  visibleRouteIds: Set<string>;
  onDeleteRoute: (routeId: string) => void;
};

function RouteListItem({
  route,
  isVisible,
  onToggleVisibility,
  onDelete,
}: {
  route: Route;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onDelete: () => void;
}) {
  const statusColor = STATUS_COLORS[route.status];

  const handleDelete = () => {
    if (window.confirm(`Delete route "${route.name}"? This cannot be undone.`)) {
      onDelete();
    }
  };

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl bg-white p-3 sm:p-4 shadow-sm ring-1 ring-zinc-100 transition-all hover:shadow-md">
      <div
        className="h-8 w-1.5 sm:h-10 shrink-0 rounded-full"
        style={{ backgroundColor: statusColor }}
      />
      <div className="min-w-0 flex-1">
        <h4 className="text-sm sm:text-base font-semibold text-zinc-900">{route.name}</h4>
        <p className="text-[10px] sm:text-xs text-zinc-500">
          {route.points} pts · {route.routeType}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleVisibility}
        title={isVisible ? "Hide route" : "Show route"}
        className={`rounded-lg p-1.5 sm:p-2 transition-colors ${
          isVisible
            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
            : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
        }`}
      >
        <Icon name={isVisible ? "eye" : "eyeOff"} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        title="Delete route"
        className="rounded-lg p-1.5 sm:p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <Icon name="close" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>
    </div>
  );
}

export function LocationRoutesPage({
  location,
  onBack,
  onCreateRoute,
  onToggleRouteVisibility,
  visibleRouteIds,
  onDeleteRoute,
}: LocationRoutesPageProps) {
  return (
    <div className="flex h-full flex-col bg-zinc-50">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-zinc-200 bg-white px-3 sm:px-4 py-3 sm:py-4">
        <button
          type="button"
          onClick={onBack}
          className="text-xs sm:text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-700"
        >
          Locations
        </button>
        <span className="text-xs sm:text-sm text-zinc-400">›</span>
        <span className="text-xs sm:text-sm font-semibold text-[#db2777]">{location.name}</span>
      </div>

      {/* Routes List */}
      <div className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto px-3 sm:px-4 py-3 sm:py-5">
        {location.routes.length === 0 && (
          <p className="text-center text-xs sm:text-sm text-zinc-400">No routes yet. Create one below.</p>
        )}
        {location.routes.map((route) => (
          <RouteListItem
            key={route.id}
            route={route}
            isVisible={visibleRouteIds.has(route.id)}
            onToggleVisibility={() => onToggleRouteVisibility(route.id)}
            onDelete={() => onDeleteRoute(route.id)}
          />
        ))}
      </div>

      {/* Create New Route Button */}
      <div className="border-t border-zinc-200 bg-white p-3 sm:p-4 shrink-0">
        <button
          type="button"
          onClick={onCreateRoute}
          className="flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-[#db2777] py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#be185d]"
        >
          <Icon name="plus" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Create New Route
        </button>
      </div>
    </div>
  );
}

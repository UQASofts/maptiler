"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { Location, LocationType } from "@/lib/planner/locations";
import { LocationIcon } from "@/public/icons/leftPanel/location";

export type LocationsListProps = {
  locations: Location[];
  onSelectLocation: (id: string) => void;
  onAddNew: () => void;
  onDeleteLocation: (id: string) => void;
};

const typeLabels: Record<LocationType, string> = {
  city: "City",
  region: "Region",
};

function LocationCard({
  location,
  onClick,
  onDelete,
}: {
  location: Location;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="group w-full cursor-pointer rounded-2xl bg-white p-3 sm:p-4 text-left shadow-sm ring-1 ring-zinc-100 transition-all hover:shadow-md"
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div
          className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: location.iconColor }}
        >
          <Icon name="building" className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold sm:text-base sm:font-semibold text-zinc-900">{location.name}</h3>
              <p className="text-xs sm:text-sm text-zinc-500">
                {typeLabels[location.type]}
              </p>
            </div>
            <div className="relative">
              <button
                type="button"
                className="rounded-lg p-1.5 text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                title="Delete Location"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1.5 sm:gap-2">
            {location.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-full bg-[#db2777]/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-[#be185d]"
              >
                {tag.icon === "routes" && (
                  <Icon name="route" className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                )}
                {tag.icon === "speed" && (
                  <Icon name="speed" className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                )}
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LocationsList({
  locations,
  onSelectLocation,
  onAddNew,
  onDeleteLocation,
}: LocationsListProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between py-3 sm:py-5 px-3">
        <h2 className="text-base sm:text-lg font-semibold text-zinc-900">Locations</h2>
        <button
          type="button"
          onClick={onAddNew}
          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-[#db2777] text-white shadow-sm transition-colors hover:bg-[#be185d]"
        >
          <Icon name="plus" className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Location Cards */}
      <div className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto px-3 pb-3 sm:pb-5">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onClick={() => onSelectLocation(location.id)}
            onDelete={() => onDeleteLocation(location.id)}
          />
        ))}
      </div>

      {/* Mark New Location Button */}
      <div className="border-t border-zinc-200 px-3 py-3 sm:py-5 shrink-0">
        <button
          type="button"
          onClick={onAddNew}
          className="flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-xl border-2 border-dashed border-zinc-300 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700"
        >
          <LocationIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Mark New Location
        </button>
      </div>
    </div>
  );
}

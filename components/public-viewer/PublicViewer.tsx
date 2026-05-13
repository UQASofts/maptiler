"use client";

import { useEffect, useState } from "react";
import { PublicTopBar } from "./PublicTopBar";
import { PublicMapCanvas } from "./PublicMapCanvas";
import { fetchLocations } from "@/lib/actions";

type LocationWithRoutes = Awaited<ReturnType<typeof fetchLocations>>[number];

export function PublicViewer() {
  const [locations, setLocations] = useState<LocationWithRoutes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  useEffect(() => {
    fetchLocations().then((data) => {
      setLocations(data);
      // Select the first location (e.g. Germany) by default
      if (data.length > 0) {
        setSelectedLocationId(data[0].id);
      }
      setIsLoading(false);
    });
  }, []);

  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-zinc-50">
      <PublicTopBar
        locations={locations}
        selectedLocationId={selectedLocationId}
        onSelectLocation={(id) => {
          setSelectedLocationId(id);
          setActiveFilter("All"); // reset filter when switching location
        }}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onResetView={() => {
          setActiveFilter("All");
          setSelectedLocationId("");
        }}
      />

      <div className="relative flex-1">
        {isLoading ? (
          <div className="flex h-full w-full flex-col">
            {/* Skeleton Top Bar */}
            <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6 py-3 sm:py-0 min-h-[64px] gap-3 sm:gap-0">
              <div className="flex w-full items-center justify-between sm:w-auto">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-200" />
                  <div className="h-6 w-40 animate-pulse rounded-md bg-zinc-200" />
                </div>
                <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 sm:hidden" />
              </div>
              <div className="flex w-full sm:w-auto items-center gap-3 sm:gap-4 overflow-x-hidden pb-1 sm:pb-0">
                <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-200 shrink-0" />
                <div className="hidden sm:block h-6 w-px bg-zinc-200 shrink-0" />
                <div className="flex gap-1.5 shrink-0">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 w-14 animate-pulse rounded-full bg-zinc-200" />
                  ))}
                </div>
                <div className="hidden sm:block h-6 w-px bg-zinc-200 shrink-0" />
                <div className="h-9 w-28 animate-pulse rounded-lg bg-zinc-200 shrink-0" />
                <div className="hidden sm:block h-6 w-px bg-zinc-200 shrink-0" />
                <div className="hidden sm:block h-8 w-8 animate-pulse rounded-full bg-zinc-200 shrink-0" />
              </div>
            </div>
            {/* Skeleton Map */}
            <div className="relative flex-1 bg-zinc-100">
              <div className="absolute inset-0 animate-pulse bg-zinc-200" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-300" />
                  <div className="h-4 w-32 animate-pulse rounded-md bg-zinc-300" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <PublicMapCanvas locations={locations} selectedLocationId={selectedLocationId} activeFilter={activeFilter} />
        )}
      </div>
    </div>
  );
}

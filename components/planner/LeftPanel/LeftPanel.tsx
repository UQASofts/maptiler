"use client";

import { LocationsList } from "./LocationsList";
import { NewLocationForm } from "./NewLocationForm";
import { LocationRoutesPage } from "./LocationRoutesPage";
import { CreateRouteForm } from "./CreateRouteForm";
import type { Location, LocationType } from "@/lib/planner/locations";

export type LeftPanelView = "list" | "new-location" | "routes" | "create-route";

export type LeftPanelProps = {
  view: LeftPanelView;
  locations: Location[];
  selectedLocationId: string | null;
  onChangeView: (view: LeftPanelView) => void;
  onSelectLocation: (id: string) => void;
  onAddLocation: (location: {
    name: string;
    type: LocationType;
    notes: string;
    lat: number;
    lng: number;
  }) => void;
  onDeleteLocation: (id: string) => void;
  onPickOnMap: () => void;
  onSaveRoute?: (route: {
    name: string;
    description: string;
    type: string;
    color: string;
    lineStyle: string;
    points: { lat: number; lng: number; label: string }[];
  }) => void;
  onToggleRouteVisibility?: (routeId: string) => void;
  visibleRouteIds?: Set<string>;
  onDeleteRoute?: (routeId: string) => void;
  onChangeDraftRoute?: (route: any) => void;
  draftLat?: number;
  draftLng?: number;
};

export function LeftPanel({
  view,
  locations,
  selectedLocationId,
  onChangeView,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  onPickOnMap,
  onSaveRoute,
  onToggleRouteVisibility,
  visibleRouteIds,
  onDeleteRoute,
  onChangeDraftRoute,
  draftLat,
  draftLng,
}: LeftPanelProps) {
  const selectedLocation = locations.find((l) => l.id === selectedLocationId) ?? null;

  if (view === "new-location") {
    return (
      <aside className="relative flex w-full h-full shrink-0 flex-col bg-white">
        <NewLocationForm
          onBack={() => onChangeView("list")}
          onSave={onAddLocation}
          onPickOnMap={onPickOnMap}
          draftLat={draftLat}
          draftLng={draftLng}
        />
      </aside>
    );
  }

  if (view === "routes" && selectedLocation) {
    return (
      <aside className="relative flex w-full h-full shrink-0 flex-col bg-white">
        <LocationRoutesPage
          location={selectedLocation}
          onBack={() => onChangeView("list")}
          onCreateRoute={() => onChangeView("create-route")}
          onToggleRouteVisibility={onToggleRouteVisibility ?? (() => {})}
          visibleRouteIds={visibleRouteIds ?? new Set()}
          onDeleteRoute={onDeleteRoute ?? (() => {})}
        />
      </aside>
    );
  }

  if (view === "create-route" && selectedLocation) {
    return (
      <aside className="relative flex w-full h-full shrink-0 flex-col bg-white">
        <CreateRouteForm
          location={selectedLocation}
          onBack={() => onChangeView("routes")}
          onSave={(route) => {
            onSaveRoute?.(route);
            onChangeView("routes");
          }}
          onChange={onChangeDraftRoute}
          onPickOnMap={onPickOnMap}
          draftLat={draftLat}
          draftLng={draftLng}
        />
      </aside>
    );
  }

  return (
    <aside className="relative flex w-full h-full shrink-0 flex-col bg-white">
      <LocationsList
        locations={locations}
        onSelectLocation={(id) => {
          onSelectLocation(id);
          onChangeView("routes");
        }}
        onAddNew={() => onChangeView("new-location")}
        onDeleteLocation={onDeleteLocation}
      />
    </aside>
  );
}

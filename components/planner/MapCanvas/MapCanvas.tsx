"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  config,
  Map as MapTilerMap,
  MapStyle,
  Marker,
  Popup,
} from "@maptiler/sdk";
import { MapControls } from "./MapControls";
import { PointPopup } from "./PointPopup";
import type {
  RouteVariantDef,
  ResistanceLayerDef,
} from "@/lib/planner/types";
import {
  addOrUpdateRouteLayer,
  addOrUpdateResistanceLayers,
  applyResistanceVisibility,
  removePlannerLayers,
  fitToRoutes,
  addCityBoundaryLayer,
  removeCityBoundaryLayer,
  fitToBoundary,
} from "@/lib/maptiler/layers";

export type MapCanvasProps = {
  isPickingLocation?: boolean;
  onPickLocation?: (lat: number, lng: number) => void;
  markerPosition?: { lat: number; lng: number } | null;
  onMarkerPositionChange?: (pos: { lat: number; lng: number } | null) => void;
  activeVariants?: RouteVariantDef[];
  resistanceVisibility?: Record<string, boolean>;
  resistanceLayers?: ResistanceLayerDef[];
  cityBoundaryGeojson?: GeoJSON.Geometry | null;
};

type BaseStyle = "streets" | "satellite";

const API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "";

export function MapCanvas({
  isPickingLocation,
  onPickLocation,
  markerPosition,
  onMarkerPositionChange,
  activeVariants = [],
  resistanceVisibility,
  resistanceLayers,
  cityBoundaryGeojson,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapTilerMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const popupRef = useRef<Popup | null>(null);

  const [baseStyle, setBaseStyle] = useState<BaseStyle>("streets");
  const style =
    baseStyle === "satellite" ? MapStyle.SATELLITE : "https://api.maptiler.com/maps/base-v4/style.json";

  // ── Refs for latest prop values (read inside stable callbacks) ──────────
  const isPickingRef = useRef(isPickingLocation ?? false);
  const onPickLocationRef = useRef(onPickLocation);
  const activeVariantsRef = useRef(activeVariants);
  const resistanceVisibilityRef = useRef(resistanceVisibility);
  const resistanceLayersRef = useRef(resistanceLayers);
  const applyLayersTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync with props on every render
  isPickingRef.current = isPickingLocation ?? false;
  onPickLocationRef.current = onPickLocation;
  activeVariantsRef.current = activeVariants;
  resistanceVisibilityRef.current = resistanceVisibility;
  resistanceLayersRef.current = resistanceLayers;

  // ── Stable helper: (re-)apply all GeoJSON layers ────────────────────────
  const applyLayers = useCallback((map: MapTilerMap) => {
    removePlannerLayers(map);
    const variants = activeVariantsRef.current;
    const layers = resistanceLayersRef.current ?? [];
    const visibility = resistanceVisibilityRef.current ?? {};

    for (const variant of variants) {
      addOrUpdateRouteLayer(map, variant);
    }

    if (variants.length > 0) {
      fitToRoutes(map, variants);
    }
    if (layers.length > 0) {
      addOrUpdateResistanceLayers(map, layers);
      applyResistanceVisibility(map, visibility);
    }
  }, []);

  // Set API key once
  useEffect(() => {
    if (API_KEY) config.apiKey = API_KEY;
  }, []);

  // ── Initialize map ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapTilerMap({
      container: containerRef.current,
      style,
      center: [10.2, 52.75],
      zoom: 7.5,
      hash: false,
    });

    mapRef.current = map;

    // Apply layers once the initial style has loaded
    map.on("load", () => applyLayers(map));

    // Fix stale closure: read latest values from refs inside this stable handler
    map.on("click", (e) => {
      if (isPickingRef.current && onPickLocationRef.current) {
        const { lat, lng } = e.lngLat;
        onPickLocationRef.current(lat, lng);
        return;
      }

      // Point layer interactivity
      const features = map.queryRenderedFeatures(e.point);
      const pointFeature = features.find(
        (f) => typeof f.layer.id === "string" && f.layer.id.startsWith("planner-route-layer-") && f.layer.id.endsWith("-points")
      );

      if (!pointFeature || !pointFeature.properties) return;
      const props = pointFeature.properties as any;
      const hasDetails = props.label || props.notes || (props.photos && props.photos !== "[]");
      if (!hasDetails) return;

      if (popupRef.current) {
        popupRef.current.remove();
      }

      const popupNode = document.createElement("div");
      const root = createRoot(popupNode);
      root.render(
        <PointPopup
          label={props.label}
          notes={props.notes}
          photos={props.photos ? JSON.parse(props.photos) : undefined}
        />,
      );

      // We use MapTiler's popup but remove its default styling via CSS if needed
      const coords = (pointFeature.geometry as GeoJSON.Point).coordinates;
      popupRef.current = new Popup({
        offset: 15,
        closeButton: false,
        closeOnClick: true,
        className: "custom-point-popup",
      })
        .setLngLat([coords[0], coords[1]])
        .setDOMContent(popupNode)
        .addTo(map);
    });

    // ── Reset all route widths to default ──────────────────────────────────
    let prevHoveredCasingId: string | null = null;
    let prevHoveredOriginalColor: string | null = null;

    function resetRouteWidths() {
      const mapAny = map as any;
      const allLayers = mapAny.getStyle?.()?.layers ?? [];
      for (const layer of allLayers) {
        const id = layer?.id as string;
        if (!id?.startsWith("planner-route-layer-")) continue;
        if (id.endsWith("-points") || id.endsWith("-labels") || id.endsWith("-hit")) continue;
        if (id.endsWith("-casing")) {
          mapAny.setPaintProperty(id, "line-width", 4);
          mapAny.setPaintProperty(id, "line-opacity", 0.25);
        } else {
          mapAny.setPaintProperty(id, "line-width", 2.5);
        }
      }
      // Restore original casing color for previously hovered route
      if (prevHoveredCasingId && prevHoveredOriginalColor) {
        if (mapAny.getLayer?.(prevHoveredCasingId)) {
          mapAny.setPaintProperty(prevHoveredCasingId, "line-color", prevHoveredOriginalColor);
        }
        prevHoveredCasingId = null;
        prevHoveredOriginalColor = null;
      }
    }

    map.on("mousemove", (e) => {
      const features = map.queryRenderedFeatures(e.point);
      const mapAny = map as any;

      resetRouteWidths();

      // Check if hovering a route via the invisible wide hit layer
      const hitFeature = features.find((f) => {
        const id = f.layer.id as string;
        return id.startsWith("planner-route-layer-") && id.endsWith("-hit");
      });

      if (hitFeature) {
        const layerId = (hitFeature.layer.id as string).replace("-hit", "");
        const casingId = `${layerId}-casing`;
        mapAny.setPaintProperty(layerId, "line-width", 3);
        if (mapAny.getLayer?.(casingId)) {
          // Save original color before changing to purple
          prevHoveredCasingId = casingId;
          prevHoveredOriginalColor = mapAny.getPaintProperty(casingId, "line-color");
          mapAny.setPaintProperty(casingId, "line-color", "#111184");
          mapAny.setPaintProperty(casingId, "line-width", 10);
          mapAny.setPaintProperty(casingId, "line-opacity", 1);
        }
        map.getCanvas().style.cursor = "pointer";
        return;
      }

      // Point layer interactivity
      const pointFeature = features.find(
        (f) =>
          typeof f.layer.id === "string" &&
          f.layer.id.startsWith("planner-route-layer-") &&
          f.layer.id.endsWith("-points"),
      );

      if (pointFeature && pointFeature.properties) {
        const props = pointFeature.properties as any;
        const hasDetails =
          props.label || props.notes || (props.photos && props.photos !== "[]");
        map.getCanvas().style.cursor = hasDetails ? "pointer" : "";
      } else {
        map.getCanvas().style.cursor = "";
      }
    });

    map.on("mouseleave", () => {
      resetRouteWidths();
      map.getCanvas().style.cursor = "";
    });

    return () => {
      if (applyLayersTimeoutRef.current) {
        clearTimeout(applyLayersTimeoutRef.current);
        applyLayersTimeoutRef.current = null;
      }
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Style toggle — re-apply layers after new style loads ────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Register one-time listener before setStyle so layers are restored
    map.once("style.load", () => applyLayers(map));
    map.setStyle(style);
  }, [style, applyLayers]);

  // ── Re-apply layers when variant / visibility props change ───────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (applyLayersTimeoutRef.current) {
      clearTimeout(applyLayersTimeoutRef.current);
    }

    applyLayersTimeoutRef.current = setTimeout(() => {
      applyLayersTimeoutRef.current = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((map as any).isStyleLoaded?.()) {
        applyLayers(map);
      } else {
        map.once("style.load", () => applyLayers(map));
      }
    }, 100);
  }, [activeVariants, resistanceVisibility, resistanceLayers, applyLayers]);

  // ── City boundary layer ──────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      if (cityBoundaryGeojson) {
        addCityBoundaryLayer(map, cityBoundaryGeojson);
        // Only pan to city boundary if no routes are visible yet
        // (routes take priority for map positioning)
        if (activeVariantsRef.current.length === 0) {
          fitToBoundary(map, cityBoundaryGeojson);
        }
      } else {
        removeCityBoundaryLayer(map);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((map as any).isStyleLoaded?.()) {
      apply();
    } else {
      map.once("style.load", apply);
    }
  }, [cityBoundaryGeojson]);

  // ── Marker ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !markerPosition) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      markerRef.current = new Marker({ color: "#3b82f6" })
        .setLngLat([markerPosition.lng, markerPosition.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([markerPosition.lng, markerPosition.lat]);
    }
  }, [markerPosition]);

  const zoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);
  const zoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);
  const toggleSatellite = useCallback(() => {
    setBaseStyle((s) => (s === "streets" ? "satellite" : "streets"));
  }, []);

  return (
    <div className="relative h-full w-full">
      <MapControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        isSatellite={baseStyle === "satellite"}
        onToggleSatellite={toggleSatellite}
      />
      {isPickingLocation && (
        <div className="pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center">
          <div className="rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-medium text-white">
            Click on the map to set location
          </div>
        </div>
      )}
      {markerPosition && (
        <div className="pointer-events-none absolute bottom-5 left-5 z-10">
          <div className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-lg">
            {markerPosition.lat.toFixed(4)}° N, {markerPosition.lng.toFixed(4)}°
            E
          </div>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

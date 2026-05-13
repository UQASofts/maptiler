import type { Map as MapTilerMap } from "@maptiler/sdk";
import type { ResistanceLayerDef, RouteVariantDef } from "@/lib/planner/types";

const IDS = {
  routeSource: "planner-route-source",
  routeLayer: "planner-route-layer",
  resistanceSourcePrefix: "planner-resistance-source-",
  resistanceLayerPrefix: "planner-resistance-layer-",
  citySourcePrefix: "planner-city-source-",
  cityLayerPrefix: "planner-city-layer-",
  cityBoundarySource: "planner-city-boundary-source",
  cityBoundaryFill: "planner-city-boundary-fill",
  cityBoundaryOutline: "planner-city-boundary-outline",
} as const;

function hasSource(map: MapTilerMap, sourceId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Boolean((map as any).getSource?.(sourceId));
}

function hasLayer(map: MapTilerMap, layerId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Boolean((map as any).getLayer?.(layerId));
}

export function addOrUpdateRouteLayer(map: MapTilerMap, variant: RouteVariantDef) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapAny = map as any;

  const sourceId = `planner-route-source-${variant.id}`;
  const layerId = `planner-route-layer-${variant.id}`;

  if (!hasSource(map, sourceId)) {
    mapAny.addSource(sourceId, {
      type: "geojson",
      data: variant.geojson,
    });
  } else {
    mapAny.getSource(sourceId)?.setData?.(variant.geojson);
  }

  let dasharray: number[] | undefined;
  if (variant.lineStyle === "DASHED") dasharray = [2, 2];
  else if (variant.lineStyle === "DOTTED") dasharray = [1, 2];
  else if (variant.lineStyle === "DASH-DOT") dasharray = [4, 2, 1, 2];

  // Casing layer (drawn behind main line for bold border effect)
  const casingLayerId = `${layerId}-casing`;
  if (!hasLayer(map, casingLayerId)) {
    mapAny.addLayer(
      {
        id: casingLayerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": variant.color,
          "line-width": 4,
          "line-opacity": 0.25,
        },
      },
      hasLayer(map, layerId) ? layerId : undefined,
    );
  } else {
    mapAny.setPaintProperty(casingLayerId, "line-color", variant.color);
  }

  if (!hasLayer(map, layerId)) {
    mapAny.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": variant.color,
        "line-width": 2.5,
        "line-opacity": 0.9,
        ...(dasharray ? { "line-dasharray": dasharray } : {}),
      },
    });
  } else {
    mapAny.setPaintProperty(layerId, "line-color", variant.color);
    if (dasharray) {
      mapAny.setPaintProperty(layerId, "line-dasharray", dasharray);
    } else {
      mapAny.setPaintProperty(layerId, "line-dasharray", undefined);
    }
  }

  const pointsLayerId = `${layerId}-points`;
  if (!hasLayer(map, pointsLayerId)) {
    mapAny.addLayer({
      id: pointsLayerId,
      type: "circle",
      source: sourceId,
      filter: ["all", ["==", "$type", "Point"], ["any", ["==", "isEndpoint", true], ["==", "pointType", "single"]]],
      paint: {
        "circle-radius": 5,
        "circle-color": "#ffffff",
        "circle-stroke-width": 3,
        "circle-stroke-color": variant.color,
      },
    });
  } else {
    mapAny.setPaintProperty(pointsLayerId, "circle-stroke-color", variant.color);
  }

  const labelsLayerId = `${layerId}-labels`;
  if (!hasLayer(map, labelsLayerId)) {
    mapAny.addLayer({
      id: labelsLayerId,
      type: "symbol",
      source: sourceId,
      filter: ["all", ["==", "$type", "Point"], ["any", ["==", "isEndpoint", true], ["==", "pointType", "single"]]],
      layout: {
        "text-field": ["get", "label"],
        "text-size": 12,
        "text-anchor": "left",
        "text-offset": [0.8, 0], // Offset to the right of the circle
      },
      paint: {
        "text-color": "#111111",
        "text-halo-color": "#ffffff",
        "text-halo-width": 2,
      },
    });
  }

  // Invisible hit layer for wider hover zone
  const hitLayerId = `${layerId}-hit`;
  if (!hasLayer(map, hitLayerId)) {
    mapAny.addLayer({
      id: hitLayerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#000",
        "line-width": 12,
        "line-opacity": 0,
      },
    });
  }
}

export function addOrUpdateResistanceLayers(
  map: MapTilerMap,
  layers: ResistanceLayerDef[],
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapAny = map as any;

  for (const layer of layers) {
    const sourceId = `${IDS.resistanceSourcePrefix}${layer.id}`;
    const layerId = `${IDS.resistanceLayerPrefix}${layer.id}`;

    if (!hasSource(map, sourceId)) {
      mapAny.addSource(sourceId, { type: "geojson", data: layer.geojson });
    } else {
      mapAny.getSource(sourceId)?.setData?.(layer.geojson);
    }

    if (!hasLayer(map, layerId)) {
      mapAny.addLayer({
        id: layerId,
        type: "fill",
        source: sourceId,
        layout: { visibility: "visible" },
        paint: {
          "fill-color": layer.color,
          "fill-opacity": layer.fillOpacity,
          "fill-outline-color": layer.color,
        },
      });
    } else {
      mapAny.setPaintProperty(layerId, "fill-color", layer.color);
      mapAny.setPaintProperty(layerId, "fill-opacity", layer.fillOpacity);
    }
  }
}

export function applyResistanceVisibility(
  map: MapTilerMap,
  visibility: Record<string, boolean>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapAny = map as any;

  for (const [id, isVisible] of Object.entries(visibility)) {
    const layerId = `${IDS.resistanceLayerPrefix}${id}`;
    if (!hasLayer(map, layerId)) continue;
    mapAny.setLayoutProperty(layerId, "visibility", isVisible ? "visible" : "none");
  }
}

export function fitToRoutes(
  map: MapTilerMap,
  variants: RouteVariantDef[],
) {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  let hasCoords = false;

  for (const variant of variants) {
    const lineStringFeature = variant.geojson.features.find(f => f.geometry.type === "LineString") as GeoJSON.Feature<GeoJSON.LineString> | undefined;
    const coords = lineStringFeature?.geometry?.coordinates ?? [];
    
    for (const [lng, lat] of coords) {
      hasCoords = true;
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
  }

  if (!hasCoords) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (map as any).fitBounds?.(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    { padding: 80, duration: 700 },
  );
}

export function fitToRoute(
  map: MapTilerMap,
  route: GeoJSON.FeatureCollection<GeoJSON.Geometry>,
) {
  fitToRoutes(map, [{ geojson: route } as RouteVariantDef]);
}

export function removePlannerLayers(map: MapTilerMap) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapAny = map as any;

  const layers = mapAny.getStyle?.()?.layers ?? [];
  for (const layer of layers) {
    const id = layer?.id as string | undefined;
    if (!id) continue;
    if (id.startsWith("planner-route-layer-") || id.startsWith(IDS.resistanceLayerPrefix)) {
      if (hasLayer(map, id)) mapAny.removeLayer(id);
    }
  }
  
  const sources = Object.keys(mapAny.getStyle?.()?.sources ?? {});
  for (const source of sources) {
    if (source.startsWith("planner-route-source-")) {
      if (hasSource(map, source)) mapAny.removeSource(source);
    }
  }

  if (hasSource(map, IDS.routeSource)) mapAny.removeSource(IDS.routeSource);

  const allSources = mapAny.getStyle?.()?.sources ?? {};
  for (const sourceId of Object.keys(allSources)) {
    if (sourceId.startsWith(IDS.resistanceSourcePrefix) && hasSource(map, sourceId)) {
      mapAny.removeSource(sourceId);
    }
  }
}
export function addCityBoundaryLayer(
  map: MapTilerMap,
  geojson: GeoJSON.Geometry,
  fillColor = "#6366f1",
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapAny = map as any;

  const featureCollection: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [{ type: "Feature", geometry: geojson, properties: {} }],
  };

  if (!hasSource(map, IDS.cityBoundarySource)) {
    mapAny.addSource(IDS.cityBoundarySource, {
      type: "geojson",
      data: featureCollection,
    });
  } else {
    mapAny.getSource(IDS.cityBoundarySource)?.setData?.(featureCollection);
  }

  // Soft fill layer
  if (!hasLayer(map, IDS.cityBoundaryFill)) {
    mapAny.addLayer({
      id: IDS.cityBoundaryFill,
      type: "fill",
      source: IDS.cityBoundarySource,
      paint: {
        "fill-color": fillColor,
        "fill-opacity": 0.1,
      },
    });
  } else {
    mapAny.setPaintProperty(IDS.cityBoundaryFill, "fill-color", fillColor);
  }

  // Dashed outline border
  if (!hasLayer(map, IDS.cityBoundaryOutline)) {
    mapAny.addLayer({
      id: IDS.cityBoundaryOutline,
      type: "line",
      source: IDS.cityBoundarySource,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": fillColor,
        "line-width": 2,
        "line-opacity": 0.6,
        "line-dasharray": [3, 3],
      },
    });
  } else {
    mapAny.setPaintProperty(IDS.cityBoundaryOutline, "line-color", fillColor);
  }
}

export function removeCityBoundaryLayer(map: MapTilerMap) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapAny = map as any;
  if (hasLayer(map, IDS.cityBoundaryOutline)) mapAny.removeLayer(IDS.cityBoundaryOutline);
  if (hasLayer(map, IDS.cityBoundaryFill)) mapAny.removeLayer(IDS.cityBoundaryFill);
  if (hasSource(map, IDS.cityBoundarySource)) mapAny.removeSource(IDS.cityBoundarySource);
}

export function fitToBoundary(map: MapTilerMap, geojson: GeoJSON.Geometry) {
  let allCoords: number[][] = [];

  if (geojson.type === "Polygon") {
    allCoords = geojson.coordinates.flat();
  } else if (geojson.type === "MultiPolygon") {
    allCoords = geojson.coordinates.flat(2);
  } else {
    return;
  }

  if (allCoords.length === 0) return;

  let minLng = allCoords[0][0];
  let maxLng = allCoords[0][0];
  let minLat = allCoords[0][1];
  let maxLat = allCoords[0][1];

  for (const [lng, lat] of allCoords) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (map as any).fitBounds?.(
    [[minLng, minLat], [maxLng, maxLat]],
    { padding: 20, duration: 900, maxZoom: 14 },
  );
}

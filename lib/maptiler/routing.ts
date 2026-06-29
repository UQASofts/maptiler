export type RouteWaypoint = {
  lat: number;
  lng: number;
  label?: string;
  notes?: string;
  photos?: string[];
  type?: "single" | "bulk";
};

export function toRouteWaypoints(
  points: Array<{
    lat: number;
    lng: number;
    label: string;
    notes?: string | null;
    photos?: string[];
    type?: string;
  }>,
): RouteWaypoint[] {
  return points.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    label: p.label,
    notes: p.notes ?? undefined,
    photos: p.photos,
    type: p.type as "single" | "bulk" | undefined,
  }));
}

export function straightLineGeometry(
  waypoints: Array<{ lat: number; lng: number }>,
): GeoJSON.LineString {
  return {
    type: "LineString",
    coordinates: waypoints.map((p) => [p.lng, p.lat]),
  };
}

/** Builds GeoJSON point features plus a straight line between waypoints. */
export function buildRouteFeatures(
  points: RouteWaypoint[],
  lineProperties?: GeoJSON.GeoJsonProperties,
): GeoJSON.Feature<GeoJSON.Geometry>[] {
  const features: GeoJSON.Feature<GeoJSON.Geometry>[] = [];

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: {
        label: p.label,
        notes: p.notes,
        photos: p.photos ? JSON.stringify(p.photos) : undefined,
        pointType: p.type || "single",
        isEndpoint: i === 0 || i === points.length - 1,
      },
    });
  }

  if (points.length >= 2) {
    features.push({
      type: "Feature",
      geometry: straightLineGeometry(points),
      properties: lineProperties ?? {},
    });
  }

  return features;
}

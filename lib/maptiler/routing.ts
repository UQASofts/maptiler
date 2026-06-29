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

function straightLineGeometry(
  waypoints: Array<{ lat: number; lng: number }>,
): GeoJSON.LineString {
  return {
    type: "LineString",
    coordinates: waypoints.map((p) => [p.lng, p.lat]),
  };
}

async function getRoadRouteFromMapTiler(
  waypoints: Array<{ lat: number; lng: number }>,
): Promise<GeoJSON.LineString | null> {
  const key = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  if (!key || waypoints.length < 2) return null;

  const coords = waypoints.map((p) => `${p.lng},${p.lat}`).join(";");
  try {
    const res = await fetch(
      `https://api.maptiler.com/directions/driving/${coords}.json?key=${key}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const geometry = data?.routes?.[0]?.geometry as
      | GeoJSON.LineString
      | undefined;
    return geometry ?? null;
  } catch {
    return null;
  }
}

async function getRoadRouteFromOsrm(
  waypoints: Array<{ lat: number; lng: number }>,
): Promise<GeoJSON.LineString | null> {
  if (waypoints.length < 2) return null;

  const coords = waypoints.map((p) => `${p.lng},${p.lat}`).join(";");
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const geometry = data?.routes?.[0]?.geometry as
      | GeoJSON.LineString
      | undefined;
    return geometry ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetches a road-snapped route between ordered waypoints.
 * Tries MapTiler Directions first, then OSRM. Falls back to a straight line.
 */
export async function getRoadRouteGeometry(
  waypoints: Array<{ lat: number; lng: number }>,
): Promise<GeoJSON.LineString> {
  if (waypoints.length < 2) {
    return { type: "LineString", coordinates: [] };
  }

  const geometry =
    (await getRoadRouteFromMapTiler(waypoints)) ??
    (await getRoadRouteFromOsrm(waypoints));

  return geometry ?? straightLineGeometry(waypoints);
}

/**
 * Builds GeoJSON point features plus a road-snapped line for map display.
 */
export async function buildRouteFeatures(
  points: RouteWaypoint[],
  lineProperties?: GeoJSON.GeoJsonProperties,
): Promise<GeoJSON.Feature<GeoJSON.Geometry>[]> {
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
    const geometry = await getRoadRouteGeometry(points);
    features.push({
      type: "Feature",
      geometry,
      properties: lineProperties ?? {},
    });
  }

  return features;
}

/**
 * Fetches a road-snapped route between ordered waypoints using the public OSRM API.
 * Returns a GeoJSON FeatureCollection with a single LineString feature, or null on error.
 */
export async function getRoadRoute(
  waypoints: Array<{ lat: number; lng: number }>,
): Promise<GeoJSON.Feature<GeoJSON.LineString> | null> {
  if (waypoints.length < 2) return null;

  const coords = waypoints.map((p) => `${p.lng},${p.lat}`).join(";");

  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const geometry = data?.routes?.[0]?.geometry as GeoJSON.LineString | undefined;
    if (!geometry) return null;

    return {
      type: "Feature",
      geometry,
      properties: {},
    };
  } catch {
    return null;
  }
}

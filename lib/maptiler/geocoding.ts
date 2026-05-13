const API_KEY = process.env.NEXT_PUBLIC_MAPTILER_GEO_KEY || "";

export type SearchResult = {
  name: string;
  lat: number;
  lng: number;
  placeName: string;
};

/**
 * Forward-geocode a query and return up to 5 location suggestions.
 */
export async function searchLocations(
  query: string,
  limit = 5,
): Promise<SearchResult[]> {
  if (!query.trim() || !API_KEY) return [];
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${API_KEY}&limit=${limit}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    const features = data?.features ?? [];
    return features
      .filter((f: any) => f.geometry?.coordinates)
      .map((f: any) => {
        const [lng, lat] = f.geometry.coordinates;
        return {
          name: f.text || f.place_name || "",
          lat,
          lng,
          placeName: f.place_name || "",
        };
      });
  } catch {
    return [];
  }
}

/**
 * Forward-geocode a city/region name and return its bounding box.
 * Returns [minLng, minLat, maxLng, maxLat] or null if not found.
 */
export async function getLocationBbox(
  query: string,
): Promise<[number, number, number, number] | null> {
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${API_KEY}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data?.features?.[0];
    if (feature?.bbox && Array.isArray(feature.bbox) && feature.bbox.length === 4) {
      return feature.bbox as [number, number, number, number];
    }
    // Fall back to a small box around the point
    const [lng, lat] = feature?.geometry?.coordinates ?? [];
    if (typeof lng === "number" && typeof lat === "number") {
      const delta = 0.15;
      return [lng - delta, lat - delta, lng + delta, lat + delta];
    }
    return null;
  } catch {
    return null;
  }
}

export type CityBoundaryResult = {
  name: string;
  geojson: GeoJSON.Geometry;
};

/**
 * Fetches the boundary polygon for a given place name from Nominatim (OpenStreetMap).
 * Free, no API key required. Returns null if nothing useful is found.
 *
 * Usage policy: https://nominatim.org/release-docs/latest/api/Overview/#usage-policy
 */
export async function fetchCityBoundary(
  placeName: string,
): Promise<CityBoundaryResult | null> {
  const encoded = encodeURIComponent(placeName);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&polygon_geojson=1&limit=1`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "RailPlannerApp/1.0 (contact@example.com)",
        "Accept-Language": "en",
      },
    });

    if (!res.ok) {
      console.warn("[geocoding] Nominatim returned", res.status);
      return null;
    }

    const data = (await res.json()) as Array<{
      display_name: string;
      geojson?: GeoJSON.Geometry;
    }>;

    const first = data[0];
    if (!first?.geojson) return null;

    // Only accept Polygon / MultiPolygon — skip Point results
    if (
      first.geojson.type !== "Polygon" &&
      first.geojson.type !== "MultiPolygon"
    ) {
      return null;
    }

    return { name: first.display_name, geojson: first.geojson };
  } catch (err) {
    console.error("[geocoding] Failed to fetch city boundary:", err);
    return null;
  }
}

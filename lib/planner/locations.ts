export type LocationType = "city" | "region";

export type RouteStatus = "study" | "alternative" | "construction";

export type Route = {
  id: string;
  name: string;
  description?: string;
  points: number;
  routeType: string;
  status: RouteStatus;
  color: string;
  lineStyle: string;
};

export type LocationTag = {
  label: string;
  icon?: string;
};

export type Location = {
  id: string;
  name: string;
  type: LocationType;
  notes: string;
  lat: number;
  lng: number;
  iconColor: string;
  tags: LocationTag[];
  routes: Route[];
};

export const SAMPLE_LOCATIONS: Location[] = [
  {
    id: "bremen",
    name: "Bremen",
    type: "city",
    notes:
      "Critical hub for the North-South corridor project. Structural evaluation required for the Weser crossing bypass.",
    lat: 53.0793,
    lng: 8.8017,
    iconColor: "#3b82f6",
    tags: [
      { label: "3 Routes", icon: "routes" },
      { label: "High Speed", icon: "speed" },
    ],
    routes: [
      {
        id: "bremen-1",
        name: "North Central Hub",
        points: 4,
        routeType: "Primary Route",
        status: "study",
        color: "#E91E63",
        lineStyle: "SOLID",
      },
      {
        id: "bremen-2",
        name: "Southern Alternative",
        points: 2,
        routeType: "Feasibility",
        status: "alternative",
        color: "#2196F3",
        lineStyle: "DASHED",
      },
      {
        id: "bremen-3",
        name: "Eastern Corridor",
        points: 6,
        routeType: "Main Line",
        status: "construction",
        color: "#212121",
        lineStyle: "SOLID",
      },
    ],
  },
  {
    id: "hannover",
    name: "Hannover",
    type: "region",
    notes: "Major logistics hub in Lower Saxony.",
    lat: 52.3759,
    lng: 9.732,
    iconColor: "#22c55e",
    tags: [{ label: "1 Route", icon: "routes" }],
    routes: [
      {
        id: "hannover-1",
        name: "Central Station Link",
        points: 3,
        routeType: "Main Line",
        status: "study",
        color: "#4CAF50",
        lineStyle: "SOLID",
      },
    ],
  },
];

export const STATUS_COLORS: Record<RouteStatus, string> = {
  study: "#3b82f6",
  alternative: "#f97316",
  construction: "#ef4444",
};

export const STATUS_LABELS: Record<RouteStatus, string> = {
  study: "Study",
  alternative: "Alternative",
  construction: "Construction",
};

export function mapDbLocation(db: {
  id: string;
  name: string;
  type: string;
  notes: string | null;
  lat: number;
  lng: number;
  iconColor: string;
  tags: string[];
  routes: Array<{
    id: string;
    name: string;
    description: string | null;
    type: string;
    color: string;
    lineStyle: string;
    points: Array<unknown>;
    routeType?: string;
    status?: string;
  }>;
}): Location {
  return {
    id: db.id,
    name: db.name,
    type: db.type as LocationType,
    notes: db.notes ?? "",
    lat: db.lat,
    lng: db.lng,
    iconColor: db.iconColor,
    tags: db.tags.map((t) => {
      if (t.includes("Route")) return { label: t, icon: "routes" as const };
      if (t.includes("Speed")) return { label: t, icon: "speed" as const };
      return { label: t };
    }),
    routes: db.routes.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? undefined,
      points: r.points?.length ?? 0,
      routeType: r.type,
      status: (r.status ?? "study") as RouteStatus,
      color: r.color,
      lineStyle: r.lineStyle,
    })),
  };
}

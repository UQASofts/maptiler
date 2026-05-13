import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientSingleton };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;


export async function getLocationsWithRoutes() {
  return prisma.location.findMany({
    include: {
      routes: {
        include: {
          points: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLocationWithRoutes(id: string) {
  return prisma.location.findUnique({
    where: { id },
    include: {
      routes: {
        include: {
          points: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
}

export async function createLocation(data: {
  name: string;
  notes?: string;
  type: string;
  lat: number;
  lng: number;
  iconColor?: string;
  address?: string;
  tags?: string[];
}) {
  return prisma.location.create({ data });
}

export async function updateLocation(id: string, data: Partial<{
  name: string;
  notes: string;
  type: string;
  lat: number;
  lng: number;
  iconColor: string;
  address: string;
  tags: string[];
}>) {
  return prisma.location.update({ where: { id }, data });
}

export async function deleteLocation(id: string) {
  return prisma.location.delete({ where: { id } });
}

export async function createRoute(data: {
  name: string;
  description?: string;
  type: string;
  color: string;
  lineStyle: string;
  locationId: string;
  points: Array<{ label: string; lat: number; lng: number; notes?: string; order: number; type?: "single" | "bulk" }>;
}) {
  const { points, ...routeData } = data;
  return prisma.route.create({
    data: {
      ...routeData,
      points: {
        create: points,
      },
    },
    include: {
      points: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function updateRoute(id: string, data: Partial<{
  name: string;
  description: string;
  type: string;
  color: string;
  lineStyle: string;
}>) {
  return prisma.route.update({ where: { id }, data });
}

export async function deleteRoute(id: string) {
  return prisma.route.delete({ where: { id } });
}

export async function createRoutePoint(data: {
  label: string;
  lat: number;
  lng: number;
  notes?: string;
  photos?: string[];
  order: number;
  routeId: string;
  type?: "single" | "bulk";
}) {
  return prisma.routePoint.create({ data });
}

export async function deleteRoutePoint(id: string) {
  return prisma.routePoint.delete({ where: { id } });
}

export async function updateRoutePoint(id: string, data: Partial<{
  label: string;
  lat: number;
  lng: number;
  notes: string;
  photos: string[];
  order: number;
}>) {
  return prisma.routePoint.update({ where: { id }, data });
}

export async function getRouteWithPoints(id: string) {
  return prisma.route.findUnique({
    where: { id },
    include: {
      points: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getRoutesByLocationId(locationId: string) {
  return prisma.route.findMany({
    where: { locationId },
    include: {
      points: {
        orderBy: { order: "asc" },
      },
    },
  });
}

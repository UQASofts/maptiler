"use server";

import fs from "fs/promises";
import path from "path";
import { auth } from "@clerk/nextjs/server";

import {
  prisma,
  getLocationsWithRoutes,
  getLocationWithRoutes,
  getRoutesByLocationId,
  getRouteWithPoints,
  createLocation,
  createRoute,
  deleteLocation,
  deleteRoute,
  updateLocation,
  updateRoute,
  createRoutePoint,
  deleteRoutePoint,
  updateRoutePoint as updateRoutePointDb,
} from "./prisma";

export async function fetchLocations() {
  return getLocationsWithRoutes();
}

export async function fetchLocation(id: string) {
  return getLocationWithRoutes(id);
}

export async function fetchRoute(id: string) {
  return getRouteWithPoints(id);
}

export async function fetchLocationRoutes(locationId: string) {
  return getRoutesByLocationId(locationId);
}

// async function requireAdmin() {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");
  
//   const user = await prisma.user.findUnique({ where: { clerkId: userId } });
//   if (user?.role !== "ADMIN") {
//     throw new Error("Forbidden: Admin access required.");
//   }
// }

export async function addLocation(data: {
  name: string;
  notes?: string;
  type: string;
  lat: number;
  lng: number;
  iconColor?: string;
  address?: string;
  tags?: string[];
}) {
  // await requireAdmin();
  return createLocation(data);
}

export async function removeLocation(id: string) {
  // await requireAdmin();
  return deleteLocation(id);
}

export async function editLocation(
  id: string,
  data: Partial<{
    name: string;
    notes: string;
    type: string;
    lat: number;
    lng: number;
    iconColor: string;
    address: string;
    tags: string[];
  }>,
) {
  // await requireAdmin();
  return updateLocation(id, data);
}

export async function addRoute(data: {
  name: string;
  description?: string;
  type: string;
  color: string;
  lineStyle: string;
  locationId: string;
  points: Array<{ label: string; lat: number; lng: number; notes?: string; order: number; type?: "single" | "bulk" }>;
}) {
  // await requireAdmin();
  return createRoute(data);
}

export async function removeRoute(id: string) {
  // await requireAdmin();
  return deleteRoute(id);
}

export async function editRoute(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    type: string;
    color: string;
    lineStyle: string;
  }>,
) {
  // await requireAdmin();
  return updateRoute(id, data);
}

export async function addRoutePoint(data: {
  label: string;
  lat: number;
  lng: number;
  notes?: string;
  photos?: string[];
  order: number;
  routeId: string;
  type?: "single" | "bulk";
}) {
  // await requireAdmin();
  return createRoutePoint(data);
}

export async function removeRoutePoint(id: string) {
  // await requireAdmin();
  return deleteRoutePoint(id);
}

export async function editRoutePoint(
  id: string,
  data: Partial<{
    label: string;
    lat: number;
    lng: number;
    notes: string;
    photos: string[];
    order: number;
  }>,
) {
  // await requireAdmin();
  return updateRoutePointDb(id, data);
}

export async function updateRoutePoint(id: string, data: Partial<{ label: string; lat: number; lng: number; notes: string; order: number }>) {
  // await requireAdmin();
  return updateRoutePointDb(id, data);
}

export async function uploadRoutePhoto(formData: FormData) {
  // await requireAdmin();
  const file = formData.get("photo") as File | null;
  if (!file) throw new Error("No file uploaded");

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  
  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);
  
  return `/uploads/${filename}`;
}

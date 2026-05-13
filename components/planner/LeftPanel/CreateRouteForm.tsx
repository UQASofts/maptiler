"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Location } from "@/lib/planner/locations";

export type RouteState = {
  name: string;
  description: string;
  type: string;
  color: string;
  lineStyle: string;
  points: {
    lat: number;
    lng: number;
    label: string;
    notes?: string;
    photos?: string[];
    type?: "single" | "bulk";
  }[];
};

export type CreateRouteFormProps = {
  location: Location;
  onBack: () => void;
  onSave: (route: RouteState) => void;
  onChange?: (route: RouteState) => void;
  onPickOnMap?: () => void;
  draftLat?: number;
  draftLng?: number;
};

const ROUTE_TYPES = ["HIGH SPEED", "FREIGHT", "COMMUTER", "METRO"] as const;
const ROUTE_TYPE_COLORS: Record<string, string> = {
  "HIGH SPEED": "#E91E63",
  "FREIGHT":    "#FF9800",
  "COMMUTER":   "#2196F3",
  "METRO":      "#9C27B0",
};
const LINE_STYLES = ["SOLID", "DASHED", "DOTTED", "DASH-DOT"] as const;

// Add Coordinate Point Side Panel Component
function AddPointPanel({
  isOpen,
  onClose,
  onSave,
  onPickOnMap,
  draftLat,
  draftLng,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    points: {
      lat: number;
      lng: number;
      label: string;
      notes?: string;
      photos?: string[];
      type?: "single" | "bulk";
    }[],
  ) => void;
  onPickOnMap?: () => void;
  draftLat?: number;
  draftLng?: number;
}) {
  const [label, setLabel] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [notes, setNotes] = useState("");
  const [singlePhotos, setSinglePhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [addDetails, setAddDetails] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [endpointType, setEndpointType] = useState<"start" | "end">("start");

  // Separate details for start and end points in bulk mode
  const [startLabel, setStartLabel] = useState("");
  const [startNotes, setStartNotes] = useState("");
  const [startPhotos, setStartPhotos] = useState<string[]>([]);
  const [endLabel, setEndLabel] = useState("");
  const [endNotes, setEndNotes] = useState("");
  const [endPhotos, setEndPhotos] = useState<string[]>([]);

  const lastProcessedRef = useRef<{lat: number | null, lng: number | null}>({lat: null, lng: null});

  useEffect(() => {
    if (!isOpen) return;
    if (draftLat !== undefined && draftLat !== null && draftLng !== undefined && draftLng !== null) {
      if (lastProcessedRef.current.lat === draftLat && lastProcessedRef.current.lng === draftLng) {
        return;
      }
      
      lastProcessedRef.current = { lat: draftLat, lng: draftLng };

      if (mode === "single") {
        setLat(draftLat.toString());
        setLng(draftLng.toString());
      } else if (mode === "bulk") {
        setBulkText((prev) => {
          const newLine = `${draftLat.toFixed(6)}, ${draftLng.toFixed(6)}`;
          return prev ? `${prev}\n${newLine}` : newLine;
        });
      }
    }
  }, [draftLat, draftLng, mode, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (mode === "single") {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        let finalLabel = label || "";

        onSave([
          {
            lat: latNum,
            lng: lngNum,
            label: finalLabel,
            notes: notes,
            photos: singlePhotos,
            type: "single",
          },
        ]);
        setLabel("");
        setLat("");
        setLng("");
        setNotes("");
        setSinglePhotos([]);
        setAddDetails(false);
        setEndpointType("start");
      }
    } else {
      const lines = bulkText.split("\n");
      const newPoints = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(",").map((s) => s.trim());
        if (parts.length >= 2) {
          const latNum = parseFloat(parts[0]);
          const lngNum = parseFloat(parts[1]);
          if (!isNaN(latNum) && !isNaN(lngNum)) {
            newPoints.push({ lat: latNum, lng: lngNum, label: parts[2] || "", type: "bulk" as const });
          }
        }
      }

      if (addDetails && newPoints.length > 0) {
        if (startLabel || startNotes || startPhotos.length > 0) {
          newPoints[0] = {
            ...newPoints[0],
            label: startLabel ? `Start: ${startLabel}` : "",
            notes: startNotes,
            photos: startPhotos,
          };
        }
        if (endLabel || endNotes || endPhotos.length > 0) {
          const lastIdx = newPoints.length - 1;
          newPoints[lastIdx] = {
            ...newPoints[lastIdx],
            label: endLabel ? `End: ${endLabel}` : "",
            notes: endNotes,
            photos: endPhotos,
          };
        }
      }

      if (newPoints.length > 0) {
        onSave(newPoints);
        setBulkText("");
        setStartLabel("");
        setStartNotes("");
        setStartPhotos([]);
        setEndLabel("");
        setEndNotes("");
        setEndPhotos([]);
        setAddDetails(false);
        setEndpointType("start");
      }
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "single" | "start" | "end" = "single",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("photo", file);
      // We dynamically import to avoid running on client before hydration if not needed,
      // but since it's a server action, it works directly.
      const { uploadRoutePhoto } = await import("@/lib/actions");
      const url = await uploadRoutePhoto(formData);
      if (target === "single") {
        setSinglePhotos((prev) => [...prev, url]);
      } else if (target === "start") {
        setStartPhotos((prev) => [...prev, url]);
      } else {
        setEndPhotos((prev) => [...prev, url]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 sm:absolute sm:inset-auto sm:left-[320px] sm:top-0 z-50 sm:z-20 h-full w-full sm:w-[340px] overflow-hidden bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 p-5">
        <h3 className="text-lg font-semibold text-zinc-900">
          Add Coordinate Point
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="h-[calc(100%-140px)] overflow-y-auto p-5">
        {/* Mode Toggle */}
        <div className="mb-6 flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${mode === "single" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            Single Point
          </button>
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${mode === "bulk" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-700"}`}
          >
            Bulk Import
          </button>
        </div>

        {mode === "single" ? (
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#db2777]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#db2777]">
                Location
              </span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    LATITUDE
                  </label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="41.8781"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus:border-[#db2777] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    LONGITUDE
                  </label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="-87.6298"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus:border-[#db2777] focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={onPickOnMap}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#db2777] bg-[#db2777]/5 py-2.5 text-xs font-medium text-[#be185d] hover:bg-[#db2777]/10"
              >
                <Icon name="marker" className="h-4 w-4" />
                Pick Location on Map
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              {/* <div className="mb-4 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#db2777]" />
                <span className="text-xs font-semibold uppercase tracking-wide text-[#db2777]">Bulk Import CSV</span>
              </div> */}
              <p className="mb-3 text-xs text-zinc-500">
                Paste multiple points, one per line. Format: <br />
                <code className="font-mono text-[#be185d]">
                  latitude, longitude, label (optional)
                </code>
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`41.8781, -87.6298, North Central Hub\n41.8827, -87.6233, East Station\n41.8914, -87.6191`}
                rows={12}
                className="w-full rounded-lg border border-zinc-200 p-3 text-xs font-mono text-zinc-600 placeholder:text-zinc-300 focus:border-[#db2777] focus:outline-none resize-none"
              />
              <button
                type="button"
                onClick={onPickOnMap}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#db2777] bg-[#db2777]/5 py-2.5 text-xs font-medium text-[#be185d] hover:bg-[#db2777]/10"
              >
                <Icon name="marker" className="h-4 w-4" />
                Pick Location on Map
              </button>
            </div>

            <div className="mb-6 flex items-center justify-between rounded-lg border border-zinc-200 p-3">
              <div className=" flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#db2777]" />
                <span className="text-xs font-semibold uppercase tracking-wide text-[#db2777]">
                  Add Details
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAddDetails(!addDetails)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${addDetails ? "bg-[#db2777]" : "bg-zinc-200"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${addDetails ? "translate-x-4" : "translate-x-0"}`}
                />
              </button>
            </div>
          </>
        )}

        {mode === "single" && (
          <>
            <div className="mb-6">
              <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                POINT LABEL
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., North Central Hub"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus:border-[#db2777] focus:outline-none"
              />
            </div>

            {/* Point Details */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#db2777]" />
                <span className="text-xs font-semibold uppercase tracking-wide text-[#db2777]">
                  Point Details
                </span>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                  NOTES
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the geotechnical observations or site conditions..."
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 placeholder:text-zinc-400 focus:border-[#db2777] focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Site Photos */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#db2777]" />
                <span className="text-xs font-semibold uppercase tracking-wide text-[#db2777]">
                  Site Photos
                </span>
              </div>

              {singlePhotos.length > 0 && (
                <div className="mb-3 flex gap-2 overflow-x-auto p-1 pb-2">
                  {singlePhotos.map((url, i) => (
                    <div key={i} className="relative shrink-0">
                      <img
                        src={url}
                        alt={`Photo ${i + 1}`}
                        className="h-16 w-16 rounded-lg object-cover border border-zinc-200"
                      />
                      <button
                        type="button"
                        onClick={() => setSinglePhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                      >
                        <Icon name="close" className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 py-4 text-xs font-medium text-zinc-400 hover:border-zinc-300 hover:text-zinc-500">
                <Icon name="plus" className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Add Site Photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "single")}
                  disabled={isUploading}
                />
              </label>
            </div>
          </>
        )}

        {mode === "bulk" && addDetails && (
          <>
            {/* Endpoint Type Tabs */}
            <div className="mb-6">
              <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
                <button
                  type="button"
                  onClick={() => setEndpointType("start")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${endpointType === "start" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                  Starting Point
                </button>
                <button
                  type="button"
                  onClick={() => setEndpointType("end")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${endpointType === "end" ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                  Ending Point
                </button>
              </div>
            </div>

            {endpointType === "start" ? (
              <div className="mb-6">
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    POINT LABEL
                  </label>
                  <input
                    type="text"
                    value={startLabel}
                    onChange={(e) => setStartLabel(e.target.value)}
                    placeholder="e.g., North Central Hub"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus:border-[#db2777] focus:outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    NOTES
                  </label>
                  <textarea
                    value={startNotes}
                    onChange={(e) => setStartNotes(e.target.value)}
                    placeholder="Describe the geotechnical observations or site conditions..."
                    rows={3}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 placeholder:text-zinc-400 focus:border-[#db2777] focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#db2777]" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#db2777]">
                      Site Photos
                    </span>
                  </div>
                  {startPhotos.length > 0 && (
                    <div className="mb-3 flex gap-2 overflow-x-auto p-1 pb-2">
                      {startPhotos.map((url, i) => (
                        <div key={i} className="relative shrink-0">
                          <img
                            src={url}
                            alt={`Photo ${i + 1}`}
                            className="h-16 w-16 rounded-lg object-cover border border-zinc-200"
                          />
                          <button
                            type="button"
                            onClick={() => setStartPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                          >
                            <Icon name="close" className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 py-4 text-xs font-medium text-zinc-400 hover:border-zinc-300 hover:text-zinc-500">
                    <Icon name="plus" className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Add Site Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "start")}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    POINT LABEL
                  </label>
                  <input
                    type="text"
                    value={endLabel}
                    onChange={(e) => setEndLabel(e.target.value)}
                    placeholder="e.g., South Terminal"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 focus:border-[#db2777] focus:outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    NOTES
                  </label>
                  <textarea
                    value={endNotes}
                    onChange={(e) => setEndNotes(e.target.value)}
                    placeholder="Describe the geotechnical observations or site conditions..."
                    rows={3}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 placeholder:text-zinc-400 focus:border-[#db2777] focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#db2777]" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#db2777]">
                      Site Photos
                    </span>
                  </div>
                  {endPhotos.length > 0 && (
                    <div className="mb-3 flex gap-2 overflow-x-auto p-1 pb-2">
                      {endPhotos.map((url, i) => (
                        <div key={i} className="relative shrink-0">
                          <img
                            src={url}
                            alt={`Photo ${i + 1}`}
                            className="h-16 w-16 rounded-lg object-cover border border-zinc-200"
                          />
                          <button
                            type="button"
                            onClick={() => setEndPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                          >
                            <Icon name="close" className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 py-4 text-xs font-medium text-zinc-400 hover:border-zinc-300 hover:text-zinc-500">
                    <Icon name="plus" className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Add Site Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "end")}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-3 border-t border-zinc-100 bg-white p-5">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-200"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-xl bg-[#db2777] py-3 text-sm font-semibold text-white hover:bg-[#be185d]"
        >
          {mode === "single" ? "Save Point" : "Import Points"}
        </button>
      </div>
    </div>
  );
}

export function CreateRouteForm({
  location,
  onBack,
  onSave,
  onChange,
  onPickOnMap,
  draftLat,
  draftLng,
}: CreateRouteFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("HIGH SPEED");
  const color = ROUTE_TYPE_COLORS[type] ?? "#E91E63";
  const [lineStyle, setLineStyle] = useState("SOLID");
  const [points, setPoints] = useState<
    {
      lat: number;
      lng: number;
      label: string;
      notes?: string;
      photos?: string[];
      type?: "single" | "bulk";
    }[]
  >([]);
  const [showAddPointModal, setShowAddPointModal] = useState(false);

  useEffect(() => {
    onChange?.({ name, description, type, color, lineStyle, points });
  }, [name, description, type, color, lineStyle, points, onChange]);

  const handleSave = () => {
    onSave({ name, description, type, color, lineStyle, points });
  };

  const removePoint = (idx: number) => {
    setPoints((p) => p.filter((_, i) => i !== idx));
  };

  const addPoints = (
    newPoints: {
      lat: number;
      lng: number;
      label: string;
      notes?: string;
      photos?: string[];
      type?: "single" | "bulk";
    }[],
  ) => {
    setPoints((p) => [...p, ...newPoints]);
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          Locations
        </button>
        <span className="text-sm text-zinc-400">›</span>
        <span className="text-sm text-zinc-500">{location.name}</span>
        <span className="text-sm text-zinc-400">›</span>
        <span className="text-sm font-semibold text-[#db2777]">New Route</span>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          Create New Route
        </h2>
        <p className="mb-5 text-sm text-zinc-500">
          Configure transit corridor parameters
        </p>

        {/* Section 01: Route Identity */}
        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            01 Route Identity
          </p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Route Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-black rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[#db2777] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Description
                <span className="text-xs text-zinc-400"> (optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg text-black border border-zinc-200 px-3 py-2 text-sm focus:border-[#db2777] focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-600">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {ROUTE_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
                      type === t
                        ? "text-white shadow-sm ring-2 ring-offset-1"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                    style={
                      type === t
                        ? { backgroundColor: ROUTE_TYPE_COLORS[t] }
                        : {}
                    }
                  >
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: ROUTE_TYPE_COLORS[t] }}
                    />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 02: Appearance */}
        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            02 Appearance
          </p>
          <div className="space-y-3">
            {/* Read-only color preview — auto-assigned from type */}
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-600">
                Route Color
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                <span
                  className="h-5 w-5 shrink-0 rounded-full shadow-sm ring-1 ring-black/10"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono text-xs font-medium text-zinc-700">{color}</span>
                <span className="ml-auto text-xs text-zinc-400">Auto-assigned by type</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-600">
                Line Style
              </label>
              <div className="flex gap-2">
                {LINE_STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setLineStyle(s)}
                    className={`flex-1 rounded-lg border px-2 py-1 text-[8px] font-medium transition-colors ${
                      lineStyle === s
                        ? "border-[#db2777] bg-[#db2777]/10 text-[#be185d]"
                        : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 03: Route Points */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            03 Route Points
          </p>
          <div className="space-y-2">
            {points.map((pt, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-mono text-zinc-600">
                    {pt.lat.toFixed(4)}° N, {pt.lng.toFixed(4)}° W
                  </div>
                  <div className="text-xs text-zinc-400">{pt.label}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removePoint(idx)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
                >
                  <Icon name="close" className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setShowAddPointModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 py-3 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
            >
              <Icon name="plus" className="h-3 w-3" /> ADD COORDINATE POINT
            </button>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex gap-3 border-t border-zinc-200 p-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          CANCEL
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 rounded-xl bg-[#db2777] py-2.5 text-sm font-semibold text-white hover:bg-[#be185d]"
        >
          SAVE ROUTE
        </button>
      </div>

      {/* Add Point Side Panel */}
      <AddPointPanel
        isOpen={showAddPointModal}
        onClose={() => setShowAddPointModal(false)}
        onSave={addPoints}
        onPickOnMap={onPickOnMap}
        draftLat={draftLat}
        draftLng={draftLng}
      />
    </div>
  );
}

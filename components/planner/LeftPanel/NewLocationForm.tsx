"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { LocationType } from "@/lib/planner/locations";
import { searchLocations, type SearchResult } from "@/lib/maptiler/geocoding";

export type NewLocationFormProps = {
  onBack: () => void;
  onSave: (data: {
    name: string;
    type: LocationType;
    notes: string;
    lat: number;
    lng: number;
  }) => void;
  onPickOnMap: () => void;
  draftLat?: number;
  draftLng?: number;
};

export function NewLocationForm({
  onBack,
  onSave,
  onPickOnMap,
  draftLat,
  draftLng,
}: NewLocationFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<LocationType>("city");
  const [notes, setNotes] = useState("");
  const [lat, setLat] = useState(draftLat?.toString() ?? "");
  const [lng, setLng] = useState(draftLng?.toString() ?? "");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Location Name is required");
      return;
    }
    onSave({
      name,
      type,
      notes,
      lat: parseFloat(lat) || 0,
      lng: parseFloat(lng) || 0,
    });
  };

  // Debounced MapTiler search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      const results = await searchLocations(searchQuery, 5);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  const handleSelectSuggestion = (result: SearchResult) => {
    setName(result.placeName);
    setSearchQuery(result.placeName);
    setLat(result.lat.toString());
    setLng(result.lng.toString());
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <Icon name="arrowLeft" className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-zinc-900">New Location</h2>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-full bg-[#db2777] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#be185d]"
        >
          Done
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-5">
        {/* Location Name — MapTiler Autocomplete */}
        <div className="space-y-2" ref={wrapperRef}>
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Location Details <span className="text-[#db2777]">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setName(e.target.value);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              required
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none ring-1 ring-transparent transition-all focus:border-[#db2777] focus:ring-[#db2777]/20"
            />
            {showDropdown && (
              <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                {suggestions.map((result, idx) => (
                  <li
                    key={idx}
                    role="option"
                    onClick={() => handleSelectSuggestion(result)}
                    className="cursor-pointer px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    <div className="font-medium">{result.name}</div>
                    <div className="mt-0.5 text-xs text-zinc-400">{result.placeName}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Type Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("city")}
              className={[
                "flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 transition-all",
                type === "city"
                  ? "border-[#db2777] bg-[#db2777]/10 text-[#be185d]"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300",
              ].join(" ")}
            >
              <Icon name="building" className="h-6 w-6" />
              <span className="text-sm font-medium">City/Town</span>
            </button>
            <button
              type="button"
              onClick={() => setType("region")}
              className={[
                "flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 transition-all",
                type === "region"
                  ? "border-[#db2777] bg-[#db2777]/10 text-[#be185d]"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300",
              ].join(" ")}
            >
              <Icon name="map" className="h-6 w-6" />
              <span className="text-sm font-medium">Region/State</span>
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Notes <span className="text-[8px] text-zinc-400">(optional)</span>
          </label>
          <textarea
            placeholder="Additional infrastructure context..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none ring-1 ring-transparent transition-all focus:border-[#db2777] focus:ring-[#db2777]/20"
          />
        </div>

        {/* Map Position */}
        {/* <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Map Position
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                Latitude
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-1 ring-transparent transition-all focus:border-[#db2777] focus:ring-[#db2777]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                Longitude
              </label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-1 ring-transparent transition-all focus:border-[#db2777] focus:ring-[#db2777]/20"
              />
            </div>
          </div>
        </div> */}

        {/* Pick on Map Button */}
        {/* <button
          type="button"
          onClick={onPickOnMap}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#db2777] bg-[#db2777]/10 py-3 text-sm font-medium text-[#be185d] transition-colors hover:bg-[#db2777]/10"
        >
          <Icon name="marker" className="h-4 w-4" />
          Pick on Map
        </button> */}

        {/* Save Location Button */}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[#db2777] py-3 text-sm font-semibold shadow-md text-white transition-colors hover:bg-[#c01c6d]"
        >
          <Icon name="check" className="h-4 w-4" />
          Save Location
        </button>
      </form>
    </div>
  );
}

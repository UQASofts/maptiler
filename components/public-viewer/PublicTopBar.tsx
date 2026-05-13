"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
// import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

interface PublicTopBarProps {
  locations: { id: string; name: string }[];
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onResetView?: () => void;
}

const ROUTE_FILTERS = [
  "All",
  "HIGH SPEED",
  "FREIGHT",
  "COMMUTER",
  "METRO",
] as const;

const ROUTE_TYPE_COLORS: Record<string, string> = {
  "HIGH SPEED": "#E91E63",
  FREIGHT: "#FF9800",
  COMMUTER: "#2196F3",
  METRO: "#9C27B0",
};

function AuthSection() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/admin"
        className="rounded-lg bg-zinc-900 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        Admin
      </Link>
      {/*
      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      */}
    </div>
  );
}

function LocationDropdown({
  locations,
  selectedLocationId,
  onSelectLocation,
}: {
  locations: { id: string; name: string }[];
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        (ref.current && ref.current.contains(e.target as Node)) ||
        (dropdownRef.current && dropdownRef.current.contains(e.target as Node))
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    // Auto-close on scroll/resize since we are breaking out of the document flow
    window.addEventListener("resize", () => setOpen(false));
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("resize", () => setOpen(false));
    };
  }, []);

  useEffect(() => {
    if (open && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setRect({ top: r.bottom, right: r.right });
    }
  }, [open]);

  const selected = locations.find((l) => l.id === selectedLocationId);

  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
      >
        <Icon
          name="marker"
          className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-zinc-400"
        />
        <span className="max-w-[100px] sm:max-w-[120px] truncate">
          {selected ? selected.name : "All Locations"}
        </span>
        <svg
          className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-zinc-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open &&
        rect &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ top: rect.top + 8, left: Math.max(16, rect.right - 224) }}
            className="fixed z-[100] w-56 rounded-xl border border-zinc-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
          >
            <button
              onClick={() => {
                onSelectLocation("");
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                !selectedLocationId
                  ? "bg-[#db2777]/10 font-medium text-[#be185d]"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              All Locations
            </button>
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => {
                  onSelectLocation(loc.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedLocationId === loc.id
                    ? "bg-[#db2777]/10 font-medium text-[#be185d]"
                    : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#db2777]" />
                {loc.name}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

export function PublicTopBar({
  locations,
  selectedLocationId,
  onSelectLocation,
  activeFilter,
  onFilterChange,
  onResetView,
}: PublicTopBarProps) {
  return (
    <header className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6 py-3 sm:py-0 min-h-[64px] gap-3 sm:gap-0">
      {/* Left side: Logo & Title (Always visible at top on mobile) */}
      <div className="flex w-full items-center justify-between sm:w-auto">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#db2777]">
            <Icon
              name="route"
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white"
            />
          </div>
          <h1 className="text-base sm:text-xl font-semibold sm:font-bold tracking-tight text-zinc-900">
            SampleApp
          </h1>
        </div>
        {/* Auth can sit next to title on mobile for convenience */}
        <div className="sm:hidden">
          <AuthSection />
        </div>
      </div>

      {/* Right side: Tools, Filters & Auth */}
      <div className="flex w-full sm:w-auto items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        <button
          type="button"
          onClick={onResetView}
          className="flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium sm:font-semibold text-[#db2777] transition-colors hover:bg-pink-50"
        >
          <Icon name="reset" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Reset View
        </button>

        <div className="hidden sm:block h-6 w-px bg-zinc-200 shrink-0" />

        {/* Route Type Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {ROUTE_FILTERS.map((f) => {
            const typeColor = ROUTE_TYPE_COLORS[f];
            const isActive = activeFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => onFilterChange(f)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide transition-all ${
                  isActive
                    ? typeColor
                      ? "text-white shadow-sm"
                      : "bg-zinc-800 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
                }`}
                style={
                  isActive && typeColor ? { backgroundColor: typeColor } : {}
                }
              >
                {typeColor && (
                  <span
                    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.8)"
                        : typeColor,
                    }}
                  />
                )}
                {f}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:block h-6 w-px bg-zinc-200 shrink-0" />

        {/* Location Dropdown */}
        <div className="shrink-0">
          <LocationDropdown
            locations={locations}
            selectedLocationId={selectedLocationId}
            onSelectLocation={onSelectLocation}
          />
        </div>

        <div className="hidden sm:block h-6 w-px bg-zinc-200 shrink-0" />

        {/* Auth - hidden on mobile since it's at the top */}
        <div className="hidden sm:block shrink-0">
          <AuthSection />
        </div>
      </div>
    </header>
  );
}

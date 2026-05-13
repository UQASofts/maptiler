import type { SVGProps } from "react";

export type IconName =
  | "map"
  | "bell"
  | "user"
  | "help"
  | "chat"
  | "chevronUp"
  | "info"
  | "reset"
  | "arrowLeft"
  | "plus"
  | "close"
  | "trash"
  | "edit"
  | "building"
  | "marker"
  | "check"
  | "moreVertical"
  | "route"
  | "speed"
  | "eye"
  | "eyeOff";

export type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export function Icon({ name, className, ...props }: IconProps) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "map":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" />
          <path d="M9 3v15" />
          <path d="M15 6v15" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      );
    case "user":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M20 21a8 8 0 00-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "help":
      return (
        <svg {...common} className={className} {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 115.82 1c0 2-3 2-3 4" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z" />
        </svg>
      );
    case "chevronUp":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M18 15l-6-6-6 6" />
        </svg>
      );
    case "info":
      return (
        <svg {...common} className={className} {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      );
    case "reset":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M21 12a9 9 0 11-3-6.7" />
          <path d="M21 3v6h-6" />
        </svg>
      );
    case "arrowLeft":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "close":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common} className={className} {...props}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case "building":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-4h6v4" />
        </svg>
      );
    case "marker":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M12 2a7 7 0 00-7 7c0 2 1 4 4 6v3h6v-3c3-2 4-4 4-6a7 7 0 00-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} className={className} {...props}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "moreVertical":
      return (
        <svg {...common} className={className} {...props}>
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      );
    case "route":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M6 9l6 6 6-6" />
          <circle cx="12" cy="6" r="2" fill="currentColor" />
          <circle cx="12" cy="18" r="2" fill="currentColor" />
        </svg>
      );
    case "speed":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "eyeOff":
      return (
        <svg {...common} className={className} {...props}>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      );
    default:
      return null;
  }
}


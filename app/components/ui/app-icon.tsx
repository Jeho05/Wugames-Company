import type { SVGProps } from "react";

export type IconName =
  | "arrow-right"
  | "arrow-up-right"
  | "bell"
  | "boxes"
  | "building"
  | "calendar"
  | "camera"
  | "chart"
  | "check"
  | "chevron-down"
  | "clipboard"
  | "clock"
  | "close"
  | "dashboard"
  | "dots"
  | "download"
  | "file-text"
  | "folder"
  | "hardhat"
  | "lock"
  | "map"
  | "menu"
  | "message"
  | "minus"
  | "newspaper"
  | "package"
  | "plus"
  | "search"
  | "settings"
  | "shield"
  | "shopping-bag"
  | "sparkles"
  | "trash"
  | "truck"
  | "users"
  | "user-plus"
  | "warning";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 20, ...props }: IconProps) {
  const common = {
    fill: "none",
    height: size,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    width: size,
    ...props,
  };

  switch (name) {
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "arrow-up-right":
      return (
        <svg {...common}>
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
      );
    case "boxes":
      return (
        <svg {...common}>
          <path d="m7 11 5 3 5-3M12 14v6M4 8l8-4 8 4v8l-8 4-8-4V8Z" />
          <path d="m4 8 8 4 8-4" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M4 21V5l8-3 8 3v16M9 21v-5h6v5M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect height="17" rx="2" width="18" x="3" y="4" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M4 8h3l2-2.5h6L17 8h3v12H4V8Z" />
          <circle cx="12" cy="13.5" r="3.5" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V5M4 19h16M8 16v-4M12 16V8M16 16V5" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4.2 4L19 6.5" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="m7 10 5 5 5-5" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...common}>
          <rect height="18" rx="2" width="14" x="5" y="4" />
          <path d="M9 4V3h6v1M9 10h6M9 14h4" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5l3.4 2" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case "dashboard":
      return (
        <svg {...common}>
          <rect height="7" rx="1.5" width="7" x="3" y="3" />
          <rect height="7" rx="1.5" width="7" x="14" y="3" />
          <rect height="7" rx="1.5" width="7" x="3" y="14" />
          <rect height="7" rx="1.5" width="7" x="14" y="14" />
        </svg>
      );
    case "dots":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" fill="currentColor" r="1" />
          <circle cx="12" cy="12" fill="currentColor" r="1" />
          <circle cx="19" cy="12" fill="currentColor" r="1" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
        </svg>
      );
    case "file-text":
      return (
        <svg {...common}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
          <path d="M14 3v6h6M8 13h8M8 17h5" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
        </svg>
      );
    case "hardhat":
      return (
        <svg {...common}>
          <path d="M4 16v-2a8 8 0 0 1 16 0v2M3 16h18M8 10V8M12 8V6M16 10V8M6 20h12" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect height="11" rx="2" width="14" x="5" y="10" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
          <path d="M9 3v15M15 6v15" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M20 15a4 4 0 0 1-4 4H9l-5 3V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8Z" />
          <path d="M8 10h8M8 14h5" />
        </svg>
      );
    case "minus":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
        </svg>
      );
    case "newspaper":
      return (
        <svg {...common}>
          <rect height="16" rx="2" width="18" x="3" y="4" />
          <path d="M7 8h10M7 12h6M7 16h9" />
        </svg>
      );
    case "package":
      return (
        <svg {...common}>
          <path d="m4 7 8-4 8 4v10l-8 4-8-4V7Z" />
          <path d="m4 7 8 4 8-4M12 11v10" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.1 2.1-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V20.3h-3v-.1A1.7 1.7 0 0 0 10.7 18.6a1.7 1.7 0 0 0-1.88.34l-.06.06-2.1-2.1.06-.06A1.7 1.7 0 0 0 7.06 15 1.7 1.7 0 0 0 5.5 14H5.4v-3h.1a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.1-2.1.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.55V4.7h3v.08A1.7 1.7 0 0 0 15.76 6.3a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.1 2.1-.06.06A1.7 1.7 0 0 0 19.4 10 1.7 1.7 0 0 0 21 11h.1v3H21A1.7 1.7 0 0 0 19.4 15Z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "shopping-bag":
      return (
        <svg {...common}>
          <path d="M6 8h12l1 12.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.5L6 8Z" />
          <path d="M9 10V6a3 3 0 0 1 6 0v4" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3ZM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16M9 7V5h6v2M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M3 6h11v10H3zM14 10h3l3 3v3h-6z" />
          <circle cx="7" cy="18" r="1.5" />
          <circle cx="17" cy="18" r="1.5" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20M16 5.5a3 3 0 0 1 0 5.8M17 14c2.2.2 3.5 1.6 3.5 3.8V20" />
        </svg>
      );
    case "user-plus":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20M19 9v5M16.5 11.5h5" />
        </svg>
      );
    case "warning":
      return (
        <svg {...common}>
          <path d="m12 3 9 16H3L12 3Z" />
          <path d="M12 9v4M12 16h.01" />
        </svg>
      );
  }
}

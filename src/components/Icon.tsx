import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "home"
  | "feather"
  | "sprout"
  | "tree"
  | "user"
  | "mic"
  | "send"
  | "close"
  | "arrow-right"
  | "arrow-left"
  | "spark"
  | "download"
  | "heart"
  | "shield"
  | "edit"
  | "trash"
  | "play"
  | "pause"
  | "check"
  | "book"
  | "chevron-down"
  | "leaf"
  | "moon"
  | "quote"
  | "refresh";

const paths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  feather: (
    <>
      <path d="M20.5 3.5C13 4 7.5 8.5 6 16.5l-2.5 4" />
      <path d="M20.5 3.5c.6 5.4-2.4 10-8 11.5-2 .5-4 .3-6-.5" />
      <path d="M8 15c3.5-.5 6.5-2.5 8-6" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-7" />
      <path d="M12 14c-4.5 0-7-2.5-7-7 4.5 0 7 2.5 7 7Z" />
      <path d="M12 12c4.2 0 6.5-2.2 6.5-6.2C14.3 5.8 12 8 12 12Z" />
    </>
  ),
  tree: (
    <>
      <path d="M12 21v-5" />
      <path d="M8 16h8" />
      <path d="M12 16 7 11" />
      <path d="M12 14l5-5" />
      <path d="M7 11a4 4 0 1 1 3-6.5A4 4 0 0 1 17 6a4 4 0 1 1 0 7" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.2 3.5-5 7-5s6.2 1.8 7 5" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3" />
    </>
  ),
  send: (
    <>
      <path d="M21 3 10 14" />
      <path d="m21 3-7 18-4-7-7-4 18-7Z" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M4 12h15" />
      <path d="m14 7 5 5-5 5" />
    </>
  ),
  "arrow-left": (
    <>
      <path d="M20 12H5" />
      <path d="m10 7-5 5 5 5" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="m5.6 5.6 2.8 2.8" />
      <path d="m15.6 15.6 2.8 2.8" />
      <path d="m18.4 5.6-2.8 2.8" />
      <path d="m8.4 15.6-2.8 2.8" />
      <circle cx="12" cy="12" r="2.2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 20h16" />
    </>
  ),
  heart: (
    <path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" />
  ),
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4.5 2.8 7.6 7 9 4.2-1.4 7-4.5 7-9V6l-7-3Z" />
      <path d="m8.8 12 2.2 2.2 4.4-4.4" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="m6.5 7 .8 13h9.4l.8-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  play: <path d="m8 5 11 7-11 7V5Z" />,
  pause: (
    <>
      <path d="M9 5v14" />
      <path d="M15 5v14" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5L20 7" />,
  book: (
    <>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5v-13Z" />
      <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  leaf: (
    <>
      <path d="M20 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-7 10-16Z" />
      <path d="M5 20c2-6 5-9 10-12" />
    </>
  ),
  moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
  quote: (
    <>
      <path d="M10 11H5.5A2.5 2.5 0 0 1 3 8.5v-3A2.5 2.5 0 0 1 5.5 3H9a2 2 0 0 1 2 2v8c0 4.5-2 7-5 8" />
      <path d="M21 11h-4.5A2.5 2.5 0 0 1 14 8.5v-3A2.5 2.5 0 0 1 16.5 3H20a2 2 0 0 1 2 2v8c0 4.5-2 7-5 8" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-2.3 6" />
      <path d="M20 4v7h-7" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.6,
  ...props
}: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

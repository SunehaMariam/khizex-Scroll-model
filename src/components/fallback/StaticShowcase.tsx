interface StaticShowcaseProps {
  readonly reason: "no-webgl" | "low-end" | "reduced-motion";
}

const REASON_COPY: Record<StaticShowcaseProps["reason"], string> = {
  "no-webgl": "Your browser doesn't support WebGL, so here's the static version.",
  "low-end": "Showing a lighter version of this page for smoother scrolling on your device.",
  "reduced-motion": "Motion is reduced because your system asked for it.",
};
export function StaticShowcase({ reason }: StaticShowcaseProps): JSX.Element {
  return (
    <div className="static-showcase">
      <svg
        viewBox="0 0 480 360"
        className="static-showcase__art"
        role="img"
        aria-label="Illustration of a pair of wireless earbuds resting beside their charging case"
      >
        <ellipse cx="240" cy="330" rx="150" ry="14" fill="var(--ink)" opacity="0.06" />
        <rect x="150" y="120" width="120" height="150" rx="34" fill="var(--surface-strong)" stroke="var(--ink)" strokeOpacity="0.08" strokeWidth="2" />
        <rect x="160" y="130" width="100" height="66" rx="20" fill="var(--base)" opacity="0.7" />
        <circle cx="150" cy="230" r="72" fill="none" stroke="var(--accent)" strokeOpacity="0.18" strokeWidth="2" />
        <g transform="translate(60 205)">
          <ellipse cx="0" cy="0" rx="26" ry="32" fill="var(--surface-strong)" stroke="var(--ink)" strokeOpacity="0.1" strokeWidth="2" />
          <rect x="-7" y="24" width="14" height="34" rx="7" fill="var(--surface-strong)" stroke="var(--ink)" strokeOpacity="0.1" strokeWidth="2" />
        </g>
        <g transform="translate(360 205)">
          <ellipse cx="0" cy="0" rx="26" ry="32" fill="var(--surface-strong)" stroke="var(--ink)" strokeOpacity="0.1" strokeWidth="2" />
          <rect x="-7" y="24" width="14" height="34" rx="7" fill="var(--surface-strong)" stroke="var(--ink)" strokeOpacity="0.1" strokeWidth="2" />
        </g>
      </svg>
      <p className="static-showcase__note">{REASON_COPY[reason]}</p>
    </div>
  );
}

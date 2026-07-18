import { Suspense, lazy, useMemo, useRef } from "react";
import { TEXT_REVEALS } from "@/config/timeline";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { useInView } from "@/hooks/useInView";
import { useScrollChoreography } from "@/hooks/useScrollChoreography";
import { WaveformProgress } from "@/components/ui/WaveformProgress";
import { StaticShowcase } from "@/components/fallback/StaticShowcase";
import { SceneErrorBoundary } from "@/components/scene/SceneErrorBoundary";
import type { RenderMode } from "@/types/scroll";
const SceneCanvas = lazy(() =>
  import("@/components/scene/SceneCanvas").then((m) => ({ default: m.SceneCanvas }))
);

function resolveRenderMode(
  hasWebGL: boolean,
  prefersReducedMotion: boolean,
  isLowEndDevice: boolean
): RenderMode {
  if (!hasWebGL) return { kind: "static-fallback", reason: "no-webgl" };
  if (prefersReducedMotion) return { kind: "reduced-motion" };
  if (isLowEndDevice) return { kind: "static-fallback", reason: "low-end" };
  return { kind: "full-3d" };
}

export function ShowcaseSection(): JSX.Element {
  const { hasWebGL, prefersReducedMotion, isLowEndDevice } = useDeviceCapability();
  const mode = useMemo(
    () => resolveRenderMode(hasWebGL, prefersReducedMotion, isLowEndDevice),
    [hasWebGL, prefersReducedMotion, isLowEndDevice]
  );

  const outerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const textPanelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isInView = useInView(outerRef, "0px");
  useScrollChoreography(
    { section: sectionRef, textPanels: textPanelRefs, progressBar: progressBarRef },
    mode.kind === "full-3d"
  );

  if (mode.kind !== "full-3d") {
    const reason = mode.kind === "reduced-motion" ? "reduced-motion" : mode.reason;
    return (
      <section className="showcase showcase--static" aria-label="Product showcase">
        <StaticShowcase reason={reason} />
        <div className="showcase__text-layer" style={{ position: "static", padding: "48px max(24px, (100vw - 1180px) / 2)" }}>
          <div style={{ display: "grid", gap: "32px", maxWidth: "760px", margin: "0 auto" }}>
            {TEXT_REVEALS.map((reveal) => (
              <div key={reveal.id}>
                {/* <span className="text-panel__eyebrow">{reveal.eyebrow}</span> */}
                <h3 className="text-panel__heading">{reveal.heading}</h3>
                <p className="text-panel__body">{reveal.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div ref={outerRef}>
      <section ref={sectionRef} className="showcase" aria-label="Product showcase, scroll to animate">
        <div className="showcase__canvas-wrap">
          <SceneErrorBoundary>
            <Suspense fallback={<div className="scene-fallback-skeleton" />}>
              <SceneCanvas isInView={isInView} />
            </Suspense>
          </SceneErrorBoundary>
        </div>

        <WaveformProgress ref={progressBarRef} />

        <div className="showcase__text-layer">
          {TEXT_REVEALS.map((reveal) => (
            <div
              key={reveal.id}
              ref={(el) => {
                textPanelRefs.current[reveal.id] = el;
              }}
              className={`text-panel text-panel--${reveal.align}`}
            >
              {/* <span className="text-panel__eyebrow">{reveal.eyebrow}</span> */}
              <h3 className="text-panel__heading">{reveal.heading}</h3>
              <p className="text-panel__body">{reveal.body}</p>
            </div>
          ))}
        </div>

        <div className="visually-hidden">
          {TEXT_REVEALS.map((reveal) => (
            <p key={reveal.id}>
              {reveal.heading} {reveal.body}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

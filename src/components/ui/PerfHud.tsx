import { useEffect, useRef, useState } from "react";

/**
 * Small on-page frame-timing readout. This is a live supplement to the
 * DevTools Performance-panel profiling described in the README, not a
 * replacement for it — it's here so frame health is visible at a glance
 * while scrubbing, without opening dev tools.
 */
export function PerfHud(): JSX.Element {
  const [fps, setFps] = useState(60);
  const frames = useRef(0);
  const lastSample = useRef(performance.now());

  useEffect(() => {
    let rafId: number;

    const tick = (now: number): void => {
      frames.current += 1;
      const elapsed = now - lastSample.current;
      if (elapsed >= 500) {
        setFps(Math.round((frames.current * 1000) / elapsed));
        frames.current = 0;
        lastSample.current = now;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="perf-hud" aria-hidden="true">
      frame budget · {fps} fps
    </div>
  );
}

import { Suspense, useEffect, useState } from "react";
import { Nav } from "@/components/ui/Nav";
import { PageLoader } from "@/components/ui/PageLoader";
import { PerfHud } from "@/components/ui/PerfHud";
import { IntroSection } from "@/components/sections/IntroSection";
import { ShowcaseSection } from "@/components/sections/ShowcaseSection";
// import { SpecsSection } from "@/components/sections/SpecsSection";
import { FinaleSection } from "@/components/sections/FinaleSection";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLenis } from "@/hooks/useLenis";

const SHOW_PERF_HUD = new URLSearchParams(window.location.search).has("perf");

export default function App(): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const [appReady, setAppReady] = useState(false);

  useLenis(!prefersReducedMotion);

  useEffect(() => {
    // Fonts + first-frame layout settle almost immediately; this just
    // avoids a flash of unstyled content on very slow connections.
    const id = window.setTimeout(() => setAppReady(true), 220);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <a className="skip-link" href="#specs-heading">
        Skip scroll animation
      </a>
      {!appReady && <PageLoader />}
      <Nav />
      <main>
        <IntroSection />
        <Suspense fallback={<div className="scene-fallback-skeleton" style={{ height: "100vh" }} />}>
          <ShowcaseSection />
        </Suspense>
        {/* <SpecsSection /> */}
        <FinaleSection />
      </main>
      {SHOW_PERF_HUD && <PerfHud />}
    </>
  );
}

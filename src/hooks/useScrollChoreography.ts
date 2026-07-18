import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger, ensureGsapRegistered } from "@/lib/gsap";
import { heroProgress } from "@/lib/progressStore";
import { PIN_SCROLL_LENGTH_VH, SCRUB_SECONDS, TEXT_REVEALS } from "@/config/timeline";

interface ChoreographyRefs {
  readonly section: RefObject<HTMLDivElement>;
  readonly textPanels: RefObject<Record<string, HTMLDivElement | null>>;
  readonly progressBar: RefObject<HTMLDivElement>;
}

const REVEAL_SPAN = 0.04; // fraction of total progress each fade-in/out takes

export function useScrollChoreography(
  { section, textPanels, progressBar }: ChoreographyRefs,
  enabled: boolean
): void {
  useEffect(() => {
    if (!enabled) return undefined;
    const sectionEl = section.current;
    if (!sectionEl) return undefined;

    ensureGsapRegistered();

    const ctx = gsap.context(() => {
    
      const textTimeline = gsap.timeline({ paused: true });

      for (const reveal of TEXT_REVEALS) {
        const el = textPanels.current?.[reveal.id];
        if (!el) continue;

        gsap.set(el, { autoAlpha: 0, y: 28 });

        textTimeline.fromTo(
          el,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: REVEAL_SPAN, ease: "power2.out" },
          reveal.inProgress
        );
        textTimeline.to(
          el,
          { autoAlpha: 0, y: -28, duration: REVEAL_SPAN, ease: "power2.in" },
          Math.max(reveal.outProgress - REVEAL_SPAN, reveal.inProgress + REVEAL_SPAN)
        );
      }

      const trigger = ScrollTrigger.create({
        trigger: sectionEl,
        start: "top top",
        end: `+=${PIN_SCROLL_LENGTH_VH}%`,
        pin: true,
        anticipatePin: 1,
        scrub: SCRUB_SECONDS,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          heroProgress.set(self.progress);
          textTimeline.progress(self.progress);
          if (progressBar.current) {
            progressBar.current.style.transform = `scaleY(${self.progress})`;
          }
        },
      });

     
      const onResize = (): void => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize);

      return () => {
        trigger.kill();
        window.removeEventListener("resize", onResize);
      };
    }, sectionEl);

    return () => ctx.revert();
  }, [enabled, section, textPanels, progressBar]);
}

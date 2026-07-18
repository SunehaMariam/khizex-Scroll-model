# An Apple Style landing Page

An Apple-stylelanding page where a real `.glb` model animates in lockstep with scroll position.

**Stack:** React + strict TypeScript, Vite, React Three Fiber / drei, GSAP + ScrollTrigger, Lenis.

```
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks, then bundles to dist/
npm run preview   # serve the production build locally
```

Append `?perf` to the URL (e.g. `localhost:5173/?perf`) to show a live frame-timing HUD
in the corner while you scroll.

---

## 1. Architecture

```
src/
  config/timeline.ts         ← the single source of truth for scroll choreography
  types/scroll.ts             ← discriminated unions / interfaces for all of the above
  lib/
    interpolate.ts            ← pure function: (progress, keyframes) → scene state
    gsap.ts                   ← ScrollTrigger registration singleton
    progressStore.ts          ← external pub-sub store (scroll progress, no React re-renders)
  hooks/
    useScrollChoreography.ts  ← wires GSAP pin + text-reveal timeline to the store
    useLenis.ts                useReducedMotion.ts   useDeviceCapability.ts   useInView.ts
  components/
    scene/          ← AirpodsModel, CameraRig, SceneCanvas, CanvasLoader, SceneErrorBoundary
    sections/       ← IntroSection, ShowcaseSection (the pinned hero), SpecsSection, FinaleSection
    ui/             ← Nav, WaveformProgress, PageLoader, PerfHud
    fallback/       ← StaticShowcase (no-WebGL / reduced-motion / low-end)
```

**The model.** `public/models/airpods.glb` is a real, unmodified export with four named
scene-graph nodes: `case_top`, `casebottom`, `airpod1`, `airpod_2` (no baked animation —
the file only has meshes and a hierarchy). The scroll timeline drives these four nodes
directly by name, plus the camera, rather than playing back an authored animation clip.

**Why nodes are driven as deltas, not absolute transforms.** `AirpodsModel` captures each
node's bind pose (its transform as authored) on load, and the timeline config expresses
every keyframe as an *offset* from that bind pose, in units that are a fraction of the
model's own normalized size (longest bounding-box axis = 1). That keeps the config
independent of how the source file happened to be scaled/exported. Bounding-box
normalization is measured only from the four product nodes — the source file also ships
its own ground-plane and point-light placeholders from the original Blender scene, which
would otherwise badly skew the bounding box (a large floor plane dwarfing a small case).

## 2. Scroll choreography

`src/config/timeline.ts` is the one file every scroll-to-animation number lives in —
components never hardcode a rotation or scroll fraction. It exports:

- `SCENE_KEYFRAMES` — five keyframes (`closed → opening → open → float → hero`), each a
  complete description of every node's pose *and* the camera's position/lookAt/fov at
  that point in the scroll.
- `TEXT_REVEALS` — four narrative panels, each with an `inProgress`/`outProgress` window,
  independent of the model keyframes so copy and geometry can be retimed separately.
- `PIN_SCROLL_LENGTH_VH` / `SCRUB_SECONDS` — the two knobs that control how much scroll
  distance the pinned section consumes and how "silky vs. snappy" the scrub feels.

`src/lib/interpolate.ts` is a pure function that takes a progress value (0–1) and the
keyframe list and returns fully-interpolated model + camera state, using smoothstep easing
between the two surrounding keyframes. It's called from `useFrame` in both `AirpodsModel`
and `CameraRig` — same input, same output, every frame, in both scroll directions. Because
it's a pure function of `progress` (not of "time since last event"), scrubbing backward is
free: there's no separate reverse-animation path to get wrong.

**Why GSAP + ScrollTrigger over Framer Motion.** ScrollTrigger's `pin` + `scrub` is a
closer match to Apple-style choreography (pinning an element while an internal timeline
scrubs against scroll position) than Framer's `useScroll`/`useTransform`, which is more
naturally suited to transform-on-scroll without a native pinning primitive. Only one
scroll-animation library drives the timeline — GSAP owns pinning, the text-reveal
timeline, and the `progress` value; R3F only *reads* that value in `useFrame`.

**Scrub smoothness (requirement 3.4).** `ScrollTrigger`'s `scrub: 0.65` (a number, not
`true`) makes it internally tween its virtual progress toward the real scroll position
over ~0.65s, so fast flicks and large wheel deltas still interpolate through intermediate
states instead of snapping — verified by scrubbing quickly in both directions with
DevTools throttling.

**Keyboard scroll.** There's no scroll-jacking here — Lenis smooths input, but the page
still uses real document scroll, so Page Down / Space / arrow keys move the actual
scrollbar and drive the same `ScrollTrigger.onUpdate` as wheel/touch input. No dead zones.

**Resize.** A `window.addEventListener('resize', () => ScrollTrigger.refresh())` recomputes
pin start/end boundaries; `invalidateOnRefresh: true` on the trigger keeps captured start
values from going stale.

## 3. Smooth scroll: Lenis + GSAP

`useLenis` creates one Lenis instance, ticks it from `gsap.ticker` (instead of running its
own `requestAnimationFrame` loop), and calls `ScrollTrigger.update` on every Lenis scroll
event. That keeps the two libraries in phase — Lenis smooths the input, ScrollTrigger reads
the result. Lenis is skipped entirely under `prefers-reduced-motion: reduce`, restoring
native, immediate scroll behavior.

## 4. Performance & loading strategy

- **Lazy loading.** `ShowcaseSection` lazy-imports `SceneCanvas` (`React.lazy` +
  `Suspense`), so the R3F/Three/drei bundle and the `.glb` never block first paint. In the
  production build this shows up as its own ~960 KB chunk, separate from the ~290 KB main
  bundle — verified with `npm run build`.
- **Loading state.** `CanvasLoader` uses drei's `useProgress` to show a percentage while
  the compressed `.glb` streams in, inside the Suspense boundary around `<AirpodsModel />`.
- **Render-loop pausing.** `SceneCanvas` receives `frameloop={isInView ? "always" : "never"}`
  from an `IntersectionObserver`-backed `useInView` hook, so zero frames are computed once
  the canvas scrolls out of view. One implementation detail worth calling out: the
  `IntersectionObserver` watches a stable **outer wrapper**, not the pinned section itself.
  GSAP's pin implementation reparents the pinned element into a generated spacer div; an
  observer created on the element before that reparent can silently stop firing afterward
  in some engines. Observing an ancestor that GSAP never touches sidesteps that entirely.
- **No external environment asset.** drei's `<Environment preset="…">` streams an `.hdr`
  file from a third-party CDN — a real dependency on the scroll-critical path, and a single
  point of failure if that host is slow or unreachable (it was unreachable in this sandbox,
  and the resulting fetch failure crashed the whole scene with no boundary to catch it).
  Reflections here instead come from a handful of drei `<Lightformer>` planes rendered into
  a cubemap at runtime — visually similar, zero network requests, and it can't fail.
- **Defense in depth.** `SceneErrorBoundary` wraps the lazy scene: if anything in the 3D
  path still throws at runtime (driver crash, future asset failure), it renders the same
  static fallback used for no-WebGL devices instead of taking down the page.
- **Frame timing.** `PerfHud` (`?perf` query param) shows a live rolling fps readout while
  scrubbing. For the actual profiling pass: open Chrome DevTools → Performance, enable
  4× CPU throttling, record while scrolling fast through the pinned section both directions,
  and confirm the "Frames" track stays close to the 16.6 ms budget with no long tasks on
  the main thread during scrub (GSAP's scrub tween and the R3F `useFrame` writes are the
  only per-frame work; there's no React state update in that hot path — see
  `progressStore.ts`).

## 5. Fallback strategy (requirement 3.5)

`useDeviceCapability` resolves one of three render modes before anything 3D is mounted:

| Condition | Mode | Behavior |
|---|---|---|
| No WebGL context available | `static-fallback` (`no-webgl`) | Abstract SVG illustration + all copy stacked normally, no pin |
| `prefers-reduced-motion: reduce` | `reduced-motion` | Same static, non-scroll-jacked layout |
| `hardwareConcurrency ≤ 4` **and** `deviceMemory ≤ 4` | `static-fallback` (`low-end`) | Same static layout — a conservative, false-positive-safe heuristic |
| Otherwise | `full-3d` | The full pinned scroll experience |

All three degraded paths render the exact same narrative copy as the 3D version, just in
normal document flow with no motion — nothing is lost, only the choreography.

## 6. Accessibility (requirement 3.6)

- The animated text panels use GSAP's `autoAlpha` (opacity + `visibility`), which does
  hide content from some assistive tech while off-screen in the choreography. To guarantee
  narrative copy is always reachable, `ShowcaseSection` also renders every reveal's heading
  and body in a `.visually-hidden` block that's always present in the accessibility tree,
  independent of scroll state.
- No custom scroll-jacking: keyboard scroll (Page Down/Space/arrows) drives the same native
  scroll position GSAP reads, so there are no dead zones for keyboard-only users.
- `:focus-visible` styling and a "skip scroll animation" link jump straight past the pinned
  section to the specs content.

## 7. Strict TypeScript

`tsconfig.json` has `strict: true` plus `noUncheckedIndexedAccess`, `noUnusedLocals`, and
`noUnusedParameters`. ESLint additionally sets `@typescript-eslint/no-explicit-any: "error"`.
`RenderMode` and `DeviceCapability` are discriminated unions (`types/scroll.ts`); every
keyframe, node pose, and camera pose has an explicit interface.

## 8. Known trade-offs / next steps

- The case lid's hinge rotation pivots around the node's own authored origin rather than a
  dedicated hinge empty, so the open/close motion is a reasonable approximation rather than
  a physically exact hinge — refining that would mean re-exporting the source file with an
  authored pivot point.
- The production bundle's 3D chunk (~960 KB / ~265 KB gzipped) is large by general web
  standards but reasonable for a scroll-driven 3D showcase; it's lazy-loaded and off the
  critical path, and could be trimmed further with Draco geometry compression on the
  source asset if bundle size becomes a hard constraint.







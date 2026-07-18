// import { useEffect, useRef } from "react";

// interface Spec {
//   readonly value: string;
//   readonly label: string;
// }

// const SPECS: readonly Spec[] = [
//   { value: "6 hrs", label: "Playback per charge, buds only" },
//   { value: "30 hrs", label: "Total playback with the case" },
//   { value: "IPX4", label: "Sweat and splash resistant" },
//   { value: "11", label: "Hinge detents holding the lid at any angle" },
//   { value: "0.3s", label: "From case to routed audio" },
//   { value: "18g", label: "Case weight, both buds included" },
// ];

// export function SpecsSection(): JSX.Element {
//   const gridRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const grid = gridRef.current;
//     if (!grid) return undefined;

//     const cards = Array.from(grid.querySelectorAll<HTMLElement>(".spec-card"));
//     const observer = new IntersectionObserver(
//       (entries) => {
//         for (const entry of entries) {
//           if (entry.isIntersecting) {
//             entry.target.classList.add("is-visible");
//             observer.unobserve(entry.target);
//           }
//         }
//       },
//       { threshold: 0.3 }
//     );

//     for (const card of cards) observer.observe(card);
//     return () => observer.disconnect();
//   }, []);

//   return (
//     <section className="specs" aria-label="Specifications">
//       <div className="specs__head">
//         <span className="specs__eyebrow">Specifications</span>
//         <h2 className="specs__title" id="specs-heading" tabIndex={-1}>
//           The numbers behind the motion you just scrolled through.
//         </h2>
//       </div>
//       <div className="specs__grid" ref={gridRef}>
//         {SPECS.map((spec) => (
//           <div className="spec-card" key={spec.label}>
//             <div className="spec-card__value">{spec.value}</div>
//             <p className="spec-card__label">{spec.label}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

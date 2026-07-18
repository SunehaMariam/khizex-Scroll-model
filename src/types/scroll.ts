/**
 * Strict, explicit types for the scroll-to-animation system.
 * No `any` anywhere in this codebase — discriminated unions are used
 * wherever a value can take more than one distinct shape.
 */

export type Vec3 = readonly [x: number, y: number, z: number];

/** A single pose for one named node in the .glb scene graph. */
export interface NodePose {
  readonly position: Vec3;
  readonly rotation: Vec3; // Euler, radians
  readonly scale: number;
}

/** The set of scene-graph nodes this build animates, keyed by their glTF node name. */
export type AnimatedNodeName =
  | "airpod_2"
  | "airpod1"
  | "case_top"
  | "casebottom";

export type ModelPoseMap = Readonly<Record<AnimatedNodeName, NodePose>>;

/** A camera pose the scroll timeline can interpolate toward. */
export interface CameraPose {
  readonly position: Vec3;
  readonly lookAt: Vec3;
  readonly fov: number;
}

/**
 * One keyframe in the master scroll timeline. `progress` is normalized
 * 0..1 across the pinned hero section. Model and camera state are both
 * required so every keyframe fully describes the scene at that point —
 * this avoids scattered magic numbers living in components.
 */
export interface SceneKeyframe {
  readonly id: string;
  readonly progress: number;
  readonly label: string;
  readonly model: ModelPoseMap;
  readonly camera: CameraPose;
}

/** Narrative copy tied to a scroll progress window, not just viewport entry. */
export interface TextReveal {
  readonly id: string;
  readonly inProgress: number;
  readonly outProgress: number;

  readonly heading: string;
  readonly body: string;
  readonly align: "left" | "right";
}

/** Discriminated union describing which rendering path is active. */
export type RenderMode =
  | { readonly kind: "full-3d" }
  | { readonly kind: "reduced-motion" }
  | { readonly kind: "static-fallback"; readonly reason: "no-webgl" | "low-end" };

export interface DeviceCapability {
  readonly hasWebGL: boolean;
  readonly prefersReducedMotion: boolean;
  readonly isLowEndDevice: boolean;
}

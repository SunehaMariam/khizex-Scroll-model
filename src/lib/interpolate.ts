import type {
  Vec3,
  NodePose,
  CameraPose,
  SceneKeyframe,
  ModelPoseMap,
  AnimatedNodeName,
} from "@/types/scroll";
import { ANIMATED_NODE_NAMES } from "@/config/timeline";

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function lerpPose(a: NodePose, b: NodePose, t: number): NodePose {
  return {
    position: lerpVec3(a.position, b.position, t),
    rotation: lerpVec3(a.rotation, b.rotation, t),
    scale: lerp(a.scale, b.scale, t),
  };
}

function lerpCamera(a: CameraPose, b: CameraPose, t: number): CameraPose {
  return {
    position: lerpVec3(a.position, b.position, t),
    lookAt: lerpVec3(a.lookAt, b.lookAt, t),
    fov: lerp(a.fov, b.fov, t),
  };
}

/** Cheap smoothstep for a slightly eased feel between authored keyframes. */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export interface InterpolatedScene {
  readonly model: ModelPoseMap;
  readonly camera: CameraPose;
  readonly activeKeyframeId: string;
  readonly segmentT: number;
}

export function sampleTimeline(
  progress: number,
  keyframes: readonly SceneKeyframe[]
): InterpolatedScene {
  const p = clamp01(progress);
  const first = keyframes[0];
  const last = keyframes[keyframes.length - 1];
  if (!first || !last) {
    throw new Error("sampleTimeline: keyframes array must not be empty");
  }

  let lower: SceneKeyframe = first;
  let upper: SceneKeyframe = last;

  for (let i = 0; i < keyframes.length - 1; i += 1) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (!a || !b) continue;
    if (p >= a.progress && p <= b.progress) {
      lower = a;
      upper = b;
      break;
    }
  }

  const span = upper.progress - lower.progress;
  const rawT = span > 0 ? (p - lower.progress) / span : 0;
  const t = smoothstep(clamp01(rawT));

  const model = {} as Record<AnimatedNodeName, NodePose>;
  for (const name of ANIMATED_NODE_NAMES) {
    model[name] = lerpPose(lower.model[name], upper.model[name], t);
  }

  return {
    model: model as ModelPoseMap,
    camera: lerpCamera(lower.camera, upper.camera, t),
    activeKeyframeId: t < 0.5 ? lower.id : upper.id,
    segmentT: t,
  };
}

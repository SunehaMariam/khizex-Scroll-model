import type { SceneKeyframe, TextReveal, AnimatedNodeName, NodePose } from "@/types/scroll";


const IDLE: NodePose = { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 };

function pose(p: Partial<NodePose>): NodePose {
  return { ...IDLE, ...p };
}

/** Case lid hinge: opens by rotating up and back around its local X axis. */
const LID_CLOSED = pose({ rotation: [0, 0, 0] });
const LID_OPEN = pose({ rotation: [-1.95, 0, 0] });

export const SCENE_KEYFRAMES: readonly SceneKeyframe[] = [
  {
    id: "closed",
    progress: 0,
    label: "Closed case, front-on",
    model: {
      case_top: LID_CLOSED,
      casebottom: IDLE,
      airpod1: IDLE,
      airpod_2: IDLE,
    },
    camera: { position: [0, 0.08, 1.55], lookAt: [0, 0, 0], fov: 32 },
  },
  {
    id: "opening",
    progress: 0.32,
    label: "Lid begins to open, camera lifts",
    model: {
      case_top: pose({ rotation: [-0.85, 0, 0] }),
      casebottom: IDLE,
      airpod1: IDLE,
      airpod_2: IDLE,
    },
    camera: { position: [0.35, 0.35, 1.35], lookAt: [0, -0.02, 0], fov: 30 },
  },
  {
    id: "open",
    progress: 0.5,
    label: "Lid fully open, buds still seated",
    model: {
      case_top: LID_OPEN,
      casebottom: IDLE,
      airpod1: IDLE,
      airpod_2: IDLE,
    },
    camera: { position: [0.55, 0.55, 1.15], lookAt: [0, 0.05, 0], fov: 28 },
  },
  {
    id: "float",
    progress: 0.75,
    label: "Buds lift free and separate",
    model: {
      case_top: LID_OPEN,
      casebottom: IDLE,
      airpod1: pose({ position: [-0.42, 0.3, 0.12], rotation: [0.4, -0.6, 0.2] }),
      airpod_2: pose({ position: [0.44, 0.36, -0.1], rotation: [-0.3, 0.7, -0.15] }),
    },
    camera: { position: [0.75, 0.5, 1.4], lookAt: [0, 0.15, 0], fov: 26 },
  },
  {
    id: "hero",
    progress: 1,
    label: "Final hero composition, slow orbit resumes",
    model: {
      case_top: LID_OPEN,
      casebottom: IDLE,
      airpod1: pose({ position: [-0.62, 0.46, 0.22], rotation: [0.55, -1.1, 0.3] }),
      airpod_2: pose({ position: [0.64, 0.52, -0.2], rotation: [-0.45, 1.2, -0.25] }),
    },
    camera: { position: [0.9, 0.42, 1.65], lookAt: [0, 0.2, 0], fov: 24 },
  },
];

export const TEXT_REVEALS: readonly TextReveal[] = [
  {
    id: "intro",
    inProgress: 0,
    outProgress: 0.28,

    heading: "Designed for everyday comfort.",
    body: "A sleek charging case with a refined finish that fits naturally in your pocket and feels familiar the moment you pick it up.",
    align: "left",
  },
  {
    id: "hinge",
    inProgress: 0.28,
    outProgress: 0.5,

    heading: "Precision in every movement.",
    body: "The finely engineered hinge opens with a smooth, balanced motion, delivering a premium feel every time you use it.",
    align: "right",
  },
  {
    id: "release",
    inProgress: 0.5,
    outProgress: 0.78,

    heading: "Instantly connected.",
    body: "Lift the earbuds from the case and they're ready to pair in seconds, so your music starts the moment you do.",
    align: "left",
  },
  {
    id: "hero-copy",
    inProgress: 0.78,
    outProgress: 1,

    heading: "Immersive sound. Effortless experience.",
    body: "Powerful audio, intelligent connectivity, and all-day comfort come together in a design made to move with you.",
    align: "right",
  },
];

export const ANIMATED_NODE_NAMES: readonly AnimatedNodeName[] = [
  "airpod_2",
  "airpod1",
  "case_top",
  "casebottom",
];

/** Total scrollable distance the pinned hero section consumes, in viewport heights. */
export const PIN_SCROLL_LENGTH_VH = 380;

/** Scrub smoothing: higher = snappier, lower = silkier but laggier. Used by ScrollTrigger's `scrub` value. */
export const SCRUB_SECONDS = 0.65;

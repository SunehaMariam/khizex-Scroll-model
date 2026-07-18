import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AnimatedNodeName, NodePose } from "@/types/scroll";
import { ANIMATED_NODE_NAMES, SCENE_KEYFRAMES } from "@/config/timeline";
import { sampleTimeline } from "@/lib/interpolate";
import { heroProgress } from "@/lib/progressStore";

const MODEL_URL = "/models/airpods.glb";

type BindPoseMap = Partial<Record<AnimatedNodeName, { position: THREE.Vector3; quaternion: THREE.Quaternion }>>;

function applyDelta(
  object: THREE.Object3D,
  bind: { position: THREE.Vector3; quaternion: THREE.Quaternion },
  delta: NodePose,
  // Delta positions in the timeline config are expressed as fractions of
  // the model's normalized (longest-axis = 1) size. Node-local positions
  // live in the model's *original* units, and the outer group applies
  // `scaleFactor` uniformly on top — so we convert normalized deltas back
  // into local units by dividing by that same factor before adding them.
  inverseScale: number
): void {
  object.position.set(
    bind.position.x + delta.position[0] * inverseScale,
    bind.position.y + delta.position[1] * inverseScale,
    bind.position.z + delta.position[2] * inverseScale
  );

  const deltaEuler = new THREE.Euler(delta.rotation[0], delta.rotation[1], delta.rotation[2]);
  const deltaQuat = new THREE.Quaternion().setFromEuler(deltaEuler);
  object.quaternion.copy(bind.quaternion).multiply(deltaQuat);

  object.scale.setScalar(delta.scale);
}

export function AirpodsModel(): JSX.Element {
  const { scene } = useGLTF(MODEL_URL);
  const groupRef = useRef<THREE.Group>(null);
  const bindPoses = useRef<BindPoseMap>({});
  const nodeRefs = useRef<Partial<Record<AnimatedNodeName, THREE.Object3D>>>({});


  const normalized = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    
      if (child.name === "floor" || child.name === "light") {
        child.visible = false;
      }
    });

    const box = new THREE.Box3();
    for (const name of ANIMATED_NODE_NAMES) {
      const node = clone.getObjectByName(name);
      if (node) box.expandByObject(node);
    }
    if (box.isEmpty()) box.setFromObject(clone);

    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const longestAxis = Math.max(size.x, size.y, size.z) || 1;
    const scaleFactor = 1 / longestAxis;

    return { clone, center, scaleFactor };
  }, [scene]);

  useEffect(() => {
    const map: Partial<Record<AnimatedNodeName, THREE.Object3D>> = {};
    for (const name of ANIMATED_NODE_NAMES) {
      const found = normalized.clone.getObjectByName(name);
      if (found) map[name] = found;
    }
    nodeRefs.current = map;

    const bind: BindPoseMap = {};
    for (const name of ANIMATED_NODE_NAMES) {
      const obj = map[name];
      if (obj) {
        bind[name] = {
          position: obj.position.clone(),
          quaternion: obj.quaternion.clone(),
        };
      }
    }
    bindPoses.current = bind;
  }, [normalized]);

  useFrame(() => {
    const progress = heroProgress.get();
    const { model } = sampleTimeline(progress, SCENE_KEYFRAMES);

    const inverseScale = 1 / normalized.scaleFactor;
    for (const name of ANIMATED_NODE_NAMES) {
      const obj = nodeRefs.current[name];
      const bind = bindPoses.current[name];
      if (obj && bind) applyDelta(obj, bind, model[name], inverseScale);
    }
  });

  return (
   <group
  ref={groupRef}
  position={[
    -normalized.center.x * normalized.scaleFactor,
    -normalized.center.y * normalized.scaleFactor,
    -normalized.center.z * normalized.scaleFactor,
  ]}
  scale={normalized.scaleFactor * 0.4}
>
      <primitive object={normalized.clone} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

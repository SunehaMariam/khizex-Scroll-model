import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE_KEYFRAMES } from "@/config/timeline";
import { sampleTimeline } from "@/lib/interpolate";
import { heroProgress } from "@/lib/progressStore";


export function CameraRig(): null {
  const { camera } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const progress = heroProgress.get();
    const { camera: camPose } = sampleTimeline(progress, SCENE_KEYFRAMES);

    camera.position.set(camPose.position[0], camPose.position[1], camPose.position[2]);
    lookAtTarget.current.set(camPose.lookAt[0], camPose.lookAt[1], camPose.lookAt[2]);
    camera.lookAt(lookAtTarget.current);

    if (camera instanceof THREE.PerspectiveCamera && camera.fov !== camPose.fov) {
      camera.fov = camPose.fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

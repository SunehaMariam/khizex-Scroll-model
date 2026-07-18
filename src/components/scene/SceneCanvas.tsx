import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { AirpodsModel } from "@/components/scene/AirpodsModel";
import { CameraRig } from "@/components/scene/CameraRig";
import { CanvasLoader } from "@/components/scene/CanvasLoader";

interface SceneCanvasProps {
  readonly isInView: boolean;
}

export function SceneCanvas({ isInView }: SceneCanvasProps): JSX.Element {
  return (
    <Canvas
    
      frameloop={isInView ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 32, near: 0.05, far: 20, position: [0, 0.08, 1.55] }}
      shadows
    >
      <color attach="background" args={["#FAFAFC"]} />
   
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[1.5, 2.2, 1.8]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-2, 1.2, -1.2]} intensity={0.5} color="#DCE0FF" />
      <directionalLight position={[0, -1.5, 1]} intensity={0.25} color="#FAFAFC" />

      <Suspense fallback={<CanvasLoader />}>
        <AirpodsModel />
     
  
        <Environment resolution={128}>
          <group>
            <Lightformer intensity={2.2} color="#ffffff" position={[0, 3, 2]} scale={[5, 5, 1]} />
            <Lightformer intensity={1.1} color="#dce0ff" position={[-3, 1.5, -2]} scale={[4, 4, 1]} />
            <Lightformer intensity={0.8} color="#ffffff" position={[3, -1, -1]} scale={[3, 3, 1]} />
            <Lightformer intensity={0.6} color="#ffffff" form="ring" position={[0, -3, 1]} scale={4} />
          </group>
        </Environment>
        <ContactShadows
          position={[0, -0.42, 0]}
          opacity={0.35}
          scale={4}
          blur={2.4}
          far={1.2}
          color="#14151A"
        />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}

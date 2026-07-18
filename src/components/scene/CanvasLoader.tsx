import { Html, useProgress } from "@react-three/drei";

export function CanvasLoader(): JSX.Element {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="canvas-loader" role="status" aria-live="polite">
        <div className="canvas-loader__ring" />
        <span className="canvas-loader__label">{Math.round(progress)}%</span>
      </div>
    </Html>
  );
}

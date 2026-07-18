import { Component, type ReactNode } from "react";
import { StaticShowcase } from "@/components/fallback/StaticShowcase";

interface SceneErrorBoundaryProps {
  readonly children: ReactNode;
}

interface SceneErrorBoundaryState {
  readonly hasError: boolean;
}


export class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  public override state: SceneErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error): void {
    // eslint-disable-next-line no-console
    console.error("3D scene failed, falling back to static showcase:", error);
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return <StaticShowcase reason="no-webgl" />;
    }
    return this.props.children;
  }
}

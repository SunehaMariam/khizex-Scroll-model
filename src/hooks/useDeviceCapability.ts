import { useEffect, useState } from "react";
import type { DeviceCapability } from "@/types/scroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

function detectLowEndDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  return cores <= 4 && memory <= 4;
}

export function useDeviceCapability(): DeviceCapability {
  const prefersReducedMotion = useReducedMotion();
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isLowEndDevice, setIsLowEndDevice] = useState<boolean>(false);

  useEffect(() => {
    setHasWebGL(detectWebGL());
    setIsLowEndDevice(detectLowEndDevice());
  }, []);

  return { hasWebGL, prefersReducedMotion, isLowEndDevice };
}

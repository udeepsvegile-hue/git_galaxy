/**
 * GitVerse — GalacticPlane
 * A faint radial gradient disc that suggests the galaxy plane.
 */

import { useMemo } from "react";
import * as THREE from "three";

export default function GalacticPlane() {
  const material = useMemo(() => {
    // Radial gradient: bright center → transparent edge
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, "rgba(0, 180, 255, 0.18)");
    grad.addColorStop(0.3, "rgba(0, 100, 200, 0.08)");
    grad.addColorStop(0.7, "rgba(0, 50, 120, 0.03)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[300, 300]} />
      <primitive object={material} />
    </mesh>
  );
}

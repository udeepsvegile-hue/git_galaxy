/**
 * GitVerse — OrbitRing
 * Faint torus ring indicating a planet's orbital path.
 * Brightens on hover/selection.
 */

import { useMemo } from "react";
import * as THREE from "three";

interface OrbitRingProps {
  radius: number;
  inclination: number;
  active: boolean;
  color: string;
}

export default function OrbitRing({ radius, inclination, active, color }: OrbitRingProps) {
  const geometry = useMemo(() => {
    // Build a circular line (not a torus mesh — cheaper)
    const points: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: active ? 0.4 : 0.08,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [color, active]
  );

  return (
    <group rotation={[inclination, 0, 0]}>
      <primitive object={new THREE.Line(geometry, material)} />
    </group>
  );
}

/**
 * GitVerse — StarField
 * Instanced mesh of background stars.
 * Uses a single draw call for all N stars.
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarFieldProps {
  count?: number;
  radius?: number;
}

export default function StarField({ count = 4000, radius = 800 }: StarFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Compute random positions + sizes once
  const { positions, scales, twinkleSeeds } = useMemo(() => {
    const positions: number[] = [];
    const scales: number[] = [];
    const twinkleSeeds: number[] = [];

    for (let i = 0; i < count; i++) {
      // Distribute on a sphere shell
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.5 + Math.random() * 0.5);

      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      scales.push(0.3 + Math.random() * 1.4);
      twinkleSeeds.push(Math.random() * Math.PI * 2);
    }
    return { positions, scales, twinkleSeeds };
  }, [count, radius]);

  // Pre-allocate dummy for matrix writes
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Set initial instance transforms
  useMemo(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      const s = scales[i];
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Slightly warm/cool star colors
      const hue = 0.55 + Math.random() * 0.15;
      const sat = Math.random() > 0.85 ? 0.4 : 0.05;
      color.setHSL(hue, sat, 0.85 + Math.random() * 0.15);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  // Slow rotation of the whole field + twinkle via scale
  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = clock.getElapsedTime();
    // Very slow field rotation
    mesh.rotation.y = t * 0.005;
    mesh.rotation.x = t * 0.002;

    // Twinkle a random subset of stars each frame (cheap)
    const subset = 80;
    const base = Math.floor((t * 30) % count);
    for (let k = 0; k < subset; k++) {
      const i = (base + k) % count;
      const twinkle = 0.7 + 0.3 * Math.sin(t * 2.5 + twinkleSeeds[i]);
      const s = scales[i] * twinkle;
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.25, 4, 4]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
}

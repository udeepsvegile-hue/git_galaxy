/**
 * GitVerse — NebulaCloud
 * Soft billboard particles that create a nebula atmosphere.
 * Uses additive blending instanced planes.
 */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CLOUD_COUNT = 120;

export default function NebulaCloud() {
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    return Array.from({ length: CLOUD_COUNT }, (_, i) => {
      const angle = (i / CLOUD_COUNT) * Math.PI * 2 + Math.random() * 0.8;
      const r = 30 + Math.random() * 80;
      const y = (Math.random() - 0.5) * 25;
      const size = 8 + Math.random() * 20;

      // Teal / deep blue / faint magenta hues
      const hues = [0.55, 0.58, 0.62, 0.72, 0.8];
      const hue = hues[Math.floor(Math.random() * hues.length)];
      const color = new THREE.Color().setHSL(hue, 0.7, 0.35);

      return {
        x: Math.cos(angle) * r,
        y,
        z: Math.sin(angle) * r,
        size,
        color: color.getHex(),
        rotSpeed: (Math.random() - 0.5) * 0.002,
        phaseOffset: Math.random() * Math.PI * 2,
        opacity: 0.04 + Math.random() * 0.08,
      };
    });
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.008;
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <planeGeometry args={[p.size, p.size]} />
          <meshBasicMaterial
            color={p.color}
            transparent
            opacity={p.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

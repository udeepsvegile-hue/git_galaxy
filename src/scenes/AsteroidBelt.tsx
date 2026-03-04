/**
 * GitVerse — AsteroidBelt
 * Instanced mesh belt of small asteroids orbiting a planet.
 * Positioned in world space at the planet's orbit radius.
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PlanetConfig } from "@/types";

interface AsteroidBeltProps {
  planetConfig: PlanetConfig;
}

export default function AsteroidBelt({ planetConfig }: AsteroidBeltProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count   = Math.min(planetConfig.asteroidCount, 30);

  // Compute per-asteroid orbit data once
  const asteroids = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle     = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const innerR    = planetConfig.planetRadius * 2.2;
      const outerR    = planetConfig.planetRadius * 3.8;
      const r         = innerR + Math.random() * (outerR - innerR);
      const y         = (Math.random() - 0.5) * 0.4;
      const speed     = 0.3 + Math.random() * 0.4;
      const size      = 0.04 + Math.random() * 0.08;
      const phaseOff  = angle;
      return { r, y, speed, size, phaseOff };
    });
  }, [count, planetConfig.planetRadius]);

  const dummy   = useMemo(() => new THREE.Object3D(), []);

  // Set initial matrices
  useMemo(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    asteroids.forEach((a, i) => {
      dummy.position.set(
        a.r * Math.cos(a.phaseOff),
        a.y,
        a.r * Math.sin(a.phaseOff)
      );
      dummy.scale.setScalar(a.size);
      dummy.rotation.set(Math.random(), Math.random(), Math.random());
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();

    asteroids.forEach((a, i) => {
      const angle = a.phaseOff + t * a.speed;
      dummy.position.set(
        a.r * Math.cos(angle),
        a.y,
        a.r * Math.sin(angle)
      );
      dummy.scale.setScalar(a.size);
      dummy.rotation.y = t;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  // Place the whole belt at the planet's position in the orbit
  // We do this via a group that mirrors the planet's orbit offset
  // Instead, the belt orbits around local origin, so we need to
  // make the planet's orbital group a parent. But for simplicity,
  // we render the belt independently and handle it in orbit space.

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#6b7a8d"
          roughness={0.95}
          metalness={0.1}
        />
      </instancedMesh>
    </group>
  );
}

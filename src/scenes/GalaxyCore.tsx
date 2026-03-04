/**
 * GitVerse — GalaxyCore
 * The central star representing the GitHub user.
 * Has: inner sphere, corona, pulsing halo, spike rays.
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Billboard } from "@react-three/drei";
import * as THREE from "three";
import type { UserStar } from "@/types";

interface GalaxyCoreProps {
  user: UserStar;
}

export default function GalaxyCore({ user }: GalaxyCoreProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Group>(null);
  const spikesRef = useRef<THREE.Group>(null);

  const coreColor = useMemo(() => new THREE.Color(user.coreColor), [user.coreColor]);
  const coreSize = user.coreSize;

  // Corona material — additive glow
  const coronaMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: coreColor,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      }),
    [coreColor]
  );

  // Halo billboard material
  const haloTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, `rgba(${Math.round(coreColor.r * 255)}, ${Math.round(coreColor.g * 255)}, ${Math.round(coreColor.b * 255)}, 0.6)`);
    g.addColorStop(0.4, `rgba(${Math.round(coreColor.r * 255)}, ${Math.round(coreColor.g * 255)}, ${Math.round(coreColor.b * 255)}, 0.2)`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, [coreColor]);

  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: haloTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [haloTex]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Core gentle pulse
    if (coreRef.current) {
      const pulse = 1 + 0.06 * Math.sin(t * 1.8);
      coreRef.current.scale.setScalar(pulse);
    }
    // Corona breathes slower
    if (coronaRef.current) {
      const breathe = 1 + 0.12 * Math.sin(t * 0.9 + 0.5);
      coronaRef.current.scale.setScalar(breathe);
    }
    // Halo rotates
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.05;
    }
    // Spike rays slow rotation
    if (spikesRef.current) {
      spikesRef.current.rotation.y = t * 0.15;
      spikesRef.current.rotation.x = t * 0.07;
    }
  });

  // Build spike geometry (6 elongated rays)
  const spikeGeoms = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return {
        x: Math.cos(angle) * (coreSize * 2.5),
        y: Math.sin(angle) * (coreSize * 2.5),
        rotZ: angle,
      };
    });
  }, [coreSize]);

  return (
    <group>
      {/* Inner star */}
      <Sphere ref={coreRef} args={[coreSize, 48, 48]}>
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={user.coreIntensity * 3 + 1.5}
          roughness={1}
          metalness={0}
        />
      </Sphere>

      {/* Corona shell */}
      <Sphere ref={coronaRef} args={[coreSize * 1.7, 32, 32]}>
        <primitive object={coronaMat} />
      </Sphere>

      {/* Billboard halo */}
      <Billboard ref={haloRef}>
        <mesh>
          <planeGeometry args={[coreSize * 9, coreSize * 9]} />
          <primitive object={haloMat} />
        </mesh>
      </Billboard>

      {/* Spike rays */}
      <group ref={spikesRef}>
        {spikeGeoms.map((s, i) => (
          <mesh key={i} rotation={[0, 0, s.rotZ]}>
            <planeGeometry args={[coreSize * 0.12, coreSize * 4]} />
            <meshBasicMaterial
              color={coreColor}
              transparent
              opacity={0.25 + user.coreIntensity * 0.2}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

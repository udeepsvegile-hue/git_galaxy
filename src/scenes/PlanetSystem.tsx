/**
 * GitVerse — PlanetSystem
 * Renders one complete planet with its orbital system:
 *   - Orbit ring
 *   - Planet mesh + procedural surface material
 *   - Atmospheric glow
 *   - Moons
 *   - Asteroid belt
 *   - Space stations
 *   - Hover & click interaction
 */

import { useRef, useMemo, useCallback } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";

import type { PlanetConfig, MoonConfig, SpaceStationConfig } from "@/types";
import { useAppStore } from "@/hooks/useAppStore";
import { buildPlanetMaterial } from "@/utils/planetMaterials";
import OrbitRing from "./OrbitRing";
import PlanetLabel from "./PlanetLabel";
import { useTimeWarpState } from "@/hooks/useTimeWarp";
import AsteroidBelt from "./AsteroidBelt";

interface PlanetSystemProps {
  planet: PlanetConfig;
}

export default function PlanetSystem({ planet }: PlanetSystemProps) {
  const orbitGroupRef = useRef<THREE.Group>(null);  // rotates = orbital motion
  const planetGroupRef = useRef<THREE.Group>(null); // planet + children
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Group>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);

  const setSelectedPlanet = useAppStore((s) => s.setSelectedPlanet);
  const setHoveredPlanet  = useAppStore((s) => s.setHoveredPlanet);
  const selectedPlanet    = useAppStore((s) => s.selectedPlanet);
  const hoveredPlanet     = useAppStore((s) => s.hoveredPlanet);

  const isSelected = selectedPlanet?.id === planet.id;
  const isHovered  = hoveredPlanet?.id  === planet.id;
  const timeWarp   = useTimeWarpState(planet);

  // Build procedural planet material
  const planetMaterial = useMemo(
    () => buildPlanetMaterial(planet),
    [planet]
  );

  // Glow billboard texture
  const glowTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 128;
    const ctx = c.getContext("2d")!;
    const col = new THREE.Color(planet.glowColor);
    const r = Math.round(col.r * 255);
    const g = Math.round(col.g * 255);
    const b = Math.round(col.b * 255);
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0,   `rgba(${r},${g},${b}, 0.5)`);
    grad.addColorStop(0.4, `rgba(${r},${g},${b}, 0.15)`);
    grad.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, [planet.glowColor]);

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    map: glowTex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [glowTex]);

  // Interaction handlers
  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredPlanet(planet);
    document.body.style.cursor = "pointer";
  }, [planet, setHoveredPlanet]);

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredPlanet(null);
    document.body.style.cursor = "crosshair";
  }, [setHoveredPlanet]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setSelectedPlanet(isSelected ? null : planet);
  }, [planet, isSelected, setSelectedPlanet]);

  // Animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Orbital motion — rotate the orbit group around Y axis
    if (orbitGroupRef.current) {
      const inclinedAxis = new THREE.Vector3(
        Math.sin(planet.orbitInclination),
        Math.cos(planet.orbitInclination),
        0
      ).normalize();
      const angle = planet.orbitPhaseOffset + t * planet.orbitSpeed;
      orbitGroupRef.current.setRotationFromAxisAngle(inclinedAxis, angle);
    }

    // Planet self-rotation
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += 0.003;
    }

    // Glow pulse
    if (glowRef.current) {
      const basePulse = planet.glowIntensity;
      const pulse = basePulse * (0.85 + 0.15 * Math.sin(t * 1.2 + planet.orbitPhaseOffset));
      const gSize = planet.planetRadius * (isHovered ? 5.5 : isSelected ? 6 : 4.5);
      glowRef.current.scale.setScalar(gSize * (1 + pulse * 0.3));
      const glowMaterial = glowMeshRef.current?.material as THREE.MeshBasicMaterial | undefined;
      if (glowMaterial) {
        glowMaterial.opacity = 0.4 + pulse * 0.6 + (isHovered ? 0.3 : 0) + (isSelected ? 0.2 : 0);
      }
    }
  });

  return (
    <>
      {/* Orbit ring (static, not part of orbit group) */}
      <OrbitRing
        radius={planet.orbitRadius}
        inclination={planet.orbitInclination}
        active={isSelected || isHovered}
        color={planet.planetColor}
      />

      {/* Orbit group: everything here orbits */}
      <group ref={orbitGroupRef}>
        {/* Offset from centre to orbit radius */}
        <group position={[planet.orbitRadius, 0, 0]} ref={planetGroupRef}>

          {/* Planet mesh */}
          <PlanetLabel planet={planet} visible={isHovered || isSelected} />
          <group scale={[timeWarp.scale, timeWarp.scale, timeWarp.scale]}>
          <mesh
            ref={planetMeshRef}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
          >
            <sphereGeometry args={[planet.planetRadius, 48, 48]} />
            <primitive object={planetMaterial} />
          </mesh>

          {/* Ring system (issues > 10) */}
          {planet.ringSystem && (
            <mesh rotation={[Math.PI / 3, 0, 0]}>
              <torusGeometry args={[planet.planetRadius * 1.6, planet.planetRadius * 0.15, 2, 80]} />
              <meshBasicMaterial
                color={planet.planetColor}
                transparent
                opacity={0.35}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )}

          {/* Glow billboard */}
          <Billboard ref={glowRef}>
            <mesh ref={glowMeshRef}>
              <planeGeometry args={[1, 1]} />
              <primitive object={glowMat} />
            </mesh>
          </Billboard>

          </group>
          {/* Selected highlight ring */}
          {isSelected && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[planet.planetRadius * 1.4, 0.04, 2, 64]} />
              <meshBasicMaterial color="#00d4ff" transparent opacity={0.9} depthWrite={false} />
            </mesh>
          )}

          {/* Moons */}
          {planet.moons.map((moon) => (
            <MoonOrbit key={moon.id} moon={moon} />
          ))}

          {/* Space stations */}
          {planet.spaceStations.map((station) => (
            <SpaceStationMesh key={station.id} station={station} />
          ))}
        </group>
      </group>

      {/* Asteroid belt (rendered in scene space offset by orbit radius) */}
      {planet.hasAsteroidBelt && (
        <AsteroidBelt
          planetConfig={planet}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────
//  Moon Orbit Sub-component
// ─────────────────────────────────────────────────

function MoonOrbit({ moon }: { moon: MoonConfig }) {
  const orbitRef = useRef<THREE.Group>(null);
  const moonColor = useMemo(() => new THREE.Color(moon.color), [moon.color]);

  useFrame(({ clock }) => {
    if (!orbitRef.current) return;
    const t = clock.getElapsedTime();
    orbitRef.current.rotation.y = moon.phaseOffset + t * moon.orbitSpeed;
    orbitRef.current.rotation.x = 0.2 * Math.sin(t * 0.3 + moon.phaseOffset);
  });

  return (
    <group ref={orbitRef}>
      <mesh position={[moon.orbitRadius, 0, 0]}>
        <sphereGeometry args={[moon.size, 12, 12]} />
        <meshStandardMaterial
          color={moonColor}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────
//  Space Station Sub-component
// ─────────────────────────────────────────────────

function SpaceStationMesh({ station }: { station: SpaceStationConfig }) {
  const orbitRef = useRef<THREE.Group>(null);
  const selfRef  = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (orbitRef.current) {
      orbitRef.current.rotation.y = station.phaseOffset + t * station.orbitSpeed;
      orbitRef.current.rotation.z = 0.4;
    }
    if (selfRef.current) {
      selfRef.current.rotation.x += 0.02;
      selfRef.current.rotation.y += 0.015;
    }
  });

  return (
    <group ref={orbitRef}>
      <group position={[station.orbitRadius, 0, 0]} ref={selfRef}>
        {/* Cross-shaped station: center box + 2 arms */}
        <mesh>
          <boxGeometry args={[station.size, station.size, station.size]} />
          <meshStandardMaterial color="#88c0d0" emissive="#88c0d0" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[station.size * 1.5, 0, 0]}>
          <boxGeometry args={[station.size * 1.5, station.size * 0.25, station.size * 0.25]} />
          <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.4} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-station.size * 1.5, 0, 0]}>
          <boxGeometry args={[station.size * 1.5, station.size * 0.25, station.size * 0.25]} />
          <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.4} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

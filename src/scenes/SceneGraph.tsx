/**
 * GitVerse — SceneGraph
 * Mounts all 3D objects in the scene.
 * Kept separate from GalaxyScene so Canvas stays clean.
 */

import { memo } from "react";
import type { GalaxyConfig } from "@/types";
import StarField from "./StarField";
import NebulaCloud from "./NebulaCloud";
import GalaxyCore from "./GalaxyCore";
import PlanetSystem from "./PlanetSystem";
import GalacticPlane from "./GalacticPlane";

interface SceneGraphProps {
  config: GalaxyConfig;
}

const SceneGraph = memo(function SceneGraph({ config }: SceneGraphProps) {
  return (
    <>
      {/* ── Lighting ─────────────────────────────── */}
      {/* Very dim ambient — space is dark */}
      <ambientLight intensity={0.04} color="#0a1628" />

      {/* Central star light — illuminates nearby planets */}
      <pointLight
        position={[0, 0, 0]}
        intensity={80}
        color={config.user.coreColor}
        distance={120}
        decay={2}
      />

      {/* Rim light from above for visual depth */}
      <directionalLight
        position={[40, 60, 20]}
        intensity={0.3}
        color="#88c0d0"
      />

      {/* ── Environment ──────────────────────────── */}
      <StarField count={4000} />
      <NebulaCloud />
      <GalacticPlane />

      {/* ── Galaxy Core (user identity star) ─────── */}
      <GalaxyCore user={config.user} />

      {/* ── Planet Systems ───────────────────────── */}
      {config.planets.map((planet) => (
        <PlanetSystem key={planet.id} planet={planet} />
      ))}
    </>
  );
});

export default SceneGraph;

/**
 * GitVerse — PlanetLabel
 * HTML-in-3D label using @react-three/drei Html.
 * Shows planet name + star count when hovered.
 */

import { Html } from "@react-three/drei";
import { formatCount } from "@/utils/formatters";
import type { PlanetConfig } from "@/types";

interface PlanetLabelProps {
  planet: PlanetConfig;
  visible: boolean;
}

export default function PlanetLabel({ planet, visible }: PlanetLabelProps) {
  if (!visible) return null;

  return (
    <Html
      center
      distanceFactor={18}
      style={{ pointerEvents: "none" }}
      position={[0, planet.planetRadius + 1.2, 0]}
    >
      <div
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "#e8f4f8",
          textShadow: "0 0 8px rgba(0,212,255,0.8)",
          whiteSpace: "nowrap",
          background: "rgba(0, 8, 20, 0.7)",
          border: "1px solid rgba(0, 212, 255, 0.3)",
          borderRadius: "4px",
          padding: "3px 8px",
          backdropFilter: "blur(4px)",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          userSelect: "none",
        }}
      >
        <span>{planet.name}</span>
        {planet.stars > 0 && (
          <span style={{ color: "#ffd700", fontSize: "9px" }}>
            ★ {formatCount(planet.stars)}
          </span>
        )}
      </div>
    </Html>
  );
}

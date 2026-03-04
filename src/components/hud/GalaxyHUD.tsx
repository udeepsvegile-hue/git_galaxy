/**
 * GitVerse — GalaxyHUD
 * Master HUD wrapper rendered over the 3D canvas.
 * Composes all UI panels: TopBar, PlanetPanel, TimeWarpSlider, ControlsHint.
 */

import { useAppStore, selectGalaxyConfig, selectSelectedPlanet } from "@/hooks/useAppStore";
import TopBar from "./TopBar";
import PlanetPanel from "./PlanetPanel";
import TimeWarpSlider from "./TimeWarpSlider";
import ControlsHint from "./ControlsHint";
import ScanningOverlay from "@/components/overlays/ScanningOverlay";
import styles from "./GalaxyHUD.module.css";

export default function GalaxyHUD() {
  const galaxyConfig    = useAppStore(selectGalaxyConfig);
  const selectedPlanet  = useAppStore(selectSelectedPlanet);

  if (!galaxyConfig) return null;

  return (
    <div className={styles.hud}>
      {/* Top status bar */}
      <TopBar config={galaxyConfig} />

      {/* Planet detail panel — slides in when a planet is selected */}
      <PlanetPanel planet={selectedPlanet} />

      {/* Time warp slider — bottom centre */}
      <TimeWarpSlider />

      {/* Controls hint — bottom left, fades after first interaction */}
      <ControlsHint />

      {/* Scanning cinematic — on planet click */}
      <ScanningOverlay />
    </div>
  );
}

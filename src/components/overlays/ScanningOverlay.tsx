/**
 * GitVerse — ScanningOverlay
 * Cinematic scan-lines animation shown briefly when a planet is clicked.
 * Auto-dismisses after the scan animation completes.
 */

import { useEffect, useState } from "react";
import { useAppStore } from "@/hooks/useAppStore";
import styles from "./ScanningOverlay.module.css";

export default function ScanningOverlay() {
  const selectedPlanet = useAppStore((s) => s.selectedPlanet);
  const [scanning, setScanning]   = useState(false);
  const [progress, setProgress]   = useState(0);
  const [prevPlanet, setPrevPlanet] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPlanet && selectedPlanet.id !== prevPlanet) {
      // New planet selected → trigger scan animation
      setPrevPlanet(selectedPlanet.id);
      setScanning(true);
      setProgress(0);

      let p = 0;
      const interval = setInterval(() => {
        p += 4 + Math.random() * 6;
        setProgress(Math.min(p, 100));
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setScanning(false), 400);
        }
      }, 40);

      return () => clearInterval(interval);
    }
  }, [selectedPlanet]);

  if (!scanning) return null;

  return (
    <div className={styles.overlay}>
      {/* Horizontal scan line */}
      <div className={styles.scanLine} />

      {/* Corner brackets */}
      <div className={`${styles.corner} ${styles.tl}`} />
      <div className={`${styles.corner} ${styles.tr}`} />
      <div className={`${styles.corner} ${styles.bl}`} />
      <div className={`${styles.corner} ${styles.br}`} />

      {/* Scan progress */}
      <div className={styles.scanInfo}>
        <div className={styles.scanLabel}>SCANNING REPOSITORY</div>
        <div className={styles.scanName}>{selectedPlanet?.name}</div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.progressPct}>{Math.round(progress)}%</div>
      </div>
    </div>
  );
}

/**
 * GitVerse — TimeWarpSlider
 * Bottom-centre HUD element. Lets user scrub through commit timeline.
 * Affects planet sizes and glow via timeWarpValue (0=oldest, 1=present).
 */

import { useCallback, useState } from "react";
import { useAppStore } from "@/hooks/useAppStore";
import styles from "./TimeWarpSlider.module.css";

export default function TimeWarpSlider() {
  const timeWarpValue    = useAppStore((s) => s.timeWarpValue);
  const isTimeWarpActive = useAppStore((s) => s.isTimeWarpActive);
  const setTimeWarp      = useAppStore((s) => s.setTimeWarp);
  const setTimeWarpActive = useAppStore((s) => s.setTimeWarpActive);
  const [expanded, setExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    const next = !expanded;
    setExpanded(next);
    setTimeWarpActive(next);
    if (!next) {
      // Reset to present when collapsing
      setTimeWarp(1);
    }
  }, [expanded, setExpanded, setTimeWarpActive, setTimeWarp]);

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTimeWarp(parseFloat(e.target.value));
    },
    [setTimeWarp]
  );

  const getYearLabel = (value: number): string => {
    const now = new Date().getFullYear();
    const oldest = now - 10;
    const year = Math.round(oldest + value * (now - oldest));
    return value >= 0.98 ? "NOW" : String(year);
  };

  return (
    <div className={`${styles.container} ${expanded ? styles.expanded : ""}`}>
      {expanded && (
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>PAST</span>
          <div className={styles.sliderTrack}>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={1}
              step={0.01}
              value={timeWarpValue}
              onChange={handleSlider}
            />
            <div
              className={styles.sliderFill}
              style={{ width: `${timeWarpValue * 100}%` }}
            />
          </div>
          <span className={`${styles.sliderLabel} ${styles.sliderLabelRight}`}>
            {getYearLabel(timeWarpValue)}
          </span>
        </div>
      )}

      <button
        className={`${styles.toggleBtn} ${isTimeWarpActive ? styles.active : ""}`}
        onClick={handleToggle}
      >
        <span className={styles.icon}>⌚</span>
        <span className={styles.label}>
          {isTimeWarpActive ? `TIME WARP · ${getYearLabel(timeWarpValue)}` : "TIME WARP"}
        </span>
      </button>
    </div>
  );
}

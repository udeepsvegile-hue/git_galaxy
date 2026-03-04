/**
 * GitVerse — ControlsHint
 * Shows navigation hints at launch, fades after first interaction.
 */

import { useState, useEffect } from "react";
import styles from "./ControlsHint.module.css";

const HINTS = [
  { key: "DRAG",   desc: "ROTATE GALAXY" },
  { key: "SCROLL", desc: "ZOOM" },
  { key: "CLICK",  desc: "SELECT PLANET" },
  { key: "ESC",    desc: "DESELECT" },
];

export default function ControlsHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fade out after 7 seconds or first interaction
    const timer = setTimeout(() => setVisible(false), 7000);

    const hide = () => setVisible(false);
    window.addEventListener("pointerdown", hide, { once: true });
    window.addEventListener("wheel",       hide, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", hide);
      window.removeEventListener("wheel", hide);
    };
  }, []);

  return (
    <div className={`${styles.container} ${visible ? styles.visible : styles.hidden}`}>
      {HINTS.map((h) => (
        <div key={h.key} className={styles.hint}>
          <span className={styles.key}>{h.key}</span>
          <span className={styles.desc}>{h.desc}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * GitVerse — Loading Screen
 * Shown while GitHub data is being fetched.
 */

import { useEffect, useState } from "react";
import { useAppStore, selectUsername } from "@/hooks/useAppStore";
import styles from "./LoadingScreen.module.css";

const LOADING_MESSAGES = [
  "SCANNING UNIVERSE...",
  "MAPPING STAR SYSTEMS...",
  "CALCULATING ORBITS...",
  "DETECTING PLANETARY BODIES...",
  "ANALYZING COMMIT SIGNATURES...",
  "CALIBRATING PROBE SENSORS...",
  "PREPARING GALAXY VIEW...",
];

export default function LoadingScreen() {
  const username = useAppStore(selectUsername);
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 700);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        // Ease toward 90%, the last 10% waits for real completion
        const remaining = 90 - p;
        return p + remaining * 0.08;
      });
    }, 100);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Rotating ring */}
      <div className={styles.ring}>
        <div className={styles.ringInner} />
        <div className={styles.ringPulse} />
      </div>

      <div className={styles.content}>
        <div className={styles.targetLabel}>
          TARGET ACQUIRED:
        </div>
        <div className={styles.username}>@{username ?? "..."}</div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className={styles.message}>
          {LOADING_MESSAGES[msgIndex]}
        </div>
      </div>
    </div>
  );
}

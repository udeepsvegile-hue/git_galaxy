/**
 * GitVerse — Error Overlay
 * Clean sci-fi styled error display.
 */

import { useAppStore, selectError, selectUsername } from "@/hooks/useAppStore";
import { useGalaxyData } from "@/hooks/useGalaxyData";
import styles from "./ErrorOverlay.module.css";

const ERROR_TITLES: Record<string, string> = {
  not_found:     "SIGNAL LOST",
  rate_limit:    "LINK CONGESTED",
  network:       "COMM FAILURE",
  empty_account: "VOID DETECTED",
  unknown:       "ANOMALY DETECTED",
};

const ERROR_ICONS: Record<string, string> = {
  not_found:     "◌",
  rate_limit:    "⊘",
  network:       "⚡",
  empty_account: "○",
  unknown:       "⚠",
};

export default function ErrorOverlay() {
  const error = useAppStore(selectError);
  const username = useAppStore(selectUsername);
  const { clearGalaxy } = useGalaxyData();

  if (!error) return null;

  const title = ERROR_TITLES[error.type] ?? "ANOMALY DETECTED";
  const icon  = ERROR_ICONS[error.type]  ?? "⚠";

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.icon}>{icon}</div>

        <div className={styles.code}>
          ERR:{error.type.toUpperCase().replace("_", "-")}
        </div>

        <h2 className={styles.title}>{title}</h2>

        <p className={styles.message}>{error.message}</p>

        {error.type === "rate_limit" && error.retryAfter && (
          <div className={styles.retryInfo}>
            RETRY IN {error.retryAfter}s
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={clearGalaxy}>
            ← RETURN TO BASE
          </button>

          {error.type !== "not_found" && username && (
            <button
              className={styles.btnPrimary}
              onClick={() => {
                clearGalaxy();
                // Re-trigger load will happen via landing
              }}
            >
              RETRY SCAN
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * GitVerse — TopBar
 * Top HUD bar: GitVerse logo | username | stats | back button
 */

import { useCallback } from "react";
import { useGalaxyData } from "@/hooks/useGalaxyData";
import { formatCount } from "@/utils/formatters";
import type { GalaxyConfig } from "@/types";
import styles from "./TopBar.module.css";

interface TopBarProps {
  config: GalaxyConfig;
}

export default function TopBar({ config }: TopBarProps) {
  const { clearGalaxy } = useGalaxyData();
  const { user } = config;

  const handleBack = useCallback(() => {
    clearGalaxy();
  }, [clearGalaxy]);

  return (
    <header className={styles.bar}>
      {/* Left: logo + user identity */}
      <div className={styles.left}>
        <button className={styles.backBtn} onClick={handleBack} title="Return to base">
          ← BASE
        </button>
        <div className={styles.divider} />
        <div className={styles.userInfo}>
          <img
            className={styles.avatar}
            src={user.avatarUrl}
            alt={user.name}
            width={28}
            height={28}
          />
          <div className={styles.userText}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userLogin}>@{user.login}</span>
          </div>
        </div>
      </div>

      {/* Centre: brand */}
      <div className={styles.centre}>
        <span className={styles.brand}>
          GIT<span className={styles.brandAccent}>VERSE</span>
        </span>
      </div>

      {/* Right: stats */}
      <div className={styles.right}>
        <Stat label="PLANETS" value={config.planets.length} />
        <Stat label="STARS"   value={formatCount(config.totalStars)} />
        <Stat label="FORKS"   value={formatCount(config.totalForks)} />
        <Stat label="COMMITS" value={formatCount(config.totalCommits)} />
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

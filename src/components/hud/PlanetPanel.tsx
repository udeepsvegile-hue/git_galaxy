/**
 * GitVerse — PlanetPanel
 * Slides in from the right when a planet (repo) is selected.
 * Shows full repository metadata in sci-fi HUD style.
 */

import { useCallback } from "react";
import { useAppStore } from "@/hooks/useAppStore";
import { formatCount, formatRelativeTime, getActivityLevel } from "@/utils/formatters";
import type { PlanetConfig } from "@/types";
import styles from "./PlanetPanel.module.css";

interface PlanetPanelProps {
  planet: PlanetConfig | null;
}

export default function PlanetPanel({ planet }: PlanetPanelProps) {
  const setSelectedPlanet = useAppStore((s) => s.setSelectedPlanet);
  const close = useCallback(() => setSelectedPlanet(null), [setSelectedPlanet]);

  return (
    <aside className={`${styles.panel} ${planet ? styles.open : ""}`}>
      {planet && <PanelContent planet={planet} onClose={close} />}
    </aside>
  );
}

function PanelContent({ planet, onClose }: { planet: PlanetConfig; onClose: () => void }) {
  const activity = getActivityLevel(planet.lastActivity);

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.planetDot} style={{ background: planet.planetColor }} />
          <div>
            <div className={styles.repoName}>{planet.name}</div>
            {planet.primaryLanguage && (
              <div className={styles.language}>
                <span
                  className={styles.langDot}
                  style={{ background: planet.languageColor ?? "#888" }}
                />
                {planet.primaryLanguage}
              </div>
            )}
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      {/* Description */}
      {planet.description && (
        <p className={styles.description}>{planet.description}</p>
      )}

      {/* Status badges */}
      <div className={styles.badges}>
        <span className={styles.badge} style={{ borderColor: activity.color, color: activity.color }}>
          {activity.label}
        </span>
        {planet.isFork     && <span className={styles.badgeNeutral}>FORK</span>}
        {planet.isPrivate  && <span className={styles.badgeNeutral}>PRIVATE</span>}
        {planet.isArchived && <span className={styles.badgeNeutral}>ARCHIVED</span>}
      </div>

      <div className={styles.divider} />

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        <StatItem icon="★" label="STARS"    value={formatCount(planet.stars)} />
        <StatItem icon="⑂" label="FORKS"    value={formatCount(planet.forks)} />
        <StatItem icon="↑" label="COMMITS"  value={formatCount(planet.commits)} />
        <StatItem icon="!" label="ISSUES"   value={formatCount(planet.issues)} />
        <StatItem icon="⤴" label="PRs"      value={formatCount(planet.pullRequests)} />
        <StatItem icon="◎" label="WATCHERS" value={formatCount(planet.contributors)} />
      </div>

      <div className={styles.divider} />

      {/* Language breakdown */}
      {planet.languages.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>LANGUAGES</div>
          <div className={styles.langBar}>
            {planet.languages.map((lang) => (
              <div
                key={lang.name}
                className={styles.langSegment}
                style={{ width: `${lang.percentage}%`, background: lang.color }}
                title={`${lang.name}: ${lang.percentage}%`}
              />
            ))}
          </div>
          <div className={styles.langList}>
            {planet.languages.map((lang) => (
              <span key={lang.name} className={styles.langItem}>
                <span className={styles.langDot} style={{ background: lang.color }} />
                {lang.name} {lang.percentage}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>TELEMETRY</div>
        <div className={styles.metaList}>
          <MetaRow label="LAST PUSH"  value={formatRelativeTime(planet.lastActivity)} />
          <MetaRow label="CREATED"    value={formatRelativeTime(planet.createdAt)} />
          <MetaRow label="MOONS"      value={String(planet.moons.length)} note="(forks)" />
          <MetaRow label="STATIONS"   value={String(planet.spaceStations.length)} note="(open PRs)" />
          {planet.hasAsteroidBelt && (
            <MetaRow label="ASTEROIDS" value={String(planet.asteroidCount)} note="(issues)" />
          )}
        </div>
      </div>

      {/* CTA */}
      <a
        href={planet.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.viewBtn}
      >
        VIEW REPOSITORY ↗
      </a>
    </>
  );
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className={styles.statItem}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function MetaRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className={styles.metaRow}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>
        {value}
        {note && <span className={styles.metaNote}> {note}</span>}
      </span>
    </div>
  );
}

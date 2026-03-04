/**
 * GitVerse — Landing Screen
 * Sci-fi styled username entry. Phase 1 UI.
 */

import { useState, useCallback } from "react";
import { useGalaxyData } from "@/hooks/useGalaxyData";
import styles from "./LandingScreen.module.css";

export default function LandingScreen() {
  const [username, setUsername] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const { loadGalaxy } = useGalaxyData();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = username.trim();

      if (!trimmed) {
        setInputError("Enter a GitHub username to begin.");
        return;
      }
      if (!/^[a-zA-Z0-9\-]{1,39}$/.test(trimmed)) {
        setInputError("Invalid username. Use letters, numbers, or hyphens.");
        return;
      }

      setInputError(null);
      await loadGalaxy(trimmed);
    },
    [username, loadGalaxy]
  );

  return (
    <div className={styles.container}>
      {/* Starfield bg */}
      <div className={styles.starfield} aria-hidden="true">
        {Array.from({ length: 80 }, (_, i) => (
          <span key={i} className={styles.star} style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
          }} />
        ))}
      </div>

      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <h1 className={styles.logoText}>
            GIT<span className={styles.logoAccent}>VERSE</span>
          </h1>
        </div>

        <p className={styles.tagline}>
          EXPLORE CODE AS A LIVING GALAXY
        </p>

        <div className={styles.divider} />

        <p className={styles.description}>
          Transform any GitHub profile into an immersive 3D galaxy.
          <br />
          Repositories become planets. Stars become light. History becomes motion.
        </p>

        {/* Input Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <span className={styles.inputPrefix}>@</span>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setInputError(null);
              }}
              placeholder="github-username"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              maxLength={39}
            />
          </div>
          {inputError && (
            <p className={styles.inputError}>{inputError}</p>
          )}
          <button className={styles.launchBtn} type="submit">
            <span className={styles.launchBtnInner}>
              LAUNCH GALAXY
              <svg viewBox="0 0 24 24" fill="none" className={styles.launchIcon}>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </form>

        {/* Example usernames */}
        <div className={styles.examples}>
          <span className={styles.examplesLabel}>TRY:</span>
          {["torvalds", "gaearon", "sindresorhus", "nicolo"].map((u) => (
            <button
              key={u}
              className={styles.exampleBtn}
              onClick={() => setUsername(u)}
              type="button"
            >
              @{u}
            </button>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <span>GITVERSE v1.0</span>
        <span>POWERED BY GITHUB GRAPHQL API</span>
      </footer>
    </div>
  );
}

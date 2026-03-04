/**
 * GitVerse — Global App State (Zustand)
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AppState, AppPhase, PlanetConfig, GalaxyConfig, AppError } from "@/types";

// ─────────────────────────────────────────────────
//  Store Interface
// ─────────────────────────────────────────────────

interface AppStore extends AppState {
  // Actions
  setPhase: (phase: AppPhase) => void;
  setUsername: (username: string) => void;
  setGalaxyConfig: (config: GalaxyConfig) => void;
  setSelectedPlanet: (planet: PlanetConfig | null) => void;
  setHoveredPlanet: (planet: PlanetConfig | null) => void;
  setTimeWarp: (value: number) => void;
  setTimeWarpActive: (active: boolean) => void;
  setError: (error: AppError | null) => void;
  setProbeMode: (enabled: boolean) => void;
  reset: () => void;
}

// ─────────────────────────────────────────────────
//  Initial State
// ─────────────────────────────────────────────────

const initialState: AppState = {
  phase: "landing",
  username: null,
  galaxyConfig: null,
  selectedPlanet: null,
  hoveredPlanet: null,
  timeWarpValue: 1,       // 1 = present
  isTimeWarpActive: false,
  error: null,
  isProbeMode: false,
};

// ─────────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setPhase: (phase) => set({ phase }, false, "setPhase"),

      setUsername: (username) => set({ username }, false, "setUsername"),

      setGalaxyConfig: (galaxyConfig) =>
        set({ galaxyConfig }, false, "setGalaxyConfig"),

      setSelectedPlanet: (selectedPlanet) =>
        set({ selectedPlanet }, false, "setSelectedPlanet"),

      setHoveredPlanet: (hoveredPlanet) =>
        set({ hoveredPlanet }, false, "setHoveredPlanet"),

      setTimeWarp: (timeWarpValue) =>
        set({ timeWarpValue }, false, "setTimeWarp"),

      setTimeWarpActive: (isTimeWarpActive) =>
        set({ isTimeWarpActive }, false, "setTimeWarpActive"),

      setError: (error) => set({ error }, false, "setError"),

      setProbeMode: (isProbeMode) =>
        set({ isProbeMode }, false, "setProbeMode"),

      reset: () => set(initialState, false, "reset"),
    }),
    { name: "GitVerse" }
  )
);

// ─────────────────────────────────────────────────
//  Selectors (memoized for performance)
// ─────────────────────────────────────────────────

export const selectPhase = (s: AppStore) => s.phase;
export const selectGalaxyConfig = (s: AppStore) => s.galaxyConfig;
export const selectSelectedPlanet = (s: AppStore) => s.selectedPlanet;
export const selectHoveredPlanet = (s: AppStore) => s.hoveredPlanet;
export const selectTimeWarp = (s: AppStore) => ({
  value: s.timeWarpValue,
  active: s.isTimeWarpActive,
});
export const selectError = (s: AppStore) => s.error;
export const selectUsername = (s: AppStore) => s.username;

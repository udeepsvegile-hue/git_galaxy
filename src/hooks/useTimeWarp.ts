/**
 * GitVerse — useTimeWarp
 * Computes scale and glow multipliers for planets based on timeWarpValue.
 * A planet "grows" proportionally to how much activity it had by that time.
 *
 * Since we don't have per-year commit data from the API (would need too many
 * requests), we simulate a realistic growth curve per planet using its
 * creation date and total commit count, then linearly interpolate.
 */

import { useMemo } from "react";
import { useAppStore } from "./useAppStore";
import type { PlanetConfig } from "@/types";

interface TimeWarpState {
  scale: number;       // multiplier for planet size (0–1.5)
  glowMult: number;    // multiplier for glow intensity
  moonCount: number;   // how many moons to show
}

export function useTimeWarpState(planet: PlanetConfig): TimeWarpState {
  const timeWarpValue    = useAppStore((s) => s.timeWarpValue);
  const isTimeWarpActive = useAppStore((s) => s.isTimeWarpActive);

  return useMemo(() => {
    if (!isTimeWarpActive) {
      return { scale: 1, glowMult: 1, moonCount: planet.moons.length };
    }

    // Derive approximate "age factor" for this repo at the given time warp
    const created = new Date(planet.createdAt).getTime();
    const now     = Date.now();
    const totalSpan = now - created;

    // The "time" represented by the slider
    const tenYearsAgo = now - 10 * 365.25 * 24 * 3600 * 1000;
    const sliderTime  = tenYearsAgo + timeWarpValue * (now - tenYearsAgo);

    // How much of the repo's lifetime has elapsed at slider time
    if (sliderTime < created) {
      // Repo didn't exist yet
      return { scale: 0.01, glowMult: 0, moonCount: 0 };
    }

    const elapsed = Math.min(sliderTime - created, totalSpan);
    const ageFraction = totalSpan > 0 ? elapsed / totalSpan : 1;

    // Simulate sigmoid-ish growth (slow start, ramp up, plateau)
    const growthCurve = ageFraction < 0.5
      ? 2 * ageFraction * ageFraction
      : 1 - Math.pow(-2 * ageFraction + 2, 2) / 2;

    const scale    = Math.max(0.1, growthCurve);
    const glowMult = Math.max(0, growthCurve);
    const moonCount = Math.round(planet.moons.length * ageFraction);

    return { scale, glowMult, moonCount };
  }, [isTimeWarpActive, timeWarpValue, planet]);
}

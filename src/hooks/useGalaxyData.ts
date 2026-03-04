/**
 * GitVerse — useGalaxyData
 * Orchestrates data fetching and transformation for the galaxy.
 */

import { useCallback } from "react";
import { fetchUserGalaxy } from "@/services/github";
import { mapGitHubDataToGalaxy } from "@/utils/galaxyMapper";
import { useAppStore } from "./useAppStore";
import type { AppError } from "@/types";

export function useGalaxyData() {
  const { setPhase, setUsername, setGalaxyConfig, setError, reset } =
    useAppStore();

  const loadGalaxy = useCallback(
    async (username: string) => {
      const trimmed = username.trim();
      if (!trimmed) return;

      // Transition to loading
      setUsername(trimmed);
      setPhase("loading");
      setError(null);

      try {
        const apiResponse = await fetchUserGalaxy(trimmed);

        // Type the user and repositories from the response
        const galaxyConfig = mapGitHubDataToGalaxy(
          apiResponse.user as any,
          apiResponse.repositories as any
        );

        // Check if account has any repos
        if (galaxyConfig.planets.length === 0) {
          setError({
            type: "empty_account",
            message: `@${trimmed} has no public repositories to visualize.`,
          });
          setPhase("error");
          return;
        }

        setGalaxyConfig(galaxyConfig);
        setPhase("galaxy");
      } catch (err) {
        const appError = err as AppError;
        setError({
          type: appError.type ?? "unknown",
          message: appError.message ?? "An unexpected error occurred.",
          retryAfter: appError.retryAfter,
        });
        setPhase("error");
      }
    },
    [setUsername, setPhase, setError, setGalaxyConfig]
  );

  const clearGalaxy = useCallback(() => {
    reset();
  }, [reset]);

  return { loadGalaxy, clearGalaxy };
}

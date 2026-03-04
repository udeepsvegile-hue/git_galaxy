// =====================================================
//  GitVerse — Core TypeScript Types
// =====================================================

// ─────────────────────────────────────────────────
//  GitHub API Raw Types
// ─────────────────────────────────────────────────

export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  company: string | null;
  location: string | null;
  websiteUrl: string | null;
  twitterUsername: string | null;
  followers: { totalCount: number };
  following: { totalCount: number };
  repositories: { totalCount: number };
  contributionsCollection: {
    totalCommitContributions: number;
    totalPullRequestContributions: number;
    totalIssueContributions: number;
  };
  createdAt: string;
}

export interface GitHubRepository {
  id: string;
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string; color: string } | null;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  defaultBranchRef: {
    target: {
      history: {
        totalCount: number;
      };
    };
  } | null;
  pullRequests: { totalCount: number };
  issues: { totalCount: number };
  watchers: { totalCount: number };
  languages: {
    edges: Array<{
      size: number;
      node: { name: string; color: string };
    }>;
  };
}

// ─────────────────────────────────────────────────
//  Galaxy / Visual Configuration Types
// ─────────────────────────────────────────────────

export interface GalaxyConfig {
  user: UserStar;
  planets: PlanetConfig[];
  totalStars: number;
  totalForks: number;
  totalCommits: number;
}

export interface UserStar {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string | null;
  followers: number;
  following: number;
  totalRepos: number;
  totalCommits: number;
  // Visual
  coreIntensity: number; // 0–1, based on follower count
  coreColor: string;
  coreSize: number;
}

export interface PlanetConfig {
  id: string;
  name: string;
  description: string | null;
  url: string;

  // Orbital mechanics
  orbitRadius: number;
  orbitSpeed: number;
  orbitInclination: number; // radians
  orbitPhaseOffset: number; // radians, starting angle

  // Planet appearance
  planetRadius: number;
  planetColor: string;
  textureType: PlanetTextureType;
  surfaceComplexity: number; // 0–1, based on commit count
  glowIntensity: number;     // 0–1, based on star count
  glowColor: string;
  ringSystem: boolean;        // has a ring if issues > 10

  // Moons (forks)
  moons: MoonConfig[];

  // Space stations (pull requests)
  spaceStations: SpaceStationConfig[];

  // Asteroid belt (issues)
  hasAsteroidBelt: boolean;
  asteroidCount: number;

  // Metadata for HUD
  stars: number;
  forks: number;
  commits: number;
  issues: number;
  pullRequests: number;
  primaryLanguage: string | null;
  languageColor: string | null;
  contributors: number;
  lastActivity: string;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  createdAt: string;
  languages: Array<{ name: string; color: string; percentage: number }>;
}

export type PlanetTextureType =
  | "rocky"
  | "oceanic"
  | "gaseous"
  | "icy"
  | "volcanic"
  | "desert"
  | "forest"
  | "crystalline";

export interface MoonConfig {
  id: string;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
  color: string;
  phaseOffset: number;
}

export interface SpaceStationConfig {
  id: string;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
  phaseOffset: number;
}

// ─────────────────────────────────────────────────
//  App State Types
// ─────────────────────────────────────────────────

export type AppPhase =
  | "landing"      // Initial username entry screen
  | "loading"      // Fetching GitHub data
  | "galaxy"       // Main 3D galaxy view
  | "scanning"     // Probe is scanning a planet
  | "error";       // Error state

export interface AppState {
  phase: AppPhase;
  username: string | null;
  galaxyConfig: GalaxyConfig | null;
  selectedPlanet: PlanetConfig | null;
  hoveredPlanet: PlanetConfig | null;
  timeWarpValue: number;       // 0–1, timeline position
  isTimeWarpActive: boolean;
  error: AppError | null;
  isProbeMode: boolean;
}

export interface AppError {
  type: "not_found" | "rate_limit" | "network" | "empty_account" | "unknown";
  message: string;
  retryAfter?: number; // seconds, for rate limit errors
}

// ─────────────────────────────────────────────────
//  Camera & Navigation Types
// ─────────────────────────────────────────────────

export interface CameraState {
  mode: "orbit" | "fly" | "focus";
  target: [number, number, number] | null;
  position: [number, number, number];
  isTransitioning: boolean;
}

// ─────────────────────────────────────────────────
//  API Response Types
// ─────────────────────────────────────────────────

export interface GitHubApiResponse {
  user: GitHubUser;
  repositories: GitHubRepository[];
  cachedAt: number;
  rateLimitRemaining: number;
}

export interface ApiErrorResponse {
  error: string;
  type: AppError["type"];
  retryAfter?: number;
}

// ─────────────────────────────────────────────────
//  Time Warp Types
// ─────────────────────────────────────────────────

export interface TimeSnapshot {
  date: string;         // ISO date string
  planetStates: Record<
    string,
    {
      size: number;
      glowIntensity: number;
      moonCount: number;
      commitCount: number;
    }
  >;
}

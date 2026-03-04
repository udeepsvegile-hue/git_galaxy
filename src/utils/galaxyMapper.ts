/**
 * GitVerse — Galaxy Mapper
 * Transforms raw GitHub API data into visual planet/galaxy configurations.
 */

import type {
  GitHubRepository,
  GitHubUser,
  GalaxyConfig,
  PlanetConfig,
  MoonConfig,
  SpaceStationConfig,
  PlanetTextureType,
  UserStar,
} from "@/types";

// ─────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────

// Orbital spacing: inner radius, spacing increment
const ORBIT_MIN_RADIUS = 8;
const ORBIT_SPACING = 3.5;
const ORBIT_JITTER = 1.2; // small randomness per planet

const PLANET_SIZE_MIN = 0.35;
const PLANET_SIZE_MAX = 1.8;

const MOON_SIZE_BASE = 0.12;
const MAX_MOONS = 6; // cap for visual clarity

// Language → color fallback
const LANGUAGE_COLOR_FALLBACK = "#8b949e";

// ─────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────

/** Normalize a value from [inMin, inMax] → [outMin, outMax] */
function normalize(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  if (inMax === inMin) return outMin;
  const ratio = Math.min(Math.max((value - inMin) / (inMax - inMin), 0), 1);
  return outMin + ratio * (outMax - outMin);
}

/** Simple deterministic pseudo-random from a string seed */
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (Math.imul(2654435769, h) ^ (h >>> 16)) | 0;
    return ((h >>> 0) / 0xffffffff);
  };
}

/** Pick planet texture based on primary language */
function pickTextureType(
  language: string | null,
  stars: number,
  commits: number
): PlanetTextureType {
  const textureMap: Record<string, PlanetTextureType> = {
    JavaScript: "oceanic",
    TypeScript: "oceanic",
    Python: "forest",
    Rust: "volcanic",
    Go: "icy",
    "C++": "rocky",
    C: "rocky",
    "C#": "rocky",
    Java: "desert",
    Ruby: "volcanic",
    PHP: "desert",
    Swift: "icy",
    Kotlin: "crystalline",
    Dart: "crystalline",
    Haskell: "gaseous",
    Elixir: "gaseous",
    Scala: "gaseous",
    Shell: "rocky",
    HTML: "oceanic",
    CSS: "forest",
    SCSS: "forest",
    Vue: "forest",
    Svelte: "icy",
  };

  if (language && textureMap[language]) return textureMap[language];

  // Fallback based on metrics
  if (stars > 1000) return "crystalline";
  if (commits > 500) return "volcanic";
  return "rocky";
}

/** Derive glow color from primary language color */
function deriveGlowColor(langColor: string | null, stars: number): string {
  if (stars > 5000) return "#ffd700"; // Gold for mega-popular
  if (stars > 1000) return "#ff8c00"; // Orange for popular
  if (langColor) return langColor;
  return "#4fc3f7";                    // Default blue
}

// ─────────────────────────────────────────────────
//  Map User → UserStar
// ─────────────────────────────────────────────────

function mapUserToStar(user: GitHubUser): UserStar {
  const followers = user.followers.totalCount;
  const totalCommits =
    user.contributionsCollection.totalCommitContributions;

  return {
    login: user.login,
    name: user.name ?? user.login,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    followers,
    following: user.following.totalCount,
    totalRepos: user.repositories.totalCount,
    totalCommits,
    coreIntensity: Math.min(followers / 5000, 1),
    coreColor: followers > 1000 ? "#ffe066" : "#88c0d0",
    coreSize: normalize(followers, 0, 10000, 1.5, 4.5),
  };
}

// ─────────────────────────────────────────────────
//  Map Repository → PlanetConfig
// ─────────────────────────────────────────────────

function mapRepoToPlanet(
  repo: GitHubRepository,
  index: number,
  allRepos: GitHubRepository[]
): PlanetConfig {
  const rand = seededRandom(repo.id + repo.name);

  // ── Normalize metrics ──────────────────────────
  const maxStars = Math.max(...allRepos.map((r) => r.stargazerCount), 1);
  const maxForks = Math.max(...allRepos.map((r) => r.forkCount), 1);
  const maxCommits = Math.max(
    ...allRepos.map((r) => r.defaultBranchRef?.target?.history?.totalCount ?? 0),
    1
  );

  const stars = repo.stargazerCount;
  const forks = repo.forkCount;
  const commits = repo.defaultBranchRef?.target?.history?.totalCount ?? 0;
  const issues = repo.issues.totalCount;
  const prs = repo.pullRequests.totalCount;

  // ── Orbital mechanics ─────────────────────────
  // Sort by stars descending → higher-star repos orbit closer (more visible)
  const orbitRadius =
    ORBIT_MIN_RADIUS +
    index * ORBIT_SPACING +
    rand() * ORBIT_JITTER;

  const orbitSpeed =
    0.05 + (1 - index / allRepos.length) * 0.15 + rand() * 0.05;

  const orbitInclination = (rand() - 0.5) * 0.4; // subtle tilt
  const orbitPhaseOffset = rand() * Math.PI * 2;

  // ── Planet appearance ─────────────────────────
  const planetRadius = normalize(
    commits,
    0,
    maxCommits,
    PLANET_SIZE_MIN,
    PLANET_SIZE_MAX
  );

  const langColor = repo.primaryLanguage?.color ?? null;
  const textureType = pickTextureType(
    repo.primaryLanguage?.name ?? null,
    stars,
    commits
  );
  const glowIntensity = normalize(stars, 0, maxStars, 0, 1);
  const glowColor = deriveGlowColor(langColor, stars);

  // ── Moons (forks) ─────────────────────────────
  const moonCount = Math.min(Math.round(normalize(forks, 0, maxForks, 0, MAX_MOONS)), MAX_MOONS);
  const moons: MoonConfig[] = Array.from({ length: moonCount }, (_, i) => {
    const mRand = seededRandom(`${repo.id}-moon-${i}`);
    return {
      id: `${repo.id}-moon-${i}`,
      orbitRadius: planetRadius + 0.6 + i * 0.5 + mRand() * 0.2,
      orbitSpeed: 0.5 + mRand() * 0.8,
      size: MOON_SIZE_BASE + mRand() * 0.08,
      color: `hsl(${Math.floor(mRand() * 360)}, 30%, 70%)`,
      phaseOffset: mRand() * Math.PI * 2,
    };
  });

  // ── Space stations (pull requests) ────────────
  const stationCount = Math.min(prs, 3);
  const spaceStations: SpaceStationConfig[] = Array.from(
    { length: stationCount },
    (_, i) => {
      const sRand = seededRandom(`${repo.id}-station-${i}`);
      return {
        id: `${repo.id}-station-${i}`,
        orbitRadius: planetRadius + moons.length * 0.5 + 1 + i * 0.4,
        orbitSpeed: 1.2 + sRand() * 0.5,
        size: 0.06 + sRand() * 0.04,
        phaseOffset: sRand() * Math.PI * 2,
      };
    }
  );

  // ── Language breakdown ─────────────────────────
  const totalLangSize = repo.languages.edges.reduce((s, e) => s + e.size, 0);
  const languages = repo.languages.edges.map((edge) => ({
    name: edge.node.name,
    color: edge.node.color || LANGUAGE_COLOR_FALLBACK,
    percentage:
      totalLangSize > 0
        ? Math.round((edge.size / totalLangSize) * 100)
        : 0,
  }));

  return {
    id: repo.id,
    name: repo.name,
    description: repo.description,
    url: repo.url,

    // Orbital
    orbitRadius,
    orbitSpeed,
    orbitInclination,
    orbitPhaseOffset,

    // Appearance
    planetRadius,
    planetColor: langColor ?? "#4a9eff",
    textureType,
    surfaceComplexity: normalize(commits, 0, maxCommits, 0, 1),
    glowIntensity,
    glowColor,
    ringSystem: issues > 10,

    // Entities
    moons,
    spaceStations,
    hasAsteroidBelt: issues > 5,
    asteroidCount: Math.min(issues * 2, 30),

    // HUD metadata
    stars,
    forks,
    commits,
    issues,
    pullRequests: prs,
    primaryLanguage: repo.primaryLanguage?.name ?? null,
    languageColor: langColor,
    contributors: repo.watchers.totalCount,
    lastActivity: repo.pushedAt ?? repo.updatedAt,
    isPrivate: repo.isPrivate,
    isFork: repo.isFork,
    isArchived: repo.isArchived,
    createdAt: repo.createdAt,
    languages,
  };
}

// ─────────────────────────────────────────────────
//  Main Mapper
// ─────────────────────────────────────────────────

export function mapGitHubDataToGalaxy(
  user: GitHubUser,
  repositories: GitHubRepository[]
): GalaxyConfig {
  // Filter archived/empty repos for cleaner galaxy, sort by stars descending
  const activeRepos = repositories
    .filter((r) => !r.isArchived)
    .sort((a, b) => b.stargazerCount - a.stargazerCount);

  const planets = activeRepos.map((repo, index) =>
    mapRepoToPlanet(repo, index, activeRepos)
  );

  const totalStars = repositories.reduce((sum, r) => sum + r.stargazerCount, 0);
  const totalForks = repositories.reduce((sum, r) => sum + r.forkCount, 0);
  const totalCommits = repositories.reduce(
    (sum, r) => sum + (r.defaultBranchRef?.target?.history?.totalCount ?? 0),
    0
  );

  return {
    user: mapUserToStar(user),
    planets,
    totalStars,
    totalForks,
    totalCommits,
  };
}

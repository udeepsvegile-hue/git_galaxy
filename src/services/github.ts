/**
 * GitVerse - Frontend GitHub Service
 * Primary path: Netlify function proxy.
 * Fallback path (dev resilience): GitHub public REST API for public profile data.
 */

import type {
  GitHubApiResponse,
  ApiErrorResponse,
  AppError,
  GitHubRepository,
  GitHubUser,
} from "@/types";

const FUNCTION_PATH = "/.netlify/functions/github";
const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_BASE_URL?.replace(/\/$/, "") ?? "";
const MAX_REPOS = Number(import.meta.env.VITE_MAX_REPOS) || 100;

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

interface ClientCacheEntry {
  data: GitHubApiResponse;
  expiresAt: number;
}

const clientCache = new Map<string, ClientCacheEntry>();
const CACHE_TTL = Number(import.meta.env.VITE_CACHE_TTL) || 5 * 60 * 1000;

function buildFunctionUrls(): string[] {
  // If an explicit function base is configured, avoid also calling relative path.
  // This prevents noisy Vite proxy ECONNREFUSED logs when Netlify dev isn't running.
  if (FUNCTIONS_BASE) {
    return [`${FUNCTIONS_BASE}${FUNCTION_PATH}`];
  }
  return [FUNCTION_PATH];
}

function toAppError(errorData: ApiErrorResponse): AppError {
  return {
    type: errorData.type ?? "unknown",
    message: errorData.error ?? "An unexpected error occurred",
    retryAfter: errorData.retryAfter,
  };
}

async function fetchViaFunction(username: string): Promise<GitHubApiResponse | null> {
  const candidates = buildFunctionUrls();

  for (const baseUrl of candidates) {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set("username", username);
    url.searchParams.set("maxRepos", String(MAX_REPOS));

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        return (await response.json()) as GitHubApiResponse;
      }

      let errorData: ApiErrorResponse;
      try {
        errorData = (await response.json()) as ApiErrorResponse;
      } catch {
        errorData = { error: "Network error", type: "network" };
      }

      // If function host/path is unavailable, continue to next candidate.
      const isInfraIssue =
        errorData.type === "network" ||
        response.status >= 500 ||
        response.status === 404;

      if (isInfraIssue) {
        continue;
      }

      throw toAppError(errorData);
    } catch {
      // Try next endpoint candidate.
      continue;
    }
  }

  return null;
}

async function fetchJson(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });
}

async function fetchUserFromRest(username: string): Promise<any> {
  const response = await fetchJson(`https://api.github.com/users/${encodeURIComponent(username)}`);

  if (response.status === 404) {
    throw { type: "not_found", message: `GitHub user "${username}" not found.` } as AppError;
  }

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw {
        type: "rate_limit",
        message: "GitHub API rate limit exceeded. Try again later.",
      } as AppError;
    }

    throw {
      type: "network",
      message: `GitHub API responded with ${response.status}.`,
    } as AppError;
  }

  return response.json();
}

async function fetchReposFromRest(username: string, maxRepos: number): Promise<any[]> {
  const repos: any[] = [];
  const perPage = 100;
  let page = 1;

  while (repos.length < maxRepos) {
    const remaining = maxRepos - repos.length;
    const take = Math.min(perPage, remaining);
    const response = await fetchJson(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${take}&page=${page}`
    );

    if (!response.ok) break;

    const chunk = (await response.json()) as any[];
    repos.push(...chunk);

    if (chunk.length < take) break;
    page += 1;
  }

  return repos;
}

function mapRestUser(user: any, totalRepos: number): GitHubUser {
  return {
    login: user.login,
    name: user.name ?? null,
    bio: user.bio ?? null,
    avatarUrl: user.avatar_url,
    company: user.company ?? null,
    location: user.location ?? null,
    websiteUrl: user.blog || null,
    twitterUsername: user.twitter_username ?? null,
    followers: { totalCount: user.followers ?? 0 },
    following: { totalCount: user.following ?? 0 },
    repositories: { totalCount: totalRepos },
    contributionsCollection: {
      totalCommitContributions: 0,
      totalPullRequestContributions: 0,
      totalIssueContributions: 0,
    },
    createdAt: user.created_at,
  };
}

function mapRestRepo(repo: any): GitHubRepository {
  const primaryLanguageName = repo.language ?? null;
  const primaryLanguageColor = primaryLanguageName
    ? LANGUAGE_COLORS[primaryLanguageName] ?? "#8b949e"
    : "#8b949e";

  return {
    id: String(repo.id),
    name: repo.name,
    description: repo.description ?? null,
    url: repo.html_url,
    stargazerCount: repo.stargazers_count ?? 0,
    forkCount: repo.forks_count ?? 0,
    primaryLanguage: primaryLanguageName
      ? { name: primaryLanguageName, color: primaryLanguageColor }
      : null,
    isPrivate: repo.private ?? false,
    isFork: repo.fork ?? false,
    isArchived: repo.archived ?? false,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at ?? null,
    defaultBranchRef: null,
    pullRequests: { totalCount: 0 },
    issues: { totalCount: repo.open_issues_count ?? 0 },
    watchers: { totalCount: repo.watchers_count ?? 0 },
    languages: {
      edges: primaryLanguageName
        ? [
            {
              size: 100,
              node: { name: primaryLanguageName, color: primaryLanguageColor },
            },
          ]
        : [],
    },
  };
}

async function fetchViaPublicRest(username: string): Promise<GitHubApiResponse> {
  const user = await fetchUserFromRest(username);
  const repos = await fetchReposFromRest(username, MAX_REPOS);

  const repositories = repos.map(mapRestRepo);

  return {
    user: mapRestUser(user, user.public_repos ?? repositories.length),
    repositories,
    cachedAt: Date.now(),
    rateLimitRemaining: -1,
  };
}

export async function fetchUserGalaxy(username: string): Promise<GitHubApiResponse> {
  const key = username.toLowerCase();

  const cached = clientCache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  try {
    const fromFunction = await fetchViaFunction(username);
    if (fromFunction) {
      clientCache.set(key, { data: fromFunction, expiresAt: Date.now() + CACHE_TTL });
      return fromFunction;
    }

    const fromRest = await fetchViaPublicRest(username);
    clientCache.set(key, { data: fromRest, expiresAt: Date.now() + CACHE_TTL });
    return fromRest;
  } catch (err) {
    const appError = err as AppError;
    throw {
      type: appError.type ?? "network",
      message:
        appError.message ??
        "Unable to scan profile. If using local dev, start Netlify functions with `npm run netlify:dev`.",
      retryAfter: appError.retryAfter,
    } as AppError;
  }
}

export function invalidateCache(username?: string): void {
  if (username) {
    clientCache.delete(username.toLowerCase());
  } else {
    clientCache.clear();
  }
}

export function getCacheStatus(username: string): {
  isCached: boolean;
  expiresIn: number | null;
} {
  const key = username.toLowerCase();
  const entry = clientCache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    return { isCached: false, expiresIn: null };
  }
  return {
    isCached: true,
    expiresIn: Math.ceil((entry.expiresAt - Date.now()) / 1000),
  };
}

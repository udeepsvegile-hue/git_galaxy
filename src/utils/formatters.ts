export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function formatRelativeTime(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;

  const months = Math.floor(diffDays / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;

  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

export function getActivityLevel(dateInput: string): { label: string; color: string } {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return { label: "UNKNOWN", color: "#94a3b8" };
  }

  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return { label: "HOT", color: "#22c55e" };
  if (diffDays <= 30) return { label: "WARM", color: "#f59e0b" };
  return { label: "COLD", color: "#94a3b8" };
}

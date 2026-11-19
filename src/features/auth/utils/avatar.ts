/**
 * Extracts up to two uppercase initials from a user's display name.
 * Defaults to "PT" if no valid name is provided.
 */
export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) {
    return "PT";
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

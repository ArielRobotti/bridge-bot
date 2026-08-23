export interface UserActivity {
  userId: string;
  username: string;
  messageCount: number;
  lastActive: number; // Timestamp
}

// Mapa en memoria: key = userId, value = datos de actividad
const activityCache = new Map<string, UserActivity>();

export function trackMessage(userId: string, username: string, content: string): void {
  // Filtro de al menos 4 palabras
  const words = content.trim().split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 4) return;

  const current = activityCache.get(userId) || {
    userId,
    username,
    messageCount: 0,
    lastActive: Date.now(),
  };

  current.messageCount += 1;
  current.username = username; // Mantiene actualizado el username
  current.lastActive = Date.now();

  activityCache.set(userId, current);
}

export function getTopPosters(days: number = 7, limit: number = 5): UserActivity[] {
  const cutoffTimestamp = Date.now() - days * 24 * 60 * 60 * 1000;

  return Array.from(activityCache.values())
    .filter((user) => user.lastActive >= cutoffTimestamp)
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, limit);
}
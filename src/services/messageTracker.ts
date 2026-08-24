import { Client, TextChannel, ChannelType } from "discord.js";

export interface UserActivity {
  userId: string;
  username: string;
  messageCount: number;
  lastActive: number;
}

interface StoredMessage {
  id: string;
  userId: string;
  username: string;
  timestamp: number;
}

// Map indexado por ID de mensaje único (Garantiza cero duplicados)
const messageStore = new Map<string, StoredMessage>();
let isIndexing = false;

// 1. Registro individual en tiempo real
export function trackMessage(
  messageId: string,
  userId: string,
  username: string,
  content: string,
  timestamp: number = Date.now()
): void {
  if (messageStore.has(messageId)) return; // Evita duplicados si el evento se dispara dos veces

  const words = content.trim().split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 4) return;

  messageStore.set(messageId, {
    id: messageId,
    userId,
    username,
    timestamp,
  });
}

// 2. Indexador inicial robusto
export async function seedMessageHistory(client: Client, maxDays: number = 7): Promise<void> {
  if (isIndexing) {
    console.log("[tracker] Indexación en progreso. Se omite llamada duplicada.");
    return;
  }

  isIndexing = true;
  console.log(`[tracker] Indexando historial único de los últimos ${maxDays} días...`);

  const cutoffTimestamp = Date.now() - maxDays * 24 * 60 * 60 * 1000;
  let newMessagesFound = 0;

  for (const guild of client.guilds.cache.values()) {
    try {
      const channels = await guild.channels.fetch();
      const textChannels = channels.filter(
        (ch): ch is TextChannel => ch !== null && ch.type === ChannelType.GuildText
      );

      for (const [_, channel] of textChannels) {
        const me = await guild.members.fetchMe();
        const permissions = channel.permissionsFor(me);

        if (!permissions || !permissions.has("ViewChannel") || !permissions.has("ReadMessageHistory")) {
          continue;
        }

        let lastId: string | undefined = undefined;
        let fetchMore = true;

        while (fetchMore) {
          const options: { limit: number; before?: string } = { limit: 100 };
          if (lastId) options.before = lastId;

          const messages = await channel.messages.fetch(options).catch((err) => {
            console.error(`[tracker] Error obteniendo mensajes de ${channel.name}:`, err.message);
            return null;
          });

          if (!messages || messages.size === 0) break;

          for (const msg of messages.values()) {
            if (msg.createdTimestamp < cutoffTimestamp) {
              fetchMore = false;
              break;
            }

            if (msg.author.bot) continue;

            const words = msg.content.trim().split(/\s+/).filter((w) => w.length > 0);
            if (words.length >= 4) {
              if (!messageStore.has(msg.id)) {
                messageStore.set(msg.id, {
                  id: msg.id,
                  userId: msg.author.id,
                  username: msg.author.username,
                  timestamp: msg.createdTimestamp,
                });
                newMessagesFound++;
              }
            }
          }

          lastId = messages.last()?.id;
          if (messages.size < 100) break;

          // Pequeña pausa para no saturar los Rate Limits de la API de Discord
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }
    } catch (err) {
      console.error(`[tracker] Error escaneando servidor ${guild.name}:`, err);
    }
  }

  isIndexing = false;
  console.log(`[tracker] Indexación completada. Mensajes válidos únicos en memoria: ${messageStore.size} (Nuevos: ${newMessagesFound})`);
}

// 3. Calculador del Top 5 por rango dinámico de días
export function getTopPosters(days: number = 7, limit: number = 5): UserActivity[] {
  const cutoffTimestamp = Date.now() - days * 24 * 60 * 60 * 1000;
  const userMap = new Map<string, UserActivity>();

  for (const msg of messageStore.values()) {
    if (msg.timestamp >= cutoffTimestamp) {
      const current = userMap.get(msg.userId) || {
        userId: msg.userId,
        username: msg.username,
        messageCount: 0,
        lastActive: msg.timestamp,
      };

      current.messageCount += 1;
      current.username = msg.username;
      if (msg.timestamp > current.lastActive) {
        current.lastActive = msg.timestamp;
      }

      userMap.set(msg.userId, current);
    }
  }

  return Array.from(userMap.values())
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, limit);
}
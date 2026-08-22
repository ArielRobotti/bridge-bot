import { Client, GatewayIntentBits } from "discord.js";

let cachedClient: Client | null = null;

export async function getDiscordClient(): Promise<Client> {
  if (cachedClient) return cachedClient;

  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error("Falta la variable de entorno DISCORD_BOT_TOKEN.");
  }

  cachedClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildInvites,
    ],
  });

  console.log("[discord] Token cargado, intentando login...");
  await cachedClient.login(token);
  console.log("[discord] login() completado.");

  return cachedClient;
}
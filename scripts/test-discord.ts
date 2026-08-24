// import "dotenv/config"; // <--- Agrega esto arriba de todo
// import express from "express";
// import { Client, GatewayIntentBits } from "discord.js";
// import { handleInteraction } from "../src/discord/commands.js";

// const app = express();
// const PORT = process.env.PORT || 10000;

// app.get("/", (_req, res) => res.send("Nexus Agent v2.0 (TypeScript) activo 24/7"));
// app.listen(PORT, () => console.log(`[HTTP] Keep-alive escuchando en puerto ${PORT}`));

// const token = process.env.BOT_TOKEN;

// if (!token) {
//   throw new Error("❌ Falta BOT_TOKEN en las variables de entorno / .env");
// }

// const client = new Client({
//   intents: [
//     GatewayIntentBits.Guilds,
//     GatewayIntentBits.GuildMessages,
//     GatewayIntentBits.GuildMembers,
//   ],
// });

// client.on("ready", () => {
//   console.log(`[discord] Bot TS autenticado como: ${client.user?.tag}`);
// });

// client.on("interactionCreate", async (interaction) => {
//   try {
//     await handleInteraction(interaction);
//   } catch (err) {
//     console.error("[events] Error procesando interacción:", err);
//   }
// });

// client.login(token);

import "dotenv/config";
import { getDiscordClient } from "../src/discord/client.js";
import { registerEvents } from "../src/discord/events.js";

import http from "http";

// Iniciar servidor HTTP keep-alive para evitar que Render hiberne la app
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Nexus Bridge Bot is Alive!");
}).listen(PORT, () => {
  console.log(`[HTTP] Servidor keep-alive escuchando en el puerto ${PORT}`);
});

console.log("[test] 🚀 Iniciando conexión a Discord...");

try {
  const client = await getDiscordClient();

  // Se encarga de 'ready' y de 'interactionCreate'
  registerEvents(client);

  // Manejadores de errores globales
  client.on("error", (err: Error) => console.error("[test] ❌ Error del cliente:", err));
  client.on("shardError", (err: Error) => console.error("[test] ❌ Error de shard/websocket:", err));

  console.log("[test] ✅ Bot activo escuchando Slash Commands...");

} catch (err) {
  console.error("[test] ❌ Error fatal iniciando el bot de pruebas:", err);
  process.exit(1);
}


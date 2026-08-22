import "dotenv/config";
import { REST, Routes } from "discord.js";
import { slashCommandsData } from "../src/discord/commands/index.js";

const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  throw new Error("Faltan BOT_TOKEN o CLIENT_ID en el archivo .env");
}

// 1. Cargamos IDs desde las variables de entorno
const envGuilds = [
  process.env.GUILD_ID_NEXUS_SERVER,
  process.env.GUILD_ID_ARIEL_SERVER,
].filter((id): id is string => Boolean(id));

// 2. Leemos los IDs pasados por la línea de comandos (process.argv)
const argsGuilds = process.argv.slice(2);

// 3. Consolidamos en una lista sin duplicados
const targetGuilds = Array.from(new Set([...envGuilds, ...argsGuilds]));

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("🚀 Empezando a actualizar los Slash Commands (/) ...");
    const body = slashCommandsData.map((command) => command.toJSON());

    if (targetGuilds.length > 0) {
      console.log(`📌 Registrando en ${targetGuilds.length} servidor(es)...`);

      for (const guildId of targetGuilds) {
        try {
          await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body }
          );
          console.log(`✅ Comandos cargados en Guild: ${guildId}`);
        } catch (err: any) {
          console.error(`❌ Error al registrar en Guild ${guildId}:`, err.message);
        }
      }
    } else {
      console.log("🌍 No se especificaron Guild IDs. Registrando GLOBALMENTE...");
      await rest.put(
        Routes.applicationCommands(clientId),
        { body }
      );
      console.log("✅ Comandos cargados exitosamente de forma GLOBAL.");
    }
  } catch (error) {
    console.error("❌ Error fatal al registrar los comandos:", error);
  }
})();
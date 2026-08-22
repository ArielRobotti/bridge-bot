import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { ensureNexusRole, getDiscordUser } from "../helpers.js";

export async function handleGetAccount(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    const result = await getDiscordUser(interaction.user.id);
    if (result.ok) {
      await ensureNexusRole(interaction.guild, interaction.user.id);
      const name = result.user!.name?.[0] ?? "(sin nombre)";
      await interaction.editReply(
        `Tu cuenta Nexus: **${name}**\nPrincipal: \`${result.user!.principal.toText()}\``
      );
    } else {
      await interaction.editReply(`No pude encontrar tu cuenta Nexus: ${result.error}`);
    }
  } catch (err) {
    console.error("[discord] Error consultando getDiscordUser:", err);
    await interaction.editReply("Hubo un error consultando tu cuenta Nexus. Intentá de nuevo más tarde.");
  }
}
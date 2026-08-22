import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { getDiscordUser, ensureNexusRole, formatAmount} from "../helpers.js";
import { getNxstBalance } from "../../nexus/ledger.js";

export async function handleBalance(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    const result = await getDiscordUser(interaction.user.id);
    if (!result.ok) {
      await interaction.editReply(`No pude encontrar tu cuenta Nexus: ${result.error}`);
      return;
    }
    await ensureNexusRole(interaction.guild, interaction.user.id);
    const balance = await getNxstBalance(result.user!.principal);

    await interaction.editReply(`Tu balance NXT: **${formatAmount(balance)}**`);
  } catch (err) {
    console.error("[discord] Error consultando balance:", err);
    await interaction.editReply("Hubo un error consultando tu balance. Intentá de nuevo más tarde.");
  }
}
import { ChatInputCommandInteraction, PermissionFlagsBits, TextChannel } from "discord.js";

export async function handleRenameChannel(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  try {
    const newName = interaction.options.getString("nombre", true);
    const channel = interaction.channel as TextChannel | null;

    if (!channel || !interaction.guild) {
      await interaction.editReply("❌ Este comando solo se puede usar dentro de un canal de texto en un servidor.");
      return;
    }

    const botMember = await interaction.guild.members.fetchMe();
    if (!channel.permissionsFor(botMember)?.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply("❌ El bot no tiene el permiso `ManageChannels` (Gestionar Canales) en este canal.");
      return;
    }

    const oldName = channel.name;
    await channel.setName(newName);

    await interaction.editReply(
      `✅ Permisos verificados correctamente.\n` +
      `📢 El canal **#${oldName}** fue renombrado a **#${newName}** por ${interaction.user}.`
    );

  } catch (err: any) {
    console.error("[rename-channel] ERROR:", err);
    await interaction.editReply(
      `❌ Falló el cambio de nombre: \`${err.message}\`.\n` +
      `*Asegurate de que el bot tenga permisos suficientes y recordá que Discord limita los cambios de nombre de canales (rate limit: máx 2 cambios cada 10 minutos).*`
    );
  }
}
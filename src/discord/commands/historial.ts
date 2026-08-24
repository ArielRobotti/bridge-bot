import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { getUserTransactions } from "../../services/transactionLogger.js";

const ADMIN_DISCORD_ID = process.env.ADMIN_DISCORD_ID;

export async function handleHistory(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const targetUserOption = interaction.options.getUser("usuario");
  const executorId = interaction.user.id;

  let targetUserId = executorId;
  let targetUsername = interaction.user.username;

  // Validación de Permiso SuperAdmin
  if (targetUserOption) {
    if (executorId !== ADMIN_DISCORD_ID) {
      await interaction.editReply("❌ No tenés permisos para inspeccionar el historial de otros usuarios.");
      return;
    }
    targetUserId = targetUserOption.id;
    targetUsername = targetUserOption.username;
  }

  const history = getUserTransactions(targetUserId, 10);

  if (history.length === 0) {
    await interaction.editReply(`No se encontraron transacciones registradas para **@${targetUsername}**.`);
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(`📜 Historial de Transacciones — @${targetUsername}`)
    .setFooter({ text: "Nexus Bridge Protocol Audit Log" })
    .setTimestamp();

  const historyLines = history.map((tx) => {
    const dateStr = new Date(tx.timestamp!).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
    const block = tx.blockIndex ? ` | Bloque: \`${tx.blockIndex}\`` : "";

    switch (tx.type) {
      case "CONVERT_NXT_TO_POINTS":
        return `🔹 **[${dateStr}]** Conversión: 🔥 \`${tx.amountNxt} NXT\` ➔ 🎰 \`${tx.amountPoints} Puntos\`${block}`;
      case "CONVERT_POINTS_TO_NXT":
        return `🔹 **[${dateStr}]** Conversión: 🎰 \`${tx.amountPoints} Puntos\` ➔ 🪙 \`${tx.amountNxt} NXT\`${block}`;
      case "P2P_TRANSFER":
        const isSender = tx.userId === targetUserId;
        const arrow = isSender ? "➡️ Enviado a" : "⬅️ Recibido de";
        const otherUser = isSender ? `<@${tx.targetUserId}>` : `<@${tx.userId}>`;
        return `🔹 **[${dateStr}]** Transferencia: ${arrow} ${otherUser} | 🪙 \`${tx.amountNxt} NXT\`${block}`;
      default:
        return `🔹 **[${dateStr}]** Operación: ${tx.type}`;
    }
  });

  embed.setDescription(historyLines.join("\n\n"));

  await interaction.editReply({ embeds: [embed] });
}
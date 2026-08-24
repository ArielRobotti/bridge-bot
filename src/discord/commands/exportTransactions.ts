import { ChatInputCommandInteraction, AttachmentBuilder, MessageFlags } from "discord.js";
import { getAllTransactionsAsCSV } from "../../services/transactionLogger.js";

const ADMIN_DISCORD_ID = process.env.ADMIN_DISCORD_ID;

export async function handleExportTransactions(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  // Restricción exclusiva para SuperAdmin
  if (interaction.user.id !== ADMIN_DISCORD_ID) {
    await interaction.editReply("❌ Acceso denegado. Este comando es de uso exclusivo para el administrador.");
    return;
  }

  try {
    const csvData = getAllTransactionsAsCSV();

    if (!csvData) {
      await interaction.editReply("ℹ️ No hay transacciones registradas en la base de datos.");
      return;
    }

    // Convertimos la cadena de texto a un Buffer de Node.js
    const fileBuffer = Buffer.from(csvData, "utf-8");
    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
    
    const attachment = new AttachmentBuilder(fileBuffer, {
      name: `transactions_log_${timestampStr}.csv`,
    });

    await interaction.editReply({
      content: "📊 **Reporte de Transacciones Exportado**\nAdjunto encontrarás la base de datos completa de operaciones en formato `.csv`:",
      files: [attachment],
    });
  } catch (err) {
    console.error("[export-transactions] Error exportando CSV:", err);
    await interaction.editReply("❌ Ocurrió un error al generar el archivo de reporte.");
  }
}
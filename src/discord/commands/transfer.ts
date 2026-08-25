import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";

import { NXT_DECIMALS } from "../../config/constants.js"
import { getDiscordUser, ensureNexusRole, formatTransferError, NexusUser } from "../helpers.js";
import { bridgeTransferNXT } from "../../nexus/client.js"
import { sendNotificationEmail } from "../../utils/mailer.js";
import { logTransaction } from "../../services/transactionLogger.js";

function formatNexusName(user?: NexusUser): string {
  const nexusName = user?.name?.[0];
  return nexusName ? `**${nexusName}**` : "*Sin nombre configurado*";
}

export async function handleTransfer(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  console.log(interaction)

  const amountNumber = interaction.options.getNumber("monto", true);
  const destinationUser = interaction.options.getUser("usuario", true);

  const from = interaction.user.id;
  const to = destinationUser.id;

  if (from === to) {
    await interaction.editReply("❌ No podés enviarte NXT a tu propia cuenta Nexus.");
    return;
  }

  if (amountNumber <= 0) {
    await interaction.editReply("❌ El monto tiene que ser mayor a cero.");
    return;
  }

  try {
    const [senderResult, destResult] = await Promise.all([
      getDiscordUser(from),
      getDiscordUser(to),
    ]);

    if (!senderResult.ok) {
      await interaction.editReply(`❌ No pude encontrar tu cuenta Nexus: ${senderResult.error}`);
      return;
    }
    await ensureNexusRole(interaction.guild, from);

    if (!destResult.ok) {
      await interaction.editReply(`❌ **@${destinationUser.username}** no tiene una cuenta Nexus vinculada.`);
      return;
    }
    await ensureNexusRole(interaction.guild, to);

    const senderNexusName = formatNexusName(senderResult.user);
    const destNexusName = formatNexusName(destResult.user);

    const confirmBtn = new ButtonBuilder()
      .setCustomId(`confirm_tx_${to}_${amountNumber}`)
      .setLabel("✅ Confirmar Envío")
      .setStyle(ButtonStyle.Success);

    const cancelBtn = new ButtonBuilder()
      .setCustomId("cancel_tx")
      .setLabel("❌ Cancelar")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmBtn, cancelBtn);

    await interaction.editReply({
      content:
        `💸 **Confirmación de Transferencia**\n\n` +
        `• **Monto:** \`${amountNumber} NXT\`\n` +
        `• **Destinatario:** <@${to}> (Usuario Nexus: ${destNexusName})\n` +
        `• **Tu usuario Nexus:** ${senderNexusName}\n\n` +
        `¿Confirmás el envío de los fondos?`,
      components: [row],
    });
  } catch (err) {
    console.error("[transfer] Error preparando transferencia:", err);
    await interaction.editReply("❌ Ocurrió un error inesperado al procesar la transferencia.");
  }
}

export async function handleTransferConfirm(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate();

  const [, , toUserId, amountStr] = interaction.customId.split("_");
  const amountNumber = parseFloat(amountStr);
  const fromUserId = interaction.user.id;

  try {
    const [senderResult, destResult] = await Promise.all([
      getDiscordUser(fromUserId),
      getDiscordUser(toUserId),
    ]);

    if (!senderResult.ok || !destResult.ok) {
      await interaction.editReply({
        content: "❌ Error: No se pudieron validar las cuentas Nexus.",
        components: [],
      });
      return;
    }

    const MULTIPLIER = 10n ** NXT_DECIMALS;
    const amountUnits = BigInt(Math.round(amountNumber * Number(MULTIPLIER)));

    const transfer = await bridgeTransferNXT(
      senderResult.user!.principal,
      destResult.user!.principal,
      amountUnits
    );

    if (transfer.ok) {
      const destNexusName = destResult.user?.name?.[0] ? ` (${destResult.user.name[0]})` : "";
      logTransaction({
        userId: fromUserId,
        targetUserId: toUserId,
        type: "P2P_TRANSFER",
        amountNxt: amountNumber,
        blockIndex: transfer.blockIndex?.toString(),
        status: "SUCCESS",
        timestamp: Date.now()
      });

      await interaction.editReply({
        content:
          `✅ **¡Transferencia realizada con éxito!**\n\n` +
          `💸 Enviaste: **${amountNumber} NXT** a <@${toUserId}>${destNexusName}\n` +
          `📦 Bloque Minter: \`${transfer.blockIndex!.toString()}\``,
        components: [],
      });

      const recipientEmail = destResult.user!.email?.[0];
      const senderName = interaction.user.username;

      if (recipientEmail) {
        sendNotificationEmail(
          recipientEmail,
          `¡Recibiste ${amountNumber} NXT en Nexus!`,
          `
            <h2>¡Hola!</h2>
            <p>El usuario <strong>@${senderName}</strong> te ha transferido <strong>${amountNumber} NXT</strong>.</p>
            <ul>
              <li><strong>Monto:</strong> ${amountNumber} NXT</li>
              <li><strong>Remitente:</strong> @${senderName}</li>
              <li><strong>Bloque:</strong> ${transfer.blockIndex!.toString()}</li>
            </ul>
            <br>
            <p><small>Este es un correo automático de notificación de Nexus.</small></p>
          `
        ).catch((mailErr) => console.error("[Email Error]:", mailErr));
      }
    } else {
      await interaction.editReply({
        content: `❌ La transferencia falló: ${formatTransferError(transfer.error)}`,
        components: [],
      });
    }
  } catch (err) {
    console.error("[transfer] Error ejecutando transferencia:", err);
    await interaction.editReply({
      content: "❌ Ocurrió un error inesperado al procesar la transferencia.",
      components: [],
    });
  }
}

// function logTransaction(arg0: { userId: string; targetUserId: string; type: string; amountNxt: number; blockIndex: string | undefined; status: string; timestamp: number; }) {
//   throw new Error("Function not implemented.");
// }

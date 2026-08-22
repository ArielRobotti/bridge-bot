import {
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";
import { getDiscordUser, ensureNexusRole, bridgeBurnNXTFrom, bridgeMintNXT } from "../helpers.js";
import { NXT_DECIMALS, CASINO_CONVERSION_RATE, SPREAD_BPS, BPS_DIVISOR } from "../../config/constants.js";
import { formatTransferError } from "../helpers.js";

const UNBELIEVABOAT_TOKEN = process.env.UNBELIEVABOAT_TOKEN;

// ----------------------------------------------------------------------------
// Funciones Auxiliares de UnbelievaBoat y Formato
// ----------------------------------------------------------------------------
async function modifyUnbelievaBoatBalance(guildId: string, userId: string, amount: number): Promise<any> {
  if (!UNBELIEVABOAT_TOKEN) {
    throw new Error("UNBELIEVABOAT_TOKEN no está configurado en las variables de entorno.");
  }

  const url = `https://unbelievaboat.com/api/v1/guilds/${guildId}/users/${userId}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: UNBELIEVABOAT_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cash: amount }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP ${response.status} - ${errorBody}`);
  }

  return await response.json();
}

function parseToUnits(amount: number, decimals: bigint): bigint {
  const dec = Number(decimals);
  const str = amount.toFixed(dec);
  const [integerPart, fractionalPart = ""] = str.split(".");
  return BigInt(integerPart + fractionalPart);
}

function formatUnits(amount: bigint, decimals: bigint): string {
  const str = amount.toString().padStart(Number(decimals) + 1, "0");
  const integerPart = str.slice(0, -Number(decimals)) || "0";
  const decimalPart = str.slice(-Number(decimals)).replace(/0+$/, "");
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

// ----------------------------------------------------------------------------
// HANDLER: /convert (Responde con los botones de selección)
// ----------------------------------------------------------------------------
export async function handleConvertMenu(interaction: ChatInputCommandInteraction): Promise<void> {
  const nxtToPointsBtn = new ButtonBuilder()
    .setCustomId("btn_convert_nxt_to_points")
    .setLabel("NXT ➔ Puntos")
    .setEmoji("🪙")
    .setStyle(ButtonStyle.Primary);

  const pointsToNxtBtn = new ButtonBuilder()
    .setCustomId("btn_convert_points_to_nxt")
    .setLabel("Puntos ➔ NXT")
    .setEmoji("🎰")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(nxtToPointsBtn, pointsToNxtBtn);

  await interaction.reply({
    content: "🔄 **Portal de Conversión Nexus**\nElegí la dirección del intercambio para ingresar el monto:",
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

// ----------------------------------------------------------------------------
// EXECUTE: Conversión NXT ➔ Puntos de Casino (Modal Submit)
// ----------------------------------------------------------------------------
export async function executeConvertNxt(
  interaction: ModalSubmitInteraction,
  amountNumber: number
): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (!amountNumber || amountNumber <= 0) {
    await interaction.editReply("❌ El monto a convertir debe ser mayor a 0 NXT.");
    return;
  }

  try {
    const userResult = await getDiscordUser(interaction.user.id);
    if (!userResult.ok) {
      await interaction.editReply(`❌ No pude encontrar tu cuenta Nexus vinculada: ${userResult.error}`);
      return;
    }

    await ensureNexusRole(interaction.guild, interaction.user.id);
    const userPrincipal = userResult.user!.principal;

    const amountUnits = parseToUnits(amountNumber, NXT_DECIMALS);
    const decimalsFactor = 10n ** NXT_DECIMALS;

    if (amountUnits <= 0n) {
      await interaction.editReply("❌ El monto a convertir es demasiado pequeño.");
      return;
    }

    const casinoPointsBigInt = (amountUnits * CASINO_CONVERSION_RATE) / decimalsFactor;

    if (casinoPointsBigInt <= 0n) {
      await interaction.editReply("❌ El monto de NXT ingresado no alcanza para recibir al menos 1 punto de casino.");
      return;
    }

    const casinoPoints = Number(casinoPointsBigInt);
    const burnResult = await bridgeBurnNXTFrom(userPrincipal, amountUnits);

    if (!burnResult.ok) {
      await interaction.editReply(`❌ Error al procesar la conversión: ${formatTransferError(burnResult.error)}`);
      return;
    }

    try {
      if (!interaction.guildId) throw new Error("Comando no ejecutado en un servidor.");
      await modifyUnbelievaBoatBalance(interaction.guildId, interaction.user.id, casinoPoints);
    } catch (apiErr) {
      console.error("[UnbelievaBoat API Error]:", apiErr);
      await interaction.editReply(
        `⚠️ La quema de tokens fue exitosa en la red (Bloque: \`${burnResult.blockIndex?.toString() ?? "OK"}\`), ` +
        `pero ocurrió un problema al acreditar los puntos en el casino. Por favor contactá a un administrador.`
      );
      return;
    }

    const nxtBurnedReadable = formatUnits(amountUnits, NXT_DECIMALS);

    await interaction.editReply(
      `✅ **¡Conversión exitosa!**\n\n` +
      `🔥 Se quemaron: **${nxtBurnedReadable} NXT**\n` +
      `🎰 Recibiste: **${casinoPoints.toLocaleString()} puntos de casino**\n` +
      `📦 Bloque Minter: \`${burnResult.blockIndex?.toString() ?? "OK"}\``
    );
  } catch (err) {
    console.error("[convert] Error ejecutando convert-nxt:", err);
    await interaction.editReply("❌ Ocurrió un error inesperado al procesar la conversión.");
  }
}

// ----------------------------------------------------------------------------
// EXECUTE: Conversión Puntos de Casino ➔ NXT (Modal Submit)
// ----------------------------------------------------------------------------
export async function executeConvertPoints(
  interaction: ModalSubmitInteraction,
  pointsNumber: number
): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (!pointsNumber || pointsNumber < 1000) {
    await interaction.editReply("❌ La cantidad mínima a convertir es de **1.000 puntos de casino**.");
    return;
  }

  try {
    const userResult = await getDiscordUser(interaction.user.id);
    if (!userResult.ok) {
      await interaction.editReply(`❌ No pude encontrar tu cuenta Nexus vinculada: ${userResult.error}`);
      return;
    }

    await ensureNexusRole(interaction.guild, interaction.user.id);
    const userPrincipal = userResult.user!.principal;

    const pointsBigInt = BigInt(pointsNumber);
    const decimalsFactor = 10n ** NXT_DECIMALS;
    const netFactor = BPS_DIVISOR - SPREAD_BPS;

    const amountUnits = (pointsBigInt * decimalsFactor * netFactor) / (CASINO_CONVERSION_RATE * BPS_DIVISOR);

    if (amountUnits <= 0n) {
      await interaction.editReply(`❌ La cantidad de puntos es demasiado pequeña para convertir a NXT.`);
      return;
    }

    const nxtAmountReadable = formatUnits(amountUnits, NXT_DECIMALS);
    const pointsToDeduct = -Math.abs(pointsNumber);

    try {
      if (!interaction.guildId) throw new Error("Comando no ejecutado en un servidor.");
      await modifyUnbelievaBoatBalance(interaction.guildId, interaction.user.id, pointsToDeduct);
    } catch (apiErr) {
      console.error("[UnbelievaBoat API Error]:", apiErr);
      await interaction.editReply(
        `❌ No se pudo descontar los puntos de casino. Asegúrate de tener suficiente saldo disponible en UnbelievaBoat.`
      );
      return;
    }

    const mintResult = await bridgeMintNXT(userPrincipal, amountUnits);

    if (!mintResult.ok) {
      try {
        if (interaction.guildId) {
          await modifyUnbelievaBoatBalance(interaction.guildId, interaction.user.id, Math.abs(pointsNumber));
        }
      } catch (rollbackErr) {
        console.error("[Rollback Error] Falla al devolver puntos:", rollbackErr);
      }

      await interaction.editReply(
        `❌ Ocurrió un error al mintear tus NXT en la red. Tus puntos fueron devueltos a tu cuenta de casino. Detalle: ${formatTransferError(mintResult.error)}`
      );
      return;
    }

    await interaction.editReply(
      `✅ **¡Conversión exitosa!**\n\n` +
      `🎰 Se descontaron: **${pointsNumber.toLocaleString()} puntos de casino**\n` +
      `🪙 Recibiste: **${nxtAmountReadable} NXT** en [Nexus Wallet](<https://nexuscoliseum.com/wallet>)\n` +
      `📦 Bloque Minter: \`${mintResult.blockIndex?.toString() ?? "OK"}\``
    );
  } catch (err) {
    console.error("[convert] Error ejecutando convert-points:", err);
    await interaction.editReply("❌ Ocurrió un error inesperado al procesar la conversión a NXT.");
  }
}
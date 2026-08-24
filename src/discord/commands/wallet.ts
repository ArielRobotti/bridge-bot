import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";
import { getDiscordUser, ensureNexusRole } from "../helpers.js";
import { getNxtBalance } from "../../nexus/ledger.js"; 
import { NXT_DECIMALS } from "../../config/constants.js";

const UNBELIEVABOAT_TOKEN = process.env.UNBELIEVABOAT_TOKEN;

// Auxiliar para consultar puntos de UnbelievaBoat
async function getCasinoPoints(guildId: string, userId: string): Promise<number> {
  if (!UNBELIEVABOAT_TOKEN) return 0;
  try {
    const url = `https://unbelievaboat.com/api/v1/guilds/${guildId}/users/${userId}`;
    const res = await fetch(url, {
      headers: { Authorization: UNBELIEVABOAT_TOKEN },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.cash ?? 0;
  } catch (err) {
    console.error("[wallet] Error obteniendo saldo de UnbelievaBoat:", err);
    return 0;
  }
}

// Generador central del Embed + Botones
export async function buildWalletView(guildId: string, userId: string, username: string) {
  const userResult = await getDiscordUser(userId);

  if (!userResult.ok) {
    const embedUnlinked = new EmbedBuilder()
      .setColor(0xff9900)
      .setTitle("🔗 Billetera Nexus no vinculada")
      .setDescription(
        `¡Hola **@${username}**! Aún no tenés una cuenta de Nexus asociada a tu usuario de Discord.\n\n` +
        `Para gestionar tokens **$NXT**, realizar transferencias y convertir puntos del casino, vinculá tu cuenta.`
      )
      .setTimestamp();

    const linkBtn = new ButtonBuilder()
      .setLabel("Vincular Cuenta en Nexus")
      .setStyle(ButtonStyle.Link)
      .setURL("https://nexuscoliseum.com/wallet");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(linkBtn);
    return { embeds: [embedUnlinked], components: [row] };
  }

  const userPrincipal = userResult.user!.principal;
  const nexusName = userResult.user?.name?.[0] ? `**${userResult.user.name[0]}**` : "*Sin nombre configurado*";

  // Consultas en paralelo (ICP Ledger + UnbelievaBoat)
  const [nxtBalanceUnits, casinoPoints] = await Promise.all([
    getNxtBalance(userPrincipal).catch(() => 0n),
    getCasinoPoints(guildId, userId),
  ]);

  const nxtBalance = Number(nxtBalanceUnits) / Number(10n ** NXT_DECIMALS);

  const embedWallet = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("💳 Nexus Coliseum — Multi-Chain Wallet")
    .setDescription(`Bienvenido a tu centro financiero, **@${username}**`)
    .addFields(
      {
        name: "👤 Cuenta de Nexus",
        value: `• **Usuario:** ${nexusName}\n• **Id:** ${userPrincipal.toString().slice(0, 24)} ...`,
        inline: false,
      },
      {
        name: "🪙 Saldos On-Chain ",
        value: `**${nxtBalance.toLocaleString()} NXT**`,
        inline: true,
      },
      {
        name: "🎰 Saldos Off-Chain (Casino Discord)",
        value: `**${casinoPoints.toLocaleString()} Puntos**`,
        inline: true,
      }
    )
    .setFooter({ text: "Nexus Bridge Protocol • Sincronización en tiempo real" })
    .setTimestamp();

  // Botones de acción rápida
  const convertBtn = new ButtonBuilder()
    .setCustomId("wallet_action_convert")
    .setLabel("Convertir")
    .setEmoji("🔄")
    .setStyle(ButtonStyle.Primary);

  const transferBtn = new ButtonBuilder()
    .setCustomId("wallet_action_transfer")
    .setLabel("Transferir NXT")
    .setEmoji("💸")
    .setStyle(ButtonStyle.Success);

  const refreshBtn = new ButtonBuilder()
    .setCustomId("wallet_action_refresh")
    .setLabel("Actualizar")
    .setEmoji("⚡")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(convertBtn, transferBtn, refreshBtn);

  return { embeds: [embedWallet], components: [row] };
}

// HANDLER: /wallet
export async function handleWallet(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (!interaction.guildId) {
    await interaction.editReply("❌ Este comando solo puede ejecutarse dentro de un servidor.");
    return;
  }

  try {
    await ensureNexusRole(interaction.guild, interaction.user.id);
    const walletView = await buildWalletView(interaction.guildId, interaction.user.id, interaction.user.username);
    await interaction.editReply(walletView);
  } catch (err) {
    console.error("[wallet] Error cargando la billetera:", err);
    await interaction.editReply("❌ Ocurrió un error al cargar los datos de tu billetera.");
  }
}

// HANDLER: Botón "Actualizar"
export async function handleWalletRefresh(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate();

  if (!interaction.guildId) return;

  try {
    const walletView = await buildWalletView(interaction.guildId, interaction.user.id, interaction.user.username);
    await interaction.editReply(walletView);
  } catch (err) {
    console.error("[wallet] Error refrescando la billetera:", err);
  }
}
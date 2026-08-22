import { Principal } from "@icp-sdk/core/principal";
import { Guild } from "discord.js";
export { getDiscordUser, bridgeTransferNXT, bridgeBurnNXTFrom, bridgeMintNXT } from "../nexus/client.js";
import { NXT_DECIMALS } from "../config/constants.js"


const NEXUS_ROLE_ID: string = process.env.NEXUS_ROLE_ID || "";


export interface NexusUser {
  principal: Principal;
  name?: [string];
  email?: [string];
}


export async function ensureNexusRole(guild: Guild | null, userId: string): Promise<void> {
  try {
    if (!guild || !NEXUS_ROLE_ID) return;
    const member = await guild.members.fetch(userId).catch(() => null);
    if (member && !member.roles.cache.has(NEXUS_ROLE_ID)) {
      await member.roles.add(NEXUS_ROLE_ID);
      console.log(`[roles] Rol Nexus asignado exitosamente a @${member.user.username}`);
    }
  } catch (err: any) {
    console.error(`[roles] Error intentando asignar rol a ${userId}:`, err.message);
  }
};

export function formatAmount(rawBalance: bigint | number | string): string {
  return (Number(rawBalance) / 10 ** Number(NXT_DECIMALS)).toFixed(Number(NXT_DECIMALS));
}

export function formatTransferError(error: any): string {
  if ("InsufficientFunds" in error) {
    return `Fondos insuficientes. Balance disponible: ${formatAmount(error.InsufficientFunds.balance)} NXT`;
  }
  if ("BadFee" in error) {
    return `Fee incorrecto. Fee esperado: ${formatAmount(error.BadFee.expected_fee)} NXT`;
  }
  if ("BadBurn" in error) {
    return `Monto mínimo de quema no alcanzado: ${formatAmount(error.BadBurn.min_burn_amount)} NXT`;
  }
  if ("Duplicate" in error) {
    return `Transferencia duplicada (bloque ${error.Duplicate.duplicate_of.toString()})`;
  }
  if ("TooOld" in error) return "La transacción quedó vieja antes de procesarse.";
  if ("CreatedInFuture" in error) return "Error de sincronización de horario con el ledger.";
  if ("TemporarilyUnavailable" in error) return "El ledger está temporalmente no disponible.";
  if ("GenericError" in error) {
    return `Error del ledger: ${error.GenericError.message} (código ${error.GenericError.error_code.toString()})`;
  }
  return "Error desconocido del ledger.";
}
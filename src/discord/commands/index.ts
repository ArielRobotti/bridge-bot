import {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

// Modulos individuales de comandos
import { handleTransfer, handleTransferConfirm } from "./transfer.js";
import { handleConvertMenu, executeConvertNxt, executeConvertPoints } from "./convert.js";
import { handleBalance } from "./balance.js";
import { handleGetAccount } from "./account.js";
import { handleRenameChannel } from "./rename_channel.js";
import { handleTopPosters } from "./top-posters.js";
import { handleCommands } from "./help.js";
import { handleWallet, handleWalletRefresh } from "./wallet.js";
import { handleHistory } from "./historial.js";
import { handleExportTransactions } from "./exportTransactions.js";

export type SlashCommandBuilderResult = 
  | SlashCommandBuilder 
  | SlashCommandOptionsOnlyBuilder 
  | SlashCommandSubcommandsOnlyBuilder;

export type CommandHandler = (interaction: ChatInputCommandInteraction) => Promise<void>;

export interface CommandDefinition {
  name: string;
  description: string;
  handler: CommandHandler;
  builderOptions?: (builder: SlashCommandBuilder) => SlashCommandBuilderResult;
}

// Registry Global
export const commandDefinitions: CommandDefinition[] = [
  {
    name: "account",
    description: "Muestra tu cuenta de Nexus.",
    handler: handleGetAccount,
  },
  {
    name: "balance",
    description: "Muestra tu saldo disponible de NXT.",
    handler: handleBalance,
  },
  {
    name: "transfer",
    description: "Transfiere tokens NXT a otro usuario.",
    handler: handleTransfer,
    builderOptions: (builder) =>
      builder
        .addNumberOption((opt) =>
          opt.setName("monto").setDescription("Monto de NXT a enviar").setRequired(true)
        )
        .addUserOption((opt) =>
          opt.setName("usuario").setDescription("Usuario receptor").setRequired(true)
        ),
  },
  {
    name: "convert",
    description: "Abre el menú interactivo para intercambiar NXT y Puntos de Casino.",
    handler: handleConvertMenu,
  },
  {
    name: "commands",
    description: "Muestra la lista con todos los comandos disponibles.",
    handler: handleCommands,
  },
  {
    name: "rename-channel",
    description: "Prueba de permisos: Renombra el canal actual (público).",
    handler: handleRenameChannel,
    builderOptions: (builder) =>
      builder.addStringOption((opt) =>
        opt.setName("nombre").setDescription("Nuevo nombre para el canal").setRequired(true)
      ),
  },
  {
    name: "top-posters",
    description: "Muestra el Top 5 de usuarios con más mensajes en un periodo de días.",
    handler: handleTopPosters,
    builderOptions: (builder) =>
      builder.addIntegerOption((opt) =>
        opt
          .setName("dias")
          .setDescription("Antigüedad máxima en días (por defecto: 7)")
          .setRequired(false)
          .setMinValue(1)
      ),
  },
  {
    name: "wallet",
    description: "Abre tu billetera interactiva con saldos de NXT y Puntos de Casino.",
    handler: handleWallet,
  },
  {
    name: "historial",
    description: "Tu historial de transacciones",
    handler: handleHistory,
  },
  {
    name: "export-transactions",
    description: "Exporta todo el registro de transacciones en formato CSV (Solo SuperAdmin).",
    handler: handleExportTransactions,
  },
];

// Mapeos para Discord REST API y Router
export const slashHandlers = new Map<string, CommandHandler>(
  commandDefinitions.map((cmd) => [cmd.name, cmd.handler])
);

export const slashCommandsData = commandDefinitions.map((def) => {
  const builder = new SlashCommandBuilder()
    .setName(def.name)
    .setDescription(def.description);

  if (def.builderOptions) {
    return def.builderOptions(builder);
  }

  return builder;
});

// Re-exportamos handlers para eventos (Botones/Modales)
export {
  handleTransferConfirm,
  executeConvertNxt,
  executeConvertPoints,
  handleWalletRefresh,
  handleExportTransactions
};
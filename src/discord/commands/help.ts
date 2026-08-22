import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { commandDefinitions } from "./index.js";

export async function handleCommands(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const colWidthCmd = 14;
  const colWidthDesc = 45;

  let table: string[] = [];
  table.push("```");
  table.push("┌" + "─".repeat(colWidthCmd + 2) + "┬" + "─".repeat(colWidthDesc + 2) + "┐");
  table.push(
    `│ ${"Comando".padEnd(colWidthCmd)} │ ${"Descripción".padEnd(colWidthDesc)} │`
  );
  table.push("├" + "─".repeat(colWidthCmd + 2) + "┼" + "─".repeat(colWidthDesc + 2) + "┤");

  for (const cmd of commandDefinitions) {
    const name = `/${cmd.name}`.padEnd(colWidthCmd);
    const desc = cmd.description.slice(0, colWidthDesc).padEnd(colWidthDesc);
    table.push(`│ ${name} │ ${desc} │`);
  }

  table.push("└" + "─".repeat(colWidthCmd + 2) + "┴" + "─".repeat(colWidthDesc + 2) + "┘");
  table.push("```");

  await interaction.editReply(table.join("\n"));
}
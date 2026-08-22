import {
  ChatInputCommandInteraction,
  MessageFlags,
  ChannelType,
  TextChannel,
} from "discord.js";

export async function handleTopPosters(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const daysOption = interaction.options.getInteger("dias") ?? 7;
  const cutoffTimestamp = Date.now() - daysOption * 24 * 60 * 60 * 1000;

  try {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply("❌ Este comando solo puede ejecutarse dentro de un servidor.");
      return;
    }

    const userMessageCounts = new Map<string, { username: string; count: number }>();
    const channels = await guild.channels.fetch();
    const publicTextChannels = channels.filter(
      (ch): ch is TextChannel => ch !== null && ch.type === ChannelType.GuildText
    );

    for (const [_, channel] of publicTextChannels) {
      const me = await guild.members.fetchMe();
      const permissions = channel.permissionsFor(me);
      if (!permissions || !permissions.has("ViewChannel") || !permissions.has("ReadMessageHistory")) {
        continue;
      }

      let lastId: string | undefined = undefined;
      let stopChannelFetch = false;

      while (!stopChannelFetch) {
        const options: { limit: number; before?: string } = { limit: 100 };
        if (lastId) options.before = lastId;

        const messages = await channel.messages.fetch(options).catch(() => null);
        if (!messages || messages.size === 0) break;

        for (const msg of messages.values()) {
          if (msg.createdTimestamp < cutoffTimestamp) {
            stopChannelFetch = true;
            break;
          }

          if (msg.author.bot) continue;

          const words = msg.content.trim().split(/\s+/).filter((w) => w.length > 0);

          if (words.length >= 4) {
            const current = userMessageCounts.get(msg.author.id) || {
              username: msg.author.username,
              count: 0,
            };
            current.count += 1;
            userMessageCounts.set(msg.author.id, current);
          }
        }

        lastId = messages.last()?.id;
        if (messages.size < 100) break;
      }
    }

    const top5 = Array.from(userMessageCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    if (top5.length === 0) {
      await interaction.editReply(
        `No se encontraron mensajes de al menos 4 palabras en los últimos ${daysOption} día(s).`
      );
      return;
    }

    const lines = [
      "```",
      `=== TOP 5 USUARIOS MÁS ACTIVOS (ÚLTIMOS ${daysOption} DÍAS, ≥ 4 PALABRAS) ===`,
      "",
    ];

    top5.forEach((item, index) => {
      const position = `#${index + 1}`.padEnd(4);
      const name = `@${item.username}`.padEnd(20);
      lines.push(`${position} ${name} : ${item.count} mensajes`);
    });

    lines.push("```");

    await interaction.editReply(lines.join("\n"));
  } catch (err) {
    console.error("[top-posters] ERROR:", err);
    await interaction.editReply("❌ Ocurrió un error al analizar los mensajes del servidor.");
  }
}
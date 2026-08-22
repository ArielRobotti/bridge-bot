import {
  Client,
  Interaction,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} from "discord.js";
import { slashHandlers} from "./commands/index.js";
import { handleTransferConfirm, executeConvertNxt, executeConvertPoints  } from "./commands/index.js"; 

export function registerEvents(client: Client): void {
  // Evento al conectar exitosamente
  client.once("ready", () => {
    console.log(`[discord] Conectado exitosamente como ${client.user?.tag}`);
  });

  // Listener ÚNICO para Interacciones
  client.on("interactionCreate", async (interaction: Interaction) => {
    
    // ------------------------------------------------------------------------
    // 1. Slash Commands
    // ------------------------------------------------------------------------
    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;
      const handler = slashHandlers.get(commandName);

      if (!handler) {
        console.warn(`[discord] Se recibió un comando no registrado: /${commandName}`);
        return;
      }

      console.log(
        `[discord] 📩 Comando /${commandName} ejecutado por @${interaction.user.username} ` +
        `en Guild: ${interaction.guild?.name ?? "DM"}`
      );

      try {
        await handler(interaction);
      } catch (err) {
        console.error(`[discord] Error ejecutando /${commandName}:`, err);

        const errorMsg = "❌ Ocurrió un error inesperado al procesar el comando.";
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: errorMsg }).catch(() => {});
        } else {
          await interaction.reply({ content: errorMsg, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
      }
      return;
    }

    // ------------------------------------------------------------------------
    // 2. Select Menus (Desplegables)
    // ------------------------------------------------------------------------
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "select_convert_direction") {
        const selectedValue = interaction.values[0];

        if (selectedValue === "direction_nxt_to_points") {
          const modal = new ModalBuilder()
            .setCustomId("modal_convert_nxt")
            .setTitle("NXT ➔ Puntos de Casino");

          const input = new TextInputBuilder()
            .setCustomId("input_nxt_amount")
            .setLabel("Monto en NXT a convertir")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ej: 10.5")
            .setRequired(true);

          const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
          modal.addComponents(row);

          await interaction.showModal(modal);
        } else if (selectedValue === "direction_points_to_nxt") {
          const modal = new ModalBuilder()
            .setCustomId("modal_convert_points")
            .setTitle("Puntos de Casino ➔ NXT");

          const input = new TextInputBuilder()
            .setCustomId("input_points_amount")
            .setLabel("Puntos de Casino a convertir")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Mínimo 1000 puntos")
            .setRequired(true);

          const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
          modal.addComponents(row);

          await interaction.showModal(modal);
        }
      }
      return;
    }


    // 2. Clics en Botones (Muestra el Modal directamente)
    if (interaction.isButton()) {

      if (interaction.customId.startsWith("confirm_tx_")) {
        await handleTransferConfirm(interaction);
      } else if (interaction.customId === "cancel_tx") {
        await interaction.update({
          content: "❌ Transferencia cancelada por el usuario.",
          components: [],
        });
      }
      
      if (interaction.customId === "btn_convert_nxt_to_points") {
        const modal = new ModalBuilder()
          .setCustomId("modal_convert_nxt")
          .setTitle("NXT ➔ Puntos de Casino");

        const input = new TextInputBuilder()
          .setCustomId("input_nxt_amount")
          .setLabel("Monto en NXT a convertir")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Ej: 10.5")
          .setRequired(true);

        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
      } else if (interaction.customId === "btn_convert_points_to_nxt") {
        const modal = new ModalBuilder()
          .setCustomId("modal_convert_points")
          .setTitle("Puntos de Casino ➔ NXT");

        const input = new TextInputBuilder()
          .setCustomId("input_points_amount")
          .setLabel("Puntos de Casino a convertir")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Mínimo 1000 puntos")
          .setRequired(true);

        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
      }
      return;
    }

    // ------------------------------------------------------------------------
    // 3. Modales (Formularios desplegados)
    // ------------------------------------------------------------------------
    
    if (interaction.isModalSubmit()) {
      try {
        if (interaction.customId === "modal_convert_nxt") {
          const rawAmount = interaction.fields.getTextInputValue("input_nxt_amount");
          const amount = parseFloat(rawAmount.replace(",", "."));

          if (isNaN(amount) || amount <= 0) {
            await interaction.reply({
              content: "❌ Por favor ingresá un número válido mayor a 0.",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          await executeConvertNxt(interaction, amount);

        } else if (interaction.customId === "modal_convert_points") {
          const rawPoints = interaction.fields.getTextInputValue("input_points_amount");
          const points = parseInt(rawPoints, 10);

          // AHORA SÍ: Validación de los 1.000 puntos sobre los campos del Modal
          if (isNaN(points) || points < 1000) {
            await interaction.reply({
              content: "❌ La cantidad mínima para convertir es de **1.000 puntos de casino**.",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          await executeConvertPoints(interaction, points);
        }
      } catch (err) {
        console.error(`[discord] Error procesando modal ${interaction.customId}:`, err);
        const errorMsg = "❌ Ocurrió un error inesperado al procesar el formulario.";
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: errorMsg }).catch(() => {});
        } else {
          await interaction.reply({ content: errorMsg, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
      }
    }
    
  });
}
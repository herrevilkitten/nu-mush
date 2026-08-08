import {
  SlashCommandBuilder,
  Interaction,
  MessageFlags,
  InteractionContextType,
} from "discord.js";
import { SlashCommandDefinition } from "./types";

import { World } from "../../world";
import { getClientURI } from "../../models/client";
import { DiscordConnection } from "../../clients/discord";

export const REGISTER_USER_COMMAND: SlashCommandDefinition = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register a new user")
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM]),
  async execute(interaction: Interaction, world: World) {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const clientId = getClientURI("discord", interaction.user.id);

    // Check if the user is already registered
    const existingEntity = world.database.getEntityByClient(clientId);
    if (existingEntity) {
      return {
        content: "You are already registered.",
        flags: MessageFlags.Ephemeral,
      };
    }

    const startingRoom = world.getStartRoom();
    if (!startingRoom) {
      return {
        content: "Starting room is not configured.",
        flags: MessageFlags.Ephemeral,
      };
    }

    const registeredEntity = world.createEntity(interaction.user.tag);
    registeredEntity.clientUri = clientId;
    registeredEntity.moveTo(startingRoom);
    const connection = new DiscordConnection(
      registeredEntity,
      interaction.user,
      interaction.client,
    );
    world.connections.set(connection.entity, connection);
    return {
      content: "You are now registered on this server.",
      flags: MessageFlags.Ephemeral,
    };
  },
};

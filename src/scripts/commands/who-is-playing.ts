import { SlashCommandBuilder, Interaction, MessageFlags } from "discord.js";
import { SlashCommandDefinition } from "./types";
import { World } from "../../world";

export const WHO_IS_PLAYING_COMMAND: SlashCommandDefinition = {
  data: new SlashCommandBuilder()
    .setName("who-is-playing")
    .setDescription("Lists all currently playing users"),
  async execute(interaction: Interaction, world: World) {
    // Your command execution logic here
    return {
      content: `
* Registered users: ${world.getRegisteredUsers().length}
* Currently playing users: ${world.getPlayingUsers().length}
      `.trim(),
      flags: MessageFlags.Ephemeral,
    };
  },
};

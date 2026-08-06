import {
  SlashCommandBuilder,
  Interaction,
  MessagePayload,
  InteractionReplyOptions,
} from "discord.js";

export interface SlashCommandDefinition {
  data: SlashCommandBuilder;
  execute: (
    interaction: Interaction,
    world: any,
  ) => Promise<
    void | undefined | string | MessagePayload | InteractionReplyOptions
  >;
}

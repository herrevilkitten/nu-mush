import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  Collection,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { CONFIG } from "../config";
import { World } from "../world";
import { getClientURI } from "../models/client";
import { Connection } from "../connection";
import { Entity } from "../models/entity";
import { WHO_IS_PLAYING_COMMAND } from "../scripts/commands/who-is-playing";
import { REGISTER_USER_COMMAND } from "../scripts/commands/register-user";

export function startClient(world: World) {
  console.log("Starting discord client");

  const discordClient = new Client({
    intents: [
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel, Partials.Message],
  });

  discordClient.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    console.log(readyClient.application.id, readyClient.application.bot?.id);

    console.log("Registering Discord slash command handlers");
    const commands = [REGISTER_USER_COMMAND, WHO_IS_PLAYING_COMMAND];
    const commandMap = new Map<
      string,
      { data: SlashCommandBuilder; execute: Function }
    >(commands.map((command) => [command.data.name, command]));
    discordClient.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) {
        return;
      }

      console.log(
        `Received slash command ${interaction.commandName} from ${interaction.user.id}`,
      );

      const clientId = getClientURI("discord", interaction.user.id);

      const command = commandMap.get(interaction.commandName);
      if (!command) {
        interaction.reply({
          content: `Unknown command: ${interaction.commandName}`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      try {
        const reply = await command.execute(interaction, world);
        if (reply) {
          await interaction.reply(reply);
        }
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    });

    console.log("Registering Discord message listener");
    discordClient.on(Events.MessageCreate, (message) => {
      if (message.author.id === readyClient.application.id) {
        return;
      }
      console.log(
        `Received message from ${message.author.id}: ${message.content}`,
      );

      const clientId = getClientURI("discord", message.author.id);
      const entity = world.database.getEntityByClient(clientId);

      if (!entity) {
        message.author.send(
          `You are not registered on this server. Please use the **/register** command to register.`,
        );
        return;
      }
      let connection = world.connections.get(entity);
      if (!connection) {
        // The player is registered, but not playing, so we need to create a new connection for them
        connection = new DiscordConnection(
          entity,
          message.author,
          discordClient,
        );
        world.connections.set(entity, connection);
        connection.send("You are now connected to the server. Welcome!");
      }
      connection?.input.add(message.content);
    });
  });

  discordClient.login(CONFIG.clients.discord.token);
}

interface DiscordUser {
  tag: string;
  id: string;
}

export class DiscordConnection extends Connection {
  constructor(
    public entity: Entity,
    public user: DiscordUser,
    public client: Client,
  ) {
    super(entity);
  }

  send(text: string) {
    console.log(`Sending ${text}`);
    const user = this.client.users.cache.get(this.user.id);
    console.log({ user });
    user?.send(text);
  }
}

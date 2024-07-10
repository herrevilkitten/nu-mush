import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import { CONFIG } from "../config";
import { World } from "../world";
import { getClientURI } from "../models/client";
import { Connection } from "../connection";
import { Entity } from "../models/entity";

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
    discordClient.on(Events.MessageCreate, (message) => {
      if (message.author.id === readyClient.application.id) {
        return;
      }
      console.log(
        `Received message from ${message.author.id}: ${message.content}`
      );

      const clientId = getClientURI("discord", message.author.id);
      const entity = world.database.getEntityByClient(clientId);

      if (message.content === "@REGISTER") {
        if (entity) {
          message.author.send(`You are already registered on this server.`);
        } else {
          const registeredEntity = world.createEntity(message.author.tag);
          registeredEntity.client = clientId;
          message.author.send(`You are now registered on this server`);
          const connection = new DiscordConnection(
            registeredEntity,
            { tag: message.author.tag, id: message.author.id },
            discordClient
          );
          world.connections.set(connection.entity, connection);
        }
        return;
      }
      if (!entity) {
        message.author.send(
          `You are not registered on this server. Please use the @REGISTER command to start.`
        );
        return;
      }
      const connection = world.connections.get(entity);
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
    public client: Client
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

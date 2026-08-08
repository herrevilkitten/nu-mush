import { config } from "dotenv";

config();

export interface Config {
  clients: {
    discord: {
      token: string;
      applicationId?: string;
      guildId?: string;
    };
  };
  server: {
    ticksPerSecond: number;
  };
  world: {
    startingRoom: number;
    // The global registry acts as a container for commands and functions that are available to all entities in the game world. It is a special entity that is always present and cannot be destroyed or removed.
    globalRegistry?: number;
  };
}

export const CONFIG: Config = {
  clients: {
    discord: {
      token: process.env.DISCORD_TOKEN ?? "",
      applicationId: process.env.DISCORD_APPLICATION_ID,
      guildId: process.env.DISCORD_GUILD_ID,
    },
  },
  server: {
    ticksPerSecond: 10,
  },
  world: {
    startingRoom: 1,
    globalRegistry: 2,
  },
};

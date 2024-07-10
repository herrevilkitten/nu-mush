import { config } from "dotenv";

config();

export interface Config {
  clients: {
    discord: {
      token: string;
    };
  };
  server: {
    ticksPerSecond: number;
  };
  world: {
    startingRoom: number;
  };
}

export const CONFIG: Config = {
  clients: {
    discord: {
      token: process.env.DISCORD_TOKEN ?? "",
    },
  },
  server: {
    ticksPerSecond: 10,
  },
  world: {
    startingRoom: 1,
  },
};

import { World } from "./world";
import { Config } from "./config";
import { EventEmitter } from "events";
import { Entity } from "./models/entity";

export class GameEngine extends EventEmitter {
  private world: World;
  private config: Config;

  constructor(config: Config) {
    super();
    this.config = config;

    this.world = new World(this.config);
  }

  gameLoop() {}

  start() {}

  stop() {}

  hasClientEntity(clientUri: string): boolean {
    return false;
  }

  getClientEntity(clientUri: string): Entity | undefined {
    return undefined;
  }

  createClientEntity(clientUri: string): void {}

}

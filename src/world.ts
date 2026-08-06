import { CONFIG } from "./config";
import { Connection } from "./connection";
import { MemoryDatabase } from "./database/memory";
import { Entity } from "./models/entity";
import { VirtualMachine } from "./virtual-machine";

export interface FindEntityOptions {
  readonly me?: boolean;
  readonly dbref?: boolean;
  readonly contents?: boolean;
  readonly location?: boolean;
}

export class World {
  database = new MemoryDatabase();

  connections = new Map<Entity, Connection>();

  virtualMachine = new VirtualMachine(this);

  getStartRoom() {
    return this.database.getEntityById(CONFIG.world.startingRoom);
  }

  createEntity(name: string) {
    const id = this.database.getNextDbref();
    const entity = new Entity(id, name);

    this.database.addEntity(entity);
    return entity;
  }

  getRegisteredUsers() {
    return Array.from(this.database.entities.values()).filter(
      (entity) => entity.clientUri !== undefined,
    );
  }

  getPlayingUsers() {
    return Array.from(this.connections.keys());
  }

  findEntity(
    actor: Entity,
    name: string,
    options: FindEntityOptions = {},
  ): Entity | undefined {
    const match = /^#(\d+)$/.exec(name);
    if (options.dbref && match) {
      const id = parseInt(match[1], 10);
      return this.database.getEntityById(id);
    }

    if (options.me && name.toLowerCase() === "me") {
      return actor;
    }

    if (options.location && actor.location) {
      const location = actor.location;
      return Array.from(location.contents).find(
        (entity) => entity.name.toLowerCase() === name.toLowerCase(),
      );
    }

    if (options.contents) {
      return Array.from(actor.contents).find(
        (entity) => entity.name.toLowerCase() === name.toLowerCase(),
      );
    }

    return undefined;
  }
}

import { CONFIG } from "./config";
import { Connection } from "./connection";
import { MemoryDatabase } from "./database/memory";
import { Entity } from "./models/entity";
import { VirtualMachine } from "./virtual-machine";
import { matchDbRef } from "./models/dbref";

export interface FindEntityOptions {
  readonly me?: boolean;
  readonly here?: boolean;
  readonly dbref?: boolean;
  readonly contents?: boolean;
  readonly location?: boolean;
}

export class World {
  readonly database = new MemoryDatabase();
  readonly connections = new Map<Entity, Connection>();
  readonly virtualMachine = new VirtualMachine(this);

  getStartRoom() {
    return this.database.getEntityById(CONFIG.world.startingRoom);
  }

  getGlobalRegistry() {
    if (!CONFIG.world.globalRegistry) {
      return undefined;
    }
    return this.database.getEntityById(CONFIG.world.globalRegistry);
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
    const dbref = matchDbRef(name);
    if (options.dbref && dbref !== undefined) {
      return this.database.getEntityById(dbref);
    }

    const lowercaseName = name.toLowerCase();

    if (options.me && lowercaseName === "me") {
      return actor;
    }

    if (options.here && actor.location && lowercaseName === "here") {
      return actor.location;
    }

    if (options.location && actor.location) {
      const location = actor.location;
      return Array.from(location.contents).find(
        (entity) => entity.name.toLowerCase() === lowercaseName,
      );
    }

    if (options.contents) {
      return Array.from(actor.contents).find(
        (entity) => entity.name.toLowerCase() === lowercaseName,
      );
    }

    return undefined;
  }
}

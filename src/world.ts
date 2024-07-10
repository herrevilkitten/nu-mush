import { CONFIG } from "./config";
import { Connection } from "./connection";
import { MemoryDatabase } from "./database/memory";
import { Entity } from "./models/entity";
import { VirtualMachine } from "./virtual-machine";

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
}

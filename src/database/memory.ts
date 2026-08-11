import { dbref } from "../models/dbref";
import { Entity } from "../models/entity";

export class MemoryDatabase {
  isInitialized = false;

  entities = new Map<number, Entity>();

  addEntity(entity: Entity) {
    if (this.entities.has(entity.id)) {
      throw new Error(`dbref #${entity.id} already exists.`);
    }
    this.entities.set(entity.id, entity);
  }

  removeEntity(entity: Entity) {
    // Remove the Entity from its location
    const oldLocation = entity.moveFrom();
    // Move all of its contents to its old location
    if (oldLocation) {
      for (const content of entity.contents) {
        content.moveTo(oldLocation);
      }
    } else {
      // If the entity had no location, then its contents will not either
      for (const content of entity.contents) {
        content.moveFrom();
      }
    }

    // TODO: Update the parent/child hierarchy
    this.entities.delete(entity.id);
  }

  getNextDbref(): dbref {
    let nextAvailable = 0;

    while (true) {
      let ref = nextAvailable as dbref;
      if (!this.entities.has(ref)) {
        return ref;
      }
      nextAvailable++;
    }
    return -1 as dbref;
  }

  getEntityByClient(client: string) {
    return [...this.entities.values()].find((entity) =>
      entity.isSameClient(client),
    );
  }

  getEntityById(id: number) {
    return this.entities.get(id);
  }
}

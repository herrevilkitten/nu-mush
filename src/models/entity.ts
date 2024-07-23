import { NOTHING, dbref } from "./dbref";
import { Attribute, AttributeValueTypes } from "./attribute";

export class Entity {
  parent?: Entity = undefined;
  location?: Entity = undefined;
  owner: Entity = this;
  client?: string;

  readonly contents = new Set<Entity>();

  readonly attributes = new Map<string, Attribute>();

  constructor(public id: dbref, public name: string) {}

  isPlayer() {
    return !!this.client;
  }

  isSameClient(client: string) {
    return this.client === client;
  }

  setAttribute(name: string, value: AttributeValueTypes) {
    this.attributes.set(name, new Attribute(name, value, this));
  }

  deleteAttribute(name: string) {
    this.attributes.delete(name);
  }

  addContent(entity: Entity) {
    if (entity.location) {
      throw new Error(
        `dbref #${entity.id} already exists in #${entity.location}`
      );
    }
    entity.location = this;
    this.contents.add(entity);
  }

  removeContent(entity: Entity) {
    entity.location = undefined;
    this.contents.delete(entity);
  }

  moveFrom() {
    this.location?.removeContent(this);
  }

  moveTo(destination: Entity) {
    if (this.canMoveTo(destination)) {
      destination.addContent(this);
    }
  }

  canMoveTo(destination: Entity) {
    return true;
  }

  containers(): Entity[] {
    const containers = new Set<Entity>();

    let location = this.location;
    while (location) {
      if (containers.has(location)) {
        console.error(`Cycle found in locationss for #${this.id}`);
        break;
      }
      containers.add(location);
      location = location.location;
    }

    return [...containers.values()];
  }

  isContainerOf(entity: Entity) {
    return entity.containers().includes(this);
  }

  ancestors(): Entity[] {
    const ancestors = new Set<Entity>();

    let parent = this.parent;
    while (parent) {
      if (ancestors.has(parent)) {
        console.error(`Cycle found in ancestors for #${this.id}`);
        break;
      }
      ancestors.add(parent);
      parent = parent.parent;
    }

    return [...ancestors.values()];
  }

  isAncestorOf(entity: Entity) {
    return entity.ancestors().includes(this);
  }

  toString() {
    return `${this.name} (#${this.id})`;
  }
}

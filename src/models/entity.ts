import { NOTHING, dbref } from "./dbref";
import {
  Attribute,
  AttributeValueTypes,
  isCommandAttribute,
} from "./attribute";
import { compileAttribute } from "../virtual-machine";

export class Entity {
  parent?: Entity = undefined;
  location?: Entity = undefined;
  owner: Entity = this;
  clientUri?: string;

  readonly contents = new Set<Entity>();

  readonly attributes = new Map<string, Attribute>();

  constructor(
    public id: dbref,
    public name: string,
  ) {}

  isPlayer() {
    return !!this.clientUri;
  }

  isSameClient(clientUri: string) {
    return this.clientUri === clientUri;
  }

  setAttribute(name: string, value: AttributeValueTypes) {
    const attribute = new Attribute(name, value, this);
    this.attributes.set(name, attribute);
    if (isCommandAttribute(attribute)) {
      compileAttribute(attribute);
    }
  }

  deleteAttribute(name: string) {
    this.attributes.delete(name);
  }

  listCommandAttributes() {
    return Array.from(this.attributes.values()).filter((attr) =>
      isCommandAttribute(attr),
    );
  }

  matchCommandAttribute(input: string) {
    const commandAttributes = this.listCommandAttributes();
    for (const attr of commandAttributes) {
      const matchPattern = attr.matchPattern;
      if (!matchPattern) {
        continue;
      }
      const match = input.match(matchPattern);
      if (match) {
        return { attr, parameters: match.slice(1) };
      }
    }
    return undefined;
  }

  addContent(entity: Entity) {
    if (entity.location) {
      throw new Error(
        `dbref #${entity.id} already exists in #${entity.location}`,
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
    const oldLocation = this.location;
    this.location?.removeContent(this);
    return oldLocation;
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

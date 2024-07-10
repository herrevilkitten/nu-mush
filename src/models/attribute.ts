import { dbref } from "./dbref";
import { Entity } from "./entity";

export type AttributeValueTypes = string | number | boolean | Function;

export class Attribute {
  constructor(
    public name: string,
    public value: AttributeValueTypes,
    public owner: Entity
  ) {}
}

import { dbref } from "./dbref";
import { Entity } from "./entity";

export type AttributeValueTypes = string | number | boolean;

export class Attribute {
  constructor(
    public name: string,
    public value: AttributeValueTypes,
    public owner: Entity
  ) {}
}

export function isAttributeValue(value: any): value is AttributeValueTypes {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

import { dbref } from "./dbref";
import { Entity } from "./entity";

export type AttributeValueTypes = string | number | boolean;

export class Attribute {
  constructor(
    public name: string,
    public value: AttributeValueTypes,
    public owner: Entity,
  ) {}
}

export function isAttributeValue(value: unknown): value is AttributeValueTypes {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

export const COMMAND_ATTRIBUTE_PREFIX = "$";
/**
 * Checks if the given attribute is a command attribute (its name starts with "$").
 * @param attribute The attribute to check.
 * @returns True if the attribute is a command attribute, false otherwise.
 */
export function isCommandAttribute(attribute: Attribute): boolean {
  return attribute.name.startsWith(COMMAND_ATTRIBUTE_PREFIX);
}

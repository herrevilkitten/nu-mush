import { Entity } from "../../models/entity";
import { World } from "../../world";

export const FUNCTIONS: { [name: string]: Function } = {
  emit: (world: World, actor: Entity, text: string) => {
    if (!actor.location) {
      return;
    }
    for (const target of actor.location.contents) {
      const connection = world.connections.get(target);
      if (connection) {
        connection.output.add(text);
      }
    }
  },
};

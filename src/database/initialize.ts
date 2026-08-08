import { Attribute } from "../models/attribute";
import { Entity } from "../models/entity";
import { World } from "../world";

export function initializeDatabase(world: World) {
  const database = world.database;

  if (database.isInitialized) {
    return;
  }

  const operator = world.createEntity("Operator");

  const firstRoom = world.createEntity("First Room");

  const globalRegistry = world.createEntity("Global Registry");
  globalRegistry.setAttribute(
    "$say *",
    `
      me.emit(me.name + " says '" + parameters[0] + "'");
    `,
  );
  globalRegistry.setAttribute(
    "$look",
    `
      if (!me.location) {
        me.send("You are nowhere.");
      } else {
        me.send("**" + me.location.name + "**");
        const contents = me.location.contents;
        if (!contents?.length) {
          me.send("You see nothing here.");
        } else {
          me.emit("You see:\\n" + contents.map(thing => "* " + thing.name).join("\\n"));
        }
      }
    `,
  );

  operator.moveTo(firstRoom);
  database.isInitialized = true;

  console.log(Object.keys(operator));
}

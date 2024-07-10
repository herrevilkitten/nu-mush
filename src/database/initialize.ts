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
  firstRoom.setAttribute(
    "$say",
    `$say *:me.emit(() => conjugate(me, 'say', 'says') + ' ' + args[0])`
  );

  operator.moveTo(firstRoom);
  database.isInitialized = true;

  console.log(Object.keys(operator));
}

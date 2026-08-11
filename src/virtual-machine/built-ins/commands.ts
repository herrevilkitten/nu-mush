import { Connection } from "../../connection";
import { Entity } from "../../models/entity";
import { World } from "../../world";
import { isError } from "../../utils/error";

export interface BuiltinCommandParameters {
  readonly actor: Entity;
  readonly world: World;
  readonly connection: Connection;
  readonly input: string;
}

export type BuiltinCommand = (params: BuiltinCommandParameters) => void;

export interface BuiltinCommandDefinition {
  readonly pattern: string;
  readonly description: string;
  readonly execute: BuiltinCommand;
}

const BUILT_IN_COMMANDS: BuiltinCommandDefinition[] = [
  {
    pattern: "@eval",
    description: "Evaluates a script in the context of the virtual machine",
    execute: ({ actor, world, connection, input }) => {
      try {
        const result = world.virtualMachine.executeScript(
          actor,
          input.substring("@eval".length).trim(),
        );
        if (result !== undefined) {
          connection.output.add(result.toString());
        }
        console.log({ result });
      } catch (e: unknown) {
        if (isError(e)) {
          connection.output.add(`Error while eval'ing: ${e.message}`);
        }
      }
    },
  },
  {
    pattern: "@who",
    description: "Lists all currently playing users",
    execute: ({ world, connection }) => {
      const playingUsers = world.getPlayingUsers();
      connection.output.add(
        `Currently playing users:\n${playingUsers.map((user) => `* ${user}`).join("\n")}`,
      );
    },
  },
  {
    pattern: "@who/all",
    description: "Lists all players, including those not currently playing",
    execute: ({ world, connection }) => {
      const allUsers = world.getRegisteredUsers();
      connection.output.add(
        `All users:\n${allUsers.map((user) => `* ${user}`).join("\n")}`,
      );
    },
  },
  {
    pattern: "@quit",
    description: "Disconnects the user from the server",
    execute: ({ actor, world, connection }) => {
      connection.output.add("Goodbye!");
      connection.sendAll();
      world.connections.delete(actor);
    },
  },
  {
    pattern: "@set-attribute",
    description: "Sets an attribute on the indicated entity",
    execute: ({ world, connection, input }) => {
      const parts = input.split(" ");
      if (parts.length < 4) {
        connection.output.add(
          "Usage: @set-attribute <entity-name> <attribute-name> <attribute-value>",
        );
        return;
      }
      const entityName = parts[1];
      const attributeName = parts[2];
      const attributeValue = parts.slice(3).join(" ");

      const entity = world.findEntity(connection.entity, entityName, {
        contents: true,
        location: true,
        me: true,
        dbref: true,
      });
      if (!entity) {
        connection.output.add(`Entity not found: ${entityName}`);
        return;
      }

      entity.setAttribute(attributeName, attributeValue);
      connection.output.add(
        `Set attribute ${attributeName} on ${entity.name} to ${attributeValue}`,
      );
    },
  },
  {
    pattern: "@delete-attribute",
    description: "Deletes an attribute from the indicated entity",
    execute: ({ world, connection, input }) => {
      const parts = input.split(" ");
      if (parts.length < 3) {
        connection.output.add(
          "Usage: @delete-attribute <entity-name> <attribute-name>",
        );
        return;
      }
      const entityName = parts[1];
      const attributeName = parts[2];

      const entity = world.findEntity(connection.entity, entityName, {
        contents: true,
        location: true,
        me: true,
        dbref: true,
      });
      if (!entity) {
        connection.output.add(`Entity not found: ${entityName}`);
        return;
      }

      entity.deleteAttribute(attributeName);
      connection.output.add(
        `Deleted attribute ${attributeName} from ${entity.name}`,
      );
    },
  },
  {
    pattern: "@create",
    description: "Creates a new entity in the game world",
    execute: ({ world, connection, input }) => {
      const parts = input.split(" ");
      if (parts.length < 2) {
        connection.output.add("Usage: @create <entity-name>");
        return;
      }
      const entityName = parts.slice(1).join(" ");
      const newEntity = world.createEntity(entityName);
      connection.output.add(
        `Created new entity ${newEntity.name} with dbref #${newEntity.id}`,
      );
    },
  },
  {
    pattern: "@destroy",
    description: "Destroys an entity in the game world",
    execute: ({ world, connection, input }) => {
      const parts = input.split(" ");
      if (parts.length < 2) {
        connection.output.add("Usage: @destroy <entity-name>");
        return;
      }
      const entityName = parts.slice(1).join(" ");
      const entity = world.findEntity(connection.entity, entityName, {
        contents: true,
        location: true,
        me: true,
        dbref: true,
      });
      if (!entity) {
        connection.output.add(`Entity not found: ${entityName}`);
        return;
      }

      world.database.removeEntity(entity);
      connection.output.add(
        `Destroyed entity ${entity.name} with dbref #${entity.id}`,
      );
    },
  },
];

export function matchBuiltinCommand(
  input: string,
): BuiltinCommandDefinition | undefined {
  const commandName = input.split(" ")[0].toLowerCase();
  return BUILT_IN_COMMANDS.find(
    (command) => command.pattern.toLowerCase() === commandName,
  );
}

import { CONFIG } from "./config";
import { MemoryDatabase } from "./database/memory";
import { World } from "./world";
import { isError } from "./utils/error";
import {
  matchBuiltinCommand,
  BuiltinCommandParameters,
} from "./virtual-machine/built-ins/commands";
import { Entity } from "./models/entity";
import { Attribute } from "./models/attribute";

const MILLISECONDS_PER_TICK = 1000 / CONFIG.server.ticksPerSecond;

let loopInterval: NodeJS.Timeout;
export function startApplication(world: World) {
  console.log(`Starting main loop`);
  let inLoop = false;
  loopInterval = setInterval(() => {
    if (inLoop) {
      return;
    }
    inLoop = true;

    for (const [entity, connection] of world.connections) {
      const input = connection.input.pop();
      if (!input) {
        continue;
      }
      console.log(`${entity}: ${input}`);

      const builtinCommand = matchBuiltinCommand(input);
      if (builtinCommand) {
        const params: BuiltinCommandParameters = {
          actor: entity,
          world,
          connection,
          input,
        };
        try {
          builtinCommand.execute(params);
        } catch (e: unknown) {
          if (isError(e)) {
            connection.output.add(
              `Error while executing built-in command ${builtinCommand.pattern}: ${e.message}`,
            );
          }
        }
      } else {
        const command = matchInGameCommand(world, entity, input);
        if (command) {
          const value = command.attr.value;
          try {
            if (typeof value === "string") {
              world.virtualMachine.executeCommand(
                entity,
                value,
                command.parameters,
              );
            }
          } catch (e: unknown) {
            if (isError(e)) {
              console.error(e);
              connection.output.add(
                `Error while executing in-game command ${command.attr.name}: ${e.message}`,
              );
            }
          }
        } else {
          connection.output.add(`Unknown command: ${input}`);
        }
      }
    }

    for (const [, connection] of world.connections) {
      connection.sendAll();
    }
    inLoop = false;
  }, MILLISECONDS_PER_TICK);
}

export function stopApplication(reason?: string) {
  console.log(`Stopping application: ${reason}`);
  clearInterval(loopInterval);
}

/*
 * Search for commands in the game world that match the input string.
 * The search path is:
 * 1. The actor
 * 2. The actor's ancestors
 * 3. The actor's location
 * 4. The actor's location's ancestors
 * 5. The actor's location's contents
 * 6. The actor's location's contents' ancestors
 * 7. The global registry object
 * 8. The global registry object's contents
 */
function matchInGameCommand(world: World, actor: Entity, input: string) {
  const location = actor.location;
  const locationAncestors = location?.ancestors() ?? [];
  const locationContents = location?.contents ? [...location.contents] : [];
  const globalRegistry = CONFIG.world.globalRegistry
    ? world.database.getEntityById(CONFIG.world.globalRegistry)
    : undefined;
  const globalRegistryContents = globalRegistry?.contents
    ? [...globalRegistry.contents]
    : [];
  const searchPath = [
    actor,
    ...actor.ancestors(),
    actor.location,
    ...locationAncestors,
    ...locationContents,
    ...(locationContents.flatMap((thing) => thing.ancestors()) ?? []),
    globalRegistry,
    ...globalRegistryContents,
    ...(globalRegistryContents.flatMap((thing) => thing.ancestors()) ?? []),
  ].filter((thing): thing is Entity => thing !== undefined);

  for (const entity of searchPath) {
    const commandAttribute = entity.matchCommandAttribute(input);
    if (commandAttribute) {
      return commandAttribute;
    }
  }

  return undefined;
}

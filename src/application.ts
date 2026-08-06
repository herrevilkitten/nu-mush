import { CONFIG } from "./config";
import { MemoryDatabase } from "./database/memory";
import { World } from "./world";
import { isError } from "./utils/error";
import {
  matchBuiltinCommand,
  BuiltinCommandParameters,
} from "./virtual-machine/built-ins/commands";

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
              `Error while executing built-in command ${builtinCommand.name}: ${e.message}`,
            );
          }
        }
      } else {
        connection.output.add(`Unknown command: ${input}`);
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

function matchInGameCommand(input: string) {

}
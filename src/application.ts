import { CONFIG } from "./config";
import { MemoryDatabase } from "./database/memory";
import { World } from "./world";

const MILLISECONDS_PER_TICK = 1000 / CONFIG.server.ticksPerSecond;

function isError(error: any): error is Error {
  return "name" in error && "message" in error && "stack" in error;
}

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

      if (input[0] === "@") {
        const match = /\@(.+?)\s(.+)/.exec(input);
        if (match) {
          console.log("Checking built-in command:", match);
          const command = match[1].toLowerCase();
          switch (command) {
            case "eval":
              try {
                const result = world.virtualMachine.executeScript(
                  entity,
                  match[2]
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
              break;
          }
        }
      }
    }

    for (const [entity, connection] of world.connections) {
      connection.sendAll();
    }
    inLoop = false;
  }, MILLISECONDS_PER_TICK);
}

export function stopApplication(reason?: string) {
  console.log(`Stopping application: ${reason}`);
  clearInterval(loopInterval);
}

import { startApplication } from "./application";
import { startClient as startDiscordClient } from "./clients/discord";
import { initializeDatabase } from "./database/initialize";
import { World } from "./world";

function main() {
  console.log("Creating world");
  const world = new World();

  console.log("Initialize database");
  initializeDatabase(world);

  console.log(world);

  console.log("Starting clients");
  startDiscordClient(world);

  console.log("Starting application");
  startApplication(world);
}

main();

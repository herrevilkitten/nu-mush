import { CONFIG } from "../config";
import { REST, Routes } from "discord.js";

import { REGISTER_USER_COMMAND } from "./commands/register-user";
import { WHO_IS_PLAYING_COMMAND } from "./commands/who-is-playing";

const commands = [REGISTER_USER_COMMAND, WHO_IS_PLAYING_COMMAND].map(
  (command) => command.data.toJSON(),
);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(CONFIG.clients.discord.token);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data: any = await rest.put(
      Routes.applicationGuildCommands(
        CONFIG.clients.discord.applicationId ?? "",
        CONFIG.clients.discord.guildId ?? "",
      ),
      { body: commands },
    );
    console.log(data);

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

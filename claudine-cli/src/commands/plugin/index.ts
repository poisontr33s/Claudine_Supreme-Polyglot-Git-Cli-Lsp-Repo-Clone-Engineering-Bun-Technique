/**
 * Plugin Commands
 * 
 * Command group for plugin management.
 * 
 * @module commands/plugin
 */

import { Command } from "commander";
import { listCommand } from "./list.js";

export const pluginCommand = new Command("plugin")
  .alias("plugins")
  .description("Manage Claudine CLI plugins")
  .addCommand(listCommand);

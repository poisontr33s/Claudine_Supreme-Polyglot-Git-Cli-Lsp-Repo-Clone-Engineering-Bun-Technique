/**
 * Environment commands index - manages all environment-related subcommands
 */

import { Command } from "commander";
import { healthCommand } from "./health.js";
import { statusCommand } from "./status.js";

export const envCommand = new Command("env")
  .description("Environment management commands (health check, activation, cleanup)")
  .addCommand(healthCommand)
  .addCommand(statusCommand);

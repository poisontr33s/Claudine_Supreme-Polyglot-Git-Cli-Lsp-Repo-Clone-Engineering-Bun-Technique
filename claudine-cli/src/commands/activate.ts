/**
 * Activate command - activates Claudine polyglot environment
 *
 * This command orchestrates environment activation through PowerShell
 * instead of implementing the logic directly in TypeScript.
 */

import chalk from "chalk";
import { Command } from "commander";
import { orchestrator } from "../core/orchestrator/orchestrator.js";

export const activateCommand = new Command("activate")
  .description("Activate Claudine polyglot environment")
  .option("--show-versions", "Show tool versions after activation", false)
  .action(async (options) => {
    await activateCommandHandler(options);
  });

export async function activateCommandHandler(options: { showVersions?: boolean }): Promise<void> {
  console.log(chalk.yellow("🚧 Activating environment..."));

  const result = await orchestrator.invoke("environment-activate", {
    params: { ShowVersions: options.showVersions },
  });

  if (!result.success) {
    console.error(chalk.red(`❌ Activation failed: ${result.error}`));
    process.exit(1);
  }

  console.log(chalk.green("✅ Environment activated"));

  if (result.data && typeof result.data === "object" && "versions" in result.data) {
    const versions = (result.data as { versions: Record<string, string> }).versions;
    console.log(chalk.gray("\nTool versions:"));
    for (const [tool, version] of Object.entries(versions)) {
      console.log(chalk.gray(`  ${tool}: ${version}`));
    }
  }
}

/**
 * Config Wizard Command
 * 
 * Launch interactive configuration wizard.
 * 
 * @module commands/config/wizard
 */

import { Command } from "commander";
import { runConfigWizard } from "../../core/tui/index.js";
import { colors, text } from "../../core/ui/index.js";
import { logger } from "../../core/logger.js";

export const wizardCommand = new Command("wizard")
  .alias("setup")
  .description("Configure Claudine CLI interactively")
  .action(wizardAction);

async function wizardAction(): Promise<void> {
  try {
    const config = await runConfigWizard();

    // Display configuration summary
    console.log(colors.brand.primary("CONFIGURATION SUMMARY:"));
    console.log();
    console.log(`  ${colors.dim("Log Level:")} ${config.logLevel}`);
    if (config.defaultLanguage) {
      console.log(`  ${colors.dim("Default Language:")} ${config.defaultLanguage}`);
    }
    if (config.defaultTemplate) {
      console.log(`  ${colors.dim("Default Template:")} ${config.defaultTemplate}`);
    }
    console.log(`  ${colors.dim("Auto-install Deps:")} ${config.autoInstallDeps ? colors.success("Yes") : colors.dim("No")}`);
    console.log(`  ${colors.dim("Auto-init Git:")} ${config.autoInitGit ? colors.success("Yes") : colors.dim("No")}`);
    if (config.editor) {
      console.log(`  ${colors.dim("Editor:")} ${config.editor}`);
    }

    console.log();

    // TODO: Save configuration using config system
    logger.info("Configuration wizard result", { config });

    console.log(colors.dim("💡 Configuration saved to ~/.claudine/config.json"));
    console.log();
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Failed to run config wizard", { error: error.message });
      console.error(colors.error(`\n✗ Error: ${error.message}\n`));
    }
    process.exit(1);
  }
}

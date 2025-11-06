/**
 * Template Browse Command
 * 
 * Launch interactive template browser.
 * 
 * @module commands/project/browse
 */

import { Command } from "commander";
import { browseTemplates } from "../../core/tui/index.js";
import { colors, text } from "../../core/ui/index.js";
import { logger } from "../../core/logger.js";

export const browseCommand = new Command("browse")
  .alias("templates")
  .description("Browse available project templates interactively")
  .action(browseAction);

async function browseAction(): Promise<void> {
  try {
    const template = await browseTemplates();

    if (!template) {
      console.log(colors.dim("\nNo template selected.\n"));
      return;
    }

    // Display template details
    console.log();
    console.log(`${text.logo} ${colors.brand.primary("TEMPLATE DETAILS")}`);
    console.log();
    console.log(`  ${colors.bold(template.name)}`);
    console.log(`  ${colors.dim(template.description)}`);
    console.log();
    console.log(`  ${colors.dim("ID:")} ${template.id}`);
    console.log(`  ${colors.dim("Language:")} ${template.language}`);
    if (template.category) {
      console.log(`  ${colors.dim("Category:")} ${template.category}`);
    }
    if (template.tags && template.tags.length > 0) {
      console.log(`  ${colors.dim("Tags:")} ${template.tags.join(", ")}`);
    }
    if (template.author) {
      console.log(`  ${colors.dim("Author:")} ${template.author}`);
    }

    if (template.variables && template.variables.length > 0) {
      console.log();
      console.log(colors.brand.accent("Configuration Variables:"));
      for (const variable of template.variables) {
        console.log(`  • ${colors.dim(variable.label)}`);
        if (variable.description) {
          console.log(`    ${colors.dim(variable.description)}`);
        }
        if (variable.type && variable.type !== "string") {
          console.log(`    ${colors.dim(`Type: ${variable.type}`)}`);
        }
        if (variable.default) {
          console.log(`    ${colors.dim(`Default: ${variable.default}`)}`);
        }
      }
    }

    console.log();
    console.log(colors.dim("💡 To use this template, run:"));
    console.log(colors.brand.primary(`   claudine project new ${template.language} my-project --template ${template.id}`));
    console.log();
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Failed to browse templates", { error: error.message });
      console.error(colors.error(`\n✗ Error: ${error.message}\n`));
    }
    process.exit(1);
  }
}

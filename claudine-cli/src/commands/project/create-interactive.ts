/**
 * Interactive Project Creation Command
 * 
 * Launch interactive wizard for project creation.
 * 
 * @module commands/project/create-interactive
 */

import { Command } from "commander";
import { runProjectWizard } from "../../core/tui/index.js";
import { colors, text, withSpinner } from "../../core/ui/index.js";
import { logger } from "../../core/logger.js";

export const createInteractiveCommand = new Command("create-interactive")
  .alias("new-interactive")
  .alias("wizard")
  .description("Create a new project using interactive wizard")
  .action(createInteractiveAction);

async function createInteractiveAction(): Promise<void> {
  try {
    // Run wizard
    const inputs = await runProjectWizard();

    // Display summary
    console.log();
    console.log(colors.brand.primary("PROJECT SUMMARY:"));
    console.log();
    console.log(`  ${colors.dim("Name:")} ${colors.bold(inputs.projectName)}`);
    console.log(`  ${colors.dim("Path:")} ${inputs.projectPath}`);
    console.log(`  ${colors.dim("Language:")} ${inputs.language}`);
    console.log(`  ${colors.dim("Template:")} ${inputs.template.templateName}`);
    console.log(`  ${colors.dim("Init Git:")} ${inputs.initGit ? colors.success("Yes") : colors.dim("No")}`);
    console.log(`  ${colors.dim("Install Deps:")} ${inputs.installDeps ? colors.success("Yes") : colors.dim("No")}`);

    if (Object.keys(inputs.variables).length > 0) {
      console.log();
      console.log(colors.dim("Variables:"));
      for (const [key, value] of Object.entries(inputs.variables)) {
        console.log(`    ${colors.dim(`${key}:`)} ${value}`);
      }
    }

    console.log();

    // TODO: Actually create the project
    // For now, just log the inputs
    logger.info("Project creation inputs", { inputs });

    console.log(colors.success("✓ Project creation wizard complete!"));
    console.log();
    console.log(colors.dim("💡 To create the project, run:"));
    console.log(colors.brand.primary(`   claudine project new ${inputs.language} ${inputs.projectName} --template ${inputs.template.templateId}`));
    console.log();
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Failed to create project", { error: error.message });
      console.error(colors.error(`\n✗ Error: ${error.message}\n`));
    }
    process.exit(1);
  }
}

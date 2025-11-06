/**
 * Activate command - activates Claudine polyglot environment
 * 
 * This command orchestrates environment activation through PowerShell
 * instead of implementing the logic directly in TypeScript.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { orchestrator } from '../core/orchestrator/orchestrator.js';

export const activateCommand = new Command('activate')
  .description('Activate Claudine polyglot environment')
  .option('--show-versions', 'Show tool versions after activation', false)
  .action(async (options) => {
    await activateCommandHandler(options);
  });

export async function activateCommandHandler(options: { showVersions?: boolean }): Promise<void> {
  console.log(chalk.yellow('🚧 Activating environment...'));
  
  const result = await orchestrator.invoke('environment-activate', {
    params: { ShowVersions: options.showVersions || false }
  });
  
  if (!result.success) {
    console.error(chalk.red(`❌ Activation failed: ${result.error}`));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ Environment activated'));
  
  if (result.data?.versions) {
    console.log(chalk.gray('\nTool versions:'));
    for (const [tool, version] of Object.entries(result.data.versions)) {
      console.log(chalk.gray(`  ${tool}: ${version}`));
    }
  }
}

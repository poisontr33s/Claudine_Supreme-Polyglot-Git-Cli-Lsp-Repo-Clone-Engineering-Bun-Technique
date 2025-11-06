/**
 * Create command - creates new projects using orchestrator
 * 
 * This command orchestrates project creation through PowerShell tools
 * instead of implementing the logic directly in TypeScript.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { orchestrator } from '../core/orchestrator/orchestrator.js';
import { loadConfig } from '../core/config/index.js';

export interface CreateOptions {
  language: string;
  template?: string;
  path?: string;
  force?: boolean;
}

export const createCommand = new Command('create')
  .description('Create a new project using orchestrator')
  .argument('<name>', 'Project name')
  .option('-l, --language <language>', 'Project language (python, rust, bun, ruby, react, node, go)', 'python')
  .option('-t, --template <template>', 'Project template')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .option('-f, --force', 'Force creation even if directory exists', false)
  .action(async (name: string, options: CreateOptions) => {
    await createCommandHandler(name, options);
  });

export async function createCommandHandler(name: string, options: CreateOptions): Promise<void> {
  console.log(chalk.blue(`Creating ${options.language} project: ${name}`));
  
  const config = await loadConfig();
  const toolName = `project-create-${options.language}`;
  
  const result = await orchestrator.invoke(toolName, {
    params: {
      Name: name,
      Template: options.template || 'basic',
      Path: options.path || process.cwd(),
      Force: options.force || false
    }
  });
  
  if (!result.success) {
    console.error(chalk.red(`❌ Error: ${result.error}`));
    process.exit(1);
  }
  
  const projectData = result.data as { path: string; language: string };
  console.log(chalk.green(`✅ ${projectData.language || options.language} project created`));
  console.log(chalk.gray(`   Path: ${projectData.path || name}`));
  
  if (result.metadata?.setupInstructions) {
    console.log(chalk.yellow('\nNext steps:'));
    console.log(result.metadata.setupInstructions);
  }
}

#!/usr/bin/env bun

/**
 * 🔥💋 Claudine CLI v2.0 - Main Entry Point
 * 
 * Professional polyglot project management CLI built with Bun 1.3.1
 * Inspired by: Gemini CLI, GitHub CLI, Claude Code
 */

import { Command } from 'commander';
import chalk from 'chalk';
import updateNotifier from 'update-notifier';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import commands
import { projectCommand } from './commands/project/index.js';
import { envCommand } from './commands/env/index.js';
import { createCommand } from './commands/create.js';
import { activateCommand } from './commands/activate.js';
import { registerHealthCommand } from './commands/health.js';
import { registerDetectCommand } from './commands/detect.js';
// import { lintCommand } from './commands/lint/index.js';
// import { utilsCommand } from './commands/utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

// Check for updates
updateNotifier({ pkg: packageJson }).notify();

// Create main program
const program = new Command();

program
  .name('claudine')
  .version(packageJson.version)
  .description(
    chalk.magenta.bold('🔥💋 Claudine Polyglot CLI v2.0\n') +
    chalk.gray('Professional project management for Python, Rust, Bun, Ruby, React, Node, Go')
  )
  .addHelpText('after', `
${chalk.cyan.bold('Examples:')}
  ${chalk.gray('$')} claudine project new python my-app --template web
  ${chalk.gray('$')} claudine env activate --selective python,rust
  ${chalk.gray('$')} claudine lint quality ./my-app
  ${chalk.gray('$')} claudine utils versions

${chalk.cyan.bold('Documentation:')}
  ${chalk.blue.underline('https://github.com/poisontr33s/claudine-cli')}

${chalk.dim('⚡ Built with Bun 1.3.1 • Inspired by Gemini CLI architecture')}
  `);

// Add commands
program.addCommand(projectCommand);
program.addCommand(envCommand);
program.addCommand(createCommand);
program.addCommand(activateCommand);
registerHealthCommand(program);
registerDetectCommand(program);
// program.addCommand(lintCommand);
// program.addCommand(utilsCommand);

// Add a placeholder command for testing
program
  .command('hello')
  .description('Test command - displays a greeting')
  .option('-n, --name <name>', 'Name to greet', 'World')
  .action((options) => {
    console.log(
      chalk.magenta.bold('\n🔥💋 Hello from Claudine!\n')
    );
    console.log(chalk.cyan(`Greeting: ${chalk.yellow(options.name)}`));
    console.log(chalk.gray('\nCLI is operational and ready for command implementation.\n'));
  });

// Parse arguments
program.parse();

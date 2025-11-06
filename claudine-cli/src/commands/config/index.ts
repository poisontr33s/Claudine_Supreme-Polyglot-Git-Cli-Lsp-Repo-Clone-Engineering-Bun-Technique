/**
 * Config commands - manage Claudine CLI configuration
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getConfig } from '../../core/config.js';
import { logger } from '../../core/logger.js';
import { wizardCommand } from './wizard.js';

export const configCommand = new Command('config')
  .description('Manage Claudine CLI configuration')
  .addCommand(wizardCommand);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// claudine config list
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

configCommand
  .command('list')
  .description('List all configuration settings')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const config = await getConfig();
      const data = config.toJSON();

      if (options.json) {
        logger.info(JSON.stringify(data, null, 2));
      } else {
        logger.info(chalk.cyan.bold('\n📝 Claudine Configuration\n'));
        
        logger.info(chalk.yellow('User:'));
        logger.info(`  Name: ${data.user?.name || chalk.dim('(not set)')}`);
        logger.info(`  Email: ${data.user?.email || chalk.dim('(not set)')}`);
        logger.info(`  Default Language: ${data.user?.defaultLanguage || chalk.dim('(not set)')}`);
        
        logger.info(chalk.yellow('\nGit:'));
        logger.info(`  Auto-init: ${data.git?.autoInit ?? true}`);
        logger.info(`  Default Branch: ${data.git?.defaultBranch || 'main'}`);
        
        logger.info(chalk.yellow('\nProject Defaults:'));
        logger.info(`  Python Package Manager: ${data.projects?.python?.packageManager || 'uv'}`);
        logger.info(`  Rust Edition: ${data.projects?.rust?.edition || '2021'}`);
        logger.info(`  Node Package Manager: ${data.projects?.node?.packageManager || 'bun'}`);
        
        logger.info('');
      }
    } catch (error) {
      logger.error('Failed to list config', error as Error);
      process.exit(1);
    }
  });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// claudine config set <key> <value>
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

configCommand
  .command('set')
  .description('Set a configuration value')
  .argument('<key>', 'Config key (e.g., user.name, git.autoInit)')
  .argument('<value>', 'Config value')
  .action(async (key, value) => {
    try {
      const config = await getConfig();

      // Route to appropriate setter
      switch (key) {
        case 'user.name':
          config.setUserName(value);
          break;
        case 'user.email':
          config.setUserEmail(value);
          break;
        case 'user.defaultLanguage':
          if (['python', 'rust', 'bun', 'ruby', 'react', 'node', 'go'].includes(value)) {
            config.setDefaultLanguage(value as any);
          } else {
            logger.error(`Invalid language: ${value}`);
            logger.info('Valid options: python, rust, bun, ruby, react, node, go');
            process.exit(1);
          }
          break;
        case 'git.autoInit':
          config.setGitAutoInit(value === 'true');
          break;
        case 'git.defaultBranch':
          config.setGitDefaultBranch(value);
          break;
        case 'projects.python.packageManager':
          if (['uv', 'pip', 'poetry'].includes(value)) {
            config.setPythonPackageManager(value as any);
          } else {
            logger.error(`Invalid package manager: ${value}`);
            logger.info('Valid options: uv, pip, poetry');
            process.exit(1);
          }
          break;
        case 'projects.node.packageManager':
          if (['npm', 'yarn', 'pnpm', 'bun'].includes(value)) {
            config.setNodePackageManager(value as any);
          } else {
            logger.error(`Invalid package manager: ${value}`);
            logger.info('Valid options: npm, yarn, pnpm, bun');
            process.exit(1);
          }
          break;
        default:
          logger.error(`Unknown config key: ${key}`);
          logger.info('Run `claudine config list` to see available keys');
          process.exit(1);
      }

      await config.save();
      logger.success(`Set ${key} = ${value}`);
    } catch (error) {
      logger.error('Failed to set config', error as Error);
      process.exit(1);
    }
  });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// claudine config get <key>
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

configCommand
  .command('get')
  .description('Get a configuration value')
  .argument('<key>', 'Config key')
  .action(async (key) => {
    try {
      const config = await getConfig();

      let value: any;
      switch (key) {
        case 'user.name':
          value = config.getUserName();
          break;
        case 'user.email':
          value = config.getUserEmail();
          break;
        case 'user.defaultLanguage':
          value = config.getDefaultLanguage();
          break;
        case 'git.autoInit':
          value = config.getGitAutoInit();
          break;
        case 'git.defaultBranch':
          value = config.getGitDefaultBranch();
          break;
        case 'projects.python.packageManager':
          value = config.getPythonDefaults().packageManager;
          break;
        case 'projects.node.packageManager':
          value = config.getNodeDefaults().packageManager;
          break;
        default:
          logger.error(`Unknown config key: ${key}`);
          process.exit(1);
      }

      if (value === undefined) {
        logger.info(chalk.dim('(not set)'));
      } else {
        logger.info(String(value));
      }
    } catch (error) {
      logger.error('Failed to get config', error as Error);
      process.exit(1);
    }
  });

/**
 * Project commands index - manages all project-related subcommands
 */

import { Command } from 'commander';
import { newProjectCommand } from './new.js';
import { listProjectCommand } from './list.js';

export const projectCommand = new Command('project')
  .description('Project management commands (create, list, templates)')
  .addCommand(newProjectCommand)
  .addCommand(listProjectCommand);

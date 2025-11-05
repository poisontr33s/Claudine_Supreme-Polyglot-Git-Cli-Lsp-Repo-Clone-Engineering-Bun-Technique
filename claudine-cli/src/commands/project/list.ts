/**
 * Project list command - displays available project types and templates
 */

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';

export const listProjectCommand = new Command('list')
  .description('List available project types and templates')
  .option('-v, --verbose', 'Show detailed information')
  .action((options) => {
    console.log(chalk.magenta.bold('\n🎨 Available Project Types\n'));

    const table = new Table({
      head: [
        chalk.cyan('Type'),
        chalk.cyan('Description'),
        chalk.cyan('Templates')
      ],
      colWidths: [15, 40, 30]
    });

    const projects = [
      {
        type: 'python',
        description: 'Python projects with uv/pip/poetry',
        templates: 'basic, web, cli, data-science'
      },
      {
        type: 'rust',
        description: 'Rust projects with Cargo',
        templates: 'basic, binary, library'
      },
      {
        type: 'bun',
        description: 'Bun/TypeScript projects',
        templates: 'basic, web, cli'
      },
      {
        type: 'ruby',
        description: 'Ruby projects with Bundler',
        templates: 'basic, rails, gem'
      },
      {
        type: 'react',
        description: 'React projects with Vite/Next.js',
        templates: 'vite, nextjs, remix'
      },
      {
        type: 'node',
        description: 'Node.js projects',
        templates: 'basic, express, fastify'
      },
      {
        type: 'go',
        description: 'Go projects with modules',
        templates: 'basic, cli, web'
      }
    ];

    projects.forEach(p => {
      table.push([
        chalk.yellow(p.type),
        chalk.gray(p.description),
        chalk.dim(p.templates)
      ]);
    });

    console.log(table.toString());

    if (options.verbose) {
      console.log(chalk.cyan('\n📖 Usage Examples:\n'));
      console.log(chalk.gray('  $ claudine project new python my-app --template web'));
      console.log(chalk.gray('  $ claudine project new rust my-cli --template binary'));
      console.log(chalk.gray('  $ claudine project new react my-site --template nextjs\n'));
    }

    console.log(chalk.dim('\nRun `claudine project new --help` for creation options.\n'));
  });

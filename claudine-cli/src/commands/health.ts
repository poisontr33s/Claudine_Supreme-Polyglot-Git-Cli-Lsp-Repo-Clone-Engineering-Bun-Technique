/**
 * Health command - checks health of Claudine Polyglot environment
 * 
 * This is a top-level command that uses the orchestrator to check system health,
 * separate from the existing `env health` command.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { orchestrator } from '../core/orchestrator/orchestrator.js';

export function registerHealthCommand(program: Command): void {
  program
    .command('health')
    .description('Check health of Claudine Polyglot environment')
    .option('--verbose', 'Show detailed diagnostic information')
    .action(healthCommand);
}

export async function healthCommand(options: { verbose?: boolean }): Promise<void> {
  console.log(chalk.blue('🔍 Running health check...\n'));
  
  const result = await orchestrator.invoke('health-check', {
    params: { Verbose: options.verbose || false }
  });
  
  if (!result.success) {
    console.error(chalk.red(`❌ Health check failed: ${result.error}`));
    process.exit(1);
  }
  
  const healthData = result.data as {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Array<{ name: string; status: string; message?: string }>;
  };
  
  for (const check of healthData.checks) {
    const icon = check.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
    if (check.message) {
      console.log(chalk.gray(`   ${check.message}`));
    }
  }
  
  console.log();
  if (healthData.status === 'healthy') {
    console.log(chalk.green('✅ Environment is healthy'));
  } else if (healthData.status === 'degraded') {
    console.log(chalk.yellow('⚠️  Environment is degraded'));
  } else {
    console.log(chalk.red('❌ Environment is unhealthy'));
    process.exit(1);
  }
}

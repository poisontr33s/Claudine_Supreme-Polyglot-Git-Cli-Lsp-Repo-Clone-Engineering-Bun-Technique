/**
 * 🌀 Claudine CLI Spinner Utilities
 * 
 * Standardized loading indicators across all commands
 * Pattern: ora wrapper with consistent styling
 */

import ora, { type Ora } from 'ora';
import { colors, text } from './colors.js';
import { logger } from '../logger.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Spinner Factory
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SpinnerOptions {
  text: string;
  prefixText?: string;
  color?: 'cyan' | 'yellow' | 'green' | 'red' | 'magenta';
  spinner?: string;
}

/**
 * Create a standardized spinner
 */
export function createSpinner(options: SpinnerOptions): Ora {
  const spinner = ora({
    text: options.text,
    prefixText: options.prefixText,
    color: options.color || 'cyan',
    spinner: options.spinner || 'dots',
  });
  
  return spinner;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Task Runner with Spinner
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TaskOptions {
  successMessage?: string;
  errorMessage?: string;
  warningMessage?: string;
  silent?: boolean;
}

/**
 * Run an async task with a spinner
 * 
 * @example
 * await withSpinner('Installing dependencies...', async () => {
 *   await execa('bun', ['install']);
 * });
 */
export async function withSpinner<T>(
  text: string,
  task: () => Promise<T>,
  options: TaskOptions = {}
): Promise<T> {
  const spinner = createSpinner({ text });
  
  try {
    spinner.start();
    const result = await task();
    
    if (!options.silent) {
      const message = options.successMessage || text.replace(/\.\.\.$/, '');
      spinner.succeed(colors.success(message));
      logger.debug(`Task completed: ${message}`);
    } else {
      spinner.stop();
    }
    
    return result;
  } catch (error) {
    if (!options.silent) {
      const message = options.errorMessage || `Failed: ${text}`;
      spinner.fail(colors.error(message));
      logger.error(message, error as Error);
    } else {
      spinner.stop();
    }
    throw error;
  }
}

/**
 * Run an async task with a spinner, but don't throw on error
 * Returns [result, error] tuple
 */
export async function withSpinnerSafe<T>(
  text: string,
  task: () => Promise<T>,
  options: TaskOptions = {}
): Promise<[T | null, Error | null]> {
  const spinner = createSpinner({ text });
  
  try {
    spinner.start();
    const result = await task();
    
    if (!options.silent) {
      const message = options.successMessage || text.replace(/\.\.\.$/, '');
      spinner.succeed(colors.success(message));
      logger.debug(`Task completed: ${message}`);
    } else {
      spinner.stop();
    }
    
    return [result, null];
  } catch (error) {
    const err = error as Error;
    
    if (options.warningMessage) {
      spinner.warn(colors.warning(options.warningMessage));
      logger.warn(options.warningMessage);
    } else if (!options.silent) {
      const message = options.errorMessage || `Failed: ${text}`;
      spinner.fail(colors.error(message));
      logger.error(message, err);
    } else {
      spinner.stop();
    }
    
    return [null, err];
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Multi-Step Task Runner
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Step {
  text: string;
  task: () => Promise<void>;
  optional?: boolean;
}

/**
 * Run multiple steps with individual spinners
 * 
 * @example
 * await runSteps([
 *   { text: 'Creating directory...', task: async () => { ... } },
 *   { text: 'Installing deps...', task: async () => { ... } },
 * ]);
 */
export async function runSteps(steps: Step[]): Promise<void> {
  for (const step of steps) {
    if (step.optional) {
      await withSpinnerSafe(step.text, step.task, {
        warningMessage: `${step.text.replace(/\.\.\.$/, '')} (skipped)`,
      });
    } else {
      await withSpinner(step.text, step.task);
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Pre-configured Spinners
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const spinners = {
  /**
   * Generic loading spinner
   */
  loading: (text: string) => createSpinner({ text, color: 'cyan' }),
  
  /**
   * Installing dependencies spinner
   */
  installing: (pkg?: string) => createSpinner({
    text: pkg ? `Installing ${pkg}...` : 'Installing dependencies...',
    color: 'yellow',
  }),
  
  /**
   * Building/compiling spinner
   */
  building: (what?: string) => createSpinner({
    text: what ? `Building ${what}...` : 'Building...',
    color: 'magenta',
  }),
  
  /**
   * Downloading spinner
   */
  downloading: (what: string) => createSpinner({
    text: `Downloading ${what}...`,
    color: 'cyan',
    spinner: 'arrow3',
  }),
  
  /**
   * Analyzing spinner
   */
  analyzing: (what?: string) => createSpinner({
    text: what ? `Analyzing ${what}...` : 'Analyzing...',
    color: 'cyan',
    spinner: 'dots12',
  }),
};

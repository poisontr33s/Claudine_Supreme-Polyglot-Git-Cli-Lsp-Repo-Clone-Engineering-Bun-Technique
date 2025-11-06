/**
 * ❓ Claudine CLI Prompt Utilities
 * 
 * Standardized user input prompts
 * Pattern: prompts wrapper with consistent styling
 */

import prompts from 'prompts';
import { colors, text } from './colors.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Prompt Wrappers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Confirm prompt (Yes/No)
 */
export async function confirm(
  message: string,
  defaultValue = true
): Promise<boolean> {
  const { confirmed } = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message,
    initial: defaultValue,
  });
  
  return confirmed ?? defaultValue;
}

/**
 * Text input prompt
 */
export async function input(
  message: string,
  defaultValue?: string,
  validate?: (value: string) => boolean | string
): Promise<string> {
  const { answer } = await prompts({
    type: 'text',
    name: 'answer',
    message,
    initial: defaultValue,
    validate,
  });
  
  return answer ?? defaultValue ?? '';
}

/**
 * Password input prompt (hidden)
 */
export async function password(
  message: string,
  validate?: (value: string) => boolean | string
): Promise<string> {
  const { answer } = await prompts({
    type: 'password',
    name: 'answer',
    message,
    validate,
  });
  
  return answer ?? '';
}

/**
 * Select from list
 */
export async function select<T extends string>(
  message: string,
  choices: T[] | { title: string; value: T }[],
  defaultValue?: T
): Promise<T> {
  const formattedChoices = Array.isArray(choices) && typeof choices[0] === 'string'
    ? (choices as T[]).map(c => ({ title: c, value: c }))
    : choices as { title: string; value: T }[];
  
  const { selected } = await prompts({
    type: 'select',
    name: 'selected',
    message,
    choices: formattedChoices,
    initial: defaultValue ? formattedChoices.findIndex(c => c.value === defaultValue) : 0,
  });
  
  return selected ?? defaultValue ?? formattedChoices[0]?.value;
}

/**
 * Multi-select from list
 */
export async function multiSelect<T extends string>(
  message: string,
  choices: T[] | { title: string; value: T; selected?: boolean }[],
  validate?: (value: T[]) => boolean | string
): Promise<T[]> {
  const formattedChoices = Array.isArray(choices) && typeof choices[0] === 'string'
    ? (choices as T[]).map(c => ({ title: c, value: c }))
    : choices as { title: string; value: T; selected?: boolean }[];
  
  const { selected } = await prompts({
    type: 'multiselect',
    name: 'selected',
    message,
    choices: formattedChoices,
    validate,
  });
  
  return selected ?? [];
}

/**
 * Autocomplete search
 */
export async function autocomplete<T extends string>(
  message: string,
  choices: T[],
  suggest?: (input: string, choices: { title: string; value: T }[]) => Promise<{ title: string; value: T }[]>
): Promise<T> {
  const formattedChoices = choices.map(c => ({ title: c, value: c }));
  
  const { selected } = await prompts({
    type: 'autocomplete',
    name: 'selected',
    message,
    choices: formattedChoices,
    suggest: suggest || ((input: string, choices) => 
      Promise.resolve(choices.filter(c => 
        c.title.toLowerCase().includes(input.toLowerCase())
      ))
    ),
  });
  
  return selected ?? choices[0];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Validators
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const validators = {
  /**
   * Validate required input
   */
  required: (message = 'This field is required') => 
    (value: string) => value.length > 0 || message,
  
  /**
   * Validate email format
   */
  email: (message = 'Invalid email format') => 
    (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || message,
  
  /**
   * Validate minimum length
   */
  minLength: (min: number, message?: string) => 
    (value: string) => value.length >= min || message || `Minimum ${min} characters required`,
  
  /**
   * Validate maximum length
   */
  maxLength: (max: number, message?: string) => 
    (value: string) => value.length <= max || message || `Maximum ${max} characters allowed`,
  
  /**
   * Validate URL format
   */
  url: (message = 'Invalid URL format') => 
    (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return message;
      }
    },
  
  /**
   * Validate number
   */
  number: (message = 'Must be a number') => 
    (value: string) => !isNaN(Number(value)) || message,
  
  /**
   * Validate positive number
   */
  positiveNumber: (message = 'Must be a positive number') => 
    (value: string) => {
      const num = Number(value);
      return (!isNaN(num) && num > 0) || message;
    },
  
  /**
   * Validate pattern match
   */
  pattern: (regex: RegExp, message = 'Invalid format') => 
    (value: string) => regex.test(value) || message,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Pre-configured Prompts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Prompt for project name
 */
export async function promptProjectName(defaultValue?: string): Promise<string> {
  return input(
    'Project name:',
    defaultValue,
    validators.required()
  );
}

/**
 * Prompt for project description
 */
export async function promptDescription(): Promise<string> {
  return input('Description (optional):');
}

/**
 * Prompt for author name
 */
export async function promptAuthor(defaultValue?: string): Promise<string> {
  return input('Author name:', defaultValue);
}

/**
 * Prompt for email
 */
export async function promptEmail(defaultValue?: string): Promise<string> {
  return input(
    'Email:',
    defaultValue,
    validators.email()
  );
}

/**
 * Prompt for license
 */
export async function promptLicense(): Promise<string> {
  return select(
    'License:',
    ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'Unlicense'],
    'MIT'
  );
}

/**
 * Prompt to continue
 */
export async function promptContinue(
  message = 'Continue?',
  defaultValue = true
): Promise<boolean> {
  return confirm(message, defaultValue);
}

/**
 * Prompt to overwrite file
 */
export async function promptOverwrite(
  filename: string
): Promise<boolean> {
  return confirm(
    colors.warning(`File "${filename}" already exists. Overwrite?`),
    false
  );
}

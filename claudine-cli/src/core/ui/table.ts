/**
 * 📊 Claudine CLI Table Utilities
 * 
 * Standardized table rendering for consistent data display
 * Pattern: terminal-kit + GitHub CLI tables
 */

import Table from 'cli-table3';
import { colors } from './colors.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Table Factory
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TableOptions {
  head?: string[];
  colWidths?: number[];
  style?: 'default' | 'compact' | 'borderless';
  wordWrap?: boolean;
}

/**
 * Create a standardized table
 */
export function createTable(options: TableOptions = {}): Table.Table {
  const styles = {
    default: {
      chars: {
        'top': '─',
        'top-mid': '┬',
        'top-left': '┌',
        'top-right': '┐',
        'bottom': '─',
        'bottom-mid': '┴',
        'bottom-left': '└',
        'bottom-right': '┘',
        'left': '│',
        'left-mid': '├',
        'mid': '─',
        'mid-mid': '┼',
        'right': '│',
        'right-mid': '┤',
        'middle': '│',
      },
      style: {
        head: ['cyan'],
        border: ['gray'],
      },
    },
    compact: {
      chars: {
        'top': '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        'bottom': '',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        'left': '',
        'left-mid': '',
        'mid': '',
        'mid-mid': '',
        'right': '',
        'right-mid': '',
        'middle': ' │ ',
      },
      style: {
        head: ['cyan', 'bold'],
        border: ['gray'],
      },
    },
    borderless: {
      chars: {
        'top': '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        'bottom': '',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        'left': '',
        'left-mid': '',
        'mid': '',
        'mid-mid': '',
        'right': '',
        'right-mid': '',
        'middle': '   ',
      },
      style: {
        head: ['cyan', 'bold'],
        border: [],
      },
    },
  };
  
  const style = options.style || 'default';
  const config = styles[style];
  
  return new Table({
    head: options.head,
    colWidths: options.colWidths,
    wordWrap: options.wordWrap ?? true,
    ...config,
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Pre-configured Tables
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Create a project listing table
 */
export function projectTable(): Table.Table {
  return createTable({
    head: ['Type', 'Description', 'Templates'],
    colWidths: [15, 40, 30],
    style: 'default',
  });
}

/**
 * Create an environment status table
 */
export function environmentTable(): Table.Table {
  return createTable({
    head: ['Tool', 'Version', 'Status'],
    colWidths: [20, 20, 15],
    style: 'default',
  });
}

/**
 * Create a configuration table
 */
export function configTable(): Table.Table {
  return createTable({
    head: ['Key', 'Value', 'Source'],
    colWidths: [30, 40, 15],
    style: 'default',
  });
}

/**
 * Create a template listing table
 */
export function templateTable(): Table.Table {
  return createTable({
    head: ['Name', 'Description', 'Language', 'Files'],
    colWidths: [20, 40, 15, 10],
    style: 'default',
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Table Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Format a status cell with color
 */
export function statusCell(status: 'success' | 'error' | 'warning' | 'info'): string {
  const symbols = {
    success: colors.success('✔'),
    error: colors.error('✖'),
    warning: colors.warning('⚠'),
    info: colors.info('ℹ'),
  };
  return symbols[status];
}

/**
 * Format a boolean cell
 */
export function booleanCell(value: boolean): string {
  return value ? colors.success('Yes') : colors.muted('No');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

/**
 * Format a list into a table-friendly string
 */
export function formatList(items: string[], maxItems = 3): string {
  if (items.length === 0) return colors.muted('none');
  if (items.length <= maxItems) return items.join(', ');
  
  const visible = items.slice(0, maxItems);
  const remaining = items.length - maxItems;
  return `${visible.join(', ')}, +${remaining} more`;
}

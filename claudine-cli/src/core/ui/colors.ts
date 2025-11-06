/**
 * 🎨 Claudine CLI Color Scheme
 * 
 * Standardized color palette for consistent branding
 * Pattern: GitHub CLI + Gemini CLI color schemes
 */

import chalk from 'chalk';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Brand Colors (Claudine CLI Theme)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const colors = {
  // Primary brand colors
  brand: {
    primary: chalk.hex('#FF1493'),    // Hot pink (Claudine's signature)
    secondary: chalk.hex('#8B00FF'),  // Electric purple
    accent: chalk.hex('#FF6B6B'),     // Coral red
  },

  // Semantic colors
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.cyan,
  
  // State indicators
  active: chalk.greenBright,
  inactive: chalk.gray,
  pending: chalk.yellow,
  
  // UI elements
  muted: chalk.gray,
  dim: chalk.dim,
  bold: chalk.bold,
  
  // Syntax highlighting
  keyword: chalk.magenta,
  string: chalk.green,
  number: chalk.cyan,
  boolean: chalk.yellow,
  
  // Interactive elements
  link: chalk.cyan.underline,
  highlight: chalk.bgYellow.black,
  
  // Special effects
  rainbow: (text: string) => {
    const colors = [
      chalk.red,
      chalk.yellow,
      chalk.green,
      chalk.cyan,
      chalk.blue,
      chalk.magenta,
    ];
    return text.split('').map((char, i) => 
      colors[i % colors.length](char)
    ).join('');
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Semantic Text Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const text = {
  // Status messages
  success: (msg: string) => `${chalk.green('✔')} ${chalk.green(msg)}`,
  error: (msg: string) => `${chalk.red('✖')} ${chalk.red(msg)}`,
  warning: (msg: string) => `${chalk.yellow('⚠')} ${chalk.yellow(msg)}`,
  info: (msg: string) => `${chalk.cyan('ℹ')} ${chalk.cyan(msg)}`,
  
  // Actions
  doing: (msg: string) => `${chalk.cyan('→')} ${msg}`,
  done: (msg: string) => `${chalk.green('✓')} ${msg}`,
  failed: (msg: string) => `${chalk.red('✗')} ${msg}`,
  
  // Branding
  brand: (msg: string) => colors.brand.primary(msg),
  logo: '🔥💋',
  
  // Special formatting
  code: (text: string) => chalk.cyan(`\`${text}\``),
  path: (text: string) => chalk.gray(text),
  command: (text: string) => chalk.cyan.bold(text),
  
  // Headers
  header: (text: string) => chalk.bold.underline(text),
  section: (text: string) => chalk.bold(text),
  
  // Lists
  bullet: (text: string) => `  ${chalk.gray('•')} ${text}`,
  numbered: (num: number, text: string) => `  ${chalk.gray(`${num}.`)} ${text}`,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Box Drawing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const box = {
  // Box drawing characters
  chars: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '─',
    vertical: '│',
    leftT: '├',
    rightT: '┤',
    topT: '┬',
    bottomT: '┴',
    cross: '┼',
  },
  
  // Draw a box around text
  wrap: (content: string, padding = 1) => {
    const lines = content.split('\n');
    const maxWidth = Math.max(...lines.map(l => l.length));
    const pad = ' '.repeat(padding);
    
    const top = `${box.chars.topLeft}${box.chars.horizontal.repeat(maxWidth + padding * 2)}${box.chars.topRight}`;
    const bottom = `${box.chars.bottomLeft}${box.chars.horizontal.repeat(maxWidth + padding * 2)}${box.chars.bottomRight}`;
    const middle = lines.map(line => 
      `${box.chars.vertical}${pad}${line.padEnd(maxWidth)}${pad}${box.chars.vertical}`
    );
    
    return [top, ...middle, bottom].join('\n');
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Gradients & Effects
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const effects = {
  // Gradient text (pink to purple)
  gradient: (text: string) => {
    const length = text.length;
    return text.split('').map((char, i) => {
      const ratio = i / length;
      const r = Math.floor(255 * (1 - ratio) + 139 * ratio);
      const g = Math.floor(20 * (1 - ratio) + 0 * ratio);
      const b = Math.floor(147 * (1 - ratio) + 255 * ratio);
      return chalk.rgb(r, g, b)(char);
    }).join('');
  },
  
  // Pulse effect (for loading states)
  pulse: (text: string, frame: number) => {
    const intensity = Math.abs(Math.sin(frame * 0.1));
    const r = Math.floor(255 * intensity);
    const g = Math.floor(20 * intensity);
    const b = Math.floor(147 * intensity);
    return chalk.rgb(r, g, b)(text);
  },
};

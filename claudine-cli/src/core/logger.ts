/**
 * 🔥💋 Claudine CLI Logger System
 * 
 * Inspired by:
 * - Gemini CLI telemetry (research/gemini-cli/packages/core/src/telemetry/)
 * - GitHub CLI structured logging
 * - OpenTelemetry patterns
 * 
 * Features:
 * - Log levels: debug, info, warn, error
 * - Console output with colors (chalk)
 * - File output (~/.claudine/logs/claudine.log)
 * - Structured JSON format for MCP integration
 * - Singleton pattern for global access
 */

import chalk from 'chalk';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  logDir?: string;
  jsonFormat?: boolean;
}

/**
 * Logger class - handles all logging operations
 * 
 * Usage:
 * ```typescript
 * import { logger } from './core/logger';
 * 
 * logger.info('Starting operation');
 * logger.debug('Debug details', { foo: 'bar' });
 * logger.warn('Warning message');
 * logger.error('Error occurred', error);
 * ```
 */
export class Logger {
  private config: LoggerConfig;
  private logFile?: string;
  private logBuffer: LogEntry[] = [];
  private writePromise?: Promise<void>;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      jsonFormat: false,
      ...config,
    };

    // Initialize log file path
    if (this.config.enableFile) {
      const logDir = this.config.logDir || join(homedir(), '.claudine', 'logs');
      this.logFile = join(logDir, 'claudine.log');
      this.ensureLogDir(logDir);
    }
  }

  /**
   * Set log level dynamically
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Enable/disable console output
   */
  setConsole(enabled: boolean): void {
    this.config.enableConsole = enabled;
  }

  /**
   * Enable/disable file output
   */
  setFile(enabled: boolean): void {
    this.config.enableFile = enabled;
  }

  /**
   * Enable/disable JSON format
   */
  setJsonFormat(enabled: boolean): void {
    this.config.jsonFormat = enabled;
  }

  /**
   * Log debug message (verbose mode only)
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    const meta = metadata || {};
    if (error) {
      meta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    this.log(LogLevel.ERROR, message, meta);
  }

  /**
   * Log success message (alias for info with green color)
   */
  success(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, `✅ ${message}`, metadata);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    // Skip if below configured level
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      metadata,
    };

    // Console output
    if (this.config.enableConsole) {
      this.writeConsole(level, message, metadata);
    }

    // File output (async, buffered)
    if (this.config.enableFile && this.logFile) {
      this.logBuffer.push(entry);
      this.flushBuffer();
    }
  }

  /**
   * Write to console with colors
   */
  private writeConsole(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (this.config.jsonFormat) {
      console.log(JSON.stringify({ level: LogLevel[level], message, metadata }));
      return;
    }

    let output: string;
    switch (level) {
      case LogLevel.DEBUG:
        output = chalk.dim(`🔍 ${message}`);
        break;
      case LogLevel.INFO:
        output = chalk.cyan(message);
        break;
      case LogLevel.WARN:
        output = chalk.yellow(`⚠️  ${message}`);
        break;
      case LogLevel.ERROR:
        output = chalk.red(`❌ ${message}`);
        break;
      default:
        output = message;
    }

    console.log(output);

    // Show metadata in verbose mode (debug level)
    if (metadata && this.config.level === LogLevel.DEBUG) {
      console.log(chalk.dim(JSON.stringify(metadata, null, 2)));
    }
  }

  /**
   * Flush log buffer to file (debounced)
   */
  private async flushBuffer(): Promise<void> {
    // Skip if already writing
    if (this.writePromise) {
      return;
    }

    // Debounce writes (100ms)
    await new Promise(resolve => setTimeout(resolve, 100));

    if (this.logBuffer.length === 0 || !this.logFile) {
      return;
    }

    const entries = [...this.logBuffer];
    this.logBuffer = [];

    this.writePromise = this.writeToFile(entries)
      .finally(() => {
        this.writePromise = undefined;
      });

    return this.writePromise;
  }

  /**
   * Write entries to log file
   */
  private async writeToFile(entries: LogEntry[]): Promise<void> {
    if (!this.logFile) return;

    try {
      const lines = entries.map(e => JSON.stringify(e)).join('\n') + '\n';
      await writeFile(this.logFile, lines, { flag: 'a' });
    } catch (error) {
      // Fail silently to avoid log loops
      console.error(chalk.dim(`[Logger] Failed to write to file: ${error.message}`));
    }
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDir(dir: string): void {
    if (!existsSync(dir)) {
      mkdir(dir, { recursive: true }).catch(() => {
        // Fail silently
      });
    }
  }

  /**
   * Wait for all pending writes to complete
   */
  async flush(): Promise<void> {
    if (this.writePromise) {
      await this.writePromise;
    }
    if (this.logBuffer.length > 0 && this.logFile) {
      await this.writeToFile(this.logBuffer);
      this.logBuffer = [];
    }
  }
}

/**
 * Global logger instance (singleton)
 * 
 * Initialized with sensible defaults:
 * - Level: INFO
 * - Console: enabled
 * - File: disabled (enable with logger.setFile(true))
 */
export const logger = new Logger();

/**
 * Configure logger from CLI flags
 * 
 * Usage:
 * ```typescript
 * configureLogger({
 *   verbose: program.opts().verbose,
 *   quiet: program.opts().quiet,
 *   logFile: program.opts().logFile,
 * });
 * ```
 */
export function configureLogger(options: {
  verbose?: boolean;
  quiet?: boolean;
  logFile?: string;
  json?: boolean;
}): void {
  if (options.verbose) {
    logger.setLevel(LogLevel.DEBUG);
  } else if (options.quiet) {
    logger.setLevel(LogLevel.WARN);
  }

  if (options.logFile) {
    logger.setFile(true);
  }

  if (options.json) {
    logger.setJsonFormat(true);
  }
}

/**
 * Create a child logger with context
 * 
 * Usage:
 * ```typescript
 * const cmdLogger = createLogger({ command: 'project new' });
 * cmdLogger.info('Creating project');
 * ```
 */
export function createLogger(metadata: Record<string, any>): Pick<Logger, 'debug' | 'info' | 'warn' | 'error' | 'success'> {
  return {
    debug: (msg: string, meta?: Record<string, any>) =>
      logger.debug(msg, { ...metadata, ...meta }),
    info: (msg: string, meta?: Record<string, any>) =>
      logger.info(msg, { ...metadata, ...meta }),
    warn: (msg: string, meta?: Record<string, any>) =>
      logger.warn(msg, { ...metadata, ...meta }),
    error: (msg: string, err?: Error, meta?: Record<string, any>) =>
      logger.error(msg, err, { ...metadata, ...meta }),
    success: (msg: string, meta?: Record<string, any>) =>
      logger.success(msg, { ...metadata, ...meta }),
  };
}

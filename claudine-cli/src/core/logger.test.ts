/**
 * Logger Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { logger, configureLogger, LogLevel } from './logger.js';

describe('Logger', () => {
  beforeEach(() => {
    // Reset logger to default state before each test
    configureLogger({ verbose: false, quiet: false });
  });

  describe('Configuration', () => {
    it('should have configureLogger function', () => {
      expect(typeof configureLogger).toBe('function');
    });

    it('should accept verbose configuration', () => {
      expect(() => {
        configureLogger({ verbose: true });
      }).not.toThrow();
    });

    it('should accept quiet configuration', () => {
      expect(() => {
        configureLogger({ quiet: true });
      }).not.toThrow();
    });

    it('should accept empty configuration', () => {
      expect(() => {
        configureLogger({});
      }).not.toThrow();
    });
  });

  describe('Logging Methods', () => {
    it('should have debug method', () => {
      expect(typeof logger.debug).toBe('function');
    });

    it('should have info method', () => {
      expect(typeof logger.info).toBe('function');
    });

    it('should have warn method', () => {
      expect(typeof logger.warn).toBe('function');
    });

    it('should have error method', () => {
      expect(typeof logger.error).toBe('function');
    });

    it('should log messages without throwing', () => {
      expect(() => {
        logger.info('Test message');
        logger.debug('Debug message');
        logger.warn('Warning message');
        logger.error('Error message');
      }).not.toThrow();
    });

    it('should log messages with metadata without throwing', () => {
      expect(() => {
        logger.info('Test message', { key: 'value' });
        logger.debug('Debug message', { debug: true });
        logger.warn('Warning message', { warning: true });
      }).not.toThrow();
    });

    it('should log error messages with Error objects without throwing', () => {
      const error = new Error('Test error');
      expect(() => {
        logger.error('Error occurred', error);
        logger.error('Error with metadata', error, { context: 'test' });
      }).not.toThrow();
    });
  });

  describe('LogLevel Enum', () => {
    it('should export LogLevel enum', () => {
      expect(LogLevel).toBeDefined();
    });

    it('should have correct log level values', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
      expect(LogLevel.SILENT).toBe(4);
    });
  });
});


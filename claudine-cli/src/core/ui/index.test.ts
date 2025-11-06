/**
 * UI System Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { colors, text } from '../ui/index.js';

describe('UI System', () => {
  describe('Colors', () => {
    it('should have brand colors', () => {
      expect(colors.brand).toBeDefined();
      expect(colors.brand.primary).toBeDefined();
      expect(colors.brand.secondary).toBeDefined();
      expect(colors.brand.accent).toBeDefined();
    });

    it('should have semantic colors', () => {
      expect(colors.success).toBeDefined();
      expect(colors.error).toBeDefined();
      expect(colors.warning).toBeDefined();
      expect(colors.info).toBeDefined();
    });

    it('should have utility colors', () => {
      expect(colors.dim).toBeDefined();
      expect(colors.bold).toBeDefined();
    });

    it('should apply colors to text', () => {
      const coloredText = colors.brand.primary('Test');
      expect(typeof coloredText).toBe('string');
      expect(coloredText).toContain('Test');
    });

    it('should chain color modifiers', () => {
      const text = colors.bold(colors.brand.primary('Test'));
      expect(typeof text).toBe('string');
    });
  });

  describe('Text', () => {
    it('should have logo constant', () => {
      expect(text.logo).toBe('🔥💋');
    });

    it('should have section method', () => {
      expect(typeof text.section).toBe('function');
    });

    it('should format section headers', () => {
      const header = text.section('Test Section');
      expect(typeof header).toBe('string');
      expect(header).toContain('Test Section');
    });
  });

  describe('Color Function Types', () => {
    it('should accept strings and return strings', () => {
      const input = 'test';
      const output = colors.success(input);
      expect(typeof output).toBe('string');
    });

    it('should handle empty strings', () => {
      const output = colors.success('');
      expect(typeof output).toBe('string');
    });

    it('should handle special characters', () => {
      const output = colors.success('✓ Success!');
      expect(typeof output).toBe('string');
    });
  });
});

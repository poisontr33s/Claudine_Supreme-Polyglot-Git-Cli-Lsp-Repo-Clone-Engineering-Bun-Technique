/**
 * Language Detection Engine
 * 
 * Detects programming languages in a project by scanning for marker files.
 * Cross-platform native TypeScript implementation.
 * 
 * Detection Strategy:
 * - Scan directory for specific files (pyproject.toml, Cargo.toml, etc.)
 * - Assign confidence scores based on file presence
 * - Support multi-language projects (Python + Rust + Bun, etc.)
 */

import { readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

export interface DetectedLanguage {
  name: string;
  confidence: number;        // 0.0 to 1.0
  evidence: string[];        // Files that triggered detection
  category: string;          // 'primary' | 'build-tool' | 'dependency'
}

export interface LanguageDetectionResult {
  languages: DetectedLanguage[];
  projectPath: string;
  multiLanguage: boolean;
}

interface LanguageMarker {
  name: string;
  category: string;
  files: string[];           // Marker files to detect
  directories?: string[];    // Marker directories
  scoreFunction: (matches: string[]) => number;
}

/**
 * Language detection markers
 * 
 * Each language has marker files that indicate its presence.
 * Confidence scoring prioritizes more definitive markers.
 */
const LANGUAGE_MARKERS: LanguageMarker[] = [
  // Python
  {
    name: 'python',
    category: 'primary',
    files: ['pyproject.toml', 'requirements.txt', 'setup.py', 'Pipfile', 'poetry.lock', 'uv.lock'],
    directories: ['.venv', 'venv', '__pycache__'],
    scoreFunction: (matches) => {
      if (matches.includes('pyproject.toml')) return 1.0;
      if (matches.includes('uv.lock')) return 0.95;
      if (matches.includes('poetry.lock')) return 0.95;
      if (matches.includes('Pipfile')) return 0.9;
      if (matches.includes('requirements.txt')) return 0.85;
      if (matches.includes('setup.py')) return 0.8;
      return 0.5;
    }
  },

  // Rust
  {
    name: 'rust',
    category: 'primary',
    files: ['Cargo.toml', 'Cargo.lock'],
    directories: ['target'],
    scoreFunction: (matches) => {
      if (matches.includes('Cargo.toml')) return 1.0;
      if (matches.includes('Cargo.lock')) return 0.9;
      return 0.0;
    }
  },

  // Bun / TypeScript
  {
    name: 'bun',
    category: 'primary',
    files: ['bun.lockb', 'bunfig.toml'],
    scoreFunction: (matches) => {
      if (matches.includes('bun.lockb')) return 1.0;
      if (matches.includes('bunfig.toml')) return 0.95;
      return 0.0;
    }
  },

  // TypeScript (general)
  {
    name: 'typescript',
    category: 'primary',
    files: ['tsconfig.json', 'ts config.build.json'],
    scoreFunction: (matches) => {
      if (matches.includes('tsconfig.json')) return 0.9;
      return 0.5;
    }
  },

  // JavaScript / Node.js
  {
    name: 'javascript',
    category: 'primary',
    files: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'],
    directories: ['node_modules'],
    scoreFunction: (matches) => {
      if (matches.includes('package.json')) return 0.8;
      if (matches.includes('package-lock.json')) return 0.7;
      if (matches.includes('yarn.lock')) return 0.7;
      if (matches.includes('pnpm-lock.yaml')) return 0.7;
      return 0.5;
    }
  },

  // Ruby
  {
    name: 'ruby',
    category: 'primary',
    files: ['Gemfile', 'Gemfile.lock', '.ruby-version'],
    directories: ['vendor'],
    scoreFunction: (matches) => {
      if (matches.includes('Gemfile')) return 1.0;
      if (matches.includes('Gemfile.lock')) return 0.9;
      if (matches.includes('.ruby-version')) return 0.7;
      return 0.5;
    }
  },

  // Go
  {
    name: 'go',
    category: 'primary',
    files: ['go.mod', 'go.sum', 'go.work'],
    scoreFunction: (matches) => {
      if (matches.includes('go.mod')) return 1.0;
      if (matches.includes('go.sum')) return 0.9;
      if (matches.includes('go.work')) return 0.95;
      return 0.0;
    }
  },

  // C/C++
  {
    name: 'cpp',
    category: 'primary',
    files: ['CMakeLists.txt', 'Makefile', 'meson.build', '.clang-format'],
    scoreFunction: (matches) => {
      if (matches.includes('CMakeLists.txt')) return 0.9;
      if (matches.includes('Makefile')) return 0.7;
      if (matches.includes('meson.build')) return 0.85;
      return 0.5;
    }
  },

  // Java
  {
    name: 'java',
    category: 'primary',
    files: ['pom.xml', 'build.gradle', 'build.gradle.kts', 'settings.gradle'],
    scoreFunction: (matches) => {
      if (matches.includes('pom.xml')) return 0.95;
      if (matches.includes('build.gradle')) return 0.95;
      if (matches.includes('build.gradle.kts')) return 0.95;
      return 0.5;
    }
  },

  // C#
  {
    name: 'csharp',
    category: 'primary',
    files: ['*.csproj', '*.sln', 'global.json'],
    scoreFunction: (matches) => {
      if (matches.some(m => m.endsWith('.csproj'))) return 1.0;
      if (matches.some(m => m.endsWith('.sln'))) return 0.95;
      if (matches.includes('global.json')) return 0.8;
      return 0.0;
    }
  },

  // PHP
  {
    name: 'php',
    category: 'primary',
    files: ['composer.json', 'composer.lock'],
    directories: ['vendor'],
    scoreFunction: (matches) => {
      if (matches.includes('composer.json')) return 1.0;
      if (matches.includes('composer.lock')) return 0.9;
      return 0.0;
    }
  }
];

/**
 * Detect programming languages in a project
 * 
 * @param projectPath - Path to project directory
 * @param options - Detection options
 * @returns Detected languages sorted by confidence
 */
export async function detectLanguages(
  projectPath: string,
  options: {
    includeDirectories?: boolean;  // Scan for directory markers (default: true)
    minConfidence?: number;        // Minimum confidence threshold (default: 0.5)
    recursive?: boolean;           // Recursively scan subdirectories (default: false)
  } = {}
): Promise<LanguageDetectionResult> {
  const {
    includeDirectories = true,
    minConfidence = 0.5,
    recursive = false
  } = options;

  // Validate project path
  if (!existsSync(projectPath)) {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }

  const detectedLanguages: DetectedLanguage[] = [];

  // Scan directory for files
  const files = scanDirectory(projectPath, recursive);

  // Check each language marker
  for (const marker of LANGUAGE_MARKERS) {
    const matchedFiles: string[] = [];

    // Check file markers
    for (const markerFile of marker.files) {
      // Handle glob patterns (e.g., *.csproj)
      if (markerFile.includes('*')) {
        const regex = new RegExp('^' + markerFile.replace(/\*/g, '.*') + '$');
        const globMatches = files.filter(f => regex.test(path.basename(f)));
        if (globMatches.length > 0) {
          matchedFiles.push(markerFile);
        }
      } else {
        // Exact file match
        if (files.includes(markerFile) || files.some(f => path.basename(f) === markerFile)) {
          matchedFiles.push(markerFile);
        }
      }
    }

    // Check directory markers (if enabled)
    if (includeDirectories && marker.directories) {
      for (const markerDir of marker.directories) {
        const dirPath = path.join(projectPath, markerDir);
        if (existsSync(dirPath)) {
          matchedFiles.push(markerDir);
        }
      }
    }

    // Calculate confidence if matches found
    if (matchedFiles.length > 0) {
      const confidence = marker.scoreFunction(matchedFiles);
      
      if (confidence >= minConfidence) {
        detectedLanguages.push({
          name: marker.name,
          confidence,
          evidence: matchedFiles,
          category: marker.category
        });
      }
    }
  }

  // Sort by confidence (descending)
  detectedLanguages.sort((a, b) => b.confidence - a.confidence);

  return {
    languages: detectedLanguages,
    projectPath,
    multiLanguage: detectedLanguages.length > 1
  };
}

/**
 * Scan directory for files
 * 
 * @param dirPath - Directory to scan
 * @param recursive - Recursively scan subdirectories
 * @returns Array of filenames (or relative paths if recursive)
 */
function scanDirectory(dirPath: string, recursive: boolean): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dirPath);

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);

      // Skip common ignored directories
      if (isIgnoredDirectory(entry)) {
        continue;
      }

      try {
        const stat = statSync(fullPath);

        if (stat.isFile()) {
          files.push(entry);
        } else if (stat.isDirectory() && recursive) {
          // Recursively scan subdirectory
          const subFiles = scanDirectory(fullPath, recursive);
          files.push(...subFiles.map(f => path.join(entry, f)));
        }
      } catch {
        // Skip files/directories we can't stat
        continue;
      }
    }
  } catch (error) {
    // If we can't read the directory, return empty array
    return [];
  }

  return files;
}

/**
 * Check if directory should be ignored during scanning
 */
function isIgnoredDirectory(dirName: string): boolean {
  const ignored = [
    '.git',
    '.github',
    'node_modules',
    '__pycache__',
    '.venv',
    'venv',
    'target',
    'build',
    'dist',
    '.turbo',
    '.cache',
    'coverage',
    '.pytest_cache',
    '.mypy_cache',
    '.ruff_cache'
  ];

  return ignored.includes(dirName);
}

/**
 * Get primary language (highest confidence)
 */
export function getPrimaryLanguage(result: LanguageDetectionResult): DetectedLanguage | null {
  return result.languages[0] || null;
}

/**
 * Check if specific language was detected
 */
export function hasLanguage(result: LanguageDetectionResult, languageName: string): boolean {
  return result.languages.some(lang => lang.name.toLowerCase() === languageName.toLowerCase());
}

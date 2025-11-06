/**
 * CLIT Tool Registry - Platform-Specific Tool Definitions
 * 
 * This registry maps logical tool names to platform-specific implementations.
 * On Windows, most tools delegate to PowerShell scripts (claudineENV*.ps1).
 * On Linux/macOS, tools use native TypeScript implementations.
 * 
 * Architecture: Orchestration over Reimplementation
 */

export type PlatformType = 'win32' | 'linux' | 'darwin';
export type ToolType = 'powershell' | 'native' | 'shell-script';

export interface PowerShellToolDef {
  type: 'powershell';
  script: string;          // e.g., 'claudineENV_F.ps1'
  function?: string;       // e.g., 'new-python' (if invoking specific function)
  args?: string[];         // e.g., ['-ShowVersions', '-LoadFunctions']
}

export interface NativeToolDef {
  type: 'native';
  module: string;          // e.g., '@claudine/detector'
  function: string;        // e.g., 'detectLanguages'
}

export interface ShellScriptToolDef {
  type: 'shell-script';
  script: string;          // e.g., 'activate.sh'
  args?: string[];
}

export type ToolDefinition = PowerShellToolDef | NativeToolDef | ShellScriptToolDef;

export interface ToolRegistryEntry {
  description: string;
  platforms: {
    win32?: ToolDefinition;
    linux?: ToolDefinition;
    darwin?: ToolDefinition;
    all?: ToolDefinition;  // Cross-platform tool
  };
}

/**
 * CLIT Tool Registry
 * 
 * Maps logical tool names to platform-specific implementations.
 * CLI commands invoke these tools via the orchestrator.
 */
export const TOOL_REGISTRY: Record<string, ToolRegistryEntry> = {
  // ============================================================================
  // ENVIRONMENT MANAGEMENT
  // ============================================================================
  
  'environment-activate': {
    description: 'Activate polyglot environment (set PATH, load tools)',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudineENV.ps1',
        args: ['-LoadFunctions']  // Auto-load function library
      },
      linux: {
        type: 'shell-script',
        script: 'activate.sh'
      },
      darwin: {
        type: 'shell-script',
        script: 'activate.sh'
      }
    }
  },

  'environment-versions': {
    description: 'Show all tool versions',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudineENV.ps1',
        args: ['-ShowVersions']
      },
      all: {
        type: 'native',
        module: '@claudine/versions',
        function: 'getVersions'
      }
    }
  },

  'health-check': {
    description: 'Verify all polyglot tools are available and functional',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudineENV_F.ps1',
        function: 'health-check'
      },
      all: {
        type: 'native',
        module: '@claudine/health',
        function: 'runHealthCheck'
      }
    }
  },

  // ============================================================================
  // PROJECT CREATION
  // ============================================================================

  'project-create-python': {
    description: 'Create Python project with UV and pyproject.toml',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudineENV_F.ps1',
        function: 'new-python'
      },
      all: {
        type: 'native',
        module: '@claudine/project-creators',
        function: 'createPythonProject'
      }
    }
  },

  'project-create-rust': {
    description: 'Create Rust project with Cargo',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudineENV_F.ps1',
        function: 'new-rust'
      },
      all: {
        type: 'native',
        module: '@claudine/project-creators',
        function: 'createRustProject'
      }
    }
  },

  'project-create-bun': {
    description: 'Create Bun/TypeScript project',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudineENV_F.ps1',
        function: 'new-bun'
      },
      all: {
        type: 'native',
        module: '@claudine/project-creators',
        function: 'createBunProject'
      }
    }
  },

  'project-create-ruby': {
    description: 'Create Ruby gem with Bundler',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudineENV_F.ps1',
        function: 'new-ruby'
      },
      all: {
        type: 'native',
        module: '@claudine/project-creators',
        function: 'createRubyProject'
      }
    }
  },

  'project-create-react': {
    description: 'Create React project with Bun native Fast Refresh',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudineENV_F.ps1',
        function: 'new-react'
      },
      all: {
        type: 'native',
        module: '@claudine/project-creators',
        function: 'createReactProject'
      }
    }
  },

  'project-create-go': {
    description: 'Create Go module with go mod init',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudineENV_F.ps1',
        function: 'new-go'
      },
      all: {
        type: 'native',
        module: '@claudine/project-creators',
        function: 'createGoProject'
      }
    }
  },

  // ============================================================================
  // DETECTION & ANALYSIS
  // ============================================================================

  'detect-languages': {
    description: 'Detect programming languages in project by scanning for markers',
    platforms: {
      all: {
        type: 'native',
        module: '@claudine/detector',
        function: 'detectLanguages'
      }
    }
  },

  'detect-platform': {
    description: 'Detect current operating system and environment',
    platforms: {
      all: {
        type: 'native',
        module: '@claudine/detector',
        function: 'detectPlatform'
      }
    }
  },

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  'config-load': {
    description: 'Load .poly_gluttony/config.json configuration',
    platforms: {
      all: {
        type: 'native',
        module: '@claudine/config',
        function: 'loadConfig'
      }
    }
  },

  'config-init': {
    description: 'Initialize .poly_gluttony/ structure and config.json',
    platforms: {
      all: {
        type: 'native',
        module: '@claudine/config',
        function: 'initConfig'
      }
    }
  },

  'config-validate': {
    description: 'Validate .poly_gluttony/ structure and configuration',
    platforms: {
      all: {
        type: 'native',
        module: '@claudine/config',
        function: 'validateConfig'
      }
    }
  },

  // ============================================================================
  // ADVANCED (from claudine_pwsh_goddess.ps1)
  // ============================================================================

  'deploy-vercel': {
    description: 'Deploy project to Vercel (Bun + React optimized)',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudine_pwsh_goddess.ps1',
        function: 'deploy-vercel'
      }
    }
  },

  'css-engine-set': {
    description: 'Set CSS engine (postcss/lightning/hybrid)',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudine_pwsh_goddess.ps1',
        function: 'css-engine-set'
      }
    }
  },

  'audit-system': {
    description: 'Run comprehensive system audit',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudine_pwsh_goddess.ps1',
        function: 'audit-system'
      }
    }
  },

  'sync-workspace': {
    description: 'Integrate with consciousness archaeology network',
    platforms: {
      win32: {
        type: 'powershell',
        script: 'claudine_pwsh_goddess.ps1',
        function: 'sync-workspace'
      }
    }
  }
};

/**
 * Get tool definition for current platform
 */
export function getToolDefinition(toolName: string): ToolDefinition | null {
  const entry = TOOL_REGISTRY[toolName];
  if (!entry) return null;

  const platform = process.platform as PlatformType;
  
  // Try platform-specific first
  if (entry.platforms[platform]) {
    return entry.platforms[platform]!;
  }
  
  // Fall back to cross-platform
  if (entry.platforms.all) {
    return entry.platforms.all;
  }

  return null;
}

/**
 * Check if tool is available on current platform
 */
export function isToolAvailable(toolName: string): boolean {
  return getToolDefinition(toolName) !== null;
}

/**
 * List all available tools for current platform
 */
export function listAvailableTools(): Array<{ name: string; description: string }> {
  const platform = process.platform as PlatformType;
  
  return Object.entries(TOOL_REGISTRY)
    .filter(([name]) => isToolAvailable(name))
    .map(([name, entry]) => ({
      name,
      description: entry.description
    }));
}

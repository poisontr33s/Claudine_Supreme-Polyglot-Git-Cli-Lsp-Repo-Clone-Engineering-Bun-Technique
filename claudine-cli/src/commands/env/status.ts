/**
 * `claudine env status` command
 *
 * Displays comprehensive environment activation status:
 * - Activation state (claudineENV.ps1 marker check)
 * - Available polyglot tools (Python, Rust, Ruby, Bun, Go)
 * - Tool versions
 * - Missing tools warnings
 *
 * @module commands/env/status
 */

import { Command } from "commander";
import { displayEnvironmentStatus } from "../../utils/environment.js";

/**
 * `claudine env status` command
 *
 * Usage:
 * ```bash
 * claudine env status
 * ```
 *
 * Output:
 * ```
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  🔥💋 CLAUDINE ENVIRONMENT STATUS 💋🔥                      ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * ✅ Environment: Activated
 *    Source: claudineENV.ps1
 *    Version: 1.1.0
 *    Root: C:\Users\eldno\PsychoNoir-Kontrapunkt\.poly_gluttony
 *
 * 📦 Polyglot Tools:
 *
 *    Language:
 *       ✅ python (Python 3.14.0)
 *       ✅ rustc (rustc 1.91.0)
 *       ✅ ruby (ruby 3.4.7)
 *       ✅ bun (v1.3.1)
 *       ✅ go (go version go1.23.3 windows/amd64)
 *
 *    Package Manager:
 *       ✅ uv (uv 0.9.5)
 *       ✅ cargo (cargo 1.91.0)
 *       ✅ bundle (Bundler version 2.7.2)
 *
 *    LSP:
 *       ✅ gopls (v0.20.0)
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Status: 14/14 tools available (100%)
 * 🎉 All systems operational!
 * ```
 */
export const statusCommand = new Command("status")
  .description("Show Claudine polyglot environment status")
  .action(async () => {
    await displayEnvironmentStatus();
  });

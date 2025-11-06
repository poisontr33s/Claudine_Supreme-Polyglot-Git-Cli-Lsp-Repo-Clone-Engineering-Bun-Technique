/**
 * Plugin List Command
 * 
 * Display installed plugins with their status.
 * 
 * @module commands/plugin/list
 */

import { Command } from "commander";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PluginManager } from "../../core/plugin/index.js";
import { colors, text, withSpinner } from "../../core/ui/index.js";

export const listCommand = new Command("list")
  .alias("ls")
  .description("List installed plugins")
  .option("-a, --all", "Show all plugins (including inactive)")
  .option("-v, --verbose", "Show detailed plugin information")
  .option("--json", "Output in JSON format")
  .action(listAction);

interface ListOptions {
  all?: boolean;
  verbose?: boolean;
  json?: boolean;
}

async function listAction(options: ListOptions): Promise<void> {
  const manager = PluginManager.getInstance();
  
  // Discover and load plugins
  const { found, errors } = await withSpinner(
    "Discovering plugins",
    async () => await manager.discover()
  );
  
  // Load discovered plugins
  for (const manifest of found) {
    // Find plugin path
    const searchPaths = [
      join(process.cwd(), ".claudine", "plugins"),
      join(process.env.HOME || process.env.USERPROFILE || "", ".claudine", "plugins"),
      join(process.env.HOME || process.env.USERPROFILE || "", ".config", "claudine", "plugins"),
      join(process.env.HOME || process.env.USERPROFILE || "", ".local", "share", "claudine", "plugins"),
    ];
    
    let pluginPath = "";
    for (const searchPath of searchPaths) {
      const candidatePath = join(searchPath, manifest.id);
      if (existsSync(candidatePath)) {
        pluginPath = candidatePath;
        break;
      }
    }
    
    if (!pluginPath) {
      continue;
    }
    
    // Load and activate plugin if not already loaded
    if (!manager.isLoaded(manifest.id)) {
      const loadResult = await manager.load(pluginPath);
      if (loadResult.success && loadResult.plugin) {
        await manager.activate(loadResult.plugin, pluginPath);
      }
    }
  }
  
  const plugins = options.all ? manager.getAllPlugins() : manager.getActivePlugins();
  
  if (options.json) {
    console.log(JSON.stringify(plugins.map(p => ({
      id: p.manifest.id,
      name: p.manifest.name,
      version: p.manifest.version,
      description: p.manifest.description,
      author: p.manifest.author,
      active: p.active,
      capabilities: p.manifest.capabilities,
    })), null, 2));
    return;
  }
  
  // Display header
  console.log();
  console.log(`${text.logo} ${colors.brand.primary("CLAUDINE PLUGINS")}`);
  console.log();
  
  if (plugins.length === 0) {
    console.log(colors.dim("  No plugins installed."));
    console.log();
    console.log(colors.dim("  💡 Install plugins from:"));
    console.log(colors.dim("     • npm: npm install -g @claudine/plugin-<name>"));
    console.log(colors.dim("     • Local: Create plugin in ~/.claudine/plugins/"));
    console.log();
    return;
  }
  
  // Group by status
  const activePlugins = plugins.filter(p => p.active);
  const inactivePlugins = plugins.filter(p => !p.active);
  
  // Display active plugins
  if (activePlugins.length > 0) {
    console.log(colors.success("✓ ACTIVE PLUGINS:"));
    console.log();
    
    for (const entry of activePlugins) {
      const { manifest } = entry;
      
      console.log(`  ${colors.brand.primary("●")} ${colors.bold(manifest.name)} ${colors.dim(`v${manifest.version}`)}`);
      console.log(`    ${colors.dim(manifest.description)}`);
      
      // Always show verbose details for now
      console.log(`    ${colors.dim("ID:")} ${manifest.id}`);
      if (manifest.author) {
        console.log(`    ${colors.dim("Author:")} ${manifest.author}`);
      }
      if (manifest.capabilities) {
        const caps = [];
        if (manifest.capabilities.commands) caps.push("commands");
        if (manifest.capabilities.templates) caps.push("templates");
        if (manifest.capabilities.languages) caps.push("languages");
        if (manifest.capabilities.tools) caps.push("tools");
        if (caps.length > 0) {
          console.log(`    ${colors.dim("Capabilities:")} ${caps.join(", ")}`);
        }
      }
      
      console.log();
    }
  }
  
  // Display inactive plugins
  if (options.all && inactivePlugins.length > 0) {
    console.log(colors.dim("○ INACTIVE PLUGINS:"));
    console.log();
    
    for (const entry of inactivePlugins) {
      const { manifest } = entry;
      
      console.log(`  ${colors.dim("○")} ${colors.dim(manifest.name)} ${colors.dim(`v${manifest.version}`)}`);
      console.log(`    ${colors.dim(manifest.description)}`);
      console.log();
    }
  }
  
  // Summary
  console.log(colors.dim("─".repeat(60)));
  console.log();
  console.log(`${colors.dim("Summary:")}`);
  console.log(`  ${colors.dim("•")} Active: ${colors.success(activePlugins.length.toString())}`);
  if (options.all) {
    console.log(`  ${colors.dim("•")} Inactive: ${colors.dim(inactivePlugins.length.toString())}`);
    console.log(`  ${colors.dim("•")} Total: ${colors.brand.primary(plugins.length.toString())}`);
  }
  console.log();
}

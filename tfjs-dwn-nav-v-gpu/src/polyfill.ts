/**
 * tfjs-dwn-nav-v-gpu
 * navigator.gpu polyfill for Bun via Dawn/Vulkan
 * 
 * Stack:
 * - Dawn (WebGPU implementation)
 * - Vulkan (Linux), DirectX 12 (Windows), Metal (macOS)
 * 
 * Resource Management:
 * This polyfill manages unmanaged C++/Dawn resources via FFI.
 * The JavaScript GC is unaware of VRAM allocations, so explicit
 * disposal is required to prevent memory leaks in long-running processes.
 */

import { GPU } from 'bun-webgpu';

declare global {
  var navigator: {
    gpu: GPU;
  };
}

// Track active resources for lifecycle management
let activeDevice: GPUDevice | null = null;
let activeAdapter: GPUAdapter | null = null;

/**
 * Initialize navigator.gpu polyfill
 * Uses Dawn FFI bindings to expose WebGPU API in Bun
 */
export async function initializeWebGPU(): Promise<GPU> {
  if (typeof globalThis.navigator === 'undefined') {
    globalThis.navigator = {} as typeof navigator;
  }

  if (!globalThis.navigator.gpu) {
    const gpu = new GPU();
    globalThis.navigator.gpu = gpu;
    
    // Verify GPU adapter is available
    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      throw new Error(
        'tfjs-dwn-nav-v-gpu: No GPU adapter found. ' +
        'Ensure Vulkan/DirectX12/Metal drivers are installed.'
      );
    }

    // Track the active adapter for lifecycle management
    activeAdapter = adapter;

    const adapterInfo = await adapter.requestAdapterInfo();
    console.log(`[tfjs-dwn-nav-v-gpu] GPU initialized: ${adapterInfo.device}`);
  }

  return globalThis.navigator.gpu;
}

/**
 * Check if WebGPU is available
 */
export function isWebGPUAvailable(): boolean {
  return typeof globalThis.navigator?.gpu !== 'undefined';
}

/**
 * Get GPU adapter info
 */
export async function getGPUInfo(): Promise<GPUAdapterInfo | null> {
  if (!isWebGPUAvailable()) {
    return null;
  }
  
  const adapter = await navigator.gpu.requestAdapter();
  return adapter ? await adapter.requestAdapterInfo() : null;
}

/**
 * Track device creation for lifecycle management
 * This wrapper ensures we can clean up the device on shutdown
 */
export function trackDevice(device: GPUDevice): GPUDevice {
  activeDevice = device;
  return device;
}

/**
 * Forcefully destroys Dawn resources to free VRAM.
 * 
 * CRITICAL: Call this before process exit or when reloading models
 * to prevent VRAM leaks in long-running processes (AI agents, loops).
 * 
 * The JavaScript GC cannot track VRAM held by unmanaged C++/Dawn pointers,
 * so explicit disposal is required to avoid OUT_OF_MEMORY crashes.
 * 
 * @example
 * ```typescript
 * import { disposeWebGPUBackend } from 'tfjs-dwn-nav-v-gpu';
 * 
 * // Before exiting or reloading
 * disposeWebGPUBackend();
 * ```
 */
export function disposeWebGPUBackend(): void {
  if (activeDevice) {
    console.log('[tfjs-dwn-nav-v-gpu] Destroying active GPU device...');
    try {
      activeDevice.destroy();
    } catch (error) {
      console.warn('[tfjs-dwn-nav-v-gpu] Error destroying device:', error);
    }
    activeDevice = null;
  }
  
  // Adapters generally persist, but we null the reference
  activeAdapter = null;
  
  console.log('[tfjs-dwn-nav-v-gpu] WebGPU backend disposed');
}

/**
 * Get the currently active GPU device (if any)
 * @returns The active GPUDevice or null
 */
export function getActiveDevice(): GPUDevice | null {
  return activeDevice;
}

/**
 * Get the currently active GPU adapter (if any)
 * @returns The active GPUAdapter or null
 */
export function getActiveAdapter(): GPUAdapter | null {
  return activeAdapter;
}

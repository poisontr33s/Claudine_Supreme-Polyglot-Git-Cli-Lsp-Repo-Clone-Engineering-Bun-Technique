/**
 * tfjs-dwn-nav-v-gpu
 * navigator.gpu polyfill for Bun via Dawn/Vulkan
 * 
 * Stack:
 * - Dawn (WebGPU implementation)
 * - Vulkan (Linux), DirectX 12 (Windows), Metal (macOS)
 */

import { GPU } from 'bun-webgpu';

declare global {
  var navigator: {
    gpu: GPU;
  };
}

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

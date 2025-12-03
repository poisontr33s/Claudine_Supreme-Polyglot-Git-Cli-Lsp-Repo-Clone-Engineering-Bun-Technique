/**
 * tfjs-dwn-nav-v-gpu
 * 
 * GPU-accelerated TensorFlow.js for Bun
 * 
 * Stack:
 * - tfjs    : TensorFlow.js for Bun
 * - dwn     : Dawn (WebGPU implementation) for Bun
 * - nav     : navigator.gpu polyfill for Bun
 * - v       : Vulkan for Bun
 * - gpu     : GPU acceleration for Bun
 * 
 * Architecture:
 * Bun (Zig) -> FFI -> Dawn (C++) -> Vulkan/DirectX12/Metal -> GPU
 * 
 * This runs NATIVE Vulkan/DirectX12/Metal (not browser WebGPU).
 * No window manager required - pure headless compute.
 * 
 * @example
 * ```typescript
 * import * as tf from 'tfjs-dwn-nav-v-gpu';
 * 
 * // Use tf.tidy() for automatic tensor cleanup
 * const result = tf.tidy(() => {
 *   const model = await tf.loadLayersModel('model.json');
 *   return model.predict(tf.tensor2d([[1, 2, 3, 4]]));
 * });
 * 
 * console.log(result.dataSync()); // Data on CPU, VRAM freed
 * ```
 */

import { 
  initializeWebGPU, 
  isWebGPUAvailable, 
  getGPUInfo,
  disposeWebGPUBackend,
  getActiveDevice,
  getActiveAdapter
} from './polyfill';

// Initialize Dawn/Vulkan WebGPU polyfill before importing tfjs
await initializeWebGPU();

// Import TensorFlow.js core
import * as tf from '@tensorflow/tfjs';

// Import and register WebGPU backend
import '@tensorflow/tfjs-backend-webgpu';

// Set WebGPU as the active backend
await tf.setBackend('webgpu');
await tf.ready();

// Log backend info
console.log(`[tfjs-dwn-nav-v-gpu] Backend: ${tf.getBackend()}`);

// Re-export all of TensorFlow.js
export * from '@tensorflow/tfjs';

// Export default tf namespace
export default tf;

// Export utility functions
export { 
  isWebGPUAvailable, 
  getGPUInfo, 
  disposeWebGPUBackend,
  getActiveDevice,
  getActiveAdapter
};

// Export backend info helper
export function getBackendInfo() {
  return {
    backend: tf.getBackend(),
    webgpu: isWebGPUAvailable(),
    ready: true,
  };
}

/**
 * Graceful shutdown handler for process termination
 * Ensures proper cleanup of VRAM resources before exit
 */
function cleanExit(signal: string) {
  console.log(`\n[tfjs-dwn-nav-v-gpu] Received ${signal}, shutting down WebGPU bridge...`);
  
  try {
    // Clear TensorFlow.js tensors from memory
    tf.disposeVariables();
    console.log('[tfjs-dwn-nav-v-gpu] TensorFlow.js variables disposed');
  } catch (error) {
    console.warn('[tfjs-dwn-nav-v-gpu] Error disposing TF variables:', error);
  }
  
  // Destroy native Dawn device to free VRAM
  disposeWebGPUBackend();
  
  console.log('[tfjs-dwn-nav-v-gpu] Shutdown complete');
  process.exit(0);
}

// Register signal handlers for graceful shutdown
// Prevents zombie GPU buffers in the driver
process.on('SIGINT', () => cleanExit('SIGINT'));
process.on('SIGTERM', () => cleanExit('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[tfjs-dwn-nav-v-gpu] Uncaught exception:', error);
  disposeWebGPUBackend();
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[tfjs-dwn-nav-v-gpu] Unhandled rejection:', reason);
  disposeWebGPUBackend();
  process.exit(1);
});

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
 * @example
 * ```typescript
 * import * as tf from 'tfjs-dwn-nav-v-gpu';
 * 
 * const model = await tf.loadLayersModel('model.json');
 * const result = model.predict(tf.tensor2d([[1, 2, 3, 4]]));
 * ```
 */

import { initializeWebGPU, isWebGPUAvailable, getGPUInfo } from './polyfill';

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
export { isWebGPUAvailable, getGPUInfo };

// Export backend info helper
export function getBackendInfo() {
  return {
    backend: tf.getBackend(),
    webgpu: isWebGPUAvailable(),
    ready: true,
  };
}

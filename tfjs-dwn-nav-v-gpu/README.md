# tfjs-dwn-nav-v-gpu

GPU-accelerated TensorFlow.js for Bun via Dawn/Vulkan.

**Architecture:** Bun (Zig) → FFI → Dawn (C++) → Vulkan/DirectX12/Metal → GPU

This runs **NATIVE** Vulkan/DirectX12/Metal (not browser WebGPU). No window manager required - pure headless compute for AI/ML workloads.

## Stack

| Abbrev | Component | Description |
|--------|-----------|-------------|
| **tfjs** | TensorFlow.js | ML library for Bun |
| **dwn** | Dawn | WebGPU implementation for Bun |
| **nav** | navigator.gpu | Polyfill for Bun |
| **v** | Vulkan | GPU backend (Linux) |
| **gpu** | GPU Acceleration | Hardware-accelerated ML |

## Platform Support

| OS | GPU Backend |
|----|-------------|
| Linux | Vulkan |
| Windows | DirectX 12 |
| macOS | Metal |

## Requirements

- Bun >= 1.3.3
- GPU with Vulkan/DX12/Metal support
- GPU drivers installed

## Installation

```bash
bun add tfjs-dwn-nav-v-gpu
```

## Usage

### Basic Usage with Resource Management

**IMPORTANT:** Always use `tf.tidy()` to prevent VRAM leaks in long-running processes.

```typescript
import * as tf from 'tfjs-dwn-nav-v-gpu';

// Use tf.tidy() for automatic tensor cleanup
const result = tf.tidy(() => {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  
  const input = tf.tensor2d([[1, 2, 3, 4]]);
  return model.predict(input);
});

// Data is now on CPU, tensor VRAM is freed
console.log(result.dataSync());
```

### Resource Lifecycle Management

This package bridges **managed code (JS/TS)** with **unmanaged code (C++/Dawn)** via FFI. The JavaScript GC is unaware of VRAM allocations, so explicit disposal is required for production workloads.

```typescript
import { disposeWebGPUBackend } from 'tfjs-dwn-nav-v-gpu';

// Manual cleanup (automatic on SIGINT/SIGTERM)
disposeWebGPUBackend();
```

**Graceful shutdown is automatic:**
- `SIGINT` (Ctrl+C) triggers cleanup
- `SIGTERM` triggers cleanup  
- Uncaught exceptions trigger cleanup

### Long-Running AI Agents Pattern

```typescript
import * as tf from 'tfjs-dwn-nav-v-gpu';

async function runInference(modelPath: string, input: number[][]) {
  // Load model once
  const model = await tf.loadLayersModel(modelPath);
  
  // Inference loop with proper cleanup
  while (true) {
    const result = tf.tidy(() => {
      const tensor = tf.tensor2d(input);
      return model.predict(tensor);
    });
    
    // Process result (now on CPU, VRAM freed)
    const output = result.dataSync();
    console.log('Prediction:', output);
    
    // Optional: explicit disposal after batch
    result.dispose();
    
    // Delay between inferences
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Model and tensors will be cleaned up on process exit
```

### Check GPU Info

```typescript
import { getGPUInfo, getBackendInfo } from 'tfjs-dwn-nav-v-gpu';

const gpuInfo = await getGPUInfo();
console.log('GPU:', gpuInfo?.device);

const backendInfo = getBackendInfo();
console.log('Backend:', backendInfo);
```

### Simple Model Example

```typescript
import * as tf from 'tfjs-dwn-nav-v-gpu';

// Create a simple model
const model = tf.sequential();
model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

// Train
const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

await model.fit(xs, ys, { epochs: 100 });

// Predict
model.predict(tf.tensor2d([5], [1, 1])).print();
```

## API

### Re-exports

All TensorFlow.js APIs are re-exported:

```typescript
import * as tf from 'tfjs-dwn-nav-v-gpu';

// All tf.* methods available
tf.tensor()
tf.sequential()
tf.loadLayersModel()
tf.loadGraphModel()
// ... etc
```

### Additional Exports

| Function | Description |
|----------|-------------|
| `isWebGPUAvailable()` | Check if WebGPU is initialized |
| `getGPUInfo()` | Get GPU adapter information |
| `getBackendInfo()` | Get current backend status |
| `disposeWebGPUBackend()` | **Manually free VRAM resources** |
| `getActiveDevice()` | Get the active GPUDevice instance |
| `getActiveAdapter()` | Get the active GPUAdapter instance |

## Resource Management Best Practices

### Why Explicit Cleanup Matters

This package uses FFI to bridge JavaScript with native Dawn (C++) GPU resources:

```
Bun (Zig) → FFI → Dawn (C++) → Vulkan/DX12/Metal → GPU VRAM
```

**Problem:** JavaScript's GC cannot track VRAM held by unmanaged C++ pointers.

**Solution:** Explicit disposal via `tf.tidy()` and `disposeWebGPUBackend()`.

### Memory Leak Prevention

```typescript
// ❌ BAD - Leaks VRAM in loops
for (let i = 0; i < 1000; i++) {
  const tensor = tf.tensor2d([[i]]);
  model.predict(tensor); // Tensor never freed!
}

// ✅ GOOD - Uses tf.tidy() for cleanup
for (let i = 0; i < 1000; i++) {
  tf.tidy(() => {
    const tensor = tf.tensor2d([[i]]);
    model.predict(tensor);
  }); // Tensor automatically freed
}
```

### Production Deployment Checklist

- ✅ Wrap all tensor operations in `tf.tidy()`
- ✅ Dispose models when no longer needed: `model.dispose()`
- ✅ Monitor VRAM usage during long-running processes
- ✅ Test graceful shutdown (Ctrl+C) to verify cleanup
- ✅ Handle errors with try/catch to ensure cleanup runs

## Platform-Specific Notes

### Linux (Vulkan)
- Requires Vulkan drivers: `sudo apt install vulkan-tools`
- Check support: `vulkaninfo`

### Windows (DirectX 12)
- Requires Windows 10+ with DX12 support
- GPU drivers must be up to date

### macOS (Metal)
- Requires macOS 10.13+ with Metal support
- Native support on Apple Silicon (M1/M2/M3)

## License

Apache-2.0

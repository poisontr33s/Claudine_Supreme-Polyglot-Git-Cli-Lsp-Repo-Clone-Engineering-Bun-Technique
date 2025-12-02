# tfjs-dwn-nav-v-gpu

GPU-accelerated TensorFlow.js for Bun via Dawn/Vulkan.

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

```typescript
import * as tf from 'tfjs-dwn-nav-v-gpu';

// GPU-accelerated ML ready to go
const model = await tf.loadLayersModel('https://example.com/model.json');
const result = model.predict(tf.tensor2d([[1, 2, 3, 4]]));

console.log(result.dataSync());
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

## License

Apache-2.0

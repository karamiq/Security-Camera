# Camera Stream Client Documentation

This document explains how to receive and display the live camera stream from the ESP32 on the client side using WebSocket.

## Overview

The NestJS backend streams MJPEG frames from the ESP32 camera via WebSocket. The client connects to the WebSocket server and receives binary frame data in real-time.

**Stream Details:**
- **Protocol:** WebSocket (ws/wss)
- **Default Server:** `ws://172.0.0.1:3000/camera`
- **Data Format:** Binary JPEG frames
- **Frame Rate:** ~10 FPS (configurable via `CAMERA_THROTTLE_MS` environment variable)

## Client Implementation

### Option 1: HTML/JavaScript (Vanilla)

Create an `index.html` file in your client directory:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ESP32 Camera Stream</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f0f0f0;
      margin: 0;
    }

    .container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 800px;
      width: 100%;
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 20px;
    }

    .stream-container {
      position: relative;
      width: 100%;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    img#cameraStream {
      width: 100%;
      height: auto;
      display: block;
    }

    .video-placeholder {
      width: 100%;
      height: 480px;
      background: #222;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 18px;
    }

    .status {
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
      text-align: center;
      font-weight: bold;
    }

    .status.connected {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status.disconnected {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .status.connecting {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
    }

    .controls {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
    }

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      background: #007bff;
      color: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: background 0.3s;
    }

    button:hover {
      background: #0056b3;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .info {
      margin-top: 20px;
      padding: 15px;
      background: #e7f3ff;
      border-left: 4px solid #007bff;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
    }

    .info h3 {
      margin-top: 0;
      color: #007bff;
    }

    .fps-counter {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #00ff00;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      z-index: 10;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎥 ESP32 Camera Stream</h1>
    
    <div id="status" class="status connecting">
      ⏳ Connecting to stream...
    </div>

    <div class="stream-container">
      <img id="cameraStream" style="display: none;" alt="Camera Stream" />
      <div id="videoPlaceholder" class="video-placeholder">
        ⏳ Waiting for stream...
      </div>
      <div id="fpsCounter" class="fps-counter" style="display: none;">
        FPS: <span id="fpsValue">0</span>
      </div>
    </div>

    <div class="controls">
      <button id="connectBtn" onclick="connectStream()">Connect</button>
      <button id="disconnectBtn" onclick="disconnectStream()" disabled>Disconnect</button>
      <button id="fullscreenBtn" onclick="toggleFullscreen()" disabled>Fullscreen</button>
    </div>

    <div class="info">
      <h3>Connection Info</h3>
      <p><strong>Status:</strong> <span id="statusText">Disconnected</span></p>
      <p><strong>Server:</strong> <span id="serverUrl">ws://localhost:3000/camera</span></p>
      <p><strong>Frames Received:</strong> <span id="frameCount">0</span></p>
      <p><strong>Connection Time:</strong> <span id="connectionTime">-</span></p>
    </div>
  </div>

  <script>
    let ws = null;
    let isConnected = false;
    let frameCount = 0;
    let lastFrameTime = Date.now();
    let fps = 0;
    let connectionStartTime = null;

    const statusDiv = document.getElementById('status');
    const statusText = document.getElementById('statusText');
    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const cameraImg = document.getElementById('cameraStream');
    const placeholder = document.getElementById('videoPlaceholder');
    const fpsCounter = document.getElementById('fpsCounter');
    const frameCountSpan = document.getElementById('frameCount');
    const connectionTimeSpan = document.getElementById('connectionTime');
    const serverUrlSpan = document.getElementById('serverUrl');

    function connectStream() {
      if (isConnected) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/camera`;
      serverUrlSpan.textContent = wsUrl;

      updateStatus('connecting', '⏳ Connecting to stream...');

      ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        isConnected = true;
        frameCount = 0;
        connectionStartTime = Date.now();
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        fullscreenBtn.disabled = false;
        placeholder.style.display = 'none';
        cameraImg.style.display = 'block';
        fpsCounter.style.display = 'block';
        updateStatus('connected', '✅ Connected to stream');
        console.log('Connected to WebSocket stream');
      };

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          const blob = new Blob([event.data], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          cameraImg.src = url;
          frameCount++;
          frameCountSpan.textContent = frameCount;

          // Calculate FPS
          const now = Date.now();
          const delta = now - lastFrameTime;
          if (delta > 1000) {
            fps = Math.round((frameCount * 1000) / delta);
            document.getElementById('fpsValue').textContent = fps;
            lastFrameTime = now;
            frameCount = 0;
          }

          // Update connection time
          if (connectionStartTime) {
            const elapsed = Math.floor((Date.now() - connectionStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            connectionTimeSpan.textContent = `${minutes}m ${seconds}s`;
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateStatus('disconnected', '❌ Connection error');
      };

      ws.onclose = () => {
        isConnected = false;
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        fullscreenBtn.disabled = true;
        placeholder.style.display = 'flex';
        cameraImg.style.display = 'none';
        fpsCounter.style.display = 'none';
        updateStatus('disconnected', '⏹️ Disconnected from stream');
        console.log('Disconnected from WebSocket stream');
      };
    }

    function disconnectStream() {
      if (ws) {
        ws.close();
        ws = null;
      }
    }

    function toggleFullscreen() {
      const container = document.querySelector('.stream-container');
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }

    function updateStatus(type, message) {
      statusDiv.className = `status ${type}`;
      statusDiv.textContent = message;
      statusText.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    }

    // Auto-connect on page load
    window.addEventListener('load', connectStream);

    // Cleanup on page unload
    window.addEventListener('beforeunload', disconnectStream);
  </script>
</body>
</html>
```

### Option 2: React Component

Create a `CameraStream.tsx` component:

```tsx
import React, { useEffect, useRef, useState } from 'react';

interface CameraStreamProps {
  wsUrl?: string;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/camera`,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [frameCount, setFrameCount] = useState(0);
  const [fps, setFps] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());

  const connectStream = () => {
    if (isConnected) return;

    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      wsRef.current = ws;
      setIsConnected(true);
      setStatus('Connected');
      frameCountRef.current = 0;
      console.log('Connected to WebSocket stream');
    };

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer && imgRef.current) {
        const blob = new Blob([event.data], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        imgRef.current.src = url;
        frameCountRef.current++;
        setFrameCount(frameCountRef.current);

        // Calculate FPS
        const now = Date.now();
        const delta = now - lastFrameTimeRef.current;
        if (delta > 1000) {
          const calculatedFps = Math.round((frameCountRef.current * 1000) / delta);
          setFps(calculatedFps);
          lastFrameTimeRef.current = now;
          frameCountRef.current = 0;
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('Connection Error');
    };

    ws.onclose = () => {
      wsRef.current = null;
      setIsConnected(false);
      setStatus('Disconnected');
      console.log('Disconnected from WebSocket stream');
    };
  };

  const disconnectStream = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  useEffect(() => {
    connectStream();
    return () => disconnectStream();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Camera Stream</h1>
      
      <div style={{
        background: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '20px',
        position: 'relative',
      }}>
        {!isConnected && (
          <div style={{
            width: '100%',
            height: '480px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}>
            Waiting for stream...
          </div>
        )}
        <img
          ref={imgRef}
          style={{
            width: '100%',
            height: 'auto',
            display: isConnected ? 'block' : 'none',
          }}
          alt="Camera Stream"
        />
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#00ff00',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}>
          FPS: {fps}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Frames Received:</strong> {frameCount}</p>
        <p><strong>Server:</strong> {wsUrl}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={connectStream}
          disabled={isConnected}
          style={{
            padding: '10px 20px',
            background: isConnected ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isConnected ? 'not-allowed' : 'pointer',
          }}
        >
          Connect
        </button>
        <button
          onClick={disconnectStream}
          disabled={!isConnected}
          style={{
            padding: '10px 20px',
            background: !isConnected ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !isConnected ? 'not-allowed' : 'pointer',
          }}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};
```

### Option 3: Vue Component

Create a `CameraStream.vue` component:

```vue
<template>
  <div class="camera-stream-container">
    <h1>🎥 Camera Stream</h1>
    
    <div :class="['status', statusClass]">
      {{ statusMessage }}
    </div>

    <div class="stream-container">
      <img
        v-show="isConnected"
        ref="cameraImg"
        alt="Camera Stream"
        class="stream-image"
      />
      <div v-show="!isConnected" class="video-placeholder">
        ⏳ Waiting for stream...
      </div>
      <div v-if="isConnected" class="fps-counter">
        FPS: {{ fps }}
      </div>
    </div>

    <div class="controls">
      <button @click="connectStream" :disabled="isConnected">
        Connect
      </button>
      <button @click="disconnectStream" :disabled="!isConnected">
        Disconnect
      </button>
    </div>

    <div class="info">
      <p><strong>Status:</strong> {{ status }}</p>
      <p><strong>Frames Received:</strong> {{ frameCount }}</p>
      <p><strong>FPS:</strong> {{ fps }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CameraStream',
  props: {
    wsUrl: {
      type: String,
      default: () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}/camera`;
      },
    },
  },
  data() {
    return {
      isConnected: false,
      status: 'Disconnected',
      frameCount: 0,
      fps: 0,
      ws: null as WebSocket | null,
      frameCountLocal: 0,
      lastFrameTime: Date.now(),
    };
  },
  computed: {
    statusMessage(): string {
      if (this.isConnected) return '✅ Connected to stream';
      return '⏹️ Disconnected from stream';
    },
    statusClass(): string {
      return this.isConnected ? 'connected' : 'disconnected';
    },
  },
  methods: {
    connectStream() {
      if (this.isConnected) return;

      this.ws = new WebSocket(this.wsUrl);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        this.isConnected = true;
        this.status = 'Connected';
        this.frameCount = 0;
        this.frameCountLocal = 0;
      };

      this.ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          const blob = new Blob([event.data], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          const img = this.$refs.cameraImg as HTMLImageElement;
          if (img) {
            img.src = url;
          }
          this.frameCountLocal++;
          this.frameCount++;

          const now = Date.now();
          const delta = now - this.lastFrameTime;
          if (delta > 1000) {
            this.fps = Math.round((this.frameCountLocal * 1000) / delta);
            this.lastFrameTime = now;
            this.frameCountLocal = 0;
          }
        }
      };

      this.ws.onerror = () => {
        this.status = 'Connection Error';
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.status = 'Disconnected';
      };
    },

    disconnectStream() {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    },
  },
  mounted() {
    this.connectStream();
  },
  beforeUnmount() {
    this.disconnectStream();
  },
});
</script>

<style scoped>
.camera-stream-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.status {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}

.status.connected {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status.disconnected {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.stream-container {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.stream-image {
  width: 100%;
  height: auto;
  display: block;
}

.video-placeholder {
  width: 100%;
  height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 18px;
}

.fps-counter {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #00ff00;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  z-index: 10;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.info {
  padding: 15px;
  background: #e7f3ff;
  border-left: 4px solid #007bff;
  border-radius: 4px;
  font-size: 14px;
}

.info p {
  margin: 5px 0;
}
</style>
```

## Key Implementation Details

### WebSocket Connection

```javascript
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}/camera`;
const ws = new WebSocket(wsUrl);
ws.binaryType = 'arraybuffer'; // Important: receive binary data
```

### Handling Binary Frames

```javascript
ws.onmessage = (event) => {
  if (event.data instanceof ArrayBuffer) {
    const blob = new Blob([event.data], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    imgElement.src = url;
  }
};
```

### Performance Optimization Tips

1. **Memory Management:** Always revoke old blob URLs to prevent memory leaks
   ```javascript
   const oldUrl = imgElement.src;
   imgElement.src = url;
   if (oldUrl) URL.revokeObjectURL(oldUrl);
   ```

2. **FPS Calculation:** Monitor frames per second to ensure performance
   ```javascript
   const now = Date.now();
   if (now - lastTime > 1000) {
     fps = frames * 1000 / (now - lastTime);
     frames = 0;
     lastTime = now;
   }
   ```

3. **Responsive Design:** Use CSS media queries for mobile devices

## Environment Configuration

Server-side configuration in `.env`:

```env
ESP32_MJPEG_URL=http://192.168.0.120:81/stream
CAMERA_THROTTLE_MS=300
PORT=3000
```

## Troubleshooting

### Connection Issues

- Ensure the server is running on the correct host/port
- Check browser console for WebSocket errors
- Verify CORS is enabled on the server

### No Stream

- Check if ESP32 camera is accessible at the configured URL
- Verify network connectivity to ESP32
- Check server logs for connection errors

### High Latency

- Increase `CAMERA_THROTTLE_MS` for lower frame rate
- Reduce image quality on ESP32 if possible
- Check network bandwidth

### Memory Leaks

- Always revoke blob URLs when done
- Limit the number of concurrent WebSocket connections
- Monitor browser memory usage over time

## Production Deployment

1. Use `wss://` (secure WebSocket) instead of `ws://`
2. Implement authentication/authorization
3. Add error handling and reconnection logic
4. Monitor server resources and connections
5. Consider implementing rate limiting

## Example: Full-stack Implementation

```html
<!-- Client -->
<img id="stream" />
<script>
  const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/camera`);
  ws.binaryType = 'arraybuffer';
  ws.onmessage = (e) => {
    document.getElementById('stream').src = URL.createObjectURL(new Blob([e.data], { type: 'image/jpeg' }));
  };
</script>
```

That's all you need for the most basic implementation!

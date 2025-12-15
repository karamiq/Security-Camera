import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { CameraGateway } from './camera.gateway';
import { Server } from 'ws';

@Injectable()
export class CameraService implements OnModuleInit {
  private readonly logger = new Logger(CameraService.name);
  private streaming = false;

  // ESP32 stream URL - adjust via env or hardcode for now
  private readonly espUrl = process.env.ESP32_MJPEG_URL || 'http://192.168.0.109:81/stream';

  // throttle in ms (max frames per second = 1000 / throttleMs)
  private readonly throttleMs = Number(process.env.CAMERA_THROTTLE_MS) || 300; // 10 FPS default

  constructor(private readonly gateway: CameraGateway) { }

  async onModuleInit() {
    // start stream in background
    this.startStream().catch((err) => this.logger.error('Stream failed to start', err?.message || err));
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }
  async startStream() {
    if (this.streaming) return;
    this.streaming = true;
    let attempt = 0;
    while (this.streaming) {
      try {
        attempt++;
        this.logger.log(`Connecting to ESP32 MJPEG stream: ${this.espUrl} (attempt ${attempt})`);
        const response: AxiosResponse = await axios.request({
          method: 'GET',
          url: this.espUrl,
          responseType: 'stream',
          timeout: 10000,
        });
        this.logger.log('Connected to ESP32 stream');

        await this.pipeStream(response);

        // If pipeStream returns, it means the stream ended; retry after short delay
        this.logger.warn('ESP32 stream ended; reconnecting in 2s');
        await this.sleep(2000);
      } catch (err) {
        this.logger.error('Error connecting/reading ESP32 stream', err?.message || err);
        await this.sleep(Math.min(5000 + attempt * 1000, 30000));
      }
    }
  }
  private async pipeStream(response: AxiosResponse) {
    const stream = response.data as NodeJS.ReadableStream;

    let bufferParts: Buffer[] = [];
    let lastSend = 0;

    const onData = (chunk: Buffer) => {
      bufferParts.push(chunk);
      const joined = Buffer.concat(bufferParts);

      const start = joined.indexOf(Buffer.from([0xff, 0xd8]));
      const end = joined.indexOf(Buffer.from([0xff, 0xd9]));

      if (start !== -1 && end !== -1 && end > start) {
        const frame = joined.slice(start, end + 2);

        const now = Date.now();
        if (now - lastSend >= this.throttleMs) {
          this.broadcast(frame);
          lastSend = now;
        }
        // keep remaining bytes (if any) after end
        if (end + 2 < joined.length) {
          bufferParts = [joined.slice(end + 2)];
        } else {
          bufferParts = [];
        }
      } else if (start !== -1) {
        // Found start marker but no end yet, keep from start onwards
        bufferParts = [joined.slice(start)];

        // Safety check: if buffer still too large, drop it
        if (bufferParts[0].length > 500 * 1024) {
          bufferParts = [];
          this.logger.debug('Reset buffer: partial frame too large');
        }
      } else {
        // No start marker found, check buffer size
        const totalLen = joined.length;
        if (totalLen > 100 * 1024) {
          // Drop buffer if no start marker and size exceeds 100KB
          bufferParts = [];
          this.logger.debug('Reset buffer: no frame markers found');
        }
      }
    };

    return new Promise<void>((resolve, reject) => {
      stream.on('data', onData);
      stream.on('end', () => {
        stream.removeListener('data', onData);
        resolve();
      });
      stream.on('error', (err) => {
        stream.removeListener('data', onData);
        reject(err);
      });
    });
  }

  private broadcast(frame: Buffer) {
    const wss: Server | undefined = this.gateway.getServer();
    if (!wss) return;

    wss.clients.forEach((client) => {
      // only send to open clients
      if ((client as any).readyState === 1) {
        try {
          client.send(frame);
        } catch (e) {
          // ignore per-client send errors
        }
      }
    });
  }
}

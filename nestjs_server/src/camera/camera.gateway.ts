import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, WebSocket } from 'ws';

@Injectable()
export class CameraGateway implements OnModuleInit, OnModuleDestroy {
  private wss: Server;

  onModuleInit() {
    // start a bare ws server on port 3001. clients connect directly to this port.
    this.wss = new Server({ port: 3001 });

    this.wss.on('connection', (socket: WebSocket) => {
      const addr = (socket as any)._socket?.remoteAddress || 'unknown';
      console.log(`Client connected: ${addr}`);

      socket.on('close', () => console.log(`Client disconnected: ${addr}`));
      socket.on('error', (err) => console.warn('WS client error', err && err.message));
    });
    console.log('WebSocket server started on port 3001');
  }
  getServer(): Server | undefined {
    return this.wss;
  }
  onModuleDestroy() {
    if (this.wss) {
      try {
        this.wss.close();
      } catch (e) {
        // ignore
      }
    }
  }
}

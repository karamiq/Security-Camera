import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `<html><img id="stream" /><script>const ws = new WebSocket(\`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}\${window.location.host}/camera\`);ws.binaryType = 'arraybuffer';ws.onmessage = (e) => {document.getElementById('stream').src = URL.createObjectURL(new Blob([e.data], { type: 'image/jpeg' }));}; </script></html>`;
  }
}
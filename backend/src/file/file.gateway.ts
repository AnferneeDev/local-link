import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

// @WebSocketGateway({ cors: true }) allows the browser to connect
@WebSocketGateway({ cors: true })
export class FileGateway {
  @WebSocketServer()
  server: Server;

  // This is the method we'll call when a file is uploaded
  notifyFileAdded(file: any) {
    // Shout to everyone: "New file added! Here is the data."
    this.server.emit('file-added', file);
  }

  // We'll call this when files are deleted
  notifyFilesCleared() {
    this.server.emit('files-cleared');
  }
}

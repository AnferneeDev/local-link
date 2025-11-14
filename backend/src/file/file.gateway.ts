import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SharedItem } from './file.service'; // <-- 1. IMPORT 'SharedItem'

@WebSocketGateway({ cors: true })
export class FileGateway {
  @WebSocketServer()
  server: Server;

  // --- 2. RENAMED and TYPED ---
  notifyItemAdded(item: SharedItem) {
    this.server.emit('item-added', item); // <-- Use new event name 'item-added'
  }

  // --- 3. RENAMED ---
  notifyItemsCleared() {
    this.server.emit('items-cleared'); // <-- Use new event name 'items-cleared'
  }
}

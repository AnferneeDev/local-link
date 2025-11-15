import { Server } from 'socket.io';
import { SharedItem } from './file.service';
export declare class FileGateway {
    server: Server;
    notifyItemAdded(item: SharedItem): void;
    notifyItemsCleared(): void;
}

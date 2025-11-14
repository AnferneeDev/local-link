import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { FileGateway } from './file.gateway'; // <-- Make sure this is imported

// --- 1. DEFINE AND EXPORT THE NEW TYPES ---
// This fixes the "'SharedItem' has no exported member" error
export interface SharedFile {
  id: string;
  type: 'file';
  filename: string;
  path: string;
}
export interface SharedText {
  id: string;
  type: 'text';
  content: string;
}
export type SharedItem = SharedFile | SharedText; // An item can be EITHER

@Injectable()
export class FileService implements OnApplicationShutdown {
  // --- 2. CHANGE 'files' TO 'items' ---
  private items: SharedItem[] = [];
  private readonly uploadsPath = join(__dirname, '..', '..', '..', 'uploads');

  // --- 3. INJECT THE GATEWAY ---
  constructor(private readonly fileGateway: FileGateway) {}

  // --- 4. UPDATE 'addFile' TO USE NEW TYPES/EVENTS ---
  addFile(file: Express.Multer.File): SharedFile {
    const newFile: SharedFile = {
      id: `${Date.now()}-${file.filename}`,
      type: 'file', // Set the type
      filename: file.filename,
      path: file.path,
    };

    this.items.push(newFile);
    this.fileGateway.notifyItemAdded(newFile); // Use the new event name
    console.log('File added to in-memory list:', newFile);
    return newFile;
  }

  // --- 5. ADD THE MISSING 'addText' METHOD ---
  // This fixes the "Property 'addText' does not exist" error
  addText(content: string): SharedText {
    const newText: SharedText = {
      id: `${Date.now()}-text`,
      type: 'text',
      content: content,
    };

    this.items.push(newText);
    this.fileGateway.notifyItemAdded(newText); // Also notify
    console.log('Text added to in-memory list:', newText);
    return newText;
  }

  getAllItems(): SharedItem[] {
    return this.items;
  }

  // --- 6. UPDATE SHUTDOWN LOGIC ---
  async onApplicationShutdown(_signal?: string) {
    console.log('Shutting down... Deleting all files from /uploads...');

    // Clear the in-memory list and notify clients
    this.items = [];
    this.fileGateway.notifyItemsCleared(); // Use new event name
    console.log('In-memory list cleared.');

    // Your file deletion logic (this part is fine)
    try {
      const files = await fs.readdir(this.uploadsPath);
      if (files.length === 0) {
        console.log('Uploads folder is already empty.');
        return;
      }
      const deletePromises = files.map((file) =>
        fs.unlink(join(this.uploadsPath, file)),
      );
      await Promise.all(deletePromises);
      console.log(`Successfully deleted ${files.length} files.`);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        if ((error as any).code === 'ENOENT') {
          console.log('Uploads folder not found, nothing to delete.');
        } else {
          console.error('Error deleting files:', error);
        }
      } else {
        console.error('An unknown error occurred during cleanup:', error);
      }
    }
  }
}

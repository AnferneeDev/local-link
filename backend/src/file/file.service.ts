import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { FileGateway } from './file.gateway'; // <-- 1. IMPORT GATEWAY

export interface SharedFile {
  id: string;
  filename: string;
  path: string;
}

@Injectable()
export class FileService implements OnApplicationShutdown {
  private files: SharedFile[] = [];
  private readonly uploadsPath = join(__dirname, '..', '..', '..', 'uploads');

  // --- 2. INJECT THE GATEWAY ---
  constructor(private readonly fileGateway: FileGateway) {}

  addFile(file: Express.Multer.File): SharedFile {
    const newFile: SharedFile = {
      id: `${Date.now()}-${file.filename}`,
      filename: file.filename,
      path: file.path,
    };

    this.files.push(newFile);

    // --- 3. NOTIFY EVERYONE (Browser & App) ---
    this.fileGateway.notifyFileAdded(newFile);

    console.log('File added to in-memory list:', newFile);
    return newFile;
  }

  getAllFiles(): SharedFile[] {
    return this.files;
  }

  async onApplicationShutdown(_signal?: string) {
    console.log('Shutting down... Deleting all files from /uploads...');

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

      // --- 4. TELL CLIENTS TO CLEAR LIST ---
      this.fileGateway.notifyFilesCleared();

      console.log(`Successfully deleted ${files.length} files.`);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        // explicit casting for TS safety if needed, or just access property if checked
        const code = (error as any).code;
        if (code === 'ENOENT') {
          console.log('Uploads folder not found, nothing to delete.');
        } else {
          console.error('Error deleting files:', error);
        }
      } else {
        console.error('Unknown error during cleanup:', error);
      }
    }
  }
}

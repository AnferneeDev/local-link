// --- 1. IMPORT THE NEW MODULES ---
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { promises as fs } from 'fs'; // We use 'fs.promises' for modern async/await
import { join } from 'path';

export interface SharedFile {
  id: string;
  filename: string;
  path: string;
}

// --- 2. IMPLEMENT THE 'OnApplicationShutdown' HOOK ---
@Injectable()
export class FileService implements OnApplicationShutdown {
  private files: SharedFile[] = [];

  // --- 3. DEFINE THE UPLOADS PATH (so we can find it later) ---
  private readonly uploadsPath = join(__dirname, '..', '..', '..', 'uploads');

  addFile(file: Express.Multer.File): SharedFile {
    const newFile: SharedFile = {
      id: `${Date.now()}-${file.filename}`,
      filename: file.filename,
      path: file.path,
    };

    this.files.push(newFile);
    console.log('File added to in-memory list:', newFile);
    return newFile;
  }

  getAllFiles(): SharedFile[] {
    return this.files;
  }

  // --- 4. THIS IS THE "CLEANUP CREW" METHOD ---
  // This code runs automatically when the app is told to shut down
  async onApplicationShutdown(_signal?: string) {
    console.log('Shutting down... Deleting all files from /uploads...');

    try {
      const files = await fs.readdir(this.uploadsPath);

      if (files.length === 0) {
        console.log('Uploads folder is already empty.');
        return;
      }

      // Create a list of delete promises
      const deletePromises = files.map((file) =>
        fs.unlink(join(this.uploadsPath, file)),
      );

      // Wait for all files to be deleted
      await Promise.all(deletePromises);

      console.log(`Successfully deleted ${files.length} files.`);
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        const systemError = error as NodeJS.ErrnoException;
        if (systemError.code === 'ENOENT') {
          console.log('Uploads folder not found, nothing to delete.');
        } else {
          console.error('Error deleting files:', systemError);
        }
      } else {
        console.error('Unknown error during cleanup:', error);
      }
    }
  }
}

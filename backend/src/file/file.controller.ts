import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { FileService } from './file.service'; // --- ADDED: 1. Import the service ---

@Controller()
export class FileController {
  // --- ADDED: 2. Inject the service in the constructor ---
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', '..', 'uploads'),

        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // --- MODIFIED: 3. Use the service to add the file ---
    const savedFile = this.fileService.addFile(file);
    // --- END MODIFIED ---

    console.log('File saved to disk and in-memory:', savedFile);

    // --- MODIFIED: 4. Return the new file object ---
    return {
      message: 'File uploaded successfully',
      file: savedFile, // Send back the object with the ID
    };
    // --- END MODIFIED ---
  }
}

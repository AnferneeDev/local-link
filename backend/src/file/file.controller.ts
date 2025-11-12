import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path'; // <-- 1. IMPORT 'join'

@Controller()
export class FileController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        // --- 2. THIS IS THE FIX ---
        // We'll build a path from the current file (__dirname)
        // __dirname is in 'backend/dist/file'
        // We go up 3 levels to the root 'local-link' folder
        // Then we tell it to save in an 'uploads' folder there.
        destination: join(__dirname, '..', '..', '..', 'uploads'),

        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('File saved to disk:', file);

    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      path: file.path,
    };
  }
}

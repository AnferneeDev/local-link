import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get, // <-- ADDED
  Param, // <-- ADDED
  Res, // <-- ADDED
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { FileService } from './file.service';
import type { Response } from 'express'; // <-- ADDED

@Controller()
export class FileController {
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
    const savedFile = this.fileService.addFile(file);
    return {
      message: 'File uploaded successfully',
      file: savedFile,
    };
  }

  // --- NEW DOWNLOAD ENDPOINT ---
  @Get('download/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    // Build the correct path to the uploads folder
    const filePath = join(__dirname, '..', '..', '..', 'uploads', filename);

    // This Express method forces the browser to show the "Save As" dialog
    return res.download(filePath);
  }
}

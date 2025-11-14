import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles, // <-- 1. IMPORT PLURAL
  Get,
  Param,
  Res,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor, // <-- 2. IMPORT PLURAL
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { FileService, SharedItem } from './file.service';
import type { Response } from 'express';

class CreateTextDto {
  text: string;
}

@Controller()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('items')
  getAllItems() {
    return this.fileService.getAllItems();
  }

  @Post('text')
  addText(@Body(new ValidationPipe()) body: CreateTextDto) {
    const savedText = this.fileService.addText(body.text);
    return { message: 'Text added successfully', item: savedText };
  }

  // --- 3. THIS IS THE UPDATED UPLOAD ENDPOINT ---
  @Post('upload')
  @UseInterceptors(
    // Change to 'FilesInterceptor' to accept an array
    FilesInterceptor('files', 100, {
      // 'files' (plural)
      storage: diskStorage({
        destination: join(__dirname, '..', '..', '..', 'uploads'),
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  // Change to 'UploadedFiles' and the type to an array
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const savedFiles: SharedItem[] = [];
    // Loop over all files and add them one by one
    for (const file of files) {
      const savedFile = this.fileService.addFile(file);
      savedFiles.push(savedFile);
    }
    return {
      message: `${files.length} files uploaded successfully`,
      items: savedFiles,
    };
  }
  // --- END OF UPDATE ---

  @Get('download/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'uploads', filename);
    return res.download(filePath);
  }
}

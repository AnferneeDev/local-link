import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { FileService, SharedItem } from './file.service'; // <-- Now this import works
import type { Response } from 'express';

// DTO (Data Transfer Object) for validating text input
class CreateTextDto {
  text: string;
}

@Controller()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('text')
  // --- 1. FIX: REMOVED 'async' ---
  // This fixes the "'await' expression" error
  addText(@Body(new ValidationPipe()) body: CreateTextDto) {
    const savedText = this.fileService.addText(body.text);
    return {
      message: 'Text added successfully',
      item: savedText,
    };
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      // 'file' (singular)
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
      item: savedFile, // Renamed 'file' to 'item'
    };
  }

  @Get('download/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'uploads', filename);
    return res.download(filePath);
  }
}

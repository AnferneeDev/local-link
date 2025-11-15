import { FileService, SharedItem } from './file.service';
import type { Response } from 'express';
declare class CreateTextDto {
    text: string;
}
export declare class FileController {
    private readonly fileService;
    constructor(fileService: FileService);
    getAllItems(): SharedItem[];
    addText(body: CreateTextDto): {
        message: string;
        item: import("./file.service").SharedText;
    };
    uploadFiles(files: Express.Multer.File[]): {
        message: string;
        items: SharedItem[];
    };
    downloadFile(filename: string, res: Response): void;
}
export {};

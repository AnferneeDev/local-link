import { OnApplicationShutdown } from '@nestjs/common';
import { FileGateway } from './file.gateway';
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
export type SharedItem = SharedFile | SharedText;
export declare class FileService implements OnApplicationShutdown {
    private readonly fileGateway;
    private items;
    private readonly uploadsPath;
    constructor(fileGateway: FileGateway);
    addFile(file: Express.Multer.File): SharedFile;
    addText(content: string): SharedText;
    getAllItems(): SharedItem[];
    onApplicationShutdown(_signal?: string): Promise<void>;
}

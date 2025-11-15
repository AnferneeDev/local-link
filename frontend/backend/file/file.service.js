"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const file_gateway_1 = require("./file.gateway");
let FileService = class FileService {
    fileGateway;
    items = [];
    uploadsPath = (0, path_1.join)(__dirname, '..', '..', '..', 'uploads');
    constructor(fileGateway) {
        this.fileGateway = fileGateway;
    }
    addFile(file) {
        const newFile = {
            id: `${Date.now()}-${file.filename}`,
            type: 'file',
            filename: file.filename,
            path: file.path,
        };
        this.items.push(newFile);
        this.fileGateway.notifyItemAdded(newFile);
        console.log('File added to in-memory list:', newFile);
        return newFile;
    }
    addText(content) {
        const newText = {
            id: `${Date.now()}-text`,
            type: 'text',
            content: content,
        };
        this.items.push(newText);
        this.fileGateway.notifyItemAdded(newText);
        console.log('Text added to in-memory list:', newText);
        return newText;
    }
    getAllItems() {
        return this.items;
    }
    async onApplicationShutdown(_signal) {
        console.log('Shutting down... Deleting all files from /uploads...');
        this.items = [];
        this.fileGateway.notifyItemsCleared();
        console.log('In-memory list cleared.');
        try {
            const files = await fs_1.promises.readdir(this.uploadsPath);
            if (files.length === 0) {
                console.log('Uploads folder is already empty.');
                return;
            }
            const deletePromises = files.map((file) => fs_1.promises.unlink((0, path_1.join)(this.uploadsPath, file)));
            await Promise.all(deletePromises);
            console.log(`Successfully deleted ${files.length} files.`);
        }
        catch (error) {
            if (typeof error === 'object' && error !== null && 'code' in error) {
                if (error.code === 'ENOENT') {
                    console.log('Uploads folder not found, nothing to delete.');
                }
                else {
                    console.error('Error deleting files:', error);
                }
            }
            else {
                console.error('An unknown error occurred during cleanup:', error);
            }
        }
    }
};
exports.FileService = FileService;
exports.FileService = FileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [file_gateway_1.FileGateway])
], FileService);
//# sourceMappingURL=file.service.js.map
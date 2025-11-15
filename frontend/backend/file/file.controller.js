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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const file_service_1 = require("./file.service");
class CreateTextDto {
    text;
}
let FileController = class FileController {
    fileService;
    constructor(fileService) {
        this.fileService = fileService;
    }
    getAllItems() {
        return this.fileService.getAllItems();
    }
    addText(body) {
        const savedText = this.fileService.addText(body.text);
        return { message: 'Text added successfully', item: savedText };
    }
    uploadFiles(files) {
        const savedFiles = [];
        for (const file of files) {
            const savedFile = this.fileService.addFile(file);
            savedFiles.push(savedFile);
        }
        return {
            message: `${files.length} files uploaded successfully`,
            items: savedFiles,
        };
    }
    downloadFile(filename, res) {
        const filePath = (0, path_1.join)(__dirname, '..', '..', '..', 'uploads', filename);
        return res.download(filePath);
    }
};
exports.FileController = FileController;
__decorate([
    (0, common_1.Get)('items'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FileController.prototype, "getAllItems", null);
__decorate([
    (0, common_1.Post)('text'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTextDto]),
    __metadata("design:returntype", void 0)
], FileController.prototype, "addText", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 100, {
        storage: (0, multer_1.diskStorage)({
            destination: (0, path_1.join)(__dirname, '..', '..', '..', 'uploads'),
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], FileController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Get)('download/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FileController.prototype, "downloadFile", null);
exports.FileController = FileController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [file_service_1.FileService])
], FileController);
//# sourceMappingURL=file.controller.js.map